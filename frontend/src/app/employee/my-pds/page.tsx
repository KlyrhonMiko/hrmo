"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect } from "react";
import Link from 'next/link';
import {
    User,
    FileText,
    GraduationCap,
    Briefcase,
    Heart,
    BookOpen,
    Calendar,
    Shield,
    Award,
    Clock,
    CheckCircle2,
    AlertCircle,
    Sparkles,
    ArrowRight
} from "lucide-react";

import type {
    FullPDS,
    BackendUser
} from "@/types";
import { getStoredUser } from "@/lib/auth";
import { backendEnvelopeRequest } from "@/lib/backend-api";

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

function statusColor(status: string) {
    const s = status.toLowerCase();
    switch (s) {
        case "verified":
        case "completed":
        case "active":
            return "bg-emerald-50 text-emerald-700";
        case "pending":
        case "pending verification":
        case "ongoing":
            return "bg-amber-50 text-amber-700";
        case "rejected":
        case "expired":
        case "cancelled":
            return "bg-red-50 text-red-700";
        default:
            return "bg-stone-100 text-stone-600";
    }
}

function StatusBadge({ status }: { status: string }) {
    const s = status.toLowerCase();
    return (
        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${statusColor(status)}`}>
            {(s === "verified" || s === "completed") && <CheckCircle2 className="w-3 h-3" />}
            {(s === "pending" || s === "pending verification") && <Clock className="w-3 h-3" />}
            {(s === "rejected" || s === "expired") && <AlertCircle className="w-3 h-3" />}
            {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
        </span>
    );
}

// ─── Interfaces ───────────────────────────────────────────────────────────────

interface RawPDSEntity {
    personalInfo: {
        surname: string;
        first_name: string;
        middle_name?: string | null;
        name_extension?: string | null;
        date_of_birth: string;
        place_of_birth?: string | null;
        sex: string;
        civil_status: string;
        citizenship?: string | null;
        height?: number | string | null;
        weight?: number | string | null;
        blood_type?: string | null;
        governmentIds?: { id_type: string; id_value: string }[];
        residentialAddress?: Record<string, any> | null;
        permanentAddress?: Record<string, any> | null;
        contactInfo?: {
            telephone_no?: string | null;
            mobile_no: string;
            email_address: string;
        } | null;
    };
    familyBackground: {
        spouse?: Record<string, any> | null;
        father?: Record<string, any> | null;
        mother?: Record<string, any> | null;
        children?: Record<string, any>[];
    };
    education?: Record<string, any>[];
    eligibility?: Record<string, any>[];
    workExperience?: Record<string, any>[];
    training?: Record<string, any>[];
    voluntaryWork?: Record<string, any>[];
    otherInfo?: { info_type: string; information: string }[];
    references?: Record<string, any>[];
    employee: {
        employee_no: string;
        office_department: string;
        employment_status: string;
        status: string;
        verified_by?: string | null;
        verified_at?: string | null;
    };
}


export default function MyPDSPage() {
    const [user, setUser] = useState<BackendUser | null>(null);
    const [pds, setPds] = useState<FullPDS | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabKey>("personal");

    useEffect(() => {
        const stored = getStoredUser();
        setUser(stored);

        const fetchPDS = async () => {
            try {
                const env = await backendEnvelopeRequest<RawPDSEntity>("/api/employees/me/pds");

                if (env.data && env.data.personalInfo && env.data.employee) {
                    // Mapping backend response to FullPDS type
                    const raw = env.data;

                    const mapped: FullPDS = {
                        personalInfo: {
                            surname: raw.personalInfo.surname,
                            firstName: raw.personalInfo.first_name,
                            middleName: raw.personalInfo.middle_name || "",
                            nameExtension: raw.personalInfo.name_extension || "",
                            dateOfBirth: raw.personalInfo.date_of_birth,
                            placeOfBirth: raw.personalInfo.place_of_birth || "",
                            sex: raw.personalInfo.sex as any,
                            civilStatus: raw.personalInfo.civil_status as any,
                            height: String(raw.personalInfo.height || ""),
                            weight: String(raw.personalInfo.weight || ""),
                            bloodType: raw.personalInfo.blood_type || "",
                            gsisIdNo: raw.personalInfo.governmentIds?.find(id => id.id_type === "GSIS")?.id_value || "",
                            pagIbigIdNo: raw.personalInfo.governmentIds?.find(id => id.id_type === "PAG_IBIG")?.id_value || "",
                            philhealthNo: raw.personalInfo.governmentIds?.find(id => id.id_type === "PHILHEALTH")?.id_value || "",
                            sssNo: raw.personalInfo.governmentIds?.find(id => id.id_type === "SSS")?.id_value || "",
                            tinNo: raw.personalInfo.governmentIds?.find(id => id.id_type === "TIN")?.id_value || "",
                            agencyEmployeeNo: raw.employee.employee_no || "",
                            citizenship: raw.personalInfo.citizenship || "",
                            residentialAddress: {
                                houseBlockLot: raw.personalInfo.residentialAddress?.house_no || "",
                                street: raw.personalInfo.residentialAddress?.street || "",
                                subdivision: raw.personalInfo.residentialAddress?.subdivision_village || "",
                                barangay: raw.personalInfo.residentialAddress?.barangay || "",
                                cityMunicipality: raw.personalInfo.residentialAddress?.city || "",
                                province: raw.personalInfo.residentialAddress?.province || "",
                                zipCode: raw.personalInfo.residentialAddress?.zip_code || "",
                            },
                            permanentAddress: {
                                houseBlockLot: raw.personalInfo.permanentAddress?.house_no || "",
                                street: raw.personalInfo.permanentAddress?.street || "",
                                subdivision: raw.personalInfo.permanentAddress?.subdivision_village || "",
                                barangay: raw.personalInfo.permanentAddress?.barangay || "",
                                cityMunicipality: raw.personalInfo.permanentAddress?.city || "",
                                province: raw.personalInfo.permanentAddress?.province || "",
                                zipCode: raw.personalInfo.permanentAddress?.zip_code || "",
                            },
                            telephoneNo: raw.personalInfo.contactInfo?.telephone_no || "",
                            mobileNo: raw.personalInfo.contactInfo?.mobile_no || "",
                            email: raw.personalInfo.contactInfo?.email_address || "",
                        },
                        familyBackground: {
                            spouseSurname: raw.familyBackground.spouse?.surname || "",
                            spouseFirstName: raw.familyBackground.spouse?.first_name || "",
                            spouseMiddleName: raw.familyBackground.spouse?.middle_name || "",
                            spouseNameExtension: raw.familyBackground.spouse?.name_extension || "",
                            spouseOccupation: raw.familyBackground.spouse?.occupation || "",
                            spouseEmployerBusinessName: raw.familyBackground.spouse?.employee_business_name || "",
                            spouseBusinessAddress: raw.familyBackground.spouse?.business_address || "",
                            spouseTelephoneNo: raw.familyBackground.spouse?.telephone_no || "",
                            fatherSurname: raw.familyBackground.father?.surname || "",
                            fatherFirstName: raw.familyBackground.father?.first_name || "",
                            fatherMiddleName: raw.familyBackground.father?.middle_name || "",
                            fatherNameExtension: raw.familyBackground.father?.name_extension || "",
                            motherMaidenSurname: raw.familyBackground.mother?.surname || "",
                            motherFirstName: raw.familyBackground.mother?.first_name || "",
                            motherMiddleName: raw.familyBackground.mother?.middle_name || "",
                            children: raw.familyBackground.children?.map((c: any) => ({
                                fullName: `${c.surname}, ${c.first_name}`,
                                dateOfBirth: c.date_of_birth
                            })) || [],
                        },
                        education: raw.education?.map((e: any) => ({
                            level: e.level,
                            schoolName: e.school_name,
                            basicEducationDegreeCourse: e.degree_course || "",
                            periodFrom: e.period_from,
                            periodTo: e.period_to || "",
                            highestLevelUnitsEarned: e.highest_level_attained || "",
                            yearGraduated: e.year_graduated || "",
                            scholarshipAcademicHonorsReceived: e.academic_awards || "",
                        })) || [],
                        civilServiceEligibility: raw.eligibility?.map((e: any) => ({
                            careerService: e.career_service,
                            rating: e.rating,
                            dateOfExamination: e.date_of_examination,
                            placeOfExamination: e.place_of_examination,
                            licenseNumber: e.license_no || "",
                            dateOfValidity: e.date_of_validity || "",
                        })) || [],
                        workExperience: raw.workExperience?.map((w: any) => ({
                            dateFrom: w.date_from,
                            dateTo: w.date_to || "Present",
                            positionTitle: w.position_title,
                            department: w.department,
                            monthlySalary: w.monthly_salary || "",
                            salaryGrade: w.salary_grade || "",
                            statusOfAppointment: w.status_of_appointment,
                            isGovernmentService: w.is_government_service,
                        })) || [],
                        voluntaryWork: raw.voluntaryWork?.map((v: any) => ({
                            organizationName: v.organization_name,
                            organizationAddress: v.organization_address,
                            dateFrom: v.date_from,
                            dateTo: v.date_to || "",
                            numberOfHours: String(v.number_of_hours),
                            positionNatureOfWork: v.position,
                        })) || [],
                        learningDevelopment: raw.training?.map((t: any) => ({
                            title: t.training_title,
                            dateFrom: t.date_from,
                            dateTo: t.date_to,
                            numberOfHours: String(t.number_of_hours),
                            type: t.training_type,
                            conductedSponsoredBy: t.conducted_by,
                        })) || [],
                        otherInfo: {
                            specialSkillsHobbies: raw.otherInfo?.filter(i => i.info_type === "special_skills").map(i => i.information) || [],
                            nonAcademicDistinctions: raw.otherInfo?.filter(i => i.info_type === "non_academic_recognitions").map(i => i.information) || [],
                            membershipInAssociations: raw.otherInfo?.filter(i => i.info_type === "organization_memberships").map(i => i.information) || [],
                        },
                        references: raw.references?.map((r: any) => ({
                            name: r.name,
                            address: r.address,
                            telephoneNo: r.telephone_no,
                        })) || [],
                        governmentIssuedId: {
                            idType: "",
                            idNumber: "",
                            dateOfIssuance: "",
                            placeOfIssuance: "",
                        },
                        office: raw.employee.office_department,
                        employmentStatus: raw.employee.employment_status as any,
                        verificationStatus: raw.employee.status,
                        verifiedBy: raw.employee.verified_by || undefined,
                        verifiedAt: raw.employee.verified_at || undefined,
                    };
                    setPds(mapped);
                }
            } catch (err) {
                console.error("Failed to fetch PDS:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchPDS();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <div className="animate-spin w-10 h-10 border-4 border-stone-100 border-t-green-600 rounded-full" />
                <p className="text-stone-400 text-sm font-medium animate-pulse">Loading your PDS data...</p>
            </div>
        );
    }

    if (!pds) {
        return (
            <div className="max-w-4xl mx-auto py-12">
                <div className="bg-white rounded-[32px] border border-stone-200 p-12 text-center shadow-xl shadow-stone-200/50">
                    <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner">
                        <FileText className="w-10 h-10 text-emerald-600" />
                    </div>
                    <h1 className="text-3xl font-black text-stone-900 mb-4">No PDS Data Found</h1>
                    <p className="text-stone-500 text-lg max-w-lg mx-auto mb-10 leading-relaxed">
                        It looks like you haven&apos;t completed your Personal Data Sheet yet. 
                        Fill out the onboarding form to generate your 201 profile.
                    </p>
                    <Link 
                        href="/employee/onboard"
                        className="inline-flex items-center gap-3 px-10 py-5 bg-stone-900 text-white rounded-2xl text-lg font-bold hover:bg-green-700 hover:scale-[1.05] transition-all active:scale-95 shadow-xl shadow-stone-900/20 group"
                    >
                        Go to Onboarding Form
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto pb-20 space-y-6">
            {/* Header Section */}
            <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden mb-8">
                <div className="bg-gradient-to-r from-stone-900 to-stone-800 px-8 py-10 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-6 text-center md:text-left">
                        <div className="w-20 h-20 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center">
                            <User className="w-10 h-10 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-white tracking-tight">
                                {pds.personalInfo.firstName} {pds.personalInfo.surname}
                            </h1>
                            <p className="text-stone-400 flex items-center justify-center md:justify-start gap-2 mt-2 font-medium">
                                <Shield className="w-4 h-4" />
                                Civil Service Form 212 / Personal Data Sheet
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-center bg-white/5 border border-white/10 px-6 py-3 rounded-2xl backdrop-blur-sm">
                            <p className="text-[10px] text-stone-500 uppercase tracking-widest font-black mb-1">Status</p>
                            <StatusBadge status={pds.verificationStatus} />
                        </div>
                    </div>
                </div>

                <div className="flex border-b border-stone-100 overflow-x-auto no-scrollbar">
                    {TABS.map((tab) => {
                        const Icon = tab.icon;
                        const active = activeTab === tab.key;
                        return (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`flex-shrink-0 flex items-center gap-2.5 px-8 py-5 text-sm font-bold transition-all relative ${
                                    active ? "text-green-700" : "text-stone-500 hover:text-stone-800 hover:bg-stone-50"
                                }`}
                            >
                                <Icon className={`w-4 h-4 ${active ? "text-green-600" : "text-stone-400"}`} />
                                {tab.label}
                                {active && <div className="absolute bottom-0 left-0 right-0 h-1 bg-green-600 rounded-t-full shadow-sm shadow-green-600/50" />}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Tab Content */}
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                {activeTab === "personal" && (
                    <div className="grid grid-cols-1 gap-6">
                        <SectionCard title="Basic Information">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <ReadOnlyField label="Surname" value={pds.personalInfo.surname} />
                                <ReadOnlyField label="First Name" value={pds.personalInfo.firstName} />
                                <ReadOnlyField label="Middle Name" value={pds.personalInfo.middleName} />
                                <ReadOnlyField label="Name Extension" value={pds.personalInfo.nameExtension} />
                                <ReadOnlyField label="Date of Birth" value={formatDate(pds.personalInfo.dateOfBirth)} />
                                <ReadOnlyField label="Place of Birth" value={pds.personalInfo.placeOfBirth} />
                                <ReadOnlyField label="Sex" value={pds.personalInfo.sex} />
                                <ReadOnlyField label="Civil Status" value={pds.personalInfo.civilStatus} />
                                <ReadOnlyField label="Citizenship" value={pds.personalInfo.citizenship} />
                                <ReadOnlyField label="Height (m)" value={pds.personalInfo.height} />
                                <ReadOnlyField label="Weight (kg)" value={pds.personalInfo.weight} />
                                <ReadOnlyField label="Blood Type" value={pds.personalInfo.bloodType} />
                            </div>
                        </SectionCard>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <SectionCard title="Government IDs">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <ReadOnlyField label="GSIS ID No." value={pds.personalInfo.gsisIdNo} />
                                    <ReadOnlyField label="PAG-IBIG ID No." value={pds.personalInfo.pagIbigIdNo} />
                                    <ReadOnlyField label="PhilHealth No." value={pds.personalInfo.philhealthNo} />
                                    <ReadOnlyField label="SSS No." value={pds.personalInfo.sssNo} />
                                    <ReadOnlyField label="TIN No." value={pds.personalInfo.tinNo} />
                                    <ReadOnlyField label="Agency Employee No." value={pds.personalInfo.agencyEmployeeNo} />
                                </div>
                            </SectionCard>

                            <SectionCard title="Contact Information">
                                <div className="grid grid-cols-1 gap-6">
                                    <ReadOnlyField label="Mobile No." value={pds.personalInfo.mobileNo} />
                                    <ReadOnlyField label="Telephone No." value={pds.personalInfo.telephoneNo} />
                                    <ReadOnlyField label="Email Address" value={pds.personalInfo.email} />
                                </div>
                            </SectionCard>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <SectionCard title="Residential Address">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="sm:col-span-2">
                                        <ReadOnlyField label="House/Block/Lot" value={pds.personalInfo.residentialAddress.houseBlockLot || ""} />
                                    </div>
                                    <ReadOnlyField label="Street" value={pds.personalInfo.residentialAddress.street || ""} />
                                    <ReadOnlyField label="Subdivision" value={pds.personalInfo.residentialAddress.subdivision || ""} />
                                    <ReadOnlyField label="Barangay" value={pds.personalInfo.residentialAddress.barangay || ""} />
                                    <ReadOnlyField label="City/Municipality" value={pds.personalInfo.residentialAddress.cityMunicipality || ""} />
                                    <ReadOnlyField label="Province" value={pds.personalInfo.residentialAddress.province || ""} />
                                    <ReadOnlyField label="Zip Code" value={pds.personalInfo.residentialAddress.zipCode || ""} />
                                </div>
                            </SectionCard>

                            <SectionCard title="Permanent Address">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="sm:col-span-2">
                                        <ReadOnlyField label="House/Block/Lot" value={pds.personalInfo.permanentAddress.houseBlockLot || ""} />
                                    </div>
                                    <ReadOnlyField label="Street" value={pds.personalInfo.permanentAddress.street || ""} />
                                    <ReadOnlyField label="Subdivision" value={pds.personalInfo.permanentAddress.subdivision || ""} />
                                    <ReadOnlyField label="Barangay" value={pds.personalInfo.permanentAddress.barangay || ""} />
                                    <ReadOnlyField label="City/Municipality" value={pds.personalInfo.permanentAddress.cityMunicipality || ""} />
                                    <ReadOnlyField label="Province" value={pds.personalInfo.permanentAddress.province || ""} />
                                    <ReadOnlyField label="Zip Code" value={pds.personalInfo.permanentAddress.zipCode || ""} />
                                </div>
                            </SectionCard>
                        </div>
                    </div>
                )}

                {activeTab === "family" && (
                    <div className="grid grid-cols-1 gap-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <SectionCard title="Spouse Information">
                                {pds.familyBackground.spouseSurname ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <ReadOnlyField label="Surname" value={pds.familyBackground.spouseSurname} />
                                        <ReadOnlyField label="First Name" value={pds.familyBackground.spouseFirstName} />
                                        <ReadOnlyField label="Middle Name" value={pds.familyBackground.spouseMiddleName} />
                                        <ReadOnlyField label="Occupation" value={pds.familyBackground.spouseOccupation} />
                                        <div className="sm:col-span-2">
                                            <ReadOnlyField label="Employer/Business" value={pds.familyBackground.spouseEmployerBusinessName} />
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-stone-400 italic text-sm py-4">No spouse information recorded.</p>
                                )}
                            </SectionCard>

                            <div className="space-y-6">
                                <SectionCard title="Father's Name">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <ReadOnlyField label="First Name" value={pds.familyBackground.fatherFirstName} />
                                        <ReadOnlyField label="Surname" value={pds.familyBackground.fatherSurname} />
                                    </div>
                                </SectionCard>
                                <SectionCard title="Mother's Name">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <ReadOnlyField label="First Name" value={pds.familyBackground.motherFirstName} />
                                        <ReadOnlyField label="Maiden Surname" value={pds.familyBackground.motherMaidenSurname} />
                                    </div>
                                </SectionCard>
                            </div>
                        </div>

                        <SectionCard title="Children">
                            {pds.familyBackground.children.length > 0 ? (
                                <div className="divide-y divide-stone-100">
                                    {pds.familyBackground.children.map((child, idx) => (
                                        <div key={idx} className="py-4 first:pt-0 last:pb-0 flex justify-between items-center">
                                            <div>
                                                <h4 className="text-sm font-bold text-stone-800">{child.fullName}</h4>
                                                <p className="text-xs text-stone-500 mt-0.5 flex items-center gap-1.5">
                                                    <Calendar className="w-3 h-3" />
                                                    {formatDate(child.dateOfBirth)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-stone-400 italic text-sm py-4 text-center">No children recorded.</p>
                            )}
                        </SectionCard>
                    </div>
                )}

                {activeTab === "education" && (
                    <div className="space-y-4">
                        {pds.education.length > 0 ? (
                            pds.education.map((e, idx) => (
                                <SectionCard key={idx}>
                                    <div className="flex items-start gap-5">
                                        <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center font-bold text-amber-700 shadow-inner">
                                            <GraduationCap className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <span className="text-[10px] uppercase font-black tracking-widest text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md mb-1 inline-block">
                                                        {e.level}
                                                    </span>
                                                    <h4 className="text-base font-bold text-stone-900 tracking-tight">{e.schoolName}</h4>
                                                    <p className="text-sm font-medium text-stone-600 mt-0.5">{e.basicEducationDegreeCourse}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs font-bold text-stone-400">Class of {e.yearGraduated}</p>
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap gap-x-10 gap-y-2 mt-4 text-xs font-semibold text-stone-500">
                                                <span className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4 text-amber-600" />
                                                    {formatDate(e.periodFrom)} – {formatDate(e.periodTo)}
                                                </span>
                                                {e.scholarshipAcademicHonorsReceived && (
                                                    <span className="flex items-center gap-2">
                                                        <Award className="w-4 h-4 text-amber-600" />
                                                        {e.scholarshipAcademicHonorsReceived}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </SectionCard>
                            ))
                        ) : (
                            <SectionCard>
                                <p className="text-stone-400 italic text-sm py-8 text-center bg-stone-50 rounded-xl border border-dashed border-stone-200">
                                    No education history recorded.
                                </p>
                            </SectionCard>
                        )}
                    </div>
                )}

                {activeTab === "work" && (
                    <div className="space-y-4">
                        {pds.workExperience.map((w, idx) => (
                            <SectionCard key={idx}>
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center font-bold text-green-700 shadow-inner">
                                        {idx + 1}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h4 className="text-base font-bold text-stone-900 tracking-tight">{w.positionTitle}</h4>
                                                <p className="text-sm font-medium text-stone-500 mt-1">{w.department}</p>
                                            </div>
                                            <StatusBadge status={w.dateTo === "Present" ? "Active" : "Completed"} />
                                        </div>
                                        <div className="flex flex-wrap gap-x-10 gap-y-2 mt-4 text-xs font-semibold text-stone-500">
                                            <span className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-green-600" />
                                                {formatDate(w.dateFrom)} – {w.dateTo === "Present" ? "Present" : formatDate(w.dateTo)}
                                            </span>
                                            <span className="flex items-center gap-2">
                                                <Briefcase className="w-4 h-4 text-green-600" />
                                                {w.statusOfAppointment}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </SectionCard>
                        ))}
                    </div>
                )}

                {/* Simplified for other tabs similarly... */}
                {activeTab === "training" && (
                    <div className="space-y-4">
                        {pds.learningDevelopment.length > 0 ? (
                            pds.learningDevelopment.map((t, idx) => (
                                <SectionCard key={idx}>
                                    <div className="flex items-start gap-5">
                                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center font-bold text-indigo-700 shadow-inner">
                                            <BookOpen className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h4 className="text-base font-bold text-stone-900 tracking-tight">{t.title}</h4>
                                                    <p className="text-sm font-medium text-stone-600 mt-0.5">{t.conductedSponsoredBy}</p>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-widest">
                                                        {t.type}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap gap-x-10 gap-y-2 mt-4 text-xs font-semibold text-stone-500">
                                                <span className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4 text-indigo-600" />
                                                    {formatDate(t.dateFrom)} – {formatDate(t.dateTo)}
                                                </span>
                                                <span className="flex items-center gap-2">
                                                    <Clock className="w-4 h-4 text-indigo-600" />
                                                    {t.numberOfHours} Hours
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </SectionCard>
                            ))
                        ) : (
                            <SectionCard>
                                <p className="text-stone-400 italic text-sm py-8 text-center bg-stone-50 rounded-xl border border-dashed border-stone-200">
                                    No training or seminars recorded.
                                </p>
                            </SectionCard>
                        )}
                    </div>
                )}

                {activeTab === "documents" && (
                    <div className="grid grid-cols-1 gap-6">
                        <SectionCard title="Other Information & References">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-8">
                                    <div>
                                        <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 mb-4 flex items-center gap-2">
                                            <Sparkles className="w-3 h-3 text-green-600" />
                                            Skills & Hobbies
                                        </h5>
                                        <div className="flex flex-wrap gap-2">
                                            {pds.otherInfo.specialSkillsHobbies.length > 0 ? (
                                                pds.otherInfo.specialSkillsHobbies.map((s, i) => (
                                                    <span key={i} className="px-3 py-1.5 bg-stone-100 text-stone-700 text-xs font-bold rounded-lg border border-stone-200/50">
                                                        {s}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-stone-300 text-xs italic">No skills listed</span>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 mb-4 flex items-center gap-2">
                                            <Award className="w-3 h-3 text-amber-600" />
                                            Non-Academic Distinctions
                                        </h5>
                                        <ul className="space-y-2">
                                            {pds.otherInfo.nonAcademicDistinctions.length > 0 ? (
                                                pds.otherInfo.nonAcademicDistinctions.map((d, i) => (
                                                    <li key={i} className="text-sm font-medium text-stone-700 flex items-start gap-2">
                                                        <div className="w-1 h-1 rounded-full bg-amber-400 mt-2" />
                                                        {d}
                                                    </li>
                                                ))
                                            ) : (
                                                <li className="text-stone-300 text-xs italic">No distinctions listed</li>
                                            )}
                                        </ul>
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    <div>
                                        <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 mb-4 flex items-center gap-2">
                                            <Shield className="w-3 h-3 text-indigo-600" />
                                            Association Memberships
                                        </h5>
                                        <ul className="space-y-2">
                                            {pds.otherInfo.membershipInAssociations.length > 0 ? (
                                                pds.otherInfo.membershipInAssociations.map((m, i) => (
                                                    <li key={i} className="text-sm font-medium text-stone-700 flex items-start gap-2">
                                                        <div className="w-1 h-1 rounded-full bg-indigo-400 mt-2" />
                                                        {m}
                                                    </li>
                                                ))
                                            ) : (
                                                <li className="text-stone-300 text-xs italic">No memberships listed</li>
                                            )}
                                        </ul>
                                    </div>
                                    <div>
                                        <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 mb-4 flex items-center gap-2">
                                            <Briefcase className="w-3 h-3 text-blue-600" />
                                            Character References
                                        </h5>
                                        <div className="space-y-3">
                                            {pds.references.length > 0 ? (
                                                pds.references.map((r, i) => (
                                                    <div key={i} className="bg-stone-50 p-3 rounded-xl border border-stone-200/60">
                                                        <p className="text-xs font-bold text-stone-900">{r.name}</p>
                                                        <p className="text-[10px] text-stone-500 mt-0.5">{r.address} | {r.telephoneNo}</p>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-stone-300 text-xs italic">No references listed</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </SectionCard>

                        <SectionCard title="Voluntary Work">
                            {pds.voluntaryWork.length > 0 ? (
                                <div className="space-y-4">
                                    {pds.voluntaryWork.map((v, idx) => (
                                        <div key={idx} className="flex items-start gap-4 p-4 rounded-2xl bg-rose-50/30 border border-rose-100">
                                            <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center font-bold text-rose-600">
                                                <Heart className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between">
                                                    <h4 className="text-sm font-bold text-stone-900">{v.organizationName}</h4>
                                                    <span className="text-[10px] font-black text-rose-600">{v.numberOfHours} hrs</span>
                                                </div>
                                                <p className="text-xs text-stone-500 font-medium mt-1">{v.positionNatureOfWork}</p>
                                                <p className="text-[10px] text-stone-400 mt-2 flex items-center gap-1.5 uppercase font-bold tracking-wider">
                                                    <Calendar className="w-3 h-3" />
                                                    {formatDate(v.dateFrom)} – {v.dateTo ? formatDate(v.dateTo) : "Present"}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-stone-400 italic text-sm py-4 text-center">No voluntary work recorded.</p>
                            )}
                        </SectionCard>
                    </div>
                )}
            </div>
        </div>
    );
}
