"""Router for Work Experience endpoints."""
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from models.professional_background import WorkExperienceRecord
from schemas.professional_background import (
    WorkExperienceCreate,
    WorkExperienceUpdate,
)
from services.professional_background import WorkExperienceService
from services.employees import EmployeeService
from utils.response import APIResponse, build_pagination_meta, create_response

router = APIRouter(prefix="/api/work-experience", tags=["Work Experience"])


@router.post("/{employee_no}", response_model=APIResponse, status_code=status.HTTP_201_CREATED)
async def create_work_experience(
    request: Request,
    employee_no: str,
    data: WorkExperienceCreate,
    session: AsyncSession = Depends(get_db),
):
    """Create a work experience record for an employee."""
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

    record = WorkExperienceRecord(**data_dict)
    session.add(record)
    await session.commit()
    await session.refresh(record)

    return create_response(
        path=request.url.path,
        data=record.model_dump(),
        success=True,
    )


@router.get("/all", response_model=APIResponse)
async def list_all_work_experience_records(
    request: Request,
    skip: int = 0,
    limit: int = 10,
    session: AsyncSession = Depends(get_db),
):
    """Get all work experience records."""
    service = WorkExperienceService(session)
    records = await service.get_all(skip=skip, limit=limit)
    total_records = await service.count_all()

    return create_response(
        path=request.url.path,
        data=[record.model_dump() for record in records],
        meta=build_pagination_meta(skip=skip, limit=limit, total_records=total_records),
        success=True,
    )


@router.get("/{employee_no}", response_model=APIResponse)
async def get_work_experience(
    request: Request,
    employee_no: str,
    session: AsyncSession = Depends(get_db),
):
    """Get all work experience records for an employee."""
    service = WorkExperienceService(session)
    records = await service.get_by_employee_no(employee_no)

    return create_response(
        path=request.url.path,
        data=[record.model_dump() for record in records],
        success=True,
    )


@router.get("/{employee_no}/government-only", response_model=APIResponse)
async def get_government_work_experience(
    request: Request,
    employee_no: str,
    session: AsyncSession = Depends(get_db),
):
    """Get only government service work experience for an employee."""
    employee_service = EmployeeService(session)
    basic_information_id = await employee_service.get_basic_information_id_by_employee_no(employee_no)

    if not basic_information_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee or basic information not found",
        )

    service = WorkExperienceService(session)
    records = await service.get_only_government_service(basic_information_id)

    return create_response(
        path=request.url.path,
        data=[record.model_dump() for record in records],
        success=True,
    )


@router.get("/{employee_no}/{experience_id}", response_model=APIResponse)
async def get_work_experience_detail(
    request: Request,
    employee_no: str,
    experience_id: str,
    session: AsyncSession = Depends(get_db),
):
    """Get a specific work experience record for an employee."""
    service = WorkExperienceService(session)
    record = await service.get(experience_id)

    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Work experience not found",
        )

    # Verify it belongs to employee
    employee_service = EmployeeService(session)
    basic_information_id = await employee_service.get_basic_information_id_by_employee_no(employee_no)

    if not basic_information_id or record.basic_information_id != basic_information_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Work experience not found for this employee",
        )

    return create_response(
        path=request.url.path,
        data=record.model_dump(),
        success=True,
    )


@router.patch("/{employee_no}/{experience_id}", response_model=APIResponse)
async def update_work_experience(
    request: Request,
    employee_no: str,
    experience_id: str,
    data: WorkExperienceUpdate,
    session: AsyncSession = Depends(get_db),
):
    """Update a work experience record for an employee."""
    service = WorkExperienceService(session)
    record = await service.get(experience_id)

    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Work experience not found",
        )

    # Verify it belongs to employee
    employee_service = EmployeeService(session)
    basic_information_id = await employee_service.get_basic_information_id_by_employee_no(employee_no)

    if not basic_information_id or record.basic_information_id != basic_information_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Work experience not found for this employee",
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


@router.delete("/{employee_no}/{experience_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_work_experience(
    employee_no: str,
    experience_id: str,
    session: AsyncSession = Depends(get_db),
):
    """Soft delete a work experience record for an employee."""
    service = WorkExperienceService(session)
    record = await service.get(experience_id)

    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Work experience not found",
        )

    # Verify it belongs to employee
    employee_service = EmployeeService(session)
    basic_information_id = await employee_service.get_basic_information_id_by_employee_no(employee_no)

    if not basic_information_id or record.basic_information_id != basic_information_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Work experience not found for this employee",
        )

    success = await service.remove(experience_id)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Work experience not found",
        )


@router.post("/{employee_no}/{experience_id}/restore", response_model=APIResponse)
async def restore_work_experience(
    request: Request,
    employee_no: str,
    experience_id: str,
    session: AsyncSession = Depends(get_db),
):
    """Restore a soft deleted work experience record for an employee."""
    service = WorkExperienceService(session)
    record = await service.get(experience_id)

    if not record or not record.is_deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Work experience not found or not deleted",
        )

    success = await service.restore(experience_id)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Failed to restore work experience",
        )

    restored = await service.get(experience_id)
    return create_response(
        path=request.url.path,
        data=restored.model_dump() if restored else None,
        success=True,
    )
