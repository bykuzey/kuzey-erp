import json
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.db import Base
import modules.partners.api as partners_api
import modules.partners.schemas as partners_schemas


def test_partners_crud_direct_db():
    # Prepare in-memory DB and session
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False}, future=True)
    TestingSessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)

    # Ensure models are imported and create tables
    import importlib
    importlib.import_module("modules.partners.models")
    Base.metadata.create_all(bind=engine)

    db = TestingSessionLocal()
    try:
        # Initially empty
        lst = partners_api.list_partners(db=db)
        assert isinstance(lst, list)

        # Create partner
        payload = partners_schemas.PartnerCreate(name="Test Co", type="customer", phone="+900000")
        created = partners_api.create_partner(payload, db=db)
        assert created.name == "Test Co"
        pid = created.id

        # Get by id
        got = partners_api.get_partner(pid, db=db)
        assert got.id == pid

        # List should contain
        lst2 = partners_api.list_partners(db=db)
        assert any(p.id == pid for p in lst2)

        # Delete
        partners_api.delete_partner(pid, db=db)

        # Ensure deletion
        try:
            partners_api.get_partner(pid, db=db)
            assert False, "Expected HTTPException for missing partner"
        except Exception as e:
            # FastAPI raises HTTPException for 404
            from fastapi import HTTPException

            assert isinstance(e, HTTPException)
            assert e.status_code == 404
    finally:
        db.close()
