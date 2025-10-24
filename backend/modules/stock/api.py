from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db import get_db
from . import models, schemas

router = APIRouter(tags=["stock"])


@router.get("/products", response_model=List[schemas.ProductOut])
def list_products(db: Session = Depends(get_db)):
    return db.query(models.Product).all()


@router.post("/products", response_model=schemas.ProductOut)
def create_product(item: schemas.ProductCreate, db: Session = Depends(get_db)):
    exists = db.query(models.Product).filter(models.Product.sku == item.sku).first()
    if exists:
        raise HTTPException(status_code=400, detail="SKU already exists")
    obj = models.Product(**item.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@router.get("/locations", response_model=List[schemas.StockLocationOut])
def list_locations(db: Session = Depends(get_db)):
    return db.query(models.StockLocation).all()


@router.post("/locations", response_model=schemas.StockLocationOut)
def create_location(item: schemas.StockLocationCreate, db: Session = Depends(get_db)):
    exists = db.query(models.StockLocation).filter(models.StockLocation.code == item.code).first()
    if exists:
        raise HTTPException(status_code=400, detail="Location code exists")
    obj = models.StockLocation(**item.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@router.get("/moves", response_model=List[schemas.StockMoveOut])
def list_moves(db: Session = Depends(get_db)):
    return db.query(models.StockMove).all()


@router.post("/moves", response_model=schemas.StockMoveOut)
def create_move(item: schemas.StockMoveCreate, db: Session = Depends(get_db)):
    obj = models.StockMove(**item.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj
