"use client";

import React, { useState } from "react";
import { RoleLayout } from "@/components/layout/RoleLayout";
import type {
    FullPDS,
    PDSPersonalInfo,
    PDSFamilyBackground,
    PDSEducation,
    PDSWorkExperience,
    PDSLearningDevelopment,
    DocumentMOV,
    TrainingRecord,
} from "@/types";
import {
    User,
    Edit3,
    Save,
    FileText,
    GraduationCap,
    Briefcase,
    Heart,
    BookOpen,
    X,
    Calendar,
    MapPin,
    Phone,
    Mail,
    Shield,
    Award,
    Clock,
    CheckCircle2,
    AlertCircle,
    Download,
    Eye,
} from "lucide-react";

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_PDS: FullPDS = {
    id: "EMP-2024-0042",
    personalInfo: {
        surname: "Dela Cruz",
        firstName: "Juan",
        middleName: "Santos",
        nameExtension: "",
        dateOfBirth: "1990-05-15",
        placeOfBirth: "Manila, Metro Manila",
        sex: "Male",
        civilStatus: "Married",
        height: "170",
        weight: "72",
        bloodType: "O+",
        gsisIdNo: "GSIS-0042-2024",
        pagIbigIdNo: "1234-5678-9012",
        philhealthNo: "01-234567890-1",
        sssNo: "34-5678901-2",
        tinNo: "123-456-789-000",
        agencyEmployeeNo: "EMP-2024-0042",
        citizenship: "Filipino",
        residentialAddress: {
            houseBlockLot: "Blk 5 Lot 12",
            street: "Rizal Street",
            subdivision: "Greenview Subdivision",
            barangay: "San Isidro",
            cityMunicipality: "Quezon City",
            province: "Metro Manila",
            zipCode: "1100",
        },
        permanentAddress: {
            houseBlockLot: "123",
            street: "Mabini Street",
            subdivision: "",
            barangay: "Poblacion",
            cityMunicipality: "Lipa City",
            province: "Batangas",
            zipCode: "4217",
        },
        telephoneNo: "(02) 8123-4567",
        mobileNo: "09171234567",
        email: "juan.delacruz@agency.gov.ph",
    },
    familyBackground: {
        spouseSurname: "Reyes",
        spouseFirstName: "Maria",
        spouseMiddleName: "Garcia",
        spouseNameExtension: "",
        spouseOccupation: "Teacher",
        spouseEmployerBusinessName: "DepEd - Quezon City",
        spouseBusinessAddress: "Quezon City, Metro Manila",
        spouseTelephoneNo: "09181234567",
        fatherSurname: "Dela Cruz",
        fatherFirstName: "Pedro",
        fatherMiddleName: "Bautista",
        fatherNameExtension: "Sr.",
        motherMaidenSurname: "Santos",
        motherFirstName: "Elena",
        motherMiddleName: "Ramos",
        children: [
            { fullName: "Carlos Dela Cruz", dateOfBirth: "2015-03-20" },
            { fullName: "Isabella Dela Cruz", dateOfBirth: "2018-11-08" },
        ],
    },
    education: [
        {
            level: "Elementary",
            schoolName: "Lipa City Central Elementary School",
            basicEducationDegreeCourse: "Elementary Education",
            periodFrom: "2002",
            periodTo: "2008",
            highestLevelUnitsEarned: "Graduated",
            yearGraduated: "2008",
            scholarshipAcademicHonorsReceived: "With Honors",
        },
        {
            level: "Secondary",
            schoolName: "Lipa City National High School",
            basicEducationDegreeCourse: "Secondary Education",
            periodFrom: "2008",
            periodTo: "2012",
            highestLevelUnitsEarned: "Graduated",
            yearGraduated: "2012",
            scholarshipAcademicHonorsReceived: "With High Honors",
        },
        {
            level: "College",
            schoolName: "Batangas State University",
            basicEducationDegreeCourse: "BS Information Technology",
            periodFrom: "2012",
            periodTo: "2016",
            highestLevelUnitsEarned: "Graduated",
            yearGraduated: "2016",
            scholarshipAcademicHonorsReceived: "Cum Laude",
        },
    ],
    civilServiceEligibility: [
        {
            careerService: "Career Service Professional",
            rating: "83.50",
            dateOfExamination: "2017-08-06",
            placeOfExamination: "Manila",
            licenseNumber: "CSP-2017-0042",
            dateOfValidity: "",
        },
    ],
    workExperience: [
        {
            dateFrom: "2020-06-01",
            dateTo: "Present",
            positionTitle: "Administrative Officer III",
            department: "Human Resource Management Office",
            monthlySalary: "33,575",
            salaryGrade: "SG-14",
            statusOfAppointment: "Permanent",
            isGovernmentService: true,
        },
        {
            dateFrom: "2017-03-15",
            dateTo: "2020-05-31",
            positionTitle: "Administrative Aide VI",
            department: "General Services Division",
            monthlySalary: "19,233",
            salaryGrade: "SG-6",
            statusOfAppointment: "Permanent",
            isGovernmentService: true,
        },
    ],
    voluntaryWork: [],
    learningDevelopment: [
        {
            title: "Records Management and Digitization",
            dateFrom: "2024-09-10",
            dateTo: "2024-09-12",
            numberOfHours: "24",
            type: "Seminar",
            conductedSponsoredBy: "Civil Service Commission",
        },
        {
            title: "Data Privacy Act Compliance Training",
            dateFrom: "2024-06-15",
            dateTo: "2024-06-16",
            numberOfHours: "16",
            type: "Workshop",
            conductedSponsoredBy: "National Privacy Commission",
        },
        {
            title: "Public Financial Management",
            dateFrom: "2023-11-20",
            dateTo: "2023-11-22",
            numberOfHours: "24",
            type: "Seminar",
            conductedSponsoredBy: "Department of Budget and Management",
        },
    ],
    otherInfo: {
        specialSkillsHobbies: [],
        nonAcademicDistinctions: [],
        membershipInAssociations: [],
    },
    page4Questions: {
        relatedThirdDegree: { answer: false, details: "" },
        relatedFourthDegree: { answer: false, details: "" },
        guiltyOfAdminOffense: { answer: false, details: "" },
        criminallyCharged: { answer: false, details: "", dateFiled: "", caseStatus: "" },
        convicted: { answer: false, details: "" },
        separatedFromService: { answer: false, details: "" },
        candidateInElection: { answer: false, details: "" },
        resignedForCampaign: { answer: false, details: "" },
        immigrantOrPermanentResident: { answer: false, details: "" },
        indigenousGroupMember: { answer: false, details: "" },
        personWithDisability: { answer: false, details: "" },
        soloParent: { answer: false, details: "" },
    },
    references: [
        { name: "Dr. Ana Santos", address: "Quezon City, Metro Manila", telephoneNo: "09171234568" },
        { name: "Engr. Mark Reyes", address: "Makati City, Metro Manila", telephoneNo: "09181234569" },
        { name: "Atty. Grace Lim", address: "Pasig City, Metro Manila", telephoneNo: "09191234570" },
    ],
    governmentIssuedId: {
        idType: "GSIS",
        idNumber: "GSIS-0042-2024",
        dateOfIssuance: "2020-06-15",
        placeOfIssuance: "Quezon City",
    },
    dateAccomplished: "2024-10-01",
    office: "Human Resource Management Office",
    employmentStatus: "Non-Teaching",
};

const MOCK_TRAININGS: TrainingRecord[] = [
    {
        id: "TR-001",
        title: "Records Management and Digitization",
        type: "Seminar",
        conductedBy: "Civil Service Commission",
        venue: "CSC Regional Office, Quezon City",
        dateFrom: "2024-09-10",
        dateTo: "2024-09-12",
        numberOfHours: 24,
        status: "Completed",
        certificateUrl: "/certificates/tr-001.pdf",
    },
    {
        id: "TR-002",
        title: "Data Privacy Act Compliance Training",
        type: "Workshop",
        conductedBy: "National Privacy Commission",
        venue: "NPC Training Center, Taguig City",
        dateFrom: "2024-06-15",
        dateTo: "2024-06-16",
        numberOfHours: 16,
        status: "Completed",
        certificateUrl: "/certificates/tr-002.pdf",
    },
    {
        id: "TR-003",
        title: "Public Financial Management",
        type: "Seminar",
        conductedBy: "Department of Budget and Management",
        venue: "DBM Conference Hall, Manila",
        dateFrom: "2023-11-20",
        dateTo: "2023-11-22",
        numberOfHours: 24,
        status: "Completed",
    },
];

const MOCK_DOCUMENTS: DocumentMOV[] = [
    {
        id: "DOC-001",
        documentType: "Appointment Paper",
        serialNumber: "AP-2020-0042",
        fileUrl: "/docs/appointment.pdf",
        fileName: "Appointment_AO3_2020.pdf",
        fileSize: 245000,
        uploadedAt: "2020-06-15",
        category: "Appointment",
        status: "Verified",
    },
    {
        id: "DOC-002",
        documentType: "Service Record",
        serialNumber: "SR-2024-0042",
        fileUrl: "/docs/service-record.pdf",
        fileName: "Service_Record_2024.pdf",
        fileSize: 180000,
        uploadedAt: "2024-01-10",
        category: "Service Record",
        status: "Verified",
    },
    {
        id: "DOC-003",
        documentType: "CSC Certificate of Eligibility",
        serialNumber: "CSP-2017-0042",
        fileUrl: "/docs/csc-cert.pdf",
        fileName: "CSC_Professional_Certificate.pdf",
        fileSize: 320000,
        uploadedAt: "2017-10-20",
        category: "Certificate",
        status: "Verified",
    },
    {
        id: "DOC-004",
        documentType: "Transcript of Records",
        serialNumber: "TOR-BSU-2016",
        fileUrl: "/docs/tor.pdf",
        fileName: "Transcript_BSU_2016.pdf",
        fileSize: 415000,
        uploadedAt: "2017-02-12",
        category: "Transcript",
        status: "Verified",
    },
    {
        id: "DOC-005",
        documentType: "Training Certificate",
        serialNumber: "TC-DPA-2024",
        fileUrl: "/docs/dpa-cert.pdf",
        fileName: "DPA_Compliance_Certificate.pdf",
        fileSize: 150000,
        uploadedAt: "2024-07-01",
        category: "Training Certificate",
        status: "Pending",
    },
];

// ─── Tab Definition ───────────────────────────────────────────────────────────

type TabKey = "personal" | "family" | "education" | "work" | "training" | "documents";

interface TabDef {
    key: TabKey;
    label: string;
    icon: React.ElementType;
}

const TABS: TabDef[] = [
    { key: "personal", label: "Personal Information", icon: User },
    { key: "family", label: "Family Background", icon: Heart },
    { key: "education", label: "Education", icon: GraduationCap },
    { key: "work", label: "Work Experience", icon: Briefcase },
    { key: "training", label: "Training & Seminars", icon: BookOpen },
    { key: "documents", label: "Documents", icon: FileText },
];

// ─── Helper Components ────────────────────────────────────────────────────────

function ReadOnlyField({ label, value }: { label: string; value: string }) {
    return (
        <div className="space-y-1">
            <dt className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
                {label}
            </dt>
            <dd className="text-sm text-stone-800">
                {value || <span className="text-stone-300">--</span>}
            </dd>
        </div>
    );
}

function EditField({
    label,
    value,
    onChange,
    type = "text",
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    type?: string;
}) {
    return (
        <div className="space-y-1">
            <label className="block text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
                {label}
            </label>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all placeholder:text-stone-300"
            />
        </div>
    );
}

function SectionCard({ title, children }: { title?: string; children: React.ReactNode }) {
    return (
        <div className="rounded-2xl border border-stone-200/60 bg-white p-5 sm:p-6">
            {title && (
                <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-stone-100">
                    <div className="w-1 h-4 rounded-full bg-green-600" />
                    <h3 className="text-sm font-semibold text-stone-700">{title}</h3>
                </div>
            )}
            {children}
        </div>
    );
}

function formatDate(dateStr: string) {
    if (!dateStr || dateStr === "Present") return dateStr || "—";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function formatAddress(addr: { houseBlockLot: string; street: string; subdivision: string; barangay: string; cityMunicipality: string; province: string; zipCode: string }) {
    return [addr.houseBlockLot, addr.street, addr.subdivision, addr.barangay, addr.cityMunicipality, addr.province, addr.zipCode]
        .filter(Boolean)
        .join(", ");
}

function statusColor(status: string) {
    switch (status) {
        case "Verified":
        case "Completed":
        case "Active":
            return "bg-emerald-50 text-emerald-700";
        case "Pending":
        case "Pending Verification":
        case "Ongoing":
            return "bg-amber-50 text-amber-700";
        case "Rejected":
        case "Expired":
        case "Cancelled":
            return "bg-red-50 text-red-700";
        default:
            return "bg-stone-100 text-stone-600";
    }
}

function StatusBadge({ status }: { status: string }) {
    return (
        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${statusColor(status)}`}>
            {(status === "Verified" || status === "Completed") && <CheckCircle2 className="w-3 h-3" />}
            {(status === "Pending" || status === "Pending Verification") && <Clock className="w-3 h-3" />}
            {(status === "Rejected" || status === "Expired") && <AlertCircle className="w-3 h-3" />}
            {status}
        </span>
    );
}

// ─── Tab Content Components ───────────────────────────────────────────────────

function PersonalInfoTab({
    info,
    editing,
    onUpdate,
}: {
    info: PDSPersonalInfo;
    editing: boolean;
    onUpdate: (info: PDSPersonalInfo) => void;
}) {
    const update = (field: keyof PDSPersonalInfo, value: string) => {
        onUpdate({ ...info, [field]: value });
    };

    const Field = editing ? EditField : ReadOnlyField;

    return (
        <div className="space-y-6">
            <SectionCard title="Basic Information">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Field label="Surname" value={info.surname} onChange={(v: string) => update("surname", v)} />
                    <Field label="First Name" value={info.firstName} onChange={(v: string) => update("firstName", v)} />
                    <Field label="Middle Name" value={info.middleName} onChange={(v: string) => update("middleName", v)} />
                    <Field label="Name Extension" value={info.nameExtension} onChange={(v: string) => update("nameExtension", v)} />
                    <Field label="Date of Birth" value={info.dateOfBirth} onChange={(v: string) => update("dateOfBirth", v)} type="date" />
                    <Field label="Place of Birth" value={info.placeOfBirth} onChange={(v: string) => update("placeOfBirth", v)} />
                    <Field label="Sex" value={info.sex} onChange={(v: string) => update("sex", v)} />
                    <Field label="Civil Status" value={info.civilStatus} onChange={(v: string) => update("civilStatus", v)} />
                    <Field label="Citizenship" value={info.citizenship} onChange={(v: string) => update("citizenship", v)} />
                    <Field label="Height (cm)" value={info.height} onChange={(v: string) => update("height", v)} />
                    <Field label="Weight (kg)" value={info.weight} onChange={(v: string) => update("weight", v)} />
                    <Field label="Blood Type" value={info.bloodType} onChange={(v: string) => update("bloodType", v)} />
                </div>
            </SectionCard>

            <SectionCard title="Government IDs">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Field label="GSIS ID No." value={info.gsisIdNo} onChange={(v: string) => update("gsisIdNo", v)} />
                    <Field label="PAG-IBIG ID No." value={info.pagIbigIdNo} onChange={(v: string) => update("pagIbigIdNo", v)} />
                    <Field label="PhilHealth No." value={info.philhealthNo} onChange={(v: string) => update("philhealthNo", v)} />
                    <Field label="SSS No." value={info.sssNo} onChange={(v: string) => update("sssNo", v)} />
                    <Field label="TIN No." value={info.tinNo} onChange={(v: string) => update("tinNo", v)} />
                    <Field label="Agency Employee No." value={info.agencyEmployeeNo} onChange={(v: string) => update("agencyEmployeeNo", v)} />
                </div>
            </SectionCard>

            <SectionCard title="Contact Information">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Field label="Telephone No." value={info.telephoneNo} onChange={(v: string) => update("telephoneNo", v)} />
                    <Field label="Mobile No." value={info.mobileNo} onChange={(v: string) => update("mobileNo", v)} />
                    <Field label="Email Address" value={info.email} onChange={(v: string) => update("email", v)} type="email" />
                </div>
            </SectionCard>

            <SectionCard title="Residential Address">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {editing ? (
                        <>
                            <EditField label="House/Block/Lot" value={info.residentialAddress.houseBlockLot} onChange={(v) => onUpdate({ ...info, residentialAddress: { ...info.residentialAddress, houseBlockLot: v } })} />
                            <EditField label="Street" value={info.residentialAddress.street} onChange={(v) => onUpdate({ ...info, residentialAddress: { ...info.residentialAddress, street: v } })} />
                            <EditField label="Subdivision" value={info.residentialAddress.subdivision} onChange={(v) => onUpdate({ ...info, residentialAddress: { ...info.residentialAddress, subdivision: v } })} />
                            <EditField label="Barangay" value={info.residentialAddress.barangay} onChange={(v) => onUpdate({ ...info, residentialAddress: { ...info.residentialAddress, barangay: v } })} />
                            <EditField label="City/Municipality" value={info.residentialAddress.cityMunicipality} onChange={(v) => onUpdate({ ...info, residentialAddress: { ...info.residentialAddress, cityMunicipality: v } })} />
                            <EditField label="Province" value={info.residentialAddress.province} onChange={(v) => onUpdate({ ...info, residentialAddress: { ...info.residentialAddress, province: v } })} />
                            <EditField label="ZIP Code" value={info.residentialAddress.zipCode} onChange={(v) => onUpdate({ ...info, residentialAddress: { ...info.residentialAddress, zipCode: v } })} />
                        </>
                    ) : (
                        <div className="lg:col-span-3">
                            <ReadOnlyField label="Full Address" value={formatAddress(info.residentialAddress)} />
                        </div>
                    )}
                </div>
            </SectionCard>

            <SectionCard title="Permanent Address">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {editing ? (
                        <>
                            <EditField label="House/Block/Lot" value={info.permanentAddress.houseBlockLot} onChange={(v) => onUpdate({ ...info, permanentAddress: { ...info.permanentAddress, houseBlockLot: v } })} />
                            <EditField label="Street" value={info.permanentAddress.street} onChange={(v) => onUpdate({ ...info, permanentAddress: { ...info.permanentAddress, street: v } })} />
                            <EditField label="Subdivision" value={info.permanentAddress.subdivision} onChange={(v) => onUpdate({ ...info, permanentAddress: { ...info.permanentAddress, subdivision: v } })} />
                            <EditField label="Barangay" value={info.permanentAddress.barangay} onChange={(v) => onUpdate({ ...info, permanentAddress: { ...info.permanentAddress, barangay: v } })} />
                            <EditField label="City/Municipality" value={info.permanentAddress.cityMunicipality} onChange={(v) => onUpdate({ ...info, permanentAddress: { ...info.permanentAddress, cityMunicipality: v } })} />
                            <EditField label="Province" value={info.permanentAddress.province} onChange={(v) => onUpdate({ ...info, permanentAddress: { ...info.permanentAddress, province: v } })} />
                            <EditField label="ZIP Code" value={info.permanentAddress.zipCode} onChange={(v) => onUpdate({ ...info, permanentAddress: { ...info.permanentAddress, zipCode: v } })} />
                        </>
                    ) : (
                        <div className="lg:col-span-3">
                            <ReadOnlyField label="Full Address" value={formatAddress(info.permanentAddress)} />
                        </div>
                    )}
                </div>
            </SectionCard>
        </div>
    );
}

function FamilyBackgroundTab({
    family,
    editing,
    onUpdate,
}: {
    family: PDSFamilyBackground;
    editing: boolean;
    onUpdate: (f: PDSFamilyBackground) => void;
}) {
    const Field = editing ? EditField : ReadOnlyField;

    return (
        <div className="space-y-6">
            <SectionCard title="Spouse Information">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Field label="Surname" value={family.spouseSurname} onChange={(v: string) => onUpdate({ ...family, spouseSurname: v })} />
                    <Field label="First Name" value={family.spouseFirstName} onChange={(v: string) => onUpdate({ ...family, spouseFirstName: v })} />
                    <Field label="Middle Name" value={family.spouseMiddleName} onChange={(v: string) => onUpdate({ ...family, spouseMiddleName: v })} />
                    <Field label="Occupation" value={family.spouseOccupation} onChange={(v: string) => onUpdate({ ...family, spouseOccupation: v })} />
                    <Field label="Employer/Business" value={family.spouseEmployerBusinessName} onChange={(v: string) => onUpdate({ ...family, spouseEmployerBusinessName: v })} />
                    <Field label="Business Address" value={family.spouseBusinessAddress} onChange={(v: string) => onUpdate({ ...family, spouseBusinessAddress: v })} />
                    <Field label="Telephone No." value={family.spouseTelephoneNo} onChange={(v: string) => onUpdate({ ...family, spouseTelephoneNo: v })} />
                </div>
            </SectionCard>

            <SectionCard title="Father's Information">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Field label="Surname" value={family.fatherSurname} onChange={(v: string) => onUpdate({ ...family, fatherSurname: v })} />
                    <Field label="First Name" value={family.fatherFirstName} onChange={(v: string) => onUpdate({ ...family, fatherFirstName: v })} />
                    <Field label="Middle Name" value={family.fatherMiddleName} onChange={(v: string) => onUpdate({ ...family, fatherMiddleName: v })} />
                    <Field label="Name Extension" value={family.fatherNameExtension} onChange={(v: string) => onUpdate({ ...family, fatherNameExtension: v })} />
                </div>
            </SectionCard>

            <SectionCard title="Mother's Maiden Name">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Field label="Maiden Surname" value={family.motherMaidenSurname} onChange={(v: string) => onUpdate({ ...family, motherMaidenSurname: v })} />
                    <Field label="First Name" value={family.motherFirstName} onChange={(v: string) => onUpdate({ ...family, motherFirstName: v })} />
                    <Field label="Middle Name" value={family.motherMiddleName} onChange={(v: string) => onUpdate({ ...family, motherMiddleName: v })} />
                </div>
            </SectionCard>

            <SectionCard title="Children">
                {family.children.length === 0 ? (
                    <p className="text-sm text-stone-400 italic">No children recorded</p>
                ) : (
                    <div className="space-y-3">
                        {family.children.map((child, idx) => (
                            <div key={idx} className="flex items-center gap-4 bg-stone-50 rounded-lg p-3">
                                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 text-xs font-semibold">
                                    {idx + 1}
                                </div>
                                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {editing ? (
                                        <>
                                            <EditField
                                                label="Full Name"
                                                value={child.fullName}
                                                onChange={(v) => {
                                                    const updated = [...family.children];
                                                    updated[idx] = { ...updated[idx], fullName: v };
                                                    onUpdate({ ...family, children: updated });
                                                }}
                                            />
                                            <EditField
                                                label="Date of Birth"
                                                value={child.dateOfBirth}
                                                type="date"
                                                onChange={(v) => {
                                                    const updated = [...family.children];
                                                    updated[idx] = { ...updated[idx], dateOfBirth: v };
                                                    onUpdate({ ...family, children: updated });
                                                }}
                                            />
                                        </>
                                    ) : (
                                        <>
                                            <div>
                                                <span className="text-xs text-stone-500">Name</span>
                                                <p className="text-sm text-stone-800 font-medium">{child.fullName}</p>
                                            </div>
                                            <div>
                                                <span className="text-xs text-stone-500">Date of Birth</span>
                                                <p className="text-sm text-stone-800">{formatDate(child.dateOfBirth)}</p>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </SectionCard>
        </div>
    );
}

function EducationTab({
    education,
    editing,
    onUpdate,
}: {
    education: PDSEducation[];
    editing: boolean;
    onUpdate: (e: PDSEducation[]) => void;
}) {
    return (
        <div className="space-y-4">
            {education.map((ed, idx) => (
                <SectionCard key={idx}>
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
                            <GraduationCap className="w-5 h-5 text-green-700" />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-green-50 text-green-700">
                                    {ed.level}
                                </span>
                            </div>
                            {editing ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <EditField label="School Name" value={ed.schoolName} onChange={(v) => { const u = [...education]; u[idx] = { ...u[idx], schoolName: v }; onUpdate(u); }} />
                                    <EditField label="Degree/Course" value={ed.basicEducationDegreeCourse} onChange={(v) => { const u = [...education]; u[idx] = { ...u[idx], basicEducationDegreeCourse: v }; onUpdate(u); }} />
                                    <EditField label="Period From" value={ed.periodFrom} onChange={(v) => { const u = [...education]; u[idx] = { ...u[idx], periodFrom: v }; onUpdate(u); }} />
                                    <EditField label="Period To" value={ed.periodTo} onChange={(v) => { const u = [...education]; u[idx] = { ...u[idx], periodTo: v }; onUpdate(u); }} />
                                    <EditField label="Year Graduated" value={ed.yearGraduated} onChange={(v) => { const u = [...education]; u[idx] = { ...u[idx], yearGraduated: v }; onUpdate(u); }} />
                                    <EditField label="Honors/Scholarship" value={ed.scholarshipAcademicHonorsReceived} onChange={(v) => { const u = [...education]; u[idx] = { ...u[idx], scholarshipAcademicHonorsReceived: v }; onUpdate(u); }} />
                                </div>
                            ) : (
                                <>
                                    <h4 className="text-sm font-semibold text-stone-900">{ed.schoolName}</h4>
                                    <p className="text-sm text-stone-600 mt-0.5">{ed.basicEducationDegreeCourse}</p>
                                    <div className="flex flex-wrap gap-x-6 gap-y-1 mt-2 text-xs text-stone-500">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-3.5 h-3.5" />
                                            {ed.periodFrom} – {ed.periodTo}
                                        </span>
                                        {ed.yearGraduated && (
                                            <span>Graduated: {ed.yearGraduated}</span>
                                        )}
                                        {ed.scholarshipAcademicHonorsReceived && (
                                            <span className="flex items-center gap-1">
                                                <Award className="w-3.5 h-3.5 text-amber-500" />
                                                {ed.scholarshipAcademicHonorsReceived}
                                            </span>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </SectionCard>
            ))}
        </div>
    );
}

function WorkExperienceTab({
    work,
    editing,
    onUpdate,
}: {
    work: PDSWorkExperience[];
    editing: boolean;
    onUpdate: (w: PDSWorkExperience[]) => void;
}) {
    return (
        <div className="space-y-4">
            {work.map((w, idx) => (
                <SectionCard key={idx}>
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                            <Briefcase className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                            {editing ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <EditField label="Position Title" value={w.positionTitle} onChange={(v) => { const u = [...work]; u[idx] = { ...u[idx], positionTitle: v }; onUpdate(u); }} />
                                    <EditField label="Department/Agency" value={w.department} onChange={(v) => { const u = [...work]; u[idx] = { ...u[idx], department: v }; onUpdate(u); }} />
                                    <EditField label="Date From" value={w.dateFrom} onChange={(v) => { const u = [...work]; u[idx] = { ...u[idx], dateFrom: v }; onUpdate(u); }} type="date" />
                                    <EditField label="Date To" value={w.dateTo === "Present" ? "" : w.dateTo} onChange={(v) => { const u = [...work]; u[idx] = { ...u[idx], dateTo: v || "Present" }; onUpdate(u); }} type="date" />
                                    <EditField label="Monthly Salary" value={w.monthlySalary} onChange={(v) => { const u = [...work]; u[idx] = { ...u[idx], monthlySalary: v }; onUpdate(u); }} />
                                    <EditField label="Salary Grade" value={w.salaryGrade} onChange={(v) => { const u = [...work]; u[idx] = { ...u[idx], salaryGrade: v }; onUpdate(u); }} />
                                    <EditField label="Status of Appointment" value={w.statusOfAppointment} onChange={(v) => { const u = [...work]; u[idx] = { ...u[idx], statusOfAppointment: v }; onUpdate(u); }} />
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-sm font-semibold text-stone-900">{w.positionTitle}</h4>
                                        {w.dateTo === "Present" && (
                                            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-green-50 text-green-700">Current</span>
                                        )}
                                    </div>
                                    <p className="text-sm text-stone-600 mt-0.5">{w.department}</p>
                                    <div className="flex flex-wrap gap-x-6 gap-y-1 mt-2 text-xs text-stone-500">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-3.5 h-3.5" />
                                            {formatDate(w.dateFrom)} – {w.dateTo === "Present" ? "Present" : formatDate(w.dateTo)}
                                        </span>
                                        <span>₱{w.monthlySalary} / {w.salaryGrade}</span>
                                        <span>{w.statusOfAppointment}</span>
                                        {w.isGovernmentService && (
                                            <span className="flex items-center gap-1">
                                                <Shield className="w-3.5 h-3.5 text-green-600" />
                                                Government Service
                                            </span>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </SectionCard>
            ))}
        </div>
    );
}

function TrainingTab({ trainings }: { trainings: TrainingRecord[] }) {
    return (
        <div className="space-y-4">
            {trainings.length === 0 ? (
                <SectionCard>
                    <p className="text-sm text-stone-400 italic text-center py-4">No training records found</p>
                </SectionCard>
            ) : (
                trainings.map((t) => (
                    <SectionCard key={t.id}>
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center flex-shrink-0">
                                <BookOpen className="w-5 h-5 text-violet-600" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <h4 className="text-sm font-semibold text-stone-900">{t.title}</h4>
                                        <p className="text-sm text-stone-600 mt-0.5">{t.conductedBy}</p>
                                    </div>
                                    <StatusBadge status={t.status} />
                                </div>
                                <div className="flex flex-wrap gap-x-6 gap-y-1 mt-2 text-xs text-stone-500">
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-3.5 h-3.5" />
                                        {formatDate(t.dateFrom)} – {formatDate(t.dateTo)}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-3.5 h-3.5" />
                                        {t.numberOfHours} hours
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <MapPin className="w-3.5 h-3.5" />
                                        {t.venue}
                                    </span>
                                    <span className="px-2 py-0.5 rounded bg-stone-100 text-stone-600">{t.type}</span>
                                </div>
                                {t.certificateUrl && (
                                    <button className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-green-700 hover:text-green-800 transition-colors">
                                        <Download className="w-3.5 h-3.5" />
                                        Download Certificate
                                    </button>
                                )}
                            </div>
                        </div>
                    </SectionCard>
                ))
            )}
        </div>
    );
}

function DocumentsTab({ documents }: { documents: DocumentMOV[] }) {
    return (
        <div className="space-y-4">
            {documents.length === 0 ? (
                <SectionCard>
                    <p className="text-sm text-stone-400 italic text-center py-4">No documents uploaded</p>
                </SectionCard>
            ) : (
                documents.map((doc) => (
                    <SectionCard key={doc.id}>
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                                <FileText className="w-5 h-5 text-amber-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <h4 className="text-sm font-semibold text-stone-900">{doc.documentType}</h4>
                                        <p className="text-xs text-stone-500 mt-0.5 truncate">{doc.fileName}</p>
                                    </div>
                                    <StatusBadge status={doc.status || "Pending"} />
                                </div>
                                <div className="flex flex-wrap gap-x-6 gap-y-1 mt-2 text-xs text-stone-500">
                                    <span>Serial: {doc.serialNumber}</span>
                                    <span className="px-2 py-0.5 rounded bg-stone-100 text-stone-600">{doc.category}</span>
                                    {doc.fileSize && <span>{(doc.fileSize / 1024).toFixed(0)} KB</span>}
                                    {doc.uploadedAt && (
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-3.5 h-3.5" />
                                            {formatDate(doc.uploadedAt)}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <button className="p-2 rounded-xl text-stone-400 hover:text-green-700 hover:bg-green-50 transition-all flex-shrink-0">
                                <Eye className="w-4 h-4" />
                            </button>
                        </div>
                    </SectionCard>
                ))
            )}
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function MyPDSPage() {
    const [activeTab, setActiveTab] = useState<TabKey>("personal");
    const [editingTabs, setEditingTabs] = useState<Record<TabKey, boolean>>({
        personal: false,
        family: false,
        education: false,
        work: false,
        training: false,
        documents: false,
    });
    const [pds, setPds] = useState<FullPDS>(MOCK_PDS);
    const [saving, setSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<string | null>(null);

    const isEditing = editingTabs[activeTab];
    const canEdit = !["training", "documents"].includes(activeTab);

    const toggleEdit = () => {
        setEditingTabs((prev) => ({ ...prev, [activeTab]: !prev[activeTab] }));
    };

    const handleSave = async () => {
        setSaving(true);
        await new Promise((r) => setTimeout(r, 800));
        setEditingTabs((prev) => ({ ...prev, [activeTab]: false }));
        setLastSaved(new Date().toLocaleString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }));
        setSaving(false);
    };

    const fullName = `${pds.personalInfo.firstName} ${pds.personalInfo.middleName ? pds.personalInfo.middleName.charAt(0) + ". " : ""}${pds.personalInfo.surname}`;
    const initials = `${pds.personalInfo.firstName.charAt(0)}${pds.personalInfo.surname.charAt(0)}`;

    const verifiedDocs = MOCK_DOCUMENTS.filter(d => d.status === "Verified").length;
    const totalTrainingHours = MOCK_TRAININGS.reduce((sum, t) => sum + t.numberOfHours, 0);

    return (
        <RoleLayout userRole="Employee">
            <div className="space-y-5 pb-8">
                {/* Profile Header */}
                <div className="relative bg-white rounded-2xl border border-stone-200/60 shadow-sm overflow-hidden">
                    <div className="h-1 bg-gradient-to-r from-green-600 via-emerald-500 to-teal-400" />
                    <div className="p-6 sm:p-8">
                        <div className="flex flex-col sm:flex-row items-start gap-6">
                            <div className="w-[72px] h-[72px] rounded-2xl bg-gradient-to-br from-green-600 to-emerald-700 flex items-center justify-center flex-shrink-0 shadow-lg shadow-green-700/15 ring-4 ring-green-50">
                                <span className="text-white text-2xl font-bold tracking-tight">{initials}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                                    <div>
                                        <h1 className="text-xl font-bold text-stone-900 tracking-tight">{fullName}</h1>
                                        <p className="text-sm text-stone-500 mt-1">
                                            {pds.workExperience[0]?.positionTitle || "Employee"} &middot; {pds.office}
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-start sm:items-end gap-2">
                                        <span className="inline-flex items-center text-xs font-semibold px-3 py-1.5 rounded-lg bg-green-50 text-green-700 ring-1 ring-green-200/50">
                                            {pds.employmentStatus}
                                        </span>
                                        {(lastSaved || pds.updatedAt) && (
                                            <p className="text-[11px] text-stone-400 flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                Updated {lastSaved || formatDate(pds.updatedAt || "")}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-x-5 gap-y-2 mt-4 text-xs text-stone-400">
                                    <span className="flex items-center gap-1.5">
                                        <Shield className="w-3.5 h-3.5" />
                                        {pds.personalInfo.agencyEmployeeNo}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <Phone className="w-3.5 h-3.5" />
                                        {pds.personalInfo.mobileNo}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <Mail className="w-3.5 h-3.5" />
                                        {pds.personalInfo.email}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <Calendar className="w-3.5 h-3.5" />
                                        Since {formatDate(pds.workExperience[0]?.dateFrom || "")}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-stone-100">
                            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-stone-50/80">
                                <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center">
                                    <Briefcase className="w-4 h-4 text-green-700" />
                                </div>
                                <div>
                                    <p className="text-lg font-bold text-stone-800">{pds.workExperience.length}</p>
                                    <p className="text-[11px] text-stone-400 font-medium">Positions</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-stone-50/80">
                                <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center">
                                    <GraduationCap className="w-4 h-4 text-blue-700" />
                                </div>
                                <div>
                                    <p className="text-lg font-bold text-stone-800">{pds.education.length}</p>
                                    <p className="text-[11px] text-stone-400 font-medium">Education</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-stone-50/80">
                                <div className="w-9 h-9 rounded-lg bg-violet-100 flex items-center justify-center">
                                    <BookOpen className="w-4 h-4 text-violet-700" />
                                </div>
                                <div>
                                    <p className="text-lg font-bold text-stone-800">{totalTrainingHours}<span className="text-xs font-medium text-stone-400">h</span></p>
                                    <p className="text-[11px] text-stone-400 font-medium">Training</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-stone-50/80">
                                <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center">
                                    <FileText className="w-4 h-4 text-amber-700" />
                                </div>
                                <div>
                                    <p className="text-lg font-bold text-stone-800">{verifiedDocs}<span className="text-xs font-medium text-stone-400">/{MOCK_DOCUMENTS.length}</span></p>
                                    <p className="text-[11px] text-stone-400 font-medium">Verified Docs</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-1 p-1 bg-stone-100/80 rounded-xl overflow-x-auto w-full sm:w-auto">
                        {TABS.map((tab) => {
                            const Icon = tab.icon;
                            const active = activeTab === tab.key;
                            return (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key)}
                                    className={`flex items-center gap-2 px-3.5 py-2 text-[13px] font-medium rounded-lg whitespace-nowrap transition-all ${
                                        active
                                            ? "bg-white text-stone-900 shadow-sm"
                                            : "text-stone-500 hover:text-stone-700"
                                    }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span className="hidden lg:inline">{tab.label}</span>
                                    <span className="lg:hidden">{tab.label.split(" ")[0]}</span>
                                </button>
                            );
                        })}
                    </div>
                    {canEdit && (
                        <div className="flex items-center gap-2 flex-shrink-0">
                            {isEditing && (
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white text-xs font-semibold rounded-xl hover:bg-green-700 disabled:opacity-50 transition-all shadow-sm shadow-green-600/20"
                                >
                                    <Save className="w-3.5 h-3.5" />
                                    {saving ? "Saving..." : "Save Changes"}
                                </button>
                            )}
                            <button
                                onClick={toggleEdit}
                                className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl transition-all ${
                                    isEditing
                                        ? "text-stone-600 bg-stone-100 hover:bg-stone-200"
                                        : "text-green-700 bg-green-50 hover:bg-green-100 ring-1 ring-green-200/50"
                                }`}
                            >
                                {isEditing ? (
                                    <>
                                        <X className="w-3.5 h-3.5" />
                                        Cancel
                                    </>
                                ) : (
                                    <>
                                        <Edit3 className="w-3.5 h-3.5" />
                                        Edit
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>

                {/* Tab Content */}
                <div>
                    {activeTab === "personal" && (
                        <PersonalInfoTab
                            info={pds.personalInfo}
                            editing={editingTabs.personal}
                            onUpdate={(info) => setPds((prev) => ({ ...prev, personalInfo: info }))}
                        />
                    )}
                    {activeTab === "family" && (
                        <FamilyBackgroundTab
                            family={pds.familyBackground}
                            editing={editingTabs.family}
                            onUpdate={(family) => setPds((prev) => ({ ...prev, familyBackground: family }))}
                        />
                    )}
                    {activeTab === "education" && (
                        <EducationTab
                            education={pds.education}
                            editing={editingTabs.education}
                            onUpdate={(education) => setPds((prev) => ({ ...prev, education }))}
                        />
                    )}
                    {activeTab === "work" && (
                        <WorkExperienceTab
                            work={pds.workExperience}
                            editing={editingTabs.work}
                            onUpdate={(workExperience) => setPds((prev) => ({ ...prev, workExperience }))}
                        />
                    )}
                    {activeTab === "training" && (
                        <TrainingTab trainings={MOCK_TRAININGS} />
                    )}
                    {activeTab === "documents" && (
                        <DocumentsTab documents={MOCK_DOCUMENTS} />
                    )}
                </div>
            </div>
        </RoleLayout>
    );
}
