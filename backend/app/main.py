import logging
import time
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from slowapi.util import get_remote_address

from app.api.routes.auth import router as auth_router
from app.api.routes.certificates import router as certificates_router
from app.api.routes.chat import router as chat_router
from app.api.routes.feedback import router as feedback_router
from app.api.routes.batch import router as batch_router
from app.core.config import get_settings
from app.core.logging_config import configure_logging
from app.core.rate_limit import limiter
from app.db.client import mongo_manager


configure_logging()
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(_: FastAPI):
    settings = get_settings()
    settings.uploads_dir.mkdir(parents=True, exist_ok=True)
    settings.heatmaps_dir.mkdir(parents=True, exist_ok=True)
    settings.qr_dir.mkdir(parents=True, exist_ok=True)
    await mongo_manager.connect()
    logger.info("MongoDB connection initialized and verified.")
    yield
    mongo_manager.close()
    logger.info("MongoDB connection closed.")


app = FastAPI(title=get_settings().app_name, version=get_settings().app_version, lifespan=lifespan)
app.state.limiter = limiter
app.add_middleware(SlowAPIMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def request_logger(request: Request, call_next):
    started = time.perf_counter()
    response = await call_next(request)
    elapsed = (time.perf_counter() - started) * 1000
    logger.info("%s %s %s %0.2fms", request.method, request.url.path, response.status_code, elapsed)
    return response


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.exception("Unhandled error on %s: %s", request.url.path, exc)
    return JSONResponse(status_code=500, content={"detail": "Internal server error."})


@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request: Request, exc: RateLimitExceeded) -> JSONResponse:
    logger.warning("Rate limit exceeded for %s", request.url.path)
    return JSONResponse(status_code=429, content={"detail": "Rate limit exceeded."})


app.mount("/storage", StaticFiles(directory=str(get_settings().uploads_dir.parent)), name="storage")
app.include_router(auth_router)
app.include_router(certificates_router)
app.include_router(chat_router)
app.include_router(feedback_router)
app.include_router(batch_router)


@app.get("/")
async def healthcheck() -> dict:
    return {
        "service": get_settings().app_name,
        "version": get_settings().app_version,
        "client_ip_strategy": get_remote_address.__name__,
        "status": "ok",
    }


@app.get("/health/database")
async def database_healthcheck() -> dict:
    await mongo_manager.ping()
    settings = get_settings()
    return {
        "status": "ok",
        "database": settings.database_name,
        "mongodb_uri": settings.mongodb_uri,
    }
