"""Router for Contact Information endpoints."""
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from models.personal_information import ContactInformation
from schemas.personal_information import (
    ContactInformationCreate,
    ContactInformationUpdate,
)
from services.personal_information import ContactInformationService
from services.employees import EmployeeService
from utils.response import APIResponse, create_response

router = APIRouter(prefix="/api/contact-information", tags=["Contact Information"])


@router.post("/{employee_no}", response_model=APIResponse, status_code=status.HTTP_201_CREATED)
async def create_contact_information(
    request: Request,
    employee_no: str,
    data: ContactInformationCreate,
    session: AsyncSession = Depends(get_db),
):
    """Create contact information for an employee."""
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
    
    record = ContactInformation(**data_dict)
    session.add(record)
    await session.commit()
    await session.refresh(record)
    
    return create_response(
        path=request.url.path,
        data=record.model_dump(),
        success=True,
    )


@router.get("/all", response_model=APIResponse)
async def list_all_contact_information(
    request: Request,
    skip: int = 0,
    limit: int = 100,
    session: AsyncSession = Depends(get_db),
):
    """Get all contact information records."""
    service = ContactInformationService(session)
    records = await service.get_all(skip=skip, limit=limit)

    return create_response(
        path=request.url.path,
        data=[record.model_dump() for record in records],
        success=True,
    )


@router.get("/{employee_no}", response_model=APIResponse)
async def get_contact_information(
    request: Request,
    employee_no: str,
    session: AsyncSession = Depends(get_db),
):
    """Get contact information for an employee."""
    service = ContactInformationService(session)
    record = await service.get_by_employee_no(employee_no)
    
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contact information not found",
        )
    
    return create_response(
        path=request.url.path,
        data=record.model_dump(),
        success=True,
    )


@router.patch("/{employee_no}", response_model=APIResponse)
async def update_contact_information(
    request: Request,
    employee_no: str,
    data: ContactInformationUpdate,
    session: AsyncSession = Depends(get_db),
):
    """Update contact information for an employee."""
    service = ContactInformationService(session)
    record = await service.get_by_employee_no(employee_no)
    
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contact information not found",
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
async def delete_contact_information(
    employee_no: str,
    session: AsyncSession = Depends(get_db),
):
    """Soft delete contact information for an employee."""
    service = ContactInformationService(session)
    record = await service.get_by_employee_no(employee_no)
    
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contact information not found",
        )
    
    success = await service.remove(record.id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contact information not found",
        )


@router.post("/{employee_no}/restore", response_model=APIResponse)
async def restore_contact_information(
    request: Request,
    employee_no: str,
    session: AsyncSession = Depends(get_db),
):
    """Restore a soft deleted contact information record."""
    service = ContactInformationService(session)
    record = await service.get_by_employee_no(employee_no)
    
    if not record or not record.is_deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contact information not found or not deleted",
        )
    
    success = await service.restore(record.id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Failed to restore contact information",
        )
    
    restored = await service.get_by_employee_no(employee_no)
    return create_response(
        path=request.url.path,
        data=restored.model_dump(),
        success=True,
    )
