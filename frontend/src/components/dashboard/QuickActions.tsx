"use client";

import React from "react";
import Link from "next/link";
import {
    UserPlus,
    FileBarChart,
    Users,
    ClipboardList,
    Wallet,
    ChevronRight,
    type LucideIcon,
} from "lucide-react";

/* ─── Action Data ─── */

interface QuickAction {
    label: string;
    description: string;
    href: string;
    icon: LucideIcon;
    color: string;
}

const actions: QuickAction[] = [
    {
        label: "Onboard",
        description: "Add new employee",
        href: "/employees/onboard",
        icon: UserPlus,
        color: "green",
    },
    {
        label: "Reports",
        description: "Generate report",
        href: "/reports",
        icon: FileBarChart,
        color: "teal",
    },
    {
        label: "Directory",
        description: "Browse employees",
        href: "/employees/directory",
        icon: Users,
        color: "emerald",
    },
    {
        label: "Training",
        description: "View requests",
        href: "/training/requests",
        icon: ClipboardList,
        color: "amber",
    },
    {
        label: "Budget",
        description: "Training budget",
        href: "/training/budget",
        icon: Wallet,
        color: "stone",
    },
];

/* ─── Color map ─── */
const colorMap: Record<string, { bg: string; text: string }> = {
    green: { bg: "bg-green-50", text: "text-green-700" },
    teal: { bg: "bg-teal-50", text: "text-teal-600" },
    emerald: { bg: "bg-emerald-50", text: "text-emerald-600" },
    amber: { bg: "bg-amber-50", text: "text-amber-600" },
    stone: { bg: "bg-stone-100", text: "text-stone-600" },
};

/* ─── Component ─── */

export function QuickActions() {
    return (
        <div className="bg-white rounded-2xl border border-stone-200/60 shadow-sm h-full flex flex-col">
            {/* Header */}
            <div className="px-6 pt-5 pb-1">
                <h3 className="text-[13px] font-semibold text-stone-800 tracking-tight">
                    Quick Actions
                </h3>
            </div>

            {/* Action list */}
            <div className="flex-1 flex flex-col px-3 pb-3">
                {actions.map((action, i) => {
                    const Icon = action.icon;
                    const colors = colorMap[action.color];
                    return (
                        <Link
                            key={action.href}
                            href={action.href}
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
                                    {action.label}
                                </p>
                                <p className="text-[10.5px] text-stone-400 truncate">
                                    {action.description}
                                </p>
                            </div>

                            {/* Chevron */}
                            <ChevronRight className="w-3.5 h-3.5 text-stone-300 group-hover:text-stone-500 group-hover:translate-x-0.5 transition-all duration-200 shrink-0" />
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
