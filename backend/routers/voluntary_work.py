"""Router for Voluntary Work endpoints."""
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from models.professional_background import VoluntaryRecord
from schemas.professional_background import (
    VoluntaryWorkCreate,
    VoluntaryWorkUpdate,
)
from services.professional_background import VoluntaryWorkService
from services.employees import EmployeeService
from utils.response import APIResponse, create_response

router = APIRouter(prefix="/api/voluntary-work", tags=["Voluntary Work"])


@router.post("/{employee_no}", response_model=APIResponse, status_code=status.HTTP_201_CREATED)
async def create_voluntary_work(
    request: Request,
    employee_no: str,
    data: VoluntaryWorkCreate,
    session: AsyncSession = Depends(get_db),
):
    """Create a voluntary work record for an employee."""
    employee_service = EmployeeService(session)
    employee = await employee_service.get_by_employee_no(employee_no)

    if not employee or not employee.basic_information:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee or basic information not found",
        )

    # Automatically map basic_information_id from employee
    data_dict = data.model_dump()
    data_dict["basic_information_id"] = employee.basic_information.id

    record = VoluntaryRecord(**data_dict)
    session.add(record)
    await session.commit()
    await session.refresh(record)

    return create_response(
        path=request.url.path,
        data=record.model_dump(),
        success=True,
    )


@router.get("/{employee_no}", response_model=APIResponse)
async def get_voluntary_work(
    request: Request,
    employee_no: str,
    session: AsyncSession = Depends(get_db),
):
    """Get all voluntary work records for an employee."""
    service = VoluntaryWorkService(session)
    records = await service.get_by_employee_no(employee_no)

    return create_response(
        path=request.url.path,
        data=[record.model_dump() for record in records],
        success=True,
    )


@router.get("/{employee_no}/{voluntary_id}", response_model=APIResponse)
async def get_voluntary_work_detail(
    request: Request,
    employee_no: str,
    voluntary_id: str,
    session: AsyncSession = Depends(get_db),
):
    """Get a specific voluntary work record for an employee."""
    service = VoluntaryWorkService(session)
    record = await service.get(voluntary_id)

    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Voluntary work record not found",
        )

    # Verify it belongs to employee
    employee_service = EmployeeService(session)
    employee = await employee_service.get_by_employee_no(employee_no)

    if not employee or record.basic_information_id != employee.basic_information.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Voluntary work record not found for this employee",
        )

    return create_response(
        path=request.url.path,
        data=record.model_dump(),
        success=True,
    )


@router.patch("/{employee_no}/{voluntary_id}", response_model=APIResponse)
async def update_voluntary_work(
    request: Request,
    employee_no: str,
    voluntary_id: str,
    data: VoluntaryWorkUpdate,
    session: AsyncSession = Depends(get_db),
):
    """Update a voluntary work record for an employee."""
    service = VoluntaryWorkService(session)
    record = await service.get(voluntary_id)

    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Voluntary work record not found",
        )

    # Verify it belongs to employee
    employee_service = EmployeeService(session)
    employee = await employee_service.get_by_employee_no(employee_no)

    if not employee or record.basic_information_id != employee.basic_information.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Voluntary work record not found for this employee",
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


@router.delete("/{employee_no}/{voluntary_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_voluntary_work(
    employee_no: str,
    voluntary_id: str,
    session: AsyncSession = Depends(get_db),
):
    """Soft delete a voluntary work record for an employee."""
    service = VoluntaryWorkService(session)
    record = await service.get(voluntary_id)

    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Voluntary work record not found",
        )

    # Verify it belongs to employee
    employee_service = EmployeeService(session)
    employee = await employee_service.get_by_employee_no(employee_no)

    if not employee or record.basic_information_id != employee.basic_information_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Voluntary work record not found for this employee",
        )

    success = await service.remove(voluntary_id)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Voluntary work record not found",
        )


@router.post("/{employee_no}/{voluntary_id}/restore", response_model=APIResponse)
async def restore_voluntary_work(
    request: Request,
    employee_no: str,
    voluntary_id: str,
    session: AsyncSession = Depends(get_db),
):
    """Restore a soft deleted voluntary work record for an employee."""
    service = VoluntaryWorkService(session)
    record = await service.get(voluntary_id)

    if not record or not record.is_deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Voluntary work record not found or not deleted",
        )

    success = await service.restore(voluntary_id)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Failed to restore voluntary work record",
        )

    restored = await service.get(voluntary_id)
    return create_response(
        path=request.url.path,
        data=restored.model_dump(),
        success=True,
    )
