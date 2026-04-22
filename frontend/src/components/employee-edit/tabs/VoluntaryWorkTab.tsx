"use client";

import React, { useEffect, useState } from "react";
import { Loader2, Heart, Plus, Trash2, MapPin, Clock, Briefcase } from "lucide-react";
import { TabField, TabSaveBar, TabContainer } from "../shared/TabUI";

interface VoluntaryWorkTabProps {
    employeeNo: string;
    onSuccess: () => void;
}

interface VoluntaryWork {
    id?: string;
    organization_name: string;
    organization_address: string;
    date_from: string | null;
    date_to: string | null;
    number_of_hours: string | number;
    position: string;
    basic_information_id?: string;
    is_deleted?: boolean;
    created_at?: string;
    updated_at?: string;
}

export default function VoluntaryWorkTab({ employeeNo, onSuccess }: VoluntaryWorkTabProps) {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showSuccess, setShowSuccess] = useState(false);

    const [voluntary, setVoluntary] = useState<Partial<VoluntaryWork>[]>([]);

    const loadData = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/voluntary-work/${employeeNo}`);
            const payload = await res.json();
            if (payload.success) {
                setVoluntary(payload.data || []);
            }
        } catch (err) {
            console.error("Error loading voluntary service data:", err);
            setError("Failed to load voluntary service records.");
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
            for (const item of voluntary) {
                if (!item.organization_name || !item.date_from) {
                    setError("Please provide the Organization Name and Start Date for all records.");
                    setSaving(false);
                    return;
                }
            }

            const updates = voluntary.map(item => {
                const data = { ...item };
                const id = data.id;
                delete data.id; delete data.basic_information_id; delete data.is_deleted; delete data.created_at; delete data.updated_at;

                // Sanitize empty strings to null for date fields
                if (data.date_from === "") data.date_from = null;
                if (data.date_to === "") data.date_to = null;

                if (id) {
                    return fetch(`/api/voluntary-work/${employeeNo}/${id}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(data)
                    });
                } else if (data.organization_name) {
                    return fetch(`/api/voluntary-work/${employeeNo}`, {
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
        setVoluntary([...voluntary, { organization_name: "", organization_address: "", date_from: "", date_to: "", number_of_hours: "", position: "" }]);
    };

    const removeEntry = async (idx: number, id?: string) => {
        if (id) {
            if (!confirm("Permanently delete this voluntary work record?")) return;
            try {
                const res = await fetch(`/api/voluntary-work/${employeeNo}/${id}`, { method: "DELETE" });
                if (!res.ok) { setError("Delete failed."); return; }
            } catch { setError("Network error."); return; }
        }
        setVoluntary(voluntary.filter((_, i) => i !== idx));
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
                <Loader2 className="w-8 h-8 animate-spin mr-3 text-red-500" />
                <p>Fetching Service Records...</p>
            </div>
        );
    }

    return (
        <TabContainer>
            <div className="flex-1 space-y-8">
                <div className="flex items-center justify-between px-2">
                    <div>
                        <h3 className="text-[14px] font-bold text-stone-800 uppercase tracking-tight">Voluntary Work</h3>
                        <p className="text-[11px] text-stone-500">Involvement in civic, non-government, or community organizations</p>
                    </div>
                    <button 
                        onClick={addEntry}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-xl text-[12px] font-bold border border-red-200 hover:bg-red-100 transition-all active:scale-95 shadow-sm"
                    >
                        <Plus className="w-4 h-4" />
                        New Entry
                    </button>
                </div>

                <div className="space-y-6">
                    {voluntary.map((item, idx) => (
                        <div key={idx} className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden group hover:border-red-600/30 transition-all relative">
                            <button 
                                onClick={() => removeEntry(idx, item.id)}
                                className="absolute top-4 right-4 p-2 rounded-lg bg-stone-50 text-stone-400 hover:bg-red-50 hover:text-red-600 transition-all shadow-sm opacity-0 group-hover:opacity-100 z-10"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>

                            <div className="px-5 py-4 bg-stone-50/50 border-b border-stone-100 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-white border border-stone-200 flex items-center justify-center shadow-sm">
                                    <Heart className="w-4 h-4 text-red-500 fill-red-500/10" />
                                </div>
                                <input 
                                    value={item.organization_name} 
                                    onChange={e => {
                                        const newItems = [...voluntary];
                                        newItems[idx].organization_name = e.target.value;
                                        setVoluntary(newItems);
                                    }}
                                    placeholder="Name of Organization"
                                    className="bg-transparent text-[13px] font-bold text-stone-700 uppercase focus:outline-none focus:ring-0 w-full md:w-3/4 placeholder:text-stone-300"
                                />
                            </div>

                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <TabField label="Org Address" icon={MapPin} value={item.organization_address} onChange={(v) => {
                                        const newItems = [...voluntary];
                                        newItems[idx].organization_address = v;
                                        setVoluntary(newItems);
                                    }} />
                                    <TabField label="Position / Nature of Work" icon={Briefcase} value={item.position} onChange={(v) => {
                                        const newItems = [...voluntary];
                                        newItems[idx].position = v;
                                        setVoluntary(newItems);
                                    }} />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 pt-4 border-t border-stone-100">
                                    <TabField label="From" type="date" value={formatDateForInput(item.date_from || "")} onChange={(v) => {
                                        const newItems = [...voluntary];
                                        newItems[idx].date_from = v;
                                        setVoluntary(newItems);
                                    }} />
                                    <TabField label="To" type="date" value={formatDateForInput(item.date_to || "")} onChange={(v) => {
                                        const newItems = [...voluntary];
                                        newItems[idx].date_to = v;
                                        setVoluntary(newItems);
                                    }} placeholder="Present" />
                                    <TabField label="No. of Hours" icon={Clock} value={item.number_of_hours} onChange={(v) => {
                                        const newItems = [...voluntary];
                                        newItems[idx].number_of_hours = v;
                                        setVoluntary(newItems);
                                    }} />
                                </div>
                            </div>
                        </div>
                    ))}

                    {voluntary.length === 0 && (
                        <div className="text-center py-12 bg-stone-50 border-2 border-dashed border-stone-200 rounded-3xl">
                            <Heart className="w-12 h-12 text-stone-200 mx-auto mb-4" />
                            <p className="text-stone-400 text-[13px] font-medium">No voluntary work records found.</p>
                            <button onClick={addEntry} className="mt-4 text-red-600 text-[12px] font-bold underline decoration-dotted font-bold">Add your first service record</button>
                        </div>
                    )}
                </div>
            </div>

            <TabSaveBar 
                title="Voluntary Service Information"
                subtitle="Updates organization involvement and service hours."
                saving={saving}
                error={error}
                showSuccess={showSuccess}
                onSave={handleSave}
                buttonLabel="Save Voluntary Work"
                variant="red"
            />
        </TabContainer>
    );
}
