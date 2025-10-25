from typing import List
from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session

from app.db import get_db
from sqlalchemy import text
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


@router.get("/products/{product_id}", response_model=schemas.ProductOut)
def get_product(product_id: int, db: Session = Depends(get_db)):
    obj = db.get(models.Product, product_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Product not found")
    return obj


@router.put("/products/{product_id}", response_model=schemas.ProductOut)
def update_product(product_id: int, item: schemas.ProductCreate, db: Session = Depends(get_db)):
    obj = db.get(models.Product, product_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Product not found")
    for k, v in item.model_dump().items():
        setattr(obj, k, v)
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@router.delete("/products/{product_id}", status_code=204)
def delete_product(product_id: int, db: Session = Depends(get_db)):
    obj = db.get(models.Product, product_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Product not found")
    db.delete(obj)
    db.commit()
    return Response(status_code=204)


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


@router.get("/moves/{move_id}", response_model=schemas.StockMoveOut)
def get_move(move_id: int, db: Session = Depends(get_db)):
    obj = db.get(models.StockMove, move_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Move not found")
    return obj


@router.put("/moves/{move_id}", response_model=schemas.StockMoveOut)
def update_move(move_id: int, item: schemas.StockMoveCreate, db: Session = Depends(get_db)):
    obj = db.get(models.StockMove, move_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Move not found")
    for k, v in item.model_dump().items():
        setattr(obj, k, v)
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@router.delete("/moves/{move_id}", status_code=204)
def delete_move(move_id: int, db: Session = Depends(get_db)):
    obj = db.get(models.StockMove, move_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Move not found")
    db.delete(obj)
    db.commit()
    return Response(status_code=204)


@router.get("/balances", response_model=dict)
def list_balances(db: Session = Depends(get_db)):
    # Compute product balances across all locations: sum(to_qty) - sum(from_qty)
    sql = (
        "SELECT product_id, "
        "COALESCE(SUM(CASE WHEN to_location_id IS NOT NULL THEN qty ELSE 0 END),0) - "
        "COALESCE(SUM(CASE WHEN from_location_id IS NOT NULL THEN qty ELSE 0 END),0) as qty "
        "FROM stock_moves GROUP BY product_id"
    )
    res = db.execute(text(sql)).all()
    return {row[0]: float(row[1]) for row in res}


@router.get("/balances/product/{product_id}")
def get_balance(product_id: int, db: Session = Depends(get_db)):
    sql = (
        "SELECT COALESCE(SUM(CASE WHEN to_location_id IS NOT NULL THEN qty ELSE 0 END),0) - "
        "COALESCE(SUM(CASE WHEN from_location_id IS NOT NULL THEN qty ELSE 0 END),0) as qty "
        "FROM stock_moves WHERE product_id = :pid"
    )
    row = db.execute(text(sql), {"pid": product_id}).first()
    return {"product_id": product_id, "qty": float(row[0] if row and row[0] is not None else 0)}
