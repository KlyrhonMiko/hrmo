"""Models package - central location for all database models.

Import all models here so they're automatically registered with SQLModel's metadata.
This ensures Alembic can auto-detect all models for migration generation.
"""

from models.base import BaseModel
from models.personal_information import (
    BasicInformation,
    GovernmentId,
    Address,
    ContactInformation,
)
from models.employees import Employee, CertificateRecord
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

__all__ = [
    "BaseModel",
    "BasicInformation",
    "GovernmentId",
    "Address",
    "ContactInformation",
    "Employee",
    "CertificateRecord",
    "FamilyDetail",
    "EducationalBackground",
    "OtherInformation",
    "ReferenceRecord",
    "PrimaryGovernmentId",
    "RecordCompletion",
    "WorkExperienceRecord",
    "VoluntaryRecord",
    "TrainingRecord",
    "CivilServiceEligibility",
]
