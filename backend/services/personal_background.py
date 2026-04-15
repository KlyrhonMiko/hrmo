"""Personal Background Services."""
from typing import Optional

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession

from models.employees import Employee
from models.personal_information import BasicInformation
from models.personal_background import (
    FamilyDetail,
    EducationalBackground,
    OtherInformation,
    ReferenceRecord,
    PrimaryGovernmentId,
    RecordCompletion,
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
                Employee.is_deleted == False,
                BasicInformation.is_deleted == False,
            )
        )
    )
    result = await session.execute(stmt)
    return result.scalar_one_or_none()


class FamilyDetailService(BaseService[FamilyDetail]):
    """Service for managing family details."""

    def __init__(self, session: AsyncSession):
        super().__init__(FamilyDetail, session)

    async def _get_basic_information_id(self, employee_no: str) -> Optional[str]:
        """Helper to get basic_information_id from employee_no."""
        return await _get_basic_information_id_by_employee_no(self.session, employee_no)

    async def get_by_employee_no(self, employee_no: str) -> list[FamilyDetail]:
        """Get all family details by employee number."""
        basic_info_id = await self._get_basic_information_id(employee_no)
        if not basic_info_id:
            return []

        return await self.get_by_basic_information(basic_info_id)

    async def get_by_basic_information(self, basic_information_id: str) -> list[FamilyDetail]:
        """Get all family details for a basic information record."""
        stmt = (
            select(FamilyDetail)
            .where(
                and_(
                    FamilyDetail.basic_information_id == basic_information_id,
                    FamilyDetail.is_deleted == False,
                )
            )
        )
        result = await self.session.execute(stmt)
        return result.scalars().all()


class EducationalBackgroundService(BaseService[EducationalBackground]):
    """Service for managing educational backgrounds."""

    def __init__(self, session: AsyncSession):
        super().__init__(EducationalBackground, session)

    async def _get_basic_information_id(self, employee_no: str) -> Optional[str]:
        """Helper to get basic_information_id from employee_no."""
        return await _get_basic_information_id_by_employee_no(self.session, employee_no)

    async def get_by_employee_no(self, employee_no: str) -> list[EducationalBackground]:
        """Get all educational backgrounds by employee number."""
        basic_info_id = await self._get_basic_information_id(employee_no)
        if not basic_info_id:
            return []

        return await self.get_by_basic_information(basic_info_id)

    async def get_by_basic_information(self, basic_information_id: str) -> list[EducationalBackground]:
        """Get all educational backgrounds for a basic information record."""
        stmt = (
            select(EducationalBackground)
            .where(
                and_(
                    EducationalBackground.basic_information_id == basic_information_id,
                    EducationalBackground.is_deleted == False,
                )
            )
        )
        result = await self.session.execute(stmt)
        return result.scalars().all()


class OtherInformationService(BaseService[OtherInformation]):
    """Service for managing other information."""

    def __init__(self, session: AsyncSession):
        super().__init__(OtherInformation, session)

    async def _get_basic_information_id(self, employee_no: str) -> Optional[str]:
        """Helper to get basic_information_id from employee_no."""
        return await _get_basic_information_id_by_employee_no(self.session, employee_no)

    async def get_by_employee_no(self, employee_no: str) -> list[OtherInformation]:
        """Get all other information by employee number."""
        basic_info_id = await self._get_basic_information_id(employee_no)
        if not basic_info_id:
            return []

        return await self.get_by_basic_information(basic_info_id)

    async def get_by_basic_information(self, basic_information_id: str) -> list[OtherInformation]:
        """Get all other information for a basic information record."""
        stmt = (
            select(OtherInformation)
            .where(
                and_(
                    OtherInformation.basic_information_id == basic_information_id,
                    OtherInformation.is_deleted == False,
                )
            )
        )
        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def get_by_type(self, basic_information_id: str, info_type: str) -> list[OtherInformation]:
        """Get other information by type for a basic information record."""
        stmt = (
            select(OtherInformation)
            .where(
                and_(
                    OtherInformation.basic_information_id == basic_information_id,
                    OtherInformation.info_type == info_type,
                    OtherInformation.is_deleted == False,
                )
            )
        )
        result = await self.session.execute(stmt)
        return result.scalars().all()


class ReferenceRecordService(BaseService[ReferenceRecord]):
    """Service for managing reference records."""

    def __init__(self, session: AsyncSession):
        super().__init__(ReferenceRecord, session)

    async def _get_basic_information_id(self, employee_no: str) -> Optional[str]:
        """Helper to get basic_information_id from employee_no."""
        return await _get_basic_information_id_by_employee_no(self.session, employee_no)

    async def get_by_employee_no(self, employee_no: str) -> list[ReferenceRecord]:
        """Get all reference records by employee number."""
        basic_info_id = await self._get_basic_information_id(employee_no)
        if not basic_info_id:
            return []

        return await self.get_by_basic_information(basic_info_id)

    async def get_by_basic_information(self, basic_information_id: str) -> list[ReferenceRecord]:
        """Get all reference records for a basic information record."""
        stmt = (
            select(ReferenceRecord)
            .where(
                and_(
                    ReferenceRecord.basic_information_id == basic_information_id,
                    ReferenceRecord.is_deleted == False,
                )
            )
        )
        result = await self.session.execute(stmt)
        return result.scalars().all()


class PrimaryGovernmentIdService(BaseService[PrimaryGovernmentId]):
    """Service for managing primary government IDs."""

    def __init__(self, session: AsyncSession):
        super().__init__(PrimaryGovernmentId, session)

    async def _get_basic_information_id(self, employee_no: str) -> Optional[str]:
        """Helper to get basic_information_id from employee_no."""
        return await _get_basic_information_id_by_employee_no(self.session, employee_no)

    async def get_by_employee_no(self, employee_no: str) -> Optional[PrimaryGovernmentId]:
        """Get primary government ID by employee number."""
        basic_info_id = await self._get_basic_information_id(employee_no)
        if not basic_info_id:
            return None

        return await self.get_by_basic_information(basic_info_id)

    async def get_by_basic_information(self, basic_information_id: str) -> Optional[PrimaryGovernmentId]:
        """Get primary government ID for a basic information record."""
        stmt = (
            select(PrimaryGovernmentId)
            .where(
                and_(
                    PrimaryGovernmentId.basic_information_id == basic_information_id,
                    PrimaryGovernmentId.is_deleted == False,
                )
            )
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()


class RecordCompletionService(BaseService[RecordCompletion]):
    """Service for managing record completions."""

    def __init__(self, session: AsyncSession):
        super().__init__(RecordCompletion, session)

    async def _get_basic_information_id(self, employee_no: str) -> Optional[str]:
        """Helper to get basic_information_id from employee_no."""
        return await _get_basic_information_id_by_employee_no(self.session, employee_no)

    async def get_by_employee_no(self, employee_no: str) -> Optional[RecordCompletion]:
        """Get record completion by employee number."""
        basic_info_id = await self._get_basic_information_id(employee_no)
        if not basic_info_id:
            return None

        return await self.get_by_basic_information(basic_info_id)

    async def get_by_basic_information(self, basic_information_id: str) -> Optional[RecordCompletion]:
        """Get record completion for a basic information record."""
        stmt = (
            select(RecordCompletion)
            .where(
                and_(
                    RecordCompletion.basic_information_id == basic_information_id,
                    RecordCompletion.is_deleted == False,
                )
            )
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()
