"use client";

import React, { useEffect, useState } from "react";
import { Loader2, BookOpen, Plus, Trash2, Clock, Award } from "lucide-react";
import { TabField, TabSaveBar, TabContainer, TabSelect } from "../shared/TabUI";

const TRAINING_TYPE_OPTIONS = [
    { value: "Managerial", label: "Managerial" },
    { value: "Supervisory", label: "Supervisory" },
    { value: "Technical", label: "Technical" },
    { value: "Foundation", label: "Foundation" },
    { value: "Other", label: "Other" },
];

interface TrainingTabProps {
    employeeNo: string;
    onSuccess: () => void;
}

interface TrainingRecord {
    id?: string;
    training_title: string;
    date_from: string | null;
    date_to: string | null;
    number_of_hours: string | number;
    training_type: string;
    conducted_by: string;
    basic_information_id?: string;
    is_deleted?: boolean;
    created_at?: string;
    updated_at?: string;
}

export default function TrainingTab({ employeeNo, onSuccess }: TrainingTabProps) {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showSuccess, setShowSuccess] = useState(false);

    const [training, setTraining] = useState<Partial<TrainingRecord>[]>([]);

    const loadData = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/training/${employeeNo}`);
            const payload = await res.json();
            if (payload.success) {
                setTraining(payload.data || []);
            }
        } catch (err) {
            console.error("Error loading training history:", err);
            setError("Failed to load training history.");
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
            for (const item of training) {
                if (!item.training_title || !item.date_from || !item.date_to) {
                    setError("Please provide the Training Title, Start Date, and End Date for all records.");
                    setSaving(false);
                    return;
                }
            }

            const updates = training.map(item => {
                const data = { ...item };
                const id = data.id;
                delete data.id; delete data.basic_information_id; delete data.is_deleted; delete data.created_at; delete data.updated_at;

                // Sanitize empty strings to null for date fields
                if (data.date_from === "") data.date_from = null;
                if (data.date_to === "") data.date_to = null;

                if (id) {
                    return fetch(`/api/training/${employeeNo}/${id}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(data)
                    });
                } else if (data.training_title) {
                    return fetch(`/api/training/${employeeNo}`, {
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
        setTraining([...training, { training_title: "", date_from: "", date_to: "", number_of_hours: "", training_type: "", conducted_by: "" }]);
    };

    const removeEntry = async (idx: number, id?: string) => {
        if (id) {
            if (!confirm("Permanently delete this training record?")) return;
            try {
                const res = await fetch(`/api/training/${employeeNo}/${id}`, { method: "DELETE" });
                if (!res.ok) { setError("Delete failed."); return; }
            } catch { setError("Network error."); return; }
        }
        setTraining(training.filter((_, i) => i !== idx));
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
                <Loader2 className="w-8 h-8 animate-spin mr-3 text-indigo-600" />
                <p>Synchronizing Learning Records...</p>
            </div>
        );
    }

    return (
        <TabContainer>
            <div className="flex-1 space-y-8">
                <div className="flex items-center justify-between px-2">
                    <div>
                        <h3 className="text-[14px] font-bold text-stone-800 uppercase tracking-tight">Learning & Development</h3>
                        <p className="text-[11px] text-stone-500">Seminars, workshops, and specialized training attended</p>
                    </div>
                    <button 
                        onClick={addEntry}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl text-[12px] font-bold border border-indigo-200 hover:bg-indigo-100 transition-all active:scale-95 shadow-sm"
                    >
                        <Plus className="w-4 h-4" />
                        Add Training
                    </button>
                </div>

                <div className="space-y-6">
                    {training.map((item, idx) => (
                        <div key={idx} className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden group hover:border-indigo-600/30 transition-all relative">
                            <button 
                                onClick={() => removeEntry(idx, item.id)}
                                className="absolute top-4 right-4 p-2 rounded-lg bg-stone-50 text-stone-400 hover:bg-red-50 hover:text-red-600 transition-all shadow-sm opacity-0 group-hover:opacity-100 z-10"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>

                            <div className="px-5 py-4 bg-stone-50/50 border-b border-stone-100 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-white border border-stone-200 flex items-center justify-center shadow-sm">
                                    <BookOpen className="w-4 h-4 text-indigo-600" />
                                </div>
                                <div className="text-[13px] font-bold text-stone-700 uppercase">
                                    {item.training_title || "New Training Record"}
                                </div>
                            </div>
                            <div className="p-6">
                                <TabField label="Training / Course Title" value={item.training_title} onChange={(v) => {
                                    const newItems = [...training];
                                    newItems[idx].training_title = v;
                                    setTraining(newItems);
                                }} />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                                    <TabField label="Conducted By" icon={Award} value={item.conducted_by} onChange={(v) => {
                                        const newItems = [...training];
                                        newItems[idx].conducted_by = v;
                                        setTraining(newItems);
                                    }} />
                                    <TabSelect 
                                        label="Training Type" 
                                        value={item.training_type} 
                                        options={TRAINING_TYPE_OPTIONS}
                                        onChange={(v) => {
                                            const newItems = [...training];
                                            newItems[idx].training_type = v;
                                            setTraining(newItems);
                                        }} 
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 pt-4 border-t border-stone-100">
                                    <TabField label="Start Date" type="date" value={formatDateForInput(item.date_from || "")} onChange={(v) => {
                                        const newItems = [...training];
                                        newItems[idx].date_from = v;
                                        setTraining(newItems);
                                    }} />
                                    <TabField label="End Date" type="date" value={formatDateForInput(item.date_to || "")} onChange={(v) => {
                                        const newItems = [...training];
                                        newItems[idx].date_to = v;
                                        setTraining(newItems);
                                    }} />
                                    <TabField label="No. of Hours" icon={Clock} value={item.number_of_hours} onChange={(v) => {
                                        const newItems = [...training];
                                        newItems[idx].number_of_hours = v;
                                        setTraining(newItems);
                                    }} />
                                </div>
                            </div>
                        </div>
                    ))}

                    {training.length === 0 && (
                        <div className="text-center py-12 bg-stone-50 border-2 border-dashed border-stone-200 rounded-3xl">
                            <BookOpen className="w-12 h-12 text-stone-200 mx-auto mb-4" />
                            <p className="text-stone-400 text-[13px] font-medium">No training records found.</p>
                            <button onClick={addEntry} className="mt-4 text-indigo-600 text-[12px] font-bold underline decoration-dotted">Add a development record</button>
                        </div>
                    )}
                </div>
            </div>

            <TabSaveBar 
                title="Training History"
                subtitle="Updates certificates and learning credit hours."
                saving={saving}
                error={error}
                showSuccess={showSuccess}
                onSave={handleSave}
                buttonLabel="Save Training Records"
                variant="indigo"
            />
        </TabContainer>
    );
}
