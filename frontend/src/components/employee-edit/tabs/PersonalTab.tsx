"use client";

import React, { useEffect, useState } from "react";
import { User, Phone, MapPin, CreditCard, ShieldCheck, Loader2 } from "lucide-react";
import { TabSection, TabField, TabSaveBar, TabContainer, TabSelect } from "../shared/TabUI";

const NAME_EXTENSIONS = [
    { value: "", label: "N/A" },
    { value: "Jr.", label: "Jr." },
    { value: "Sr.", label: "Sr." },
    { value: "III", label: "III" },
    { value: "IV", label: "IV" },
    { value: "V", label: "V" },
];

const SEX_OPTIONS = [
    { value: "Male", label: "Male" },
    { value: "Female", label: "Female" },
];

const CIVIL_STATUS_OPTIONS = [
    { value: "Single", label: "Single" },
    { value: "Married", label: "Married" },
    { value: "Widowed", label: "Widowed" },
    { value: "Separated", label: "Separated" },
    { value: "Other", label: "Other" },
];

const BLOOD_TYPE_OPTIONS = [
    { value: "A+", label: "A+" }, { value: "A-", label: "A-" },
    { value: "B+", label: "B+" }, { value: "B-", label: "B-" },
    { value: "AB+", label: "AB+" }, { value: "AB-", label: "AB-" },
    { value: "O+", label: "O+" }, { value: "O-", label: "O-" },
];

const GOV_ID_TYPES = [
    { value: "Passport", label: "Passport" },
    { value: "GSIS", label: "GSIS" },
    { value: "SSS", label: "SSS" },
    { value: "PRC License", label: "PRC License" },
    { value: "Driver's License", label: "Driver's License" },
    { value: "PhilHealth", label: "PhilHealth" },
    { value: "TIN", label: "TIN" },
    { value: "Postal ID", label: "Postal ID" },
    { value: "Voter's ID", label: "Voter's ID" },
    { value: "Other", label: "Other" },
];

interface PersonalTabProps {
    employeeNo: string;
    onSuccess: () => void;
}

interface BasicInformation {
    id?: string;
    employee_id?: string;
    is_deleted?: boolean;
    created_at?: string;
    updated_at?: string;
    surname: string;
    first_name: string;
    middle_name?: string;
    name_extension?: string;
    date_of_birth: string;
    place_of_birth: string;
    sex: string;
    civil_status: string;
    citizenship: string;
    height: number;
    weight: number;
    blood_type: string;
}

interface ContactInformation {
    id?: string;
    basic_information_id?: string;
    is_deleted?: boolean;
    created_at?: string;
    updated_at?: string;
    email_address: string;
    mobile_no: string;
    telephone_no: string;
}

interface Address {
    id?: string;
    basic_information_id?: string;
    address_type?: "RESIDENTIAL" | "PERMANENT";
    is_deleted?: boolean;
    created_at?: string;
    updated_at?: string;
    house_no?: string;
    street?: string;
    subdivision_village?: string;
    barangay?: string;
    city?: string;
    province?: string;
    zip_code?: string;
}

interface GovId {
    id?: string;
    basic_information_id?: string;
    is_deleted?: boolean;
    created_at?: string;
    updated_at?: string;
    id_type?: string;
    id_value: string;
}

interface PrimaryId {
    id?: string;
    basic_information_id?: string;
    is_deleted?: boolean;
    created_at?: string;
    updated_at?: string;
    id_type?: string;
    id_number: string;
    date_of_issuance: string;
    place_of_issuance: string;
}

export default function PersonalTab({ employeeNo, onSuccess }: PersonalTabProps) {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showSuccess, setShowSuccess] = useState(false);

    // Data states
    const [basicInfo, setBasicInfo] = useState<Partial<BasicInformation>>({});
    const [contactInfo, setContactInfo] = useState<Partial<ContactInformation>>({});
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [govIds, setGovIds] = useState<GovId[]>([]);
    const [primaryId, setPrimaryId] = useState<Partial<PrimaryId>>({});

    const formatDateForInput = (dateStr: string | undefined) => {
        if (!dateStr) return "";
        try {
            return new Date(dateStr).toISOString().split("T")[0];
        } catch { return ""; }
    };

    const loadData = async () => {
        setLoading(true);
        try {
            const [basicRes, contactRes, addrRes, idsRes, primaryRes] = await Promise.all([
                fetch(`/api/basic-information/${employeeNo}`).then(r => r.json()),
                fetch(`/api/contact-information/${employeeNo}`).then(r => r.json()),
                fetch(`/api/addresses/${employeeNo}`).then(r => r.json()),
                fetch(`/api/government-ids/${employeeNo}`).then(r => r.json()),
                fetch(`/api/primary-government-ids/${employeeNo}`).then(r => r.json().catch(() => ({ data: {} })))
            ]);

            if (basicRes.success) setBasicInfo(basicRes.data);
            if (contactRes.success) setContactInfo(contactRes.data);
            if (addrRes.success) setAddresses(addrRes.data || []);
            if (idsRes.success) setGovIds(idsRes.data || []);
            if (primaryRes.success) setPrimaryId(primaryRes.data);
        } catch (err) {
            console.error("Error loading personal data:", err);
            setError("Failed to load some personal information records.");
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
            // Validation
            if (Object.keys(contactInfo).length > 0) {
                if (contactInfo.mobile_no && !contactInfo.email_address) {
                    setError("Email address is required for contact info."); setSaving(false); return;
                }
                if (!contactInfo.mobile_no && contactInfo.email_address) {
                    setError("Mobile number is required for contact info."); setSaving(false); return;
                }
            }

            const updates = [];

            // 1. Basic Info
            const basicUpdate = { ...basicInfo };
            delete basicUpdate.id; delete basicUpdate.employee_id; delete basicUpdate.is_deleted;
            updates.push(fetch(`/api/basic-information/${employeeNo}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(basicUpdate)
            }));

            // 2. Contact Info
            if (Object.keys(contactInfo).length > 0) {
                const contactUpdate = { ...contactInfo };
                const isNew = !contactUpdate.id;
                delete contactUpdate.id; delete contactUpdate.basic_information_id;
                delete contactUpdate.is_deleted; delete contactUpdate.created_at; delete contactUpdate.updated_at;
                
                updates.push(fetch(`/api/contact-information/${employeeNo}`, {
                    method: isNew ? "POST" : "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(contactUpdate)
                }));
            }
 
            // 3. Addresses
            addresses.forEach(addr => {
                const isNew = !addr.id;
                const addrUpdate = { ...addr };
                const type = addr.address_type;
                delete addrUpdate.id; delete addrUpdate.basic_information_id;
                delete addrUpdate.is_deleted; delete addrUpdate.created_at; delete addrUpdate.updated_at;
                
                if (!isNew) {
                    delete addrUpdate.address_type;
                }
 
                updates.push(fetch(isNew ? `/api/addresses/${employeeNo}` : `/api/addresses/${employeeNo}/${type}`, {
                    method: isNew ? "POST" : "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(addrUpdate)
                }));
            });
 
            // 4. Gov IDs
            govIds.forEach(id => {
                const isNew = !id.id;
                const idUpdate = { id_type: id.id_type, id_value: id.id_value };
 
                if (isNew) {
                    updates.push(fetch(`/api/government-ids/${employeeNo}`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(idUpdate)
                    }));
                } else {
                    delete idUpdate.id_type;
                    updates.push(fetch(`/api/government-ids/${employeeNo}/${id.id_type}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(idUpdate)
                    }));
                }
            });
 
            // 5. Primary ID
            if (primaryId && primaryId.id_type) {
                const pIdUpdate = { ...primaryId };
                const isNew = !pIdUpdate.id;
                delete pIdUpdate.id; delete pIdUpdate.basic_information_id;
                delete pIdUpdate.is_deleted; delete pIdUpdate.created_at; delete pIdUpdate.updated_at;
                
                updates.push(fetch(`/api/primary-government-ids/${employeeNo}`, {
                    method: isNew ? "POST" : "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(pIdUpdate)
                }));
            }

            const results = await Promise.all(updates);
            const failed = results.filter(r => !r.ok);
            
            if (failed.length > 0) {
                setError(`${failed.length} section(s) failed to update.`);
            } else {
                await loadData();
                onSuccess();
                setShowSuccess(true);
                setTimeout(() => setShowSuccess(false), 3000);
            }
        } catch {
            setError("A network error occurred while saving.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-stone-400">
                <Loader2 className="w-8 h-8 animate-spin mb-4 text-green-600" />
                <p className="text-[13px] font-medium">Synchronizing records...</p>
            </div>
        );
    }

    const residential = addresses.find(a => a.address_type === "RESIDENTIAL") || {};
    const permanent = addresses.find(a => a.address_type === "PERMANENT") || {};

    const updateAddress = (type: "RESIDENTIAL" | "PERMANENT", field: string, value: string) => {
        setAddresses(prev => {
            const index = prev.findIndex(a => a.address_type === type);
            if (index === -1) {
                return [...prev, { address_type: type, [field]: value }];
            }
            const newAddrs = [...prev];
            newAddrs[index] = { ...newAddrs[index], [field]: value };
            return newAddrs;
        });
    };

    const updateGovId = (type: string, value: string) => {
        setGovIds(prev => {
            const index = prev.findIndex(id => id.id_type === type);
            if (index === -1) {
                return [...prev, { id_type: type, id_value: value }];
            }
            const newIds = [...prev];
            newIds[index] = { ...newIds[index], id_value: value };
            return newIds;
        });
    };

    return (
        <TabContainer>
            <div className="flex-1 space-y-8">
                {/* Basic Info Section */}
                <TabSection title="Basic Information" icon={User}>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <TabField label="Surname" value={basicInfo.surname} onChange={v => setBasicInfo({ ...basicInfo, surname: v })} />
                        <TabField label="First Name" value={basicInfo.first_name} onChange={v => setBasicInfo({ ...basicInfo, first_name: v })} />
                        <TabField label="Middle Name" value={basicInfo.middle_name} onChange={v => setBasicInfo({ ...basicInfo, middle_name: v })} />
                        <TabSelect label="Extension" value={basicInfo.name_extension} options={NAME_EXTENSIONS} onChange={v => setBasicInfo({ ...basicInfo, name_extension: v })} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                        <TabField label="Birth Date" type="date" value={formatDateForInput(basicInfo.date_of_birth)} onChange={v => setBasicInfo({ ...basicInfo, date_of_birth: v })} />
                        <TabField label="Birth Place" value={basicInfo.place_of_birth} onChange={v => setBasicInfo({ ...basicInfo, place_of_birth: v })} />
                        <TabSelect label="Sex" value={basicInfo.sex} options={SEX_OPTIONS} onChange={v => setBasicInfo({ ...basicInfo, sex: v })} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4">
                        <TabSelect label="Civil Status" value={basicInfo.civil_status} options={CIVIL_STATUS_OPTIONS} onChange={v => setBasicInfo({ ...basicInfo, civil_status: v })} />
                        <TabField label="Citizenship" value={basicInfo.citizenship} onChange={v => setBasicInfo({ ...basicInfo, citizenship: v })} />
                        <TabField label="Height (m)" type="number" step="0.01" value={basicInfo.height} onChange={v => setBasicInfo({ ...basicInfo, height: parseFloat(v) })} />
                        <TabField label="Weight (kg)" type="number" step="0.1" value={basicInfo.weight} onChange={v => setBasicInfo({ ...basicInfo, weight: parseFloat(v) })} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4">
                        <TabSelect label="Blood Type" value={basicInfo.blood_type} options={BLOOD_TYPE_OPTIONS} onChange={v => setBasicInfo({ ...basicInfo, blood_type: v })} />
                    </div>
                </TabSection>

                {/* Contact Information Section */}
                <TabSection title="Contact Information" icon={Phone}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <TabField label="Email Address" value={contactInfo.email_address} onChange={v => setContactInfo({ ...contactInfo, email_address: v })} />
                        <TabField label="Mobile Number" value={contactInfo.mobile_no} onChange={v => setContactInfo({ ...contactInfo, mobile_no: v })} />
                        <TabField label="Telephone Number" value={contactInfo.telephone_no} onChange={v => setContactInfo({ ...contactInfo, telephone_no: v })} />
                    </div>
                </TabSection>

                {/* Address Sections */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <TabSection title="Residential Address" icon={MapPin}>
                        <div className="space-y-4">
                            <TabField label="House/Block/Lot No." value={residential.house_no} onChange={v => updateAddress("RESIDENTIAL", "house_no", v)} />
                            <TabField label="Street" value={residential.street} onChange={v => updateAddress("RESIDENTIAL", "street", v)} />
                            <TabField label="Subdivision/Village" value={residential.subdivision_village} onChange={v => updateAddress("RESIDENTIAL", "subdivision_village", v)} />
                            <div className="grid grid-cols-2 gap-4">
                                <TabField label="Barangay" value={residential.barangay} onChange={v => updateAddress("RESIDENTIAL", "barangay", v)} />
                                <TabField label="City/Municipality" value={residential.city} onChange={v => updateAddress("RESIDENTIAL", "city", v)} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <TabField label="Province" value={residential.province} onChange={v => updateAddress("RESIDENTIAL", "province", v)} />
                                <TabField label="Zip Code" value={residential.zip_code} onChange={v => updateAddress("RESIDENTIAL", "zip_code", v)} />
                            </div>
                        </div>
                    </TabSection>
                    <TabSection title="Permanent Address" icon={MapPin}>
                        <div className="space-y-4">
                            <TabField label="House/Block/Lot No." value={permanent.house_no} onChange={v => updateAddress("PERMANENT", "house_no", v)} />
                            <TabField label="Street" value={permanent.street} onChange={v => updateAddress("PERMANENT", "street", v)} />
                            <TabField label="Subdivision/Village" value={permanent.subdivision_village} onChange={v => updateAddress("PERMANENT", "subdivision_village", v)} />
                            <div className="grid grid-cols-2 gap-4">
                                <TabField label="Barangay" value={permanent.barangay} onChange={v => updateAddress("PERMANENT", "barangay", v)} />
                                <TabField label="City/Municipality" value={permanent.city} onChange={v => updateAddress("PERMANENT", "city", v)} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <TabField label="Province" value={permanent.province} onChange={v => updateAddress("PERMANENT", "province", v)} />
                                <TabField label="Zip Code" value={permanent.zip_code} onChange={v => updateAddress("PERMANENT", "zip_code", v)} />
                            </div>
                        </div>
                    </TabSection>
                </div>

                {/* IDs Section */}
                <TabSection title="Secondary Government IDs" icon={CreditCard}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {["GSIS", "PAG_IBIG", "PHILHEALTH", "SSS", "TIN", "AGENCY_EMPLOYEE"].map(type => {
                            const id = govIds.find(i => i.id_type === type);
                            return (
                                <TabField 
                                    key={type} 
                                    label={type.replace("_", " ")} 
                                    value={id?.id_value || ""} 
                                    onChange={v => updateGovId(type, v)} 
                                />
                            );
                        })}
                    </div>
                </TabSection>

                {/* Primary ID Section */}
                <TabSection title="Authenticated Primary ID" icon={ShieldCheck}>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <TabSelect label="ID Type" value={primaryId.id_type} options={GOV_ID_TYPES} onChange={v => setPrimaryId({ ...primaryId, id_type: v })} />
                        <TabField label="ID Number" value={primaryId.id_number} onChange={v => setPrimaryId({ ...primaryId, id_number: v })} />
                        <TabField label="Date Issued" type="date" value={formatDateForInput(primaryId.date_of_issuance)} onChange={v => setPrimaryId({ ...primaryId, date_of_issuance: v })} />
                        <TabField label="Place of Issuance" value={primaryId.place_of_issuance} onChange={v => setPrimaryId({ ...primaryId, place_of_issuance: v })} />
                    </div>
                </TabSection>
            </div>

            <TabSaveBar 
                title="Personal Information"
                subtitle="Updates Basic Info, Contacts, Addresses, and IDs."
                saving={saving}
                error={error}
                showSuccess={showSuccess}
                onSave={handleSave}
                buttonLabel="Save Personal Details"
                variant="green"
            />
        </TabContainer>
    );
}
