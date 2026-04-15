"""Router for Certificate Record endpoints."""
from fastapi import APIRouter, Depends, HTTPException, status, Request, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional

from core.database import get_db
from models.employees import CertificateRecord
from schemas.employees import (
    CertificateRecordCreate,
    CertificateRecordUpdate,
)
from services.employees import CertificateRecordService, EmployeeService
from utils.response import APIResponse, create_response
from utils.file_handler import save_certificate_file, delete_certificate_file, FileUploadError
from datetime import date

router = APIRouter(prefix="/api/certificates", tags=["Certificates"])


@router.post("/{employee_no}", response_model=APIResponse, status_code=status.HTTP_201_CREATED)
async def create_certificate(
    request: Request,
    employee_no: str,
    certificate_type: str = Form(...),
    issuing_body: str = Form(...),
    certificate_no: str = Form(...),
    date_issued: date = Form(...),
    expiry_date: Optional[date] = Form(None),
    description: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    session: AsyncSession = Depends(get_db),
):
    """Create a new certificate record for an employee with optional file upload."""
    employee_service = EmployeeService(session)
    employee = await employee_service.get_by_employee_no(employee_no)
    
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found",
        )
    
    # Handle file upload if provided
    file_path = None
    if file:
        try:
            file_path = await save_certificate_file(file, employee_no)
        except FileUploadError as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(e),
            )
    
    # Create certificate record
    record = CertificateRecord(
        employee_id=employee.id,
        certificate_type=certificate_type,
        issuing_body=issuing_body,
        certificate_no=certificate_no,
        date_issued=date_issued,
        expiry_date=expiry_date,
        description=description,
        file=file_path,
    )
    
    session.add(record)
    await session.commit()
    await session.refresh(record)
    
    return create_response(
        path=request.url.path,
        data=record.model_dump(),
        success=True,
    )


@router.get("/all", response_model=APIResponse)
async def list_all_certificates(
    request: Request,
    skip: int = 0,
    limit: int = 100,
    session: AsyncSession = Depends(get_db),
):
    """Get all certificate records."""
    service = CertificateRecordService(session)
    records = await service.get_all(skip=skip, limit=limit)

    return create_response(
        path=request.url.path,
        data=[record.model_dump() for record in records],
        success=True,
    )


@router.get("/{employee_no}", response_model=APIResponse)
async def get_certificates(
    request: Request,
    employee_no: str,
    skip: int = 0,
    limit: int = 100,
    session: AsyncSession = Depends(get_db),
):
    """Get all certificates for an employee."""
    service = CertificateRecordService(session)
    records = await service.get_by_employee_no(employee_no, skip=skip, limit=limit)
    
    return create_response(
        path=request.url.path,
        data=[record.model_dump() for record in records],
        success=True,
    )


@router.get("/{employee_no}/{certificate_id}", response_model=APIResponse)
async def get_certificate(
    request: Request,
    employee_no: str,
    certificate_id: str,
    session: AsyncSession = Depends(get_db),
):
    """Get a specific certificate for an employee."""
    service = CertificateRecordService(session)
    record = await service.get(certificate_id)
    
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Certificate not found",
        )
    
    # Verify certificate belongs to employee
    employee_service = EmployeeService(session)
    employee = await employee_service.get_by_employee_no(employee_no)
    
    if not employee or record.employee_id != employee.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Certificate not found for this employee",
        )
    
    return create_response(
        path=request.url.path,
        data=record.model_dump(),
        success=True,
    )


@router.get("/{employee_no}/type/{certificate_type}", response_model=APIResponse)
async def get_certificates_by_type(
    request: Request,
    employee_no: str,
    certificate_type: str,
    session: AsyncSession = Depends(get_db),
):
    """Get all certificates of a specific type for an employee."""
    employee_service = EmployeeService(session)
    employee = await employee_service.get_by_employee_no(employee_no)
    
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found",
        )
    
    # Get all certificates for employee, then filter by type
    service = CertificateRecordService(session)
    all_certs = await service.get_by_employee(employee.id)
    filtered = [cert for cert in all_certs if cert.certificate_type == certificate_type]
    
    return create_response(
        path=request.url.path,
        data=[cert.model_dump() for cert in filtered],
        success=True,
    )


@router.get("/{employee_no}/expiring", response_model=APIResponse)
async def get_expiring_certificates(
    request: Request,
    employee_no: str,
    days: int = 30,
    session: AsyncSession = Depends(get_db),
):
    """Get certificates expiring soon for an employee."""
    employee_service = EmployeeService(session)
    employee = await employee_service.get_by_employee_no(employee_no)
    
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found",
        )
    
    # Get all certificates for employee, then filter by expiry
    service = CertificateRecordService(session)
    all_certs = await service.get_by_employee(employee.id)
    
    from datetime import datetime, timedelta
    expiry_threshold = datetime.utcnow().date() + timedelta(days=days)
    
    expiring = [
        cert for cert in all_certs
        if cert.expiry_date and cert.expiry_date <= expiry_threshold and cert.expiry_date >= datetime.utcnow().date()
    ]
    
    return expiring


@router.patch("/{employee_no}/{certificate_id}", response_model=APIResponse)
async def update_certificate(
    request: Request,
    employee_no: str,
    certificate_id: str,
    certificate_type: Optional[str] = Form(None),
    issuing_body: Optional[str] = Form(None),
    certificate_no: Optional[str] = Form(None),
    date_issued: Optional[date] = Form(None),
    expiry_date: Optional[date] = Form(None),
    description: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    session: AsyncSession = Depends(get_db),
):
    """Update a certificate record with optional file replacement."""
    service = CertificateRecordService(session)
    record = await service.get(certificate_id)
    
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Certificate not found",
        )
    
    # Verify certificate belongs to employee
    employee_service = EmployeeService(session)
    employee = await employee_service.get_by_employee_no(employee_no)
    
    if not employee or record.employee_id != employee.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Certificate not found for this employee",
        )
    
    # Update fields if provided
    if certificate_type is not None:
        record.certificate_type = certificate_type
    if issuing_body is not None:
        record.issuing_body = issuing_body
    if certificate_no is not None:
        record.certificate_no = certificate_no
    if date_issued is not None:
        record.date_issued = date_issued
    if expiry_date is not None:
        record.expiry_date = expiry_date
    if description is not None:
        record.description = description
    
    # Handle file upload/replacement if provided
    if file:
        try:
            # Delete old file if it exists
            if record.file:
                await delete_certificate_file(record.file)
            
            # Save new file
            file_path = await save_certificate_file(file, employee_no)
            record.file = file_path
        except FileUploadError as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(e),
            )
    
    session.add(record)
    await session.commit()
    await session.refresh(record)

    return create_response(
        path=request.url.path,
        data=record.model_dump(),
        success=True,
    )


@router.delete("/{employee_no}/{certificate_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_certificate(
    employee_no: str,
    certificate_id: str,
    session: AsyncSession = Depends(get_db),
):
    """Soft delete a certificate record and remove associated file."""
    service = CertificateRecordService(session)
    record = await service.get(certificate_id)
    
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Certificate not found",
        )
    
    # Verify certificate belongs to employee
    employee_service = EmployeeService(session)
    employee = await employee_service.get_by_employee_no(employee_no)
    
    if not employee or record.employee_id != employee.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Certificate not found for this employee",
        )
    
    # Delete associated file if exists
    if record.file:
        try:
            await delete_certificate_file(record.file)
        except FileUploadError:
            # Log but don't fail the deletion if file cleanup fails
            pass
    
    success = await service.remove(certificate_id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Certificate not found",
        )


@router.post("/{employee_no}/{certificate_id}/restore", response_model=APIResponse)
async def restore_certificate(
    request: Request,
    employee_no: str,
    certificate_id: str,
    session: AsyncSession = Depends(get_db),
):
    """Restore a soft deleted certificate record."""
    service = CertificateRecordService(session)
    record = await service.get(certificate_id)
    
    if not record or not record.is_deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Certificate not found or not deleted",
        )
    
    # Verify certificate belongs to employee
    employee_service = EmployeeService(session)
    employee = await employee_service.get_by_employee_no(employee_no)
    
    if not employee or record.employee_id != employee.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Certificate not found for this employee",
        )
    
    success = await service.restore(certificate_id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Failed to restore certificate",
        )
    
    restored = await service.get(certificate_id)
    return create_response(
        path=request.url.path,
        data=restored.model_dump(),
        success=True,
    )
