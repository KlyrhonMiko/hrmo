"use client";

import React, { useState, useEffect, useCallback } from "react";
import { RoleLayout } from "@/components/layout/RoleLayout";
import { SavedReportsList } from "@/components/reports/SavedReportsList";
import { CreateReportModal } from "@/components/reports/CreateReportModal";
import { ReportDetailView } from "@/components/reports/ReportDetailView";
import type { SavedReport } from "@/types";
import { Plus, FileBarChart } from "lucide-react";

export default function ReportsPage() {
    const [reports, setReports] = useState<SavedReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedReport, setSelectedReport] = useState<SavedReport | null>(
        null
    );

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

    return (
        <RoleLayout userRole="HR Head">
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
                        <button
                            onClick={() => setModalOpen(true)}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-[13px] font-medium rounded-lg hover:bg-indigo-700 active:scale-[0.98] shadow-sm transition-all"
                        >
                            <Plus className="w-4 h-4" />
                            Create Report
                        </button>
                    </div>
                )}

                {/* Content: detail view or list */}
                {selectedReport ? (
                    <ReportDetailView
                        report={selectedReport}
                        onBack={() => setSelectedReport(null)}
                    />
                ) : (
                    <SavedReportsList
                        reports={reports}
                        onSelect={setSelectedReport}
                        onDelete={handleDelete}
                        onCreateNew={() => setModalOpen(true)}
                        loading={loading}
                    />
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
