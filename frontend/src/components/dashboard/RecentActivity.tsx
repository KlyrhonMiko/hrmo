"use client";

import React from "react";
import {
    UserPlus,
    FileUp,
    GraduationCap,
    ClipboardCheck,
    Award,
    type LucideIcon,
    ArrowRight,
} from "lucide-react";

/* ─── Activity Data ─── */

interface Activity {
    id: number;
    type: "hire" | "upload" | "training" | "evaluation" | "award";
    title: string;
    description: string;
    time: string;
    icon: LucideIcon;
    color: string; // unified accent color class
}

const activities: Activity[] = [
    {
        id: 1,
        type: "hire",
        title: "New Employee Onboarded",
        description: "Maria Santos — CCS, Teaching Staff",
        time: "2h ago",
        icon: UserPlus,
        color: "green",
    },
    {
        id: 2,
        type: "upload",
        title: "MOV Documents Uploaded",
        description: "12 files uploaded by COE faculty",
        time: "4h ago",
        icon: FileUp,
        color: "teal",
    },
    {
        id: 3,
        type: "training",
        title: "Training Completed",
        description: "Leadership Seminar — 18 participants",
        time: "Yesterday",
        icon: GraduationCap,
        color: "emerald",
    },
    {
        id: 4,
        type: "evaluation",
        title: "Performance Reviews Submitted",
        description: "CBA department — 42 evaluations",
        time: "Yesterday",
        icon: ClipboardCheck,
        color: "amber",
    },
    {
        id: 5,
        type: "award",
        title: "Service Award Approved",
        description: "5 employees — 10-year service milestone",
        time: "2 days ago",
        icon: Award,
        color: "stone",
    },
];

/* ─── Color map ─── */
const colorMap: Record<string, { bg: string; text: string; dot: string }> = {
    green: { bg: "bg-green-50", text: "text-green-700", dot: "bg-green-500" },
    teal: { bg: "bg-teal-50", text: "text-teal-600", dot: "bg-teal-400" },
    emerald: { bg: "bg-emerald-50", text: "text-emerald-600", dot: "bg-emerald-400" },
    amber: { bg: "bg-amber-50", text: "text-amber-600", dot: "bg-amber-400" },
    stone: { bg: "bg-stone-100", text: "text-stone-600", dot: "bg-stone-400" },
};

/* ─── Component ─── */

export function RecentActivity() {
    return (
        <div className="bg-white rounded-2xl border border-stone-200/60 shadow-sm h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-4">
                <div className="flex items-center gap-2.5">

                    <h3 className="text-[13px] font-semibold text-stone-800 tracking-tight">
                        Recent Activity
                    </h3>
                </div>
                <button className="inline-flex items-center gap-1 text-[11px] font-medium text-green-600 hover:text-green-700 transition-colors group">
                    View all
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </button>
            </div>

            {/* Activity list */}
            <div className="flex-1 px-6 pb-5">
                <div className="space-y-0.5">
                    {activities.slice(0, 3).map((activity, idx) => {
                        const Icon = activity.icon;
                        const colors = colorMap[activity.color];
                        return (
                            <div
                                key={activity.id}
                                className="group flex items-start gap-3 py-2.5 rounded-lg hover:bg-stone-50/80 -mx-2 px-2 transition-colors cursor-default"
                            >
                                {/* Icon */}
                                <div
                                    className={`w-8 h-8 rounded-lg ${colors.bg} ${colors.text} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-200`}
                                >
                                    <Icon className="w-3.5 h-3.5" strokeWidth={2.2} />
                                </div>

                                {/* Content */}
                                <div className="min-w-0 flex-1">
                                    <p className="text-[12px] font-semibold text-stone-700 leading-tight">
                                        {activity.title}
                                    </p>
                                    <p className="text-[11px] text-stone-400 mt-0.5 truncate">
                                        {activity.description}
                                    </p>
                                </div>

                                {/* Timestamp */}
                                <span className="text-[10px] text-stone-400 font-medium shrink-0 pt-0.5">
                                    {activity.time}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
