"""Router for Reference Records endpoints."""
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from models.personal_background import ReferenceRecord
from schemas.personal_background import (
    ReferenceRecordCreate,
    ReferenceRecordUpdate,
)
from services.personal_background import ReferenceRecordService
from services.employees import EmployeeService
from utils.response import APIResponse, build_pagination_meta, create_response

router = APIRouter(prefix="/api/reference-records", tags=["Reference Records"])


@router.post("/{employee_no}", response_model=APIResponse, status_code=status.HTTP_201_CREATED)
async def create_reference_record(
    request: Request,
    employee_no: str,
    data: ReferenceRecordCreate,
    session: AsyncSession = Depends(get_db),
):
    """Create a reference record for an employee."""
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

    record = ReferenceRecord(**data_dict)
    session.add(record)
    await session.commit()
    await session.refresh(record)

    return create_response(
        path=request.url.path,
        data=record.model_dump(),
        success=True,
    )


@router.get("/all", response_model=APIResponse)
async def list_all_reference_records(
    request: Request,
    skip: int = 0,
    limit: int = 10,
    session: AsyncSession = Depends(get_db),
):
    """Get all reference record entries."""
    service = ReferenceRecordService(session)
    records = await service.get_all(skip=skip, limit=limit)
    total_records = await service.count_all()

    return create_response(
        path=request.url.path,
        data=[record.model_dump() for record in records],
        meta=build_pagination_meta(skip=skip, limit=limit, total_records=total_records),
        success=True,
    )


@router.get("/{employee_no}", response_model=APIResponse)
async def get_reference_records(
    request: Request,
    employee_no: str,
    session: AsyncSession = Depends(get_db),
):
    """Get all reference records for an employee."""
    service = ReferenceRecordService(session)
    records = await service.get_by_employee_no(employee_no)

    return create_response(
        path=request.url.path,
        data=[record.model_dump() for record in records],
        success=True,
    )


@router.get("/{employee_no}/{reference_id}", response_model=APIResponse)
async def get_reference_record(
    request: Request,
    employee_no: str,
    reference_id: str,
    session: AsyncSession = Depends(get_db),
):
    """Get a specific reference record for an employee."""
    service = ReferenceRecordService(session)
    record = await service.get(reference_id)

    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reference record not found",
        )

    # Verify it belongs to employee
    employee_service = EmployeeService(session)
    basic_information_id = await employee_service.get_basic_information_id_by_employee_no(employee_no)

    if not basic_information_id or record.basic_information_id != basic_information_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reference record not found for this employee",
        )

    return create_response(
        path=request.url.path,
        data=record.model_dump(),
        success=True,
    )


@router.patch("/{employee_no}/{reference_id}", response_model=APIResponse)
async def update_reference_record(
    request: Request,
    employee_no: str,
    reference_id: str,
    data: ReferenceRecordUpdate,
    session: AsyncSession = Depends(get_db),
):
    """Update a reference record for an employee."""
    service = ReferenceRecordService(session)
    record = await service.get(reference_id)

    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reference record not found",
        )

    # Verify it belongs to employee
    employee_service = EmployeeService(session)
    basic_information_id = await employee_service.get_basic_information_id_by_employee_no(employee_no)

    if not basic_information_id or record.basic_information_id != basic_information_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reference record not found for this employee",
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


@router.delete("/{employee_no}/{reference_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_reference_record(
    employee_no: str,
    reference_id: str,
    session: AsyncSession = Depends(get_db),
):
    """Soft delete a reference record for an employee."""
    service = ReferenceRecordService(session)
    record = await service.get(reference_id)

    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reference record not found",
        )

    # Verify it belongs to employee
    employee_service = EmployeeService(session)
    basic_information_id = await employee_service.get_basic_information_id_by_employee_no(employee_no)

    if not basic_information_id or record.basic_information_id != basic_information_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reference record not found for this employee",
        )

    success = await service.remove(reference_id)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reference record not found",
        )


@router.post("/{employee_no}/{reference_id}/restore", response_model=APIResponse)
async def restore_reference_record(
    request: Request,
    employee_no: str,
    reference_id: str,
    session: AsyncSession = Depends(get_db),
):
    """Restore a soft deleted reference record for an employee."""
    service = ReferenceRecordService(session)
    record = await service.get(reference_id)

    if not record or not record.is_deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reference record not found or not deleted",
        )

    success = await service.restore(reference_id)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Failed to restore reference record",
        )

    restored = await service.get(reference_id)
    return create_response(
        path=request.url.path,
        data=restored.model_dump(),
        success=True,
    )
