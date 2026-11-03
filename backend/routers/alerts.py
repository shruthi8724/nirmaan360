from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import crud, schemas
from database import get_db

router = APIRouter(prefix="/api/alerts", tags=["Alerts"])

@router.get("", response_model=List[schemas.AlertResponse])
def read_alerts(unread_only: bool = Query(False), db: Session = Depends(get_db)):
    alerts = crud.get_alerts(db, unread_only=unread_only)
    return [schemas.AlertResponse.model_validate(a) for a in alerts]

@router.put("/{alert_id}/read", response_model=schemas.AlertResponse)
def mark_alert_read(alert_id: int, db: Session = Depends(get_db)):
    alert = crud.mark_alert_as_read(db, alert_id)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    return schemas.AlertResponse.model_validate(alert)
