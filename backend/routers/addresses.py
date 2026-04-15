"""Router for Addresses endpoints."""
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from models.personal_information import Address
from schemas.personal_information import (
    AddressCreate,
    AddressUpdate,
)
from services.personal_information import AddressService
from services.employees import EmployeeService
from utils.response import APIResponse, create_response

router = APIRouter(prefix="/api/addresses", tags=["Addresses"])


@router.post("/{employee_no}", response_model=APIResponse, status_code=status.HTTP_201_CREATED)
async def create_address(
    request: Request,
    employee_no: str,
    data: AddressCreate,
    session: AsyncSession = Depends(get_db),
):
    """Create a new address for an employee."""
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
    
    record = Address(**data_dict)
    session.add(record)
    await session.commit()
    await session.refresh(record)
    
    return create_response(
        path=request.url.path,
        data=record.model_dump(),
        success=True,
    )


@router.get("/all", response_model=APIResponse)
async def list_all_addresses(
    request: Request,
    skip: int = 0,
    limit: int = 100,
    session: AsyncSession = Depends(get_db),
):
    """Get all address records."""
    service = AddressService(session)
    records = await service.get_all(skip=skip, limit=limit)

    return create_response(
        path=request.url.path,
        data=[record.model_dump() for record in records],
        success=True,
    )


@router.get("/{employee_no}", response_model=APIResponse)
async def get_addresses(
    request: Request,
    employee_no: str,
    session: AsyncSession = Depends(get_db),
):
    """Get all addresses for an employee."""
    service = AddressService(session)
    records = await service.get_by_employee_no(employee_no)
    
    return create_response(
        path=request.url.path,
        data=[record.model_dump() for record in records],
        success=True,
    )


@router.get("/{employee_no}/{address_type}", response_model=APIResponse)
async def get_address_by_type(
    request: Request,
    employee_no: str,
    address_type: str,
    session: AsyncSession = Depends(get_db),
):
    """Get a specific address by type for an employee."""
    service = AddressService(session)
    record = await service.get_by_employee_no_and_type(employee_no, address_type)
    
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Address not found",
        )
    
    return create_response(
        path=request.url.path,
        data=record.model_dump(),
        success=True,
    )


@router.patch("/{employee_no}/{address_type}", response_model=APIResponse)
async def update_address(
    request: Request,
    employee_no: str,
    address_type: str,
    data: AddressUpdate,
    session: AsyncSession = Depends(get_db),
):
    """Update an address for an employee."""
    service = AddressService(session)
    record = await service.get_by_employee_no_and_type(employee_no, address_type)
    
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Address not found",
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


@router.delete("/{employee_no}/{address_type}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_address(
    employee_no: str,
    address_type: str,
    session: AsyncSession = Depends(get_db),
):
    """Soft delete an address for an employee."""
    service = AddressService(session)
    record = await service.get_by_employee_no_and_type(employee_no, address_type)
    
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Address not found",
        )
    
    success = await service.remove(record.id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Address not found",
        )


@router.post("/{employee_no}/{address_type}/restore", response_model=APIResponse)
async def restore_address(
    request: Request,
    employee_no: str,
    address_type: str,
    session: AsyncSession = Depends(get_db),
):
    """Restore a soft deleted address for an employee."""
    service = AddressService(session)
    record = await service.get_by_employee_no_and_type(employee_no, address_type)
    
    if not record or not record.is_deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Address not found or not deleted",
        )
    
    success = await service.restore(record.id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Failed to restore address",
        )
    
    restored = await service.get_by_employee_no_and_type(employee_no, address_type)
    return create_response(
        path=request.url.path,
        data=restored.model_dump(),
        success=True,
    )
