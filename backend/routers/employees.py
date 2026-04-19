"""Router for Employee endpoints."""
from datetime import date, datetime
from typing import Any, Optional

from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlmodel import select, delete

from core.database import get_db
from models.employees import Employee
from models.personal_information import BasicInformation, GovernmentId, Address, ContactInformation
from models.personal_background import (
    FamilyDetail,
    EducationalBackground,
    OtherInformation,
    ReferenceRecord,
    PrimaryGovernmentId,
    RecordCompletion,
)
from models.professional_background import (
    WorkExperienceRecord,
    VoluntaryRecord,
    TrainingRecord,
    CivilServiceEligibility,
)
from models.users import User, UserRole
from schemas.employees import (
    EmployeeAtomicOnboardRequest,
    EmployeeCreate,
    EmployeeUpdate,
)

from deps.auth import get_current_user
from utils.token import decode_token
import jwt


from services.employees import EmployeeService
from utils.response import APIResponse, build_pagination_meta, create_response

router = APIRouter(prefix="/api/employees", tags=["Employees"])


def _clean(value: Any) -> str:
    return str(value).strip() if value is not None else ""


def _has_value(value: Any) -> bool:
    return len(_clean(value)) > 0


def _to_optional_float(value: Any) -> Optional[float]:
    try:
        cleaned = _clean(value)
        return float(cleaned) if cleaned else None
    except (TypeError, ValueError):
        return None


def _to_optional_date(value: Any) -> Optional[date]:
    if value is None:
        return None
    if isinstance(value, date) and not isinstance(value, datetime):
        return value
    if isinstance(value, datetime):
        return value.date()

    cleaned = _clean(value)
    if not cleaned:
        return None

    normalized = cleaned.lower()
    if normalized in {"present", "current", "ongoing", "n/a", "na", "none", "null", "-"}:
        return None

    # Accept plain year values from the onboarding form (e.g. "2018").
    if len(cleaned) == 4 and cleaned.isdigit():
        year = int(cleaned)
        if 1 <= year <= 9999:
            return date(year, 1, 1)

    # Accept year-month values (e.g. "2018-06" or "2018/06").
    for separator in ("-", "/"):
        parts = cleaned.split(separator)
        if len(parts) == 2:
            left, right = parts[0].strip(), parts[1].strip()
            if len(left) == 4 and left.isdigit() and right.isdigit():
                year = int(left)
                month = int(right)
                if 1 <= year <= 9999 and 1 <= month <= 12:
                    return date(year, month, 1)

    try:
        return date.fromisoformat(cleaned)
    except ValueError:
        pass

    try:
        return datetime.fromisoformat(cleaned.replace("Z", "+00:00")).date()
    except ValueError:
        return None


def _to_required_date(value: Any, field_name: str) -> date:
    parsed = _to_optional_date(value)
    if parsed is None:
        raise ValueError(f"Invalid date value for {field_name}")
    return parsed


def _has_any_address_value(address: dict[str, Any]) -> bool:
    return any(
        _has_value(address.get(key))
        for key in [
            "houseBlockLot",
            "street",
            "subdivision",
            "barangay",
            "cityMunicipality",
            "province",
            "zipCode",
        ]
    )


def _list_of_dicts(value: Any) -> list[dict[str, Any]]:
    if not isinstance(value, list):
        return []
    return [item for item in value if isinstance(item, dict)]


def _split_name(full_name: str) -> Optional[dict[str, Optional[str]]]:
    normalized = _clean(full_name)
    if not normalized:
        return None

    if "," in normalized:
        surname_raw, rest_raw = normalized.split(",", 1)
        surname = _clean(surname_raw)
        rest = _clean(rest_raw)
        if not surname or not rest:
            return None
        tokens = [token for token in rest.split() if token]
        if not tokens:
            return None
        return {
            "surname": surname,
            "first_name": tokens[0],
            "middle_name": " ".join(tokens[1:]) if len(tokens) > 1 else None,
            "name_extension": None,
        }

    tokens = [token for token in normalized.split() if token]
    if len(tokens) < 2:
        return None

    return {
        "surname": tokens[-1],
        "first_name": tokens[0],
        "middle_name": " ".join(tokens[1:-1]) if len(tokens) > 2 else None,
        "name_extension": None,
    }


@router.get("/me", response_model=APIResponse)
async def get_my_employee_profile(
    request: Request,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    """Get the employee profile for the currently authenticated user."""
    if not current_user.employee_id:
        return create_response(
            path=request.url.path,
            data=None,
            success=True,
        )

    service = EmployeeService(session)
    record = await service.get_with_details(current_user.employee_id)
    
    if not record:
        return create_response(
            path=request.url.path,
            data=None,
            success=True,
        )
    
    return create_response(
        path=request.url.path,
        data=record,
        success=True,
    )


@router.get("/me/pds", response_model=APIResponse)
async def get_my_full_pds(
    request: Request,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    """Get the full PDS record for the currently authenticated user."""
    if not current_user.employee_id:
        return create_response(
            path=request.url.path,
            data=None,
            success=True,
        )

    service = EmployeeService(session)
    record = await service.get_full_pds(current_user.employee_id)
    
    if not record:
        return create_response(
            path=request.url.path,
            data=None,
            success=True,
        )
    
    return create_response(
        path=request.url.path,
        data=record,
        success=True,
    )




@router.post("", response_model=APIResponse, status_code=status.HTTP_201_CREATED)
async def create_employee(
    request: Request,
    data: EmployeeCreate,
    session: AsyncSession = Depends(get_db),
):
    """Create a new employee record."""
    service = EmployeeService(session)
    
    # Check if employee number already exists
    existing = await service.get_by_employee_no(data.employee_no)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Employee number already exists",
        )
    
    record = Employee(**data.model_dump())
    session.add(record)
    await session.commit()
    await session.refresh(record)
    
    return create_response(
        path=request.url.path,
        data=record.model_dump(),
        success=True,
    )


@router.post("/onboard-atomic", response_model=APIResponse, status_code=status.HTTP_201_CREATED)
async def onboard_employee_atomic(
    request: Request,
    data: EmployeeAtomicOnboardRequest,
    session: AsyncSession = Depends(get_db),
):
    """Atomically create employee onboarding records in a single transaction.
    
    If the caller is an authenticated employee (Bearer token in Authorization header),
    their user record is automatically linked to the newly created employee record.
    """
    form_data = data.formData or {}
    employee_meta = data.employeeMeta or {}


    personal = form_data.get("personalInfo") or {}
    work_experience = _list_of_dicts(form_data.get("workExperience"))
    first_work = next(
        (
            item
            for item in work_experience
            if _has_value(item.get("positionTitle")) and _has_value(item.get("dateFrom"))
        ),
        None,
    )

    employee_no = _clean(employee_meta.get("employeeNo")) or _clean(personal.get("agencyEmployeeNo"))
    position_title = _clean(employee_meta.get("positionTitle")) or _clean((first_work or {}).get("positionTitle"))
    date_hired = (
        _to_optional_date(employee_meta.get("dateHired"))
        or _to_optional_date((first_work or {}).get("dateFrom"))
        or _to_optional_date(form_data.get("dateAccomplished"))
    )

    missing_required: list[str] = []
    if not _has_value(employee_no):
        missing_required.append("employee number")
    if not _has_value(position_title):
        missing_required.append("position title")
    if not _has_value(form_data.get("office")):
        missing_required.append("office/department")
    if not _has_value(form_data.get("employmentStatus")):
        missing_required.append("employment status")
    if not _has_value(date_hired):
        missing_required.append("date hired")
    if not _has_value(personal.get("surname")):
        missing_required.append("surname")
    if not _has_value(personal.get("firstName")):
        missing_required.append("first name")
    if not _has_value(personal.get("dateOfBirth")):
        missing_required.append("date of birth")
    if not _has_value(personal.get("placeOfBirth")):
        missing_required.append("place of birth")
    if not _has_value(personal.get("mobileNo")):
        missing_required.append("mobile number")
    if not _has_value(personal.get("email")):
        missing_required.append("email address")

    if missing_required:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Missing required fields: {', '.join(missing_required)}",
        )

    stage_results: list[dict[str, Any]] = []

    try:
        async with session.begin():
            # Resolve the calling user from the Authorization header (inside transaction)
            calling_user: User | None = None
            auth_header = request.headers.get("Authorization", "")
            if auth_header.startswith("Bearer "):
                try:
                    token = auth_header.removeprefix("Bearer ").strip()
                    payload = decode_token(token)
                    caller_id = payload.get("sub")
                    if caller_id:
                        from services.users import UserService
                        calling_user = await UserService(session).get(caller_id)
                except (jwt.PyJWTError, Exception):
                    calling_user = None


            existing_stmt = select(Employee).options(selectinload(Employee.basic_information)).where(
                Employee.employee_no == employee_no,
                Employee.is_deleted.is_(False),
            )
            employee = (await session.execute(existing_stmt)).scalar_one_or_none()
            
            is_update = employee is not None

            if is_update:
                # Update existing employee record
                employee.office_department = _clean(form_data.get("office"))
                employee.position_title = position_title
                employee.employment_status = _clean(form_data.get("employmentStatus"))
                employee.date_hired = date_hired
                session.add(employee)
            else:
                # Create new employee record
                if date_hired is None:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Missing required fields: date hired",
                    )
                employee = Employee(
                    employee_no=employee_no,
                    office_department=_clean(form_data.get("office")),
                    position_title=position_title,
                    employment_status=_clean(form_data.get("employmentStatus")),
                    date_hired=date_hired,
                )
                session.add(employee)
            
            await session.flush()

            # ── Link to user record ──────────────────────────────────────────
            # Priority 1: self-service — authenticated caller is an employee with no record yet
            if calling_user and calling_user.role == UserRole.employee and not calling_user.employee_id:
                calling_user.employee_id = employee.id
                session.add(calling_user)
                stage_results.append({"stage": "user_link", "created": 1, "skipped": 0})
            # Priority 2: HR-provided explicit user_id in the request body
            elif data.user_id:
                user_stmt = select(User).where(User.id == data.user_id)
                user = (await session.execute(user_stmt)).scalar_one_or_none()
                if user and user.role == UserRole.employee:
                    user.employee_id = employee.id
                    session.add(user)
                    stage_results.append({"stage": "user_link", "created": 1, "skipped": 0})

            stage_results.append({"stage": "employee", "created": 1, "skipped": 0})


            # Resolve or Create Basic Information
            basic_information = None
            if is_update:
                bi_stmt = select(BasicInformation).where(
                    BasicInformation.employee_id == employee.id,
                    BasicInformation.is_deleted.is_(False)
                )
                basic_information = (await session.execute(bi_stmt)).scalar_one_or_none()

            if basic_information:
                # Update existing basic information
                basic_information.surname = _clean(personal.get("surname"))
                basic_information.first_name = _clean(personal.get("firstName"))
                basic_information.middle_name = _clean(personal.get("middleName")) or None
                basic_information.name_extension = _clean(personal.get("nameExtension")) or None
                basic_information.date_of_birth = _to_required_date(personal.get("dateOfBirth"), "personalInfo.dateOfBirth")
                basic_information.place_of_birth = _clean(personal.get("placeOfBirth"))
                basic_information.sex = _clean(personal.get("sex"))
                basic_information.civil_status = _clean(personal.get("civilStatus"))
                basic_information.height = _to_optional_float(personal.get("height"))
                basic_information.weight = _to_optional_float(personal.get("weight"))
                basic_information.blood_type = _clean(personal.get("bloodType")) or None
                basic_information.citizenship = _clean(personal.get("citizenship")) or "Filipino"
                session.add(basic_information)
            else:
                basic_information = BasicInformation(
                    employee_id=employee.id,
                    surname=_clean(personal.get("surname")),
                    first_name=_clean(personal.get("firstName")),
                    middle_name=_clean(personal.get("middleName")) or None,
                    name_extension=_clean(personal.get("nameExtension")) or None,
                    date_of_birth=_to_required_date(personal.get("dateOfBirth"), "personalInfo.dateOfBirth"),
                    place_of_birth=_clean(personal.get("placeOfBirth")),
                    sex=_clean(personal.get("sex")),
                    civil_status=_clean(personal.get("civilStatus")),
                    height=_to_optional_float(personal.get("height")),
                    weight=_to_optional_float(personal.get("weight")),
                    blood_type=_clean(personal.get("bloodType")) or None,
                    citizenship=_clean(personal.get("citizenship")) or "Filipino",
                )
                session.add(basic_information)
            
            await session.flush()
            basic_information_id = basic_information.id

            if is_update:
                # Clear related collections for fresh recreation
                await session.execute(delete(GovernmentId).where(GovernmentId.basic_information_id == basic_information_id))
                await session.execute(delete(Address).where(Address.basic_information_id == basic_information_id))
                await session.execute(delete(ContactInformation).where(ContactInformation.basic_information_id == basic_information_id))
                await session.execute(delete(FamilyDetail).where(FamilyDetail.basic_information_id == basic_information_id))
                await session.execute(delete(EducationalBackground).where(EducationalBackground.basic_information_id == basic_information_id))
                await session.execute(delete(CivilServiceEligibility).where(CivilServiceEligibility.basic_information_id == basic_information_id))
                await session.execute(delete(WorkExperienceRecord).where(WorkExperienceRecord.basic_information_id == basic_information_id))
                await session.execute(delete(VoluntaryRecord).where(VoluntaryRecord.basic_information_id == basic_information_id))
                await session.execute(delete(TrainingRecord).where(TrainingRecord.basic_information_id == basic_information_id))
                await session.execute(delete(OtherInformation).where(OtherInformation.basic_information_id == basic_information_id))
                await session.execute(delete(ReferenceRecord).where(ReferenceRecord.basic_information_id == basic_information_id))
                await session.execute(delete(PrimaryGovernmentId).where(PrimaryGovernmentId.basic_information_id == basic_information_id))
                await session.flush()

            stage_results.append({"stage": "basic_information", "created": 1, "skipped": 0})

            id_entries = [
                {"id_type": "GSIS", "id_value": _clean(personal.get("gsisIdNo"))},
                {"id_type": "PAG_IBIG", "id_value": _clean(personal.get("pagIbigIdNo"))},
                {"id_type": "PHILHEALTH", "id_value": _clean(personal.get("philhealthNo"))},
                {"id_type": "SSS", "id_value": _clean(personal.get("sssNo"))},
                {"id_type": "TIN", "id_value": _clean(personal.get("tinNo"))},
                {"id_type": "AGENCY_EMPLOYEE", "id_value": _clean(personal.get("agencyEmployeeNo"))},
            ]
            id_created = 0
            id_skipped = 0
            for entry in id_entries:
                if not _has_value(entry["id_value"]):
                    id_skipped += 1
                    continue
                session.add(
                    GovernmentId(
                        basic_information_id=basic_information_id,
                        id_type=entry["id_type"],
                        id_value=entry["id_value"],
                    )
                )
                id_created += 1
            stage_results.append({"stage": "government_ids", "created": id_created, "skipped": id_skipped})

            residential_address = personal.get("residentialAddress") or {}
            permanent_address = personal.get("permanentAddress") or {}
            address_entries = [
                {"address_type": "RESIDENTIAL", "address": residential_address},
                {"address_type": "PERMANENT", "address": permanent_address},
            ]
            address_created = 0
            address_skipped = 0
            for entry in address_entries:
                address_data = entry["address"]
                if not isinstance(address_data, dict) or not _has_any_address_value(address_data):
                    address_skipped += 1
                    continue
                session.add(
                    Address(
                        basic_information_id=basic_information_id,
                        address_type=entry["address_type"],
                        house_no=_clean(address_data.get("houseBlockLot")) or None,
                        street=_clean(address_data.get("street")) or None,
                        subdivision_village=_clean(address_data.get("subdivision")) or None,
                        barangay=_clean(address_data.get("barangay")) or None,
                        city=_clean(address_data.get("cityMunicipality")) or None,
                        province=_clean(address_data.get("province")) or None,
                        zip_code=_clean(address_data.get("zipCode")) or None,
                    )
                )
                address_created += 1
            stage_results.append({"stage": "addresses", "created": address_created, "skipped": address_skipped})

            session.add(
                ContactInformation(
                    basic_information_id=basic_information_id,
                    telephone_no=_clean(personal.get("telephoneNo")) or None,
                    mobile_no=_clean(personal.get("mobileNo")),
                    email_address=_clean(personal.get("email")),
                )
            )
            stage_results.append({"stage": "contact_information", "created": 1, "skipped": 0})

            family = form_data.get("familyBackground") or {}
            family_created = 0
            family_skipped = 0

            spouse_values = [
                family.get("spouseSurname"),
                family.get("spouseFirstName"),
                family.get("spouseMiddleName"),
                family.get("spouseNameExtension"),
                family.get("spouseOccupation"),
                family.get("spouseEmployerBusinessName"),
                family.get("spouseBusinessAddress"),
                family.get("spouseTelephoneNo"),
            ]
            if any(_has_value(value) for value in spouse_values):
                if _has_value(family.get("spouseSurname")) and _has_value(family.get("spouseFirstName")):
                    session.add(
                        FamilyDetail(
                            basic_information_id=basic_information_id,
                            relationship="Spouse",
                            surname=_clean(family.get("spouseSurname")),
                            first_name=_clean(family.get("spouseFirstName")),
                            middle_name=_clean(family.get("spouseMiddleName")) or None,
                            name_extension=_clean(family.get("spouseNameExtension")) or None,
                            date_of_birth=None,
                            occupation=_clean(family.get("spouseOccupation")) or None,
                            employee_business_name=_clean(family.get("spouseEmployerBusinessName")) or None,
                            business_address=_clean(family.get("spouseBusinessAddress")) or None,
                            telephone_no=_clean(family.get("spouseTelephoneNo")) or None,
                        )
                    )
                    family_created += 1
                else:
                    family_skipped += 1

            father_values = [
                family.get("fatherSurname"),
                family.get("fatherFirstName"),
                family.get("fatherMiddleName"),
                family.get("fatherNameExtension"),
            ]
            if any(_has_value(value) for value in father_values):
                if _has_value(family.get("fatherSurname")) and _has_value(family.get("fatherFirstName")):
                    session.add(
                        FamilyDetail(
                            basic_information_id=basic_information_id,
                            relationship="Father",
                            surname=_clean(family.get("fatherSurname")),
                            first_name=_clean(family.get("fatherFirstName")),
                            middle_name=_clean(family.get("fatherMiddleName")) or None,
                            name_extension=_clean(family.get("fatherNameExtension")) or None,
                            date_of_birth=None,
                            occupation=None,
                            employee_business_name=None,
                            business_address=None,
                            telephone_no=None,
                        )
                    )
                    family_created += 1
                else:
                    family_skipped += 1

            mother_values = [
                family.get("motherMaidenSurname"),
                family.get("motherFirstName"),
                family.get("motherMiddleName"),
            ]
            if any(_has_value(value) for value in mother_values):
                if _has_value(family.get("motherMaidenSurname")) and _has_value(family.get("motherFirstName")):
                    session.add(
                        FamilyDetail(
                            basic_information_id=basic_information_id,
                            relationship="Mother",
                            surname=_clean(family.get("motherMaidenSurname")),
                            first_name=_clean(family.get("motherFirstName")),
                            middle_name=_clean(family.get("motherMiddleName")) or None,
                            name_extension=None,
                            date_of_birth=None,
                            occupation=None,
                            employee_business_name=None,
                            business_address=None,
                            telephone_no=None,
                        )
                    )
                    family_created += 1
                else:
                    family_skipped += 1

            children = _list_of_dicts(family.get("children"))
            for child in children:
                parsed_name = _split_name(_clean(child.get("fullName"))) if isinstance(child, dict) else None
                surname = _clean(child.get("surname")) if isinstance(child, dict) else ""
                first_name = _clean(child.get("firstName")) if isinstance(child, dict) else ""
                middle_name = _clean(child.get("middleName")) if isinstance(child, dict) else ""
                name_extension = _clean(child.get("nameExtension")) if isinstance(child, dict) else ""
                date_of_birth = _clean(child.get("dateOfBirth")) if isinstance(child, dict) else ""

                surname = surname or ((parsed_name or {}).get("surname") or "")
                first_name = first_name or ((parsed_name or {}).get("first_name") or "")
                middle_name = middle_name or ((parsed_name or {}).get("middle_name") or "")
                name_extension = name_extension or ((parsed_name or {}).get("name_extension") or "")

                if not surname or not first_name or not _has_value(date_of_birth):
                    family_skipped += 1
                    continue

                session.add(
                    FamilyDetail(
                        basic_information_id=basic_information_id,
                        relationship="Child",
                        surname=surname,
                        first_name=first_name,
                        middle_name=middle_name or None,
                        name_extension=name_extension or None,
                        date_of_birth=_to_required_date(date_of_birth, "familyBackground.children[].dateOfBirth"),
                        occupation=None,
                        employee_business_name=None,
                        business_address=None,
                        telephone_no=None,
                    )
                )
                family_created += 1

            stage_results.append({"stage": "family_details", "created": family_created, "skipped": family_skipped})

            education_created = 0
            education_skipped = 0
            education_entries = _list_of_dicts(form_data.get("education"))
            for education in education_entries:
                if not _has_value(education.get("schoolName")) or not _has_value(education.get("periodFrom")):
                    education_skipped += 1
                    continue

                try:
                    period_from = _to_required_date(education.get("periodFrom"), "education[].periodFrom")
                except ValueError:
                    education_skipped += 1
                    continue

                session.add(
                    EducationalBackground(
                        basic_information_id=basic_information_id,
                        level=_clean(education.get("level")),
                        school_name=_clean(education.get("schoolName")),
                        degree_course=_clean(education.get("basicEducationDegreeCourse")) or None,
                        period_from=period_from,
                        period_to=_to_optional_date(education.get("periodTo")),
                        highest_level_attained=_clean(education.get("highestLevelUnitsEarned")) or None,
                        year_graduated=_clean(education.get("yearGraduated")) or None,
                        academic_awards=_clean(education.get("scholarshipAcademicHonorsReceived")) or None,
                    )
                )
                education_created += 1
            stage_results.append(
                {"stage": "educational_backgrounds", "created": education_created, "skipped": education_skipped}
            )

            eligibility_created = 0
            eligibility_skipped = 0
            eligibility_entries = _list_of_dicts(form_data.get("civilServiceEligibility"))
            for eligibility in eligibility_entries:
                if (
                    not _has_value(eligibility.get("careerService"))
                    or not _has_value(eligibility.get("rating"))
                    or not _has_value(eligibility.get("dateOfExamination"))
                    or not _has_value(eligibility.get("placeOfExamination"))
                ):
                    eligibility_skipped += 1
                    continue
                session.add(
                    CivilServiceEligibility(
                        basic_information_id=basic_information_id,
                        career_service=_clean(eligibility.get("careerService")),
                        rating=_clean(eligibility.get("rating")),
                        date_of_examination=_to_required_date(
                            eligibility.get("dateOfExamination"),
                            "civilServiceEligibility[].dateOfExamination",
                        ),
                        place_of_examination=_clean(eligibility.get("placeOfExamination")),
                        license_no=_clean(eligibility.get("licenseNumber")) or None,
                        date_of_validity=_to_optional_date(eligibility.get("dateOfValidity")),
                    )
                )
                eligibility_created += 1
            stage_results.append(
                {
                    "stage": "civil_service_eligibility",
                    "created": eligibility_created,
                    "skipped": eligibility_skipped,
                }
            )

            work_created = 0
            work_skipped = 0
            for work in work_experience:
                if (
                    not _has_value(work.get("positionTitle"))
                    or not _has_value(work.get("department"))
                    or not _has_value(work.get("statusOfAppointment"))
                    or not _has_value(work.get("dateFrom"))
                ):
                    work_skipped += 1
                    continue
                session.add(
                    WorkExperienceRecord(
                        basic_information_id=basic_information_id,
                        position_title=_clean(work.get("positionTitle")),
                        department=_clean(work.get("department")),
                        monthly_salary=_clean(work.get("monthlySalary")) or None,
                        salary_grade=_clean(work.get("salaryGrade")) or None,
                        status_of_appointment=_clean(work.get("statusOfAppointment")),
                        date_from=_to_required_date(work.get("dateFrom"), "workExperience[].dateFrom"),
                        date_to=_to_optional_date(work.get("dateTo")),
                        government_service=bool(work.get("isGovernmentService")),
                    )
                )
                work_created += 1
            stage_results.append({"stage": "work_experience", "created": work_created, "skipped": work_skipped})

            voluntary_entries = _list_of_dicts(form_data.get("voluntaryWork"))
            voluntary_created = 0
            voluntary_skipped = 0
            for voluntary in voluntary_entries:
                if (
                    not _has_value(voluntary.get("organizationName"))
                    or not _has_value(voluntary.get("organizationAddress"))
                    or not _has_value(voluntary.get("dateFrom"))
                    or not _has_value(voluntary.get("numberOfHours"))
                    or not _has_value(voluntary.get("positionNatureOfWork"))
                ):
                    voluntary_skipped += 1
                    continue
                session.add(
                    VoluntaryRecord(
                        basic_information_id=basic_information_id,
                        organization_name=_clean(voluntary.get("organizationName")),
                        organization_address=_clean(voluntary.get("organizationAddress")),
                        date_from=_to_required_date(voluntary.get("dateFrom"), "voluntaryWork[].dateFrom"),
                        date_to=_to_optional_date(voluntary.get("dateTo")),
                        number_of_hours=_clean(voluntary.get("numberOfHours")),
                        position=_clean(voluntary.get("positionNatureOfWork")),
                    )
                )
                voluntary_created += 1
            stage_results.append({"stage": "voluntary_work", "created": voluntary_created, "skipped": voluntary_skipped})

            learning_entries = _list_of_dicts(form_data.get("learningDevelopment"))
            training_created = 0
            training_skipped = 0
            for training in learning_entries:
                if (
                    not _has_value(training.get("title"))
                    or not _has_value(training.get("dateFrom"))
                    or not _has_value(training.get("dateTo"))
                    or not _has_value(training.get("numberOfHours"))
                    or not _has_value(training.get("type"))
                    or not _has_value(training.get("conductedSponsoredBy"))
                ):
                    training_skipped += 1
                    continue
                session.add(
                    TrainingRecord(
                        basic_information_id=basic_information_id,
                        training_title=_clean(training.get("title")),
                        date_from=_to_required_date(training.get("dateFrom"), "learningDevelopment[].dateFrom"),
                        date_to=_to_required_date(training.get("dateTo"), "learningDevelopment[].dateTo"),
                        number_of_hours=_clean(training.get("numberOfHours")),
                        training_type=_clean(training.get("type")),
                        conducted_by=_clean(training.get("conductedSponsoredBy")),
                    )
                )
                training_created += 1
            stage_results.append({"stage": "training", "created": training_created, "skipped": training_skipped})

            other_info = form_data.get("otherInfo") or {}
            other_entries = []
            for info in other_info.get("specialSkillsHobbies") or []:
                other_entries.append({"info_type": "special_skills", "information": info})
            for info in other_info.get("nonAcademicDistinctions") or []:
                other_entries.append({"info_type": "non_academic_recognitions", "information": info})
            for info in other_info.get("membershipInAssociations") or []:
                other_entries.append({"info_type": "organization_memberships", "information": info})

            other_created = 0
            other_skipped = 0
            for entry in other_entries:
                if not _has_value(entry.get("information")):
                    other_skipped += 1
                    continue
                session.add(
                    OtherInformation(
                        basic_information_id=basic_information_id,
                        info_type=entry["info_type"],
                        information=_clean(entry["information"]),
                    )
                )
                other_created += 1
            stage_results.append({"stage": "other_information", "created": other_created, "skipped": other_skipped})

            references = _list_of_dicts(form_data.get("references"))
            reference_created = 0
            reference_skipped = 0
            for reference in references:
                if (
                    not _has_value(reference.get("name"))
                    or not _has_value(reference.get("address"))
                    or not _has_value(reference.get("telephoneNo"))
                ):
                    reference_skipped += 1
                    continue
                session.add(
                    ReferenceRecord(
                        basic_information_id=basic_information_id,
                        name=_clean(reference.get("name")),
                        address=_clean(reference.get("address")),
                        telephone_no=_clean(reference.get("telephoneNo")),
                    )
                )
                reference_created += 1
            stage_results.append({"stage": "reference_records", "created": reference_created, "skipped": reference_skipped})

            primary_gov_id = form_data.get("governmentIssuedId") or {}
            has_primary_gov_id = (
                _has_value(primary_gov_id.get("idType"))
                and _has_value(primary_gov_id.get("idNumber"))
                and _has_value(primary_gov_id.get("dateOfIssuance"))
                and _has_value(primary_gov_id.get("placeOfIssuance"))
            )
            if has_primary_gov_id:
                session.add(
                    PrimaryGovernmentId(
                        basic_information_id=basic_information_id,
                        id_type=_clean(primary_gov_id.get("idType")),
                        id_number=_clean(primary_gov_id.get("idNumber")),
                        date_of_issuance=_to_required_date(
                            primary_gov_id.get("dateOfIssuance"),
                            "governmentIssuedId.dateOfIssuance",
                        ),
                        place_of_issuance=_clean(primary_gov_id.get("placeOfIssuance")),
                    )
                )
                stage_results.append({"stage": "primary_government_id", "created": 1, "skipped": 0})
            else:
                stage_results.append({"stage": "primary_government_id", "created": 0, "skipped": 1})

            date_accomplished = _to_optional_date(form_data.get("dateAccomplished"))
            if date_accomplished:
                session.add(
                    RecordCompletion(
                        basic_information_id=basic_information_id,
                        date_of_accomplishment=date_accomplished,
                    )
                )
                stage_results.append({"stage": "record_completion", "created": 1, "skipped": 0})
            else:
                stage_results.append({"stage": "record_completion", "created": 0, "skipped": 1})
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid onboarding payload: {exc}",
        ) from exc

    return create_response(
        path=request.url.path,
        data={
            "employeeNo": employee_no,
            "stages": stage_results,
        },
        success=True,
    )


@router.get("", response_model=APIResponse)
async def list_employees(
    request: Request,
    skip: int = 0,
    limit: int = 10,
    session: AsyncSession = Depends(get_db),
):
    """List all employee records."""
    service = EmployeeService(session)
    records = await service.get_all(skip=skip, limit=limit)
    total_records = await service.count_all()
    
    return create_response(
        path=request.url.path,
        data=[record.model_dump() for record in records],
        meta=build_pagination_meta(skip=skip, limit=limit, total_records=total_records),
        success=True,
    )


@router.get("/all", response_model=APIResponse)
async def list_all_employees(
    request: Request,
    skip: int = 0,
    limit: int = 10,
    session: AsyncSession = Depends(get_db),
):
    """List employees with basic and contact details."""
    service = EmployeeService(session)
    records = await service.get_all_with_details(skip=skip, limit=limit)
    total_records = await service.count_all()

    return create_response(
        path=request.url.path,
        data=records,
        meta=build_pagination_meta(skip=skip, limit=limit, total_records=total_records),
        success=True,
    )


@router.get("/{employee_no}", response_model=APIResponse)
async def get_employee(
    request: Request,
    employee_no: str,
    session: AsyncSession = Depends(get_db),
):
    """Get an employee by employee number."""
    service = EmployeeService(session)
    record = await service.get_by_employee_no(employee_no)
    
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found",
        )
    
    return create_response(
        path=request.url.path,
        data=record.model_dump(),
        success=True,
    )


@router.patch("/{employee_no}", response_model=APIResponse)
async def update_employee(
    request: Request,
    employee_no: str,
    data: EmployeeUpdate,
    session: AsyncSession = Depends(get_db),
):
    """Update an employee record by employee number."""
    service = EmployeeService(session)
    record = await service.get_by_employee_no(employee_no)
    
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found",
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


@router.delete("/{employee_no}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_employee(
    employee_no: str,
    session: AsyncSession = Depends(get_db),
):
    """Soft delete an employee record by employee number."""
    service = EmployeeService(session)
    employee = await service.get_by_employee_no(employee_no)
    
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found",
        )
    
    success = await service.remove(employee.id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found",
        )


@router.post("/{employee_no}/restore", response_model=APIResponse)
async def restore_employee(
    request: Request,
    employee_no: str,
    session: AsyncSession = Depends(get_db),
):
    """Restore a soft deleted employee record by employee number."""
    service = EmployeeService(session)
    employee = await service.get_by_employee_no(employee_no)
    
    if not employee or not employee.is_deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found or not deleted",
        )
    
    success = await service.restore(employee.id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Failed to restore employee",
        )
    
    record = await service.get_by_employee_no(employee_no)
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found after restore",
        )

    return create_response(
        path=request.url.path,
        data=record.model_dump(),
        success=True,
    )
