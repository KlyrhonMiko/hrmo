"""Router for Training endpoints."""
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from models.professional_background import TrainingRecord
from schemas.professional_background import (
    TrainingCreate,
    TrainingUpdate,
)
from services.professional_background import TrainingService
from services.employees import EmployeeService
from utils.response import APIResponse, create_response

router = APIRouter(prefix="/api/training", tags=["Training"])


@router.post("/{employee_no}", response_model=APIResponse, status_code=status.HTTP_201_CREATED)
async def create_training(
    request: Request,
    employee_no: str,
    data: TrainingCreate,
    session: AsyncSession = Depends(get_db),
):
    """Create a training record for an employee."""
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

    record = TrainingRecord(**data_dict)
    session.add(record)
    await session.commit()
    await session.refresh(record)

    return create_response(
        path=request.url.path,
        data=record.model_dump(),
        success=True,
    )


@router.get("/all", response_model=APIResponse)
async def list_all_training_records(
    request: Request,
    skip: int = 0,
    limit: int = 100,
    session: AsyncSession = Depends(get_db),
):
    """Get all training records."""
    service = TrainingService(session)
    records = await service.get_all(skip=skip, limit=limit)

    return create_response(
        path=request.url.path,
        data=[record.model_dump() for record in records],
        success=True,
    )


@router.get("/{employee_no}", response_model=APIResponse)
async def get_training_records(
    request: Request,
    employee_no: str,
    session: AsyncSession = Depends(get_db),
):
    """Get all training records for an employee."""
    service = TrainingService(session)
    records = await service.get_by_employee_no(employee_no)

    return create_response(
        path=request.url.path,
        data=[record.model_dump() for record in records],
        success=True,
    )


@router.get("/{employee_no}/type/{training_type}", response_model=APIResponse)
async def get_training_by_type(
    request: Request,
    employee_no: str,
    training_type: str,
    session: AsyncSession = Depends(get_db),
):
    """Get training records of a specific type for an employee."""
    employee_service = EmployeeService(session)
    basic_information_id = await employee_service.get_basic_information_id_by_employee_no(employee_no)

    if not basic_information_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee or basic information not found",
        )

    service = TrainingService(session)
    records = await service.get_by_type(basic_information_id, training_type)

    return create_response(
        path=request.url.path,
        data=[record.model_dump() for record in records],
        success=True,
    )


@router.get("/{employee_no}/{training_id}", response_model=APIResponse)
async def get_training_detail(
    request: Request,
    employee_no: str,
    training_id: str,
    session: AsyncSession = Depends(get_db),
):
    """Get a specific training record for an employee."""
    service = TrainingService(session)
    record = await service.get(training_id)

    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Training record not found",
        )

    # Verify it belongs to employee
    employee_service = EmployeeService(session)
    basic_information_id = await employee_service.get_basic_information_id_by_employee_no(employee_no)

    if not basic_information_id or record.basic_information_id != basic_information_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Training record not found for this employee",
        )

    return create_response(
        path=request.url.path,
        data=record.model_dump(),
        success=True,
    )


@router.patch("/{employee_no}/{training_id}", response_model=APIResponse)
async def update_training(
    request: Request,
    employee_no: str,
    training_id: str,
    data: TrainingUpdate,
    session: AsyncSession = Depends(get_db),
):
    """Update a training record for an employee."""
    service = TrainingService(session)
    record = await service.get(training_id)

    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Training record not found",
        )

    # Verify it belongs to employee
    employee_service = EmployeeService(session)
    basic_information_id = await employee_service.get_basic_information_id_by_employee_no(employee_no)

    if not basic_information_id or record.basic_information_id != basic_information_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Training record not found for this employee",
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


@router.delete("/{employee_no}/{training_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_training(
    employee_no: str,
    training_id: str,
    session: AsyncSession = Depends(get_db),
):
    """Soft delete a training record for an employee."""
    service = TrainingService(session)
    record = await service.get(training_id)

    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Training record not found",
        )

    # Verify it belongs to employee
    employee_service = EmployeeService(session)
    basic_information_id = await employee_service.get_basic_information_id_by_employee_no(employee_no)

    if not basic_information_id or record.basic_information_id != basic_information_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Training record not found for this employee",
        )

    success = await service.remove(training_id)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Training record not found",
        )


@router.post("/{employee_no}/{training_id}/restore", response_model=APIResponse)
async def restore_training(
    request: Request,
    employee_no: str,
    training_id: str,
    session: AsyncSession = Depends(get_db),
):
    """Restore a soft deleted training record for an employee."""
    service = TrainingService(session)
    record = await service.get(training_id)

    if not record or not record.is_deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Training record not found or not deleted",
        )

    success = await service.restore(training_id)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Failed to restore training record",
        )

    restored = await service.get(training_id)
    return create_response(
        path=request.url.path,
        data=restored.model_dump(),
        success=True,
    )
