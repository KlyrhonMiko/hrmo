"use client";

import React, { useEffect, useState } from "react";
import { Loader2, Plus, Trash2, Zap, Award, Users } from "lucide-react";
import { TabSection, TabField, TabSaveBar, TabContainer } from "../shared/TabUI";

interface OtherInfoTabProps {
    employeeNo: string;
    onSuccess: () => void;
}

interface OtherInfoItem {
    id?: string;
    info_type: string;
    information: string;
    basic_information_id?: string;
    is_deleted?: boolean;
    created_at?: string;
    updated_at?: string;
}

export default function OtherInfoTab({ employeeNo, onSuccess }: OtherInfoTabProps) {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showSuccess, setShowSuccess] = useState(false);

    const [others, setOthers] = useState<OtherInfoItem[]>([]);

    const loadData = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/other-information/${employeeNo}`);
            const payload = await res.json();
            if (payload.success) {
                setOthers(payload.data || []);
            }
        } catch (err) {
            console.error("Error loading miscellaneous info:", err);
            setError("Failed to load miscellaneous information.");
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
            const updates = others.map(item => {
                const data = { ...item };
                const id = data.id;
                
                // Clean data for API
                delete data.id; delete data.basic_information_id; delete data.is_deleted; delete data.created_at; delete data.updated_at;

                const hasInfo = data.information && data.information.trim().length > 0;

                if (id) {
                    return fetch(`/api/other-information/${employeeNo}/${id}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(data)
                    });
                } else if (hasInfo) {
                    return fetch(`/api/other-information/${employeeNo}`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(data)
                    });
                }
                return null;
            }).filter(Boolean);

            if (others.length > 0 && updates.length === 0) {
                // User has entries but they are all empty
                setError("Please provide details for the information entries you added.");
                setSaving(false);
                return;
            }

            if (updates.length === 0) {
                onSuccess();
                setShowSuccess(true);
                setTimeout(() => setShowSuccess(false), 3000);
                setSaving(false);
                return;
            }

            const results = await Promise.all(updates);
            const failed = results.filter(r => r && !r.ok);

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

    const addEntry = (type: string) => {
        setOthers([...others, { info_type: type, information: "" }]);
    };

    const removeEntry = async (item: OtherInfoItem) => {
        const id = item.id;
        if (id) {
            if (!confirm("Permanently delete this record?")) return;
            try {
                const res = await fetch(`/api/other-information/${employeeNo}/${id}`, { method: "DELETE" });
                if (!res.ok) { setError("Delete failed."); return; }
            } catch { setError("Network error."); return; }
        }
        setOthers(prev => prev.filter(o => o !== item));
    };

    const updateItem = (itemRef: OtherInfoItem, val: string) => {
        setOthers(prev => prev.map(o => o === itemRef ? { ...o, information: val } : o));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20 text-stone-400">
                <Loader2 className="w-8 h-8 animate-spin mr-3 text-stone-600" />
                <p>Loading Miscellaneous Information...</p>
            </div>
        );
    }

    const skills = others.filter(o => o.info_type === "special_skills");
    const awards = others.filter(o => o.info_type === "non_academic_recognitions");
    const orgs = others.filter(o => o.info_type === "organization_memberships");

    return (
        <TabContainer>
            <div className="flex-1 space-y-8">
                <TabSection title="Special Skills & Hobbies" icon={Zap}>
                    <div className="space-y-4">
                        {skills.map((item, idx) => (
                            <div key={idx} className="flex gap-3 items-start group">
                                <TabField 
                                    label="" 
                                    value={item.information} 
                                    onChange={(v) => updateItem(item, v)}
                                    placeholder="e.g. Graphic Design, Playing Piano"
                                    className="flex-1"
                                />
                                <button 
                                    onClick={() => removeEntry(item)}
                                    className="p-2.5 mt-1.5 rounded-xl text-stone-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                        <button 
                            onClick={() => addEntry("special_skills")} 
                            className="bg-stone-50 border border-stone-200 border-dashed rounded-xl p-3 w-full text-[12px] font-bold text-stone-500 hover:text-stone-700 hover:bg-stone-100/50 hover:border-stone-300 transition-all flex items-center justify-center gap-2"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            Add Skill / Hobby
                        </button>
                    </div>
                </TabSection>

                <TabSection title="Non-Academic Recognitions" icon={Award}>
                    <div className="space-y-4">
                        {awards.map((item, idx) => (
                            <div key={idx} className="flex gap-3 items-start group">
                                <TabField 
                                    label="" 
                                    value={item.information} 
                                    onChange={(v) => updateItem(item, v)}
                                    placeholder="e.g. Employee of the Month, Community Service Award"
                                    className="flex-1"
                                />
                                <button 
                                    onClick={() => removeEntry(item)}
                                    className="p-2.5 mt-1.5 rounded-xl text-stone-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                        <button 
                            onClick={() => addEntry("non_academic_recognitions")} 
                            className="bg-stone-50 border border-stone-200 border-dashed rounded-xl p-3 w-full text-[12px] font-bold text-stone-500 hover:text-stone-700 hover:bg-stone-100/50 hover:border-stone-300 transition-all flex items-center justify-center gap-2"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            Add Recognition
                        </button>
                    </div>
                </TabSection>

                <TabSection title="Organization Memberships" icon={Users}>
                    <div className="space-y-4">
                        {orgs.map((item, idx) => (
                            <div key={idx} className="flex gap-3 items-start group">
                                <TabField 
                                    label="" 
                                    value={item.information} 
                                    onChange={(v) => updateItem(item, v)}
                                    placeholder="e.g. Red Cross Volunteer, Professional Association"
                                    className="flex-1"
                                />
                                <button 
                                    onClick={() => removeEntry(item)}
                                    className="p-2.5 mt-1.5 rounded-xl text-stone-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                        <button 
                            onClick={() => addEntry("organization_memberships")} 
                            className="bg-stone-50 border border-stone-200 border-dashed rounded-xl p-3 w-full text-[12px] font-bold text-stone-500 hover:text-stone-700 hover:bg-stone-100/50 hover:border-stone-300 transition-all flex items-center justify-center gap-2"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            Add Membership
                        </button>
                    </div>
                </TabSection>
            </div>

            <TabSaveBar 
                title="Other Information"
                subtitle="Updates skills, awards, and memberships."
                saving={saving}
                error={error}
                showSuccess={showSuccess}
                onSave={handleSave}
                buttonLabel="Save Miscellaneous Info"
                variant="stone"
            />
        </TabContainer>
    );
}
