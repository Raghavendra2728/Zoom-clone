import logging

from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware


logger = logging.getLogger("zoom_clone")


class ErrorHandlerMiddleware(BaseHTTPMiddleware):
    async def dispatch(
        self,
        request: Request,
        call_next,
    ):
        try:
            return await call_next(request)

        except Exception as exc:
            request_id = getattr(
                request.state,
                "request_id",
                None,
            )

            logger.exception(
                "Unhandled exception - request_id=%s",
                request_id,
            )

            return JSONResponse(
                status_code=500,
                content={
                    "detail": "Internal server error",
                    "request_id": request_id,
                },
            )