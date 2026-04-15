"use client";

import React, { useEffect, useState } from "react";
import {
    UserPlus,
    FileUp,
    GraduationCap,
    ClipboardCheck,
    Award,
    type LucideIcon,
    ArrowRight,
} from "lucide-react";

interface Activity {
    id: string;
    type: "hire" | "upload" | "training" | "evaluation" | "award";
    title: string;
    description: string;
    timestamp: string;
}

type ActivityPayload = {
    activities: Activity[];
};

const DEFAULT_PAYLOAD: ActivityPayload = {
    activities: [],
};

const iconMap: Record<Activity["type"], LucideIcon> = {
    hire: UserPlus,
    upload: FileUp,
    training: GraduationCap,
    evaluation: ClipboardCheck,
    award: Award,
};

/* ─── Color map ─── */
const colorMap: Record<string, { bg: string; text: string; dot: string }> = {
    green: { bg: "bg-green-50", text: "text-green-700", dot: "bg-green-500" },
    teal: { bg: "bg-teal-50", text: "text-teal-600", dot: "bg-teal-400" },
    emerald: { bg: "bg-emerald-50", text: "text-emerald-600", dot: "bg-emerald-400" },
    amber: { bg: "bg-amber-50", text: "text-amber-600", dot: "bg-amber-400" },
    stone: { bg: "bg-stone-100", text: "text-stone-600", dot: "bg-stone-400" },
};

const typeColor: Record<Activity["type"], keyof typeof colorMap> = {
    hire: "green",
    upload: "teal",
    training: "emerald",
    evaluation: "amber",
    award: "stone",
};

function toRelativeTime(timestamp: string): string {
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) {
        return "just now";
    }

    const diffMs = Date.now() - date.getTime();
    if (diffMs < 0) {
        return "just now";
    }

    const minutes = Math.floor(diffMs / 60000);
    if (minutes < 1) {
        return "just now";
    }
    if (minutes < 60) {
        return `${minutes}m ago`;
    }

    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
        return `${hours}h ago`;
    }

    const days = Math.floor(hours / 24);
    if (days === 1) {
        return "Yesterday";
    }

    return `${days}d ago`;
}

/* ─── Component ─── */

export function RecentActivity() {
    const [payload, setPayload] = useState<ActivityPayload>(DEFAULT_PAYLOAD);

    useEffect(() => {
        const fetchRecentActivity = async () => {
            try {
                const response = await fetch("/api/dashboard/recent-activity?limit=10");
                const data = (await response.json()) as ActivityPayload;
                setPayload({
                    ...DEFAULT_PAYLOAD,
                    ...data,
                });
            } catch (error) {
                console.error("Failed to fetch recent activity:", error);
            }
        };

        fetchRecentActivity();
    }, []);

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
                    {payload.activities.slice(0, 3).map((activity) => {
                        const Icon = iconMap[activity.type] || Award;
                        const colors = colorMap[typeColor[activity.type] || "stone"];
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
                                    {toRelativeTime(activity.timestamp)}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
