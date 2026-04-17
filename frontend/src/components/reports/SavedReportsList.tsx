"use client";

import React from "react";
import type { SavedReport } from "@/types";
import {
    FileBarChart,
    Trash2,
    Calendar,
    Tag,
    FileSearch,
    Plus,
} from "lucide-react";

interface SavedReportsListProps {
    reports: SavedReport[];
    onSelect: (report: SavedReport) => void;
    onDelete?: (id: string) => void;
    onCreateNew?: () => void;
    loading: boolean;
    renderActions?: (report: SavedReport) => React.ReactNode;
}

const GROUPBY_LABELS: Record<string, { label: string; color: string }> = {
    department: { label: "Department", color: "bg-emerald-50 text-emerald-700" },
    status: { label: "Status", color: "bg-amber-50 text-amber-700" },
    degree: { label: "Degree", color: "bg-violet-50 text-violet-700" },
};

export function SavedReportsList({
    reports,
    onSelect,
    onDelete,
    onCreateNew,
    loading,
    renderActions,
}: SavedReportsListProps) {
    const handleDelete = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (onDelete && confirm("Are you sure you want to delete this report?")) {
            onDelete(id);
        }
    };

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className="bg-white rounded-xl border border-slate-200/80 p-5 animate-pulse"
                    >
                        <div className="h-4 bg-slate-100 rounded w-3/4 mb-3" />
                        <div className="h-3 bg-slate-100 rounded w-full mb-2" />
                        <div className="h-3 bg-slate-100 rounded w-1/2" />
                    </div>
                ))}
            </div>
        );
    }

    if (reports.length === 0) {
        return (
            <div className="bg-white rounded-xl border border-slate-200/80 flex flex-col items-center justify-center py-20 text-center">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-5">
                    <FileSearch className="w-7 h-7 text-slate-400" />
                </div>
                <p className="text-[15px] font-medium text-slate-600 mb-1">
                    No reports yet
                </p>
                <p className="text-[13px] text-slate-400 mb-6 max-w-xs">
                    Create your first report to start analyzing personnel data
                    across departments, statuses, and degrees.
                </p>
                {onCreateNew && (
                    <button
                        onClick={onCreateNew}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-[13px] font-medium rounded-lg hover:bg-indigo-700 active:scale-[0.98] shadow-sm transition-all"
                    >
                        <Plus className="w-4 h-4" />
                        Create First Report
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {reports.map((report) => {
                const groupInfo = GROUPBY_LABELS[report.groupBy] || {
                    label: report.groupBy,
                    color: "bg-slate-50 text-slate-600",
                };
                const date = new Date(report.createdAt).toLocaleDateString(
                    "en-US",
                    { month: "short", day: "numeric", year: "numeric" }
                );
                const totalCount = report.results.reduce(
                    (sum, r) => sum + r.value,
                    0
                );

                return (
                    <div
                        key={report.id}
                        onClick={() => onSelect(report)}
                        className="group bg-white rounded-xl border border-slate-200/80 p-5 cursor-pointer hover:border-indigo-200 hover:shadow-md hover:shadow-indigo-500/5 transition-all duration-200"
                    >
                        {/* Top row: icon + actions */}
                        <div className="flex items-start justify-between mb-3">
                            <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                                <FileBarChart className="w-[18px] h-[18px] text-indigo-600" />
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                {renderActions?.(report)}
                                {onDelete && (
                                    <button
                                        onClick={(e) => handleDelete(e, report.id)}
                                        className="w-7 h-7 rounded-md flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all"
                                        title="Delete report"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Title */}
                        <h3 className="text-[14px] font-semibold text-slate-800 mb-1 line-clamp-2 group-hover:text-indigo-700 transition-colors">
                            {report.title}
                        </h3>

                        {/* Description */}
                        {report.description && (
                            <p className="text-[12px] text-slate-400 mb-3 line-clamp-2 leading-relaxed">
                                {report.description}
                            </p>
                        )}

                        {/* Meta row */}
                        <div className="flex items-center gap-3 mt-auto pt-3 border-t border-slate-100">
                            <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold ${groupInfo.color}`}
                            >
                                <Tag className="w-2.5 h-2.5" />
                                {groupInfo.label}
                            </span>
                            <span className="flex items-center gap-1 text-[11px] text-slate-400">
                                <Calendar className="w-2.5 h-2.5" />
                                {date}
                            </span>
                            <span className="ml-auto text-[12px] font-semibold text-slate-500">
                                {totalCount.toLocaleString()}
                            </span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
