"use client";

import React, { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

type ComplianceMetric = {
    key: string;
    name: string;
    current: number;
    target: number;
};

type CompliancePayload = {
    metrics: ComplianceMetric[];
    overall_current: number;
};

const METRIC_COLORS: Record<string, { barBg: string; barFill: string }> = {
    pds_completion: { barBg: "bg-green-100", barFill: "bg-green-600" },
    training_hours: { barBg: "bg-teal-100", barFill: "bg-teal-500" },
    mov_uploads: { barBg: "bg-emerald-100", barFill: "bg-emerald-500" },
    profile_completion: { barBg: "bg-amber-100", barFill: "bg-amber-500" },
};

const DEFAULT_PAYLOAD: CompliancePayload = {
    metrics: [],
    overall_current: 0,
};

export function ComplianceSummary() {
    const [payload, setPayload] = useState<CompliancePayload>(DEFAULT_PAYLOAD);

    useEffect(() => {
        const fetchCompliance = async () => {
            try {
                const response = await fetch("/api/dashboard/compliance");
                const data = (await response.json()) as CompliancePayload;
                setPayload({
                    ...DEFAULT_PAYLOAD,
                    ...data,
                });
            } catch (error) {
                console.error("Failed to fetch compliance summary:", error);
            }
        };

        fetchCompliance();
    }, []);

    const metrics = payload.metrics;
    const overallCurrent = metrics.length > 0
        ? payload.overall_current
        : 0;

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
                    const metricColor = METRIC_COLORS[m.key] || METRIC_COLORS.pds_completion;
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
                            <div className={`w-full h-1.5 rounded-full ${metricColor.barBg}`}>
                                <div
                                    className={`h-1.5 rounded-full ${metricColor.barFill} transition-all duration-700 ease-out`}
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
