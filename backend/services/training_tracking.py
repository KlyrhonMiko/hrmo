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
        stmt = select(TrainingEvent).where(TrainingEvent.is_deleted == False)

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
                Employee.is_deleted == False,
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
                    Employee.is_deleted == False,
                ),
            )
            .outerjoin(
                BasicInformation,
                and_(
                    BasicInformation.employee_id == Employee.id,
                    BasicInformation.is_deleted == False,
                ),
            )
            .where(
                and_(
                    TrainingEventParticipant.training_event_id.in_(event_ids),
                    TrainingEventParticipant.is_deleted == False,
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
                    TrainingEventParticipant.is_deleted == False,
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
                TrainingEventParticipant.is_deleted == False,
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
