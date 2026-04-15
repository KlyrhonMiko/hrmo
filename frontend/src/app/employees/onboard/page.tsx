"use client";

import React, { useState } from "react";
import { RoleLayout } from "@/components/layout/RoleLayout";
import type {
    FullPDS,
    PDSAddress,
    PDSChild,
    PDSEducation,
    PDSCivilServiceEligibility,
    PDSWorkExperience,
    PDSVoluntaryWork,
    PDSLearningDevelopment,
    PDSReference,
    PDSGovernmentIssuedID,
} from "@/types";
import {
    UserPlus,
    ChevronLeft,
    ChevronRight,
    Check,
    Save,
    Send,
    Plus,
    Trash2,
    User,
    Users,
    GraduationCap,
    Award,
    Briefcase,
    BookOpen,
    Info,
    ClipboardList,
    Copy,
    Heart,
    FileCheck,
    CreditCard,
} from "lucide-react";

/* ── constants ─────────────────────────────────────────── */

const OFFICES = [
    "CCS",
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
    "Other",
];

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const EDUCATION_LEVELS: PDSEducation["level"][] = [
    "Elementary",
    "Secondary",
    "Vocational/Trade",
    "College",
    "Graduate Studies",
];

const STEPS = [
    { key: "personal", label: "Personal Information", icon: User, desc: "Basic details, government IDs, address & contact" },
    { key: "family", label: "Family Background", icon: Users, desc: "Spouse, parents, and children information" },
    { key: "education", label: "Educational Background", icon: GraduationCap, desc: "Academic history from elementary to graduate studies" },
    { key: "eligibility", label: "Civil Service Eligibility", icon: Award, desc: "Examinations, licenses, and eligibility records" },
    { key: "work", label: "Work Experience", icon: Briefcase, desc: "Employment history including government service" },
    { key: "voluntary", label: "Voluntary Work", icon: Heart, desc: "Civic and non-government organization involvement" },
    { key: "learning", label: "Learning & Development", icon: BookOpen, desc: "Training programs and seminars attended" },
    { key: "other", label: "Other Information", icon: Info, desc: "Skills, distinctions, and organization memberships" },
    { key: "references", label: "References & ID", icon: CreditCard, desc: "Character references and government-issued ID" },
    { key: "review", label: "Review & Submit", icon: ClipboardList, desc: "Review all entries before final submission" },
] as const;

/* ── helpers ───────────────────────────────────────────── */

const emptyAddress = (): PDSAddress => ({
    houseBlockLot: "",
    street: "",
    subdivision: "",
    barangay: "",
    cityMunicipality: "",
    province: "",
    zipCode: "",
});

const emptyChild = (): PDSChild => ({
    fullName: "",
    surname: "",
    firstName: "",
    middleName: "",
    nameExtension: "",
    dateOfBirth: "",
});

const emptyEducation = (level: PDSEducation["level"] = "Elementary"): PDSEducation => ({
    level,
    schoolName: "",
    basicEducationDegreeCourse: "",
    periodFrom: "",
    periodTo: "",
    highestLevelUnitsEarned: "",
    yearGraduated: "",
    scholarshipAcademicHonorsReceived: "",
});

const emptyEligibility = (): PDSCivilServiceEligibility => ({
    careerService: "",
    rating: "",
    dateOfExamination: "",
    placeOfExamination: "",
    licenseNumber: "",
    dateOfValidity: "",
});

const emptyWork = (): PDSWorkExperience => ({
    dateFrom: "",
    dateTo: "",
    positionTitle: "",
    department: "",
    monthlySalary: "",
    salaryGrade: "",
    statusOfAppointment: "",
    isGovernmentService: false,
});

const emptyLD = (): PDSLearningDevelopment => ({
    title: "",
    dateFrom: "",
    dateTo: "",
    numberOfHours: "",
    type: "",
    conductedSponsoredBy: "",
});

const emptyVoluntary = (): PDSVoluntaryWork => ({
    organizationName: "",
    organizationAddress: "",
    dateFrom: "",
    dateTo: "",
    numberOfHours: "",
    positionNatureOfWork: "",
});

const emptyReference = (): PDSReference => ({
    name: "",
    address: "",
    telephoneNo: "",
});

const emptyGovId = (): PDSGovernmentIssuedID => ({
    idType: "",
    idNumber: "",
    dateOfIssuance: "",
    placeOfIssuance: "",
});

const initialFormData: FullPDS = {
    personalInfo: {
        surname: "",
        firstName: "",
        middleName: "",
        nameExtension: "",
        dateOfBirth: "",
        placeOfBirth: "",
        sex: "Male",
        civilStatus: "Single",
        height: "",
        weight: "",
        bloodType: "",
        gsisIdNo: "",
        pagIbigIdNo: "",
        philhealthNo: "",
        sssNo: "",
        tinNo: "",
        agencyEmployeeNo: "",
        citizenship: "Filipino",
        dualCitizenshipCountry: "",
        residentialAddress: emptyAddress(),
        permanentAddress: emptyAddress(),
        telephoneNo: "",
        mobileNo: "",
        email: "",
    },
    familyBackground: {
        spouseSurname: "",
        spouseFirstName: "",
        spouseMiddleName: "",
        spouseNameExtension: "",
        spouseOccupation: "",
        spouseEmployerBusinessName: "",
        spouseBusinessAddress: "",
        spouseTelephoneNo: "",
        fatherSurname: "",
        fatherFirstName: "",
        fatherMiddleName: "",
        fatherNameExtension: "",
        motherMaidenSurname: "",
        motherFirstName: "",
        motherMiddleName: "",
        children: [],
    },
    education: EDUCATION_LEVELS.map((l) => emptyEducation(l)),
    civilServiceEligibility: [],
    workExperience: [],
    voluntaryWork: [],
    learningDevelopment: [],
    otherInfo: {
        specialSkillsHobbies: [],
        nonAcademicDistinctions: [],
        membershipInAssociations: [],
    },
    references: [emptyReference(), emptyReference(), emptyReference()],
    governmentIssuedId: emptyGovId(),
    dateAccomplished: "",
    office: "",
    employmentStatus: "Teaching",
};

/* ── reusable sub-components ──────────────────────────── */

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
    return (
        <label className="block text-xs font-medium text-stone-600 mb-1">
            {children}
            {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
    );
}

function Input({
    value,
    onChange,
    placeholder,
    type = "text",
    disabled,
}: {
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    type?: string;
    disabled?: boolean;
}) {
    return (
        <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            className="w-full px-3 py-2.5 bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all outline-none text-sm placeholder:text-stone-300 disabled:opacity-50"
        />
    );
}

function Select({
    value,
    onChange,
    options,
    placeholder,
}: {
    value: string;
    onChange: (v: string) => void;
    options: { value: string; label: string }[];
    placeholder?: string;
}) {
    return (
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-3 py-2.5 bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all outline-none text-sm"
        >
            {placeholder && (
                <option value="" disabled>
                    {placeholder}
                </option>
            )}
            {options.map((o) => (
                <option key={o.value} value={o.value}>
                    {o.label}
                </option>
            ))}
        </select>
    );
}

function SectionCard({
    title,
    icon: Icon,
    children,
}: {
    title: string;
    icon?: React.ElementType;
    children: React.ReactNode;
}) {
    return (
        <div className="bg-white rounded-2xl border border-stone-200/80 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-stone-100 bg-gradient-to-r from-stone-50/80 to-white">
                <h3 className="text-sm font-semibold text-stone-800 flex items-center gap-2">
                    {Icon && <Icon className="w-4 h-4 text-green-600" />}
                    {title}
                </h3>
            </div>
            <div className="p-6">{children}</div>
        </div>
    );
}

/* ── address block ───────────────────────────────────── */

function AddressFields({
    address,
    onChange,
}: {
    address: PDSAddress;
    onChange: (a: PDSAddress) => void;
}) {
    const set = (key: keyof PDSAddress, val: string) =>
        onChange({ ...address, [key]: val });

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
                <Label>House/Block/Lot No.</Label>
                <Input value={address.houseBlockLot} onChange={(v) => set("houseBlockLot", v)} />
            </div>
            <div>
                <Label>Street</Label>
                <Input value={address.street} onChange={(v) => set("street", v)} />
            </div>
            <div>
                <Label>Subdivision/Village</Label>
                <Input value={address.subdivision} onChange={(v) => set("subdivision", v)} />
            </div>
            <div>
                <Label>Barangay</Label>
                <Input value={address.barangay} onChange={(v) => set("barangay", v)} />
            </div>
            <div>
                <Label>City/Municipality</Label>
                <Input value={address.cityMunicipality} onChange={(v) => set("cityMunicipality", v)} />
            </div>
            <div>
                <Label>Province</Label>
                <Input value={address.province} onChange={(v) => set("province", v)} />
            </div>
            <div>
                <Label>ZIP Code</Label>
                <Input value={address.zipCode} onChange={(v) => set("zipCode", v)} />
            </div>
        </div>
    );
}

/* ══════════════════════════════════════════════════════
   MAIN PAGE COMPONENT
   ══════════════════════════════════════════════════════ */

export default function PDSOnboardPage() {
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState<FullPDS>(initialFormData);
    const [sameAsResidential, setSameAsResidential] = useState(false);
    const [employeeMeta, setEmployeeMeta] = useState({
        employeeNo: "",
        positionTitle: "",
        dateHired: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

    /* ── updaters ──────────────────────────────────────── */

    const updatePersonal = <K extends keyof FullPDS["personalInfo"]>(
        key: K,
        value: FullPDS["personalInfo"][K]
    ) =>
        setFormData((prev) => ({
            ...prev,
            personalInfo: { ...prev.personalInfo, [key]: value },
        }));

    const updateFamily = <K extends keyof FullPDS["familyBackground"]>(
        key: K,
        value: FullPDS["familyBackground"][K]
    ) =>
        setFormData((prev) => ({
            ...prev,
            familyBackground: { ...prev.familyBackground, [key]: value },
        }));

    const copyResidentialToPermanent = () => {
        setSameAsResidential(true);
        updatePersonal("permanentAddress", { ...formData.personalInfo.residentialAddress });
    };

    /* ── array helpers ─────────────────────────────────── */

    function addChild() {
        updateFamily("children", [...formData.familyBackground.children, emptyChild()]);
    }
    function removeChild(i: number) {
        updateFamily(
            "children",
            formData.familyBackground.children.filter((_, idx) => idx !== i)
        );
    }
    function updateChild(i: number, key: keyof PDSChild, val: string) {
        const arr = [...formData.familyBackground.children];
        const updatedChild = { ...arr[i], [key]: val };
        const surname = (updatedChild.surname || "").trim();
        const firstName = (updatedChild.firstName || "").trim();
        const middleName = (updatedChild.middleName || "").trim();
        const extension = (updatedChild.nameExtension || "").trim();
        const firstAndMiddle = [firstName, middleName].filter(Boolean).join(" ").trim();
        updatedChild.fullName = [surname ? `${surname},` : "", firstAndMiddle, extension]
            .filter(Boolean)
            .join(" ")
            .trim();
        arr[i] = updatedChild;
        updateFamily("children", arr);
    }

    function addEducation() {
        setFormData((p) => ({ ...p, education: [...p.education, emptyEducation()] }));
    }
    function removeEducation(i: number) {
        setFormData((p) => ({
            ...p,
            education: p.education.filter((_, idx) => idx !== i),
        }));
    }
    function updateEducation<K extends keyof PDSEducation>(i: number, key: K, val: PDSEducation[K]) {
        setFormData((p) => {
            const arr = [...p.education];
            arr[i] = { ...arr[i], [key]: val };
            return { ...p, education: arr };
        });
    }

    function addEligibility() {
        setFormData((p) => ({
            ...p,
            civilServiceEligibility: [...p.civilServiceEligibility, emptyEligibility()],
        }));
    }
    function removeEligibility(i: number) {
        setFormData((p) => ({
            ...p,
            civilServiceEligibility: p.civilServiceEligibility.filter((_, idx) => idx !== i),
        }));
    }
    function updateEligibility<K extends keyof PDSCivilServiceEligibility>(
        i: number,
        key: K,
        val: PDSCivilServiceEligibility[K]
    ) {
        setFormData((p) => {
            const arr = [...p.civilServiceEligibility];
            arr[i] = { ...arr[i], [key]: val };
            return { ...p, civilServiceEligibility: arr };
        });
    }

    function addWork() {
        setFormData((p) => ({ ...p, workExperience: [...p.workExperience, emptyWork()] }));
    }
    function removeWork(i: number) {
        setFormData((p) => ({
            ...p,
            workExperience: p.workExperience.filter((_, idx) => idx !== i),
        }));
    }
    function updateWork<K extends keyof PDSWorkExperience>(
        i: number,
        key: K,
        val: PDSWorkExperience[K]
    ) {
        setFormData((p) => {
            const arr = [...p.workExperience];
            arr[i] = { ...arr[i], [key]: val };
            return { ...p, workExperience: arr };
        });
    }

    function addLD() {
        setFormData((p) => ({
            ...p,
            learningDevelopment: [...p.learningDevelopment, emptyLD()],
        }));
    }
    function removeLD(i: number) {
        setFormData((p) => ({
            ...p,
            learningDevelopment: p.learningDevelopment.filter((_, idx) => idx !== i),
        }));
    }
    function updateLD<K extends keyof PDSLearningDevelopment>(
        i: number,
        key: K,
        val: PDSLearningDevelopment[K]
    ) {
        setFormData((p) => {
            const arr = [...p.learningDevelopment];
            arr[i] = { ...arr[i], [key]: val };
            return { ...p, learningDevelopment: arr };
        });
    }

    /* ── voluntary work helpers ────────────────────────── */

    function addVoluntary() {
        setFormData((p) => ({
            ...p,
            voluntaryWork: [...p.voluntaryWork, emptyVoluntary()],
        }));
    }
    function removeVoluntary(i: number) {
        setFormData((p) => ({
            ...p,
            voluntaryWork: p.voluntaryWork.filter((_, idx) => idx !== i),
        }));
    }
    function updateVoluntary<K extends keyof PDSVoluntaryWork>(
        i: number,
        key: K,
        val: PDSVoluntaryWork[K]
    ) {
        setFormData((p) => {
            const arr = [...p.voluntaryWork];
            arr[i] = { ...arr[i], [key]: val };
            return { ...p, voluntaryWork: arr };
        });
    }

    /* ── reference helpers ────────────────────────────── */

    function updateReference(i: number, key: keyof PDSReference, val: string) {
        setFormData((p) => {
            const arr = [...p.references];
            arr[i] = { ...arr[i], [key]: val };
            return { ...p, references: arr };
        });
    }

    /* ── government ID helpers ────────────────────────── */

    function updateGovId<K extends keyof PDSGovernmentIssuedID>(
        key: K,
        val: PDSGovernmentIssuedID[K]
    ) {
        setFormData((p) => ({
            ...p,
            governmentIssuedId: { ...p.governmentIssuedId, [key]: val },
        }));
    }

    /* other info list helpers */
    function addOtherItem(field: keyof FullPDS["otherInfo"]) {
        setFormData((p) => ({
            ...p,
            otherInfo: { ...p.otherInfo, [field]: [...p.otherInfo[field], ""] },
        }));
    }
    function removeOtherItem(field: keyof FullPDS["otherInfo"], i: number) {
        setFormData((p) => ({
            ...p,
            otherInfo: {
                ...p.otherInfo,
                [field]: p.otherInfo[field].filter((_: string, idx: number) => idx !== i),
            },
        }));
    }
    function updateOtherItem(field: keyof FullPDS["otherInfo"], i: number, val: string) {
        setFormData((p) => {
            const arr = [...p.otherInfo[field]];
            arr[i] = val;
            return { ...p, otherInfo: { ...p.otherInfo, [field]: arr } };
        });
    }

    /* ── navigation ────────────────────────────────────── */

    const canGoNext = currentStep < STEPS.length - 1;
    const canGoBack = currentStep > 0;
    const goNext = () => canGoNext && setCurrentStep((s) => s + 1);
    const goBack = () => canGoBack && setCurrentStep((s) => s - 1);

    const handleSaveDraft = () => {
        try {
            localStorage.setItem(
                "onboard-pds-draft",
                JSON.stringify({ formData, employeeMeta })
            );
            alert("Draft saved successfully!");
        } catch {
            alert("Unable to save draft in this browser session.");
        }
    };

    const handleSubmit = async () => {
        setSubmitError(null);
        setSubmitSuccess(null);
        setIsSubmitting(true);

        try {
            const response = await fetch("/api/employees/onboard", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ formData, employeeMeta }),
            });

            const payload = (await response.json()) as {
                success?: boolean;
                message?: string;
                stage?: string;
            };

            if (!response.ok || !payload.success) {
                const errorMessage = payload.message || "Failed to submit PDS.";
                const stageSuffix = payload.stage ? ` (stage: ${payload.stage})` : "";
                throw new Error(`${errorMessage}${stageSuffix}`);
            }

            setSubmitSuccess(payload.message || "PDS submitted successfully!");
            localStorage.removeItem("onboard-pds-draft");
        } catch (error) {
            setSubmitError(error instanceof Error ? error.message : "Failed to submit PDS.");
        } finally {
            setIsSubmitting(false);
        }
    };

    /* ══════════════════════════════════════════════════════
       STEP RENDERERS
       ══════════════════════════════════════════════════════ */

    function renderPersonalInfo() {
        const p = formData.personalInfo;
        return (
            <div className="space-y-6">
                {/* Basic info */}
                <SectionCard title="Basic Information" icon={User}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                            <Label required>Surname</Label>
                            <Input value={p.surname} onChange={(v) => updatePersonal("surname", v)} placeholder="Dela Cruz" />
                        </div>
                        <div>
                            <Label required>First Name</Label>
                            <Input value={p.firstName} onChange={(v) => updatePersonal("firstName", v)} placeholder="Juan" />
                        </div>
                        <div>
                            <Label>Middle Name</Label>
                            <Input value={p.middleName} onChange={(v) => updatePersonal("middleName", v)} placeholder="Santos" />
                        </div>
                        <div>
                            <Label>Name Extension</Label>
                            <Select
                                value={p.nameExtension}
                                onChange={(v) => updatePersonal("nameExtension", v)}
                                placeholder="N/A"
                                options={[
                                    { value: "", label: "N/A" },
                                    { value: "Jr.", label: "Jr." },
                                    { value: "Sr.", label: "Sr." },
                                    { value: "III", label: "III" },
                                    { value: "IV", label: "IV" },
                                    { value: "V", label: "V" },
                                ]}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                        <div>
                            <Label required>Date of Birth</Label>
                            <Input type="date" value={p.dateOfBirth} onChange={(v) => updatePersonal("dateOfBirth", v)} />
                        </div>
                        <div>
                            <Label required>Place of Birth</Label>
                            <Input value={p.placeOfBirth} onChange={(v) => updatePersonal("placeOfBirth", v)} placeholder="City, Province" />
                        </div>
                        <div>
                            <Label required>Sex</Label>
                            <Select
                                value={p.sex}
                                onChange={(v) => updatePersonal("sex", v as "Male" | "Female")}
                                options={[
                                    { value: "Male", label: "Male" },
                                    { value: "Female", label: "Female" },
                                ]}
                            />
                        </div>
                        <div>
                            <Label required>Civil Status</Label>
                            <Select
                                value={p.civilStatus}
                                onChange={(v) => updatePersonal("civilStatus", v as typeof p.civilStatus)}
                                options={[
                                    { value: "Single", label: "Single" },
                                    { value: "Married", label: "Married" },
                                    { value: "Widowed", label: "Widowed" },
                                    { value: "Separated", label: "Separated" },
                                    { value: "Other", label: "Other" },
                                ]}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                        <div>
                            <Label>Height (m)</Label>
                            <Input value={p.height} onChange={(v) => updatePersonal("height", v)} placeholder="1.65" />
                        </div>
                        <div>
                            <Label>Weight (kg)</Label>
                            <Input value={p.weight} onChange={(v) => updatePersonal("weight", v)} placeholder="60" />
                        </div>
                        <div>
                            <Label>Blood Type</Label>
                            <Select
                                value={p.bloodType}
                                onChange={(v) => updatePersonal("bloodType", v)}
                                placeholder="Select"
                                options={BLOOD_TYPES.map((b) => ({ value: b, label: b }))}
                            />
                        </div>
                        <div>
                            <Label>Citizenship</Label>
                            <Input value={p.citizenship} onChange={(v) => updatePersonal("citizenship", v)} />
                        </div>
                    </div>

                    {p.citizenship && p.citizenship !== "Filipino" && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                            <div>
                                <Label>Dual Citizenship Type</Label>
                                <Select
                                    value={p.dualCitizenshipType || ""}
                                    onChange={(v) => updatePersonal("dualCitizenshipType", v as "by birth" | "by naturalization")}
                                    placeholder="Select type"
                                    options={[
                                        { value: "by birth", label: "By Birth" },
                                        { value: "by naturalization", label: "By Naturalization" },
                                    ]}
                                />
                            </div>
                            <div>
                                <Label>Country</Label>
                                <Input
                                    value={p.dualCitizenshipCountry || ""}
                                    onChange={(v) => updatePersonal("dualCitizenshipCountry", v)}
                                    placeholder="e.g. United States"
                                />
                            </div>
                        </div>
                    )}
                </SectionCard>

                {/* Government IDs */}
                <SectionCard title="Government-Issued ID Numbers">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                            <Label>GSIS ID No.</Label>
                            <Input value={p.gsisIdNo} onChange={(v) => updatePersonal("gsisIdNo", v)} />
                        </div>
                        <div>
                            <Label>PAG-IBIG ID No.</Label>
                            <Input value={p.pagIbigIdNo} onChange={(v) => updatePersonal("pagIbigIdNo", v)} />
                        </div>
                        <div>
                            <Label>PhilHealth No.</Label>
                            <Input value={p.philhealthNo} onChange={(v) => updatePersonal("philhealthNo", v)} />
                        </div>
                        <div>
                            <Label>SSS No.</Label>
                            <Input value={p.sssNo} onChange={(v) => updatePersonal("sssNo", v)} />
                        </div>
                        <div>
                            <Label>TIN No.</Label>
                            <Input value={p.tinNo} onChange={(v) => updatePersonal("tinNo", v)} />
                        </div>
                        <div>
                            <Label>Agency Employee No.</Label>
                            <Input value={p.agencyEmployeeNo} onChange={(v) => updatePersonal("agencyEmployeeNo", v)} />
                        </div>
                    </div>
                </SectionCard>

                {/* Office & Employment */}
                <SectionCard title="Office / Department & Employment">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                        <div>
                            <Label required>Employee No.</Label>
                            <Input
                                value={employeeMeta.employeeNo}
                                onChange={(v) =>
                                    setEmployeeMeta((prev) => ({ ...prev, employeeNo: v }))
                                }
                                placeholder={formData.personalInfo.agencyEmployeeNo || "e.g. EMP-2026-0001"}
                            />
                        </div>
                        <div>
                            <Label required>Current Position Title</Label>
                            <Input
                                value={employeeMeta.positionTitle}
                                onChange={(v) =>
                                    setEmployeeMeta((prev) => ({ ...prev, positionTitle: v }))
                                }
                                placeholder="e.g. Instructor I"
                            />
                        </div>
                        <div>
                            <Label required>Date Hired</Label>
                            <Input
                                type="date"
                                value={employeeMeta.dateHired}
                                onChange={(v) =>
                                    setEmployeeMeta((prev) => ({ ...prev, dateHired: v }))
                                }
                            />
                        </div>
                        <div>
                            <Label required>Office / Department</Label>
                            <Select
                                value={formData.office}
                                onChange={(v) => setFormData((prev) => ({ ...prev, office: v }))}
                                placeholder="Select office/department"
                                options={OFFICES.map((o) => ({ value: o, label: o }))}
                            />
                        </div>
                        <div>
                            <Label required>Employment Status</Label>
                            <Select
                                value={formData.employmentStatus}
                                onChange={(v) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        employmentStatus: v as FullPDS["employmentStatus"],
                                    }))
                                }
                                options={[
                                    { value: "Teaching", label: "Teaching" },
                                    { value: "Non-Teaching", label: "Non-Teaching" },
                                    { value: "COS", label: "Contract of Service (COS)" },
                                ]}
                            />
                        </div>
                    </div>
                </SectionCard>

                {/* Residential Address */}
                <SectionCard title="Residential Address">
                    <AddressFields
                        address={p.residentialAddress}
                        onChange={(a) => updatePersonal("residentialAddress", a)}
                    />
                </SectionCard>

                {/* Permanent Address */}
                <SectionCard title="Permanent Address">
                    <div className="flex items-center gap-2 mb-4">
                        <button
                            type="button"
                            onClick={copyResidentialToPermanent}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-xl hover:bg-green-100 transition-colors"
                        >
                            <Copy className="w-3 h-3" />
                            Same as Residential
                        </button>
                        {sameAsResidential && (
                            <span className="text-xs text-green-600">Copied from residential address</span>
                        )}
                    </div>
                    <AddressFields
                        address={p.permanentAddress}
                        onChange={(a) => {
                            setSameAsResidential(false);
                            updatePersonal("permanentAddress", a);
                        }}
                    />
                </SectionCard>

                {/* Contact */}
                <SectionCard title="Contact Information">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <Label>Telephone No.</Label>
                            <Input value={p.telephoneNo} onChange={(v) => updatePersonal("telephoneNo", v)} placeholder="(02) 1234-5678" />
                        </div>
                        <div>
                            <Label required>Mobile No.</Label>
                            <Input value={p.mobileNo} onChange={(v) => updatePersonal("mobileNo", v)} placeholder="09XX-XXX-XXXX" />
                        </div>
                        <div>
                            <Label required>Email Address</Label>
                            <Input type="email" value={p.email} onChange={(v) => updatePersonal("email", v)} placeholder="email@example.com" />
                        </div>
                    </div>
                </SectionCard>
            </div>
        );
    }

    function renderFamilyBackground() {
        const f = formData.familyBackground;
        return (
            <div className="space-y-6">
                <SectionCard title="Spouse Details" icon={Users}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                            <Label>Surname</Label>
                            <Input value={f.spouseSurname} onChange={(v) => updateFamily("spouseSurname", v)} />
                        </div>
                        <div>
                            <Label>First Name</Label>
                            <Input value={f.spouseFirstName} onChange={(v) => updateFamily("spouseFirstName", v)} />
                        </div>
                        <div>
                            <Label>Middle Name</Label>
                            <Input value={f.spouseMiddleName} onChange={(v) => updateFamily("spouseMiddleName", v)} />
                        </div>
                        <div>
                            <Label>Name Extension</Label>
                            <Input value={f.spouseNameExtension} onChange={(v) => updateFamily("spouseNameExtension", v)} />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                        <div>
                            <Label>Occupation</Label>
                            <Input value={f.spouseOccupation} onChange={(v) => updateFamily("spouseOccupation", v)} />
                        </div>
                        <div>
                            <Label>Employer/Business Name</Label>
                            <Input value={f.spouseEmployerBusinessName} onChange={(v) => updateFamily("spouseEmployerBusinessName", v)} />
                        </div>
                        <div>
                            <Label>Business Address</Label>
                            <Input value={f.spouseBusinessAddress} onChange={(v) => updateFamily("spouseBusinessAddress", v)} />
                        </div>
                        <div>
                            <Label>Telephone No.</Label>
                            <Input value={f.spouseTelephoneNo} onChange={(v) => updateFamily("spouseTelephoneNo", v)} />
                        </div>
                    </div>
                </SectionCard>

                <SectionCard title="Father&apos;s Details">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                            <Label>Surname</Label>
                            <Input value={f.fatherSurname} onChange={(v) => updateFamily("fatherSurname", v)} />
                        </div>
                        <div>
                            <Label>First Name</Label>
                            <Input value={f.fatherFirstName} onChange={(v) => updateFamily("fatherFirstName", v)} />
                        </div>
                        <div>
                            <Label>Middle Name</Label>
                            <Input value={f.fatherMiddleName} onChange={(v) => updateFamily("fatherMiddleName", v)} />
                        </div>
                        <div>
                            <Label>Name Extension</Label>
                            <Input value={f.fatherNameExtension} onChange={(v) => updateFamily("fatherNameExtension", v)} />
                        </div>
                    </div>
                </SectionCard>

                <SectionCard title="Mother&apos;s Maiden Name">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                            <Label>Maiden Surname</Label>
                            <Input value={f.motherMaidenSurname} onChange={(v) => updateFamily("motherMaidenSurname", v)} />
                        </div>
                        <div>
                            <Label>First Name</Label>
                            <Input value={f.motherFirstName} onChange={(v) => updateFamily("motherFirstName", v)} />
                        </div>
                        <div>
                            <Label>Middle Name</Label>
                            <Input value={f.motherMiddleName} onChange={(v) => updateFamily("motherMiddleName", v)} />
                        </div>
                    </div>
                </SectionCard>

                <SectionCard title="Children">
                    {f.children.length === 0 && (
                        <p className="text-sm text-stone-400 italic mb-4">No children added yet.</p>
                    )}
                    <div className="space-y-3">
                        {f.children.map((child, i) => (
                            <div key={i} className="p-3 bg-stone-50/80 rounded-xl border border-stone-100">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
                                    <div>
                                        <Label>Surname</Label>
                                        <Input value={child.surname || ""} onChange={(v) => updateChild(i, "surname", v)} />
                                    </div>
                                    <div>
                                        <Label>First Name</Label>
                                        <Input value={child.firstName || ""} onChange={(v) => updateChild(i, "firstName", v)} />
                                    </div>
                                    <div>
                                        <Label>Middle Name</Label>
                                        <Input value={child.middleName || ""} onChange={(v) => updateChild(i, "middleName", v)} />
                                    </div>
                                    <div>
                                        <Label>Date of Birth</Label>
                                        <Input type="date" value={child.dateOfBirth} onChange={(v) => updateChild(i, "dateOfBirth", v)} />
                                    </div>
                                    <div className="flex justify-end">
                                        <button
                                            type="button"
                                            onClick={() => removeChild(i)}
                                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Remove"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button
                        type="button"
                        onClick={addChild}
                        className="mt-4 inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-xl hover:bg-green-100 transition-colors"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        Add Child
                    </button>
                </SectionCard>
            </div>
        );
    }

    function renderEducation() {
        return (
            <div className="space-y-6">
                <SectionCard title="Educational Background" icon={GraduationCap}>
                    {formData.education.length === 0 && (
                        <p className="text-sm text-stone-400 italic mb-4">No education records added yet.</p>
                    )}
                    <div className="space-y-4">
                        {formData.education.map((edu, i) => (
                            <div key={i} className="p-4 bg-stone-50/80 rounded-xl border border-stone-100">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-xs font-semibold text-stone-500">
                                        {edu.level || `Record #${i + 1}`}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => removeEducation(i)}
                                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Remove"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div>
                                        <Label>Level</Label>
                                        <Select
                                            value={edu.level}
                                            onChange={(v) => updateEducation(i, "level", v as PDSEducation["level"])}
                                            options={EDUCATION_LEVELS.map((l) => ({ value: l, label: l }))}
                                        />
                                    </div>
                                    <div className="lg:col-span-3">
                                        <Label>School Name</Label>
                                        <Input value={edu.schoolName} onChange={(v) => updateEducation(i, "schoolName", v)} placeholder="Name of school" />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <Label>Basic Education / Degree / Course</Label>
                                        <Input value={edu.basicEducationDegreeCourse} onChange={(v) => updateEducation(i, "basicEducationDegreeCourse", v)} placeholder="e.g. BS Computer Science" />
                                    </div>
                                    <div>
                                        <Label>Period From</Label>
                                        <Input value={edu.periodFrom} onChange={(v) => updateEducation(i, "periodFrom", v)} placeholder="YYYY" />
                                    </div>
                                    <div>
                                        <Label>Period To</Label>
                                        <Input value={edu.periodTo} onChange={(v) => updateEducation(i, "periodTo", v)} placeholder="YYYY" />
                                    </div>
                                    <div>
                                        <Label>Highest Level / Units Earned</Label>
                                        <Input value={edu.highestLevelUnitsEarned} onChange={(v) => updateEducation(i, "highestLevelUnitsEarned", v)} />
                                    </div>
                                    <div>
                                        <Label>Year Graduated</Label>
                                        <Input value={edu.yearGraduated} onChange={(v) => updateEducation(i, "yearGraduated", v)} placeholder="YYYY" />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <Label>Scholarship / Academic Honors</Label>
                                        <Input value={edu.scholarshipAcademicHonorsReceived} onChange={(v) => updateEducation(i, "scholarshipAcademicHonorsReceived", v)} placeholder="e.g. Cum Laude" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button
                        type="button"
                        onClick={addEducation}
                        className="mt-4 inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-xl hover:bg-green-100 transition-colors"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        Add Education Level
                    </button>
                </SectionCard>
            </div>
        );
    }

    function renderEligibility() {
        return (
            <div className="space-y-6">
                <SectionCard title="Civil Service Eligibility" icon={Award}>
                    {formData.civilServiceEligibility.length === 0 && (
                        <p className="text-sm text-stone-400 italic mb-4">
                            No eligibility records added. Click the button below to add one.
                        </p>
                    )}
                    <div className="space-y-4">
                        {formData.civilServiceEligibility.map((el, i) => (
                            <div key={i} className="p-4 bg-stone-50/80 rounded-xl border border-stone-100">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-xs font-semibold text-stone-500">
                                        Eligibility #{i + 1}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => removeEligibility(i)}
                                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div>
                                        <Label>Career Service / RA 1080 (Board/Bar)</Label>
                                        <Input value={el.careerService} onChange={(v) => updateEligibility(i, "careerService", v)} />
                                    </div>
                                    <div>
                                        <Label>Rating (if applicable)</Label>
                                        <Input value={el.rating} onChange={(v) => updateEligibility(i, "rating", v)} />
                                    </div>
                                    <div>
                                        <Label>Date of Examination / Conferment</Label>
                                        <Input type="date" value={el.dateOfExamination} onChange={(v) => updateEligibility(i, "dateOfExamination", v)} />
                                    </div>
                                    <div>
                                        <Label>Place of Examination / Conferment</Label>
                                        <Input value={el.placeOfExamination} onChange={(v) => updateEligibility(i, "placeOfExamination", v)} />
                                    </div>
                                    <div>
                                        <Label>License Number</Label>
                                        <Input value={el.licenseNumber} onChange={(v) => updateEligibility(i, "licenseNumber", v)} />
                                    </div>
                                    <div>
                                        <Label>Date of Validity</Label>
                                        <Input type="date" value={el.dateOfValidity} onChange={(v) => updateEligibility(i, "dateOfValidity", v)} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button
                        type="button"
                        onClick={addEligibility}
                        className="mt-4 inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-xl hover:bg-green-100 transition-colors"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        Add Eligibility
                    </button>
                </SectionCard>
            </div>
        );
    }

    function renderWorkExperience() {
        return (
            <div className="space-y-6">
                <SectionCard title="Work Experience" icon={Briefcase}>
                    <p className="text-xs text-stone-400 mb-4">
                        Include private employment. Start from your most recent work.
                    </p>
                    {formData.workExperience.length === 0 && (
                        <p className="text-sm text-stone-400 italic mb-4">
                            No work experience records added yet.
                        </p>
                    )}
                    <div className="space-y-4">
                        {formData.workExperience.map((w, i) => (
                            <div key={i} className="p-4 bg-stone-50/80 rounded-xl border border-stone-100">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-xs font-semibold text-stone-500">
                                        Record #{i + 1}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => removeWork(i)}
                                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div>
                                        <Label>Date From</Label>
                                        <Input type="date" value={w.dateFrom} onChange={(v) => updateWork(i, "dateFrom", v)} />
                                    </div>
                                    <div>
                                        <Label>Date To</Label>
                                        <Input type="date" value={w.dateTo} onChange={(v) => updateWork(i, "dateTo", v)} />
                                    </div>
                                    <div>
                                        <Label>Position Title</Label>
                                        <Input value={w.positionTitle} onChange={(v) => updateWork(i, "positionTitle", v)} />
                                    </div>
                                    <div>
                                        <Label>Department / Agency / Office</Label>
                                        <Input value={w.department} onChange={(v) => updateWork(i, "department", v)} />
                                    </div>
                                    <div>
                                        <Label>Monthly Salary</Label>
                                        <Input value={w.monthlySalary} onChange={(v) => updateWork(i, "monthlySalary", v)} />
                                    </div>
                                    <div>
                                        <Label>Salary Grade & Step</Label>
                                        <Input value={w.salaryGrade} onChange={(v) => updateWork(i, "salaryGrade", v)} placeholder="e.g. SG-15/1" />
                                    </div>
                                    <div>
                                        <Label>Status of Appointment</Label>
                                        <Select
                                            value={w.statusOfAppointment}
                                            onChange={(v) => updateWork(i, "statusOfAppointment", v)}
                                            placeholder="Select"
                                            options={[
                                                { value: "Permanent", label: "Permanent" },
                                                { value: "Temporary", label: "Temporary" },
                                                { value: "Casual", label: "Casual" },
                                                { value: "Contractual", label: "Contractual" },
                                                { value: "Coterminous", label: "Coterminous" },
                                            ]}
                                        />
                                    </div>
                                    <div className="flex items-end pb-1">
                                        <label className="flex items-center gap-2 cursor-pointer text-sm text-stone-600">
                                            <input
                                                type="checkbox"
                                                checked={w.isGovernmentService}
                                                onChange={(e) => updateWork(i, "isGovernmentService", e.target.checked)}
                                                className="w-4 h-4 rounded border-stone-300 text-green-600 focus:ring-green-500"
                                            />
                                            Government Service
                                        </label>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button
                        type="button"
                        onClick={addWork}
                        className="mt-4 inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-xl hover:bg-green-100 transition-colors"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        Add Work Experience
                    </button>
                </SectionCard>
            </div>
        );
    }

    function renderLearningDevelopment() {
        return (
            <div className="space-y-6">
                <SectionCard title="Learning & Development (L&D) Interventions / Training Programs" icon={BookOpen}>
                    {formData.learningDevelopment.length === 0 && (
                        <p className="text-sm text-stone-400 italic mb-4">
                            No training / seminar records added yet.
                        </p>
                    )}
                    <div className="space-y-4">
                        {formData.learningDevelopment.map((ld, i) => (
                            <div key={i} className="p-4 bg-stone-50/80 rounded-xl border border-stone-100">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-xs font-semibold text-stone-500">
                                        Training #{i + 1}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => removeLD(i)}
                                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div className="sm:col-span-2 lg:col-span-3">
                                        <Label>Title of Learning & Development Interventions / Training</Label>
                                        <Input value={ld.title} onChange={(v) => updateLD(i, "title", v)} />
                                    </div>
                                    <div>
                                        <Label>Date From</Label>
                                        <Input type="date" value={ld.dateFrom} onChange={(v) => updateLD(i, "dateFrom", v)} />
                                    </div>
                                    <div>
                                        <Label>Date To</Label>
                                        <Input type="date" value={ld.dateTo} onChange={(v) => updateLD(i, "dateTo", v)} />
                                    </div>
                                    <div>
                                        <Label>Number of Hours</Label>
                                        <Input value={ld.numberOfHours} onChange={(v) => updateLD(i, "numberOfHours", v)} />
                                    </div>
                                    <div>
                                        <Label>Type of LD (Managerial / Supervisory / Technical / etc.)</Label>
                                        <Select
                                            value={ld.type}
                                            onChange={(v) => updateLD(i, "type", v)}
                                            placeholder="Select type"
                                            options={[
                                                { value: "Managerial", label: "Managerial" },
                                                { value: "Supervisory", label: "Supervisory" },
                                                { value: "Technical", label: "Technical" },
                                                { value: "Foundation", label: "Foundation" },
                                            ]}
                                        />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <Label>Conducted / Sponsored By</Label>
                                        <Input value={ld.conductedSponsoredBy} onChange={(v) => updateLD(i, "conductedSponsoredBy", v)} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button
                        type="button"
                        onClick={addLD}
                        className="mt-4 inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-xl hover:bg-green-100 transition-colors"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        Add Training / Seminar
                    </button>
                </SectionCard>
            </div>
        );
    }

    function renderOtherInfo() {
        const renderList = (
            field: keyof FullPDS["otherInfo"],
            title: string,
            placeholder: string
        ) => (
            <SectionCard title={title}>
                {formData.otherInfo[field].length === 0 && (
                    <p className="text-sm text-stone-400 italic mb-4">No items added yet.</p>
                )}
                <div className="space-y-2">
                    {formData.otherInfo[field].map((item: string, i: number) => (
                        <div key={i} className="flex items-center gap-2">
                            <Input
                                value={item}
                                onChange={(v) => updateOtherItem(field, i, v)}
                                placeholder={placeholder}
                            />
                            <button
                                type="button"
                                onClick={() => removeOtherItem(field, i)}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
                <button
                    type="button"
                    onClick={() => addOtherItem(field)}
                    className="mt-3 inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-xl hover:bg-green-100 transition-colors"
                >
                    <Plus className="w-3.5 h-3.5" />
                    Add Item
                </button>
            </SectionCard>
        );

        return (
            <div className="space-y-6">
                {renderList("specialSkillsHobbies", "Special Skills & Hobbies", "e.g. Public Speaking")}
                {renderList("nonAcademicDistinctions", "Non-Academic Distinctions / Recognition", "e.g. Outstanding Employee Award")}
                {renderList("membershipInAssociations", "Membership in Association / Organization", "e.g. Philippine Computer Society")}
            </div>
        );
    }

    function renderVoluntaryWork() {
        return (
            <div className="space-y-6">
                <SectionCard title="Voluntary Work or Involvement in Civic / Non-Government / People / Voluntary Organization/s" icon={Heart}>
                    {formData.voluntaryWork.length === 0 && (
                        <p className="text-sm text-stone-400 italic mb-4">
                            No voluntary work records added yet.
                        </p>
                    )}
                    <div className="space-y-4">
                        {formData.voluntaryWork.map((v, i) => (
                            <div key={i} className="p-4 bg-stone-50/80 rounded-xl border border-stone-100">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-xs font-semibold text-stone-500">
                                        Record #{i + 1}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => removeVoluntary(i)}
                                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div className="sm:col-span-2 lg:col-span-3">
                                        <Label>Name & Address of Organization</Label>
                                        <Input value={v.organizationName} onChange={(val) => updateVoluntary(i, "organizationName", val)} placeholder="Organization name" />
                                    </div>
                                    <div className="sm:col-span-2 lg:col-span-3">
                                        <Label>Organization Address</Label>
                                        <Input value={v.organizationAddress} onChange={(val) => updateVoluntary(i, "organizationAddress", val)} placeholder="Full address" />
                                    </div>
                                    <div>
                                        <Label>Date From</Label>
                                        <Input type="date" value={v.dateFrom} onChange={(val) => updateVoluntary(i, "dateFrom", val)} />
                                    </div>
                                    <div>
                                        <Label>Date To</Label>
                                        <Input type="date" value={v.dateTo} onChange={(val) => updateVoluntary(i, "dateTo", val)} />
                                    </div>
                                    <div>
                                        <Label>Number of Hours</Label>
                                        <Input value={v.numberOfHours} onChange={(val) => updateVoluntary(i, "numberOfHours", val)} placeholder="e.g. 40" />
                                    </div>
                                    <div className="sm:col-span-2 lg:col-span-3">
                                        <Label>Position / Nature of Work</Label>
                                        <Input value={v.positionNatureOfWork} onChange={(val) => updateVoluntary(i, "positionNatureOfWork", val)} placeholder="e.g. Volunteer Teacher" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button
                        type="button"
                        onClick={addVoluntary}
                        className="mt-4 inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-xl hover:bg-green-100 transition-colors"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        Add Voluntary Work
                    </button>
                </SectionCard>
            </div>
        );
    }

    function renderReferencesAndId() {
        const refs = formData.references;
        const govId = formData.governmentIssuedId;

        return (
            <div className="space-y-6">
                <SectionCard title="References (Person not related by consanguinity or affinity)" icon={FileCheck}>
                    <p className="text-xs text-stone-400 mb-4">Please provide three (3) references.</p>
                    <div className="space-y-4">
                        {refs.map((ref, i) => (
                            <div key={i} className="p-4 bg-stone-50/80 rounded-xl border border-stone-100">
                                <span className="text-xs font-semibold text-stone-500 mb-3 block">
                                    Reference #{i + 1}
                                </span>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div>
                                        <Label required>Name</Label>
                                        <Input value={ref.name} onChange={(v) => updateReference(i, "name", v)} placeholder="Full Name" />
                                    </div>
                                    <div>
                                        <Label required>Address</Label>
                                        <Input value={ref.address} onChange={(v) => updateReference(i, "address", v)} placeholder="Complete address" />
                                    </div>
                                    <div>
                                        <Label required>Tel. No.</Label>
                                        <Input value={ref.telephoneNo} onChange={(v) => updateReference(i, "telephoneNo", v)} placeholder="Contact number" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </SectionCard>

                <SectionCard title="Government Issued ID" icon={CreditCard}>
                    <p className="text-xs text-stone-400 mb-4">
                        e.g. Passport, GSIS, SSS, PRC, Driver&apos;s License, etc.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <Label required>Government Issued ID</Label>
                            <Select
                                value={govId.idType}
                                onChange={(v) => updateGovId("idType", v)}
                                placeholder="Select ID type"
                                options={[
                                    { value: "Passport", label: "Passport" },
                                    { value: "GSIS", label: "GSIS" },
                                    { value: "SSS", label: "SSS" },
                                    { value: "PRC", label: "PRC License" },
                                    { value: "Driver's License", label: "Driver's License" },
                                    { value: "PhilHealth", label: "PhilHealth" },
                                    { value: "TIN", label: "TIN" },
                                    { value: "Postal ID", label: "Postal ID" },
                                    { value: "Voter's ID", label: "Voter's ID" },
                                    { value: "Other", label: "Other" },
                                ]}
                            />
                        </div>
                        <div>
                            <Label required>ID / License / Passport No.</Label>
                            <Input value={govId.idNumber} onChange={(v) => updateGovId("idNumber", v)} placeholder="ID number" />
                        </div>
                        <div>
                            <Label>Date of Issuance</Label>
                            <Input type="date" value={govId.dateOfIssuance} onChange={(v) => updateGovId("dateOfIssuance", v)} />
                        </div>
                        <div>
                            <Label>Place of Issuance</Label>
                            <Input value={govId.placeOfIssuance} onChange={(v) => updateGovId("placeOfIssuance", v)} placeholder="e.g. Manila" />
                        </div>
                    </div>
                </SectionCard>

                <SectionCard title="Date Accomplished">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <Label>Date Accomplished</Label>
                            <Input
                                type="date"
                                value={formData.dateAccomplished || ""}
                                onChange={(v) => setFormData((prev) => ({ ...prev, dateAccomplished: v }))}
                            />
                        </div>
                    </div>
                </SectionCard>
            </div>
        );
    }

    function renderReview() {
        const p = formData.personalInfo;
        const f = formData.familyBackground;

        const formatAddress = (a: PDSAddress) =>
            [a.houseBlockLot, a.street, a.subdivision, a.barangay, a.cityMunicipality, a.province, a.zipCode]
                .filter(Boolean)
                .join(", ") || "—";

        return (
            <div className="space-y-6">
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <p className="text-sm text-green-800 font-medium">
                        Please review all information below before submitting. You can click on
                        any step above to go back and make corrections.
                    </p>
                </div>

                {/* Personal */}
                <SectionCard title="I. Personal Information" icon={User}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3 text-sm">
                        <ReviewField label="Full Name" value={`${p.surname}, ${p.firstName} ${p.middleName} ${p.nameExtension}`.trim()} />
                        <ReviewField label="Date of Birth" value={p.dateOfBirth} />
                        <ReviewField label="Place of Birth" value={p.placeOfBirth} />
                        <ReviewField label="Sex" value={p.sex} />
                        <ReviewField label="Civil Status" value={p.civilStatus} />
                        <ReviewField label="Citizenship" value={p.citizenship} />
                        <ReviewField label="Height" value={p.height ? `${p.height} m` : "—"} />
                        <ReviewField label="Weight" value={p.weight ? `${p.weight} kg` : "—"} />
                        <ReviewField label="Blood Type" value={p.bloodType || "—"} />
                        <ReviewField label="GSIS" value={p.gsisIdNo || "—"} />
                        <ReviewField label="PAG-IBIG" value={p.pagIbigIdNo || "—"} />
                        <ReviewField label="PhilHealth" value={p.philhealthNo || "—"} />
                        <ReviewField label="SSS" value={p.sssNo || "—"} />
                        <ReviewField label="TIN" value={p.tinNo || "—"} />
                        <ReviewField label="Agency Employee No." value={p.agencyEmployeeNo || "—"} />
                        <ReviewField label="Office / Department" value={formData.office || "—"} />
                        <ReviewField label="Employment Status" value={formData.employmentStatus} />
                        <ReviewField label="Residential Address" value={formatAddress(p.residentialAddress)} />
                        <ReviewField label="Permanent Address" value={formatAddress(p.permanentAddress)} />
                        <ReviewField label="Mobile" value={p.mobileNo || "—"} />
                        <ReviewField label="Email" value={p.email || "—"} />
                    </div>
                </SectionCard>

                {/* Family */}
                <SectionCard title="II. Family Background" icon={Users}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3 text-sm">
                        <ReviewField label="Spouse" value={
                            f.spouseSurname
                                ? `${f.spouseSurname}, ${f.spouseFirstName} ${f.spouseMiddleName}`.trim()
                                : "N/A"
                        } />
                        <ReviewField label="Father" value={
                            f.fatherSurname
                                ? `${f.fatherSurname}, ${f.fatherFirstName} ${f.fatherMiddleName}`.trim()
                                : "—"
                        } />
                        <ReviewField label="Mother" value={
                            f.motherMaidenSurname
                                ? `${f.motherMaidenSurname}, ${f.motherFirstName} ${f.motherMiddleName}`.trim()
                                : "—"
                        } />
                        <ReviewField label="No. of Children" value={String(f.children.length)} />
                    </div>
                </SectionCard>

                {/* Education */}
                <SectionCard title="III. Educational Background" icon={GraduationCap}>
                    {formData.education.length === 0 ? (
                        <p className="text-sm text-stone-400 italic">No records</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs">
                                <thead>
                                    <tr className="border-b border-stone-200 text-stone-500">
                                        <th className="text-left py-2 px-2 font-medium">Level</th>
                                        <th className="text-left py-2 px-2 font-medium">School</th>
                                        <th className="text-left py-2 px-2 font-medium">Degree/Course</th>
                                        <th className="text-left py-2 px-2 font-medium">Period</th>
                                        <th className="text-left py-2 px-2 font-medium">Year Graduated</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {formData.education.filter((e) => e.schoolName).map((e, i) => (
                                        <tr key={i} className="border-b border-stone-100 text-stone-700">
                                            <td className="py-2 px-2">{e.level}</td>
                                            <td className="py-2 px-2">{e.schoolName}</td>
                                            <td className="py-2 px-2">{e.basicEducationDegreeCourse || "—"}</td>
                                            <td className="py-2 px-2">{e.periodFrom} – {e.periodTo}</td>
                                            <td className="py-2 px-2">{e.yearGraduated || "—"}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </SectionCard>

                {/* Eligibility */}
                <SectionCard title="IV. Civil Service Eligibility" icon={Award}>
                    {formData.civilServiceEligibility.length === 0 ? (
                        <p className="text-sm text-stone-400 italic">No records</p>
                    ) : (
                        <div className="space-y-2 text-sm">
                            {formData.civilServiceEligibility.map((e, i) => (
                                <div key={i} className="p-3 bg-stone-50/80 rounded-xl text-stone-700">
                                    <span className="font-medium">{e.careerService || "—"}</span>
                                    {e.rating && <span className="ml-2 text-stone-500">Rating: {e.rating}</span>}
                                    {e.dateOfExamination && <span className="ml-2 text-stone-500">Date: {e.dateOfExamination}</span>}
                                </div>
                            ))}
                        </div>
                    )}
                </SectionCard>

                {/* Work */}
                <SectionCard title="V. Work Experience" icon={Briefcase}>
                    {formData.workExperience.length === 0 ? (
                        <p className="text-sm text-stone-400 italic">No records</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs">
                                <thead>
                                    <tr className="border-b border-stone-200 text-stone-500">
                                        <th className="text-left py-2 px-2 font-medium">Period</th>
                                        <th className="text-left py-2 px-2 font-medium">Position</th>
                                        <th className="text-left py-2 px-2 font-medium">Department</th>
                                        <th className="text-left py-2 px-2 font-medium">Salary</th>
                                        <th className="text-left py-2 px-2 font-medium">Status</th>
                                        <th className="text-left py-2 px-2 font-medium">Gov&apos;t</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {formData.workExperience.map((w, i) => (
                                        <tr key={i} className="border-b border-stone-100 text-stone-700">
                                            <td className="py-2 px-2">{w.dateFrom} – {w.dateTo}</td>
                                            <td className="py-2 px-2">{w.positionTitle}</td>
                                            <td className="py-2 px-2">{w.department}</td>
                                            <td className="py-2 px-2">{w.monthlySalary}</td>
                                            <td className="py-2 px-2">{w.statusOfAppointment}</td>
                                            <td className="py-2 px-2">{w.isGovernmentService ? "Yes" : "No"}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </SectionCard>

                {/* Voluntary Work */}
                <SectionCard title="VI. Voluntary Work" icon={Heart}>
                    {formData.voluntaryWork.length === 0 ? (
                        <p className="text-sm text-stone-400 italic">No records</p>
                    ) : (
                        <div className="space-y-2 text-sm">
                            {formData.voluntaryWork.map((v, i) => (
                                <div key={i} className="p-3 bg-stone-50/80 rounded-xl text-stone-700">
                                    <span className="font-medium">{v.organizationName}</span>
                                    <span className="ml-2 text-stone-500">
                                        ({v.dateFrom} – {v.dateTo}, {v.numberOfHours} hrs) — {v.positionNatureOfWork}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </SectionCard>

                {/* L&D */}
                <SectionCard title="VII. Learning & Development" icon={BookOpen}>
                    {formData.learningDevelopment.length === 0 ? (
                        <p className="text-sm text-stone-400 italic">No records</p>
                    ) : (
                        <div className="space-y-2 text-sm">
                            {formData.learningDevelopment.map((ld, i) => (
                                <div key={i} className="p-3 bg-stone-50/80 rounded-xl text-stone-700">
                                    <span className="font-medium">{ld.title}</span>
                                    <span className="ml-2 text-stone-500">
                                        ({ld.dateFrom} – {ld.dateTo}, {ld.numberOfHours} hrs)
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </SectionCard>

                {/* Other Info */}
                <SectionCard title="VIII. Other Information" icon={Info}>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
                        <div>
                            <h4 className="text-xs font-semibold text-stone-500 mb-2">Skills & Hobbies</h4>
                            {formData.otherInfo.specialSkillsHobbies.length === 0 ? (
                                <p className="text-stone-400 italic text-xs">None</p>
                            ) : (
                                <ul className="space-y-1">
                                    {formData.otherInfo.specialSkillsHobbies.map((s, i) => (
                                        <li key={i} className="text-stone-700 text-xs">&bull; {s}</li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        <div>
                            <h4 className="text-xs font-semibold text-stone-500 mb-2">Distinctions / Recognition</h4>
                            {formData.otherInfo.nonAcademicDistinctions.length === 0 ? (
                                <p className="text-stone-400 italic text-xs">None</p>
                            ) : (
                                <ul className="space-y-1">
                                    {formData.otherInfo.nonAcademicDistinctions.map((s, i) => (
                                        <li key={i} className="text-stone-700 text-xs">&bull; {s}</li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        <div>
                            <h4 className="text-xs font-semibold text-stone-500 mb-2">Memberships</h4>
                            {formData.otherInfo.membershipInAssociations.length === 0 ? (
                                <p className="text-stone-400 italic text-xs">None</p>
                            ) : (
                                <ul className="space-y-1">
                                    {formData.otherInfo.membershipInAssociations.map((s, i) => (
                                        <li key={i} className="text-stone-700 text-xs">&bull; {s}</li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </SectionCard>

                {/* References */}
                <SectionCard title="References" icon={FileCheck}>
                    {formData.references.every((r) => !r.name) ? (
                        <p className="text-sm text-stone-400 italic">No references provided</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs">
                                <thead>
                                    <tr className="border-b border-stone-200 text-stone-500">
                                        <th className="text-left py-2 px-2 font-medium">#</th>
                                        <th className="text-left py-2 px-2 font-medium">Name</th>
                                        <th className="text-left py-2 px-2 font-medium">Address</th>
                                        <th className="text-left py-2 px-2 font-medium">Tel. No.</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {formData.references.filter((r) => r.name).map((r, i) => (
                                        <tr key={i} className="border-b border-stone-100 text-stone-700">
                                            <td className="py-2 px-2">{i + 1}</td>
                                            <td className="py-2 px-2">{r.name}</td>
                                            <td className="py-2 px-2">{r.address}</td>
                                            <td className="py-2 px-2">{r.telephoneNo}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </SectionCard>

                {/* Government ID */}
                <SectionCard title="Government Issued ID" icon={CreditCard}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-3 text-sm">
                        <ReviewField label="ID Type" value={formData.governmentIssuedId.idType || "—"} />
                        <ReviewField label="ID Number" value={formData.governmentIssuedId.idNumber || "—"} />
                        <ReviewField label="Date of Issuance" value={formData.governmentIssuedId.dateOfIssuance || "—"} />
                        <ReviewField label="Place of Issuance" value={formData.governmentIssuedId.placeOfIssuance || "—"} />
                    </div>
                </SectionCard>

                {/* Date Accomplished */}
                <SectionCard title="Declaration">
                    <div className="text-sm text-stone-600 space-y-3">
                        <p>
                            I declare under oath that I have personally accomplished this Personal Data Sheet which is a true,
                            correct and complete statement pursuant to the provisions of pertinent laws, rules and regulations
                            of the Republic of the Philippines.
                        </p>
                        <ReviewField label="Date Accomplished" value={formData.dateAccomplished || "—"} />
                    </div>
                </SectionCard>
            </div>
        );
    }

    /* ── step renderer map ─────────────────────────────── */

    const stepContent: Record<string, () => React.ReactNode> = {
        personal: renderPersonalInfo,
        family: renderFamilyBackground,
        education: renderEducation,
        eligibility: renderEligibility,
        work: renderWorkExperience,
        voluntary: renderVoluntaryWork,
        learning: renderLearningDevelopment,
        other: renderOtherInfo,
        references: renderReferencesAndId,
        review: renderReview,
    };

    /* ══════════════════════════════════════════════════════
       RENDER
       ══════════════════════════════════════════════════════ */

    const progressPercent = Math.round(((currentStep + 1) / STEPS.length) * 100);
    const StepIcon = STEPS[currentStep].icon;

    return (
        <RoleLayout userRole="HR Head">
            <div className="max-w-5xl mx-auto space-y-6 pb-24">
                {/* ── Page Header ──────────────────────── */}
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                        <UserPlus className="w-5 h-5 text-green-700" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-stone-900">PDS Data Entry</h1>
                        <p className="text-sm text-stone-400">CSC Form No. 212 &mdash; Personal Data Sheet</p>
                    </div>
                </div>

                {/* ── Progress + Step Navigation ──────── */}
                <div className="bg-white rounded-2xl border border-stone-200/80 shadow-sm overflow-hidden">
                    {/* Progress bar */}
                    <div className="h-1.5 bg-stone-100">
                        <div
                            className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-r-full transition-all duration-500 ease-out"
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>

                    <div className="p-4 sm:p-5">
                        {/* Current step info */}
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                                    <StepIcon className="w-5 h-5 text-green-700" />
                                </div>
                                <div>
                                    <h2 className="text-base font-semibold text-stone-900">
                                        {STEPS[currentStep].label}
                                    </h2>
                                    <p className="text-xs text-stone-400 mt-0.5">
                                        {STEPS[currentStep].desc}
                                    </p>
                                </div>
                            </div>
                            <div className="hidden sm:flex items-center gap-1.5 text-xs text-stone-400">
                                <span className="font-bold text-green-700 text-sm">
                                    {currentStep + 1}
                                </span>
                                <span className="text-stone-300">/</span>
                                <span>{STEPS.length}</span>
                            </div>
                        </div>

                        {/* Step dots */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                            {STEPS.map((step, i) => {
                                const isActive = i === currentStep;
                                const isCompleted = i < currentStep;
                                return (
                                    <button
                                        key={step.key}
                                        type="button"
                                        onClick={() => setCurrentStep(i)}
                                        title={step.label}
                                        className={`group relative flex items-center gap-1.5 rounded-full transition-all duration-200 ${
                                            isActive
                                                ? "bg-green-700 text-white px-3.5 py-1.5 shadow-sm"
                                                : isCompleted
                                                ? "bg-green-100 text-green-700 hover:bg-green-200 w-7 h-7 justify-center"
                                                : "bg-stone-100 text-stone-400 hover:bg-stone-200 hover:text-stone-600 w-7 h-7 justify-center"
                                        }`}
                                    >
                                        {isCompleted && !isActive ? (
                                            <Check className="w-3.5 h-3.5" />
                                        ) : (
                                            <span className="text-xs font-semibold">
                                                {i + 1}
                                            </span>
                                        )}
                                        {isActive && (
                                            <span className="text-xs font-medium hidden sm:inline">
                                                {step.label}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* ── Step Content ─────────────────────── */}
                <div>{stepContent[STEPS[currentStep].key]()}</div>

                {(submitError || submitSuccess) && (
                    <div
                        className={`rounded-2xl border px-4 py-3 text-sm ${
                            submitError
                                ? "border-red-200 bg-red-50 text-red-700"
                                : "border-green-200 bg-green-50 text-green-700"
                        }`}
                    >
                        {submitError || submitSuccess}
                    </div>
                )}
            </div>

            {/* ── Sticky Bottom Navigation ──────────── */}
            <div className="sticky bottom-0 z-30 -mx-8 -mb-8 px-8 pt-3 pb-4 bg-gradient-to-t from-stone-50 from-70% to-transparent">
                <div className="max-w-5xl mx-auto bg-white rounded-2xl border border-stone-200/80 shadow-lg px-5 py-3 flex items-center justify-between">
                    <button
                        type="button"
                        onClick={goBack}
                        disabled={!canGoBack}
                        className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium border border-stone-200 text-stone-600 rounded-xl hover:bg-stone-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        <span className="hidden sm:inline">Previous</span>
                    </button>

                    <span className="text-xs text-stone-400 sm:hidden font-medium">
                        {currentStep + 1} / {STEPS.length}
                    </span>

                    <div className="flex items-center gap-2.5">
                        <button
                            type="button"
                            onClick={handleSaveDraft}
                            disabled={isSubmitting}
                            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium border border-stone-200 text-stone-600 rounded-xl hover:bg-stone-50 transition-all"
                        >
                            <Save className="w-4 h-4" />
                            <span className="hidden sm:inline">Save Draft</span>
                        </button>

                        {currentStep === STEPS.length - 1 ? (
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold bg-green-700 text-white rounded-xl hover:bg-green-800 active:scale-[0.98] shadow-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                <Send className="w-4 h-4" />
                                {isSubmitting ? "Submitting..." : "Submit PDS"}
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={goNext}
                                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold bg-green-700 text-white rounded-xl hover:bg-green-800 active:scale-[0.98] shadow-sm transition-all"
                            >
                                Next
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </RoleLayout>
    );
}

/* ── tiny review helper ─────────────────────────────── */

function ReviewField({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <dt className="text-xs text-stone-400">{label}</dt>
            <dd className="text-stone-800 font-medium">{value || "—"}</dd>
        </div>
    );
}
