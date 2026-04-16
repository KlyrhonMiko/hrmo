"""Personal Information Services."""
from typing import Optional

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession

from models.employees import Employee
from models.personal_information import (
    BasicInformation,
    GovernmentId,
    Address,
    ContactInformation,
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


class BasicInformationService(BaseService[BasicInformation]):
    """Service for managing basic information records."""

    def __init__(self, session: AsyncSession):
        super().__init__(BasicInformation, session)

    async def get_by_employee_no(self, employee_no: str) -> Optional[BasicInformation]:
        """Get basic information by employee number.
        
        Args:
            employee_no: The employee number.
            
        Returns:
            BasicInformation if found, None otherwise.
        """
        # Get employee by number
        stmt = select(Employee).where(
            and_(
                Employee.employee_no == employee_no,
                Employee.is_deleted.is_(False),
            )
        )
        result = await self.session.execute(stmt)
        employee = result.scalar_one_or_none()
        
        if not employee:
            return None
        
        # Get basic information by employee_id
        stmt = select(BasicInformation).where(
            and_(
                BasicInformation.employee_id == employee.id,
                BasicInformation.is_deleted.is_(False),
            )
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()


class GovernmentIdService(BaseService[GovernmentId]):
    """Service for managing government IDs."""

    def __init__(self, session: AsyncSession):
        super().__init__(GovernmentId, session)

    async def get_by_employee_no(self, employee_no: str) -> list[GovernmentId]:
        """Get all government IDs by employee number.
        
        Args:
            employee_no: The employee number.
            
        Returns:
            List of government IDs for the employee.
        """
        basic_info_id = await _get_basic_information_id_by_employee_no(self.session, employee_no)
        if not basic_info_id:
            return []

        # Get government IDs
        return await self.get_by_person(basic_info_id)

    async def get_by_employee_no_and_type(self, employee_no: str, id_type: str) -> Optional[GovernmentId]:
        """Get a specific government ID by employee number and type.
        
        Args:
            employee_no: The employee number.
            id_type: The type of ID to retrieve.
            
        Returns:
            The government ID if found, None otherwise.
        """
        basic_info_id = await _get_basic_information_id_by_employee_no(self.session, employee_no)
        if not basic_info_id:
            return None

        # Get specific government ID
        return await self.get_by_type(basic_info_id, id_type)

    async def get_by_person(self, basic_information_id: str) -> list[GovernmentId]:
        """Get all government IDs for a specific person.
        
        Args:
            basic_information_id: The ID of the basic information record.
            
        Returns:
            List of government IDs for the person.
        """
        stmt = (
            select(GovernmentId)
            .where(
                and_(
                    GovernmentId.basic_information_id == basic_information_id,
                    GovernmentId.is_deleted.is_(False),
                )
            )
        )
        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def get_by_type(self, basic_information_id: str, id_type: str) -> Optional[GovernmentId]:
        """Get a specific government ID by type for a person.
        
        Args:
            basic_information_id: The ID of the basic information record.
            id_type: The type of ID to retrieve.
            
        Returns:
            The government ID if found, None otherwise.
        """
        stmt = (
            select(GovernmentId)
            .where(
                and_(
                    GovernmentId.basic_information_id == basic_information_id,
                    GovernmentId.id_type == id_type,
                    GovernmentId.is_deleted.is_(False),
                )
            )
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()


class AddressService(BaseService[Address]):
    """Service for managing addresses."""

    def __init__(self, session: AsyncSession):
        super().__init__(Address, session)

    async def get_by_employee_no(self, employee_no: str) -> list[Address]:
        """Get all addresses by employee number.
        
        Args:
            employee_no: The employee number.
            
        Returns:
            List of addresses for the employee.
        """
        basic_info_id = await _get_basic_information_id_by_employee_no(self.session, employee_no)
        if not basic_info_id:
            return []

        # Get addresses
        return await self.get_by_person(basic_info_id)

    async def get_by_employee_no_and_type(self, employee_no: str, address_type: str) -> Optional[Address]:
        """Get a specific address by employee number and type.
        
        Args:
            employee_no: The employee number.
            address_type: The type of address (RESIDENTIAL, PERMANENT).
            
        Returns:
            The address if found, None otherwise.
        """
        basic_info_id = await _get_basic_information_id_by_employee_no(self.session, employee_no)
        if not basic_info_id:
            return None

        # Get specific address
        return await self.get_by_type(basic_info_id, address_type)

    async def get_by_person(self, basic_information_id: str) -> list[Address]:
        """Get all addresses for a specific person.
        
        Args:
            basic_information_id: The ID of the basic information record.
            
        Returns:
            List of addresses for the person.
        """
        stmt = (
            select(Address)
            .where(
                and_(
                    Address.basic_information_id == basic_information_id,
                    Address.is_deleted.is_(False),
                )
            )
        )
        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def get_by_type(self, basic_information_id: str, address_type: str) -> Optional[Address]:
        """Get a specific address by type for a person.
        
        Args:
            basic_information_id: The ID of the basic information record.
            address_type: The type of address (RESIDENTIAL, PERMANENT).
            
        Returns:
            The address if found, None otherwise.
        """
        stmt = (
            select(Address)
            .where(
                and_(
                    Address.basic_information_id == basic_information_id,
                    Address.address_type == address_type,
                    Address.is_deleted.is_(False),
                )
            )
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()


class ContactInformationService(BaseService[ContactInformation]):
    """Service for managing contact information."""

    def __init__(self, session: AsyncSession):
        super().__init__(ContactInformation, session)

    async def get_by_employee_no(self, employee_no: str) -> Optional[ContactInformation]:
        """Get contact information by employee number.
        
        Args:
            employee_no: The employee number.
            
        Returns:
            The contact information if found, None otherwise.
        """
        basic_info_id = await _get_basic_information_id_by_employee_no(self.session, employee_no)
        if not basic_info_id:
            return None

        # Get contact information
        return await self.get_by_person(basic_info_id)

    async def get_by_person(self, basic_information_id: str) -> Optional[ContactInformation]:
        """Get contact information for a specific person.
        
        Args:
            basic_information_id: The ID of the basic information record.
            
        Returns:
            The contact information if found, None otherwise.
        """
        stmt = (
            select(ContactInformation)
            .where(
                and_(
                    ContactInformation.basic_information_id == basic_information_id,
                    ContactInformation.is_deleted.is_(False),
                )
            )
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()
