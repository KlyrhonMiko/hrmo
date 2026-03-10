"use client";

import React, { useState } from "react";
import {
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts";
import { BadgeCheck } from "lucide-react";

/* ─── Employment Status Data (Donut) ─── */
const statusData = [
    { name: "Permanent", value: 198, color: "#10b981" },
    { name: "Contractual (COS)", value: 72, color: "#6366f1" },
    { name: "Job Order", value: 48, color: "#f97316" },
    { name: "Part-Time", value: 38, color: "#ec4899" },
    { name: "Probationary", value: 25, color: "#14b8a6" },
];

/* ─── Status by Department Data (Stacked Bar) ─── */
const deptStatusData = [
    { department: "CICS", permanent: 28, contractual: 10, jobOrder: 5, partTime: 4, probationary: 3 },
    { department: "CBA", permanent: 32, contractual: 12, jobOrder: 6, partTime: 4, probationary: 2 },
    { department: "CAS", permanent: 24, contractual: 9, jobOrder: 5, partTime: 4, probationary: 3 },
    { department: "COE", permanent: 36, contractual: 12, jobOrder: 8, partTime: 5, probationary: 2 },
    { department: "CTE", permanent: 22, contractual: 8, jobOrder: 5, partTime: 4, probationary: 2 },
    { department: "CON", permanent: 20, contractual: 7, jobOrder: 4, partTime: 3, probationary: 3 },
    { department: "ADMIN", permanent: 18, contractual: 6, jobOrder: 8, partTime: 6, probationary: 4 },
    { department: "SHS", permanent: 18, contractual: 8, jobOrder: 7, partTime: 8, probationary: 6 },
];

const TOTAL = statusData.reduce((sum, item) => sum + item.value, 0);

const barColors: Record<string, { color: string; label: string }> = {
    permanent: { color: "#10b981", label: "Permanent" },
    contractual: { color: "#6366f1", label: "Contractual" },
    jobOrder: { color: "#f97316", label: "Job Order" },
    partTime: { color: "#ec4899", label: "Part-Time" },
    probationary: { color: "#14b8a6", label: "Probationary" },
};

/* ─── Custom Tooltip for Donut ─── */
function DonutTooltip({
    active,
    payload,
}: {
    active?: boolean;
    payload?: Array<{ name: string; value: number; payload: { color: string } }>;
}) {
    if (!active || !payload?.length) return null;
    const { name, value, payload: item } = payload[0];
    const pct = ((value / TOTAL) * 100).toFixed(1);
    return (
        <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-slate-200 px-4 py-3 text-sm">
            <div className="flex items-center gap-2 mb-1">
                <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: item.color }}
                />
                <span className="font-semibold text-slate-800">{name}</span>
            </div>
            <p className="text-slate-600">
                {value} employees{" "}
                <span className="text-slate-400">({pct}%)</span>
            </p>
        </div>
    );
}

/* ─── Custom Tooltip for Bar ─── */
function BarTooltip({
    active,
    payload,
    label,
}: {
    active?: boolean;
    payload?: Array<{ name: string; value: number; color: string }>;
    label?: string;
}) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-slate-200 px-4 py-3 text-sm min-w-[160px]">
            <p className="font-semibold text-slate-800 mb-2">{label}</p>
            {payload.map((entry, i) => (
                <div
                    key={i}
                    className="flex items-center justify-between gap-4 text-slate-600"
                >
                    <div className="flex items-center gap-2">
                        <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-[12px]">{entry.name}</span>
                    </div>
                    <span className="font-medium text-slate-800 text-[12px]">
                        {entry.value}
                    </span>
                </div>
            ))}
        </div>
    );
}

/* ─── Custom Donut Center Label ─── */
function DonutCenterLabel() {
    return (
        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central">
            <tspan x="50%" dy="-8" className="fill-slate-900 text-2xl font-bold">
                {TOTAL}
            </tspan>
            <tspan x="50%" dy="22" className="fill-slate-400 text-[11px] font-medium">
                Total
            </tspan>
        </text>
    );
}

/* ─── Custom Legend ─── */
function DonutLegend({
    payload,
}: {
    payload?: Array<{ value: string; color: string }>;
}) {
    if (!payload) return null;
    return (
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-2">
            {payload.map((entry, i) => {
                const item = statusData[i];
                return (
                    <div key={i} className="flex items-center gap-2">
                        <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-xs text-slate-600 font-medium">
                            {entry.value}
                        </span>
                        <span className="text-xs text-slate-400">
                            ({item.value})
                        </span>
                    </div>
                );
            })}
        </div>
    );
}

/* ─── Main Component ─── */
export function EmploymentStatusChart() {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    return (
        <div className="space-y-4">
            {/* Section Header */}
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <BadgeCheck className="w-[18px] h-[18px]" />
                </div>
                <div>
                    <h2 className="text-lg font-semibold text-slate-800">
                        Employment Status Distribution
                    </h2>
                    <p className="text-[13px] text-slate-400 mt-0.5">
                        Workforce breakdown by employment type
                    </p>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* ── Donut Chart Card ── */}
                <div className="bg-white rounded-xl border border-slate-200/80 p-6 hover:shadow-md transition-shadow duration-300">
                    <h3 className="text-sm font-semibold text-slate-700 mb-1">
                        By Employment Type
                    </h3>
                    <p className="text-[12px] text-slate-400 mb-4">
                        Permanent, Contractual, Job Order, Part-Time &amp; Probationary
                    </p>

                    <ResponsiveContainer width="100%" height={280}>
                        <PieChart>
                            <Pie
                                data={statusData}
                                cx="50%"
                                cy="50%"
                                innerRadius={72}
                                outerRadius={110}
                                paddingAngle={3}
                                dataKey="value"
                                strokeWidth={0}
                                animationBegin={0}
                                animationDuration={800}
                                animationEasing="ease-out"
                                onMouseEnter={(_, index) =>
                                    setActiveIndex(index)
                                }
                                onMouseLeave={() => setActiveIndex(null)}
                            >
                                {statusData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={entry.color}
                                        opacity={
                                            activeIndex === null ||
                                                activeIndex === index
                                                ? 1
                                                : 0.4
                                        }
                                        style={{
                                            transition: "opacity 0.2s ease",
                                            filter:
                                                activeIndex === index
                                                    ? "brightness(1.1)"
                                                    : "none",
                                        }}
                                    />
                                ))}
                            </Pie>
                            <Tooltip
                                content={<DonutTooltip />}
                                wrapperStyle={{ outline: "none" }}
                            />
                            <Legend content={<DonutLegend />} />
                            <DonutCenterLabel />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* ── Stacked Bar Chart Card ── */}
                <div className="bg-white rounded-xl border border-slate-200/80 p-6 hover:shadow-md transition-shadow duration-300">
                    <h3 className="text-sm font-semibold text-slate-700 mb-1">
                        By Department
                    </h3>
                    <p className="text-[12px] text-slate-400 mb-4">
                        Employment status per college / unit
                    </p>

                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart
                            data={deptStatusData}
                            layout="vertical"
                            margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
                            barSize={14}
                        >
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="#f1f5f9"
                                horizontal={false}
                            />
                            <XAxis
                                type="number"
                                tick={{ fontSize: 11, fill: "#94a3b8" }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                dataKey="department"
                                type="category"
                                tick={{
                                    fontSize: 12,
                                    fill: "#64748b",
                                    fontWeight: 500,
                                }}
                                axisLine={false}
                                tickLine={false}
                                width={52}
                            />
                            <Tooltip
                                content={<BarTooltip />}
                                cursor={{ fill: "#f8fafc", radius: 4 }}
                                wrapperStyle={{ outline: "none" }}
                            />
                            {Object.entries(barColors).map(
                                ([key, { color }], i) => (
                                    <Bar
                                        key={key}
                                        dataKey={key}
                                        name={barColors[key].label}
                                        stackId="status"
                                        fill={color}
                                        radius={
                                            i === Object.keys(barColors).length - 1
                                                ? [0, 4, 4, 0]
                                                : [0, 0, 0, 0]
                                        }
                                        animationBegin={i * 150}
                                        animationDuration={600}
                                    />
                                )
                            )}
                        </BarChart>
                    </ResponsiveContainer>

                    {/* Bar legend */}
                    <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 mt-3">
                        {Object.entries(barColors).map(([key, { color, label }]) => (
                            <div key={key} className="flex items-center gap-2">
                                <span
                                    className="w-2.5 h-2.5 rounded-full"
                                    style={{ backgroundColor: color }}
                                />
                                <span className="text-xs text-slate-500 font-medium">
                                    {label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
