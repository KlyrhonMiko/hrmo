"""Router for Training endpoints."""
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from deps.auth import get_current_user
from models.professional_background import TrainingRecord
from models.training_requests import (
    TrainingRequest,
    TrainingRequestStatus,
)
from schemas.professional_background import (
    TrainingCreate,
    TrainingUpdate,
)
from schemas.training_requests import (
    TrainingRequestCreate,
    TrainingRequestUpdate,
)
from services.professional_background import (
    TrainingService,
    TrainingRequestService,
)
from services.employees import EmployeeService
from utils.response import APIResponse, build_pagination_meta, create_response
from sqlalchemy.future import select
from sqlalchemy import func

router = APIRouter(prefix="/api/training", tags=["Training"])


# --- HR Management Endpoints ---

@router.get("/admin/requests", response_model=APIResponse)
async def list_training_requests_admin(
    request: Request,
    status: Optional[str] = None,
    session: AsyncSession = Depends(get_db),
):
    """List all training requests (for HR management)."""
    service = TrainingRequestService(session)
    records = await service.get_all_with_employees(status=status)
    return create_response(
        path=request.url.path,
        data=records,
        success=True,
    )


@router.patch("/requests/{request_id}/review", response_model=APIResponse)
async def review_training_request(
    request: Request,
    request_id: str,
    data: TrainingRequestUpdate,
    session: AsyncSession = Depends(get_db),
):
    """Approve, reject, or mark a training request as completed."""
    service = TrainingRequestService(session)
    tr_request = await service.get(request_id)
    
    if not tr_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Training request not found",
        )

    # Update the request
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(tr_request, field, value)
    
    tr_request.reviewed_at = datetime.utcnow()
    # tr_request.reviewed_by = current_user.id  # TODO: Add authentication dependency if needed
    
    session.add(tr_request)
    
    # Auto-PDS Logic: If status is set to 'completed', create a TrainingRecord
    if data.status == TrainingRequestStatus.completed:
        # Resolve basic_info_id from employee_id
        basic_info_id = await service.get_basic_info_id_by_employee_id(tr_request.employee_id)
        if basic_info_id:
            pds_record = TrainingRecord(
                basic_information_id=basic_info_id,
                training_title=tr_request.title,
                training_type=tr_request.training_type,
                conducted_by=tr_request.provider,
                venue=tr_request.venue,
                date_from=tr_request.date_from,
                date_to=tr_request.date_to,
                number_of_hours=str(tr_request.number_of_hours),
            )
            session.add(pds_record)
    
    await session.commit()
    await session.refresh(tr_request)
    
    return create_response(
        path=request.url.path,
        data=tr_request.model_dump(),
        success=True,
    )


# --- Employee-specific Endpoints ---

@router.get("/me/stats", response_model=APIResponse)
async def get_my_training_stats(
    request: Request,
    current_user=Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    """Get summarized training stats for the current employee."""
    if not current_user.employee_id:
        return create_response(path=request.url.path, data={"attended": 0, "hours": 0, "pending": 0, "approved": 0}, success=True)
    
    employee_id = current_user.employee_id
    
    # Get PDS records (attended & hours)
    employee_service = EmployeeService(session)
    employee = await employee_service.get(employee_id)
    employee_no = employee.employee_no
    service = TrainingService(session)
    records = await service.get_by_employee_no(employee_no)
    
    total_attended = len(records)
    total_hours = 0
    for r in records:
        try:
            total_hours += int(r.number_of_hours or 0)
        except (ValueError, TypeError):
            continue
    
    # Get Request counts
    pending_stmt = select(func.count(TrainingRequest.id)).where(
        TrainingRequest.employee_id == employee_id,
        TrainingRequest.status == TrainingRequestStatus.pending
    )
    approved_stmt = select(func.count(TrainingRequest.id)).where(
        TrainingRequest.employee_id == employee_id,
        TrainingRequest.status == TrainingRequestStatus.approved
    )
    
    pending_res = await session.execute(pending_stmt)
    approved_res = await session.execute(approved_stmt)
    
    pending_count = pending_res.scalar() or 0
    approved_count = approved_res.scalar() or 0
    
    return create_response(
        path=request.url.path,
        data={
            "attended": total_attended,
            "hours": total_hours,
            "pending": pending_count,
            "approved": approved_count
        },
        success=True
    )


@router.get("/me/history", response_model=APIResponse)
async def get_my_training_history(
    request: Request,
    current_user=Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    """Get training history (PDS records) for the current employee."""
    if not current_user.employee_id:
        return create_response(path=request.url.path, data=[], success=True)
    
    employee_service = EmployeeService(session)
    employee = await employee_service.get(current_user.employee_id)
    
    service = TrainingService(session)
    records = await service.get_by_employee_no(employee.employee_no)
    
    return create_response(
        path=request.url.path,
        data=[r.model_dump() for r in records],
        success=True
    )


@router.get("/me/requests", response_model=APIResponse)
async def get_my_training_requests(
    request: Request,
    current_user=Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    """Get list of training requests submitted by the current employee."""
    if not current_user.employee_id:
        return create_response(path=request.url.path, data=[], success=True)
    
    stmt = select(TrainingRequest).where(TrainingRequest.employee_id == current_user.employee_id).order_by(TrainingRequest.submitted_at.desc())
    res = await session.execute(stmt)
    requests = res.scalars().all()
    
    return create_response(
        path=request.url.path,
        data=[r.model_dump() for r in requests],
        success=True
    )


@router.post("/me/requests", response_model=APIResponse, status_code=status.HTTP_201_CREATED)
async def submit_training_request(
    request: Request,
    data: TrainingRequestCreate,
    current_user=Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    """Submit a new training request for the current employee."""
    if not current_user.employee_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User is not linked to an employee record")
    
    new_request = TrainingRequest(
        **data.model_dump(),
        employee_id=current_user.employee_id,
        status=TrainingRequestStatus.pending
    )
    
    session.add(new_request)
    await session.commit()
    await session.refresh(new_request)
    
    return create_response(
        path=request.url.path,
        data=new_request.model_dump(),
        success=True
    )


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
    limit: int = 10,
    session: AsyncSession = Depends(get_db),
):
    """Get all training records."""
    service = TrainingService(session)
    records = await service.get_all(skip=skip, limit=limit)
    total_records = await service.count_all()

    return create_response(
        path=request.url.path,
        data=[record.model_dump() for record in records],
        meta=build_pagination_meta(skip=skip, limit=limit, total_records=total_records),
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
