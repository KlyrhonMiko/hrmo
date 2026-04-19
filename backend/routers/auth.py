"""Authentication endpoints (login, token handling)."""
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from services.auth import AuthService
from schemas.auth import AuthLogin
from deps.auth import get_current_user
from utils.response import create_response, APIResponse

router = APIRouter(prefix="/api/auth", tags=["Auth"])


@router.post("/login", response_model=APIResponse)
async def login(request: Request, data: AuthLogin, session: AsyncSession = Depends(get_db)):
    """Authenticate user and return JWT access token."""
    service = AuthService(session)
    user = await service.authenticate(data.username_or_email, data.password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    token_data = service.create_token_for_user(user)

    response_data = {
        **token_data,
        "user": {k: v for k, v in user.model_dump().items() if k != "password"},
    }

    return create_response(path=request.url.path, data=response_data, success=True)


@router.get("/me", response_model=APIResponse)
async def me(request: Request, current_user=Depends(get_current_user)):
    """Return the currently authenticated user."""
    user_dict = {k: v for k, v in current_user.model_dump().items() if k != "password"}
    return create_response(path=request.url.path, data=user_dict, success=True)


@router.post("/token")
async def token(form_data: OAuth2PasswordRequestForm = Depends(), session: AsyncSession = Depends(get_db)):
    """OAuth2-compatible token endpoint (used by Swagger UI Authorize).

    Returns a top-level JSON with `access_token` so Swagger can pick it up.
    """
    service = AuthService(session)
    user = await service.authenticate(form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    token_data = service.create_token_for_user(user)

    return {
        "access_token": token_data["access_token"],
        "token_type": token_data["token_type"],
        "expires_in": token_data["expires_in"],
    }


@router.post("/logout", response_model=APIResponse)
async def logout(request: Request, _=Depends(get_current_user)):
    """Log out the current user."""
    return create_response(
        path=request.url.path,
        data={"message": "Successfully logged out"},
        success=True,
    )
