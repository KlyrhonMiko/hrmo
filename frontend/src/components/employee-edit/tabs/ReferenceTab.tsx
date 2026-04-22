"use client";

import React, { useEffect, useState } from "react";
import { Loader2, Plus, Trash2, User, MapPin, Phone } from "lucide-react";
import { TabField, TabSaveBar, TabContainer } from "../shared/TabUI";

interface ReferenceTabProps {
    employeeNo: string;
    onSuccess: () => void;
}

interface ReferenceRecord {
    id?: string;
    name: string;
    address: string;
    telephone_no: string;
    basic_information_id?: string;
    is_deleted?: boolean;
    created_at?: string;
    updated_at?: string;
}

export default function ReferenceTab({ employeeNo, onSuccess }: ReferenceTabProps) {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showSuccess, setShowSuccess] = useState(false);

    const [references, setReferences] = useState<Partial<ReferenceRecord>[]>([]);

    const loadData = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/reference-records/${employeeNo}`);
            const payload = await res.json();
            if (payload.success) {
                setReferences(payload.data || []);
            }
        } catch (err) {
            console.error("Error loading reference contacts:", err);
            setError("Failed to load reference contacts.");
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
            const updates = references.map(item => {
                const data = { ...item };
                const id = data.id;
                delete data.id; delete data.basic_information_id; delete data.is_deleted; delete data.created_at; delete data.updated_at;

                if (id) {
                    return fetch(`/api/reference-records/${employeeNo}/${id}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(data)
                    });
                } else if (data.name) {
                    return fetch(`/api/reference-records/${employeeNo}`, {
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
        setReferences([...references, { name: "", address: "", telephone_no: "" }]);
    };

    const removeEntry = async (idx: number, id?: string) => {
        if (id) {
            if (!confirm("Permanently delete this reference?")) return;
            try {
                const res = await fetch(`/api/reference-records/${employeeNo}/${id}`, { method: "DELETE" });
                if (!res.ok) { setError("Delete failed."); return; }
            } catch { setError("Network error."); return; }
        }
        setReferences(references.filter((_, i) => i !== idx));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20 text-stone-400">
                <Loader2 className="w-8 h-8 animate-spin mr-3 text-emerald-600" />
                <p>Establishing Reference Links...</p>
            </div>
        );
    }

    return (
        <TabContainer>
            <div className="flex-1 space-y-8">
                <div className="flex items-center justify-between px-2">
                    <div>
                        <h3 className="text-[14px] font-bold text-stone-800 uppercase tracking-tight">References</h3>
                        <p className="text-[11px] text-stone-500">Persons not related by consanguinity or affinity to the applicant</p>
                    </div>
                    <button 
                        onClick={addEntry}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-[12px] font-bold border border-emerald-200 hover:bg-emerald-100 transition-all active:scale-95 shadow-sm"
                    >
                        <Plus className="w-4 h-4" />
                        Add Reference
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {references.map((item, idx) => (
                        <div key={idx} className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden group hover:border-emerald-600/30 transition-all relative p-6">
                            <button 
                                onClick={() => removeEntry(idx, item.id)}
                                className="absolute top-4 right-4 p-2 rounded-lg bg-stone-50 text-stone-400 hover:bg-red-50 hover:text-red-600 transition-all shadow-sm opacity-0 group-hover:opacity-100 z-10"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>

                            <div className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center shadow-sm">
                                        <User className="w-4 h-4 text-emerald-700" />
                                    </div>
                                    <div className="flex-1 pt-1">
                                        <TabField label="Full Name" value={item.name} onChange={(v) => {
                                            const newItems = [...references];
                                            newItems[idx].name = v;
                                            setReferences(newItems);
                                        }} />
                                    </div>
                                </div>

                                <TabField label="Address" icon={MapPin} value={item.address} onChange={(v) => {
                                    const newItems = [...references];
                                    newItems[idx].address = v;
                                    setReferences(newItems);
                                }} />

                                <TabField label="Telephone / Contact No." icon={Phone} value={item.telephone_no} onChange={(v) => {
                                    const newItems = [...references];
                                    newItems[idx].telephone_no = v;
                                    setReferences(newItems);
                                }} />
                            </div>
                        </div>
                    ))}

                    {references.length === 0 && (
                        <div className="col-span-full text-center py-12 bg-stone-50 border-2 border-dashed border-stone-200 rounded-3xl">
                            <User className="w-12 h-12 text-stone-200 mx-auto mb-4" />
                            <p className="text-stone-400 text-[13px] font-medium">No references listed.</p>
                            <button onClick={addEntry} className="mt-4 text-emerald-600 text-[12px] font-bold underline decoration-dotted decoration-emerald-200">Add a character reference</button>
                        </div>
                    )}
                </div>
            </div>

            <TabSaveBar 
                title="Character References"
                subtitle="Updates contact info for chosen character references."
                saving={saving}
                error={error}
                showSuccess={showSuccess}
                onSave={handleSave}
                buttonLabel="Save Reference Records"
                variant="emerald"
            />
        </TabContainer>
    );
}
