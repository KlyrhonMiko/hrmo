"use client";

import React, { useEffect, useState, useMemo } from "react";
import { RoleLayout } from "@/components/layout/RoleLayout";
import type { Employee201, DocumentMOV, CertificateRecord, TrainingRecord } from "@/types";
import {
    Search,
    Filter,
    Users,
    FolderOpen,
    Eye,
    Download,
    ChevronRight,
    ChevronDown,
    X,
    GraduationCap,
    FileText,
    Award,
    User,
    Mail,
    Phone,
    Calendar,
    MapPin,
    Briefcase,
} from "lucide-react";

const OFFICES = ["CCS", "COE", "CBA", "CHAS", "CAS", "Admin"] as const;
const EMPLOYMENT_STATUSES = ["Teaching", "Non-Teaching", "COS"] as const;
const ACTIVE_STATUSES = ["Active", "Inactive"] as const;

const MOCK_DOCUMENTS: DocumentMOV[] = [
    { id: "d1", documentType: "Appointment Paper", serialNumber: "AP-2024-001", fileUrl: "#", fileName: "appointment.pdf", category: "Appointment", status: "Verified", uploadedAt: "2024-01-15" },
    { id: "d2", documentType: "Service Record", serialNumber: "SR-2024-001", fileUrl: "#", fileName: "service_record.pdf", category: "Service Record", status: "Verified", uploadedAt: "2024-02-10" },
    { id: "d3", documentType: "PDS (CS Form 212)", serialNumber: "PDS-2024-001", fileUrl: "#", fileName: "pds_form.pdf", category: "Other", status: "Verified", uploadedAt: "2024-03-01" },
];

const MOCK_CERTIFICATES: CertificateRecord[] = [
    { id: "c1", employeeId: "1", employeeName: "", title: "Civil Service Professional", issuingBody: "CSC", dateIssued: "2020-06-15", certificateNumber: "CSP-2020-1234", category: "Eligibility", fileUrl: "#", fileName: "cs_prof.pdf", status: "Active" },
    { id: "c2", employeeId: "1", employeeName: "", title: "TESDA NC II - Computer Systems", issuingBody: "TESDA", dateIssued: "2019-11-20", certificateNumber: "NC2-2019-5678", category: "Professional", fileUrl: "#", fileName: "tesda_nc2.pdf", status: "Active" },
];

const MOCK_TRAININGS: TrainingRecord[] = [
    { id: "t1", title: "GAD Sensitivity Training", type: "Seminar", conductedBy: "CSC Regional Office", venue: "Convention Center", dateFrom: "2025-03-10", dateTo: "2025-03-12", numberOfHours: 24, status: "Completed" },
    { id: "t2", title: "Records Management Workshop", type: "Workshop", conductedBy: "CHED Region V", venue: "CHED Office", dateFrom: "2025-06-05", dateTo: "2025-06-06", numberOfHours: 16, status: "Completed" },
    { id: "t3", title: "Leadership Development Program", type: "Seminar", conductedBy: "DOST", venue: "Online via Zoom", dateFrom: "2026-04-01", dateTo: "2026-04-03", numberOfHours: 24, status: "Upcoming" },
];

const MOCK_EMPLOYEES: Employee201[] = [
    { id: "1", employeeNo: "EMP-2018-0042", fullName: "Dela Cruz, Juan Miguel A.", surname: "Dela Cruz", firstName: "Juan Miguel", middleName: "Alvarez", office: "CCS", position: "Instructor I", employmentStatus: "Teaching", dateHired: "2018-06-15", email: "jm.delacruz@university.edu.ph", mobileNo: "0917-123-4567", documents: MOCK_DOCUMENTS, certificates: MOCK_CERTIFICATES, trainingsAttended: MOCK_TRAININGS, isActive: true },
    { id: "2", employeeNo: "EMP-2019-0078", fullName: "Santos, Maria Clara B.", surname: "Santos", firstName: "Maria Clara", middleName: "Bautista", office: "COE", position: "Associate Professor III", employmentStatus: "Teaching", dateHired: "2019-01-10", email: "mc.santos@university.edu.ph", mobileNo: "0918-234-5678", documents: MOCK_DOCUMENTS.slice(0, 2), certificates: MOCK_CERTIFICATES, trainingsAttended: MOCK_TRAININGS.slice(0, 2), isActive: true },
    { id: "3", employeeNo: "EMP-2020-0103", fullName: "Reyes, Jose Antonio C.", surname: "Reyes", firstName: "Jose Antonio", middleName: "Cruz", office: "CBA", position: "Instructor II", employmentStatus: "Teaching", dateHired: "2020-08-01", email: "ja.reyes@university.edu.ph", mobileNo: "0919-345-6789", documents: MOCK_DOCUMENTS, certificates: MOCK_CERTIFICATES.slice(0, 1), trainingsAttended: MOCK_TRAININGS, isActive: true },
    { id: "4", employeeNo: "EMP-2017-0025", fullName: "Garcia, Ana Patricia D.", surname: "Garcia", firstName: "Ana Patricia", middleName: "Dimaculangan", office: "Admin", position: "Administrative Officer IV", employmentStatus: "Non-Teaching", dateHired: "2017-03-20", email: "ap.garcia@university.edu.ph", mobileNo: "0920-456-7890", documents: MOCK_DOCUMENTS, certificates: MOCK_CERTIFICATES, trainingsAttended: MOCK_TRAININGS.slice(0, 1), isActive: true },
    { id: "5", employeeNo: "EMP-2021-0156", fullName: "Bautista, Ricardo E.", surname: "Bautista", firstName: "Ricardo", middleName: "Espinosa", office: "CHAS", position: "Instructor I", employmentStatus: "Teaching", dateHired: "2021-06-01", email: "r.bautista@university.edu.ph", mobileNo: "0921-567-8901", documents: MOCK_DOCUMENTS.slice(0, 1), certificates: [], trainingsAttended: MOCK_TRAININGS.slice(0, 2), isActive: true },
    { id: "6", employeeNo: "EMP-2016-0012", fullName: "Villanueva, Carmela F.", surname: "Villanueva", firstName: "Carmela", middleName: "Flores", office: "CAS", position: "Professor V", employmentStatus: "Teaching", dateHired: "2016-01-05", email: "c.villanueva@university.edu.ph", mobileNo: "0922-678-9012", documents: MOCK_DOCUMENTS, certificates: MOCK_CERTIFICATES, trainingsAttended: MOCK_TRAININGS, isActive: true },
    { id: "7", employeeNo: "EMP-2022-0189", fullName: "Ramos, Mark Angelo G.", surname: "Ramos", firstName: "Mark Angelo", middleName: "Gonzales", office: "CCS", position: "Project Technical Staff", employmentStatus: "COS", dateHired: "2022-09-15", email: "ma.ramos@university.edu.ph", mobileNo: "0923-789-0123", documents: MOCK_DOCUMENTS.slice(0, 2), certificates: [], trainingsAttended: MOCK_TRAININGS.slice(0, 1), isActive: true },
    { id: "8", employeeNo: "EMP-2015-0008", fullName: "Mendoza, Lourdes H.", surname: "Mendoza", firstName: "Lourdes", middleName: "Hernandez", office: "Admin", position: "Administrative Aide VI", employmentStatus: "Non-Teaching", dateHired: "2015-07-10", email: "l.mendoza@university.edu.ph", mobileNo: "0924-890-1234", documents: MOCK_DOCUMENTS, certificates: MOCK_CERTIFICATES.slice(0, 1), trainingsAttended: MOCK_TRAININGS, isActive: false },
    { id: "9", employeeNo: "EMP-2023-0201", fullName: "Aquino, Paolo I.", surname: "Aquino", firstName: "Paolo", middleName: "Ignacio", office: "COE", position: "Lab Technician II", employmentStatus: "Non-Teaching", dateHired: "2023-02-01", email: "p.aquino@university.edu.ph", mobileNo: "0925-901-2345", documents: MOCK_DOCUMENTS.slice(0, 1), certificates: MOCK_CERTIFICATES, trainingsAttended: [], isActive: true },
    { id: "10", employeeNo: "EMP-2024-0220", fullName: "Fernandez, Sofia J.", surname: "Fernandez", firstName: "Sofia", middleName: "Jimenez", office: "CBA", position: "Research Assistant", employmentStatus: "COS", dateHired: "2024-01-15", email: "s.fernandez@university.edu.ph", mobileNo: "0926-012-3456", documents: MOCK_DOCUMENTS.slice(0, 2), certificates: [], trainingsAttended: MOCK_TRAININGS.slice(0, 1), isActive: true },
];

type DetailTab = "personal" | "documents" | "certificates" | "training";

function StatusBadge({ isActive }: { isActive: boolean }) {
    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
            isActive
                ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20"
                : "bg-stone-100 text-stone-500 ring-1 ring-stone-300/40"
        }`}>
            {isActive ? "Active" : "Inactive"}
        </span>
    );
}

function EmploymentBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        Teaching: "bg-blue-50 text-blue-700 ring-1 ring-blue-600/20",
        "Non-Teaching": "bg-amber-50 text-amber-700 ring-1 ring-amber-600/20",
        COS: "bg-violet-50 text-violet-700 ring-1 ring-violet-600/20",
    };
    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${styles[status] ?? "bg-stone-100 text-stone-600"}`}>
            {status}
        </span>
    );
}

function StatCard({ label, value, icon: Icon, color }: { label: string; value: number; icon: React.ElementType; color: string }) {
    const colorMap: Record<string, { bg: string; iconBg: string; text: string }> = {
        green: { bg: "bg-emerald-50", iconBg: "bg-emerald-100", text: "text-emerald-700" },
        blue: { bg: "bg-blue-50", iconBg: "bg-blue-100", text: "text-blue-700" },
        amber: { bg: "bg-amber-50", iconBg: "bg-amber-100", text: "text-amber-700" },
        violet: { bg: "bg-violet-50", iconBg: "bg-violet-100", text: "text-violet-700" },
    };
    const c = colorMap[color] ?? colorMap.green;

    return (
        <div className="bg-white rounded-xl border border-stone-200/80 shadow-sm p-5">
            <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg ${c.iconBg} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${c.text}`} />
                </div>
                <div>
                    <p className="text-[12px] text-stone-500 font-medium">{label}</p>
                    <p className={`text-2xl font-bold ${c.text}`}>{value}</p>
                </div>
            </div>
        </div>
    );
}

function PersonalInfoTab({ employee }: { employee: Employee201 }) {
    const fields = [
        { icon: User, label: "Full Name", value: `${employee.firstName} ${employee.middleName ? employee.middleName.charAt(0) + ". " : ""}${employee.surname}` },
        { icon: Briefcase, label: "Employee No.", value: employee.employeeNo },
        { icon: MapPin, label: "Office", value: employee.office },
        { icon: Briefcase, label: "Position", value: employee.position },
        { icon: Calendar, label: "Date Hired", value: new Date(employee.dateHired).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) },
        { icon: Mail, label: "Email", value: employee.email },
        { icon: Phone, label: "Mobile", value: employee.mobileNo },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fields.map((f) => (
                <div key={f.label} className="flex items-start gap-3 p-3 rounded-lg bg-stone-50/60">
                    <f.icon className="w-4 h-4 text-stone-400 mt-0.5 shrink-0" />
                    <div>
                        <p className="text-[11px] text-stone-400 font-medium uppercase tracking-wide">{f.label}</p>
                        <p className="text-[13px] text-stone-800 font-medium mt-0.5">{f.value}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}

function DocumentsTab({ documents }: { documents: DocumentMOV[] }) {
    if (documents.length === 0) return <p className="text-[13px] text-stone-400 py-6 text-center">No documents on file.</p>;
    return (
        <div className="space-y-2">
            {documents.map((doc, i) => (
                <div key={doc.id ?? i} className="flex items-center justify-between p-3 rounded-lg bg-stone-50/60 hover:bg-stone-100/60 transition">
                    <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-stone-400" />
                        <div>
                            <p className="text-[13px] text-stone-800 font-medium">{doc.documentType}</p>
                            <p className="text-[11px] text-stone-400">SN: {doc.serialNumber} &middot; {doc.category}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                            doc.status === "Verified" ? "bg-emerald-50 text-emerald-700" : doc.status === "Rejected" ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600"
                        }`}>
                            {doc.status}
                        </span>
                        <button className="p-1.5 rounded-md hover:bg-stone-200/60 transition text-stone-400 hover:text-stone-600">
                            <Download className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}

function CertificatesTab({ certificates }: { certificates: CertificateRecord[] }) {
    if (certificates.length === 0) return <p className="text-[13px] text-stone-400 py-6 text-center">No certificates on file.</p>;
    return (
        <div className="space-y-2">
            {certificates.map((cert) => (
                <div key={cert.id} className="flex items-center justify-between p-3 rounded-lg bg-stone-50/60 hover:bg-stone-100/60 transition">
                    <div className="flex items-center gap-3">
                        <Award className="w-4 h-4 text-stone-400" />
                        <div>
                            <p className="text-[13px] text-stone-800 font-medium">{cert.title}</p>
                            <p className="text-[11px] text-stone-400">{cert.issuingBody} &middot; {cert.category} &middot; #{cert.certificateNumber}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                            cert.status === "Active" ? "bg-emerald-50 text-emerald-700" : cert.status === "Expired" ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600"
                        }`}>
                            {cert.status}
                        </span>
                        <button className="p-1.5 rounded-md hover:bg-stone-200/60 transition text-stone-400 hover:text-stone-600">
                            <Download className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}

function TrainingTab({ trainings }: { trainings: TrainingRecord[] }) {
    if (trainings.length === 0) return <p className="text-[13px] text-stone-400 py-6 text-center">No training records found.</p>;
    return (
        <div className="space-y-2">
            {trainings.map((t) => (
                <div key={t.id} className="flex items-center justify-between p-3 rounded-lg bg-stone-50/60 hover:bg-stone-100/60 transition">
                    <div className="flex items-center gap-3">
                        <GraduationCap className="w-4 h-4 text-stone-400" />
                        <div>
                            <p className="text-[13px] text-stone-800 font-medium">{t.title}</p>
                            <p className="text-[11px] text-stone-400">
                                {t.conductedBy} &middot; {t.numberOfHours}hrs &middot;{" "}
                                {new Date(t.dateFrom).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                {t.dateFrom !== t.dateTo && ` – ${new Date(t.dateTo).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`}
                            </p>
                        </div>
                    </div>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        t.status === "Completed" ? "bg-emerald-50 text-emerald-700" : t.status === "Ongoing" ? "bg-blue-50 text-blue-700" : t.status === "Upcoming" ? "bg-amber-50 text-amber-600" : "bg-red-50 text-red-600"
                    }`}>
                        {t.status}
                    </span>
                </div>
            ))}
        </div>
    );
}

export default function EmployeeDirectoryPage() {
    const [search, setSearch] = useState("");
    const [officeFilter, setOfficeFilter] = useState("");
    const [empStatusFilter, setEmpStatusFilter] = useState("");
    const [activeFilter, setActiveFilter] = useState("");
    const [employees, setEmployees] = useState<Employee201[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<DetailTab>("personal");
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        let mounted = true;

        async function loadDirectory() {
            setLoading(true);
            setLoadError(null);

            try {
                const response = await fetch("/api/employees/directory", { cache: "no-store" });
                const payload = (await response.json()) as {
                    success?: boolean;
                    message?: string;
                    data?: Employee201[];
                };

                if (!response.ok || !payload.success) {
                    throw new Error(payload.message || "Failed to load employee directory.");
                }

                if (mounted) {
                    setEmployees(payload.data || []);
                }
            } catch (error) {
                if (mounted) {
                    setLoadError(error instanceof Error ? error.message : "Failed to load employee directory.");
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        }

        void loadDirectory();

        return () => {
            mounted = false;
        };
    }, []);

    const filtered = useMemo(() => {
        return employees.filter((e) => {
            const q = search.toLowerCase();
            const matchesSearch = !q || e.fullName.toLowerCase().includes(q) || e.employeeNo.toLowerCase().includes(q);
            const matchesOffice = !officeFilter || e.office === officeFilter;
            const matchesEmpStatus = !empStatusFilter || e.employmentStatus === empStatusFilter;
            const matchesActive = !activeFilter || (activeFilter === "Active" ? e.isActive : !e.isActive);
            return matchesSearch && matchesOffice && matchesEmpStatus && matchesActive;
        });
    }, [employees, search, officeFilter, empStatusFilter, activeFilter]);

    const stats = useMemo(() => ({
        total: employees.length,
        teaching: employees.filter((e) => e.employmentStatus === "Teaching").length,
        nonTeaching: employees.filter((e) => e.employmentStatus === "Non-Teaching").length,
        cos: employees.filter((e) => e.employmentStatus === "COS").length,
    }), [employees]);

    const handleExpand = (id: string) => {
        if (expandedId === id) {
            setExpandedId(null);
        } else {
            setExpandedId(id);
            setActiveTab("personal");
        }
    };

    const hasActiveFilters = officeFilter || empStatusFilter || activeFilter;

    const clearFilters = () => {
        setOfficeFilter("");
        setEmpStatusFilter("");
        setActiveFilter("");
    };

    const tabs: { key: DetailTab; label: string; icon: React.ElementType }[] = [
        { key: "personal", label: "Personal Info", icon: User },
        { key: "documents", label: "Documents / MOV", icon: FileText },
        { key: "certificates", label: "Certificates", icon: Award },
        { key: "training", label: "Training History", icon: GraduationCap },
    ];

    return (
        <RoleLayout userRole="HR Head">
            <div className="space-y-6 pb-8">
                {/* Page Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                            <FolderOpen className="w-5 h-5 text-green-700" />
                        </div>
                        <div>
                            <h1 className="text-[18px] font-bold text-stone-900">Employee 201 Files</h1>
                            <p className="text-[13px] text-stone-400">Directory and personnel records management</p>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard label="Total Employees" value={stats.total} icon={Users} color="green" />
                    <StatCard label="Teaching" value={stats.teaching} icon={GraduationCap} color="blue" />
                    <StatCard label="Non-Teaching" value={stats.nonTeaching} icon={Briefcase} color="amber" />
                    <StatCard label="COS / Job Order" value={stats.cos} icon={FileText} color="violet" />
                </div>

                {/* Search & Filters */}
                <div className="bg-white rounded-xl border border-stone-200/80 shadow-sm">
                    <div className="p-4 flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                            <input
                                type="text"
                                placeholder="Search by name or employee number..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-9 pr-4 py-2.5 text-[13px] text-stone-800 placeholder:text-stone-400 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600 transition"
                            />
                        </div>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`inline-flex items-center gap-2 px-4 py-2.5 text-[13px] font-medium rounded-lg border transition ${
                                showFilters || hasActiveFilters
                                    ? "bg-green-50 text-green-700 border-green-200"
                                    : "bg-white text-stone-600 border-stone-200 hover:bg-stone-50"
                            }`}
                        >
                            <Filter className="w-4 h-4" />
                            Filters
                            {hasActiveFilters && (
                                <span className="w-5 h-5 rounded-full bg-green-700 text-white text-[10px] flex items-center justify-center font-bold">
                                    {[officeFilter, empStatusFilter, activeFilter].filter(Boolean).length}
                                </span>
                            )}
                        </button>
                    </div>

                    {showFilters && (
                        <div className="px-4 pb-4 pt-0 flex flex-wrap items-center gap-3 border-t border-stone-100 pt-3">
                            <select
                                value={officeFilter}
                                onChange={(e) => setOfficeFilter(e.target.value)}
                                className="px-3 py-2 text-[12px] text-stone-700 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600 transition"
                            >
                                <option value="">All Offices</option>
                                {OFFICES.map((o) => <option key={o} value={o}>{o}</option>)}
                            </select>
                            <select
                                value={empStatusFilter}
                                onChange={(e) => setEmpStatusFilter(e.target.value)}
                                className="px-3 py-2 text-[12px] text-stone-700 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600 transition"
                            >
                                <option value="">All Employment Types</option>
                                {EMPLOYMENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                            </select>
                            <select
                                value={activeFilter}
                                onChange={(e) => setActiveFilter(e.target.value)}
                                className="px-3 py-2 text-[12px] text-stone-700 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600 transition"
                            >
                                <option value="">All Status</option>
                                {ACTIVE_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                            </select>
                            {hasActiveFilters && (
                                <button onClick={clearFilters} className="inline-flex items-center gap-1.5 px-3 py-2 text-[12px] font-medium text-red-600 hover:bg-red-50 rounded-lg transition">
                                    <X className="w-3.5 h-3.5" />
                                    Clear
                                </button>
                            )}
                        </div>
                    )}

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-t border-stone-100">
                                    <th className="text-left text-[11px] font-semibold text-stone-500 uppercase tracking-wider px-4 py-3">Employee No.</th>
                                    <th className="text-left text-[11px] font-semibold text-stone-500 uppercase tracking-wider px-4 py-3">Full Name</th>
                                    <th className="text-left text-[11px] font-semibold text-stone-500 uppercase tracking-wider px-4 py-3 hidden lg:table-cell">Office</th>
                                    <th className="text-left text-[11px] font-semibold text-stone-500 uppercase tracking-wider px-4 py-3 hidden xl:table-cell">Position</th>
                                    <th className="text-left text-[11px] font-semibold text-stone-500 uppercase tracking-wider px-4 py-3 hidden md:table-cell">Type</th>
                                    <th className="text-left text-[11px] font-semibold text-stone-500 uppercase tracking-wider px-4 py-3 hidden lg:table-cell">Date Hired</th>
                                    <th className="text-center text-[11px] font-semibold text-stone-500 uppercase tracking-wider px-4 py-3 hidden md:table-cell">Docs</th>
                                    <th className="text-center text-[11px] font-semibold text-stone-500 uppercase tracking-wider px-4 py-3 hidden sm:table-cell">Status</th>
                                    <th className="text-right text-[11px] font-semibold text-stone-500 uppercase tracking-wider px-4 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan={9} className="px-4 py-12 text-center text-[13px] text-stone-400">
                                            Loading employee directory...
                                        </td>
                                    </tr>
                                ) : loadError ? (
                                    <tr>
                                        <td colSpan={9} className="px-4 py-12 text-center text-[13px] text-red-500">
                                            {loadError}
                                        </td>
                                    </tr>
                                ) : filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={9} className="px-4 py-12 text-center">
                                            <Users className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                                            <p className="text-[13px] text-stone-400">No employees match your criteria.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filtered.map((emp) => (
                                        <React.Fragment key={emp.id}>
                                            <tr className="hover:bg-stone-50/60 transition cursor-pointer group" onClick={() => handleExpand(emp.id)}>
                                                <td className="px-4 py-3">
                                                    <span className="text-[12px] font-mono text-stone-600">{emp.employeeNo}</span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <p className="text-[13px] font-semibold text-stone-800">{emp.fullName}</p>
                                                </td>
                                                <td className="px-4 py-3 hidden lg:table-cell">
                                                    <span className="text-[12px] text-stone-600">{emp.office}</span>
                                                </td>
                                                <td className="px-4 py-3 hidden xl:table-cell">
                                                    <span className="text-[12px] text-stone-600">{emp.position}</span>
                                                </td>
                                                <td className="px-4 py-3 hidden md:table-cell">
                                                    <EmploymentBadge status={emp.employmentStatus} />
                                                </td>
                                                <td className="px-4 py-3 hidden lg:table-cell">
                                                    <span className="text-[12px] text-stone-500">
                                                        {new Date(emp.dateHired).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-center hidden md:table-cell">
                                                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-stone-100 text-[11px] font-semibold text-stone-600">
                                                        {emp.documents.length}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-center hidden sm:table-cell">
                                                    <StatusBadge isActive={emp.isActive} />
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <button
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium rounded-lg bg-green-700 text-white hover:bg-green-800 active:scale-[0.97] shadow-sm transition"
                                                        onClick={(e) => { e.stopPropagation(); handleExpand(emp.id); }}
                                                    >
                                                        <Eye className="w-3.5 h-3.5" />
                                                        <span className="hidden sm:inline">View 201</span>
                                                        {expandedId === emp.id
                                                            ? <ChevronDown className="w-3.5 h-3.5" />
                                                            : <ChevronRight className="w-3.5 h-3.5" />}
                                                    </button>
                                                </td>
                                            </tr>

                                            {/* Expanded 201 Detail */}
                                            {expandedId === emp.id && (
                                                <tr>
                                                    <td colSpan={9} className="px-0 py-0">
                                                        <div className="bg-stone-50/80 border-y border-stone-200/60">
                                                            <div className="px-6 py-5">
                                                                {/* Detail header */}
                                                                <div className="flex items-center justify-between mb-4">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                                                                            <User className="w-5 h-5 text-green-700" />
                                                                        </div>
                                                                        <div>
                                                                            <h3 className="text-[14px] font-bold text-stone-900">{emp.fullName}</h3>
                                                                            <p className="text-[12px] text-stone-400">{emp.position} &middot; {emp.office}</p>
                                                                        </div>
                                                                    </div>
                                                                    <button
                                                                        onClick={() => setExpandedId(null)}
                                                                        className="p-2 rounded-lg hover:bg-stone-200/60 transition text-stone-400 hover:text-stone-600"
                                                                    >
                                                                        <X className="w-4 h-4" />
                                                                    </button>
                                                                </div>

                                                                {/* Tabs */}
                                                                <div className="flex gap-1 border-b border-stone-200/80 mb-4">
                                                                    {tabs.map((tab) => {
                                                                        const Icon = tab.icon;
                                                                        const isActive = activeTab === tab.key;
                                                                        return (
                                                                            <button
                                                                                key={tab.key}
                                                                                onClick={() => setActiveTab(tab.key)}
                                                                                className={`flex items-center gap-1.5 px-3 py-2.5 text-[12px] font-medium rounded-t-lg transition -mb-px ${
                                                                                    isActive
                                                                                        ? "bg-white text-green-700 border border-stone-200/80 border-b-white"
                                                                                        : "text-stone-500 hover:text-stone-700 hover:bg-stone-100/60"
                                                                                }`}
                                                                            >
                                                                                <Icon className="w-3.5 h-3.5" />
                                                                                <span className="hidden sm:inline">{tab.label}</span>
                                                                            </button>
                                                                        );
                                                                    })}
                                                                </div>

                                                                {/* Tab content */}
                                                                <div className="bg-white rounded-lg border border-stone-200/80 p-4">
                                                                    {activeTab === "personal" && <PersonalInfoTab employee={emp} />}
                                                                    {activeTab === "documents" && <DocumentsTab documents={emp.documents} />}
                                                                    {activeTab === "certificates" && <CertificatesTab certificates={emp.certificates} />}
                                                                    {activeTab === "training" && <TrainingTab trainings={emp.trainingsAttended} />}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer */}
                    <div className="px-4 py-3 border-t border-stone-100 flex items-center justify-between">
                        <p className="text-[12px] text-stone-400">
                            Showing <span className="font-medium text-stone-600">{filtered.length}</span> of{" "}
                            <span className="font-medium text-stone-600">{MOCK_EMPLOYEES.length}</span> employees
                        </p>
                    </div>
                </div>
            </div>
        </RoleLayout>
    );
}
