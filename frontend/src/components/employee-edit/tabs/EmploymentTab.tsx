"use client";

import React, { useEffect, useState } from "react";
import { Loader2, Briefcase, Building2, DollarSign } from "lucide-react";
import { TabSection, TabField, TabSaveBar, TabContainer, TabSelect } from "../shared/TabUI";

const OFFICE_OPTIONS = [
    { value: "CCS", label: "CCS" },
    { value: "COE", label: "COE" },
    { value: "CBA", label: "CBA" },
    { value: "CHAS", label: "CHAS" },
    { value: "CAS", label: "CAS" },
    { value: "CIT", label: "CIT" },
    { value: "CCJE", label: "CCJE" },
    { value: "Admin", label: "Admin" },
    { value: "Registrar", label: "Registrar" },
    { value: "Accounting", label: "Accounting" },
    { value: "HRMO", label: "HRMO" },
    { value: "Library", label: "Library" },
    { value: "Clinic", label: "Clinic" },
    { value: "MIS", label: "MIS" },
    { value: "Other", label: "Other" },
];

const EMPLOYMENT_STATUS_OPTIONS = [
    { value: "Teaching", label: "Teaching" },
    { value: "Non-Teaching", label: "Non-Teaching" },
    { value: "COS", label: "COS" },
    { value: "Job Order", label: "Job Order" },
    { value: "Permanent", label: "Permanent" },
    { value: "Contractual", label: "Contractual" },
];

const VERIFICATION_STATUS_OPTIONS = [
    { value: "pending", label: "Pending" },
    { value: "verified", label: "Verified" },
    { value: "rejected", label: "Rejected" },
];

interface EmploymentTabProps {
    employeeNo: string;
    onSuccess: () => void;
}

interface EmployeeDetails {
    employee_no: string;
    office_department: string;
    position_title: string;
    employment_status: string;
    date_hired: string;
    salary_grade: string | number | null;
    step_increment: string | number | null;
    status: string;
}

export default function EmploymentTab({ employeeNo, onSuccess }: EmploymentTabProps) {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showSuccess, setShowSuccess] = useState(false);

    const [empDetails, setEmpDetails] = useState<Partial<EmployeeDetails>>({});

    useEffect(() => {
        async function loadData() {
            setLoading(true);
            try {
                const res = await fetch(`/api/employees/${employeeNo}`);
                const payload = await res.json();
                if (payload.success) {
                    setEmpDetails(payload.data);
                }
            } catch (err) {
                console.error("Error loading employment data:", err);
                setError("Failed to load employment record.");
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [employeeNo]);

    const handleSave = async () => {
        setSaving(true);
        setError(null);
        try {
            const update = {
                employee_no: empDetails.employee_no,
                office_department: empDetails.office_department,
                position_title: empDetails.position_title,
                employment_status: empDetails.employment_status,
                date_hired: empDetails.date_hired,
                salary_grade: empDetails.salary_grade ? parseInt(empDetails.salary_grade.toString()) : null,
                step_increment: empDetails.step_increment ? parseInt(empDetails.step_increment.toString()) : null,
                status: empDetails.status
            };

            const res = await fetch(`/api/employees/${employeeNo}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(update)
            });

            if (res.ok) {
                onSuccess();
                setShowSuccess(true);
                setTimeout(() => setShowSuccess(false), 3000);
            } else {
                const payload = await res.json();
                setError(payload.detail || "Failed to update employment record.");
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
                <Loader2 className="w-8 h-8 animate-spin mb-4 text-blue-600" />
                <p className="text-[13px] font-medium">Fetching employment data...</p>
            </div>
        );
    }

    const formatDateForInput = (dateStr: string | undefined) => {
        if (!dateStr) return "";
        try {
            return new Date(dateStr).toISOString().split("T")[0];
        } catch { return ""; }
    };

    return (
        <TabContainer>
            <div className="flex-1 space-y-8">
                <TabSection title="Position & Assignment" icon={Building2}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <TabSelect 
                            label="Office / Department" 
                            value={empDetails.office_department} 
                            options={OFFICE_OPTIONS}
                            onChange={(v: string) => setEmpDetails({ ...empDetails, office_department: v })} 
                        />
                        <TabField 
                            label="Position Title" 
                            value={empDetails.position_title} 
                            onChange={(v: string) => setEmpDetails({ ...empDetails, position_title: v })} 
                        />
                    </div>
                </TabSection>

                <TabSection title="Terms of Employment" icon={Briefcase}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <TabSelect 
                            label="Employment Status"
                            value={empDetails.employment_status || ""} 
                            options={EMPLOYMENT_STATUS_OPTIONS}
                            onChange={(v: string) => setEmpDetails({ ...empDetails, employment_status: v })}
                        />
                        <TabField 
                            label="Date Hired" 
                            type="date" 
                            value={formatDateForInput(empDetails.date_hired)} 
                            onChange={(v: string) => setEmpDetails({ ...empDetails, date_hired: v })} 
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                        <TabField 
                            label="Employee Number" 
                            value={empDetails.employee_no} 
                            onChange={(v: string) => setEmpDetails({ ...empDetails, employee_no: v })} 
                        />
                        <TabSelect 
                            label="Verification Status"
                            value={empDetails.status || "pending"} 
                            options={VERIFICATION_STATUS_OPTIONS}
                            onChange={(v: string) => setEmpDetails({ ...empDetails, status: v })}
                        />
                    </div>
                </TabSection>

                <TabSection title="Compensation Structure" icon={DollarSign}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <TabField 
                            label="Salary Grade" 
                            type="number" 
                            value={empDetails.salary_grade} 
                            onChange={(v: string) => setEmpDetails({ ...empDetails, salary_grade: v })} 
                        />
                        <TabField 
                            label="Step Increment" 
                            type="number" 
                            value={empDetails.step_increment} 
                            onChange={(v: string) => setEmpDetails({ ...empDetails, step_increment: v })} 
                        />
                    </div>
                </TabSection>
            </div>

            <TabSaveBar 
                title="Employment Details"
                subtitle="Updates core organization assignment and terms."
                saving={saving}
                error={error}
                showSuccess={showSuccess}
                onSave={handleSave}
                buttonLabel="Save Employment Settings"
                variant="blue"
            />
        </TabContainer>
    );
}
