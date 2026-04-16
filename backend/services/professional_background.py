"""Professional Background Services."""
from typing import Optional

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession

from models.employees import Employee
from models.personal_information import BasicInformation
from models.professional_background import (
    WorkExperienceRecord,
    VoluntaryRecord,
    TrainingRecord,
    CivilServiceEligibility,
)
from services.base import BaseService


async def _get_basic_information_id_by_employee_no(
    session: AsyncSession,
    employee_no: str,
) -> Optional[str]:
    """Resolve basic information ID from employee number without lazy-loading relationships."""
    stmt = (
        select(BasicInformation.id)
        .join(Employee, BasicInformation.employee_id == Employee.id)
        .where(
            and_(
                Employee.employee_no == employee_no,
                Employee.is_deleted.is_(False),
                BasicInformation.is_deleted.is_(False),
            )
        )
    )
    result = await session.execute(stmt)
    return result.scalar_one_or_none()


class WorkExperienceService(BaseService[WorkExperienceRecord]):
    """Service for managing work experience records."""

    def __init__(self, session: AsyncSession):
        super().__init__(WorkExperienceRecord, session)

    async def _get_basic_information_id(self, employee_no: str) -> Optional[str]:
        """Helper to get basic_information_id from employee_no."""
        return await _get_basic_information_id_by_employee_no(self.session, employee_no)

    async def get_by_employee_no(self, employee_no: str) -> list[WorkExperienceRecord]:
        """Get all work experience records by employee number."""
        basic_info_id = await self._get_basic_information_id(employee_no)
        if not basic_info_id:
            return []

        return await self.get_by_basic_information(basic_info_id)

    async def get_by_basic_information(self, basic_information_id: str) -> list[WorkExperienceRecord]:
        """Get all work experience records for a basic information record."""
        stmt = (
            select(WorkExperienceRecord)
            .where(
                and_(
                    WorkExperienceRecord.basic_information_id == basic_information_id,
                    WorkExperienceRecord.is_deleted.is_(False),
                )
            )
            .order_by(WorkExperienceRecord.date_from.desc())
        )
        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def get_only_government_service(self, basic_information_id: str) -> list[WorkExperienceRecord]:
        """Get only government service work experience records."""
        stmt = (
            select(WorkExperienceRecord)
            .where(
                and_(
                    WorkExperienceRecord.basic_information_id == basic_information_id,
                    WorkExperienceRecord.government_service.is_(True),
                    WorkExperienceRecord.is_deleted.is_(False),
                )
            )
            .order_by(WorkExperienceRecord.date_from.desc())
        )
        result = await self.session.execute(stmt)
        return result.scalars().all()


class VoluntaryWorkService(BaseService[VoluntaryRecord]):
    """Service for managing voluntary work records."""

    def __init__(self, session: AsyncSession):
        super().__init__(VoluntaryRecord, session)

    async def _get_basic_information_id(self, employee_no: str) -> Optional[str]:
        """Helper to get basic_information_id from employee_no."""
        return await _get_basic_information_id_by_employee_no(self.session, employee_no)

    async def get_by_employee_no(self, employee_no: str) -> list[VoluntaryRecord]:
        """Get all voluntary work records by employee number."""
        basic_info_id = await self._get_basic_information_id(employee_no)
        if not basic_info_id:
            return []

        return await self.get_by_basic_information(basic_info_id)

    async def get_by_basic_information(self, basic_information_id: str) -> list[VoluntaryRecord]:
        """Get all voluntary work records for a basic information record."""
        stmt = (
            select(VoluntaryRecord)
            .where(
                and_(
                    VoluntaryRecord.basic_information_id == basic_information_id,
                    VoluntaryRecord.is_deleted.is_(False),
                )
            )
            .order_by(VoluntaryRecord.date_from.desc())
        )
        result = await self.session.execute(stmt)
        return result.scalars().all()


class TrainingService(BaseService[TrainingRecord]):
    """Service for managing training records."""

    def __init__(self, session: AsyncSession):
        super().__init__(TrainingRecord, session)

    async def _get_basic_information_id(self, employee_no: str) -> Optional[str]:
        """Helper to get basic_information_id from employee_no."""
        return await _get_basic_information_id_by_employee_no(self.session, employee_no)

    async def get_by_employee_no(self, employee_no: str) -> list[TrainingRecord]:
        """Get all training records by employee number."""
        basic_info_id = await self._get_basic_information_id(employee_no)
        if not basic_info_id:
            return []

        return await self.get_by_basic_information(basic_info_id)

    async def get_by_basic_information(self, basic_information_id: str) -> list[TrainingRecord]:
        """Get all training records for a basic information record."""
        stmt = (
            select(TrainingRecord)
            .where(
                and_(
                    TrainingRecord.basic_information_id == basic_information_id,
                    TrainingRecord.is_deleted.is_(False),
                )
            )
            .order_by(TrainingRecord.date_from.desc())
        )
        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def get_by_type(self, basic_information_id: str, training_type: str) -> list[TrainingRecord]:
        """Get training records by type for a basic information record."""
        stmt = (
            select(TrainingRecord)
            .where(
                and_(
                    TrainingRecord.basic_information_id == basic_information_id,
                    TrainingRecord.training_type == training_type,
                    TrainingRecord.is_deleted.is_(False),
                )
            )
            .order_by(TrainingRecord.date_from.desc())
        )
        result = await self.session.execute(stmt)
        return result.scalars().all()


class CivilServiceEligibilityService(BaseService[CivilServiceEligibility]):
    """Service for managing civil service eligibility records."""

    def __init__(self, session: AsyncSession):
        super().__init__(CivilServiceEligibility, session)

    async def _get_basic_information_id(self, employee_no: str) -> Optional[str]:
        """Helper to get basic_information_id from employee_no."""
        return await _get_basic_information_id_by_employee_no(self.session, employee_no)

    async def get_by_employee_no(self, employee_no: str) -> list[CivilServiceEligibility]:
        """Get all civil service eligibility records by employee number."""
        basic_info_id = await self._get_basic_information_id(employee_no)
        if not basic_info_id:
            return []

        return await self.get_by_basic_information(basic_info_id)

    async def get_by_basic_information(self, basic_information_id: str) -> list[CivilServiceEligibility]:
        """Get all civil service eligibility records for a basic information record."""
        stmt = (
            select(CivilServiceEligibility)
            .where(
                and_(
                    CivilServiceEligibility.basic_information_id == basic_information_id,
                    CivilServiceEligibility.is_deleted.is_(False),
                )
            )
            .order_by(CivilServiceEligibility.date_of_examination.desc())
        )
        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def get_by_status(self, basic_information_id: str, career_service: str) -> list[CivilServiceEligibility]:
        """Get civil service eligibility records by career service type."""
        stmt = (
            select(CivilServiceEligibility)
            .where(
                and_(
                    CivilServiceEligibility.basic_information_id == basic_information_id,
                    CivilServiceEligibility.career_service == career_service,
                    CivilServiceEligibility.is_deleted.is_(False),
                )
            )
            .order_by(CivilServiceEligibility.date_of_examination.desc())
        )
        result = await self.session.execute(stmt)
        return result.scalars().all()
