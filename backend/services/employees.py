"""Services for Employee and Certificate entities."""
from datetime import date
from typing import Optional

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from models.employees import Employee, CertificateRecord
from models.personal_information import BasicInformation, ContactInformation
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

    async def get_basic_information_id_by_employee_no(self, employee_no: str) -> Optional[str]:
        """Get basic information ID by employee number using an explicit query.

        This avoids async lazy relationship loading in request handlers.

        Args:
            employee_no: The employee number/ID.

        Returns:
            The basic information ID if found, None otherwise.
        """
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
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_employee_no(self, employee_no: str) -> Optional[Employee]:
        """Get employee by employee number.
        
        Args:
            employee_no: The employee number/ID.
            
        Returns:
            The employee if found and not deleted, None otherwise.
        """
        stmt = (
            select(Employee)
            .options(selectinload(Employee.basic_information))
            .where(
                and_(
                    Employee.employee_no == employee_no,
                    Employee.is_deleted.is_(False),
                )
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
                    Employee.office_department == office,
                    Employee.is_deleted.is_(False),
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
                    Employee.employment_status == status,
                    Employee.is_deleted.is_(False),
                )
            )
            .offset(skip)
            .limit(limit)
        )
        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def get_full_pds(self, employee_id: str) -> Optional[dict]:
        """Fetch all PDS components for a single employee."""
        stmt = (
            select(Employee)
            .options(
                selectinload(Employee.basic_information).selectinload(BasicInformation.contact_information),
                selectinload(Employee.basic_information).selectinload(BasicInformation.addresses),
                selectinload(Employee.basic_information).selectinload(BasicInformation.government_ids),
                selectinload(Employee.basic_information).selectinload(BasicInformation.primary_government_id),
                selectinload(Employee.basic_information).selectinload(BasicInformation.family_details),
                selectinload(Employee.basic_information).selectinload(BasicInformation.educational_backgrounds),
                selectinload(Employee.basic_information).selectinload(BasicInformation.civil_service_eligibilities),
                selectinload(Employee.basic_information).selectinload(BasicInformation.work_experience_records),
                selectinload(Employee.basic_information).selectinload(BasicInformation.voluntary_records),
                selectinload(Employee.basic_information).selectinload(BasicInformation.training_records),
                selectinload(Employee.basic_information).selectinload(BasicInformation.other_information),
                selectinload(Employee.basic_information).selectinload(BasicInformation.reference_records),
            )
            .where(
                and_(
                    Employee.id == employee_id,
                    Employee.is_deleted.is_(False),
                )
            )
        )
        result = await self.session.execute(stmt)
        employee = result.scalar_one_or_none()

        if not employee or not employee.basic_information:
            return None

        basic = employee.basic_information

        # Helper to convert to dict list
        def _to_dicts(items: list) -> list[dict]:
            return [i.model_dump() for i in items if not getattr(i, "is_deleted", False)]

        return {
            "employee": employee.model_dump(),
            "personalInfo": {
                **basic.model_dump(),
                "residentialAddress": next((a.model_dump() for a in basic.addresses if a.address_type == "RESIDENTIAL"), None),
                "permanentAddress": next((a.model_dump() for a in basic.addresses if a.address_type == "PERMANENT"), None),
                "governmentIds": _to_dicts(basic.government_ids),
                "contactInfo": basic.contact_information.model_dump() if basic.contact_information else None,
            },
            "familyBackground": {
                "spouse": next((f.model_dump() for f in basic.family_details if getattr(f, "relationship", "") == "Spouse"), None),
                "father": next((f.model_dump() for f in basic.family_details if getattr(f, "relationship", "") == "Father"), None),
                "mother": next((f.model_dump() for f in basic.family_details if getattr(f, "relationship", "") == "Mother"), None),
                "children": _to_dicts([f for f in basic.family_details if getattr(f, "relationship", "") == "Child"]),
            },

            "education": _to_dicts(basic.educational_backgrounds),
            "eligibility": _to_dicts(basic.civil_service_eligibilities),
            "workExperience": _to_dicts(basic.work_experience_records),
            "voluntaryWork": _to_dicts(basic.voluntary_records),
            "training": _to_dicts(basic.training_records),
            "otherInfo": _to_dicts(basic.other_information),
            "references": _to_dicts(basic.reference_records),
            "governmentIssuedId": basic.primary_government_id.model_dump() if basic.primary_government_id else None,
        }

    async def get_with_details(self, employee_id: str) -> Optional[dict]:

        """Get a single employee with basic and contact details by ID."""
        stmt = (
            select(Employee, BasicInformation, ContactInformation)
            .outerjoin(
                BasicInformation,
                and_(
                    BasicInformation.employee_id == Employee.id,
                    BasicInformation.is_deleted.is_(False),
                ),
            )
            .outerjoin(
                ContactInformation,
                and_(
                    ContactInformation.basic_information_id == BasicInformation.id,
                    ContactInformation.is_deleted.is_(False),
                ),
            )
            .where(
                and_(
                    Employee.id == employee_id,
                    Employee.is_deleted.is_(False),
                )
            )
        )
        result = await self.session.execute(stmt)
        record = result.first()

        if not record:
            return None

        employee, basic_info, contact_info = record
        full_name = None
        if basic_info:
            middle = f" {basic_info.middle_name}" if basic_info.middle_name else ""
            full_name = f"{basic_info.surname}, {basic_info.first_name}{middle}".strip()

        return {
            "id": employee.id,
            "employee_no": employee.employee_no,
            "office_department": employee.office_department,
            "position_title": employee.position_title,
            "employment_status": employee.employment_status,
            "date_hired": employee.date_hired,
            "created_at": employee.created_at,
            "updated_at": employee.updated_at,
            "basic_information": (
                {
                    "id": basic_info.id,
                    "surname": basic_info.surname,
                    "first_name": basic_info.first_name,
                    "middle_name": basic_info.middle_name,
                    "name_extension": basic_info.name_extension,
                    "full_name": full_name,
                }
                if basic_info
                else None
            ),
            "contact_information": (
                {
                    "telephone_no": contact_info.telephone_no,
                    "mobile_no": contact_info.mobile_no,
                    "email_address": contact_info.email_address,
                }
                if contact_info
                else None
            ),
        }

    async def get_all_with_details(self, skip: int = 0, limit: int = 100) -> list[dict]:

        """Get employees with basic and contact details in a single query."""
        stmt = (
            select(Employee, BasicInformation, ContactInformation)
            .outerjoin(
                BasicInformation,
                and_(
                    BasicInformation.employee_id == Employee.id,
                    BasicInformation.is_deleted.is_(False),
                ),
            )
            .outerjoin(
                ContactInformation,
                and_(
                    ContactInformation.basic_information_id == BasicInformation.id,
                    ContactInformation.is_deleted.is_(False),
                ),
            )
            .where(Employee.is_deleted.is_(False))
            .offset(skip)
            .limit(limit)
        )
        result = await self.session.execute(stmt)

        records: list[dict] = []
        for employee, basic_info, contact_info in result.all():
            full_name = None
            if basic_info:
                middle = f" {basic_info.middle_name}" if basic_info.middle_name else ""
                full_name = f"{basic_info.surname}, {basic_info.first_name}{middle}".strip()

            records.append(
                {
                    "id": employee.id,
                    "employee_no": employee.employee_no,
                    "office_department": employee.office_department,
                    "position_title": employee.position_title,
                    "employment_status": employee.employment_status,
                    "date_hired": employee.date_hired,
                    "created_at": employee.created_at,
                    "updated_at": employee.updated_at,
                    "basic_information": (
                        {
                            "id": basic_info.id,
                            "surname": basic_info.surname,
                            "first_name": basic_info.first_name,
                            "middle_name": basic_info.middle_name,
                            "name_extension": basic_info.name_extension,
                            "full_name": full_name,
                        }
                        if basic_info
                        else None
                    ),
                    "contact_information": (
                        {
                            "telephone_no": contact_info.telephone_no,
                            "mobile_no": contact_info.mobile_no,
                            "email_address": contact_info.email_address,
                        }
                        if contact_info
                        else None
                    ),
                }
            )

        return records


class CertificateRecordService(BaseService[CertificateRecord]):
    """Service for managing certificate records."""

    def __init__(self, session: AsyncSession):
        super().__init__(CertificateRecord, session)

    async def get_by_employee_no(self, employee_no: str, skip: int = 0, limit: int = 100, date_from: Optional[date] = None, date_to: Optional[date] = None) -> list[CertificateRecord]:
        """Get all certificates by employee number with optional date filtering.
        
        Args:
            employee_no: The employee number.
            skip: Number of records to skip.
            limit: Maximum number of records to return.
            date_from: Optional start date for filtering (based on date_issued).
            date_to: Optional end date for filtering (based on date_issued).
            
        Returns:
            List of certificates for the employee.
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
            return []
        
        # Get certificates
        return await self.get_by_employee(employee.id, skip=skip, limit=limit, date_from=date_from, date_to=date_to)

    async def get_by_employee(self, employee_id: str, skip: int = 0, limit: int = 100, date_from: Optional[date] = None, date_to: Optional[date] = None) -> list[CertificateRecord]:
        """Get all certificates for a specific employee with optional date filtering.
        
        Args:
            employee_id: The ID of the employee.
            skip: Number of records to skip.
            limit: Maximum number of records to return.
            date_from: Optional start date for filtering (based on date_issued).
            date_to: Optional end date for filtering (based on date_issued).
            
        Returns:
            List of certificates for the employee.
        """
        conditions = [
            CertificateRecord.employee_id == employee_id,
            CertificateRecord.is_deleted.is_(False),
        ]
        
        if date_from is not None:
            conditions.append(CertificateRecord.date_issued >= date_from)
        if date_to is not None:
            conditions.append(CertificateRecord.date_issued <= date_to)
        
        stmt = (
            select(CertificateRecord)
            .where(and_(*conditions))
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
                    CertificateRecord.is_deleted.is_(False),
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
                    CertificateRecord.is_deleted.is_(False),
                )
            )
            .offset(skip)
            .limit(limit)
        )
        result = await self.session.execute(stmt)
        return result.scalars().all()
