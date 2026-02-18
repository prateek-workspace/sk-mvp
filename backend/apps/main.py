# apps/main.py
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config.routers import RouterManager

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("fastapi_app")

app = FastAPI(
    title="FastAPI Shop",
    version="0.1.0",
    redirect_slashes=False,   #  VERY IMPORTANT (prevents 307)
)

#  CORS FIX
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ],
    allow_origin_regex=r"https://(.*\.)?skstudentpath\.com|https://.*\.sk-mvp\.pages\.dev",
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    RouterManager(app).import_routers()
    # Also include analytics router
    from apps.core.analytics import router as analytics_router
    app.include_router(analytics_router)
    logger.info("Routers loaded successfully.")

@app.get("/")
def health():
    return {"status": "ok"}
