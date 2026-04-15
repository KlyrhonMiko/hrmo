"""Router for training tracking endpoints."""
from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from models.training_tracking import TrainingEvent
from schemas.training_tracking import (
    TrainingEventCreate,
    TrainingEventParticipantAssignRequest,
    TrainingEventUpdate,
)
from services.training_tracking import TrainingEventParticipantService, TrainingEventService
from utils.response import APIResponse, build_pagination_meta, create_response

router = APIRouter(prefix="/api/training-tracking", tags=["Training Tracking"])


def _serialize_event(training_event: TrainingEvent, participants: list[dict]) -> dict:
    payload = training_event.model_dump()
    payload["participants"] = participants
    payload["participant_count"] = len(participants)
    return payload


@router.post("/events", response_model=APIResponse, status_code=status.HTTP_201_CREATED)
async def create_training_event(
    request: Request,
    data: TrainingEventCreate,
    session: AsyncSession = Depends(get_db),
):
    """Create a training event with optional participant assignments."""
    if data.date_to < data.date_from:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="date_to must be on or after date_from",
        )

    event_service = TrainingEventService(session)
    participant_service = TrainingEventParticipantService(session)

    participant_ids = sorted(set(data.participant_employee_ids))
    active_employee_ids = await participant_service.get_active_employee_ids(participant_ids)
    invalid_employee_ids = sorted(set(participant_ids) - active_employee_ids)
    if invalid_employee_ids:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid employee IDs: {', '.join(invalid_employee_ids)}",
        )

    record = TrainingEvent(
        **data.model_dump(exclude={"participant_employee_ids"})
    )
    session.add(record)
    await session.commit()
    await session.refresh(record)

    participants = await participant_service.add_participants(record.id, list(active_employee_ids))

    return create_response(
        path=request.url.path,
        data=_serialize_event(record, participants),
        success=True,
    )


@router.get("/events", response_model=APIResponse)
async def list_training_events(
    request: Request,
    skip: int = 0,
    limit: int = 50,
    status: str | None = Query(default=None),
    training_type: str | None = Query(default=None),
    search: str | None = Query(default=None),
    session: AsyncSession = Depends(get_db),
):
    """List training tracking events with participants."""
    event_service = TrainingEventService(session)
    participant_service = TrainingEventParticipantService(session)

    events = await event_service.list_events(
        skip=skip,
        limit=limit,
        status=status,
        training_type=training_type,
        search=search,
    )
    total_records = await event_service.count_all()
    participants_by_event = await participant_service.get_grouped_by_event_ids([event.id for event in events])

    return create_response(
        path=request.url.path,
        data=[
            _serialize_event(event, participants_by_event.get(event.id, []))
            for event in events
        ],
        meta=build_pagination_meta(skip=skip, limit=limit, total_records=total_records),
        success=True,
    )


@router.get("/events/{event_id}", response_model=APIResponse)
async def get_training_event(
    request: Request,
    event_id: str,
    session: AsyncSession = Depends(get_db),
):
    """Get one training event with participants."""
    event_service = TrainingEventService(session)
    participant_service = TrainingEventParticipantService(session)

    event = await event_service.get(event_id)
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Training event not found",
        )

    participants_by_event = await participant_service.get_grouped_by_event_ids([event.id])

    return create_response(
        path=request.url.path,
        data=_serialize_event(event, participants_by_event.get(event.id, [])),
        success=True,
    )


@router.patch("/events/{event_id}", response_model=APIResponse)
async def update_training_event(
    request: Request,
    event_id: str,
    data: TrainingEventUpdate,
    session: AsyncSession = Depends(get_db),
):
    """Update a training event."""
    event_service = TrainingEventService(session)
    participant_service = TrainingEventParticipantService(session)

    event = await event_service.get(event_id)
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Training event not found",
        )

    update_data = data.model_dump(exclude_unset=True)
    next_date_from = update_data.get("date_from", event.date_from)
    next_date_to = update_data.get("date_to", event.date_to)

    if next_date_to < next_date_from:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="date_to must be on or after date_from",
        )

    for field, value in update_data.items():
        setattr(event, field, value)

    session.add(event)
    await session.commit()
    await session.refresh(event)

    participants_by_event = await participant_service.get_grouped_by_event_ids([event.id])

    return create_response(
        path=request.url.path,
        data=_serialize_event(event, participants_by_event.get(event.id, [])),
        success=True,
    )


@router.delete("/events/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_training_event(
    event_id: str,
    session: AsyncSession = Depends(get_db),
):
    """Soft delete a training event and all its participant assignments."""
    event_service = TrainingEventService(session)
    participant_service = TrainingEventParticipantService(session)

    success = await event_service.remove(event_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Training event not found",
        )

    await participant_service.soft_delete_by_event_id(event_id)


@router.post("/events/{event_id}/participants", response_model=APIResponse)
async def assign_participants(
    request: Request,
    event_id: str,
    data: TrainingEventParticipantAssignRequest,
    session: AsyncSession = Depends(get_db),
):
    """Assign additional participants to a training event."""
    event_service = TrainingEventService(session)
    participant_service = TrainingEventParticipantService(session)

    event = await event_service.get(event_id)
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Training event not found",
        )

    active_employee_ids = await participant_service.get_active_employee_ids(data.employee_ids)
    invalid_employee_ids = sorted(set(data.employee_ids) - active_employee_ids)
    if invalid_employee_ids:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid employee IDs: {', '.join(invalid_employee_ids)}",
        )

    participants = await participant_service.add_participants(event_id, list(active_employee_ids))

    return create_response(
        path=request.url.path,
        data=participants,
        success=True,
    )


@router.delete("/events/{event_id}/participants/{employee_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_participant(
    event_id: str,
    employee_id: str,
    session: AsyncSession = Depends(get_db),
):
    """Remove an assigned participant from a training event."""
    event_service = TrainingEventService(session)
    participant_service = TrainingEventParticipantService(session)

    event = await event_service.get(event_id)
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Training event not found",
        )

    success = await participant_service.remove_participant(event_id, employee_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Participant assignment not found",
        )
