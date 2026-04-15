"""Router for Educational Background endpoints."""
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from models.personal_background import EducationalBackground
from schemas.personal_background import (
    EducationalBackgroundCreate,
    EducationalBackgroundUpdate,
)
from services.personal_background import EducationalBackgroundService
from services.employees import EmployeeService
from utils.response import APIResponse, create_response

router = APIRouter(prefix="/api/educational-backgrounds", tags=["Educational Backgrounds"])


@router.post("/{employee_no}", response_model=APIResponse, status_code=status.HTTP_201_CREATED)
async def create_educational_background(
    request: Request,
    employee_no: str,
    data: EducationalBackgroundCreate,
    session: AsyncSession = Depends(get_db),
):
    """Create a new educational background for an employee."""
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

    record = EducationalBackground(**data_dict)
    session.add(record)
    await session.commit()
    await session.refresh(record)

    return create_response(
        path=request.url.path,
        data=record.model_dump(),
        success=True,
    )


@router.get("/{employee_no}", response_model=APIResponse)
async def get_educational_backgrounds(
    request: Request,
    employee_no: str,
    session: AsyncSession = Depends(get_db),
):
    """Get all educational backgrounds for an employee."""
    service = EducationalBackgroundService(session)
    records = await service.get_by_employee_no(employee_no)

    return create_response(
        path=request.url.path,
        data=[record.model_dump() for record in records],
        success=True,
    )


@router.get("/{employee_no}/{education_id}", response_model=APIResponse)
async def get_educational_background(
    request: Request,
    employee_no: str,
    education_id: str,
    session: AsyncSession = Depends(get_db),
):
    """Get a specific educational background for an employee."""
    service = EducationalBackgroundService(session)
    record = await service.get(education_id)

    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Educational background not found",
        )

    # Verify it belongs to employee
    employee_service = EmployeeService(session)
    employee = await employee_service.get_by_employee_no(employee_no)

    if not employee or record.basic_information_id != employee.basic_information.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Educational background not found for this employee",
        )

    return create_response(
        path=request.url.path,
        data=record.model_dump(),
        success=True,
    )


@router.patch("/{employee_no}/{education_id}", response_model=APIResponse)
async def update_educational_background(
    request: Request,
    employee_no: str,
    education_id: str,
    data: EducationalBackgroundUpdate,
    session: AsyncSession = Depends(get_db),
):
    """Update an educational background for an employee."""
    service = EducationalBackgroundService(session)
    record = await service.get(education_id)

    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Educational background not found",
        )

    # Verify it belongs to employee
    employee_service = EmployeeService(session)
    employee = await employee_service.get_by_employee_no(employee_no)

    if not employee or record.basic_information_id != employee.basic_information.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Educational background not found for this employee",
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


@router.delete("/{employee_no}/{education_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_educational_background(
    employee_no: str,
    education_id: str,
    session: AsyncSession = Depends(get_db),
):
    """Soft delete an educational background for an employee."""
    service = EducationalBackgroundService(session)
    record = await service.get(education_id)

    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Educational background not found",
        )

    # Verify it belongs to employee
    employee_service = EmployeeService(session)
    employee = await employee_service.get_by_employee_no(employee_no)

    if not employee or record.basic_information_id != employee.basic_information_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Educational background not found for this employee",
        )

    success = await service.remove(education_id)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Educational background not found",
        )


@router.post("/{employee_no}/{education_id}/restore", response_model=APIResponse)
async def restore_educational_background(
    request: Request,
    employee_no: str,
    education_id: str,
    session: AsyncSession = Depends(get_db),
):
    """Restore a soft deleted educational background for an employee."""
    service = EducationalBackgroundService(session)
    record = await service.get(education_id)

    if not record or not record.is_deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Educational background not found or not deleted",
        )

    success = await service.restore(education_id)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Failed to restore educational background",
        )

    restored = await service.get(education_id)
    return create_response(
        path=request.url.path,
        data=restored.model_dump(),
        success=True,
    )
