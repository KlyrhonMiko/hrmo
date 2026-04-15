"""Router for Family Details endpoints."""
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from models.personal_background import FamilyDetail
from schemas.personal_background import (
    FamilyDetailCreate,
    FamilyDetailUpdate,
)
from services.personal_background import FamilyDetailService
from services.employees import EmployeeService
from utils.response import APIResponse, create_response

router = APIRouter(prefix="/api/family-details", tags=["Family Details"])


@router.post("/{employee_no}", response_model=APIResponse, status_code=status.HTTP_201_CREATED)
async def create_family_detail(
    request: Request,
    employee_no: str,
    data: FamilyDetailCreate,
    session: AsyncSession = Depends(get_db),
):
    """Create a new family detail for an employee."""
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

    record = FamilyDetail(**data_dict)
    session.add(record)
    await session.commit()
    await session.refresh(record)

    return create_response(
        path=request.url.path,
        data=record.model_dump(),
        success=True,
    )


@router.get("/{employee_no}", response_model=APIResponse)
async def get_family_details(
    request: Request,
    employee_no: str,
    session: AsyncSession = Depends(get_db),
):
    """Get all family details for an employee."""
    service = FamilyDetailService(session)
    records = await service.get_by_employee_no(employee_no)

    return create_response(
        path=request.url.path,
        data=[record.model_dump() for record in records],
        success=True,
    )


@router.get("/{employee_no}/{family_detail_id}", response_model=APIResponse)
async def get_family_detail(
    request: Request,
    employee_no: str,
    family_detail_id: str,
    session: AsyncSession = Depends(get_db),
):
    """Get a specific family detail for an employee."""
    service = FamilyDetailService(session)
    record = await service.get(family_detail_id)

    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Family detail not found",
        )

    # Verify family detail belongs to employee
    employee_service = EmployeeService(session)
    employee = await employee_service.get_by_employee_no(employee_no)

    if not employee or record.basic_information_id != employee.basic_information.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Family detail not found for this employee",
        )

    return create_response(
        path=request.url.path,
        data=record.model_dump(),
        success=True,
    )


@router.patch("/{employee_no}/{family_detail_id}", response_model=APIResponse)
async def update_family_detail(
    request: Request,
    employee_no: str,
    family_detail_id: str,
    data: FamilyDetailUpdate,
    session: AsyncSession = Depends(get_db),
):
    """Update a family detail for an employee."""
    service = FamilyDetailService(session)
    record = await service.get(family_detail_id)

    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Family detail not found",
        )

    # Verify family detail belongs to employee
    employee_service = EmployeeService(session)
    employee = await employee_service.get_by_employee_no(employee_no)

    if not employee or record.basic_information_id != employee.basic_information.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Family detail not found for this employee",
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


@router.delete("/{employee_no}/{family_detail_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_family_detail(
    employee_no: str,
    family_detail_id: str,
    session: AsyncSession = Depends(get_db),
):
    """Soft delete a family detail for an employee."""
    service = FamilyDetailService(session)
    record = await service.get(family_detail_id)

    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Family detail not found",
        )

    # Verify family detail belongs to employee
    employee_service = EmployeeService(session)
    employee = await employee_service.get_by_employee_no(employee_no)

    if not employee or record.basic_information_id != employee.basic_information_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Family detail not found for this employee",
        )

    success = await service.remove(family_detail_id)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Family detail not found",
        )


@router.post("/{employee_no}/{family_detail_id}/restore", response_model=APIResponse)
async def restore_family_detail(
    request: Request,
    employee_no: str,
    family_detail_id: str,
    session: AsyncSession = Depends(get_db),
):
    """Restore a soft deleted family detail for an employee."""
    service = FamilyDetailService(session)
    record = await service.get(family_detail_id)

    if not record or not record.is_deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Family detail not found or not deleted",
        )

    success = await service.restore(family_detail_id)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Failed to restore family detail",
        )

    restored = await service.get(family_detail_id)
    return create_response(
        path=request.url.path,
        data=restored.model_dump(),
        success=True,
    )
