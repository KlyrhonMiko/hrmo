"""Router for Government IDs endpoints."""
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from models.personal_information import GovernmentId
from schemas.personal_information import (
    GovernmentIdCreate,
    GovernmentIdUpdate,
)
from services.personal_information import GovernmentIdService
from services.employees import EmployeeService
from utils.response import APIResponse, create_response

router = APIRouter(prefix="/api/government-ids", tags=["Government IDs"])


@router.post("/{employee_no}", response_model=APIResponse, status_code=status.HTTP_201_CREATED)
async def create_government_id(
    request: Request,
    employee_no: str,
    data: GovernmentIdCreate,
    session: AsyncSession = Depends(get_db),
):
    """Create a new government ID for an employee."""
    employee_service = EmployeeService(session)
    basic_information_id = await employee_service.get_basic_information_id_by_employee_no(employee_no)
    
    if not basic_information_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee or basic information not found",
        )
    
    # Automatically map basic_information_id from employee
    data_dict = data.model_dump()
    data_dict["basic_information_id"] = basic_information_id
    
    record = GovernmentId(**data_dict)
    session.add(record)
    await session.commit()
    await session.refresh(record)
    
    return create_response(
        path=request.url.path,
        data=record.model_dump(),
        success=True,
    )


@router.get("/all", response_model=APIResponse)
async def list_all_government_ids(
    request: Request,
    skip: int = 0,
    limit: int = 100,
    session: AsyncSession = Depends(get_db),
):
    """Get all government ID records."""
    service = GovernmentIdService(session)
    records = await service.get_all(skip=skip, limit=limit)

    return create_response(
        path=request.url.path,
        data=[record.model_dump() for record in records],
        success=True,
    )


@router.get("/{employee_no}", response_model=APIResponse)
async def get_government_ids(
    request: Request,
    employee_no: str,
    session: AsyncSession = Depends(get_db),
):
    """Get all government IDs for an employee."""
    service = GovernmentIdService(session)
    records = await service.get_by_employee_no(employee_no)
    
    return create_response(
        path=request.url.path,
        data=[record.model_dump() for record in records],
        success=True,
    )


@router.get("/{employee_no}/{id_type}", response_model=APIResponse)
async def get_government_id_by_type(
    request: Request,
    employee_no: str,
    id_type: str,
    session: AsyncSession = Depends(get_db),
):
    """Get a specific government ID by type for an employee."""
    service = GovernmentIdService(session)
    record = await service.get_by_employee_no_and_type(employee_no, id_type)
    
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Government ID not found",
        )
    
    return create_response(
        path=request.url.path,
        data=record.model_dump(),
        success=True,
    )


@router.patch("/{employee_no}/{id_type}", response_model=APIResponse)
async def update_government_id(
    request: Request,
    employee_no: str,
    id_type: str,
    data: GovernmentIdUpdate,
    session: AsyncSession = Depends(get_db),
):
    """Update a government ID for an employee."""
    service = GovernmentIdService(session)
    record = await service.get_by_employee_no_and_type(employee_no, id_type)
    
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Government ID not found",
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


@router.delete("/{employee_no}/{id_type}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_government_id(
    employee_no: str,
    id_type: str,
    session: AsyncSession = Depends(get_db),
):
    """Soft delete a government ID for an employee."""
    service = GovernmentIdService(session)
    record = await service.get_by_employee_no_and_type(employee_no, id_type)
    
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Government ID not found",
        )
    
    success = await service.remove(record.id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Government ID not found",
        )


@router.post("/{employee_no}/{id_type}/restore", response_model=APIResponse)
async def restore_government_id(
    request: Request,
    employee_no: str,
    id_type: str,
    session: AsyncSession = Depends(get_db),
):
    """Restore a soft deleted government ID for an employee."""
    service = GovernmentIdService(session)
    record = await service.get_by_employee_no_and_type(employee_no, id_type)
    
    if not record or not record.is_deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Government ID not found or not deleted",
        )
    
    success = await service.restore(record.id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Failed to restore government ID",
        )
    
    restored = await service.get_by_employee_no_and_type(employee_no, id_type)
    return restored
