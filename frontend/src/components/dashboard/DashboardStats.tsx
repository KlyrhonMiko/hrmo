"use client";

import React, { useEffect, useState } from "react";
import type { TrainingBudget } from "@/types";
import {
    Users,
    GraduationCap,
    Briefcase,
    Clock,
    ArrowUpRight,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════
   STAT CARDS
   ═══════════════════════════════════════════════════════════ */

interface StatCard {
    label: string;
    value: string;
    change: string;
    changeType: "positive" | "negative" | "neutral";
    icon: React.ReactNode;
    iconBg: string;
    iconColor: string;
}

type DashboardStatsPayload = {
    total_employees: number;
    teaching_staff: number;
    non_teaching: number;
    pending_requests: number;
    hired_this_year: number;
    teaching_pct: number;
    non_teaching_pct: number;
};

const DEFAULT_STATS: DashboardStatsPayload = {
    total_employees: 0,
    teaching_staff: 0,
    non_teaching: 0,
    pending_requests: 0,
    hired_this_year: 0,
    teaching_pct: 0,
    non_teaching_pct: 0,
};

export function DashboardStats() {
    const [stats, setStats] = useState<DashboardStatsPayload>(DEFAULT_STATS);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch("/api/dashboard/stats");
                const data = (await response.json()) as DashboardStatsPayload;
                setStats({
                    ...DEFAULT_STATS,
                    ...data,
                });
            } catch (error) {
                console.error("Failed to fetch dashboard stats:", error);
            }
        };

        fetchStats();
    }, []);

    const cards: StatCard[] = [
        {
            label: "Total Employees",
            value: String(stats.total_employees),
            change: `+${stats.hired_this_year} this year`,
            changeType: "positive",
            icon: <Users className="w-4 h-4" />,
            iconBg: "bg-green-50",
            iconColor: "text-green-700",
        },
        {
            label: "Teaching Staff",
            value: String(stats.teaching_staff),
            change: `${stats.teaching_pct}% of total`,
            changeType: "neutral",
            icon: <GraduationCap className="w-4 h-4" />,
            iconBg: "bg-teal-50",
            iconColor: "text-teal-600",
        },
        {
            label: "Non-Teaching",
            value: String(stats.non_teaching),
            change: `${stats.non_teaching_pct}% of total`,
            changeType: "neutral",
            icon: <Briefcase className="w-4 h-4" />,
            iconBg: "bg-emerald-50",
            iconColor: "text-emerald-600",
        },
        {
            label: "Pending Requests",
            value: String(stats.pending_requests),
            change: "Action needed",
            changeType: "negative",
            icon: <Clock className="w-4 h-4" />,
            iconBg: "bg-amber-50",
            iconColor: "text-amber-600",
        },
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map((stat, idx) => (
                <div
                    key={idx}
                    className="bg-white rounded-xl border border-stone-200/80 p-4 hover:shadow-sm transition-shadow duration-200"
                >
                    <div className="flex items-center gap-3">
                        <div
                            className={`w-9 h-9 rounded-lg ${stat.iconBg} ${stat.iconColor} flex items-center justify-center shrink-0`}
                        >
                            {stat.icon}
                        </div>
                        <div className="min-w-0">
                            <p className="text-[11px] text-stone-400 font-medium truncate">
                                {stat.label}
                            </p>
                            <p className="text-xl font-bold text-stone-900 leading-tight">
                                {stat.value}
                            </p>
                        </div>
                    </div>
                    <div className="mt-2.5 pt-2.5 border-t border-stone-100">
                        {stat.changeType === "positive" && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-green-700">
                                <ArrowUpRight className="w-3 h-3" />
                                {stat.change}
                            </span>
                        )}
                        {stat.changeType === "negative" && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-600">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                {stat.change}
                            </span>
                        )}
                        {stat.changeType === "neutral" && (
                            <span className="text-[11px] font-medium text-stone-400">
                                {stat.change}
                            </span>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════
   BUDGET CARD (exported separately)
   ═══════════════════════════════════════════════════════════ */

export function BudgetCard() {
    const [budget, setBudget] = useState<TrainingBudget | null>(null);

    useEffect(() => {
        const fetchBudget = async () => {
            try {
                const res = await fetch("/api/dashboard/training-budget");
                const data = await res.json();
                setBudget(data.overall);
            } catch (error) {
                console.error("Failed to fetch budget:", error);
            }
        };
        fetchBudget();
    }, []);

    const pct = budget && budget.allocated > 0
        ? Math.round((budget.utilized / budget.allocated) * 100)
        : 0;

    if (!budget) {
        return (
            <div className="bg-green-900 rounded-xl p-5 text-white animate-pulse">
                <div className="h-4 bg-green-800 rounded w-1/3 mb-3" />
                <div className="h-8 bg-green-800 rounded w-1/2" />
            </div>
        );
    }

    return (
        <div className="bg-green-900 rounded-xl p-5 text-white relative overflow-hidden">
            {/* Dot pattern */}
            <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
                    backgroundSize: "20px 20px",
                }}
            />

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-sm font-semibold text-white">
                            Education Budget
                        </h3>
                        <p className="text-[11px] text-green-300 mt-0.5">
                            FY 2026
                        </p>
                    </div>
                    <span className="text-[11px] font-medium text-green-300 bg-green-500/20 px-2.5 py-0.5 rounded-full">
                        {pct}% used
                    </span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                    <div>
                        <p className="text-[10px] uppercase tracking-wider text-green-300 font-medium">
                            Allocated
                        </p>
                        <p className="text-lg font-bold text-white mt-0.5">
                            ₱{(budget.allocated / 1000).toFixed(0)}K
                        </p>
                    </div>
                    <div>
                        <p className="text-[10px] uppercase tracking-wider text-green-300 font-medium">
                            Used
                        </p>
                        <p className="text-lg font-bold text-amber-400 mt-0.5">
                            ₱{(budget.utilized / 1000).toFixed(0)}K
                        </p>
                    </div>
                    <div>
                        <p className="text-[10px] uppercase tracking-wider text-green-300 font-medium">
                            Remaining
                        </p>
                        <p className="text-lg font-bold text-emerald-400 mt-0.5">
                            ₱{(budget.balance / 1000).toFixed(0)}K
                        </p>
                    </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-green-800 rounded-full h-1 mt-4">
                    <div
                        className="bg-gradient-to-r from-amber-400 to-amber-500 h-1 rounded-full transition-all duration-700 ease-out"
                        style={{ width: `${pct}%` }}
                    />
                </div>
            </div>
        </div>
    );
}
