"""Services for Employee and Certificate entities."""
from typing import Optional

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession

from models.employees import Employee, CertificateRecord
from services.base import BaseService


class EmployeeService(BaseService[Employee]):
    """Service for managing employee records."""

    def __init__(self, session: AsyncSession):
        super().__init__(Employee, session)

    async def get_employee_id_by_employee_no(self, employee_no: str) -> Optional[str]:
        """Get employee ID by employee number.
        
        Args:
            employee_no: The employee number.
            
        Returns:
            The employee ID if found, None otherwise.
        """
        employee = await self.get_by_employee_no(employee_no)
        return employee.id if employee else None

    async def get_by_employee_no(self, employee_no: str) -> Optional[Employee]:
        """Get employee by employee number.
        
        Args:
            employee_no: The employee number/ID.
            
        Returns:
            The employee if found and not deleted, None otherwise.
        """
        stmt = select(Employee).where(
            and_(
                Employee.employee_no == employee_no,
                Employee.is_deleted == False,
            )
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_office(self, office: str, skip: int = 0, limit: int = 100) -> list[Employee]:
        """Get all employees in a specific office.
        
        Args:
            office: The office name.
            skip: Number of records to skip.
            limit: Maximum number of records to return.
            
        Returns:
            List of employees in the office.
        """
        stmt = (
            select(Employee)
            .where(
                and_(
                    Employee.office == office,
                    Employee.is_deleted == False,
                )
            )
            .offset(skip)
            .limit(limit)
        )
        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def get_by_status(self, status: str, skip: int = 0, limit: int = 100) -> list[Employee]:
        """Get all employees with a specific status.
        
        Args:
            status: The employment status.
            skip: Number of records to skip.
            limit: Maximum number of records to return.
            
        Returns:
            List of employees with the status.
        """
        stmt = (
            select(Employee)
            .where(
                and_(
                    Employee.status == status,
                    Employee.is_deleted == False,
                )
            )
            .offset(skip)
            .limit(limit)
        )
        result = await self.session.execute(stmt)
        return result.scalars().all()


class CertificateRecordService(BaseService[CertificateRecord]):
    """Service for managing certificate records."""

    def __init__(self, session: AsyncSession):
        super().__init__(CertificateRecord, session)

    async def get_by_employee_no(self, employee_no: str, skip: int = 0, limit: int = 100) -> list[CertificateRecord]:
        """Get all certificates by employee number.
        
        Args:
            employee_no: The employee number.
            skip: Number of records to skip.
            limit: Maximum number of records to return.
            
        Returns:
            List of certificates for the employee.
        """
        # Get employee by number
        stmt = select(Employee).where(
            and_(
                Employee.employee_no == employee_no,
                Employee.is_deleted == False,
            )
        )
        result = await self.session.execute(stmt)
        employee = result.scalar_one_or_none()
        
        if not employee:
            return []
        
        # Get certificates
        return await self.get_by_employee(employee.id, skip=skip, limit=limit)

    async def get_by_employee(self, employee_id: str, skip: int = 0, limit: int = 100) -> list[CertificateRecord]:
        """Get all certificates for a specific employee.
        
        Args:
            employee_id: The ID of the employee.
            skip: Number of records to skip.
            limit: Maximum number of records to return.
            
        Returns:
            List of certificates for the employee.
        """
        stmt = (
            select(CertificateRecord)
            .where(
                and_(
                    CertificateRecord.employee_id == employee_id,
                    CertificateRecord.is_deleted == False,
                )
            )
            .offset(skip)
            .limit(limit)
        )
        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def get_by_type(self, certificate_type: str, skip: int = 0, limit: int = 100) -> list[CertificateRecord]:
        """Get all certificates of a specific type.
        
        Args:
            certificate_type: The type of certificate.
            skip: Number of records to skip.
            limit: Maximum number of records to return.
            
        Returns:
            List of certificates of the type.
        """
        stmt = (
            select(CertificateRecord)
            .where(
                and_(
                    CertificateRecord.certificate_type == certificate_type,
                    CertificateRecord.is_deleted == False,
                )
            )
            .offset(skip)
            .limit(limit)
        )
        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def get_expiring_soon(self, days: int = 30, skip: int = 0, limit: int = 100) -> list[CertificateRecord]:
        """Get certificates expiring within a specified number of days.
        
        Args:
            days: Number of days to look ahead.
            skip: Number of records to skip.
            limit: Maximum number of records to return.
            
        Returns:
            List of certificates expiring soon.
        """
        from datetime import datetime, timedelta

        expiry_threshold = datetime.utcnow().date() + timedelta(days=days)
        
        stmt = (
            select(CertificateRecord)
            .where(
                and_(
                    CertificateRecord.expiry_date <= expiry_threshold,
                    CertificateRecord.expiry_date >= datetime.utcnow().date(),
                    CertificateRecord.is_deleted == False,
                )
            )
            .offset(skip)
            .limit(limit)
        )
        result = await self.session.execute(stmt)
        return result.scalars().all()
