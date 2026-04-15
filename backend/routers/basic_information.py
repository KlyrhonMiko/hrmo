"""Router for Basic Information endpoints."""
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from models.personal_information import BasicInformation
from schemas.personal_information import (
    BasicInformationCreate,
    BasicInformationUpdate,
)
from services.personal_information import BasicInformationService
from services.employees import EmployeeService
from utils.response import APIResponse, create_response

router = APIRouter(prefix="/api/basic-information", tags=["Basic Information"])


@router.post("/{employee_no}", response_model=APIResponse, status_code=status.HTTP_201_CREATED)
async def create_basic_information(
    request: Request,
    employee_no: str,
    data: BasicInformationCreate,
    session: AsyncSession = Depends(get_db),
):
    """Create basic information for an employee."""
    employee_service = EmployeeService(session)
    employee = await employee_service.get_by_employee_no(employee_no)
    
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found",
        )
    
    # Link to employee
    data_dict = data.model_dump()
    data_dict["employee_id"] = employee.id
    
    record = BasicInformation(**data_dict)
    session.add(record)
    await session.commit()
    await session.refresh(record)
    
    return create_response(
        path=request.url.path,
        data=record.model_dump(),
        success=True,
    )


@router.get("/all", response_model=APIResponse)
async def list_all_basic_information(
    request: Request,
    skip: int = 0,
    limit: int = 100,
    session: AsyncSession = Depends(get_db),
):
    """Get all basic information records."""
    service = BasicInformationService(session)
    records = await service.get_all(skip=skip, limit=limit)

    return create_response(
        path=request.url.path,
        data=[record.model_dump() for record in records],
        success=True,
    )


@router.get("/{employee_no}", response_model=APIResponse)
async def get_basic_information(
    request: Request,
    employee_no: str,
    session: AsyncSession = Depends(get_db),
):
    """Get basic information for an employee by employee number."""
    service = BasicInformationService(session)
    record = await service.get_by_employee_no(employee_no)
    
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Basic information not found",
        )
    
    return create_response(
        path=request.url.path,
        data=record.model_dump(),
        success=True,
    )


@router.patch("/{employee_no}", response_model=APIResponse)
async def update_basic_information(
    request: Request,
    employee_no: str,
    data: BasicInformationUpdate,
    session: AsyncSession = Depends(get_db),
):
    """Update basic information for an employee."""
    service = BasicInformationService(session)
    record = await service.get_by_employee_no(employee_no)
    
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Basic information not found",
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
async def delete_basic_information(
    employee_no: str,
    session: AsyncSession = Depends(get_db),
):
    """Soft delete basic information for an employee."""
    service = BasicInformationService(session)
    record = await service.get_by_employee_no(employee_no)
    
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Basic information not found",
        )
    
    success = await service.remove(record.id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Basic information not found",
        )


@router.post("/{employee_no}/restore", response_model=APIResponse)
async def restore_basic_information(
    request: Request,
    employee_no: str,
    session: AsyncSession = Depends(get_db),
):
    """Restore a soft deleted basic information record."""
    service = BasicInformationService(session)
    record = await service.get_by_employee_no(employee_no)
    
    if not record or not record.is_deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Basic information not found or not deleted",
        )
    
    success = await service.restore(record.id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Failed to restore basic information",
        )
    
    restored = await service.get_by_employee_no(employee_no)
    return create_response(
        path=request.url.path,
        data=restored.model_dump(),
        success=True,
    )
