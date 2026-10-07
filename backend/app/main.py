import logging
from contextlib import asynccontextmanager
from app.routes.signaling import router as signaling_router
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database.seed import initialize_database
from app.middleware import (
    ErrorHandlerMiddleware,
    LoggingMiddleware,
    RequestIDMiddleware,
)
from app.routes.health import router as health_router
from app.routes.meetings import router as meetings_router
from app.routes.participants import router as participants_router
from app.routes.signaling import router as signaling_router


logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    initialize_database()
    yield


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    debug=settings.DEBUG,
    lifespan=lifespan,
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(ErrorHandlerMiddleware)
app.add_middleware(LoggingMiddleware)
app.add_middleware(RequestIDMiddleware)


app.include_router(health_router)
app.include_router(meetings_router)
app.include_router(participants_router)
app.include_router(signaling_router)


@app.get("/")
def root():
    return {
        "message": "Zoom Clone API is running",
        "version": settings.APP_VERSION,
    }