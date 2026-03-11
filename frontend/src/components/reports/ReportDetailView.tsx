"use client";

import React from "react";
import type { SavedReport } from "@/types";
import {
    ArrowLeft,
    Download,
    Calendar,
    User,
    Tag,
    BarChart3,
} from "lucide-react";

interface ReportDetailViewProps {
    report: SavedReport;
    onBack: () => void;
}

const GROUPBY_LABELS: Record<string, { label: string; color: string }> = {
    department: { label: "Department", color: "bg-emerald-50 text-emerald-700" },
    status: { label: "Employment Status", color: "bg-amber-50 text-amber-700" },
    degree: { label: "Highest Degree", color: "bg-violet-50 text-violet-700" },
};

export function ReportDetailView({ report, onBack }: ReportDetailViewProps) {
    const groupInfo = GROUPBY_LABELS[report.groupBy] || {
        label: report.groupBy,
        color: "bg-slate-50 text-slate-600",
    };
    const date = new Date(report.createdAt).toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
    });
    const totalCount = report.results.reduce((sum, r) => sum + r.value, 0);
    const maxValue = Math.max(...report.results.map((r) => r.value));

    const exportCSV = () => {
        const header = `${groupInfo.label},Headcount\n`;
        const rows = report.results
            .map((r) => `${r.group},${r.value}`)
            .join("\n");
        const csv = header + rows;
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${report.title.replace(/\s+/g, "_")}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-200">
            {/* Back / Title bar */}
            <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 border-b border-slate-100">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onBack}
                            className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4 text-slate-600" />
                        </button>
                        <div>
                            <h2 className="text-[17px] font-semibold text-slate-800">
                                {report.title}
                            </h2>
                            {report.description && (
                                <p className="text-[12px] text-slate-400 mt-0.5">
                                    {report.description}
                                </p>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={exportCSV}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 text-[13px] font-medium rounded-lg hover:bg-slate-200 transition-colors"
                    >
                        <Download className="w-3.5 h-3.5" />
                        Export CSV
                    </button>
                </div>

                {/* Meta chips */}
                <div className="flex flex-wrap items-center gap-4 px-6 py-4 bg-slate-50/50">
                    <span className="flex items-center gap-1.5 text-[12px] text-slate-500">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {date}
                    </span>
                    <span className="flex items-center gap-1.5 text-[12px] text-slate-500">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        {report.createdBy}
                    </span>
                    <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold ${groupInfo.color}`}
                    >
                        <Tag className="w-2.5 h-2.5" />
                        Grouped by {groupInfo.label}
                    </span>
                    <span className="ml-auto flex items-center gap-1.5 text-[13px] font-semibold text-slate-700">
                        <BarChart3 className="w-3.5 h-3.5 text-indigo-500" />
                        {totalCount.toLocaleString()} total
                    </span>
                </div>
            </div>

            {/* Results table */}
            <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden">
                <div className="overflow-hidden">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead>
                            <tr className="bg-slate-50">
                                <th
                                    scope="col"
                                    className="px-6 py-3.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider"
                                >
                                    {groupInfo.label}
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider"
                                >
                                    Headcount
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider w-1/3"
                                >
                                    Distribution
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {report.results.map((item, idx) => {
                                const percentage = Math.round(
                                    (item.value / totalCount) * 100
                                );
                                const barWidth = Math.round(
                                    (item.value / maxValue) * 100
                                );
                                return (
                                    <tr
                                        key={idx}
                                        className={`transition-colors hover:bg-slate-50 ${idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"}`}
                                    >
                                        <td className="px-6 py-4 text-[13px] font-medium text-slate-800">
                                            {item.group}
                                        </td>
                                        <td className="px-6 py-4 text-[13px] text-slate-600">
                                            <span className="inline-flex items-center min-w-[32px] justify-center px-2.5 py-0.5 rounded-md text-[12px] font-semibold bg-indigo-50 text-indigo-700">
                                                {item.value}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 rounded-full transition-all duration-500"
                                                        style={{
                                                            width: `${barWidth}%`,
                                                        }}
                                                    />
                                                </div>
                                                <span className="text-[11px] font-medium text-slate-400 min-w-[32px] text-right">
                                                    {percentage}%
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
