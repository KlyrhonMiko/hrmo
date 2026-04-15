"""Main application entry point."""
import os
from contextlib import asynccontextmanager
from datetime import datetime

from fastapi import FastAPI, HTTPException, Request, status
from fastapi.responses import JSONResponse

from core.config import get_settings
from core.database import close_db, init_db
from routers import (
    basic_information,
    government_ids,
    addresses,
    contact_information,
    employees,
    certificates,
)
from utils.response import APIResponse

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan context manager.
    
    Handles startup and shutdown events.
    """
    # Startup
    await init_db()
    yield
    # Shutdown
    await close_db()


def create_app() -> FastAPI:
    """Create and configure FastAPI application.
    
    Returns:
        FastAPI: Configured FastAPI application instance.
    """
    app = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        lifespan=lifespan,
    )

    # Include routers
    app.include_router(basic_information.router)
    app.include_router(government_ids.router)
    app.include_router(addresses.router)
    app.include_router(contact_information.router)
    app.include_router(employees.router)
    app.include_router(certificates.router)

    # Add exception handlers
    @app.exception_handler(HTTPException)
    async def http_exception_handler(request: Request, exc: HTTPException):
        """Handle HTTP exceptions with standardized response format."""
        response = APIResponse(
            success=False,
            path=request.url.path,
            data={
                "message": exc.detail,
                "status_code": exc.status_code,
            },
            timestamp=datetime.utcnow().isoformat() + "Z",
        )
        return JSONResponse(
            status_code=exc.status_code,
            content=response.model_dump(),
        )

    @app.exception_handler(Exception)
    async def general_exception_handler(request: Request, exc: Exception):
        """Handle generic exceptions with standardized response format."""
        response = APIResponse(
            success=False,
            path=request.url.path,
            data={
                "message": "Internal server error",
                "status_code": 500,
            },
            timestamp=datetime.utcnow().isoformat() + "Z",
        )
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content=response.model_dump(),
        )

    return app


app = create_app()

if __name__ == "__main__":
    import uvicorn

    host = os.getenv("HOST", settings.host)
    port = int(os.getenv("PORT", settings.port))
    reload = settings.env == "development"

    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=reload,
        log_level="info",
    )

