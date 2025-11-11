from fastapi import FastAPI

from app.api.v1 import health, auth
from app.config import settings


def create_app() -> FastAPI:
    app = FastAPI(title="sk-prephub API", version="0.1")
    app.include_router(health.router, prefix="/api/v1")
    app.include_router(auth.router, prefix="/api/v1")

    # create DB tables in dev if using sqlite or if you want quick start
    try:
        from app.db.base import engine
        from app.db.models import Base as ModelsBase
        ModelsBase.metadata.create_all(bind=engine)
    except Exception:
        # if DB not available at startup (e.g., remote Supabase), skip auto-create
        pass
    return app


app = create_app()
