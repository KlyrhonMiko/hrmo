"use client";

import React from "react";
import {
    RadialBarChart,
    RadialBar,
    ResponsiveContainer,
    PolarAngleAxis,
} from "recharts";
import { ShieldCheck, TrendingUp, TrendingDown, Minus } from "lucide-react";

/* ─── Compliance Metrics ─── */
const complianceMetrics = [
    {
        name: "PDS Completion",
        current: 82,
        target: 95,
        description: "Personal Data Sheets filed",
        color: "#3b82f6",
        bgColor: "#dbeafe",
    },
    {
        name: "Training Hours",
        current: 68,
        target: 80,
        description: "Avg. hours per employee",
        color: "#8b5cf6",
        bgColor: "#ede9fe",
    },
    {
        name: "MOV Uploads",
        current: 91,
        target: 100,
        description: "Means of Verification filed",
        color: "#10b981",
        bgColor: "#d1fae5",
    },
    {
        name: "Performance Eval",
        current: 74,
        target: 90,
        description: "Evaluations submitted on time",
        color: "#f59e0b",
        bgColor: "#fef3c7",
    },
];

/* ─── Radial Gauge ─── */
function ComplianceGauge({
    metric,
}: {
    metric: (typeof complianceMetrics)[0];
}) {
    const { current, target, color, bgColor, name, description } = metric;
    const gap = target - current;
    const isOnTrack = gap <= 5;
    const isClose = gap > 5 && gap <= 15;

    const data = [{ value: current, fill: color }];

    return (
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 hover:shadow-md transition-all duration-300 group">
            {/* Gauge */}
            <div className="relative w-full h-[140px]">
                <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart
                        cx="50%"
                        cy="50%"
                        innerRadius="70%"
                        outerRadius="100%"
                        startAngle={210}
                        endAngle={-30}
                        data={data}
                        barSize={10}
                    >
                        <PolarAngleAxis
                            type="number"
                            domain={[0, 100]}
                            angleAxisId={0}
                            tick={false}
                        />
                        {/* Background track */}
                        <RadialBar
                            dataKey="value"
                            cornerRadius={8}
                            background={{ fill: bgColor }}
                            animationDuration={1000}
                            animationEasing="ease-out"
                        />
                    </RadialBarChart>
                </ResponsiveContainer>

                {/* Center percentage */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span
                        className="text-2xl font-bold"
                        style={{ color }}
                    >
                        {current}%
                    </span>
                </div>
            </div>

            {/* Info */}
            <div className="text-center mt-1">
                <h4 className="text-sm font-semibold text-slate-800">
                    {name}
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                    {description}
                </p>
            </div>

            {/* Target badge */}
            <div className="flex items-center justify-center gap-2 mt-3">
                <div className="flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 font-medium">Target</span>
                    <span className="font-bold text-slate-700">{target}%</span>
                </div>
                <div
                    className={`flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full font-medium ${isOnTrack
                            ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                            : isClose
                                ? "bg-amber-50 text-amber-600 border border-amber-100"
                                : "bg-red-50 text-red-600 border border-red-100"
                        }`}
                >
                    {isOnTrack ? (
                        <TrendingUp className="w-3 h-3" />
                    ) : isClose ? (
                        <Minus className="w-3 h-3" />
                    ) : (
                        <TrendingDown className="w-3 h-3" />
                    )}
                    {isOnTrack
                        ? "On Track"
                        : isClose
                            ? `${gap}% gap`
                            : `${gap}% behind`}
                </div>
            </div>
        </div>
    );
}

/* ─── Main Component ─── */
export function ComplianceTracker() {
    const overallCurrent = Math.round(
        complianceMetrics.reduce((sum, m) => sum + m.current, 0) /
        complianceMetrics.length
    );
    const overallTarget = Math.round(
        complianceMetrics.reduce((sum, m) => sum + m.target, 0) /
        complianceMetrics.length
    );

    return (
        <div className="space-y-4">
            {/* Section Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                        <ShieldCheck className="w-[18px] h-[18px]" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-slate-800">
                            Target Compliance
                        </h2>
                        <p className="text-[13px] text-slate-400 mt-0.5">
                            Current progress vs organizational targets
                        </p>
                    </div>
                </div>

                {/* Overall Score */}
                <div className="hidden sm:flex items-center gap-3 bg-slate-900 text-white px-4 py-2.5 rounded-xl">
                    <div className="text-right">
                        <p className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">
                            Overall
                        </p>
                        <p className="text-lg font-bold leading-tight">
                            {overallCurrent}%
                            <span className="text-[12px] font-normal text-slate-400">
                                {" "}
                                / {overallTarget}%
                            </span>
                        </p>
                    </div>
                    <div className="w-px h-8 bg-slate-700" />
                    <div
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${overallTarget - overallCurrent <= 10
                                ? "bg-emerald-500/20 text-emerald-400"
                                : "bg-amber-500/20 text-amber-400"
                            }`}
                    >
                        {overallTarget - overallCurrent <= 10
                            ? "Good"
                            : "Needs Work"}
                    </div>
                </div>
            </div>

            {/* Gauges Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {complianceMetrics.map((metric) => (
                    <ComplianceGauge key={metric.name} metric={metric} />
                ))}
            </div>
        </div>
    );
}
