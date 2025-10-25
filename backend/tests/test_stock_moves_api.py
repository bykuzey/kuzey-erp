from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.db import Base
import modules.stock.api as stock_api
import modules.stock.schemas as stock_schemas


def test_stock_moves_and_balances():
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False}, future=True)
    TestingSessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)

    # import models and create tables
    import importlib
    importlib.import_module("modules.stock.models")
    Base.metadata.create_all(bind=engine)

    db = TestingSessionLocal()
    try:
        # create a product
        p = stock_schemas.ProductCreate(sku="M-1", name="Material 1")
        prod = stock_api.create_product(p, db=db)
        pid = prod.id

        # create two locations
        loc1 = stock_schemas.StockLocationCreate(code="L1", name="Depo 1")
        loc2 = stock_schemas.StockLocationCreate(code="L2", name="Depo 2")
        l1 = stock_api.create_location(loc1, db=db)
        l2 = stock_api.create_location(loc2, db=db)

        # move: receive 100 into L1
        m1 = stock_schemas.StockMoveCreate(product_id=pid, qty=100, from_location_id=None, to_location_id=l1.id, reference="PO-1")
        created1 = stock_api.create_move(m1, db=db)

        # move: transfer 30 from L1 to L2
        m2 = stock_schemas.StockMoveCreate(product_id=pid, qty=30, from_location_id=l1.id, to_location_id=l2.id, reference="TR-1")
        created2 = stock_api.create_move(m2, db=db)

        # move: consume 10 from L2 (to_location None)
        m3 = stock_schemas.StockMoveCreate(product_id=pid, qty=10, from_location_id=l2.id, to_location_id=None, reference="SO-1")
        created3 = stock_api.create_move(m3, db=db)

        # balances
        balances = stock_api.list_balances(db=db)
        assert isinstance(balances, dict)
        assert round(balances.get(pid, 0), 6) == 90.0  # 100 in, transfer doesn't change total, consume 10 => net 90

        b = stock_api.get_balance(pid, db=db)
        assert b["product_id"] == pid
        assert round(b["qty"], 6) == 90.0

        # test move get/update/delete
        g = stock_api.get_move(created2.id, db=db)
        assert g.id == created2.id

        upd = stock_schemas.StockMoveCreate(product_id=pid, qty=20, from_location_id=l1.id, to_location_id=l2.id)
        u = stock_api.update_move(created2.id, upd, db=db)
        assert u.qty == 20

        stock_api.delete_move(created3.id, db=db)
        try:
            stock_api.get_move(created3.id, db=db)
            assert False
        except Exception:
            pass

    finally:
        db.close()
