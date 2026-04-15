"""Router for Civil Service Eligibility endpoints."""
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from models.professional_background import CivilServiceEligibility
from schemas.professional_background import (
    CivilServiceEligibilityCreate,
    CivilServiceEligibilityUpdate,
)
from services.professional_background import CivilServiceEligibilityService
from services.employees import EmployeeService
from utils.response import APIResponse, create_response

router = APIRouter(prefix="/api/civil-service-eligibility", tags=["Civil Service Eligibility"])


@router.post("/{employee_no}", response_model=APIResponse, status_code=status.HTTP_201_CREATED)
async def create_civil_service_eligibility(
    request: Request,
    employee_no: str,
    data: CivilServiceEligibilityCreate,
    session: AsyncSession = Depends(get_db),
):
    """Create a civil service eligibility record for an employee."""
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

    record = CivilServiceEligibility(**data_dict)
    session.add(record)
    await session.commit()
    await session.refresh(record)

    return create_response(
        path=request.url.path,
        data=record.model_dump(),
        success=True,
    )


@router.get("/all", response_model=APIResponse)
async def list_all_civil_service_eligibility_records(
    request: Request,
    skip: int = 0,
    limit: int = 100,
    session: AsyncSession = Depends(get_db),
):
    """Get all civil service eligibility records."""
    service = CivilServiceEligibilityService(session)
    records = await service.get_all(skip=skip, limit=limit)

    return create_response(
        path=request.url.path,
        data=[record.model_dump() for record in records],
        success=True,
    )


@router.get("/{employee_no}", response_model=APIResponse)
async def get_civil_service_eligibilities(
    request: Request,
    employee_no: str,
    session: AsyncSession = Depends(get_db),
):
    """Get all civil service eligibility records for an employee."""
    service = CivilServiceEligibilityService(session)
    records = await service.get_by_employee_no(employee_no)

    return create_response(
        path=request.url.path,
        data=[record.model_dump() for record in records],
        success=True,
    )


@router.get("/{employee_no}/service/{career_service}", response_model=APIResponse)
async def get_eligibilities_by_service(
    request: Request,
    employee_no: str,
    career_service: str,
    session: AsyncSession = Depends(get_db),
):
    """Get civil service eligibility records by career service type."""
    employee_service = EmployeeService(session)
    basic_information_id = await employee_service.get_basic_information_id_by_employee_no(employee_no)

    if not basic_information_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee or basic information not found",
        )

    service = CivilServiceEligibilityService(session)
    records = await service.get_by_status(basic_information_id, career_service)

    return create_response(
        path=request.url.path,
        data=[record.model_dump() for record in records],
        success=True,
    )


@router.get("/{employee_no}/{eligibility_id}", response_model=APIResponse)
async def get_civil_service_eligibility(
    request: Request,
    employee_no: str,
    eligibility_id: str,
    session: AsyncSession = Depends(get_db),
):
    """Get a specific civil service eligibility record for an employee."""
    service = CivilServiceEligibilityService(session)
    record = await service.get(eligibility_id)

    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Civil service eligibility not found",
        )

    # Verify it belongs to employee
    employee_service = EmployeeService(session)
    basic_information_id = await employee_service.get_basic_information_id_by_employee_no(employee_no)

    if not basic_information_id or record.basic_information_id != basic_information_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Civil service eligibility not found for this employee",
        )

    return create_response(
        path=request.url.path,
        data=record.model_dump(),
        success=True,
    )


@router.patch("/{employee_no}/{eligibility_id}", response_model=APIResponse)
async def update_civil_service_eligibility(
    request: Request,
    employee_no: str,
    eligibility_id: str,
    data: CivilServiceEligibilityUpdate,
    session: AsyncSession = Depends(get_db),
):
    """Update a civil service eligibility record for an employee."""
    service = CivilServiceEligibilityService(session)
    record = await service.get(eligibility_id)

    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Civil service eligibility not found",
        )

    # Verify it belongs to employee
    employee_service = EmployeeService(session)
    basic_information_id = await employee_service.get_basic_information_id_by_employee_no(employee_no)

    if not basic_information_id or record.basic_information_id != basic_information_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Civil service eligibility not found for this employee",
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


@router.delete("/{employee_no}/{eligibility_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_civil_service_eligibility(
    employee_no: str,
    eligibility_id: str,
    session: AsyncSession = Depends(get_db),
):
    """Soft delete a civil service eligibility record for an employee."""
    service = CivilServiceEligibilityService(session)
    record = await service.get(eligibility_id)

    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Civil service eligibility not found",
        )

    # Verify it belongs to employee
    employee_service = EmployeeService(session)
    basic_information_id = await employee_service.get_basic_information_id_by_employee_no(employee_no)

    if not basic_information_id or record.basic_information_id != basic_information_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Civil service eligibility not found for this employee",
        )

    success = await service.remove(eligibility_id)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Civil service eligibility not found",
        )


@router.post("/{employee_no}/{eligibility_id}/restore", response_model=APIResponse)
async def restore_civil_service_eligibility(
    request: Request,
    employee_no: str,
    eligibility_id: str,
    session: AsyncSession = Depends(get_db),
):
    """Restore a soft deleted civil service eligibility record for an employee."""
    service = CivilServiceEligibilityService(session)
    record = await service.get(eligibility_id)

    if not record or not record.is_deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Civil service eligibility not found or not deleted",
        )

    success = await service.restore(eligibility_id)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Failed to restore civil service eligibility",
        )

    restored = await service.get(eligibility_id)
    return create_response(
        path=request.url.path,
        data=restored.model_dump() if restored else None,
        success=True,
    )
