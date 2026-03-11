"use client";

import React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

/* ─── Metrics ─── */
const metrics = [
    {
        name: "PDS Completion",
        current: 82,
        target: 95,
        color: "#15803d",
        bg: "bg-green-50",
        barBg: "bg-green-100",
        barFill: "bg-green-600",
    },
    {
        name: "Training Hours",
        current: 68,
        target: 80,
        color: "#0d9488",
        bg: "bg-teal-50",
        barBg: "bg-teal-100",
        barFill: "bg-teal-500",
    },
    {
        name: "MOV Uploads",
        current: 91,
        target: 100,
        color: "#16a34a",
        bg: "bg-emerald-50",
        barBg: "bg-emerald-100",
        barFill: "bg-emerald-500",
    },
    {
        name: "Perf. Evaluation",
        current: 74,
        target: 90,
        color: "#f59e0b",
        bg: "bg-amber-50",
        barBg: "bg-amber-100",
        barFill: "bg-amber-500",
    },
];

export function ComplianceSummary() {
    const overallCurrent = Math.round(
        metrics.reduce((s, m) => s + m.current, 0) / metrics.length
    );

    return (
        <div className="bg-white rounded-xl border border-stone-200/80 p-5">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-stone-700">
                    Compliance
                </h3>
                <span className="text-[11px] font-semibold text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full">
                    Avg {overallCurrent}%
                </span>
            </div>

            {/* Progress Bars */}
            <div className="space-y-3.5">
                {metrics.map((m) => {
                    const gap = m.target - m.current;
                    const isOnTrack = gap <= 5;
                    const isClose = gap > 5 && gap <= 15;

                    return (
                        <div key={m.name}>
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-[12px] font-medium text-stone-600">
                                    {m.name}
                                </span>
                                <div className="flex items-center gap-1.5">
                                    <span className="text-[12px] font-bold text-stone-700">
                                        {m.current}%
                                    </span>
                                    <span className="text-[10px] text-stone-400">
                                        / {m.target}%
                                    </span>
                                    {isOnTrack ? (
                                        <TrendingUp className="w-3 h-3 text-green-600" />
                                    ) : isClose ? (
                                        <Minus className="w-3 h-3 text-amber-500" />
                                    ) : (
                                        <TrendingDown className="w-3 h-3 text-red-400" />
                                    )}
                                </div>
                            </div>
                            <div className={`w-full h-1.5 rounded-full ${m.barBg}`}>
                                <div
                                    className={`h-1.5 rounded-full ${m.barFill} transition-all duration-700 ease-out`}
                                    style={{ width: `${m.current}%` }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
