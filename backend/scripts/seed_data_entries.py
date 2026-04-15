"""Seed realistic onboarding records through the API.

Usage examples:
    python backend/scripts/seed_onboard_api_data.py
    python backend/scripts/seed_onboard_api_data.py --count 25
    python backend/scripts/seed_onboard_api_data.py --base-url http://127.0.0.1:3000 --endpoint /api/employees/onboard

By default this targets the backend atomic endpoint:
    http://127.0.0.1:8000/api/employees/onboard-atomic
"""

from __future__ import annotations

import argparse
import logging
import random
import time
from dataclasses import dataclass
from datetime import date, timedelta
from typing import Any

import requests


LOGGER = logging.getLogger("seed_onboard_api")


FIRST_NAMES_MALE = [
    "Juan",
    "Miguel",
    "Paolo",
    "Rafael",
    "Jose",
    "Mark",
    "Angelo",
    "Carl",
    "Noel",
    "Anthony",
    "Daniel",
    "Jerome",
    "Vincent",
    "Elijah",
    "Francis",
    "Marvin",
    "Nathan",
    "Adrian",
    "Brian",
    "Kenneth",
]

FIRST_NAMES_FEMALE = [
    "Maria",
    "Ana",
    "Patricia",
    "Angela",
    "Sofia",
    "Camille",
    "Lourdes",
    "Therese",
    "Grace",
    "Catherine",
    "Danica",
    "Bianca",
    "Clarisse",
    "Mariel",
    "Kristine",
    "Jasmine",
    "Rachelle",
    "Bea",
    "Nina",
    "Joy",
]

LAST_NAMES = [
    "Santos",
    "Reyes",
    "Dela Cruz",
    "Garcia",
    "Mendoza",
    "Aquino",
    "Castro",
    "Villanueva",
    "Fernandez",
    "Lopez",
    "Torres",
    "Bautista",
    "Ramos",
    "Diaz",
    "Gutierrez",
    "Domingo",
    "Manalo",
    "Soriano",
    "Salazar",
    "Pineda",
    "Yap",
    "Lim",
]

MIDDLE_NAMES = [
    "Cruz",
    "Bautista",
    "Navarro",
    "Valdez",
    "Morales",
    "Hernandez",
    "Alvarez",
    "Pascual",
    "Santiago",
    "Rivera",
    "Flores",
    "Delos Santos",
    "Gonzales",
    "Manansala",
    "Domingo",
]

OFFICES = [
    "COS",
    "COE",
    "CBA",
    "CHAS",
    "CAS",
    "CIT",
    "CCJE",
    "Admin",
    "Registrar",
    "Accounting",
    "HRMO",
    "Library",
    "Clinic",
    "MIS",
]

EMPLOYMENT_STATUSES = ["Teaching", "Non-Teaching", "COS"]
WORK_STATUSES = ["Permanent", "Temporary", "Casual", "Contractual", "COS"]
ELIGIBILITY_TYPES = [
    "Career Service Professional",
    "Career Service Subprofessional",
    "RA 1080",
    "BAR/Board Eligibility",
    "Barangay Official Eligibility",
    "PD 907 (Honor Graduate Eligibility)",
    "Sanggunian Member Eligibility",
]
GOV_ID_TYPES = [
    "Passport",
    "GSIS",
    "SSS",
    "PRC",
    "Postal ID",
    "Driver's License",
    "National ID",
    "Voter's ID",
    "UMID",
]

BARANGAYS = [
    "Poblacion",
    "San Roque",
    "San Isidro",
    "Bagong Silang",
    "Santa Maria",
    "Mabini",
    "Talon",
    "San Jose",
    "Balintawak",
    "Lawang Bato",
    "Pandan",
    "San Antonio",
]

CITIES = [
    "Quezon City",
    "Makati City",
    "Pasig City",
    "Taguig City",
    "Iloilo City",
    "Davao City",
    "Cebu City",
    "Bacolod City",
    "Cagayan de Oro City",
    "General Santos City",
    "Baguio City",
    "Iligan City",
]

PROVINCES = [
    "Metro Manila",
    "Cebu",
    "Davao del Sur",
    "Iloilo",
    "Laguna",
    "Batangas",
    "Bulacan",
    "Cavite",
    "Pangasinan",
    "Misamis Oriental",
]

DEPARTMENTS = [
    "Human Resource Management Office",
    "Accounting Department",
    "Planning and Development",
    "Administrative Services",
    "Procurement Office",
    "General Services Office",
    "Internal Audit",
    "Information Systems Unit",
    "Legal Affairs Office",
    "Academic Affairs Office",
]

POSITION_TITLES = [
    "Administrative Officer I",
    "Administrative Assistant II",
    "HR Assistant",
    "Planning Officer",
    "Planning Officer I",
    "Records Officer",
    "Budget Analyst",
    "Project Development Officer I",
    "Management Information Systems Officer",
    "Administrative Aide VI",
]

TRAINING_TITLES = [
    "Records Management and Archiving",
    "Data Privacy and Information Security",
    "Public Service Ethics and Accountability",
    "Financial Management for Public Officers",
    "Digital Governance and e-Services",
    "Basic Leadership and Supervision",
    "Strategic Human Resource Development",
    "Gender and Development Mainstreaming",
    "Performance Management System Orientation",
    "Procurement Planning and Compliance",
    "Customer Service Excellence in Government",
]

TRAINING_TYPES = ["Managerial", "Supervisory", "Technical", "Foundational", "Leadership"]
TRAINING_SPONSORS = ["CSC", "DILG", "TESDA", "DBM", "DOLE", "CHED", "COA", "NEDA"]

VOLUNTARY_ORGS = [
    "Philippine Red Cross",
    "Barangay Disaster Response Team",
    "Community Outreach Volunteers",
    "Local Environmental Action Group",
    "Senior Citizen Welfare Council",
    "Youth Development Network",
    "City Health Advocacy Group",
    "Women in Public Service Coalition",
]

NATURE_OF_WORK = ["Volunteer", "Coordinator", "Facilitator", "Documenter", "Organizer", "Trainer"]

SCHOOL_PREFIXES = [
    "San Isidro",
    "Sta. Maria",
    "Rizal",
    "Mabini",
    "Central",
    "National",
    "City",
    "Ramon",
    "Andres",
    "Magsaysay",
    "Bonifacio",
]

SCHOOL_SUFFIXES = [
    "Elementary School",
    "National High School",
    "Science High School",
    "State University",
    "Polytechnic University",
    "College of Technology",
    "Integrated School",
    "Institute of Management",
]

COLLEGE_COURSES = [
    "Bachelor of Science in Public Administration",
    "Bachelor of Science in Information Technology",
    "Bachelor of Science in Accountancy",
    "Bachelor of Arts in Communication",
    "Bachelor of Science in Office Administration",
    "Bachelor of Science in Business Administration",
]

GRADUATE_COURSES = [
    "Master in Public Management",
    "Master in Business Administration",
    "Master of Arts in Education",
    "Master of Information Systems",
]

ADDRESS_STREETS = [
    "Rizal",
    "Bonifacio",
    "Mabini",
    "Luna",
    "Quezon",
    "Del Pilar",
    "Aguinaldo",
    "Burgos",
]

ADDRESS_SUBDIVISIONS = [
    "Sunrise",
    "Greenfield",
    "Riverbend",
    "Grandview",
    "Palm Grove",
    "Northgate",
    "Southridge",
]

BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]

SPOUSE_OCCUPATIONS = [
    "Teacher",
    "Nurse",
    "Engineer",
    "Accountant",
    "Administrative Staff",
    "Entrepreneur",
]

SPOUSE_EMPLOYERS = [
    "City Schools Division",
    "Provincial Government Office",
    "Regional Hospital",
    "Private Logistics Company",
    "Local Cooperative",
]

HONORS = ["", "With Honors", "With High Honors", "Dean's List", "Cum Laude"]

SPECIAL_SKILLS_HOBBIES = [
    "Public speaking",
    "Excel analytics",
    "Report writing",
    "Community facilitation",
    "Project coordination",
    "Policy drafting",
    "Database management",
    "Event planning",
    "Team mentoring",
]

NON_ACADEMIC_DISTINCTIONS = [
    "Employee of the Month",
    "Service Excellence Award",
    "Leadership Award",
    "Outstanding Community Service",
    "Innovation in Public Service",
]

ASSOCIATIONS = [
    "Philippine Society for Public Administration",
    "HR Practitioners Association",
    "Local Government Officers Guild",
    "Philippine Institute of Civil Service Professionals",
    "Public Sector Records Management Network",
]


@dataclass(frozen=True)
class SeedResult:
    """Result details for one API insert call."""

    employee_no: str
    success: bool
    http_status: int
    message: str


def parse_args() -> argparse.Namespace:
    """Parse command-line arguments."""
    parser = argparse.ArgumentParser(description="Seed realistic onboarding entries via API")
    parser.add_argument("--base-url", default="http://127.0.0.1:8000", help="API base URL")
    parser.add_argument(
        "--endpoint",
        default="/api/employees/onboard-atomic",
        help="Onboarding endpoint path (e.g. /api/employees/onboard or /api/employees/onboard-atomic)",
    )
    parser.add_argument("--count", type=int, default=24, help="Number of employees to create")
    parser.add_argument("--timeout", type=int, default=25, help="Request timeout in seconds")
    parser.add_argument("--pause-ms", type=int, default=120, help="Pause between requests in milliseconds")
    parser.add_argument("--seed", type=int, default=None, help="Optional random seed for reproducibility")
    return parser.parse_args()


def _random_date(rng: random.Random, start_year: int, end_year: int) -> date:
    """Return a random date between Jan 1 of start_year and Dec 31 of end_year."""
    start = date(start_year, 1, 1)
    end = date(end_year, 12, 31)
    delta_days = (end - start).days
    return start + timedelta(days=rng.randint(0, max(delta_days, 1)))


def _fmt(value: date) -> str:
    """Format date as ISO date string."""
    return value.isoformat()


def _digits(rng: random.Random, length: int) -> str:
    """Generate a numeric string with a fixed length."""
    return "".join(str(rng.randint(0, 9)) for _ in range(length))


def _school_name(rng: random.Random) -> str:
    """Generate a realistic school name."""
    return f"{rng.choice(SCHOOL_PREFIXES)} {rng.choice(SCHOOL_SUFFIXES)}"


def _address(rng: random.Random) -> dict[str, str]:
    """Generate a realistic address object based on onboard form structure."""
    return {
        "houseBlockLot": f"Blk {rng.randint(1, 18)} Lot {rng.randint(1, 45)}",
        "street": f"{rng.choice(ADDRESS_STREETS)} Street",
        "subdivision": f"{rng.choice(ADDRESS_SUBDIVISIONS)} Subdivision",
        "barangay": rng.choice(BARANGAYS),
        "cityMunicipality": rng.choice(CITIES),
        "province": rng.choice(PROVINCES),
        "zipCode": str(rng.randint(1000, 9800)),
    }


def _build_education(rng: random.Random, birth_year: int) -> list[dict[str, str]]:
    """Build education array aligned with the onboard page structure."""
    levels = ["Elementary", "Secondary", "College"]
    entries: list[dict[str, str]] = []

    elementary_from = birth_year + 6
    secondary_from = elementary_from + 6
    college_from = secondary_from + 4

    ranges = [
        (levels[0], elementary_from, elementary_from + 6, "Completed"),
        (levels[1], secondary_from, secondary_from + 4, "Completed"),
        (levels[2], college_from, college_from + 4, "Graduated"),
    ]

    for level, start, end, attainment in ranges:
        degree_or_course = (
            rng.choice(COLLEGE_COURSES)
            if level == "College"
            else "General Curriculum"
        )
        entries.append(
            {
                "level": level,
                "schoolName": _school_name(rng),
                "basicEducationDegreeCourse": degree_or_course,
                "periodFrom": str(start),
                "periodTo": str(end),
                "highestLevelUnitsEarned": attainment,
                "yearGraduated": str(end),
                "scholarshipAcademicHonorsReceived": rng.choice(HONORS),
            }
        )

    if rng.random() < 0.45:
        grad_from = college_from + 6
        grad_to = grad_from + 2
        entries.append(
            {
                "level": "Graduate Studies",
                "schoolName": _school_name(rng),
                "basicEducationDegreeCourse": rng.choice(GRADUATE_COURSES),
                "periodFrom": str(grad_from),
                "periodTo": str(grad_to),
                "highestLevelUnitsEarned": "Graduated",
                "yearGraduated": str(grad_to),
                "scholarshipAcademicHonorsReceived": rng.choice(HONORS),
            }
        )

    return entries


def _build_payload(index: int, batch_tag: int, rng: random.Random) -> tuple[str, dict[str, Any]]:
    """Build one realistic onboarding payload matching the employees/onboard flow."""
    sex = rng.choice(["Male", "Female"])
    first_name = rng.choice(FIRST_NAMES_MALE if sex == "Male" else FIRST_NAMES_FEMALE)
    middle_name = rng.choice(MIDDLE_NAMES)
    surname = rng.choice(LAST_NAMES)

    employee_no = f"EMP-{date.today().year}-{_digits(rng, 4)}-{index:03d}"
    office = rng.choice(OFFICES)
    employment_status = rng.choice(EMPLOYMENT_STATUSES)

    date_of_birth = _random_date(rng, 1979, 2000)
    date_hired = _random_date(rng, max(date_of_birth.year + 20, 2001), 2026)

    civil_status = rng.choice(["Single", "Married", "Married", "Separated", "Widowed"])
    has_spouse = civil_status == "Married"

    father_first = rng.choice(FIRST_NAMES_MALE)
    mother_first = rng.choice(FIRST_NAMES_FEMALE)

    children: list[dict[str, str]] = []
    if has_spouse and rng.random() < 0.65:
        for _ in range(rng.randint(1, 4)):
            child_first = rng.choice(FIRST_NAMES_MALE + FIRST_NAMES_FEMALE)
            child_middle = rng.choice(MIDDLE_NAMES)
            child_birth = _random_date(rng, max(date_hired.year, 2010), 2024)
            children.append(
                {
                    "fullName": f"{surname}, {child_first} {child_middle}",
                    "surname": surname,
                    "firstName": child_first,
                    "middleName": child_middle,
                    "nameExtension": "",
                    "dateOfBirth": _fmt(child_birth),
                }
            )

    eligibility_records: list[dict[str, str]] = []
    for _ in range(rng.randint(1, 2)):
        eligibility_exam = _random_date(rng, 2010, 2024)
        eligibility_records.append(
            {
                "careerService": rng.choice(ELIGIBILITY_TYPES),
                "rating": str(rng.randint(78, 98)),
                "dateOfExamination": _fmt(eligibility_exam),
                "placeOfExamination": rng.choice(CITIES),
                "licenseNumber": f"ELG-{_digits(rng, 7)}",
                "dateOfValidity": _fmt(eligibility_exam + timedelta(days=365 * rng.randint(3, 7))),
            }
        )

    work_experience: list[dict[str, Any]] = []
    experience_count = rng.randint(1, 3)
    work_start_anchor = max(date_hired.year - 10, 2005)
    for experience_idx in range(experience_count):
        date_from = _random_date(rng, work_start_anchor + experience_idx, 2025)
        is_latest = experience_idx == experience_count - 1
        date_to = "" if is_latest or rng.random() < 0.55 else _fmt(date_from + timedelta(days=rng.randint(360, 1200)))
        work_experience.append(
            {
                "dateFrom": _fmt(date_from),
                "dateTo": date_to,
                "positionTitle": rng.choice(POSITION_TITLES),
                "department": rng.choice(DEPARTMENTS),
                "monthlySalary": str(rng.randint(20000, 85000)),
                "salaryGrade": rng.choice(["8", "10", "11", "12", "13", "15", "18"]),
                "statusOfAppointment": rng.choice(WORK_STATUSES),
                "isGovernmentService": rng.random() < 0.85,
            }
        )

    voluntary_work: list[dict[str, str]] = []
    for _ in range(rng.randint(1, 3)):
        voluntary_from = _random_date(rng, 2016, 2024)
        voluntary_to = voluntary_from + timedelta(days=rng.randint(120, 900))
        voluntary_work.append(
            {
                "organizationName": rng.choice(VOLUNTARY_ORGS),
                "organizationAddress": f"{rng.choice(CITIES)}, {rng.choice(PROVINCES)}",
                "dateFrom": _fmt(voluntary_from),
                "dateTo": _fmt(voluntary_to),
                "numberOfHours": str(rng.randint(24, 420)),
                "positionNatureOfWork": rng.choice(NATURE_OF_WORK),
            }
        )

    learning_development: list[dict[str, str]] = []
    for _ in range(rng.randint(1, 4)):
        training_from = _random_date(rng, 2019, 2025)
        training_to = training_from + timedelta(days=rng.randint(1, 7))
        learning_development.append(
            {
                "title": rng.choice(TRAINING_TITLES),
                "dateFrom": _fmt(training_from),
                "dateTo": _fmt(training_to),
                "numberOfHours": str(rng.choice([4, 8, 12, 16, 24, 32, 40, 56])),
                "type": rng.choice(TRAINING_TYPES),
                "conductedSponsoredBy": rng.choice(TRAINING_SPONSORS),
            }
        )

    references: list[dict[str, str]] = []
    for _ in range(rng.randint(3, 5)):
        references.append(
            {
                "name": f"{rng.choice(FIRST_NAMES_MALE + FIRST_NAMES_FEMALE)} {rng.choice(LAST_NAMES)}",
                "address": f"{rng.choice(CITIES)}, {rng.choice(PROVINCES)}",
                "telephoneNo": f"09{_digits(rng, 9)}",
            }
        )

    selected_skills = rng.sample(SPECIAL_SKILLS_HOBBIES, k=rng.randint(2, 4))
    selected_distinctions = rng.sample(NON_ACADEMIC_DISTINCTIONS, k=rng.randint(1, 3))
    selected_associations = rng.sample(ASSOCIATIONS, k=rng.randint(1, 2))

    payload: dict[str, Any] = {
        "employeeMeta": {
            "employeeNo": employee_no,
            "positionTitle": rng.choice(POSITION_TITLES),
            "dateHired": _fmt(date_hired),
        },
        "formData": {
            "office": office,
            "employmentStatus": employment_status,
            "dateAccomplished": _fmt(date.today()),
            "personalInfo": {
                "surname": surname,
                "firstName": first_name,
                "middleName": middle_name,
                "nameExtension": "",
                "dateOfBirth": _fmt(date_of_birth),
                "placeOfBirth": rng.choice(CITIES),
                "sex": sex,
                "civilStatus": civil_status,
                "height": f"{rng.uniform(1.52, 1.83):.2f}",
                "weight": str(rng.randint(50, 88)),
                "bloodType": rng.choice(BLOOD_TYPES),
                "gsisIdNo": f"{_digits(rng, 4)}-{_digits(rng, 7)}-{_digits(rng, 1)}",
                "pagIbigIdNo": _digits(rng, 12),
                "philhealthNo": f"{_digits(rng, 2)}-{_digits(rng, 9)}-{_digits(rng, 1)}",
                "sssNo": f"{_digits(rng, 2)}-{_digits(rng, 7)}-{_digits(rng, 1)}",
                "tinNo": f"{_digits(rng, 3)}-{_digits(rng, 3)}-{_digits(rng, 3)}",
                "agencyEmployeeNo": f"AEN-{batch_tag}-{index:03d}",
                "citizenship": "Filipino",
                "residentialAddress": _address(rng),
                "permanentAddress": _address(rng),
                "telephoneNo": f"(02) 8{_digits(rng, 6)}",
                "mobileNo": f"09{_digits(rng, 9)}",
                "email": f"{first_name.lower()}.{surname.lower().replace(' ', '')}.{index}@hrmo.local",
            },
            "familyBackground": {
                "spouseSurname": rng.choice(LAST_NAMES) if has_spouse else "",
                "spouseFirstName": rng.choice(FIRST_NAMES_FEMALE if sex == "Male" else FIRST_NAMES_MALE)
                if has_spouse
                else "",
                "spouseMiddleName": rng.choice(MIDDLE_NAMES) if has_spouse else "",
                "spouseNameExtension": "",
                "spouseOccupation": rng.choice(SPOUSE_OCCUPATIONS) if has_spouse else "",
                "spouseEmployerBusinessName": rng.choice(SPOUSE_EMPLOYERS) if has_spouse else "",
                "spouseBusinessAddress": rng.choice(CITIES) if has_spouse else "",
                "spouseTelephoneNo": f"(02) 8{_digits(rng, 6)}" if has_spouse else "",
                "fatherSurname": surname,
                "fatherFirstName": father_first,
                "fatherMiddleName": rng.choice(MIDDLE_NAMES),
                "fatherNameExtension": rng.choice(["", "Sr.", "Jr.", "III"]),
                "motherMaidenSurname": rng.choice(LAST_NAMES),
                "motherFirstName": mother_first,
                "motherMiddleName": rng.choice(MIDDLE_NAMES),
                "children": children,
            },
            "education": _build_education(rng, date_of_birth.year),
            "civilServiceEligibility": eligibility_records,
            "workExperience": work_experience,
            "voluntaryWork": voluntary_work,
            "learningDevelopment": learning_development,
            "otherInfo": {
                "specialSkillsHobbies": selected_skills,
                "nonAcademicDistinctions": selected_distinctions,
                "membershipInAssociations": selected_associations,
            },
            "references": references,
            "governmentIssuedId": {
                "idType": rng.choice(GOV_ID_TYPES),
                "idNumber": f"ID-{_digits(rng, 10)}",
                "dateOfIssuance": _fmt(_random_date(rng, 2018, 2025)),
                "placeOfIssuance": rng.choice(CITIES),
            },
        },
    }

    return employee_no, payload


def _extract_message(body: Any) -> str:
    """Extract a human-readable message from the API response body."""
    if not isinstance(body, dict):
        return "No JSON body"

    if "message" in body and body.get("message"):
        return str(body.get("message"))

    data = body.get("data")
    if isinstance(data, dict):
        if data.get("message"):
            return str(data.get("message"))
        if data.get("status_code"):
            return f"status_code={data.get('status_code')}"

    return "No message"


def _post_payload(
    session: requests.Session,
    url: str,
    payload: dict[str, Any],
    timeout_seconds: int,
    employee_no: str,
) -> SeedResult:
    """POST one onboarding payload and return normalized result."""
    try:
        response = session.post(url, json=payload, timeout=timeout_seconds)
        try:
            response_body: Any = response.json()
        except ValueError:
            response_body = None

        ok = response.ok and isinstance(response_body, dict) and bool(response_body.get("success", True))
        message = _extract_message(response_body)
        return SeedResult(
            employee_no=employee_no,
            success=ok,
            http_status=response.status_code,
            message=message,
        )
    except requests.RequestException as exc:
        return SeedResult(
            employee_no=employee_no,
            success=False,
            http_status=0,
            message=f"Request failed: {exc}",
        )


def seed_data(
    base_url: str,
    endpoint: str,
    count: int,
    timeout_seconds: int,
    pause_ms: int,
    rng: random.Random,
) -> list[SeedResult]:
    """Insert multiple onboarding entries using the configured API endpoint."""
    normalized_base = base_url.rstrip("/")
    normalized_endpoint = endpoint if endpoint.startswith("/") else f"/{endpoint}"
    target_url = f"{normalized_base}{normalized_endpoint}"

    batch_tag = int(time.time())
    LOGGER.info("Target URL: %s", target_url)
    LOGGER.info("Generating %d realistic onboarding entries", count)

    session = requests.Session()
    results: list[SeedResult] = []

    for idx in range(1, count + 1):
        employee_no, payload = _build_payload(idx, batch_tag, rng)
        result = _post_payload(
            session=session,
            url=target_url,
            payload=payload,
            timeout_seconds=timeout_seconds,
            employee_no=employee_no,
        )
        results.append(result)

        if result.success:
            LOGGER.info("[%02d/%02d] CREATED %s (HTTP %s)", idx, count, result.employee_no, result.http_status)
        else:
            LOGGER.error(
                "[%02d/%02d] FAILED  %s (HTTP %s) -> %s",
                idx,
                count,
                result.employee_no,
                result.http_status,
                result.message,
            )

        if pause_ms > 0 and idx < count:
            time.sleep(pause_ms / 1000.0)

    return results


def log_summary(results: list[SeedResult]) -> None:
    """Log summary of seeding run."""
    total = len(results)
    success_count = sum(1 for result in results if result.success)
    fail_count = total - success_count

    LOGGER.info("--- Seeding Summary ---")
    LOGGER.info("Total attempted: %d", total)
    LOGGER.info("Successful: %d", success_count)
    LOGGER.info("Failed: %d", fail_count)

    if fail_count:
        LOGGER.info("Failed employee numbers:")
        for result in results:
            if not result.success:
                LOGGER.info("- %s (HTTP %s): %s", result.employee_no, result.http_status, result.message)


def main() -> None:
    """Program entry point."""
    args = parse_args()
    logging.basicConfig(level=logging.INFO, format="%(asctime)s | %(levelname)s | %(message)s")

    if args.count < 1:
        raise ValueError("count must be at least 1")

    rng = random.Random(args.seed)
    results = seed_data(
        base_url=args.base_url,
        endpoint=args.endpoint,
        count=args.count,
        timeout_seconds=args.timeout,
        pause_ms=args.pause_ms,
        rng=rng,
    )
    log_summary(results)


if __name__ == "__main__":
    main()