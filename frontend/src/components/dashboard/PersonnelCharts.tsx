"use client";

import React, { useEffect, useState } from "react";
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
} from "recharts";

type PieDatum = {
    key: string;
    label: string;
    value: number;
    color: string;
};

type DepartmentCategoryDatum = {
    department: string;
    teaching: number;
    nonTeaching: number;
    cos: number;
};

type DepartmentStatusDatum = {
    department: string;
    [key: string]: string | number;
};

type StatusKey = {
    key: string;
    label: string;
    color: string;
};

type PersonnelPayload = {
    category: PieDatum[];
    status: PieDatum[];
    by_department_category: DepartmentCategoryDatum[];
    by_department_status: DepartmentStatusDatum[];
    status_keys: StatusKey[];
};

const DEFAULT_PERSONNEL: PersonnelPayload = {
    category: [
        { key: "teaching", label: "Teaching Staff", value: 0, color: "#1e6b45" },
        { key: "nonTeaching", label: "Non-Teaching", value: 0, color: "#3b82f6" },
        { key: "cos", label: "COS", value: 0, color: "#94a3b8" },
    ],
    status: [],
    by_department_category: [],
    by_department_status: [],
    status_keys: [],
};

type TabKey = "category" | "status";

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
    const [personnelData, setPersonnelData] = useState<PersonnelPayload>(DEFAULT_PERSONNEL);
    const [tab, setTab] = useState<TabKey>("category");
    const [hovered, setHovered] = useState<number | null>(null);

    useEffect(() => {
        const fetchPersonnelData = async () => {
            try {
                const response = await fetch("/api/dashboard/personnel");
                const data = (await response.json()) as PersonnelPayload;
                setPersonnelData({
                    ...DEFAULT_PERSONNEL,
                    ...data,
                });
            } catch (error) {
                console.error("Failed to fetch personnel dashboard data:", error);
            }
        };

        fetchPersonnelData();
    }, []);

    const isCategory = tab === "category";
    const donutData = isCategory ? personnelData.category : personnelData.status;
    const total = donutData.reduce((sum, item) => sum + item.value, 0);

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
                                nameKey="label"
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
                                <span className="text-stone-500 font-medium">{d.label}</span>
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
                            data={isCategory ? personnelData.by_department_category : personnelData.by_department_status}
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
                                    <Bar dataKey="cos" name="COS" fill="#94a3b8" radius={[0, 4, 4, 0]} animationDuration={500} />
                                </>
                            ) : (
                                personnelData.status_keys.map((statusKey, i) => (
                                    <Bar
                                        key={statusKey.key}
                                        dataKey={statusKey.key}
                                        name={statusKey.label}
                                        stackId="status"
                                        fill={statusKey.color}
                                        radius={i === personnelData.status_keys.length - 1 ? [0, 4, 4, 0] : [0, 0, 0, 0]}
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
                                <div className="flex items-center gap-1.5 text-[11px]">
                                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "#94a3b8" }} />
                                    <span className="text-stone-500 font-medium">COS</span>
                                </div>
                            </>
                        ) : (
                            personnelData.status_keys.map((statusKey) => (
                                <div key={statusKey.key} className="flex items-center gap-1.5 text-[11px]">
                                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: statusKey.color }} />
                                    <span className="text-stone-500 font-medium">{statusKey.label}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
