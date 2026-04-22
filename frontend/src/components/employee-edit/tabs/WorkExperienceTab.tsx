"use client";

import React, { useEffect, useState } from "react";
import { Loader2, Briefcase, Plus, Trash2, Building2, DollarSign } from "lucide-react";
import { TabField, TabSaveBar, TabContainer, TabSelect } from "../shared/TabUI";

const APPOINTMENT_STATUS_OPTIONS = [
    { value: "Permanent", label: "Permanent" },
    { value: "Temporary", label: "Temporary" },
    { value: "Casual", label: "Casual" },
    { value: "Contractual", label: "Contractual" },
    { value: "Coterminous", label: "Coterminous" },
    { value: "Other", label: "Other" },
];

interface WorkExperienceTabProps {
    employeeNo: string;
    onSuccess: () => void;
}

interface WorkExperience {
    id?: string;
    position_title: string;
    department: string;
    monthly_salary: string | number;
    salary_grade: string;
    status_of_appointment: string;
    date_from: string | null;
    date_to: string | null;
    government_service: boolean;
    basic_information_id?: string;
    is_deleted?: boolean;
    created_at?: string;
    updated_at?: string;
}

export default function WorkExperienceTab({ employeeNo, onSuccess }: WorkExperienceTabProps) {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showSuccess, setShowSuccess] = useState(false);

    const [experiences, setExperiences] = useState<Partial<WorkExperience>[]>([]);

    const loadData = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/work-experience/${employeeNo}`);
            const payload = await res.json();
            if (payload.success) {
                setExperiences(payload.data || []);
            }
        } catch (err) {
            console.error("Error loading work experience data:", err);
            setError("Failed to load work experience history.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (employeeNo) {
            loadData();
        }
    }, [employeeNo]);

    const handleSave = async () => {
        setSaving(true);
        setError(null);
        try {
            // Frontend Validation
            for (const item of experiences) {
                if (!item.position_title || !item.date_from) {
                    setError("Please provide the Position Title and Start Date for all records.");
                    setSaving(false);
                    return;
                }
            }

            const updates = experiences.map(item => {
                const data = { ...item };
                const id = data.id;
                delete data.id; delete data.basic_information_id; delete data.is_deleted; delete data.created_at; delete data.updated_at;

                // Sanitize empty strings to null for date fields
                if (data.date_from === "") data.date_from = null;
                if (data.date_to === "") data.date_to = null;

                if (id) {
                    return fetch(`/api/work-experience/${employeeNo}/${id}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(data)
                    });
                } else if (data.position_title && data.department) {
                    return fetch(`/api/work-experience/${employeeNo}`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(data)
                    });
                }
                return null;
            }).filter(Boolean);

            const results = await Promise.all(updates);
            const failed = results.filter(r => !r!.ok);

            if (failed.length > 0) {
                setError(`${failed.length} record(s) failed to save.`);
            } else {
                await loadData();
                onSuccess();
                setShowSuccess(true);
                setTimeout(() => setShowSuccess(false), 3000);
            }
        } catch {
            setError("Network error occurred.");
        } finally {
            setSaving(false);
        }
    };

    const addEntry = () => {
        setExperiences([...experiences, { position_title: "", department: "", monthly_salary: "", salary_grade: "", status_of_appointment: "", date_from: "", date_to: "", government_service: false }]);
    };

    const removeEntry = async (idx: number, id?: string) => {
        if (id) {
            if (!confirm("Permanently delete this work experience record?")) return;
            try {
                const res = await fetch(`/api/work-experience/${employeeNo}/${id}`, { method: "DELETE" });
                if (!res.ok) { setError("Delete failed."); return; }
            } catch { setError("Network error."); return; }
        }
        setExperiences(experiences.filter((_, i) => i !== idx));
    };

    const formatDateForInput = (dateStr: string) => {
        if (!dateStr) return "";
        try {
            return new Date(dateStr).toISOString().split("T")[0];
        } catch { return ""; }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20 text-stone-400">
                <Loader2 className="w-8 h-8 animate-spin mr-3 text-blue-600" />
                <p>Retrieving Work History...</p>
            </div>
        );
    }

    return (
        <TabContainer>
            <div className="flex-1 space-y-8">
                <div className="flex items-center justify-between px-2">
                    <div>
                        <h3 className="text-[14px] font-bold text-stone-800 uppercase tracking-tight">Work Experience</h3>
                        <p className="text-[11px] text-stone-500">Service record and job history (Gov & Private)</p>
                    </div>
                    <button 
                        onClick={addEntry}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-xl text-[12px] font-bold border border-blue-200 hover:bg-blue-100 transition-all active:scale-95 shadow-sm"
                    >
                        <Plus className="w-4 h-4" />
                        New Work Record
                    </button>
                </div>

                <div className="space-y-6">
                    {experiences.map((item, idx) => (
                        <div key={idx} className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden group hover:border-blue-600/30 transition-all relative">
                            <button 
                                onClick={() => removeEntry(idx, item.id)}
                                className="absolute top-4 right-4 p-2 rounded-lg bg-stone-50 text-stone-400 hover:bg-red-50 hover:text-red-600 transition-all shadow-sm opacity-0 group-hover:opacity-100 z-10"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>

                            <div className="px-5 py-4 bg-stone-50/50 border-b border-stone-100 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-white border border-stone-200 flex items-center justify-center shadow-sm">
                                    <Briefcase className="w-4 h-4 text-blue-600" />
                                </div>
                                <div className="text-[13px] font-bold text-stone-700 uppercase">
                                    {item.position_title || "New Work Record"}
                                </div>
                            </div>
                            <div className="p-6">
                                <TabField label="Position Title" value={item.position_title} onChange={(v) => {
                                    const newItems = [...experiences];
                                    newItems[idx].position_title = v;
                                    setExperiences(newItems);
                                }} />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                                    <TabField label="Agency / Company" icon={Building2} value={item.department} onChange={(v) => {
                                        const newItems = [...experiences];
                                        newItems[idx].department = v;
                                        setExperiences(newItems);
                                    }} />
                                    <TabField label="Monthly Salary" icon={DollarSign} value={item.monthly_salary} onChange={(v) => {
                                        const newItems = [...experiences];
                                        newItems[idx].monthly_salary = v;
                                        setExperiences(newItems);
                                    }} />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 pt-4 border-t border-stone-100">
                                    <TabField label="Salary Grade" value={item.salary_grade} onChange={(v) => {
                                        const newItems = [...experiences];
                                        newItems[idx].salary_grade = v;
                                        setExperiences(newItems);
                                    }} />
                                    <TabSelect 
                                        label="Appointment Status" 
                                        value={item.status_of_appointment} 
                                        options={APPOINTMENT_STATUS_OPTIONS}
                                        onChange={(v) => {
                                            const newItems = [...experiences];
                                            newItems[idx].status_of_appointment = v;
                                            setExperiences(newItems);
                                        }} 
                                    />
                                    <div className="flex flex-col justify-end pb-2">
                                        <label className="flex items-center gap-2 cursor-pointer group">
                                            <input 
                                                type="checkbox" 
                                                checked={item.government_service} 
                                                onChange={e => {
                                                    const newItems = [...experiences];
                                                    newItems[idx].government_service = e.target.checked;
                                                    setExperiences(newItems);
                                                }}
                                                className="w-4 h-4 rounded border-stone-300 text-blue-600 focus:ring-blue-600/20 transition-all"
                                            />
                                            <span className="text-[12px] font-bold text-stone-600 uppercase tracking-tight">Government Service</span>
                                        </label>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-4 border-t border-stone-100">
                                    <TabField label="From" type="date" value={formatDateForInput(item.date_from || "")} onChange={(v) => {
                                        const newItems = [...experiences];
                                        newItems[idx].date_from = v;
                                        setExperiences(newItems);
                                    }} />
                                    <TabField label="To" type="date" value={formatDateForInput(item.date_to || "")} onChange={(v) => {
                                        const newItems = [...experiences];
                                        newItems[idx].date_to = v;
                                        setExperiences(newItems);
                                    }} placeholder="Present" />
                                </div>
                            </div>
                        </div>
                    ))}

                    {experiences.length === 0 && (
                        <div className="text-center py-12 bg-stone-50 border-2 border-dashed border-stone-200 rounded-3xl">
                            <Briefcase className="w-12 h-12 text-stone-200 mx-auto mb-4" />
                            <p className="text-stone-400 text-[13px] font-medium">No work experience records found.</p>
                            <button onClick={addEntry} className="mt-4 text-blue-600 text-[12px] font-bold underline decoration-dotted">Add a job history record</button>
                        </div>
                    )}
                </div>
            </div>

            <TabSaveBar 
                title="Work History Details"
                subtitle="Updates service record and compensation history."
                saving={saving}
                error={error}
                showSuccess={showSuccess}
                onSave={handleSave}
                buttonLabel="Save Work Records"
                variant="blue"
            />
        </TabContainer>
    );
}
