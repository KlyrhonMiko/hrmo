"use client";

import React, { useEffect, useState } from "react";
import { Loader2, Users, Heart, UserPlus, Trash2, Baby } from "lucide-react";
import { TabSection, TabField, TabSaveBar, TabContainer } from "../shared/TabUI";

interface FamilyTabProps {
    employeeNo: string;
    onSuccess: () => void;
}

interface FamilyMember {
    id?: string;
    relationship: string;
    surname: string;
    first_name: string;
    middle_name?: string;
    name_extension?: string;
    date_of_birth?: string | null;
    occupation?: string;
    employee_business_name?: string;
    business_address?: string;
    telephone_no?: string;
    basic_information_id?: string;
    is_deleted?: boolean;
    created_at?: string;
    updated_at?: string;
}

export default function FamilyTab({ employeeNo, onSuccess }: FamilyTabProps) {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showSuccess, setShowSuccess] = useState(false);

    const [spouse, setSpouse] = useState<Partial<FamilyMember>>({});
    const [father, setFather] = useState<Partial<FamilyMember>>({});
    const [mother, setMother] = useState<Partial<FamilyMember>>({});
    const [children, setChildren] = useState<Partial<FamilyMember>[]>([]);

    const loadData = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/family-details/${employeeNo}`);
            const payload = await res.json();
            if (payload.success && Array.isArray(payload.data)) {
                const data = payload.data as FamilyMember[];
                setSpouse(data.find((f) => f.relationship === "Spouse") || { relationship: "Spouse" });
                setFather(data.find((f) => f.relationship === "Father") || { relationship: "Father" });
                setMother(data.find((f) => f.relationship === "Mother") || { relationship: "Mother" });
                setChildren(data.filter((f) => f.relationship === "Child"));
            }
        } catch (err) {
            console.error("Error loading family data:", err);
            setError("Failed to load family background.");
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
            const validates = (m: Partial<FamilyMember>, label: string) => {
                const hasData = m.surname || m.first_name || m.date_of_birth || m.occupation;
                if (hasData && (!m.surname || !m.first_name)) {
                    setError(`Please provide both Surname and First Name for ${label}.`);
                    return false;
                }
                return true;
            };

            if (!validates(spouse, "Spouse")) { setSaving(false); return; }
            if (!validates(father, "Father")) { setSaving(false); return; }
            if (!validates(mother, "Mother")) { setSaving(false); return; }

            const updates = [];
            const saveMember = (member: Partial<FamilyMember>) => {
                const data = { ...member };
                const id = data.id;
                delete data.id; delete data.basic_information_id; delete data.is_deleted; delete data.created_at; delete data.updated_at;

                if (data.date_of_birth === "") data.date_of_birth = null;

                if (id) {
                    return fetch(`/api/family-details/${employeeNo}/${id}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(data)
                    });
                } else if (data.surname && data.first_name) {
                    return fetch(`/api/family-details/${employeeNo}`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(data)
                    });
                }
                return null;
            };

            const spouseReq = saveMember(spouse); if (spouseReq) updates.push(spouseReq);
            const fatherReq = saveMember(father); if (spouseReq !== fatherReq) { // Avoid duplicates if refs are same (shouldn't happen)
                const fatherReq = saveMember(father); if (fatherReq) updates.push(fatherReq);
            }
            // Better push logic
            updates.length = 0; // Reset and do properly
            [spouse, father, mother, ...children].forEach(m => {
                const req = saveMember(m);
                if (req) updates.push(req);
            });

            if (updates.length === 0) {
                onSuccess();
                setShowSuccess(true);
                setTimeout(() => setShowSuccess(false), 3000);
                setSaving(false);
                return;
            }

            const results = await Promise.all(updates);
            const failed = results.filter(r => !r.ok);

            if (failed.length > 0) {
                setError(`${failed.length} family member(s) failed to save.`);
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

    const addChild = () => {
        setChildren([...children, { relationship: "Child", surname: "", first_name: "", date_of_birth: "" }]);
    };

    const removeChild = async (idx: number, id?: string) => {
        if (id) {
            if (!confirm("Are you sure you want to delete this child's record?")) return;
            try {
                const res = await fetch(`/api/family-details/${employeeNo}/${id}`, { method: "DELETE" });
                if (!res.ok) {
                    setError("Failed to delete record from server.");
                    return;
                }
            } catch {
                setError("Network error.");
                return;
            }
        }
        setChildren(children.filter((_, i) => i !== idx));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20 text-stone-400">
                <Loader2 className="w-8 h-8 animate-spin mr-3 text-green-600" />
                <span>Loading Family Records...</span>
            </div>
        );
    }

    const formatDateForInput = (dateStr: string) => {
        if (!dateStr) return "";
        return new Date(dateStr).toISOString().split("T")[0];
    };

    return (
        <TabContainer>
            <div className="flex-1 space-y-8">
                <TabSection title="Spouse Information" icon={Heart}>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <TabField label="Surname" value={spouse.surname} onChange={(v) => setSpouse({...spouse, surname:v})} />
                        <TabField label="First Name" value={spouse.first_name} onChange={(v) => setSpouse({...spouse, first_name:v})} />
                        <TabField label="Middle Name" value={spouse.middle_name} onChange={(v) => setSpouse({...spouse, middle_name:v})} />
                        <TabField label="Extension" value={spouse.name_extension} onChange={(v) => setSpouse({...spouse, name_extension:v})} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                        <TabField label="Occupation" value={spouse.occupation} onChange={(v) => setSpouse({...spouse, occupation:v})} />
                        <TabField label="Employer / Business" value={spouse.employee_business_name} onChange={(v) => setSpouse({...spouse, employee_business_name:v})} />
                        <TabField label="Telephone" value={spouse.telephone_no} onChange={(v) => setSpouse({...spouse, telephone_no:v})} />
                    </div>
                    <div className="pt-4">
                        <TabField label="Business Address" value={spouse.business_address} onChange={(v) => setSpouse({...spouse, business_address:v})} />
                    </div>
                </TabSection>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <TabSection title="Parents: Father" icon={Users}>
                        <div className="space-y-4">
                            <TabField label="Surname" value={father.surname} onChange={(v) => setFather({...father, surname:v})} />
                            <TabField label="First Name" value={father.first_name} onChange={(v) => setFather({...father, first_name:v})} />
                            <TabField label="Middle Name" value={father.middle_name} onChange={(v) => setFather({...father, middle_name:v})} />
                            <TabField label="Extension" value={father.name_extension} onChange={(v) => setFather({...father, name_extension:v})} />
                        </div>
                    </TabSection>
                    <TabSection title="Parents: Mother (Maiden)" icon={Users}>
                        <div className="space-y-4">
                            <TabField label="Maiden Surname" value={mother.surname} onChange={(v) => setMother({...mother, surname:v})} />
                            <TabField label="First Name" value={mother.first_name} onChange={(v) => setMother({...mother, first_name:v})} />
                            <TabField label="Middle Name" value={mother.middle_name} onChange={(v) => setMother({...mother, middle_name:v})} />
                        </div>
                    </TabSection>
                </div>

                <TabSection title="Children Records" icon={Baby}>
                    <div className="space-y-4">
                        {children.map((child, idx) => (
                            <div key={idx} className="p-4 bg-stone-50 rounded-xl border border-stone-200 flex flex-col md:flex-row gap-4 items-end group relative transition-all hover:bg-white hover:shadow-sm">
                                <button 
                                    onClick={() => removeChild(idx, child.id)}
                                    className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-red-100 text-red-600 border border-red-200 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-200 z-10"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1">
                                    <TabField label="Surname" value={child.surname} onChange={(v) => {
                                        const newChildren = [...children];
                                        newChildren[idx].surname = v;
                                        setChildren(newChildren);
                                    }} />
                                    <TabField label="First Name" value={child.first_name} onChange={(v) => {
                                        const newChildren = [...children];
                                        newChildren[idx].first_name = v;
                                        setChildren(newChildren);
                                    }} />
                                    <TabField label="Middle Name" value={child.middle_name} onChange={(v) => {
                                        const newChildren = [...children];
                                        newChildren[idx].middle_name = v;
                                        setChildren(newChildren);
                                    }} />
                                    <TabField label="Birth Date" type="date" value={formatDateForInput(child.date_of_birth || "")} onChange={(v) => {
                                        const newChildren = [...children];
                                        newChildren[idx].date_of_birth = v;
                                        setChildren(newChildren);
                                    }} />
                                </div>
                            </div>
                        ))}
                        
                        <button 
                            onClick={addChild}
                            className="w-full py-4 border-2 border-dashed border-stone-200 rounded-2xl text-stone-400 text-[13px] font-bold flex items-center justify-center gap-2 hover:border-green-600 hover:bg-green-50 hover:text-green-700 transition-all shadow-inner-sm"
                        >
                            <UserPlus className="w-4 h-4" />
                            Add New Child Record
                        </button>
                    </div>
                </TabSection>
            </div>

            <TabSaveBar 
                title="Family Background"
                subtitle="Updates spouse, parents, and children records."
                saving={saving}
                error={error}
                showSuccess={showSuccess}
                onSave={handleSave}
                buttonLabel="Save Family Details"
                variant="green"
            />
        </TabContainer>
    );
}
