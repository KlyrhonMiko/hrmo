"""Router for dashboard analytics endpoints."""
from __future__ import annotations

import re
from datetime import date, datetime, timedelta

from fastapi import APIRouter, Depends, Request
from sqlalchemy import and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from core.database import get_db
from models.employees import CertificateRecord, Employee
from models.personal_background import RecordCompletion
from models.personal_information import BasicInformation
from models.training_tracking import TrainingEvent, TrainingEventParticipant
from utils.response import APIResponse, create_response

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

_STATUS_COLORS = [
    "#10b981",
    "#94a3b8",
    "#6366f1",
    "#f59e0b",
    "#06b6d4",
    "#78716c",
    "#16a34a",
    "#14b8a6",
]


def _clean(value: object | None) -> str:
    return str(value).strip() if value is not None else ""


def _slug(value: object | None) -> str:
    cleaned = _clean(value).lower()
    return re.sub(r"[^a-z0-9]+", " ", cleaned).strip()


def _status_key(value: object | None) -> str:
    slug = _slug(value)
    if not slug:
        return "unspecified"
    return slug.replace(" ", "_")


def _status_label(value: object | None) -> str:
    cleaned = _clean(value)
    return cleaned if cleaned else "Unspecified"


def _is_teaching_status(value: object | None) -> bool:
    normalized = _slug(value)
    if not normalized:
        return False
    if "non" in normalized and "teach" in normalized:
        return False
    return "teach" in normalized


def _is_non_teaching_status(value: object | None) -> bool:
    normalized = _slug(value)
    return "non" in normalized and "teach" in normalized


def _is_cos_status(value: object | None) -> bool:
    normalized = _slug(value)
    return (
        normalized == "cos"
        or "contract of service" in normalized
        or "contract of services" in normalized
    )


def _is_completed_status(value: object | None) -> bool:
    normalized = _slug(value)
    return normalized in {"completed", "complete", "done", "finished"}


def _employee_display_name(
    employee_no: str,
    surname: str | None,
    first_name: str | None,
    middle_name: str | None,
) -> str:
    surname_clean = _clean(surname)
    first_clean = _clean(first_name)
    middle_clean = _clean(middle_name)

    if not surname_clean and not first_clean:
        return employee_no

    middle_initial = f" {middle_clean[0]}." if middle_clean else ""
    return f"{surname_clean}, {first_clean}{middle_initial}".strip()


@router.get("/stats", response_model=APIResponse)
async def get_dashboard_stats(
    request: Request,
    session: AsyncSession = Depends(get_db),
):
    """Return KPI card values for the HRMO dashboard."""
    employee_stmt = select(
        Employee.id,
        Employee.employment_status,
        Employee.date_hired,
    ).where(Employee.is_deleted == False)
    employee_rows = (await session.execute(employee_stmt)).all()

    total_employees = len(employee_rows)
    teaching_staff = sum(1 for row in employee_rows if _is_teaching_status(row.employment_status))
    non_teaching = sum(1 for row in employee_rows if _is_non_teaching_status(row.employment_status))
    cos_count = sum(1 for row in employee_rows if _is_cos_status(row.employment_status))

    current_year = datetime.utcnow().year
    hired_this_year = sum(
        1
        for row in employee_rows
        if row.date_hired is not None and row.date_hired.year == current_year
    )

    pending_cert_stmt = select(CertificateRecord.id).where(
        and_(
            CertificateRecord.is_deleted == False,
            CertificateRecord.verified_at.is_(None),
        )
    )
    pending_certificates = len((await session.execute(pending_cert_stmt)).all())

    pending_training_stmt = select(TrainingEventParticipant.completion_status).where(
        TrainingEventParticipant.is_deleted == False
    )
    pending_training = sum(
        1
        for row in (await session.execute(pending_training_stmt)).all()
        if not _is_completed_status(row.completion_status)
    )

    completed_pds_stmt = (
        select(BasicInformation.employee_id)
        .join(
            RecordCompletion,
            and_(
                RecordCompletion.basic_information_id == BasicInformation.id,
                RecordCompletion.is_deleted == False,
            ),
        )
        .where(BasicInformation.is_deleted == False)
    )
    completed_pds_employee_ids = {
        row.employee_id
        for row in (await session.execute(completed_pds_stmt)).all()
        if row.employee_id
    }

    pending_pds = max(total_employees - len(completed_pds_employee_ids), 0)
    pending_requests = pending_certificates + pending_training + pending_pds

    data = {
        "total_employees": total_employees,
        "teaching_staff": teaching_staff,
        "non_teaching": non_teaching,
        "cos": cos_count,
        "hired_this_year": hired_this_year,
        "pending_requests": pending_requests,
        "teaching_pct": round((teaching_staff / total_employees) * 100) if total_employees else 0,
        "non_teaching_pct": round((non_teaching / total_employees) * 100) if total_employees else 0,
    }

    return create_response(
        path=request.url.path,
        data=data,
        success=True,
    )


@router.get("/personnel", response_model=APIResponse)
async def get_personnel_distribution(
    request: Request,
    session: AsyncSession = Depends(get_db),
):
    """Return personnel chart datasets for category and status views."""
    employee_stmt = select(
        Employee.office_department,
        Employee.employment_status,
    ).where(Employee.is_deleted == False)
    employee_rows = (await session.execute(employee_stmt)).all()

    category_counts = {
        "Teaching Staff": 0,
        "Non-Teaching": 0,
        "COS": 0,
    }

    status_counts: dict[str, int] = {}
    department_category_map: dict[str, dict[str, object]] = {}
    department_status_map: dict[str, dict[str, object]] = {}

    for row in employee_rows:
        department = _clean(row.office_department) or "Unassigned"
        status_label = _status_label(row.employment_status)
        status_key = _status_key(row.employment_status)

        status_counts[status_label] = status_counts.get(status_label, 0) + 1

        department_category = department_category_map.get(department)
        if not department_category:
            department_category = {
                "department": department,
                "teaching": 0,
                "nonTeaching": 0,
                "cos": 0,
            }
            department_category_map[department] = department_category

        department_status = department_status_map.get(department)
        if not department_status:
            department_status = {"department": department}
            department_status_map[department] = department_status

        department_status[status_key] = int(department_status.get(status_key, 0)) + 1

        if _is_teaching_status(row.employment_status):
            category_counts["Teaching Staff"] += 1
            department_category["teaching"] = int(department_category["teaching"]) + 1
        elif _is_non_teaching_status(row.employment_status):
            category_counts["Non-Teaching"] += 1
            department_category["nonTeaching"] = int(department_category["nonTeaching"]) + 1
        elif _is_cos_status(row.employment_status):
            category_counts["COS"] += 1
            department_category["cos"] = int(department_category["cos"]) + 1

    sorted_status_labels = sorted(status_counts.keys())
    status_keys = [
        {
            "key": _status_key(label),
            "label": label,
            "color": _STATUS_COLORS[index % len(_STATUS_COLORS)],
        }
        for index, label in enumerate(sorted_status_labels)
    ]

    for department_row in department_status_map.values():
        for status_info in status_keys:
            department_row.setdefault(status_info["key"], 0)

    data = {
        "category": [
            {
                "key": "teaching",
                "label": "Teaching Staff",
                "value": category_counts["Teaching Staff"],
                "color": "#1e6b45",
            },
            {
                "key": "nonTeaching",
                "label": "Non-Teaching",
                "value": category_counts["Non-Teaching"],
                "color": "#3b82f6",
            },
            {
                "key": "cos",
                "label": "COS",
                "value": category_counts["COS"],
                "color": "#94a3b8",
            },
        ],
        "status": [
            {
                "key": _status_key(label),
                "label": label,
                "value": status_counts[label],
                "color": _STATUS_COLORS[index % len(_STATUS_COLORS)],
            }
            for index, label in enumerate(sorted_status_labels)
        ],
        "by_department_category": [
            department_category_map[key]
            for key in sorted(department_category_map.keys())
        ],
        "by_department_status": [
            department_status_map[key]
            for key in sorted(department_status_map.keys())
        ],
        "status_keys": status_keys,
    }

    return create_response(
        path=request.url.path,
        data=data,
        success=True,
    )


@router.get("/training-budget", response_model=APIResponse)
async def get_training_budget(
    request: Request,
    session: AsyncSession = Depends(get_db),
):
    """Return training budget summary derived from assigned/completed training hours."""
    stmt = (
        select(
            Employee.office_department,
            TrainingEvent.hours,
            TrainingEventParticipant.completion_status,
        )
        .join(
            TrainingEvent,
            and_(
                TrainingEvent.id == TrainingEventParticipant.training_event_id,
                TrainingEvent.is_deleted == False,
            ),
        )
        .join(
            Employee,
            and_(
                Employee.id == TrainingEventParticipant.employee_id,
                Employee.is_deleted == False,
            ),
        )
        .where(TrainingEventParticipant.is_deleted == False)
    )
    rows = (await session.execute(stmt)).all()

    overall_allocated = 0
    overall_utilized = 0
    department_totals: dict[str, dict[str, int | str]] = {}

    for row in rows:
        department = _clean(row.office_department) or "Unassigned"
        hours = max(int(row.hours or 0), 0)
        is_completed = _is_completed_status(row.completion_status)

        overall_allocated += hours
        if is_completed:
            overall_utilized += hours

        dept_row = department_totals.get(department)
        if not dept_row:
            dept_row = {
                "department": department,
                "allocated": 0,
                "utilized": 0,
                "balance": 0,
            }
            department_totals[department] = dept_row

        dept_row["allocated"] = int(dept_row["allocated"]) + hours
        if is_completed:
            dept_row["utilized"] = int(dept_row["utilized"]) + hours

    departments = []
    for department in sorted(department_totals.keys()):
        row = department_totals[department]
        allocated = int(row["allocated"])
        utilized = int(row["utilized"])
        departments.append(
            {
                "department": department,
                "allocated": allocated,
                "utilized": utilized,
                "balance": max(allocated - utilized, 0),
            }
        )

    data = {
        "overall": {
            "department": "All Departments",
            "allocated": overall_allocated,
            "utilized": overall_utilized,
            "balance": max(overall_allocated - overall_utilized, 0),
        },
        "departments": departments,
    }

    return create_response(
        path=request.url.path,
        data=data,
        success=True,
    )


@router.get("/compliance", response_model=APIResponse)
async def get_compliance_summary(
    request: Request,
    session: AsyncSession = Depends(get_db),
):
    """Return compliance metrics derived from existing records."""
    employee_stmt = select(Employee.id).where(Employee.is_deleted == False)
    active_employee_ids = [row.id for row in (await session.execute(employee_stmt)).all() if row.id]
    active_employee_id_set = set(active_employee_ids)
    total_employees = len(active_employee_ids)

    if active_employee_ids:
        basic_info_stmt = select(BasicInformation.employee_id).where(
            and_(
                BasicInformation.is_deleted == False,
                BasicInformation.employee_id.in_(active_employee_ids),
            )
        )
        basic_info_employee_ids = {
            row.employee_id
            for row in (await session.execute(basic_info_stmt)).all()
            if row.employee_id
        }
    else:
        basic_info_employee_ids = set()

    if active_employee_ids:
        record_completion_stmt = (
            select(BasicInformation.employee_id)
            .join(
                RecordCompletion,
                and_(
                    RecordCompletion.basic_information_id == BasicInformation.id,
                    RecordCompletion.is_deleted == False,
                ),
            )
            .where(
                and_(
                    BasicInformation.is_deleted == False,
                    BasicInformation.employee_id.in_(active_employee_ids),
                )
            )
        )
        completed_pds_employee_ids = {
            row.employee_id
            for row in (await session.execute(record_completion_stmt)).all()
            if row.employee_id
        }
    else:
        completed_pds_employee_ids = set()

    certificate_stmt = select(
        CertificateRecord.employee_id,
        CertificateRecord.verified_at,
    ).where(CertificateRecord.is_deleted == False)
    certificate_rows = (await session.execute(certificate_stmt)).all()

    certificate_employee_ids = {
        row.employee_id
        for row in certificate_rows
        if row.employee_id and row.employee_id in active_employee_id_set
    }
    total_certificates = len(certificate_rows)
    verified_certificates = sum(1 for row in certificate_rows if row.verified_at is not None)

    training_stmt = (
        select(TrainingEvent.hours, TrainingEventParticipant.completion_status)
        .join(
            TrainingEvent,
            and_(
                TrainingEvent.id == TrainingEventParticipant.training_event_id,
                TrainingEvent.is_deleted == False,
            ),
        )
        .where(TrainingEventParticipant.is_deleted == False)
    )
    training_rows = (await session.execute(training_stmt)).all()

    total_training_hours = 0
    completed_training_hours = 0
    for row in training_rows:
        hours = max(int(row.hours or 0), 0)
        total_training_hours += hours
        if _is_completed_status(row.completion_status):
            completed_training_hours += hours

    pds_completion_pct = round((len(completed_pds_employee_ids) / total_employees) * 100) if total_employees else 0
    training_hours_pct = round((completed_training_hours / total_training_hours) * 100) if total_training_hours else 0
    mov_upload_pct = round((len(certificate_employee_ids) / total_employees) * 100) if total_employees else 0
    profile_completion_pct = round((len(basic_info_employee_ids) / total_employees) * 100) if total_employees else 0

    metrics = [
        {
            "key": "pds_completion",
            "name": "PDS Completion",
            "current": pds_completion_pct,
            "target": 95,
        },
        {
            "key": "training_hours",
            "name": "Training Hours",
            "current": training_hours_pct,
            "target": 80,
        },
        {
            "key": "mov_uploads",
            "name": "MOV Uploads",
            "current": mov_upload_pct,
            "target": 100,
        },
        {
            "key": "profile_completion",
            "name": "Profile Completion",
            "current": profile_completion_pct,
            "target": 100,
        },
    ]

    overall_current = round(sum(metric["current"] for metric in metrics) / len(metrics)) if metrics else 0

    data = {
        "metrics": metrics,
        "overall_current": overall_current,
        "verified_certificates": verified_certificates,
        "total_certificates": total_certificates,
    }

    return create_response(
        path=request.url.path,
        data=data,
        success=True,
    )


@router.get("/recent-activity", response_model=APIResponse)
async def get_recent_activity(
    request: Request,
    session: AsyncSession = Depends(get_db),
    limit: int = 10,
):
    """Return recent dashboard activity based on persisted records."""
    safe_limit = max(min(limit, 25), 1)

    employee_stmt = (
        select(
            Employee.id,
            Employee.employee_no,
            Employee.office_department,
            Employee.employment_status,
            Employee.created_at,
            BasicInformation.surname,
            BasicInformation.first_name,
            BasicInformation.middle_name,
        )
        .outerjoin(
            BasicInformation,
            and_(
                BasicInformation.employee_id == Employee.id,
                BasicInformation.is_deleted == False,
            ),
        )
        .where(Employee.is_deleted == False)
        .order_by(Employee.created_at.desc())
        .limit(15)
    )
    employee_rows = (await session.execute(employee_stmt)).all()

    certificate_stmt = (
        select(
            CertificateRecord.id,
            CertificateRecord.certificate_type,
            CertificateRecord.created_at,
            Employee.employee_no,
            Employee.office_department,
        )
        .join(
            Employee,
            and_(
                Employee.id == CertificateRecord.employee_id,
                Employee.is_deleted == False,
            ),
        )
        .where(CertificateRecord.is_deleted == False)
        .order_by(CertificateRecord.created_at.desc())
        .limit(15)
    )
    certificate_rows = (await session.execute(certificate_stmt)).all()

    training_stmt = (
        select(
            TrainingEventParticipant.id,
            TrainingEventParticipant.completion_status,
            TrainingEventParticipant.updated_at,
            TrainingEvent.training_title,
            Employee.employee_no,
            Employee.office_department,
        )
        .join(
            TrainingEvent,
            and_(
                TrainingEvent.id == TrainingEventParticipant.training_event_id,
                TrainingEvent.is_deleted == False,
            ),
        )
        .join(
            Employee,
            and_(
                Employee.id == TrainingEventParticipant.employee_id,
                Employee.is_deleted == False,
            ),
        )
        .where(
            and_(
                TrainingEventParticipant.is_deleted == False,
                TrainingEventParticipant.completion_status.is_not(None),
            )
        )
        .order_by(TrainingEventParticipant.updated_at.desc())
        .limit(15)
    )
    training_rows = [
        row
        for row in (await session.execute(training_stmt)).all()
        if _is_completed_status(row.completion_status)
    ]

    record_stmt = (
        select(
            RecordCompletion.id,
            RecordCompletion.created_at,
            Employee.employee_no,
            Employee.office_department,
        )
        .join(
            BasicInformation,
            and_(
                BasicInformation.id == RecordCompletion.basic_information_id,
                BasicInformation.is_deleted == False,
            ),
        )
        .join(
            Employee,
            and_(
                Employee.id == BasicInformation.employee_id,
                Employee.is_deleted == False,
            ),
        )
        .where(RecordCompletion.is_deleted == False)
        .order_by(RecordCompletion.created_at.desc())
        .limit(15)
    )
    record_rows = (await session.execute(record_stmt)).all()

    activities: list[dict[str, object]] = []

    for row in employee_rows:
        display_name = _employee_display_name(
            employee_no=row.employee_no,
            surname=row.surname,
            first_name=row.first_name,
            middle_name=row.middle_name,
        )
        activities.append(
            {
                "id": f"hire-{row.id}",
                "type": "hire",
                "title": "New Employee Onboarded",
                "description": f"{display_name} - {_clean(row.office_department) or 'Unassigned'}, {_status_label(row.employment_status)}",
                "timestamp": row.created_at.isoformat() + "Z",
            }
        )

    for row in certificate_rows:
        activities.append(
            {
                "id": f"upload-{row.id}",
                "type": "upload",
                "title": "MOV Documents Uploaded",
                "description": f"{_status_label(row.certificate_type)} - {row.employee_no} ({_clean(row.office_department) or 'Unassigned'})",
                "timestamp": row.created_at.isoformat() + "Z",
            }
        )

    for row in training_rows:
        activities.append(
            {
                "id": f"training-{row.id}",
                "type": "training",
                "title": "Training Completed",
                "description": f"{row.training_title} - {row.employee_no} ({_clean(row.office_department) or 'Unassigned'})",
                "timestamp": row.updated_at.isoformat() + "Z",
            }
        )

    for row in record_rows:
        activities.append(
            {
                "id": f"record-{row.id}",
                "type": "evaluation",
                "title": "PDS Record Completed",
                "description": f"{row.employee_no} ({_clean(row.office_department) or 'Unassigned'})",
                "timestamp": row.created_at.isoformat() + "Z",
            }
        )

    sorted_activities = sorted(
        activities,
        key=lambda item: str(item["timestamp"]),
        reverse=True,
    )[:safe_limit]

    return create_response(
        path=request.url.path,
        data={"activities": sorted_activities},
        success=True,
    )


@router.get("/pending-approvals", response_model=APIResponse)
async def get_pending_approvals(
    request: Request,
    session: AsyncSession = Depends(get_db),
):
    """Return pending items that require HRMO dashboard attention."""
    today = date.today()
    urgent_cutoff = today + timedelta(days=30)

    pending_cert_stmt = select(
        CertificateRecord.id,
        CertificateRecord.expiry_date,
    ).where(
        and_(
            CertificateRecord.is_deleted == False,
            CertificateRecord.verified_at.is_(None),
        )
    )
    pending_cert_rows = (await session.execute(pending_cert_stmt)).all()
    pending_cert_count = len(pending_cert_rows)
    pending_cert_urgent = sum(
        1
        for row in pending_cert_rows
        if row.expiry_date is not None and today <= row.expiry_date <= urgent_cutoff
    )

    pending_training_stmt = (
        select(
            TrainingEventParticipant.id,
            TrainingEventParticipant.completion_status,
            TrainingEvent.date_to,
        )
        .join(
            TrainingEvent,
            and_(
                TrainingEvent.id == TrainingEventParticipant.training_event_id,
                TrainingEvent.is_deleted == False,
            ),
        )
        .where(TrainingEventParticipant.is_deleted == False)
    )
    pending_training_rows = [
        row
        for row in (await session.execute(pending_training_stmt)).all()
        if not _is_completed_status(row.completion_status)
    ]
    pending_training_count = len(pending_training_rows)
    pending_training_urgent = sum(
        1
        for row in pending_training_rows
        if row.date_to is not None and row.date_to < today
    )

    employee_stmt = select(
        Employee.id,
        Employee.date_hired,
    ).where(Employee.is_deleted == False)
    employee_rows = (await session.execute(employee_stmt)).all()
    employee_ids = [row.id for row in employee_rows if row.id]

    if employee_ids:
        basic_info_stmt = select(BasicInformation.id, BasicInformation.employee_id).where(
            and_(
                BasicInformation.is_deleted == False,
                BasicInformation.employee_id.in_(employee_ids),
            )
        )
        basic_info_rows = (await session.execute(basic_info_stmt)).all()
    else:
        basic_info_rows = []
    basic_info_by_employee = {
        row.employee_id: row.id
        for row in basic_info_rows
        if row.employee_id and row.id
    }

    completed_record_stmt = select(RecordCompletion.basic_information_id).where(
        RecordCompletion.is_deleted == False
    )
    completed_basic_info_ids = {
        row.basic_information_id
        for row in (await session.execute(completed_record_stmt)).all()
        if row.basic_information_id
    }

    pending_profile_count = 0
    pending_profile_urgent = 0
    pending_pds_count = 0
    pending_pds_urgent = 0

    profile_urgent_cutoff = today - timedelta(days=30)
    pds_urgent_cutoff = today - timedelta(days=60)

    for row in employee_rows:
        if row.id not in basic_info_by_employee:
            pending_profile_count += 1
            if row.date_hired is not None and row.date_hired <= profile_urgent_cutoff:
                pending_profile_urgent += 1
            continue

        basic_info_id = basic_info_by_employee[row.id]
        if basic_info_id not in completed_basic_info_ids:
            pending_pds_count += 1
            if row.date_hired is not None and row.date_hired <= pds_urgent_cutoff:
                pending_pds_urgent += 1

    items = [
        {
            "id": 1,
            "label": "Certificate Verifications",
            "description": "MOV and credentials pending verification",
            "count": pending_cert_count,
            "href": "/documents",
            "color": "green",
            "urgentCount": pending_cert_urgent,
        },
        {
            "id": 2,
            "label": "Training Completions",
            "description": "Assigned training not yet completed",
            "count": pending_training_count,
            "href": "/training/tracking",
            "color": "teal",
            "urgentCount": pending_training_urgent,
        },
        {
            "id": 3,
            "label": "PDS Record Completions",
            "description": "Employees with unfinished PDS records",
            "count": pending_pds_count,
            "href": "/my-pds",
            "color": "emerald",
            "urgentCount": pending_pds_urgent,
        },
        {
            "id": 4,
            "label": "Profile Completion",
            "description": "Employees missing basic profile records",
            "count": pending_profile_count,
            "href": "/employees/directory",
            "color": "amber",
            "urgentCount": pending_profile_urgent,
        },
    ]

    total_pending = sum(item["count"] for item in items)

    return create_response(
        path=request.url.path,
        data={
            "items": items,
            "total_pending": total_pending,
        },
        success=True,
    )
