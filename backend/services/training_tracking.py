"""Services for training tracking entities."""
from datetime import datetime

from sqlalchemy import and_, or_, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from models.employees import Employee
from models.personal_information import BasicInformation
from models.training_tracking import TrainingEvent, TrainingEventParticipant
from services.base import BaseService


class TrainingEventService(BaseService[TrainingEvent]):
    """Service for managing training events."""

    def __init__(self, session: AsyncSession):
        super().__init__(TrainingEvent, session)

    async def list_events(
        self,
        skip: int = 0,
        limit: int = 100,
        status: str | None = None,
        training_type: str | None = None,
        search: str | None = None,
    ) -> list[TrainingEvent]:
        """List training events with optional filters."""
        stmt = select(TrainingEvent).where(TrainingEvent.is_deleted.is_(False))

        if status:
            stmt = stmt.where(TrainingEvent.status == status)

        if training_type:
            stmt = stmt.where(TrainingEvent.training_type == training_type)

        if search:
            keyword = f"%{search.strip()}%"
            stmt = stmt.where(
                or_(
                    TrainingEvent.training_title.ilike(keyword),
                    TrainingEvent.conducted_by.ilike(keyword),
                    TrainingEvent.venue.ilike(keyword),
                )
            )

        stmt = stmt.order_by(TrainingEvent.date_from.desc(), TrainingEvent.created_at.desc()).offset(skip).limit(limit)
        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def sync_completed_event_to_pds(self, event_id: str) -> int:
        """Synchronize a completed training event to the participants' PDS history.
        
        Returns the number of PDS records created.
        """
        from models.professional_background import TrainingRecord
        
        # 1. Get the event
        event = await self.get(event_id)
        if not event or event.status != "Completed":
            return 0
            
        # 2. Get all participants with their basic information ID
        stmt = (
            select(Employee.id, BasicInformation.id.label("basic_info_id"))
            .join(TrainingEventParticipant, TrainingEventParticipant.employee_id == Employee.id)
            .join(BasicInformation, BasicInformation.employee_id == Employee.id)
            .where(
                and_(
                    TrainingEventParticipant.training_event_id == event_id,
                    TrainingEventParticipant.is_deleted.is_(False),
                    Employee.is_deleted.is_(False),
                    BasicInformation.is_deleted.is_(False)
                )
            )
        )
        result = await self.session.execute(stmt)
        participants = result.all()
        
        created_count = 0
        for p in participants:
            # Check if record already exists to avoid duplicates
            # We check by title, date_from, and basic_info_id
            exists_stmt = select(TrainingRecord).where(
                and_(
                    TrainingRecord.basic_information_id == p.basic_info_id,
                    TrainingRecord.training_title == event.training_title,
                    TrainingRecord.date_from == event.date_from,
                    TrainingRecord.is_deleted.is_(False)
                )
            )
            exists_result = await self.session.execute(exists_stmt)
            if exists_result.scalar_one_or_none():
                continue
                
            # Create PDS record
            pds_record = TrainingRecord(
                basic_information_id=p.basic_info_id,
                training_title=event.training_title,
                training_type=event.training_type,
                conducted_by=event.conducted_by,
                venue=event.venue,
                date_from=event.date_from,
                date_to=event.date_to,
                number_of_hours=str(event.hours)
            )
            self.session.add(pds_record)
            
            # Also update the participant's completion status in the tracking system
            # Note: We are already iterating over participants fetched via TrainingEventParticipant join
            # So we can just update the participant completion status if we fetch the whole object instead of just IDs
            
            created_count += 1
            
        # Bulk update participant completion status
        update_stmt = (
            update(TrainingEventParticipant)
            .where(
                and_(
                    TrainingEventParticipant.training_event_id == event_id,
                    TrainingEventParticipant.is_deleted.is_(False)
                )
            )
            .values(completion_status="Completed", updated_at=datetime.utcnow())
        )
        await self.session.execute(update_stmt)
            
        if created_count > 0:
            await self.session.commit()
        else:
            # Still commit the completion status change if applicable
            await self.session.commit()
            
        return created_count


class TrainingEventParticipantService(BaseService[TrainingEventParticipant]):
    """Service for managing event participants."""

    def __init__(self, session: AsyncSession):
        super().__init__(TrainingEventParticipant, session)

    async def get_active_employee_ids(self, employee_ids: list[str]) -> set[str]:
        """Return the subset of employee IDs that are active."""
        ids = {employee_id for employee_id in employee_ids if employee_id}
        if not ids:
            return set()

        stmt = select(Employee.id).where(
            and_(
                Employee.id.in_(ids),
                Employee.is_deleted.is_(False),
            )
        )
        result = await self.session.execute(stmt)
        return set(result.scalars().all())

    async def get_grouped_by_event_ids(self, event_ids: list[str]) -> dict[str, list[dict]]:
        """Get participants grouped by training event IDs."""
        if not event_ids:
            return {}

        stmt = (
            select(TrainingEventParticipant, Employee, BasicInformation)
            .join(
                Employee,
                and_(
                    TrainingEventParticipant.employee_id == Employee.id,
                    Employee.is_deleted.is_(False),
                ),
            )
            .outerjoin(
                BasicInformation,
                and_(
                    BasicInformation.employee_id == Employee.id,
                    BasicInformation.is_deleted.is_(False),
                ),
            )
            .where(
                and_(
                    TrainingEventParticipant.training_event_id.in_(event_ids),
                    TrainingEventParticipant.is_deleted.is_(False),
                )
            )
            .order_by(Employee.employee_no.asc())
        )

        result = await self.session.execute(stmt)
        grouped: dict[str, list[dict]] = {}

        for participant, employee, basic_information in result.all():
            participant_row = {
                "id": participant.id,
                "training_event_id": participant.training_event_id,
                "employee_id": participant.employee_id,
                "employee_no": employee.employee_no,
                "name": self._build_employee_name(basic_information, employee.employee_no),
                "office_department": employee.office_department,
                "assignment_status": participant.assignment_status,
                "completion_status": participant.completion_status,
                "remarks": participant.remarks,
                "created_at": participant.created_at,
                "updated_at": participant.updated_at,
                "deleted_at": participant.deleted_at,
                "is_deleted": participant.is_deleted,
            }
            grouped.setdefault(participant.training_event_id, []).append(participant_row)

        return grouped

    async def add_participants(self, training_event_id: str, employee_ids: list[str]) -> list[dict]:
        """Assign participants to an event and restore deleted assignments when needed."""
        ids = sorted({employee_id for employee_id in employee_ids if employee_id})
        if not ids:
            return []

        stmt = select(TrainingEventParticipant).where(
            and_(
                TrainingEventParticipant.training_event_id == training_event_id,
                TrainingEventParticipant.employee_id.in_(ids),
            )
        )
        result = await self.session.execute(stmt)
        existing_by_employee = {row.employee_id: row for row in result.scalars().all()}

        for employee_id in ids:
            existing = existing_by_employee.get(employee_id)
            if not existing:
                self.session.add(
                    TrainingEventParticipant(
                        training_event_id=training_event_id,
                        employee_id=employee_id,
                    )
                )
                continue

            if existing.is_deleted:
                existing.is_deleted = False
                existing.deleted_at = None
                existing.updated_at = datetime.utcnow()
                self.session.add(existing)

        await self.session.commit()

        grouped = await self.get_grouped_by_event_ids([training_event_id])
        return grouped.get(training_event_id, [])

    async def soft_delete_by_event_id(self, training_event_id: str) -> None:
        """Soft delete all participants assigned to an event."""
        stmt = (
            update(TrainingEventParticipant)
            .where(
                and_(
                    TrainingEventParticipant.training_event_id == training_event_id,
                    TrainingEventParticipant.is_deleted.is_(False),
                )
            )
            .values(
                is_deleted=True,
                deleted_at=datetime.utcnow(),
            )
        )
        await self.session.execute(stmt)
        await self.session.commit()

    async def remove_participant(self, training_event_id: str, employee_id: str) -> bool:
        """Soft delete a single participant assignment."""
        stmt = select(TrainingEventParticipant).where(
            and_(
                TrainingEventParticipant.training_event_id == training_event_id,
                TrainingEventParticipant.employee_id == employee_id,
                TrainingEventParticipant.is_deleted.is_(False),
            )
        )
        result = await self.session.execute(stmt)
        record = result.scalar_one_or_none()
        if not record:
            return False

        record.is_deleted = True
        record.deleted_at = datetime.utcnow()
        record.updated_at = datetime.utcnow()
        self.session.add(record)
        await self.session.commit()
        return True

    @staticmethod
    def _build_employee_name(basic_information: BasicInformation | None, employee_no: str) -> str:
        if basic_information:
            middle = f" {basic_information.middle_name}" if basic_information.middle_name else ""
            return f"{basic_information.surname}, {basic_information.first_name}{middle}".strip()
        return employee_no
