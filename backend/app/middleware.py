from fastapi import FastAPI, Request
from starlette.middleware.base import BaseHTTPMiddleware
from typing import Callable
from .db import SessionLocal
from .security import try_get_user_id_from_request
from modules.core.models import AuditLog  # type: ignore


class DBSessionMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: Callable):
        request.state.db = SessionLocal()
        try:
            response = await call_next(request)
            return response
        finally:
            request.state.db.close()


class AuditMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: Callable):
        response = await call_next(request)
        try:
            db = getattr(request.state, "db", None)
            if db:
                user_id = try_get_user_id_from_request(request)
                log = AuditLog(
                    user_id=user_id,
                    method=request.method,
                    path=str(request.url.path),
                    status_code=response.status_code,
                    ip=request.client.host if request.client else None,
                    user_agent=request.headers.get("user-agent"),
                )
                db.add(log)
                db.commit()
        except Exception:
            # Audit hataları uygulamayı etkilemesin
            pass
        return response


def register_middlewares(app: FastAPI):
    app.add_middleware(DBSessionMiddleware)
    app.add_middleware(AuditMiddleware)
