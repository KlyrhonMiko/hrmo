"use client";

import React, { useState } from "react";
import { RoleLayout } from "@/components/layout/RoleLayout";
import type { TrainingRecord, TrainingRequest } from "@/types";
import {
    GraduationCap,
    Clock,
    CheckCircle,
    Send,
    Calendar,
    MapPin,
    Building,
    Download,
    Plus,
    X,
    FileText,
    AlertCircle,
    XCircle,
} from "lucide-react";

/* ───────────────────────── mock data ───────────────────────── */

const EMPLOYEE_ID = "EMP-2024-0042";
const EMPLOYEE_NAME = "Juan S. Dela Cruz";

const mockHistory: TrainingRecord[] = [
    {
        id: "TR-001",
        title: "Advanced Data Privacy Act Compliance",
        type: "Seminar",
        conductedBy: "Civil Service Commission",
        venue: "CSC Regional Office, Cebu City",
        dateFrom: "2025-11-15",
        dateTo: "2025-11-17",
        numberOfHours: 24,
        status: "Completed",
        certificateUrl: "/certificates/TR-001.pdf",
        employeeId: EMPLOYEE_ID,
        employeeName: EMPLOYEE_NAME,
    },
    {
        id: "TR-002",
        title: "Leadership and Management Development Program",
        type: "Workshop",
        conductedBy: "Development Academy of the Philippines",
        venue: "DAP Conference Center, Tagaytay",
        dateFrom: "2025-09-02",
        dateTo: "2025-09-06",
        numberOfHours: 40,
        status: "Completed",
        certificateUrl: "/certificates/TR-002.pdf",
        employeeId: EMPLOYEE_ID,
        employeeName: EMPLOYEE_NAME,
    },
    {
        id: "TR-003",
        title: "Digital Transformation in Government Services",
        type: "Conference",
        conductedBy: "DICT",
        venue: "Philippine International Convention Center, Manila",
        dateFrom: "2026-03-10",
        dateTo: "2026-03-14",
        numberOfHours: 32,
        status: "Ongoing",
        employeeId: EMPLOYEE_ID,
        employeeName: EMPLOYEE_NAME,
    },
    {
        id: "TR-004",
        title: "Public Financial Management Reform",
        type: "Seminar",
        conductedBy: "Department of Budget and Management",
        venue: "DBM Multi-Purpose Hall, Manila",
        dateFrom: "2025-06-20",
        dateTo: "2025-06-21",
        numberOfHours: 16,
        status: "Completed",
        certificateUrl: "/certificates/TR-004.pdf",
        employeeId: EMPLOYEE_ID,
        employeeName: EMPLOYEE_NAME,
    },
    {
        id: "TR-005",
        title: "Effective Communication Skills for Public Servants",
        type: "Workshop",
        conductedBy: "HRMO Training Division",
        venue: "Municipal Training Room, City Hall",
        dateFrom: "2025-03-12",
        dateTo: "2025-03-13",
        numberOfHours: 16,
        status: "Completed",
        employeeId: EMPLOYEE_ID,
        employeeName: EMPLOYEE_NAME,
    },
    {
        id: "TR-006",
        title: "GAD Sensitivity and Awareness",
        type: "Webinar",
        conductedBy: "Philippine Commission on Women",
        venue: "Online (Zoom)",
        dateFrom: "2025-01-25",
        dateTo: "2025-01-25",
        numberOfHours: 8,
        status: "Completed",
        certificateUrl: "/certificates/TR-006.pdf",
        employeeId: EMPLOYEE_ID,
        employeeName: EMPLOYEE_NAME,
    },
];

const mockRequests: TrainingRequest[] = [
    {
        id: "REQ-001",
        employeeId: EMPLOYEE_ID,
        employeeName: EMPLOYEE_NAME,
        trainingTitle: "Project Management Professional (PMP) Review",
        trainingType: "Certification",
        provider: "PM Academy Philippines",
        venue: "PM Academy Training Center, Makati",
        dateFrom: "2026-05-05",
        dateTo: "2026-05-09",
        estimatedCost: 25000,
        justification:
            "Needed for managing upcoming digitalization projects in the office. PMP certification will strengthen project governance capabilities.",
        status: "Pending",
        submittedAt: "2026-03-10",
    },
    {
        id: "REQ-002",
        employeeId: EMPLOYEE_ID,
        employeeName: EMPLOYEE_NAME,
        trainingTitle: "Strategic Human Resource Management",
        trainingType: "Workshop",
        provider: "Ateneo School of Government",
        venue: "Ateneo de Manila University, QC",
        dateFrom: "2026-04-14",
        dateTo: "2026-04-18",
        estimatedCost: 18000,
        justification:
            "To enhance HR planning skills aligned with the agency's strategic direction.",
        status: "Approved",
        submittedAt: "2026-02-20",
        reviewedBy: "Maria L. Santos",
        reviewedAt: "2026-02-25",
        remarks: "Approved. Please coordinate with Admin for travel arrangements.",
    },
    {
        id: "REQ-003",
        employeeId: EMPLOYEE_ID,
        employeeName: EMPLOYEE_NAME,
        trainingTitle: "Advanced Excel and Data Analytics",
        trainingType: "Workshop",
        provider: "TechSkills Inc.",
        venue: "Online (MS Teams)",
        dateFrom: "2026-02-10",
        dateTo: "2026-02-12",
        estimatedCost: 8500,
        justification: "For improving data reporting and analysis capabilities.",
        status: "Completed",
        submittedAt: "2026-01-05",
        reviewedBy: "Maria L. Santos",
        reviewedAt: "2026-01-08",
        remarks: "Approved and completed. Certificate on file.",
    },
    {
        id: "REQ-004",
        employeeId: EMPLOYEE_ID,
        employeeName: EMPLOYEE_NAME,
        trainingTitle: "International Conference on Public Administration",
        trainingType: "Conference",
        provider: "IIAS Brussels",
        venue: "Athens, Greece",
        dateFrom: "2026-07-15",
        dateTo: "2026-07-19",
        estimatedCost: 150000,
        justification: "To present research paper on Philippine HR modernization.",
        status: "Rejected",
        submittedAt: "2026-01-20",
        reviewedBy: "Maria L. Santos",
        reviewedAt: "2026-02-01",
        remarks:
            "Budget constraints for international travel this fiscal year. Consider reapplying next FY.",
    },
];

/* ───────────────────────── helpers ───────────────────────── */

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

function formatDateRange(from: string, to: string) {
    if (from === to) return formatDate(from);
    return `${formatDate(from)} – ${formatDate(to)}`;
}

const TYPE_COLORS: Record<string, string> = {
    Seminar: "border-l-blue-500",
    Workshop: "border-l-violet-500",
    Conference: "border-l-amber-500",
    Webinar: "border-l-teal-500",
    Certification: "border-l-rose-500",
    Other: "border-l-stone-400",
};

const TYPE_BADGES: Record<string, string> = {
    Seminar: "bg-blue-50 text-blue-700",
    Workshop: "bg-violet-50 text-violet-700",
    Conference: "bg-amber-50 text-amber-700",
    Webinar: "bg-teal-50 text-teal-700",
    Certification: "bg-rose-50 text-rose-700",
    Other: "bg-stone-100 text-stone-600",
};

const STATUS_BADGES: Record<string, string> = {
    Completed: "bg-green-50 text-green-700",
    Ongoing: "bg-blue-50 text-blue-700",
    Upcoming: "bg-stone-100 text-stone-600",
    Cancelled: "bg-red-50 text-red-600",
    Pending: "bg-amber-50 text-amber-700",
    Approved: "bg-green-50 text-green-700",
    Rejected: "bg-red-50 text-red-600",
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
    Completed: <CheckCircle className="w-3.5 h-3.5" />,
    Ongoing: <Clock className="w-3.5 h-3.5" />,
    Pending: <AlertCircle className="w-3.5 h-3.5" />,
    Approved: <CheckCircle className="w-3.5 h-3.5" />,
    Rejected: <XCircle className="w-3.5 h-3.5" />,
};

const TRAINING_TYPES = [
    "Seminar",
    "Workshop",
    "Conference",
    "Webinar",
    "Certification",
    "Other",
] as const;

/* ───────────────────────── component ───────────────────────── */

export default function MyTrainingPage() {
    const [activeTab, setActiveTab] = useState<"history" | "requests">("history");
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({
        trainingTitle: "",
        trainingType: "Seminar" as (typeof TRAINING_TYPES)[number],
        provider: "",
        venue: "",
        dateFrom: "",
        dateTo: "",
        estimatedCost: "",
        justification: "",
    });

    const completedTrainings = mockHistory.filter((t) => t.status === "Completed");
    const totalHours = completedTrainings.reduce((sum, t) => sum + t.numberOfHours, 0);
    const pendingRequests = mockRequests.filter((r) => r.status === "Pending").length;
    const approvedRequests = mockRequests.filter(
        (r) => r.status === "Approved" || r.status === "Completed"
    ).length;

    const stats = [
        {
            label: "Total Trainings Attended",
            value: mockHistory.length,
            icon: GraduationCap,
            color: "text-green-700 bg-green-50",
        },
        {
            label: "Hours Completed",
            value: totalHours,
            icon: Clock,
            color: "text-blue-700 bg-blue-50",
        },
        {
            label: "Pending Requests",
            value: pendingRequests,
            icon: Send,
            color: "text-amber-700 bg-amber-50",
        },
        {
            label: "Approved Requests",
            value: approvedRequests,
            icon: CheckCircle,
            color: "text-green-700 bg-green-50",
        },
    ];

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        alert("Training request submitted successfully!");
        setShowModal(false);
        setForm({
            trainingTitle: "",
            trainingType: "Seminar",
            provider: "",
            venue: "",
            dateFrom: "",
            dateTo: "",
            estimatedCost: "",
            justification: "",
        });
    }

    return (
        <RoleLayout userRole="Employee">
            <div className="space-y-6 pb-8">
                {/* Page header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                            <GraduationCap className="w-5 h-5 text-green-700" />
                        </div>
                        <div>
                            <h1 className="text-[18px] font-bold text-stone-900">
                                My Training
                            </h1>
                            <p className="text-[13px] text-stone-400">
                                View training history and submit requests
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-700 text-white text-[13px] font-medium rounded-lg hover:bg-green-800 active:scale-[0.98] shadow-sm transition-all"
                    >
                        <Plus className="w-4 h-4" />
                        Request Training
                    </button>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.map((s) => {
                        const Icon = s.icon;
                        return (
                            <div
                                key={s.label}
                                className="bg-white rounded-xl border border-stone-200/80 shadow-sm p-5"
                            >
                                <div className="flex items-center justify-between">
                                    <p className="text-[12px] font-medium text-stone-400 uppercase tracking-wide">
                                        {s.label}
                                    </p>
                                    <div
                                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${s.color}`}
                                    >
                                        <Icon className="w-4 h-4" />
                                    </div>
                                </div>
                                <p className="text-2xl font-bold text-stone-900 mt-2">
                                    {s.value}
                                </p>
                            </div>
                        );
                    })}
                </div>

                {/* Tab bar */}
                <div className="border-b border-stone-200">
                    <nav className="flex gap-6">
                        {(
                            [
                                { key: "history", label: "Training History" },
                                { key: "requests", label: "Training Requests" },
                            ] as const
                        ).map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`pb-3 text-[13px] font-medium transition-colors ${
                                    activeTab === tab.key
                                        ? "text-green-700 border-b-2 border-green-700"
                                        : "text-stone-400 hover:text-stone-600"
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Tab content */}
                {activeTab === "history" ? (
                    <div className="space-y-3">
                        {mockHistory.map((t) => (
                            <div
                                key={t.id}
                                className={`bg-white rounded-xl border border-stone-200/80 shadow-sm p-5 border-l-4 ${
                                    TYPE_COLORS[t.type] ?? TYPE_COLORS.Other
                                }`}
                            >
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h3 className="text-[14px] font-semibold text-stone-900">
                                                {t.title}
                                            </h3>
                                            <span
                                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${
                                                    TYPE_BADGES[t.type] ?? TYPE_BADGES.Other
                                                }`}
                                            >
                                                {t.type}
                                            </span>
                                            <span
                                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${
                                                    STATUS_BADGES[t.status]
                                                }`}
                                            >
                                                {STATUS_ICONS[t.status]}
                                                {t.status}
                                            </span>
                                        </div>

                                        <div className="mt-2.5 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[12px] text-stone-500">
                                            <span className="inline-flex items-center gap-1.5">
                                                <Calendar className="w-3.5 h-3.5 text-stone-400" />
                                                {formatDateRange(t.dateFrom, t.dateTo)}
                                            </span>
                                            <span className="inline-flex items-center gap-1.5">
                                                <Clock className="w-3.5 h-3.5 text-stone-400" />
                                                {t.numberOfHours} hours
                                            </span>
                                            <span className="inline-flex items-center gap-1.5">
                                                <MapPin className="w-3.5 h-3.5 text-stone-400" />
                                                {t.venue}
                                            </span>
                                            <span className="inline-flex items-center gap-1.5">
                                                <Building className="w-3.5 h-3.5 text-stone-400" />
                                                {t.conductedBy}
                                            </span>
                                        </div>
                                    </div>

                                    {t.status === "Completed" && t.certificateUrl && (
                                        <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-green-700 bg-green-50 rounded-lg hover:bg-green-100 transition-colors shrink-0">
                                            <Download className="w-3.5 h-3.5" />
                                            Certificate
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-3">
                        {mockRequests.map((r) => (
                            <div
                                key={r.id}
                                className="bg-white rounded-xl border border-stone-200/80 shadow-sm p-5"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h3 className="text-[14px] font-semibold text-stone-900">
                                                {r.trainingTitle}
                                            </h3>
                                            <span
                                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${
                                                    TYPE_BADGES[r.trainingType] ?? TYPE_BADGES.Other
                                                }`}
                                            >
                                                {r.trainingType}
                                            </span>
                                            <span
                                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${
                                                    STATUS_BADGES[r.status]
                                                }`}
                                            >
                                                {STATUS_ICONS[r.status]}
                                                {r.status}
                                            </span>
                                        </div>

                                        <div className="mt-2.5 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[12px] text-stone-500">
                                            <span className="inline-flex items-center gap-1.5">
                                                <Building className="w-3.5 h-3.5 text-stone-400" />
                                                {r.provider}
                                            </span>
                                            <span className="inline-flex items-center gap-1.5">
                                                <MapPin className="w-3.5 h-3.5 text-stone-400" />
                                                {r.venue}
                                            </span>
                                            <span className="inline-flex items-center gap-1.5">
                                                <Calendar className="w-3.5 h-3.5 text-stone-400" />
                                                {formatDateRange(r.dateFrom, r.dateTo)}
                                            </span>
                                            <span className="inline-flex items-center gap-1.5">
                                                <FileText className="w-3.5 h-3.5 text-stone-400" />
                                                ₱{r.estimatedCost.toLocaleString()}
                                            </span>
                                        </div>

                                        <p className="mt-2 text-[12px] text-stone-400">
                                            <span className="text-stone-500 font-medium">Justification:</span>{" "}
                                            {r.justification}
                                        </p>

                                        {r.remarks && (
                                            <div className="mt-2 px-3 py-2 bg-stone-50 rounded-lg border border-stone-100">
                                                <p className="text-[12px] text-stone-500">
                                                    <span className="font-medium text-stone-600">
                                                        Reviewer remarks:
                                                    </span>{" "}
                                                    {r.remarks}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="text-right shrink-0">
                                        <p className="text-[11px] text-stone-400">
                                            Submitted {formatDate(r.submittedAt)}
                                        </p>
                                        {r.reviewedBy && (
                                            <p className="text-[11px] text-stone-400 mt-0.5">
                                                Reviewed by {r.reviewedBy}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Request Training Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div
                        className="absolute inset-0 bg-black/40"
                        onClick={() => setShowModal(false)}
                    />
                    <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                                    <GraduationCap className="w-4 h-4 text-green-700" />
                                </div>
                                <h2 className="text-[15px] font-semibold text-stone-900">
                                    Request Training
                                </h2>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-1.5 rounded-lg hover:bg-stone-100 transition-colors text-stone-400 hover:text-stone-600"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-[12px] font-medium text-stone-600 mb-1.5">
                                    Training Title
                                </label>
                                <input
                                    required
                                    value={form.trainingTitle}
                                    onChange={(e) =>
                                        setForm({ ...form, trainingTitle: e.target.value })
                                    }
                                    className="w-full px-3 py-2 text-[13px] border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600 transition-colors"
                                    placeholder="e.g. Leadership Development Program"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[12px] font-medium text-stone-600 mb-1.5">
                                        Type
                                    </label>
                                    <select
                                        value={form.trainingType}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                trainingType: e.target
                                                    .value as (typeof TRAINING_TYPES)[number],
                                            })
                                        }
                                        className="w-full px-3 py-2 text-[13px] border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600 transition-colors bg-white"
                                    >
                                        {TRAINING_TYPES.map((t) => (
                                            <option key={t} value={t}>
                                                {t}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[12px] font-medium text-stone-600 mb-1.5">
                                        Provider
                                    </label>
                                    <input
                                        required
                                        value={form.provider}
                                        onChange={(e) =>
                                            setForm({ ...form, provider: e.target.value })
                                        }
                                        className="w-full px-3 py-2 text-[13px] border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600 transition-colors"
                                        placeholder="Training provider"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[12px] font-medium text-stone-600 mb-1.5">
                                    Venue
                                </label>
                                <input
                                    required
                                    value={form.venue}
                                    onChange={(e) =>
                                        setForm({ ...form, venue: e.target.value })
                                    }
                                    className="w-full px-3 py-2 text-[13px] border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600 transition-colors"
                                    placeholder="Training venue or Online"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[12px] font-medium text-stone-600 mb-1.5">
                                        Date From
                                    </label>
                                    <input
                                        required
                                        type="date"
                                        value={form.dateFrom}
                                        onChange={(e) =>
                                            setForm({ ...form, dateFrom: e.target.value })
                                        }
                                        className="w-full px-3 py-2 text-[13px] border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[12px] font-medium text-stone-600 mb-1.5">
                                        Date To
                                    </label>
                                    <input
                                        required
                                        type="date"
                                        value={form.dateTo}
                                        onChange={(e) =>
                                            setForm({ ...form, dateTo: e.target.value })
                                        }
                                        className="w-full px-3 py-2 text-[13px] border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600 transition-colors"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[12px] font-medium text-stone-600 mb-1.5">
                                    Estimated Cost (₱)
                                </label>
                                <input
                                    required
                                    type="number"
                                    min="0"
                                    value={form.estimatedCost}
                                    onChange={(e) =>
                                        setForm({ ...form, estimatedCost: e.target.value })
                                    }
                                    className="w-full px-3 py-2 text-[13px] border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600 transition-colors"
                                    placeholder="0"
                                />
                            </div>

                            <div>
                                <label className="block text-[12px] font-medium text-stone-600 mb-1.5">
                                    Justification
                                </label>
                                <textarea
                                    required
                                    rows={3}
                                    value={form.justification}
                                    onChange={(e) =>
                                        setForm({ ...form, justification: e.target.value })
                                    }
                                    className="w-full px-3 py-2 text-[13px] border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600 transition-colors resize-none"
                                    placeholder="Explain how this training will benefit your role and the organization..."
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-[13px] font-medium text-stone-600 rounded-lg hover:bg-stone-100 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="inline-flex items-center gap-2 px-5 py-2 bg-green-700 text-white text-[13px] font-medium rounded-lg hover:bg-green-800 active:scale-[0.98] shadow-sm transition-all"
                                >
                                    <Send className="w-3.5 h-3.5" />
                                    Submit Request
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </RoleLayout>
    );
}
