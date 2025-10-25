# Kuzey ERP 2025

Modüler, Python (FastAPI) + PostgreSQL tabanlı, React+TypeScript arayüzlü ERP iskeleti.

Önemli Güvenlik Notu
- GitHub parolanızı asla paylaşmayın. Kişisel erişim belirteci (PAT) veya `gh` CLI ile kimlik doğrulayın. Eğer parolanızı paylaştıysanız hemen değiştirin.

## Hızlı Başlangıç (Docker Compose)

Gereksinimler: Docker ve Docker Compose

```bash
cp .env.example .env
docker compose up --build -d
```

Servisler:
- Backend: http://localhost:8000 (API Docs: http://localhost:8000/docs)
- Frontend (Vite dev): http://localhost:5173
- PostgreSQL: localhost:55432 (host port) → container içi 5432

İlk kullanımda backend tablo oluşturma otomatik yapılır (SQLAlchemy create_all). Alembic iskeleti dahildir, daha sonra versiyonlu migration akışına geçebilirsiniz.

## Lokal (Docker olmadan) Backend Çalıştırma
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

## Frontend (Vite)
```bash
cd frontend
npm ci
npm run dev
```

## Alembic (isteğe bağlı)
```bash
cd backend
alembic revision --autogenerate -m "init"
alembic upgrade head
```

## Yapı
- `backend/`: FastAPI, SQLAlchemy, modül loader, core ve partners modülleri
- `frontend/`: React+TS (Vite, MUI), Login, Dashboard, Partners listeleme iskeleti
- `docker-compose.yml`: db, backend, frontend servisleri

## Modülerlik
- Her modül `backend/modules/<modul_adı>` klasörü altında: `manifest.yml`, `models.py`, `schemas.py`, `api.py`
- Loader, manifest okur ve router'ları `/api/v1/{module}/...` altında yayınlar.
