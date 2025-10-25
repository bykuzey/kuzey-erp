from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.db import Base
import modules.stock.api as stock_api
import modules.stock.schemas as stock_schemas


def test_products_crud_direct_db():
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False}, future=True)
    TestingSessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)

    # import models and create tables
    import importlib
    importlib.import_module("modules.stock.models")
    Base.metadata.create_all(bind=engine)

    db = TestingSessionLocal()
    try:
        # initially empty
        lst = stock_api.list_products(db=db)
        assert isinstance(lst, list)

        # create product
        payload = stock_schemas.ProductCreate(sku="P-100", name="Test Product", price_sale=12.5)
        created = stock_api.create_product(payload, db=db)
        assert created.sku == "P-100"
        pid = created.id

        # get by id
        got = stock_api.get_product(pid, db=db)
        assert got.id == pid

        # update
        upd = stock_schemas.ProductCreate(sku="P-100", name="Updated", price_sale=15)
        updated = stock_api.update_product(pid, upd, db=db)
        assert updated.name == "Updated"

        # delete
        stock_api.delete_product(pid, db=db)

        # ensure deleted
        try:
            stock_api.get_product(pid, db=db)
            assert False, "Expected HTTPException for missing product"
        except Exception as e:
            from fastapi import HTTPException
            assert isinstance(e, HTTPException)
            assert e.status_code == 404
    finally:
        db.close()
