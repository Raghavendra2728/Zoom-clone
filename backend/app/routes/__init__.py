from app.routes.meetings import router as meetings_router
from app.routes.participants import router as participants_router

__all__ = [
    "meetings_router",
    "participants_router",
]