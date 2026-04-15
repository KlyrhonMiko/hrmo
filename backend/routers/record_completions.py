"""Router for Record Completion endpoints."""
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from models.personal_background import RecordCompletion
from schemas.personal_background import (
    RecordCompletionCreate,
    RecordCompletionUpdate,
)
from services.personal_background import RecordCompletionService
from services.employees import EmployeeService
from utils.response import APIResponse, create_response

router = APIRouter(prefix="/api/record-completions", tags=["Record Completions"])


@router.post("/{employee_no}", response_model=APIResponse, status_code=status.HTTP_201_CREATED)
async def create_record_completion(
    request: Request,
    employee_no: str,
    data: RecordCompletionCreate,
    session: AsyncSession = Depends(get_db),
):
    """Create record completion for an employee."""
    employee_service = EmployeeService(session)
    employee = await employee_service.get_by_employee_no(employee_no)

    if not employee or not employee.basic_information:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee or basic information not found",
        )

    # Check if record completion already exists
    service = RecordCompletionService(session)
    existing = await service.get_by_basic_information(employee.basic_information.id)

    if existing and not existing.is_deleted:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Record completion already exists for this employee",
        )

    # Automatically map basic_information_id from employee
    data_dict = data.model_dump()
    data_dict["basic_information_id"] = employee.basic_information.id

    record = RecordCompletion(**data_dict)
    session.add(record)
    await session.commit()
    await session.refresh(record)

    return create_response(
        path=request.url.path,
        data=record.model_dump(),
        success=True,
    )


@router.get("/{employee_no}", response_model=APIResponse)
async def get_record_completion(
    request: Request,
    employee_no: str,
    session: AsyncSession = Depends(get_db),
):
    """Get record completion for an employee."""
    service = RecordCompletionService(session)
    record = await service.get_by_employee_no(employee_no)

    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Record completion not found",
        )

    return create_response(
        path=request.url.path,
        data=record.model_dump(),
        success=True,
    )


@router.patch("/{employee_no}", response_model=APIResponse)
async def update_record_completion(
    request: Request,
    employee_no: str,
    data: RecordCompletionUpdate,
    session: AsyncSession = Depends(get_db),
):
    """Update record completion for an employee."""
    service = RecordCompletionService(session)
    record = await service.get_by_employee_no(employee_no)

    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Record completion not found",
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
async def delete_record_completion(
    employee_no: str,
    session: AsyncSession = Depends(get_db),
):
    """Soft delete record completion for an employee."""
    service = RecordCompletionService(session)
    record = await service.get_by_employee_no(employee_no)

    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Record completion not found",
        )

    success = await service.remove(record.id)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Record completion not found",
        )


@router.post("/{employee_no}/restore", response_model=APIResponse)
async def restore_record_completion(
    request: Request,
    employee_no: str,
    session: AsyncSession = Depends(get_db),
):
    """Restore a soft deleted record completion for an employee."""
    service = RecordCompletionService(session)
    record = await service.get_by_employee_no(employee_no)

    if not record or not record.is_deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Record completion not found or not deleted",
        )

    success = await service.restore(record.id)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Failed to restore record completion",
        )

    restored = await service.get_by_employee_no(employee_no)
    return create_response(
        path=request.url.path,
        data=restored.model_dump(),
        success=True,
    )
