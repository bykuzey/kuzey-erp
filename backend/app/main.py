from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .db import Base, engine
from .modules.loader import load_modules
from .middleware import register_middlewares

app = FastAPI(title="Kuzey ERP API", openapi_url="/openapi.json")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register middlewares before application startup
register_middlewares(app)


@app.on_event("startup")
def on_startup():
    # Önce modülleri yükle, sonra tabloları oluştur (modül modelleri için gerekli)
    load_modules(app)
    # Basit başlangıç: tabloları oluştur (Alembic'e geçiş öncesi)
    Base.metadata.create_all(bind=engine)


@app.get("/health")
def health():
    return {"status": "ok"}
