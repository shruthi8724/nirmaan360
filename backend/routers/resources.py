from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import crud, schemas
from database import get_db

router = APIRouter(prefix="/api/resources", tags=["Resources"])

@router.get("", response_model=List[schemas.ResourceResponse])
def read_resources(
    type_filter: Optional[str] = Query(None, alias="type"),
    availability: Optional[str] = Query(None),
    project_id: Optional[int] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    resources = crud.get_resources(db, type_filter=type_filter, availability=availability, project_id=project_id, search=search)
    return [schemas.ResourceResponse.model_validate(r) for r in resources]

@router.post("", response_model=schemas.ResourceResponse, status_code=201)
def create_resource(res_in: schemas.ResourceCreate, db: Session = Depends(get_db)):
    res = crud.create_resource(db, res_in)
    return schemas.ResourceResponse.model_validate(res)

@router.put("/{resource_id}", response_model=schemas.ResourceResponse)
def update_resource(resource_id: int, res_in: schemas.ResourceUpdate, db: Session = Depends(get_db)):
    res = crud.update_resource(db, resource_id, res_in)
    if not res:
        raise HTTPException(status_code=404, detail="Resource not found")
    return schemas.ResourceResponse.model_validate(res)

@router.delete("/{resource_id}", status_code=204)
def delete_resource(resource_id: int, db: Session = Depends(get_db)):
    success = crud.delete_resource(db, resource_id)
    if not success:
        raise HTTPException(status_code=404, detail="Resource not found")
    return None
