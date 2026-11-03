from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import crud, schemas
from database import get_db
from risk_engine import calculate_material_delay_days

router = APIRouter(prefix="/api/materials", tags=["Materials"])

def map_material_response(m) -> schemas.MaterialResponse:
    delay = calculate_material_delay_days(m.expected_delivery_date, m.actual_delivery_date)
    pending = max(0.0, m.required_quantity - m.delivered_quantity)
    completion_pct = (m.delivered_quantity / m.required_quantity * 100) if m.required_quantity > 0 else 0.0
    mat_risk = "Critical" if delay > 10 else ("High" if delay > 5 else ("Medium" if delay > 2 else "Low"))

    resp = schemas.MaterialResponse.model_validate(m)
    resp.pending_quantity = pending
    resp.delivery_completion_pct = round(completion_pct, 1)
    resp.material_delay_days = delay
    resp.material_risk = mat_risk
    return resp

@router.get("", response_model=List[schemas.MaterialResponse])
def read_materials(
    project_id: Optional[int] = Query(None),
    supplier: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    materials = crud.get_materials(db, project_id=project_id, supplier=supplier, category=category, search=search)
    return [map_material_response(m) for m in materials]

@router.post("", response_model=schemas.MaterialResponse, status_code=201)
def create_material(mat_in: schemas.MaterialCreate, db: Session = Depends(get_db)):
    mat = crud.create_material(db, mat_in)
    return map_material_response(mat)

@router.put("/{material_id}", response_model=schemas.MaterialResponse)
def update_material(material_id: int, mat_in: schemas.MaterialUpdate, db: Session = Depends(get_db)):
    mat = crud.update_material(db, material_id, mat_in)
    if not mat:
        raise HTTPException(status_code=404, detail="Material not found")
    return map_material_response(mat)

@router.delete("/{material_id}", status_code=204)
def delete_material(material_id: int, db: Session = Depends(get_db)):
    success = crud.delete_material(db, material_id)
    if not success:
        raise HTTPException(status_code=404, detail="Material not found")
    return None
