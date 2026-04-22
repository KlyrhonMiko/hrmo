"use client";

import React, { useEffect, useState } from "react";
import { Loader2, GraduationCap, Plus, Trash2, School, Award } from "lucide-react";
import { TabField, TabSaveBar, TabContainer, TabSelect } from "../shared/TabUI";

const EDUCATION_LEVELS = [
    { value: "Elementary", label: "Elementary" },
    { value: "Secondary", label: "Secondary" },
    { value: "Vocational/Trade", label: "Vocational/Trade" },
    { value: "College", label: "College" },
    { value: "Graduate Studies", label: "Graduate Studies" },
];

interface EducationTabProps {
    employeeNo: string;
    onSuccess: () => void;
}

interface EducationRecord {
    id?: string;
    level: string;
    school_name: string;
    degree_course?: string;
    period_from: string | null;
    period_to?: string | null;
    highest_level_attained?: string;
    year_graduated?: string;
    academic_awards?: string;
    basic_information_id?: string;
    is_deleted?: boolean;
    created_at?: string;
    updated_at?: string;
}

export default function EducationTab({ employeeNo, onSuccess }: EducationTabProps) {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showSuccess, setShowSuccess] = useState(false);

    const [education, setEducation] = useState<Partial<EducationRecord>[]>([]);

    const loadData = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/educational-backgrounds/${employeeNo}`);
            const payload = await res.json();
            if (payload.success) {
                setEducation(payload.data || []);
            }
        } catch (err) {
            console.error("Error loading education data:", err);
            setError("Failed to load educational background.");
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
            for (const item of education) {
                if (!item.level || !item.school_name || !item.period_from) {
                    setError("Please provide the Academic Level, School Name, and Period From for all records.");
                    setSaving(false);
                    return;
                }
            }

            const updates = education.map(item => {
                const data = { ...item };
                const id = data.id;
                // Cleanup internal fields
                delete data.id; delete data.basic_information_id; delete data.is_deleted; delete data.created_at; delete data.updated_at;

                // Sanitize empty strings to null for date fields
                if (data.period_from === "") data.period_from = null;
                if (data.period_to === "") data.period_to = null;

                if (id) {
                    return fetch(`/api/educational-backgrounds/${employeeNo}/${id}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(data)
                    });
                } else if (data.level && data.school_name) {
                    return fetch(`/api/educational-backgrounds/${employeeNo}`, {
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

    const addEducation = () => {
        setEducation([...education, { level: "College", school_name: "", period_from: "", degree_course: "" }]);
    };

    const removeEducation = async (idx: number, id?: string) => {
        if (id) {
            if (!confirm("Permanently delete this education record?")) return;
            try {
                const res = await fetch(`/api/educational-backgrounds/${employeeNo}/${id}`, { method: "DELETE" });
                if (!res.ok) { setError("Delete failed on server."); return; }
            } catch { setError("Network error."); return; }
        }
        setEducation(education.filter((_, i) => i !== idx));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20 text-stone-400">
                <Loader2 className="w-8 h-8 animate-spin mr-3 text-emerald-600" />
                <p>Loading Education Records...</p>
            </div>
        );
    }

    const formatDateForInput = (dateStr: string) => {
        if (!dateStr) return "";
        try {
            return new Date(dateStr).toISOString().split("T")[0];
        } catch { return ""; }
    };

    return (
        <TabContainer>
            <div className="flex-1 space-y-8">
                <div className="flex items-center justify-between px-2">
                    <div>
                        <h3 className="text-[14px] font-bold text-stone-800 uppercase tracking-tight">Academic History</h3>
                        <p className="text-[11px] text-stone-500">Manage elementary, high school, and higher education</p>
                    </div>
                    <button 
                        onClick={addEducation}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-[12px] font-bold border border-emerald-200 hover:bg-emerald-100 transition-all active:scale-95 shadow-sm"
                    >
                        <Plus className="w-4 h-4" />
                        Add Entry
                    </button>
                </div>

                <div className="space-y-6">
                    {education.map((item, idx) => (
                        <div key={idx} className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden group hover:border-emerald-600/30 transition-all relative">
                            <button 
                                onClick={() => removeEducation(idx, item.id)}
                                className="absolute top-4 right-4 p-2 rounded-lg bg-stone-50 text-stone-400 hover:bg-red-50 hover:text-red-600 transition-all shadow-sm opacity-0 group-hover:opacity-100 z-10"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>

                            <div className="px-5 py-4 bg-stone-50/50 border-b border-stone-100 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-white border border-stone-200 flex items-center justify-center shadow-sm">
                                    <School className="w-4 h-4 text-emerald-600" />
                                </div>
                                <div className="text-[13px] font-bold text-stone-700 uppercase">
                                    {item.level || "New Education Entry"}
                                </div>
                            </div>

                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <TabSelect 
                                        label="Academic Level" 
                                        value={item.level} 
                                        options={EDUCATION_LEVELS}
                                        onChange={(v) => {
                                            const newEdu = [...education];
                                            newEdu[idx].level = v;
                                            setEducation(newEdu);
                                        }} 
                                    />
                                    <TabField label="School Name" className="md:col-span-2" value={item.school_name} onChange={(v) => {
                                        const newEdu = [...education];
                                        newEdu[idx].school_name = v;
                                        setEducation(newEdu);
                                    }} />
                                    <TabField label="Degree / Course" value={item.degree_course} onChange={(v) => {
                                        const newEdu = [...education];
                                        newEdu[idx].degree_course = v;
                                        setEducation(newEdu);
                                    }} />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                                    <TabField label="Period From" type="date" value={formatDateForInput(item.period_from || "")} onChange={(v) => {
                                        const newEdu = [...education];
                                        newEdu[idx].period_from = v;
                                        setEducation(newEdu);
                                    }} />
                                    <TabField label="Period To" type="date" value={formatDateForInput(item.period_to || "")} onChange={(v) => {
                                        const newEdu = [...education];
                                        newEdu[idx].period_to = v;
                                        setEducation(newEdu);
                                    }} />
                                    <TabField label="Year Graduated" value={item.year_graduated} onChange={(v) => {
                                        const newEdu = [...education];
                                        newEdu[idx].year_graduated = v;
                                        setEducation(newEdu);
                                    }} />
                                    <TabField label="Highest Level" value={item.highest_level_attained} onChange={(v) => {
                                        const newEdu = [...education];
                                        newEdu[idx].highest_level_attained = v;
                                        setEducation(newEdu);
                                    }} />
                                </div>

                                <div className="mt-6 pt-4 border-t border-stone-100 flex items-center gap-2">
                                    <Award className="w-4 h-4 text-amber-500" />
                                    <TabField label="Scholarship / Honors Received" value={item.academic_awards} onChange={(v) => {
                                        const newEdu = [...education];
                                        newEdu[idx].academic_awards = v;
                                        setEducation(newEdu);
                                    }} className="flex-1" />
                                </div>
                            </div>
                        </div>
                    ))}

                    {education.length === 0 && (
                        <div className="text-center py-12 bg-stone-50 border-2 border-dashed border-stone-200 rounded-3xl">
                            <GraduationCap className="w-12 h-12 text-stone-200 mx-auto mb-4" />
                            <p className="text-stone-400 text-[13px] font-medium">No education records found.</p>
                            <button onClick={addEducation} className="mt-4 text-emerald-600 text-[12px] font-bold">Add your first academic record</button>
                        </div>
                    )}
                </div>
            </div>

            <TabSaveBar 
                title="Educational Background"
                subtitle="Updates degree, units earned, and graduation details."
                saving={saving}
                error={error}
                showSuccess={showSuccess}
                onSave={handleSave}
                buttonLabel="Save Education Records"
                variant="emerald"
            />
        </TabContainer>
    );
}
