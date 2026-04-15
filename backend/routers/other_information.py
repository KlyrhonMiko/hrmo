"""Router for Other Information endpoints."""
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from models.personal_background import OtherInformation
from schemas.personal_background import (
    OtherInformationCreate,
    OtherInformationUpdate,
)
from services.personal_background import OtherInformationService
from services.employees import EmployeeService
from utils.response import APIResponse, build_pagination_meta, create_response

router = APIRouter(prefix="/api/other-information", tags=["Other Information"])


@router.post("/{employee_no}", response_model=APIResponse, status_code=status.HTTP_201_CREATED)
async def create_other_information(
    request: Request,
    employee_no: str,
    data: OtherInformationCreate,
    session: AsyncSession = Depends(get_db),
):
    """Create other information for an employee."""
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

    record = OtherInformation(**data_dict)
    session.add(record)
    await session.commit()
    await session.refresh(record)

    return create_response(
        path=request.url.path,
        data=record.model_dump(),
        success=True,
    )


@router.get("/all", response_model=APIResponse)
async def list_all_other_information(
    request: Request,
    skip: int = 0,
    limit: int = 10,
    session: AsyncSession = Depends(get_db),
):
    """Get all other information records."""
    service = OtherInformationService(session)
    records = await service.get_all(skip=skip, limit=limit)
    total_records = await service.count_all()

    return create_response(
        path=request.url.path,
        data=[record.model_dump() for record in records],
        meta=build_pagination_meta(skip=skip, limit=limit, total_records=total_records),
        success=True,
    )


@router.get("/{employee_no}", response_model=APIResponse)
async def get_other_information(
    request: Request,
    employee_no: str,
    session: AsyncSession = Depends(get_db),
):
    """Get all other information for an employee."""
    service = OtherInformationService(session)
    records = await service.get_by_employee_no(employee_no)

    return create_response(
        path=request.url.path,
        data=[record.model_dump() for record in records],
        success=True,
    )


@router.get("/{employee_no}/type/{info_type}", response_model=APIResponse)
async def get_other_information_by_type(
    request: Request,
    employee_no: str,
    info_type: str,
    session: AsyncSession = Depends(get_db),
):
    """Get other information by type for an employee."""
    employee_service = EmployeeService(session)
    basic_information_id = await employee_service.get_basic_information_id_by_employee_no(employee_no)

    if not basic_information_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee or basic information not found",
        )

    service = OtherInformationService(session)
    records = await service.get_by_type(basic_information_id, info_type)

    return create_response(
        path=request.url.path,
        data=[record.model_dump() for record in records],
        success=True,
    )


@router.get("/{employee_no}/{info_id}", response_model=APIResponse)
async def get_other_information_detail(
    request: Request,
    employee_no: str,
    info_id: str,
    session: AsyncSession = Depends(get_db),
):
    """Get a specific other information detail for an employee."""
    service = OtherInformationService(session)
    record = await service.get(info_id)

    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Other information not found",
        )

    # Verify it belongs to employee
    employee_service = EmployeeService(session)
    basic_information_id = await employee_service.get_basic_information_id_by_employee_no(employee_no)

    if not basic_information_id or record.basic_information_id != basic_information_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Other information not found for this employee",
        )

    return create_response(
        path=request.url.path,
        data=record.model_dump(),
        success=True,
    )


@router.patch("/{employee_no}/{info_id}", response_model=APIResponse)
async def update_other_information(
    request: Request,
    employee_no: str,
    info_id: str,
    data: OtherInformationUpdate,
    session: AsyncSession = Depends(get_db),
):
    """Update other information for an employee."""
    service = OtherInformationService(session)
    record = await service.get(info_id)

    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Other information not found",
        )

    # Verify it belongs to employee
    employee_service = EmployeeService(session)
    basic_information_id = await employee_service.get_basic_information_id_by_employee_no(employee_no)

    if not basic_information_id or record.basic_information_id != basic_information_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Other information not found for this employee",
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


@router.delete("/{employee_no}/{info_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_other_information(
    employee_no: str,
    info_id: str,
    session: AsyncSession = Depends(get_db),
):
    """Soft delete other information for an employee."""
    service = OtherInformationService(session)
    record = await service.get(info_id)

    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Other information not found",
        )

    # Verify it belongs to employee
    employee_service = EmployeeService(session)
    basic_information_id = await employee_service.get_basic_information_id_by_employee_no(employee_no)

    if not basic_information_id or record.basic_information_id != basic_information_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Other information not found for this employee",
        )

    success = await service.remove(info_id)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Other information not found",
        )


@router.post("/{employee_no}/{info_id}/restore", response_model=APIResponse)
async def restore_other_information(
    request: Request,
    employee_no: str,
    info_id: str,
    session: AsyncSession = Depends(get_db),
):
    """Restore a soft deleted other information for an employee."""
    service = OtherInformationService(session)
    record = await service.get(info_id)

    if not record or not record.is_deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Other information not found or not deleted",
        )

    success = await service.restore(info_id)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Failed to restore other information",
        )

    restored = await service.get(info_id)
    return create_response(
        path=request.url.path,
        data=restored.model_dump(),
        success=True,
    )
