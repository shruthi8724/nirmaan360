from sqlalchemy.orm import Session
from sqlalchemy import func, or_, desc
from typing import List, Optional, Dict, Any
import models
import schemas
from risk_engine import evaluate_project_risk, calculate_material_delay_days
import datetime

# --- Risk Evaluation Helper ---
def recalculate_and_save_project_risk(db: Session, project: models.Project) -> models.RiskAssessment:
    """Calculates risk score for project, updates/creates RiskAssessment record, and raises Alerts if needed."""
    materials = db.query(models.Material).filter(models.Material.project_id == project.id).all()
    resources = db.query(models.Resource).filter(models.Resource.project_id == project.id).all()

    risk_data = evaluate_project_risk(project, materials, resources)

    assessment = models.RiskAssessment(
        project_id=project.id,
        risk_score=risk_data["risk_score"],
        risk_level=risk_data["risk_level"],
        schedule_risk_points=risk_data["schedule_risk_points"],
        budget_risk_points=risk_data["budget_risk_points"],
        material_risk_points=risk_data["material_risk_points"],
        resource_risk_points=risk_data["resource_risk_points"],
        reasons=risk_data["reasons"],
        root_cause_analysis=risk_data["root_cause_analysis"],
        assessed_at=datetime.datetime.utcnow()
    )
    db.add(assessment)

    # Check for alerts to generate
    # 1. Budget Overrun Alert
    budget_pct = (project.current_cost / project.budget * 100) if project.budget > 0 else 0
    if budget_pct >= 90.0:
        create_alert_if_not_exists(
            db,
            project_id=project.id,
            title=f"Budget Overrun Warning: {project.name}",
            message=f"Project has consumed {budget_pct:.1f}% of its allocated budget of ₹{project.budget:,.0f}.",
            category="Budget Overrun",
            severity="Critical" if budget_pct >= 100.0 else "High"
        )

    # 2. Schedule Delay Alert
    deviation = (project.planned_progress or 0) - (project.actual_progress or 0)
    if deviation >= 15.0:
        create_alert_if_not_exists(
            db,
            project_id=project.id,
            title=f"Schedule Delay Alert: {project.name}",
            message=f"Project actual progress ({project.actual_progress:.1f}%) is lagging behind planned target ({project.planned_progress:.1f}%).",
            category="Project Delay",
            severity="High"
        )

    db.commit()
    db.refresh(assessment)
    return assessment

def create_alert_if_not_exists(db: Session, project_id: int, title: str, message: str, category: str, severity: str):
    existing = db.query(models.Alert).filter(
        models.Alert.project_id == project_id,
        models.Alert.category == category,
        models.Alert.is_read == False
    ).first()
    if not existing:
        alert = models.Alert(
            project_id=project_id,
            title=title,
            message=message,
            category=category,
            severity=severity
        )
        db.add(alert)

# --- Projects CRUD ---
def create_project(db: Session, project_in: schemas.ProjectCreate) -> models.Project:
    project = models.Project(**project_in.model_dump())
    db.add(project)
    db.commit()
    db.refresh(project)

    # Seed initial progress history and cost history entry
    p_hist = models.ProgressHistory(
        project_id=project.id,
        recorded_date=datetime.date.today().isoformat(),
        planned_progress=project.planned_progress,
        actual_progress=project.actual_progress,
        notes="Initial project creation"
    )
    c_hist = models.CostHistory(
        project_id=project.id,
        recorded_date=datetime.date.today().isoformat(),
        budget=project.budget,
        actual_cost=project.current_cost,
        notes="Initial cost record"
    )
    db.add(p_hist)
    db.add(c_hist)
    db.commit()

    recalculate_and_save_project_risk(db, project)
    return project

def get_project(db: Session, project_id: int) -> Optional[models.Project]:
    return db.query(models.Project).filter(models.Project.id == project_id).first()

def get_projects(
    db: Session,
    search: Optional[str] = None,
    status: Optional[str] = None,
    manager: Optional[str] = None,
    risk_level: Optional[str] = None
) -> List[models.Project]:
    query = db.query(models.Project)

    if search:
        query = query.filter(
            or_(
                models.Project.name.ilike(f"%{search}%"),
                models.Project.client_name.ilike(f"%{search}%"),
                models.Project.location.ilike(f"%{search}%")
            )
        )

    if status and status != "All":
        query = query.filter(models.Project.status == status)

    if manager and manager != "All":
        query = query.filter(models.Project.manager == manager)

    projects = query.order_by(models.Project.id.desc()).all()

    # Filter by risk level if requested
    if risk_level and risk_level != "All":
        filtered = []
        for p in projects:
            latest_risk = get_latest_risk_assessment(db, p.id)
            if latest_risk and latest_risk.risk_level.lower() == risk_level.lower():
                filtered.append(p)
        return filtered

    return projects

def update_project(db: Session, project_id: int, project_in: schemas.ProjectUpdate) -> Optional[models.Project]:
    project = get_project(db, project_id)
    if not project:
        return None

    update_data = project_in.model_dump(exclude_unset=True)

    progress_changed = "planned_progress" in update_data or "actual_progress" in update_data
    cost_changed = "current_cost" in update_data or "budget" in update_data

    for key, value in update_data.items():
        setattr(project, key, value)

    db.commit()

    if progress_changed:
        p_hist = models.ProgressHistory(
            project_id=project.id,
            recorded_date=datetime.date.today().isoformat(),
            planned_progress=project.planned_progress,
            actual_progress=project.actual_progress,
            notes="Updated progress record"
        )
        db.add(p_hist)

    if cost_changed:
        c_hist = models.CostHistory(
            project_id=project.id,
            recorded_date=datetime.date.today().isoformat(),
            budget=project.budget,
            actual_cost=project.current_cost,
            notes="Updated cost record"
        )
        db.add(c_hist)

    db.commit()
    db.refresh(project)
    recalculate_and_save_project_risk(db, project)
    return project

def delete_project(db: Session, project_id: int) -> bool:
    project = get_project(db, project_id)
    if not project:
        return False
    db.delete(project)
    db.commit()
    return True

# --- Materials CRUD ---
def create_material(db: Session, mat_in: schemas.MaterialCreate) -> models.Material:
    mat = models.Material(**mat_in.model_dump())
    db.add(mat)
    db.commit()
    db.refresh(mat)

    # Check for material delay alert
    delay = calculate_material_delay_days(mat.expected_delivery_date, mat.actual_delivery_date)
    if delay > 5 or mat.status == "Delayed":
        create_alert_if_not_exists(
            db,
            project_id=mat.project_id,
            title=f"Material Shortage/Delay: {mat.name}",
            message=f"Material delivery from {mat.supplier} is delayed by {delay} days.",
            category="Material Shortage",
            severity="High" if delay > 7 else "Medium"
        )

    # Recalculate project risk
    project = get_project(db, mat.project_id)
    if project:
        recalculate_and_save_project_risk(db, project)

    return mat

def get_materials(
    db: Session,
    project_id: Optional[int] = None,
    supplier: Optional[str] = None,
    category: Optional[str] = None,
    search: Optional[str] = None
) -> List[models.Material]:
    query = db.query(models.Material)

    if project_id:
        query = query.filter(models.Material.project_id == project_id)
    if supplier and supplier != "All":
        query = query.filter(models.Material.supplier == supplier)
    if category and category != "All":
        query = query.filter(models.Material.category == category)
    if search:
        query = query.filter(
            or_(
                models.Material.name.ilike(f"%{search}%"),
                models.Material.supplier.ilike(f"%{search}%")
            )
        )

    return query.order_by(models.Material.id.desc()).all()

def update_material(db: Session, material_id: int, mat_in: schemas.MaterialUpdate) -> Optional[models.Material]:
    mat = db.query(models.Material).filter(models.Material.id == material_id).first()
    if not mat:
        return None

    for key, val in mat_in.model_dump(exclude_unset=True).items():
        setattr(mat, key, val)

    db.commit()
    db.refresh(mat)

    project = get_project(db, mat.project_id)
    if project:
        recalculate_and_save_project_risk(db, project)

    return mat

def delete_material(db: Session, material_id: int) -> bool:
    mat = db.query(models.Material).filter(models.Material.id == material_id).first()
    if not mat:
        return False
    pid = mat.project_id
    db.delete(mat)
    db.commit()

    project = get_project(db, pid)
    if project:
        recalculate_and_save_project_risk(db, project)

    return True

# --- Resources CRUD ---
def create_resource(db: Session, res_in: schemas.ResourceCreate) -> models.Resource:
    res = models.Resource(**res_in.model_dump())
    db.add(res)
    db.commit()
    db.refresh(res)

    if res.status == "Maintenance" or res.availability == "Maintenance":
        create_alert_if_not_exists(
            db,
            project_id=res.project_id,
            title=f"Equipment Downtime: {res.name}",
            message=f"Resource {res.name} ({res.type}) is currently marked under maintenance.",
            category="Equipment Downtime",
            severity="High"
        )
    elif res.utilization > 100.0:
        create_alert_if_not_exists(
            db,
            project_id=res.project_id,
            title=f"Resource Overutilized: {res.name}",
            message=f"Resource {res.name} is operating at {res.utilization}% utilization.",
            category="Resource Shortage",
            severity="Medium"
        )

    if res.project_id:
        project = get_project(db, res.project_id)
        if project:
            recalculate_and_save_project_risk(db, project)

    return res

def get_resources(
    db: Session,
    type_filter: Optional[str] = None,
    availability: Optional[str] = None,
    project_id: Optional[int] = None,
    search: Optional[str] = None
) -> List[models.Resource]:
    query = db.query(models.Resource)

    if type_filter and type_filter != "All":
        query = query.filter(models.Resource.type == type_filter)
    if availability and availability != "All":
        query = query.filter(models.Resource.availability == availability)
    if project_id:
        query = query.filter(models.Resource.project_id == project_id)
    if search:
        query = query.filter(models.Resource.name.ilike(f"%{search}%"))

    return query.order_by(models.Resource.id.desc()).all()

def update_resource(db: Session, resource_id: int, res_in: schemas.ResourceUpdate) -> Optional[models.Resource]:
    res = db.query(models.Resource).filter(models.Resource.id == resource_id).first()
    if not res:
        return None

    for key, val in res_in.model_dump(exclude_unset=True).items():
        setattr(res, key, val)

    db.commit()
    db.refresh(res)

    if res.project_id:
        project = get_project(db, res.project_id)
        if project:
            recalculate_and_save_project_risk(db, project)

    return res

def delete_resource(db: Session, resource_id: int) -> bool:
    res = db.query(models.Resource).filter(models.Resource.id == resource_id).first()
    if not res:
        return False
    pid = res.project_id
    db.delete(res)
    db.commit()

    if pid:
        project = get_project(db, pid)
        if project:
            recalculate_and_save_project_risk(db, project)

    return True

# --- Risk Assessments & Alerts ---
def get_latest_risk_assessment(db: Session, project_id: int) -> Optional[models.RiskAssessment]:
    return db.query(models.RiskAssessment)\
        .filter(models.RiskAssessment.project_id == project_id)\
        .order_by(models.RiskAssessment.id.desc())\
        .first()

def get_alerts(db: Session, unread_only: bool = False) -> List[models.Alert]:
    query = db.query(models.Alert)
    if unread_only:
        query = query.filter(models.Alert.is_read == False)
    return query.order_by(models.Alert.id.desc()).all()

def mark_alert_as_read(db: Session, alert_id: int) -> Optional[models.Alert]:
    alert = db.query(models.Alert).filter(models.Alert.id == alert_id).first()
    if alert:
        alert.is_read = True
        db.commit()
        db.refresh(alert)
    return alert
