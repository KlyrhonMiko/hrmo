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

/* ═══════════════════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════════════════ */

const categoryData = [
    { name: "Teaching Staff", value: 244, color: "#1e6b45" },
    { name: "Non-Teaching", value: 103, color: "#3b82f6" },
    { name: "Administrative", value: 34, color: "#94a3b8" },
];

const statusData = [
    { name: "Permanent", value: 198, color: "#10b981" },
    { name: "Contractual", value: 72, color: "#6366f1" },
    { name: "Job Order", value: 48, color: "#f59e0b" },
    { name: "Part-Time", value: 38, color: "#94a3b8" },
    { name: "Probationary", value: 25, color: "#06b6d4" },
];

const departmentData = [
    { department: "CCS", teaching: 38, nonTeaching: 12 },
    { department: "CBA", teaching: 42, nonTeaching: 14 },
    { department: "CAS", teaching: 35, nonTeaching: 10 },
    { department: "COE", teaching: 48, nonTeaching: 15 },
    { department: "CIHM", teaching: 25, nonTeaching: 8 },
    { department: "COED", teaching: 32, nonTeaching: 10 },
    { department: "CON", teaching: 28, nonTeaching: 9 },
];

const deptStatusData = [
    { department: "CCS", permanent: 28, contractual: 10, jobOrder: 5, partTime: 4, probationary: 3 },
    { department: "CBA", permanent: 32, contractual: 12, jobOrder: 6, partTime: 4, probationary: 2 },
    { department: "CAS", permanent: 24, contractual: 9, jobOrder: 5, partTime: 4, probationary: 3 },
    { department: "COE", permanent: 36, contractual: 12, jobOrder: 8, partTime: 5, probationary: 2 },
    { department: "CIHM", permanent: 18, contractual: 7, jobOrder: 4, partTime: 3, probationary: 3 },
    { department: "COED", permanent: 22, contractual: 9, jobOrder: 5, partTime: 4, probationary: 2 },
    { department: "CON", permanent: 20, contractual: 7, jobOrder: 4, partTime: 3, probationary: 3 },
];

const statusBarColors: Record<string, { color: string; label: string }> = {
    permanent: { color: "#10b981", label: "Permanent" },
    contractual: { color: "#6366f1", label: "Contractual" },
    jobOrder: { color: "#f59e0b", label: "Job Order" },
    partTime: { color: "#94a3b8", label: "Part-Time" },
    probationary: { color: "#06b6d4", label: "Probationary" },
};

type TabKey = "category" | "status";

const CATEGORY_TOTAL = categoryData.reduce((s, i) => s + i.value, 0);
const STATUS_TOTAL = statusData.reduce((s, i) => s + i.value, 0);

/* ═══════════════════════════════════════════════════════════
   SHARED TOOLTIP
   ═══════════════════════════════════════════════════════════ */

function ChartTooltip({
    active,
    payload,
    label,
}: {
    active?: boolean;
    payload?: Array<{ name: string; value: number; color?: string; payload?: { color: string } }>;
    label?: string;
}) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-stone-200 px-3 py-2 text-xs">
            {label && <p className="font-semibold text-stone-700 mb-1">{label}</p>}
            {payload.map((entry, i) => (
                <div key={i} className="flex items-center gap-2 text-stone-600">
                    <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: entry.color || entry.payload?.color }}
                    />
                    <span>{entry.name}:</span>
                    <span className="font-semibold text-stone-800">{entry.value}</span>
                </div>
            ))}
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════
   DONUT CENTER LABEL
   ═══════════════════════════════════════════════════════════ */

function CenterLabel({ total }: { total: number }) {
    return (
        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central">
            <tspan x="50%" dy="-6" className="fill-stone-900 text-xl font-bold">
                {total}
            </tspan>
            <tspan x="50%" dy="18" className="fill-stone-400 text-[10px] font-medium">
                Total
            </tspan>
        </text>
    );
}

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════ */

export function PersonnelCharts() {
    const [tab, setTab] = useState<TabKey>("category");
    const [hovered, setHovered] = useState<number | null>(null);

    const isCategory = tab === "category";
    const donutData = isCategory ? categoryData : statusData;
    const total = isCategory ? CATEGORY_TOTAL : STATUS_TOTAL;

    return (
        <div className="bg-white rounded-xl border border-stone-200/80 overflow-hidden">
            {/* ── Tab Bar ── */}
            <div className="flex items-center border-b border-stone-100 px-5 pt-4 gap-1">
                {([
                    { key: "category" as TabKey, label: "Personnel Category" },
                    { key: "status" as TabKey, label: "Employment Status" },
                ] as const).map(({ key, label }) => (
                    <button
                        key={key}
                        onClick={() => { setTab(key); setHovered(null); }}
                        className={`
                            relative px-4 py-2 text-[13px] font-medium rounded-t-lg transition-colors
                            ${tab === key
                                ? "text-green-700 bg-green-50/60"
                                : "text-stone-400 hover:text-stone-600 hover:bg-stone-50"
                            }
                        `}
                    >
                        {label}
                        {tab === key && (
                            <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-green-700 rounded-full" />
                        )}
                    </button>
                ))}
            </div>

            {/* ── Charts ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 divide-x divide-stone-100">
                {/* Donut */}
                <div className="p-5">
                    <p className="text-xs font-medium text-stone-400 mb-3">
                        {isCategory ? "By Category" : "By Type"}
                    </p>
                    <ResponsiveContainer width="100%" height={240}>
                        <PieChart>
                            <Pie
                                data={donutData}
                                cx="50%"
                                cy="50%"
                                innerRadius={62}
                                outerRadius={95}
                                paddingAngle={3}
                                dataKey="value"
                                strokeWidth={0}
                                animationDuration={600}
                                onMouseEnter={(_, i) => setHovered(i)}
                                onMouseLeave={() => setHovered(null)}
                            >
                                {donutData.map((entry, i) => (
                                    <Cell
                                        key={i}
                                        fill={entry.color}
                                        opacity={hovered === null || hovered === i ? 1 : 0.35}
                                        style={{ transition: "opacity 0.2s ease" }}
                                    />
                                ))}
                            </Pie>
                            <Tooltip content={<ChartTooltip />} wrapperStyle={{ outline: "none" }} />
                            <CenterLabel total={total} />
                        </PieChart>
                    </ResponsiveContainer>

                    {/* Legend */}
                    <div className="flex flex-wrap justify-center gap-3 mt-1">
                        {donutData.map((d, i) => (
                            <div key={i} className="flex items-center gap-1.5 text-[11px]">
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                                <span className="text-stone-500 font-medium">{d.name}</span>
                                <span className="text-stone-400">({d.value})</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bar */}
                <div className="p-5">
                    <p className="text-xs font-medium text-stone-400 mb-3">By Department</p>
                    <ResponsiveContainer width="100%" height={240}>
                        <BarChart
                            data={(isCategory ? departmentData : deptStatusData) as any[]}
                            layout="vertical"
                            margin={{ top: 0, right: 12, left: 0, bottom: 0 }}
                            barSize={isCategory ? undefined : 14}
                            barGap={isCategory ? 2 : undefined}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f4" horizontal={false} />
                            <XAxis type="number" tick={{ fontSize: 10, fill: "#a8a29e" }} axisLine={false} tickLine={false} />
                            <YAxis
                                dataKey="department"
                                type="category"
                                tick={{ fontSize: 11, fill: "#78716c", fontWeight: 500 }}
                                axisLine={false}
                                tickLine={false}
                                width={48}
                            />
                            <Tooltip content={<ChartTooltip />} cursor={{ fill: "#fafaf9", radius: 4 }} wrapperStyle={{ outline: "none" }} />

                            {isCategory ? (
                                <>
                                    <Bar dataKey="teaching" name="Teaching" fill="#1e6b45" radius={[0, 4, 4, 0]} animationDuration={500} />
                                    <Bar dataKey="nonTeaching" name="Non-Teaching" fill="#3b82f6" radius={[0, 4, 4, 0]} animationDuration={500} />
                                </>
                            ) : (
                                Object.entries(statusBarColors).map(([key, { color }], i) => (
                                    <Bar
                                        key={key}
                                        dataKey={key}
                                        name={statusBarColors[key].label}
                                        stackId="status"
                                        fill={color}
                                        radius={i === Object.keys(statusBarColors).length - 1 ? [0, 4, 4, 0] : [0, 0, 0, 0]}
                                        animationDuration={500}
                                    />
                                ))
                            )}
                        </BarChart>
                    </ResponsiveContainer>

                    {/* Bar Legend */}
                    <div className="flex flex-wrap justify-center gap-3 mt-2">
                        {isCategory ? (
                            <>
                                <div className="flex items-center gap-1.5 text-[11px]">
                                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "#1e6b45" }} />
                                    <span className="text-stone-500 font-medium">Teaching</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-[11px]">
                                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "#3b82f6" }} />
                                    <span className="text-stone-500 font-medium">Non-Teaching</span>
                                </div>
                            </>
                        ) : (
                            Object.entries(statusBarColors).map(([key, { color, label }]) => (
                                <div key={key} className="flex items-center gap-1.5 text-[11px]">
                                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                                    <span className="text-stone-500 font-medium">{label}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
