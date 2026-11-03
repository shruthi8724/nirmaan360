from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import crud, models, schemas
from database import get_db
from risk_engine import calculate_material_delay_days

router = APIRouter(prefix="/api/projects", tags=["Projects"])

@router.get("", response_model=List[schemas.ProjectResponse])
def read_projects(
    search: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    manager: Optional[str] = Query(None),
    risk_level: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    projects = crud.get_projects(db, search=search, status=status, manager=manager, risk_level=risk_level)
    response_list = []
    for p in projects:
        latest = crud.get_latest_risk_assessment(db, p.id)
        budget_util = (p.current_cost / p.budget * 100) if p.budget > 0 else 0.0

        # Calculate max delay days across materials
        materials = db.query(models.Material).filter(models.Material.project_id == p.id).all()
        max_delay = 0
        for m in materials:
            d = calculate_material_delay_days(m.expected_delivery_date, m.actual_delivery_date)
            if d > max_delay:
                max_delay = d

        resp = schemas.ProjectResponse.model_validate(p)
        resp.risk_score = latest.risk_score if latest else 0.0
        resp.risk_level = latest.risk_level if latest else "Low"
        resp.budget_utilization_pct = round(budget_util, 1)
        resp.delay_days = max_delay
        resp.latest_assessment = latest
        response_list.append(resp)
    return response_list

@router.post("", response_model=schemas.ProjectResponse, status_code=201)
def create_new_project(project_in: schemas.ProjectCreate, db: Session = Depends(get_db)):
    project = crud.create_project(db, project_in)
    latest = crud.get_latest_risk_assessment(db, project.id)
    resp = schemas.ProjectResponse.model_validate(project)
    resp.risk_score = latest.risk_score if latest else 0.0
    resp.risk_level = latest.risk_level if latest else "Low"
    resp.budget_utilization_pct = round((project.current_cost / project.budget * 100) if project.budget > 0 else 0, 1)
    resp.latest_assessment = latest
    return resp

@router.get("/{project_id}", response_model=schemas.ProjectDetailResponse)
def read_project_detail(project_id: int, db: Session = Depends(get_db)):
    project = crud.get_project(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    materials = db.query(models.Material).filter(models.Material.project_id == project_id).all()
    resources = db.query(models.Resource).filter(models.Resource.project_id == project_id).all()
    p_history = db.query(models.ProgressHistory).filter(models.ProgressHistory.project_id == project_id).all()
    c_history = db.query(models.CostHistory).filter(models.CostHistory.project_id == project_id).all()
    alerts = db.query(models.Alert).filter(models.Alert.project_id == project_id).all()

    latest = crud.get_latest_risk_assessment(db, project_id)
    budget_util = (project.current_cost / project.budget * 100) if project.budget > 0 else 0.0

    max_delay = 0
    mat_responses = []
    for m in materials:
        delay = calculate_material_delay_days(m.expected_delivery_date, m.actual_delivery_date)
        if delay > max_delay:
            max_delay = delay
        pending = max(0.0, m.required_quantity - m.delivered_quantity)
        completion_pct = (m.delivered_quantity / m.required_quantity * 100) if m.required_quantity > 0 else 0.0
        mat_risk = "Critical" if delay > 10 else ("High" if delay > 5 else ("Medium" if delay > 2 else "Low"))

        m_resp = schemas.MaterialResponse.model_validate(m)
        m_resp.pending_quantity = pending
        m_resp.delivery_completion_pct = round(completion_pct, 1)
        m_resp.material_delay_days = delay
        m_resp.material_risk = mat_risk
        mat_responses.append(m_resp)

    resp = schemas.ProjectDetailResponse.model_validate(project)
    resp.materials = mat_responses
    resp.resources = [schemas.ResourceResponse.model_validate(r) for r in resources]
    resp.progress_history = [schemas.ProgressHistoryResponse.model_validate(ph) for ph in p_history]
    resp.cost_history = [schemas.CostHistoryResponse.model_validate(ch) for ch in c_history]
    resp.alerts = [schemas.AlertResponse.model_validate(a) for a in alerts]

    resp.risk_score = latest.risk_score if latest else 0.0
    resp.risk_level = latest.risk_level if latest else "Low"
    resp.budget_utilization_pct = round(budget_util, 1)
    resp.delay_days = max_delay
    resp.latest_assessment = latest
    return resp

@router.put("/{project_id}", response_model=schemas.ProjectResponse)
def update_existing_project(project_id: int, project_in: schemas.ProjectUpdate, db: Session = Depends(get_db)):
    project = crud.update_project(db, project_id, project_in)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    latest = crud.get_latest_risk_assessment(db, project_id)
    resp = schemas.ProjectResponse.model_validate(project)
    resp.risk_score = latest.risk_score if latest else 0.0
    resp.risk_level = latest.risk_level if latest else "Low"
    resp.budget_utilization_pct = round((project.current_cost / project.budget * 100) if project.budget > 0 else 0, 1)
    resp.latest_assessment = latest
    return resp

@router.delete("/{project_id}", status_code=204)
def delete_existing_project(project_id: int, db: Session = Depends(get_db)):
    success = crud.delete_project(db, project_id)
    if not success:
        raise HTTPException(status_code=404, detail="Project not found")
    return None
