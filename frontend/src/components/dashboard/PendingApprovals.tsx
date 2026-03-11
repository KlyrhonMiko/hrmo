"use client";

import React from "react";
import Link from "next/link";
import {
    GraduationCap,
    CalendarOff,
    FileText,
    ClipboardCheck,
    Clock,
    ArrowRight,
    type LucideIcon,
} from "lucide-react";

/* ─── Approval Data ─── */

interface PendingItem {
    id: number;
    label: string;
    description: string;
    count: number;
    href: string;
    icon: LucideIcon;
    color: string;
    urgentCount?: number;
}

const pendingItems: PendingItem[] = [
    {
        id: 1,
        label: "Training Requests",
        description: "Awaiting approval",
        count: 5,
        href: "/training/requests",
        icon: GraduationCap,
        color: "teal",
        urgentCount: 2,
    },
    {
        id: 2,
        label: "Leave Requests",
        description: "Pending review",
        count: 3,
        href: "/employees/leave",
        icon: CalendarOff,
        color: "amber",
        urgentCount: 1,
    },
    {
        id: 3,
        label: "Document Submissions",
        description: "MOV & PDS filings",
        count: 8,
        href: "/documents",
        icon: FileText,
        color: "green",
    },
    {
        id: 4,
        label: "Performance Reviews",
        description: "Needs evaluation",
        count: 4,
        href: "/employees/evaluations",
        icon: ClipboardCheck,
        color: "emerald",
    },
    {
        id: 5,
        label: "Overtime Claims",
        description: "Pending validation",
        count: 6,
        href: "/employees/overtime",
        icon: Clock,
        color: "indigo",
    },
];

/* ─── Color map ─── */
const colorMap: Record<string, { bg: string; text: string; badge: string }> = {
    teal: { bg: "bg-teal-50", text: "text-teal-600", badge: "bg-teal-100 text-teal-700" },
    amber: { bg: "bg-amber-50", text: "text-amber-600", badge: "bg-amber-100 text-amber-700" },
    green: { bg: "bg-green-50", text: "text-green-700", badge: "bg-green-100 text-green-800" },
    emerald: { bg: "bg-emerald-50", text: "text-emerald-600", badge: "bg-emerald-100 text-emerald-700" },
    indigo: { bg: "bg-indigo-50", text: "text-indigo-600", badge: "bg-indigo-100 text-indigo-700" },
};

/* ─── Component ─── */

export function PendingApprovals() {
    const totalPending = pendingItems.reduce((sum, item) => sum + item.count, 0);

    return (
        <div className="bg-white rounded-2xl border border-stone-200/60 shadow-sm h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-4">
                <div className="flex items-center gap-2.5">
                    <h3 className="text-[13px] font-semibold text-stone-800 tracking-tight">
                        Pending Approvals
                    </h3>
                    <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-red-50 text-red-600 text-[10px] font-bold border border-red-100">
                        {totalPending}
                    </span>
                </div>
                <Link
                    href="/approvals"
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-green-600 hover:text-green-700 transition-colors group"
                >
                    View all
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </Link>
            </div>

            {/* Approval items */}
            <div className="flex-1 px-3 pb-3">
                {pendingItems.map((item) => {
                    const Icon = item.icon;
                    const colors = colorMap[item.color];
                    return (
                        <Link
                            key={item.id}
                            href={item.href}
                            className="group flex items-center gap-3.5 px-3 py-2.5 rounded-xl hover:bg-stone-50/80 transition-all duration-200"
                        >
                            {/* Icon badge */}
                            <div
                                className={`w-9 h-9 shrink-0 rounded-lg ${colors.bg} ${colors.text} flex items-center justify-center group-hover:scale-105 transition-transform duration-200`}
                            >
                                <Icon className="w-[17px] h-[17px]" strokeWidth={2} />
                            </div>

                            {/* Text */}
                            <div className="flex-1 min-w-0">
                                <p className="text-[12.5px] font-semibold text-stone-700 group-hover:text-stone-900 transition-colors truncate">
                                    {item.label}
                                </p>
                                <p className="text-[10.5px] text-stone-400 truncate">
                                    {item.description}
                                </p>
                            </div>

                            {/* Count badge */}
                            <div className="flex items-center gap-1.5 shrink-0">
                                {item.urgentCount && (
                                    <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-red-50 text-red-600 text-[10px] font-bold border border-red-100">
                                        {item.urgentCount}!
                                    </span>
                                )}
                                <span
                                    className={`inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-lg ${colors.badge} text-[11px] font-bold`}
                                >
                                    {item.count}
                                </span>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
