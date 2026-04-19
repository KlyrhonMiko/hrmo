"use client";

import React, { useState, useEffect } from "react";
import { Users, Download } from "lucide-react";

const AVAILABLE_FIELDS = [
    { key: "employeeNo", label: "Employee No.", category: "Basic" },
    { key: "fullName", label: "Full Name", category: "Basic" },
    { key: "office", label: "Office / Department", category: "Basic" },
    { key: "position", label: "Position", category: "Basic" },
    { key: "salaryGrade", label: "Salary Grade", category: "Basic" },
    { key: "stepIncrement", label: "Step Increment", category: "Basic" },
    { key: "employmentStatus", label: "Employment Status", category: "Basic" },
    { key: "dateHired", label: "Date Hired", category: "Basic" },
    { key: "email", label: "Email", category: "Contact" },
    { key: "mobileNo", label: "Mobile No.", category: "Contact" },
] as const;

interface EmployeeDataExportProps {
    userRole?: string;
}

export function EmployeeDataExport({ userRole = "HR Head" }: EmployeeDataExportProps) {
    const [selectedFields, setSelectedFields] = useState<Set<string>>(
        new Set(["employeeNo", "fullName", "office", "position", "employmentStatus"])
    );
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const toggleField = (fieldKey: string) => {
        const newSelected = new Set(selectedFields);
        if (newSelected.has(fieldKey)) {
            newSelected.delete(fieldKey);
        } else {
            newSelected.add(fieldKey);
        }
        setSelectedFields(newSelected);
    };

    const selectAll = () => {
        setSelectedFields(new Set(AVAILABLE_FIELDS.map((f) => f.key)));
    };

    const clearAll = () => {
        setSelectedFields(new Set());
    };

    const exportAsCSV = async () => {
        if (selectedFields.size === 0) {
            alert("Please select at least one field to export.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/employees/directory?limit=10000`, {
                cache: "no-store",
            });
            const payload = (await response.json()) as {
                success?: boolean;
                data?: any[];
                message?: string;
            };

            if (!response.ok || !payload.success || !payload.data) {
                throw new Error(payload.message || "Failed to load employee data.");
            }

            const employees = payload.data;
            const fieldKeys = Array.from(selectedFields);
            const fieldLabels = fieldKeys.map(
                (key) => AVAILABLE_FIELDS.find((f) => f.key === key)?.label || key
            );

            // Create CSV header
            const csvHeader = fieldLabels.map((h) => `"${h}"`).join(",");

            // Create CSV rows
            const csvRows = employees.map((emp: any) =>
                fieldKeys
                    .map((key) => {
                        let value = (emp as any)[key] || "";
                        if (key === "dateHired" && value) {
                            value = new Date(value).toLocaleDateString("en-US");
                        }
                        return `"${String(value).replace(/"/g, '""')}"`;
                    })
                    .join(",")
            );

            const csvContent = [csvHeader, ...csvRows].join("\n");
            const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
            const link = document.createElement("a");
            const url = URL.createObjectURL(blob);
            link.href = url;
            link.download = `employee_data_${new Date().toISOString().split("T")[0]}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to export employee data.";
            setError(message);
            alert(message);
        } finally {
            setLoading(false);
        }
    };

    const categoryGroups = Array.from(
        new Set(AVAILABLE_FIELDS.map((f) => f.category))
    ).sort();

    return (
        <div className="bg-white rounded-xl border border-stone-200/80 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-stone-100">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-lg bg-stone-100 flex items-center justify-center">
                        <Users className="w-5 h-5 text-stone-600" />
                    </div>
                    <div>
                        <h2 className="text-base font-semibold text-stone-900">
                            Individual Employee Data Export
                        </h2>
                        <p className="text-xs text-stone-400 mt-1">
                            Select fields and export employee information as CSV
                        </p>
                    </div>
                </div>
            </div>

            {/* Field Selection */}
            <div className="p-6 border-b border-stone-100">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-stone-700">
                        Select Fields ({selectedFields.size} / {AVAILABLE_FIELDS.length})
                    </h3>
                    <div className="flex gap-2">
                        <button
                            onClick={selectAll}
                            className="text-xs font-medium text-stone-600 hover:text-stone-900 px-2 py-1 rounded hover:bg-stone-100 transition"
                        >
                            Select All
                        </button>
                        <button
                            onClick={clearAll}
                            className="text-xs font-medium text-stone-600 hover:text-stone-900 px-2 py-1 rounded hover:bg-stone-100 transition"
                        >
                            Clear All
                        </button>
                    </div>
                </div>

                <div className="space-y-3">
                    {categoryGroups.map((category) => (
                        <div key={category} className="space-y-2">
                            <h4 className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                                {category}
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {AVAILABLE_FIELDS.filter((f) => f.category === category).map(
                                    (field) => (
                                        <label
                                            key={field.key}
                                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-stone-50 transition cursor-pointer group"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedFields.has(field.key)}
                                                onChange={() => toggleField(field.key)}
                                                className="w-4 h-4 rounded border-stone-300 text-stone-600 cursor-pointer"
                                            />
                                            <span className="text-sm text-stone-700 group-hover:text-stone-900">
                                                {field.label}
                                            </span>
                                        </label>
                                    )
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {error && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-xs text-red-700">{error}</p>
                    </div>
                )}
            </div>

            {/* Export Button */}
            <div className="p-6 flex gap-3 justify-end bg-stone-50/50">
                <button
                    onClick={exportAsCSV}
                    disabled={loading || selectedFields.size === 0}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-stone-700 text-white text-sm font-medium rounded-lg hover:bg-stone-800 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none"
                >
                    {loading ? (
                        <>
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Exporting...
                        </>
                    ) : (
                        <>
                            <Download className="w-4 h-4" />
                            Export as CSV
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
