"""Router for user registration and account endpoints."""
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from services.users import UserService
from schemas.users import UserCreate
from utils.response import create_response, APIResponse, build_pagination_meta

router = APIRouter(prefix="/api/users", tags=["Users"])


@router.post("", response_model=APIResponse, status_code=status.HTTP_201_CREATED)
async def register_user(
    request: Request,
    data: UserCreate,
    session: AsyncSession = Depends(get_db),
):
    """Register a new user account.

    Ensures username and email are unique and returns created user (password omitted).
    """
    service = UserService(session)

    existing = await service.get_by_username(data.username)
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Username already exists")

    existing_email = await service.get_by_email(data.email)
    if existing_email:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already in use")

    record = await service.create_user(data)
    payload = record.model_dump()
    payload.pop("password", None)

    return create_response(path=request.url.path, data=payload, success=True)





@router.get("", response_model=APIResponse)
async def list_users(
    request: Request,
    skip: int = 0,
    limit: int = 10,
    session: AsyncSession = Depends(get_db),
):
    service = UserService(session)
    records = await service.get_all(skip=skip, limit=limit)
    total = await service.count_all()

    payload = []
    for r in records:
        d = r.model_dump()
        d.pop("password", None)
        payload.append(d)

    return create_response(
        path=request.url.path,
        data=payload,
        meta=build_pagination_meta(skip=skip, limit=limit, total_records=total),
        success=True,
    )


@router.get("/{user_no}", response_model=APIResponse)
async def get_user(request: Request, user_no: str, session: AsyncSession = Depends(get_db)):
    service = UserService(session)
    record = await service.get_by_user_no(user_no)
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    payload = record.model_dump()
    payload.pop("password", None)
    return create_response(path=request.url.path, data=payload, success=True)





@router.patch("/{user_no}", response_model=APIResponse)
async def update_user(
    request: Request,
    user_no: str,
    data: dict,
    session: AsyncSession = Depends(get_db),
):
    service = UserService(session)
    record = await service.get_by_user_no(user_no)
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    # apply provided fields
    for k, v in data.items():
        if k == "password":
            # hash password
            from utils.security import hash_password

            setattr(record, "password", hash_password(v))
        elif hasattr(record, k):
            setattr(record, k, v)

    session.add(record)
    await session.commit()
    await session.refresh(record)

    payload = record.model_dump()
    payload.pop("password", None)
    return create_response(path=request.url.path, data=payload, success=True)


@router.delete("/{user_no}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(user_no: str, session: AsyncSession = Depends(get_db)):
    service = UserService(session)
    record = await service.get_by_user_no(user_no)
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    success = await service.remove(record.id)
    if not success:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Failed to delete user")


@router.post("/{user_no}/restore", response_model=APIResponse)
async def restore_user(request: Request, user_no: str, session: AsyncSession = Depends(get_db)):
    service = UserService(session)
    record = await service.get_by_user_no(user_no)
    if not record or not record.is_deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found or not deleted")

    success = await service.restore(record.id)
    if not success:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Failed to restore user")

    record = await service.get_by_user_no(user_no)
    payload = record.model_dump()
    payload.pop("password", None)
    return create_response(path=request.url.path, data=payload, success=True)
