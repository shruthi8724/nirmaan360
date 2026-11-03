from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
import crud, models, schemas
from database import get_db

router = APIRouter(prefix="/api/risk-intelligence", tags=["Risk Intelligence"])

@router.get("/overview")
def get_risk_overview(db: Session = Depends(get_db)):
    projects = crud.get_projects(db)
    assessments = []

    for p in projects:
        latest = crud.get_latest_risk_assessment(db, p.id)
        if not latest:
            latest = crud.recalculate_and_save_project_risk(db, p)

        assessments.append({
            "project_id": p.id,
            "project_name": p.name,
            "client_name": p.client_name,
            "manager": p.manager,
            "status": p.status,
            "risk_score": latest.risk_score,
            "risk_level": latest.risk_level,
            "schedule_risk_points": latest.schedule_risk_points,
            "budget_risk_points": latest.budget_risk_points,
            "material_risk_points": latest.material_risk_points,
            "resource_risk_points": latest.resource_risk_points,
            "reasons": latest.reasons,
            "root_cause_analysis": latest.root_cause_analysis,
            "assessed_at": latest.assessed_at.isoformat() if latest.assessed_at else None
        })

    # Sort descending by risk score
    assessments.sort(key=lambda x: x["risk_score"], reverse=True)
    return assessments

@router.post("/reevaluate/{project_id}")
def reevaluate_risk(project_id: int, db: Session = Depends(get_db)):
    project = crud.get_project(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    assessment = crud.recalculate_and_save_project_risk(db, project)
    return {
        "project_id": project.id,
        "project_name": project.name,
        "assessment": schemas.RiskAssessmentResponse.model_validate(assessment)
    }
