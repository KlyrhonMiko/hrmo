"""Router for Employee endpoints."""
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from models.employees import Employee
from schemas.employees import (
    EmployeeCreate,
    EmployeeUpdate,
)
from services.employees import EmployeeService
from utils.response import APIResponse, create_response

router = APIRouter(prefix="/api/employees", tags=["Employees"])


@router.post("", response_model=APIResponse, status_code=status.HTTP_201_CREATED)
async def create_employee(
    request: Request,
    data: EmployeeCreate,
    session: AsyncSession = Depends(get_db),
):
    """Create a new employee record."""
    service = EmployeeService(session)
    
    # Check if employee number already exists
    existing = await service.get_by_employee_no(data.employee_no)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Employee number already exists",
        )
    
    record = Employee(**data.model_dump())
    session.add(record)
    await session.commit()
    await session.refresh(record)
    
    return create_response(
        path=request.url.path,
        data=record.model_dump(),
        success=True,
    )


@router.get("", response_model=APIResponse)
async def list_employees(
    request: Request,
    skip: int = 0,
    limit: int = 100,
    session: AsyncSession = Depends(get_db),
):
    """List all employee records."""
    service = EmployeeService(session)
    records = await service.get_all(skip=skip, limit=limit)
    
    return create_response(
        path=request.url.path,
        data=[record.model_dump() for record in records],
        success=True,
    )


@router.get("/{employee_no}", response_model=APIResponse)
async def get_employee(
    request: Request,
    employee_no: str,
    session: AsyncSession = Depends(get_db),
):
    """Get an employee by employee number."""
    service = EmployeeService(session)
    record = await service.get_by_employee_no(employee_no)
    
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found",
        )
    
    return create_response(
        path=request.url.path,
        data=record.model_dump(),
        success=True,
    )


@router.patch("/{employee_no}", response_model=APIResponse)
async def update_employee(
    request: Request,
    employee_no: str,
    data: EmployeeUpdate,
    session: AsyncSession = Depends(get_db),
):
    """Update an employee record by employee number."""
    service = EmployeeService(session)
    record = await service.get_by_employee_no(employee_no)
    
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found",
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
async def delete_employee(
    employee_no: str,
    session: AsyncSession = Depends(get_db),
):
    """Soft delete an employee record by employee number."""
    service = EmployeeService(session)
    employee = await service.get_by_employee_no(employee_no)
    
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found",
        )
    
    success = await service.remove(employee.id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found",
        )


@router.post("/{employee_no}/restore", response_model=APIResponse)
async def restore_employee(
    request: Request,
    employee_no: str,
    session: AsyncSession = Depends(get_db),
):
    """Restore a soft deleted employee record by employee number."""
    service = EmployeeService(session)
    employee = await service.get_by_employee_no(employee_no)
    
    if not employee or not employee.is_deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found or not deleted",
        )
    
    success = await service.restore(employee.id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Failed to restore employee",
        )
    
    record = await service.get_by_employee_no(employee_no)
    return create_response(
        path=request.url.path,
        data=record.model_dump(),
        success=True,
    )
