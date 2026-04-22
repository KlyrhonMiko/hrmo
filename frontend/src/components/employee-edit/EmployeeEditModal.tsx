"use client";

import React, { useState } from "react";
import { X, User, Briefcase, Users, GraduationCap, Award, FileText, CheckCircle2, Info, BookOpen } from "lucide-react";
import type { Employee201 } from "@/types";

// Import individual tabs
import PersonalTab from "./tabs/PersonalTab";
import EmploymentTab from "./tabs/EmploymentTab";
import FamilyTab from "./tabs/FamilyTab";
import EducationTab from "./tabs/EducationTab";
import CivilServiceTab from "./tabs/CivilServiceTab";
import WorkExperienceTab from "./tabs/WorkExperienceTab";
import VoluntaryWorkTab from "./tabs/VoluntaryWorkTab";
import TrainingTab from "./tabs/TrainingTab";
import OtherInfoTab from "./tabs/OtherInfoTab";
import ReferenceTab from "./tabs/ReferenceTab";

export type EditTabID = 
    | "personal" 
    | "employment" 
    | "family" 
    | "education" 
    | "eligibility" 
    | "work" 
    | "voluntary" 
    | "training" 
    | "other" 
    | "references";

interface EmployeeEditModalProps {
    employee: Employee201;
    onClose: () => void;
    onSuccess: () => void;
}

export default function EmployeeEditModal({ employee, onClose, onSuccess }: EmployeeEditModalProps) {
    const [activeTab, setActiveTab] = useState<EditTabID>("personal");

    const tabs: { id: EditTabID; label: string; icon: React.ElementType }[] = [
        { id: "personal", label: "Personal", icon: User },
        { id: "employment", label: "Employment", icon: Briefcase },
        { id: "family", label: "Family", icon: Users },
        { id: "education", label: "Education", icon: GraduationCap },
        { id: "eligibility", label: "Eligibility", icon: Award },
        { id: "work", label: "Work Exp", icon: Briefcase },
        { id: "voluntary", label: "Voluntary", icon: HeartIcon }, // Custom icon handle
        { id: "training", label: "Training", icon: BookOpen },
        { id: "other", label: "Other Info", icon: Info },
        { id: "references", label: "References", icon: CheckCircle2 },
    ];

    function HeartIcon(props: React.SVGProps<SVGSVGElement>) {
        return (
            <svg
                {...props}
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            </svg>
        );
    }

    const renderTabContent = () => {
        switch (activeTab) {
            case "personal":
                return <PersonalTab employeeNo={employee.employeeNo} onSuccess={onSuccess} />;
            case "employment":
                return <EmploymentTab employeeNo={employee.employeeNo} onSuccess={onSuccess} />;
            case "family":
                return <FamilyTab employeeNo={employee.employeeNo} onSuccess={onSuccess} />;
            case "education":
                return <EducationTab employeeNo={employee.employeeNo} onSuccess={onSuccess} />;
            case "eligibility":
                return <CivilServiceTab employeeNo={employee.employeeNo} onSuccess={onSuccess} />;
            case "work":
                return <WorkExperienceTab employeeNo={employee.employeeNo} onSuccess={onSuccess} />;
            case "voluntary":
                return <VoluntaryWorkTab employeeNo={employee.employeeNo} onSuccess={onSuccess} />;
            case "training":
                return <TrainingTab employeeNo={employee.employeeNo} onSuccess={onSuccess} />;
            case "other":
                return <OtherInfoTab employeeNo={employee.employeeNo} onSuccess={onSuccess} />;
            case "references":
                return <ReferenceTab employeeNo={employee.employeeNo} onSuccess={onSuccess} />;
            default:
                return null;
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm">
            <div className="bg-white w-full max-w-6xl max-h-[95vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-stone-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50/80 backdrop-blur-md">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                            <Briefcase className="w-5 h-5 text-green-700" />
                        </div>
                        <div>
                            <h2 className="text-[16px] font-bold text-stone-900 leading-tight">Edit Personnel Record</h2>
                            <p className="text-[12px] text-stone-500">{employee.fullName} &middot; {employee.employeeNo}</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="p-2 text-stone-400 hover:text-stone-900 hover:bg-stone-200/60 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Tab Navigation */}
                <div className="flex px-4 border-b border-stone-200 bg-white overflow-x-auto no-scrollbar relative z-20">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`
                                    flex items-center gap-2.5 px-5 py-5 text-[13px] font-medium transition-all relative group
                                    ${isActive 
                                        ? "text-green-700 font-bold" 
                                        : "text-stone-500 hover:text-stone-900 hover:bg-stone-50"
                                    }
                                `}
                            >
                                <Icon className={`w-4 h-4 transition-colors ${isActive ? "text-green-700" : "text-stone-400 group-hover:text-stone-600"}`} />
                                <span className="whitespace-nowrap">{tab.label}</span>
                                {isActive && (
                                    <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-green-600 rounded-t-full" />
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto bg-stone-50/50 p-4 sm:p-8 custom-scrollbar scrollbar-gutter-stable">
                    <div className="max-w-5xl mx-auto">
                        {renderTabContent()}
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-3 border-t border-stone-200 flex items-center justify-between bg-stone-50/50">
                    <p className="text-[11px] text-stone-400 italic font-medium">
                        Changes are saved per section. Ensure you click &quot;Save&quot; before switching if you added new records.
                    </p>
                    <button 
                        onClick={onClose} 
                        className="px-5 py-2 text-[13px] font-semibold text-stone-600 hover:bg-stone-200/60 rounded-xl transition-all active:scale-95"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
