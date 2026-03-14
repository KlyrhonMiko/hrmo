"use client";

import React from "react";
import { RoleLayout } from "@/components/layout/RoleLayout";
import { DashboardStats, BudgetCard } from "@/components/dashboard/DashboardStats";
import { PersonnelCharts } from "@/components/dashboard/PersonnelCharts";
import { ComplianceSummary } from "@/components/dashboard/ComplianceSummary";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { QuickActions } from "@/components/dashboard/QuickActions";
import Link from "next/link";
import {
    UserPlus,
    ScanLine,
    FolderOpen,
    GraduationCap,
    ChevronRight,
    FileWarning,
    Clock,
    CheckCircle,
} from "lucide-react";

const pendingTasks = [
    { label: "PDS entries awaiting review", count: 8, icon: FileWarning, color: "amber" },
    { label: "Certificates pending verification", count: 14, icon: Clock, color: "blue" },
    { label: "201 files updated this week", count: 23, icon: CheckCircle, color: "green" },
];

const colorMap: Record<string, { bg: string; text: string }> = {
    amber: { bg: "bg-amber-50", text: "text-amber-700" },
    blue: { bg: "bg-blue-50", text: "text-blue-700" },
    green: { bg: "bg-green-50", text: "text-green-700" },
};

const shortcuts = [
    { label: "PDS Data Entry", description: "Add new employee record", href: "/employees/onboard", icon: UserPlus, color: "green" },
    { label: "Scan Certificates", description: "Upload MOV documents", href: "/employees/certificates", icon: ScanLine, color: "teal" },
    { label: "Employee 201", description: "Browse employee files", href: "/employees/directory", icon: FolderOpen, color: "emerald" },
    { label: "Training Records", description: "Track training data", href: "/training/tracking", icon: GraduationCap, color: "amber" },
];

const shortcutColorMap: Record<string, { bg: string; text: string }> = {
    green: { bg: "bg-green-50", text: "text-green-700" },
    teal: { bg: "bg-teal-50", text: "text-teal-600" },
    emerald: { bg: "bg-emerald-50", text: "text-emerald-600" },
    amber: { bg: "bg-amber-50", text: "text-amber-600" },
};

export default function HRRecordAsstDashboard() {
    return (
        <RoleLayout userRole="HR Record Asst">
            <div className="space-y-6 pb-8">
                <DashboardStats />

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                    {shortcuts.map((item) => {
                        const Icon = item.icon;
                        const colors = shortcutColorMap[item.color];
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="group bg-white rounded-xl border border-stone-200/80 p-4 hover:shadow-sm transition-all duration-200 flex items-center gap-3"
                            >
                                <div className={`w-10 h-10 rounded-lg ${colors.bg} ${colors.text} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[13px] font-semibold text-stone-700 group-hover:text-stone-900 truncate">{item.label}</p>
                                    <p className="text-[11px] text-stone-400 truncate">{item.description}</p>
                                </div>
                                <ChevronRight className="w-4 h-4 text-stone-300 group-hover:text-stone-500 group-hover:translate-x-0.5 transition-all shrink-0" />
                            </Link>
                        );
                    })}
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    <div className="xl:col-span-2">
                        <PersonnelCharts />
                    </div>
                    <div className="space-y-5">
                        <div className="bg-white rounded-2xl border border-stone-200/60 shadow-sm p-5">
                            <h3 className="text-[13px] font-semibold text-stone-800 tracking-tight mb-4">
                                Pending Tasks
                            </h3>
                            <div className="space-y-3">
                                {pendingTasks.map((task, idx) => {
                                    const Icon = task.icon;
                                    const colors = colorMap[task.color];
                                    return (
                                        <div key={idx} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-stone-50 transition-colors">
                                            <div className={`w-8 h-8 rounded-lg ${colors.bg} ${colors.text} flex items-center justify-center shrink-0`}>
                                                <Icon className="w-4 h-4" />
                                            </div>
                                            <p className="text-[12px] text-stone-600 flex-1">{task.label}</p>
                                            <span className={`text-[13px] font-bold ${colors.text}`}>{task.count}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        <ComplianceSummary />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <RecentActivity />
                    <QuickActions />
                </div>
            </div>
        </RoleLayout>
    );
}
