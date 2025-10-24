from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .db import Base, engine
from .modules.loader import load_modules

app = FastAPI(title="Kuzey ERP API", openapi_url="/openapi.json")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    # Basit başlangıç: tabloları oluştur (Alembic'e geçiş öncesi)
    Base.metadata.create_all(bind=engine)
    load_modules(app)


@app.get("/health")
def health():
    return {"status": "ok"}
