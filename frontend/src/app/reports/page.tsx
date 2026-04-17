"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { RoleLayout } from "@/components/layout/RoleLayout";
import { SavedReportsList } from "@/components/reports/SavedReportsList";
import { CreateReportModal } from "@/components/reports/CreateReportModal";
import { ReportDetailView } from "@/components/reports/ReportDetailView";
import type { SavedReport } from "@/types";
import {
    Plus,
    FileBarChart,
    Download,
    FileSpreadsheet,
    FileText,
    File,
    Filter,
    ChevronDown,
} from "lucide-react";

type ReportCategory = "All" | "Personnel" | "Training" | "Compliance" | "Budget";

const CATEGORY_MAP: Record<string, ReportCategory> = {
    department: "Personnel",
    status: "Personnel",
    degree: "Personnel",
    office: "Personnel",
    training: "Training",
};

function resolveCategory(report: SavedReport): ReportCategory {
    return CATEGORY_MAP[report.groupBy] ?? "Personnel";
}

function downloadCSV(report: SavedReport) {
    const header = "Group,Value";
    const rows = report.results.map(
        (r) => `"${r.group.replace(/"/g, '""')}",${r.value}`
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${report.title.replace(/\s+/g, "_")}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function downloadAllCSV(reports: SavedReport[]) {
    if (reports.length === 0) return;
    const sections = reports.map((report) => {
        const header = `\n--- ${report.title} ---\nGroup,Value`;
        const rows = report.results.map(
            (r) => `"${r.group.replace(/"/g, '""')}",${r.value}`
        );
        return [header, ...rows].join("\n");
    });
    const csv = sections.join("\n\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "all_reports.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function DownloadDropdown({
    report,
    align = "right",
}: {
    report: SavedReport;
    align?: "left" | "right";
}) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node))
                setOpen(false);
        }
        if (open) document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, [open]);

    const handleFormat = (format: "csv" | "pdf" | "excel") => {
        setOpen(false);
        if (format === "csv") {
            downloadCSV(report);
            return;
        }
        alert(
            `${format.toUpperCase()} export coming soon. CSV download is available now.`
        );
    };

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    setOpen((v) => !v);
                }}
                className="inline-flex items-center gap-1.5 text-[12px] font-medium text-green-700 hover:text-green-800 transition-colors px-2 py-1 rounded-md hover:bg-green-50"
            >
                <Download className="w-3.5 h-3.5" />
                Download
                <ChevronDown className="w-3 h-3" />
            </button>

            {open && (
                <div
                    className={`absolute z-50 top-full mt-1 bg-white rounded-lg shadow-lg border border-stone-200 p-1.5 min-w-[160px] ${align === "right" ? "right-0" : "left-0"
                        }`}
                >
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleFormat("csv");
                        }}
                        className="flex items-center gap-2 w-full px-3 py-2 text-[12px] font-medium text-slate-700 hover:bg-stone-50 rounded-md transition-colors"
                    >
                        <FileText className="w-3.5 h-3.5 text-emerald-600" />
                        Download CSV
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleFormat("pdf");
                        }}
                        className="flex items-center gap-2 w-full px-3 py-2 text-[12px] font-medium text-slate-700 hover:bg-stone-50 rounded-md transition-colors"
                    >
                        <File className="w-3.5 h-3.5 text-red-500" />
                        Download PDF
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleFormat("excel");
                        }}
                        className="flex items-center gap-2 w-full px-3 py-2 text-[12px] font-medium text-slate-700 hover:bg-stone-50 rounded-md transition-colors"
                    >
                        <FileSpreadsheet className="w-3.5 h-3.5 text-green-600" />
                        Download Excel
                    </button>
                </div>
            )}
        </div>
    );
}

function DownloadAllDropdown({ reports }: { reports: SavedReport[] }) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node))
                setOpen(false);
        }
        if (open) document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, [open]);

    const handleFormat = (format: "csv" | "pdf" | "excel") => {
        setOpen(false);
        if (format === "csv") {
            downloadAllCSV(reports);
            return;
        }
        alert(
            `${format.toUpperCase()} export coming soon. CSV download is available now.`
        );
    };

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setOpen((v) => !v)}
                disabled={reports.length === 0}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-stone-200 text-slate-700 text-[13px] font-medium rounded-lg hover:bg-stone-50 active:scale-[0.98] shadow-sm transition-all disabled:opacity-40 disabled:pointer-events-none"
            >
                <Download className="w-4 h-4" />
                Download All
                <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {open && (
                <div className="absolute z-50 top-full mt-1 right-0 bg-white rounded-lg shadow-lg border border-stone-200 p-1.5 min-w-[170px]">
                    <button
                        onClick={() => handleFormat("csv")}
                        className="flex items-center gap-2 w-full px-3 py-2 text-[12px] font-medium text-slate-700 hover:bg-stone-50 rounded-md transition-colors"
                    >
                        <FileText className="w-3.5 h-3.5 text-emerald-600" />
                        All as CSV
                    </button>
                    <button
                        onClick={() => handleFormat("pdf")}
                        className="flex items-center gap-2 w-full px-3 py-2 text-[12px] font-medium text-slate-700 hover:bg-stone-50 rounded-md transition-colors"
                    >
                        <File className="w-3.5 h-3.5 text-red-500" />
                        All as PDF
                    </button>
                    <button
                        onClick={() => handleFormat("excel")}
                        className="flex items-center gap-2 w-full px-3 py-2 text-[12px] font-medium text-slate-700 hover:bg-stone-50 rounded-md transition-colors"
                    >
                        <FileSpreadsheet className="w-3.5 h-3.5 text-green-600" />
                        All as Excel
                    </button>
                </div>
            )}
        </div>
    );
}

const CATEGORIES: ReportCategory[] = [
    "All",
    "Personnel",
    "Training",
    "Compliance",
    "Budget",
];

export default function ReportsPage() {
    const [reports, setReports] = useState<SavedReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedReport, setSelectedReport] = useState<SavedReport | null>(
        null
    );
    const [activeCategory, setActiveCategory] = useState<ReportCategory>("All");
    const [userRole, setUserRole] = useState<"HR Head" | "President" | "HR Record Asst">("HR Head");

    useEffect(() => {
        if (typeof window !== "undefined") {
            const role = localStorage.getItem("userRole");
            if (role) setUserRole(role as any);
        }
    }, []);

    const fetchReports = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/reports");
            if (!res.ok) throw new Error("Failed to fetch reports");
            const data = await res.json();
            setReports(data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchReports();
    }, [fetchReports]);

    const handleDelete = async (id: string) => {
        try {
            const res = await fetch(`/api/reports?id=${id}`, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error("Failed to delete");
            setReports((prev) => prev.filter((r) => r.id !== id));
            if (selectedReport?.id === id) setSelectedReport(null);
        } catch (err) {
            console.error(err);
            alert("Failed to delete report.");
        }
    };

    const filteredReports =
        activeCategory === "All"
            ? reports
            : reports.filter((r) => resolveCategory(r) === activeCategory);

    return (
        <RoleLayout userRole={userRole}>
            <div className="space-y-6 pb-8">
                {/* Page header */}
                {!selectedReport && (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                                <FileBarChart className="w-5 h-5 text-indigo-600" />
                            </div>
                            <div>
                                <h1 className="text-[18px] font-bold text-slate-900">
                                    Reports
                                </h1>
                                <p className="text-[13px] text-slate-400">
                                    Create and manage personnel reports
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <DownloadAllDropdown reports={filteredReports} />
                            {userRole !== "President" && (
                                <button
                                    onClick={() => setModalOpen(true)}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-[13px] font-medium rounded-lg hover:bg-indigo-700 active:scale-[0.98] shadow-sm transition-all"
                                >
                                    <Plus className="w-4 h-4" />
                                    Create Report
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Category filters */}
                {!selectedReport && (
                    <div className="flex items-center gap-2 flex-wrap">
                        <Filter className="w-4 h-4 text-slate-400 mr-1" />
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-3.5 py-1.5 text-[12px] font-medium rounded-full border transition-all ${activeCategory === cat
                                    ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                                    : "bg-white text-slate-500 border-stone-200 hover:bg-stone-50 hover:text-slate-700"
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                )}

                {/* Detail view with download */}
                {selectedReport ? (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div />
                            <DownloadDropdown
                                report={selectedReport}
                                align="right"
                            />
                        </div>
                        <ReportDetailView
                            report={selectedReport}
                            onBack={() => setSelectedReport(null)}
                        />
                    </div>
                ) : (
                    <div className="space-y-0">
                        {/* Per-report download buttons rendered as an overlay row */}
                        <SavedReportsList
                            reports={filteredReports}
                            onSelect={setSelectedReport}
                            onDelete={userRole !== "President" ? handleDelete : undefined}
                            onCreateNew={userRole !== "President" ? () => setModalOpen(true) : undefined}
                            loading={loading}
                            renderActions={(report: SavedReport) => (
                                <DownloadDropdown
                                    report={report}
                                    align="right"
                                />
                            )}
                        />
                    </div>
                )}

                {/* Create modal */}
                <CreateReportModal
                    open={modalOpen}
                    onClose={() => setModalOpen(false)}
                    onCreated={fetchReports}
                />
            </div>
        </RoleLayout>
    );
}
