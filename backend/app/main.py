"""HealthAI — FastAPI entry point."""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine, Base
from app.services.scheduler import start_scheduler, stop_scheduler

# Import routers
from app.routers.users import auth_router, user_router
from app.routers.medicines import router as medicines_router
from app.routers.routine import router as routine_router
from app.routers.water import router as water_router
from app.routers.reports import router as reports_router
from app.routers.dashboard import router as dashboard_router
from app.routers.meals import router as meals_router
from app.routers.exercises import router as exercises_router
from app.routers.ai_tips import router as ai_tips_router
from app.routers.prescription import router as prescription_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("healthai")


# ── Lifespan ─────────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Creating database tables …")
    Base.metadata.create_all(bind=engine)

    logger.info("Starting scheduler …")
    start_scheduler()
    yield
    # Shutdown
    stop_scheduler()
    logger.info("HealthAI shut down.")


# ── App ──────────────────────────────────────────────────────────────────────

app = FastAPI(
    title="HealthAI API",
    description="Backend for the HealthAI health & medicine reminder app",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS – allow the frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],            # tighten in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Register routers ─────────────────────────────────────────────────────────

app.include_router(auth_router)
app.include_router(user_router)
app.include_router(medicines_router)
app.include_router(routine_router)
app.include_router(water_router)
app.include_router(reports_router)
app.include_router(dashboard_router)
app.include_router(meals_router)
app.include_router(exercises_router)
app.include_router(ai_tips_router)
app.include_router(prescription_router)


# ── Health check ─────────────────────────────────────────────────────────────

@app.get("/api/health", tags=["Health"])
def health_check():
    return {"status": "ok"}
