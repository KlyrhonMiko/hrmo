"use client";

import React, { useEffect, useState } from "react";
import { Loader2, Award, Plus, Trash2, Calendar, Hash } from "lucide-react";
import { TabField, TabSaveBar, TabContainer } from "../shared/TabUI";

interface CivilServiceTabProps {
    employeeNo: string;
    onSuccess: () => void;
}

interface CivilServiceRecord {
    id?: string;
    career_service: string;
    rating: string;
    date_of_examination: string | null;
    place_of_examination: string;
    license_no?: string;
    date_of_validity?: string | null;
    basic_information_id?: string;
    is_deleted?: boolean;
    created_at?: string;
    updated_at?: string;
}

export default function CivilServiceTab({ employeeNo, onSuccess }: CivilServiceTabProps) {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showSuccess, setShowSuccess] = useState(false);

    const [eligibilities, setEligibilities] = useState<Partial<CivilServiceRecord>[]>([]);

    const loadData = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/civil-service-eligibility/${employeeNo}`);
            const payload = await res.json();
            if (payload.success) {
                setEligibilities(payload.data || []);
            }
        } catch (err) {
            console.error("Error loading civil service data:", err);
            setError("Failed to load civil service records.");
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
            for (const item of eligibilities) {
                if (!item.career_service || !item.date_of_examination) {
                    setError("Please provide the Eligibility Title and Exam Date for all records.");
                    setSaving(false);
                    return;
                }
            }

            const updates = eligibilities.map(item => {
                const data = { ...item };
                const id = data.id;
                delete data.id; delete data.basic_information_id; delete data.is_deleted; delete data.created_at; delete data.updated_at;

                // Sanitize empty strings to null for date fields
                if (data.date_of_examination === "") data.date_of_examination = null;
                if (data.date_of_validity === "") data.date_of_validity = null;

                if (id) {
                    return fetch(`/api/civil-service-eligibility/${employeeNo}/${id}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(data)
                    });
                } else if (data.career_service) {
                    return fetch(`/api/civil-service-eligibility/${employeeNo}`, {
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
        setEligibilities([...eligibilities, { career_service: "", rating: "", date_of_examination: "", place_of_examination: "" }]);
    };

    const removeEntry = async (idx: number, id?: string) => {
        if (id) {
            if (!confirm("Permanently delete this eligibility record?")) return;
            try {
                const res = await fetch(`/api/civil-service-eligibility/${employeeNo}/${id}`, { method: "DELETE" });
                if (!res.ok) { setError("Delete failed."); return; }
            } catch { setError("Network error."); return; }
        }
        setEligibilities(eligibilities.filter((_, i) => i !== idx));
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
                <Loader2 className="w-8 h-8 animate-spin mr-3 text-amber-600" />
                <p>Syncing Eligibility Records...</p>
            </div>
        );
    }

    return (
        <TabContainer>
            <div className="flex-1 space-y-8">
                <div className="flex items-center justify-between px-2">
                    <div>
                        <h3 className="text-[14px] font-bold text-stone-800 uppercase tracking-tight">Civil Service Eligibility</h3>
                        <p className="text-[11px] text-stone-500">Professional licenses and government examinations</p>
                    </div>
                    <button 
                        onClick={addEntry}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-xl text-[12px] font-bold border border-amber-200 hover:bg-amber-100 transition-all active:scale-95 shadow-sm"
                    >
                        <Plus className="w-4 h-4" />
                        New Eligibility
                    </button>
                </div>

                <div className="space-y-6">
                    {eligibilities.map((item, idx) => (
                        <div key={idx} className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden group hover:border-amber-600/30 transition-all relative">
                            <button 
                                onClick={() => removeEntry(idx, item.id)}
                                className="absolute top-4 right-4 p-2 rounded-lg bg-stone-50 text-stone-400 hover:bg-red-50 hover:text-red-600 transition-all shadow-sm opacity-0 group-hover:opacity-100 z-10"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>

                            <div className="px-5 py-4 bg-stone-50/50 border-b border-stone-100 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-white border border-stone-200 flex items-center justify-center shadow-sm">
                                    <Award className="w-4 h-4 text-amber-600" />
                                </div>
                                <input 
                                    value={item.career_service} 
                                    onChange={e => {
                                        const newItems = [...eligibilities];
                                        newItems[idx].career_service = e.target.value;
                                        setEligibilities(newItems);
                                    }}
                                    placeholder="Eligibility Title (e.g. CS Professional)"
                                    className="bg-transparent text-[13px] font-bold text-stone-700 uppercase focus:outline-none focus:ring-0 w-full md:w-3/4 placeholder:text-stone-300"
                                />
                            </div>

                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <TabField label="Rating / Score" value={item.rating} onChange={(v) => {
                                        const newItems = [...eligibilities];
                                        newItems[idx].rating = v;
                                        setEligibilities(newItems);
                                    }} />
                                    <TabField label="Exam Date" type="date" value={formatDateForInput(item.date_of_examination || "")} onChange={(v) => {
                                        const newItems = [...eligibilities];
                                        newItems[idx].date_of_examination = v;
                                        setEligibilities(newItems);
                                    }} />
                                    <TabField label="Exam Place" value={item.place_of_examination} onChange={(v) => {
                                        const newItems = [...eligibilities];
                                        newItems[idx].place_of_examination = v;
                                        setEligibilities(newItems);
                                    }} />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-4 border-t border-stone-100">
                                    <div className="flex items-center gap-4">
                                        <Hash className="w-4 h-4 text-stone-300" />
                                        <TabField label="License Number" value={item.license_no} onChange={(v) => {
                                            const newItems = [...eligibilities];
                                            newItems[idx].license_no = v;
                                            setEligibilities(newItems);
                                        }} />
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <Calendar className="w-4 h-4 text-stone-300" />
                                        <TabField label="Date of Validity" type="date" value={formatDateForInput(item.date_of_validity || "")} onChange={(v) => {
                                            const newItems = [...eligibilities];
                                            newItems[idx].date_of_validity = v;
                                            setEligibilities(newItems);
                                        }} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {eligibilities.length === 0 && (
                        <div className="text-center py-12 bg-stone-50 border-2 border-dashed border-stone-200 rounded-3xl">
                            <Award className="w-12 h-12 text-stone-200 mx-auto mb-4" />
                            <p className="text-stone-400 text-[13px] font-medium">No eligibilities recorded.</p>
                            <button onClick={addEntry} className="mt-4 text-amber-600 text-[12px] font-bold underline decoration-dotted">Add a license or exam record</button>
                        </div>
                    )}
                </div>
            </div>

            <TabSaveBar 
                title="Eligibility Details"
                subtitle="Updates professional scores and license validity."
                saving={saving}
                error={error}
                showSuccess={showSuccess}
                onSave={handleSave}
                buttonLabel="Save Eligibility Records"
                variant="amber"
            />
        </TabContainer>
    );
}
