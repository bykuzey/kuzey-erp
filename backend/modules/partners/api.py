from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.db import get_db
from modules.partners import models, schemas

router = APIRouter(tags=["partners"])


@router.get("/", response_model=List[schemas.PartnerOut])
def list_partners(db: Session = Depends(get_db)):
    return db.query(models.Partner).order_by(models.Partner.id.desc()).all()


@router.post("/", response_model=schemas.PartnerOut)
def create_partner(partner: schemas.PartnerCreate, db: Session = Depends(get_db)):
    obj = models.Partner(**partner.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@router.get("/{partner_id}", response_model=schemas.PartnerOut)
def get_partner(partner_id: int, db: Session = Depends(get_db)):
    obj = db.get(models.Partner, partner_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Partner not found")
    return obj


@router.delete("/{partner_id}")
def delete_partner(partner_id: int, db: Session = Depends(get_db)):
    obj = db.get(models.Partner, partner_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Partner not found")
    db.delete(obj)
    db.commit()
    return {"status": "deleted"}
