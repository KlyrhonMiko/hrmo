"""Router for Primary Government ID endpoints."""
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from models.personal_background import PrimaryGovernmentId
from schemas.personal_background import (
    PrimaryGovernmentIdCreate,
    PrimaryGovernmentIdUpdate,
)
from services.personal_background import PrimaryGovernmentIdService
from services.employees import EmployeeService
from utils.response import APIResponse, create_response

router = APIRouter(prefix="/api/primary-government-ids", tags=["Primary Government IDs"])


@router.post("/{employee_no}", response_model=APIResponse, status_code=status.HTTP_201_CREATED)
async def create_primary_government_id(
    request: Request,
    employee_no: str,
    data: PrimaryGovernmentIdCreate,
    session: AsyncSession = Depends(get_db),
):
    """Create primary government ID for an employee."""
    employee_service = EmployeeService(session)
    basic_information_id = await employee_service.get_basic_information_id_by_employee_no(employee_no)

    if not basic_information_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee or basic information not found",
        )

    # Check if primary government ID already exists
    service = PrimaryGovernmentIdService(session)
    existing = await service.get_by_basic_information(basic_information_id)

    if existing and not existing.is_deleted:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Primary government ID already exists for this employee",
        )

    # Automatically map basic_information_id from employee
    data_dict = data.model_dump()
    data_dict["basic_information_id"] = basic_information_id

    record = PrimaryGovernmentId(**data_dict)
    session.add(record)
    await session.commit()
    await session.refresh(record)

    return create_response(
        path=request.url.path,
        data=record.model_dump(),
        success=True,
    )


@router.get("/all", response_model=APIResponse)
async def list_all_primary_government_ids(
    request: Request,
    skip: int = 0,
    limit: int = 100,
    session: AsyncSession = Depends(get_db),
):
    """Get all primary government ID records."""
    service = PrimaryGovernmentIdService(session)
    records = await service.get_all(skip=skip, limit=limit)

    return create_response(
        path=request.url.path,
        data=[record.model_dump() for record in records],
        success=True,
    )


@router.get("/{employee_no}", response_model=APIResponse)
async def get_primary_government_id(
    request: Request,
    employee_no: str,
    session: AsyncSession = Depends(get_db),
):
    """Get primary government ID for an employee."""
    service = PrimaryGovernmentIdService(session)
    record = await service.get_by_employee_no(employee_no)

    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Primary government ID not found",
        )

    return create_response(
        path=request.url.path,
        data=record.model_dump(),
        success=True,
    )


@router.patch("/{employee_no}", response_model=APIResponse)
async def update_primary_government_id(
    request: Request,
    employee_no: str,
    data: PrimaryGovernmentIdUpdate,
    session: AsyncSession = Depends(get_db),
):
    """Update primary government ID for an employee."""
    service = PrimaryGovernmentIdService(session)
    record = await service.get_by_employee_no(employee_no)

    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Primary government ID not found",
        )

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(record, field, value)

    session.add(record)
    await session.commit()
    await session.refresh(record)

    return create_response(
        path=request.url.path,
        data=record.model_dump(),
        success=True,
    )


@router.delete("/{employee_no}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_primary_government_id(
    employee_no: str,
    session: AsyncSession = Depends(get_db),
):
    """Soft delete primary government ID for an employee."""
    service = PrimaryGovernmentIdService(session)
    record = await service.get_by_employee_no(employee_no)

    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Primary government ID not found",
        )

    success = await service.remove(record.id)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Primary government ID not found",
        )


@router.post("/{employee_no}/restore", response_model=APIResponse)
async def restore_primary_government_id(
    request: Request,
    employee_no: str,
    session: AsyncSession = Depends(get_db),
):
    """Restore a soft deleted primary government ID for an employee."""
    service = PrimaryGovernmentIdService(session)
    record = await service.get_by_employee_no(employee_no)

    if not record or not record.is_deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Primary government ID not found or not deleted",
        )

    success = await service.restore(record.id)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Failed to restore primary government ID",
        )

    restored = await service.get_by_employee_no(employee_no)
    return create_response(
        path=request.url.path,
        data=restored.model_dump(),
        success=True,
    )
