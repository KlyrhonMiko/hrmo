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
import { Users } from "lucide-react";

/* ─── Personnel Category Data (Donut) ─── */
const categoryData = [
    { name: "Teaching Staff", value: 244, color: "#3b82f6" },
    { name: "Non-Teaching", value: 103, color: "#8b5cf6" },
    { name: "Administrative", value: 34, color: "#f59e0b" },
];

/* ─── Department Breakdown Data (Bar) ─── */
const departmentData = [
    { department: "CICS", teaching: 38, nonTeaching: 12 },
    { department: "CBA", teaching: 42, nonTeaching: 14 },
    { department: "CAS", teaching: 35, nonTeaching: 10 },
    { department: "COE", teaching: 48, nonTeaching: 15 },
    { department: "CTE", teaching: 30, nonTeaching: 11 },
    { department: "CON", teaching: 28, nonTeaching: 9 },
    { department: "ADMIN", teaching: 3, nonTeaching: 12 },
    { department: "SHS", teaching: 20, nonTeaching: 8 },
];

const TOTAL = categoryData.reduce((sum, item) => sum + item.value, 0);

/* ─── Custom Tooltip for Donut ─── */
function DonutTooltip({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: { color: string } }> }) {
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
function BarTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-slate-200 px-4 py-3 text-sm">
            <p className="font-semibold text-slate-800 mb-2">{label}</p>
            {payload.map((entry, i) => (
                <div key={i} className="flex items-center gap-2 text-slate-600">
                    <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: entry.color }}
                    />
                    <span>{entry.name}:</span>
                    <span className="font-medium text-slate-800">
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
        <text
            x="50%"
            y="50%"
            textAnchor="middle"
            dominantBaseline="central"
        >
            <tspan
                x="50%"
                dy="-8"
                className="fill-slate-900 text-2xl font-bold"
            >
                {TOTAL}
            </tspan>
            <tspan
                x="50%"
                dy="22"
                className="fill-slate-400 text-[11px] font-medium"
            >
                Total
            </tspan>
        </text>
    );
}

/* ─── Custom Legend ─── */
function DonutLegend({ payload }: { payload?: Array<{ value: string; color: string }> }) {
    if (!payload) return null;
    return (
        <div className="flex flex-wrap justify-center gap-4 mt-2">
            {payload.map((entry, i) => {
                const item = categoryData[i];
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
export function PersonnelDistributionChart() {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    return (
        <div className="space-y-4">
            {/* Section Header */}
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Users className="w-[18px] h-[18px]" />
                </div>
                <div>
                    <h2 className="text-lg font-semibold text-slate-800">
                        Personnel Distribution
                    </h2>
                    <p className="text-[13px] text-slate-400 mt-0.5">
                        Workforce composition across departments
                    </p>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* ── Donut Chart Card ── */}
                <div className="bg-white rounded-xl border border-slate-200/80 p-6 hover:shadow-md transition-shadow duration-300">
                    <h3 className="text-sm font-semibold text-slate-700 mb-1">
                        By Category
                    </h3>
                    <p className="text-[12px] text-slate-400 mb-4">
                        Teaching vs Non-Teaching vs Administrative
                    </p>

                    <ResponsiveContainer width="100%" height={280}>
                        <PieChart>
                            <Pie
                                data={categoryData}
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
                                {categoryData.map((entry, index) => (
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

                {/* ── Bar Chart Card ── */}
                <div className="bg-white rounded-xl border border-slate-200/80 p-6 hover:shadow-md transition-shadow duration-300">
                    <h3 className="text-sm font-semibold text-slate-700 mb-1">
                        By Department
                    </h3>
                    <p className="text-[12px] text-slate-400 mb-4">
                        Headcount per college / unit
                    </p>

                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart
                            data={departmentData}
                            layout="vertical"
                            margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
                            barGap={2}
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
                                tick={{ fontSize: 12, fill: "#64748b", fontWeight: 500 }}
                                axisLine={false}
                                tickLine={false}
                                width={52}
                            />
                            <Tooltip
                                content={<BarTooltip />}
                                cursor={{ fill: "#f8fafc", radius: 4 }}
                                wrapperStyle={{ outline: "none" }}
                            />
                            <Bar
                                dataKey="teaching"
                                name="Teaching"
                                fill="#3b82f6"
                                radius={[0, 4, 4, 0]}
                                animationBegin={200}
                                animationDuration={600}
                            />
                            <Bar
                                dataKey="nonTeaching"
                                name="Non-Teaching"
                                fill="#8b5cf6"
                                radius={[0, 4, 4, 0]}
                                animationBegin={400}
                                animationDuration={600}
                            />
                        </BarChart>
                    </ResponsiveContainer>

                    {/* Bar legend */}
                    <div className="flex justify-center gap-6 mt-3">
                        <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                            <span className="text-xs text-slate-500 font-medium">
                                Teaching
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-violet-500" />
                            <span className="text-xs text-slate-500 font-medium">
                                Non-Teaching
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
