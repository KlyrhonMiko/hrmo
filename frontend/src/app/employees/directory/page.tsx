"use client";

import React, { useEffect, useState, useMemo } from "react";
import { RoleLayout } from "@/components/layout/RoleLayout";
import type { Employee201, PaginationMeta, DocumentMOV, CertificateRecord, TrainingRecord, TimelineRecord } from "@/types";
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
    ChevronLeft,
} from "lucide-react";

const OFFICES = ["CCS", "COE", "CBA", "CHAS", "CAS", "Admin"] as const;
const EMPLOYMENT_STATUSES = ["Teaching", "Non-Teaching", "COS"] as const;
const ACTIVE_STATUSES = ["Active", "Inactive"] as const;
const SCHOOL_YEARS = ["2023-2024", "2024-2025", "2025-2026"] as const;
const SEMESTERS = ["1st Semester", "2nd Semester", "Midyear / Summer Term"] as const;

type DetailTab = "personal" | "documents" | "certificates" | "training" | "timeline";

function StatusBadge({ isActive }: { isActive: boolean }) {
    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${isActive
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

function PersonalInfoTab({ employee, canEdit }: { employee: Employee201; canEdit: boolean }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editedData, setEditedData] = useState({
        position: employee.position,
        salaryGrade: employee.salaryGrade || "",
        stepIncrement: employee.stepIncrement || ""
    });

    const handleSave = () => {
        // Logic to save data would go here (API call)
        // For frontend only, we just update the UI state locally if possible, 
        // but here we just exit editing mode to show it works.
        Object.assign(employee, editedData); // Mock update
        setIsEditing(false);
    };

    const fields = [
        { icon: User, label: "Full Name", value: `${employee.firstName} ${employee.middleName ? employee.middleName.charAt(0) + ". " : ""}${employee.surname}` },
        { icon: Briefcase, label: "Employee No.", value: employee.employeeNo },
        { icon: MapPin, label: "Office", value: employee.office },
        { icon: Briefcase, label: "Position", value: employee.position, editable: true, key: "position" },
        { icon: Award, label: "Salary Grade", value: employee.salaryGrade || "N/A", editable: true, key: "salaryGrade" },
        { icon: Award, label: "Step Increment", value: employee.stepIncrement || "N/A", editable: true, key: "stepIncrement" },
        { icon: Calendar, label: "Date Hired", value: new Date(employee.dateHired).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) },
        { icon: Mail, label: "Email", value: employee.email },
        { icon: Phone, label: "Mobile", value: employee.mobileNo },
    ];

    return (
        <div className="space-y-4">
            {canEdit && (
                <div className="flex justify-end">
                    {isEditing ? (
                        <div className="flex gap-2">
                            <button onClick={handleSave} className="px-3 py-1.5 bg-green-700 text-white text-[12px] font-medium rounded-lg hover:bg-green-800">Save Changes</button>
                            <button onClick={() => setIsEditing(false)} className="px-3 py-1.5 bg-stone-100 text-stone-600 text-[12px] font-medium rounded-lg hover:bg-stone-200">Cancel</button>
                        </div>
                    ) : (
                        <button onClick={() => setIsEditing(true)} className="px-3 py-1.5 bg-stone-100 text-stone-600 text-[12px] font-medium rounded-lg hover:bg-stone-200">Edit Details</button>
                    )}
                </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {fields.map((f) => (
                    <div key={f.label} className="flex items-start gap-3 p-3 rounded-lg bg-stone-50/60">
                        <f.icon className="w-4 h-4 text-stone-400 mt-0.5 shrink-0" />
                        <div className="flex-1">
                            <p className="text-[11px] text-stone-400 font-medium uppercase tracking-wide">{f.label}</p>
                            {isEditing && "editable" in f && f.editable ? (
                                <input
                                    type="text"
                                    value={editedData[f.key as keyof typeof editedData]}
                                    onChange={(e) => setEditedData({ ...editedData, [f.key as string]: e.target.value })}
                                    className="w-full mt-1 px-2 py-1 text-[13px] bg-white border border-stone-200 rounded focus:outline-none focus:ring-1 focus:ring-green-600"
                                />
                            ) : (
                                <p className="text-[13px] text-stone-800 font-medium mt-0.5">{f.value}</p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
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
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${doc.status === "Verified" ? "bg-emerald-50 text-emerald-700" : doc.status === "Rejected" ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600"
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
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${cert.status === "Active" ? "bg-emerald-50 text-emerald-700" : cert.status === "Expired" ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600"
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

function TimelineTab({ timeline }: { timeline?: TimelineRecord[] }) {
    if (!timeline || timeline.length === 0) return <p className="text-[13px] text-stone-400 py-6 text-center">No timeline data available.</p>;
    return (
        <div className="space-y-3">
            {timeline.map((t, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-stone-50/60 transition">
                    <div className="flex items-center gap-3">
                        <Calendar className="w-4 h-4 text-stone-400" />
                        <div>
                            <p className="text-[13px] text-stone-800 font-medium">{t.schoolYear}</p>
                            <p className="text-[11px] text-stone-400">{t.semester}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${t.status === "Active"
                            ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20"
                            : "bg-stone-100 text-stone-500 ring-1 ring-stone-300/40"
                            }`}>
                            {t.status}
                        </span>
                        {t.remarks && <p className="text-[11px] text-stone-400 max-w-[200px] truncate">{t.remarks}</p>}
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
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${t.status === "Completed" ? "bg-emerald-50 text-emerald-700" : t.status === "Ongoing" ? "bg-blue-50 text-blue-700" : t.status === "Upcoming" ? "bg-amber-50 text-amber-600" : "bg-red-50 text-red-600"
                        }`}>
                        {t.status}
                    </span>
                </div>
            ))}
        </div>
    );
}

export default function EmployeeDirectoryPage() {
    const PAGE_SIZE = 10;
    const [search, setSearch] = useState("");
    const [officeFilter, setOfficeFilter] = useState("");
    const [empStatusFilter, setEmpStatusFilter] = useState("");
    const [activeFilter, setActiveFilter] = useState("");
    const [syFilter, setSyFilter] = useState("");
    const [semesterFilter, setSemesterFilter] = useState("");
    const [dateRange, setDateRange] = useState({ start: "", end: "" });
    const [userRole, setUserRole] = useState<"HR Head" | "President" | "HR Record Asst">("HR Head");

    useEffect(() => {
        if (typeof window !== "undefined") {
            const role = localStorage.getItem("userRole");
            if (role) setUserRole(role as any);
        }
    }, []);
    const [employees, setEmployees] = useState<Employee201[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [meta, setMeta] = useState<PaginationMeta | null>(null);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<DetailTab>("personal");
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        let mounted = true;

        async function loadDirectory() {
            setLoading(true);
            setLoadError(null);

            try {
                const response = await fetch(`/api/employees/directory?page=${page}&limit=${PAGE_SIZE}`, { cache: "no-store" });
                const payload = (await response.json()) as {
                    success?: boolean;
                    message?: string;
                    data?: Employee201[];
                    meta?: PaginationMeta;
                };

                if (!response.ok || !payload.success) {
                    throw new Error(payload.message || "Failed to load employee directory.");
                }

                if (mounted) {
                    setEmployees(payload.data || []);
                    setMeta(payload.meta || null);
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
    }, [page]);

    const filtered = useMemo(() => {
        return employees.filter((e) => {
            const q = search.toLowerCase();
            const matchesSearch = !q || e.fullName.toLowerCase().includes(q) || e.employeeNo.toLowerCase().includes(q);
            const matchesOffice = !officeFilter || e.office === officeFilter;
            const matchesEmpStatus = !empStatusFilter || e.employmentStatus === empStatusFilter;

            // Basic Active Filter if no SY/Semester selected
            let matchesActive = !activeFilter || (activeFilter === "Active" ? e.isActive : !e.isActive);

            // Advanced Timeline Filter
            if (syFilter || semesterFilter) {
                const timelineMatch = e.timeline?.find(t =>
                    (!syFilter || t.schoolYear === syFilter) &&
                    (!semesterFilter || t.semester === semesterFilter)
                );
                if (activeFilter) {
                    matchesActive = timelineMatch?.status === activeFilter;
                } else {
                    matchesActive = !!timelineMatch;
                }
            }

            // Date Range Filter (based on dateHired)
            const hiredDate = new Date(e.dateHired);
            const matchesDateRange = (!dateRange.start || hiredDate >= new Date(dateRange.start)) &&
                (!dateRange.end || hiredDate <= new Date(dateRange.end));

            return matchesSearch && matchesOffice && matchesEmpStatus && matchesActive && matchesDateRange;
        });
    }, [employees, search, officeFilter, empStatusFilter, activeFilter, syFilter, semesterFilter, dateRange]);

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

    const hasActiveFilters = officeFilter || empStatusFilter || activeFilter || syFilter || semesterFilter || dateRange.start || dateRange.end;

    const clearFilters = () => {
        setOfficeFilter("");
        setEmpStatusFilter("");
        setActiveFilter("");
        setSyFilter("");
        setSemesterFilter("");
        setDateRange({ start: "", end: "" });
        setPage(1);
    };

    const exportToCSV = () => {
        const headers = ["Employee No", "Full Name", "Office", "Position", "Status", "Salary Grade", "Step", "Date Hired", "Email"];
        const rows = filtered.map(e => [
            e.employeeNo,
            e.fullName,
            e.office,
            e.position,
            e.isActive ? "Active" : "Inactive",
            e.salaryGrade || "N/A",
            e.stepIncrement || "N/A",
            new Date(e.dateHired).toLocaleDateString(),
            e.email
        ]);

        const csvContent = [headers, ...rows].map(row => row.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `employee_directory_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const tabs: { key: DetailTab | "timeline"; label: string; icon: React.ElementType }[] = [
        { key: "personal", label: "Personal Info", icon: User },
        { key: "timeline", label: "Timeline", icon: Calendar },
        { key: "documents", label: "Documents / MOV", icon: FileText },
        { key: "certificates", label: "Certificates", icon: Award },
        { key: "training", label: "Training History", icon: GraduationCap },
    ];

    return (
        <RoleLayout userRole={userRole}>
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
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setPage(1);
                                }}
                                className="w-full pl-9 pr-4 py-2.5 text-[13px] text-stone-800 placeholder:text-stone-400 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600 transition"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={exportToCSV}
                                className="inline-flex items-center gap-2 px-4 py-2.5 text-[13px] font-medium rounded-lg bg-stone-100 text-stone-600 border border-stone-200 hover:bg-stone-200/60 transition"
                            >
                                <Download className="w-4 h-4" />
                                Export
                            </button>
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`inline-flex items-center gap-2 px-4 py-2.5 text-[13px] font-medium rounded-lg border transition ${showFilters || hasActiveFilters
                                    ? "bg-green-50 text-green-700 border-green-200"
                                    : "bg-white text-stone-600 border-stone-200 hover:bg-stone-50"
                                    }`}
                            >
                                <Filter className="w-4 h-4" />
                                Filters
                                {hasActiveFilters && (
                                    <span className="w-5 h-5 rounded-full bg-green-700 text-white text-[10px] flex items-center justify-center font-bold">
                                        {[officeFilter, empStatusFilter, activeFilter, syFilter, semesterFilter, dateRange.start, dateRange.end].filter(Boolean).length}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>

                    {showFilters && (
                        <div className="px-4 pb-4 pt-0 flex flex-wrap items-center gap-3 border-t border-stone-100 pt-3">
                            <select
                                value={officeFilter}
                                onChange={(e) => {
                                    setOfficeFilter(e.target.value);
                                    setPage(1);
                                }}
                                className="px-3 py-2 text-[12px] text-stone-700 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600 transition"
                            >
                                <option value="">All Offices</option>
                                {OFFICES.map((o) => <option key={o} value={o}>{o}</option>)}
                            </select>
                            <select
                                value={empStatusFilter}
                                onChange={(e) => {
                                    setEmpStatusFilter(e.target.value);
                                    setPage(1);
                                }}
                                className="px-3 py-2 text-[12px] text-stone-700 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600 transition"
                            >
                                <option value="">All Employment Types</option>
                                {EMPLOYMENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                            </select>
                            <select
                                value={activeFilter}
                                onChange={(e) => {
                                    setActiveFilter(e.target.value);
                                    setPage(1);
                                }}
                                className="px-3 py-2 text-[12px] text-stone-700 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600 transition"
                            >
                                <option value="">All Status</option>
                                {ACTIVE_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                            </select>

                            <div className="h-6 w-px bg-stone-200 mx-1 hidden sm:block" />

                            <select
                                value={syFilter}
                                onChange={(e) => {
                                    setSyFilter(e.target.value);
                                    setPage(1);
                                }}
                                className="px-3 py-2 text-[12px] text-stone-700 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600 transition"
                            >
                                <option value="">Select SY</option>
                                {SCHOOL_YEARS.map((sy) => <option key={sy} value={sy}>{sy}</option>)}
                            </select>

                            <select
                                value={semesterFilter}
                                onChange={(e) => {
                                    setSemesterFilter(e.target.value);
                                    setPage(1);
                                }}
                                className="px-3 py-2 text-[12px] text-stone-700 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600 transition"
                            >
                                <option value="">Select Semester</option>
                                {SEMESTERS.map((sem) => <option key={sem} value={sem}>{sem}</option>)}
                            </select>

                            <div className="flex items-center gap-2 ml-auto">
                                <span className="text-[11px] text-stone-400 font-medium uppercase tracking-wide">Hired Range:</span>
                                <input
                                    type="date"
                                    value={dateRange.start}
                                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                                    className="px-2 py-1.5 text-[11px] text-stone-700 bg-stone-50 border border-stone-200 rounded focus:outline-none"
                                />
                                <span className="text-stone-300">-</span>
                                <input
                                    type="date"
                                    value={dateRange.end}
                                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                                    className="px-2 py-1.5 text-[11px] text-stone-700 bg-stone-50 border border-stone-200 rounded focus:outline-none"
                                />
                            </div>
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
                                                                                className={`flex items-center gap-1.5 px-3 py-2.5 text-[12px] font-medium rounded-t-lg transition -mb-px ${isActive
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
                                                                    {activeTab === "personal" && <PersonalInfoTab employee={emp} canEdit={userRole === "HR Head"} />}
                                                                    {activeTab === "timeline" && <TimelineTab timeline={emp.timeline || []} />}
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
                            {meta ? (
                                <>
                                    Showing{" "}
                                    <span className="font-medium text-stone-600">{meta.total_records === 0 ? 0 : meta.skip + 1}</span>
                                    -
                                    <span className="font-medium text-stone-600">{Math.min(meta.skip + filtered.length, meta.total_records)}</span>
                                    {" "}of{" "}
                                    <span className="font-medium text-stone-600">{meta.total_records}</span> employees
                                </>
                            ) : (
                                <>
                                    Showing <span className="font-medium text-stone-600">{filtered.length}</span> employees
                                </>
                            )}
                        </p>
                        {meta && (
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                                    disabled={!meta.has_previous || loading}
                                    className="inline-flex items-center gap-1 px-3 py-1.5 text-[12px] rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronLeft className="w-3.5 h-3.5" /> Prev
                                </button>
                                <span className="text-[12px] text-stone-500">Page {meta.current_page} of {Math.max(meta.total_pages, 1)}</span>
                                <button
                                    onClick={() => setPage((prev) => prev + 1)}
                                    disabled={!meta.has_next || loading}
                                    className="inline-flex items-center gap-1 px-3 py-1.5 text-[12px] rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </RoleLayout>
    );
}
