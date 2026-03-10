"use client";

import React, { useEffect, useState } from 'react';
import type { TrainingBudget } from '@/types';
import {
    Users,
    GraduationCap,
    Briefcase,
    Clock,
    TrendingUp,
    ArrowUpRight,
    AlertCircle,
} from 'lucide-react';

interface StatCard {
    label: string;
    value: string;
    change: string;
    changeType: 'positive' | 'negative' | 'neutral';
    icon: React.ReactNode;
    iconBg: string;
    iconColor: string;
}

export function DashboardStats() {
    const [budget, setBudget] = useState<TrainingBudget | null>(null);

    const stats: StatCard[] = [
        {
            label: 'Total Employees',
            value: '381',
            change: '+12 this year',
            changeType: 'positive',
            icon: <Users className="w-5 h-5" />,
            iconBg: 'bg-blue-50',
            iconColor: 'text-blue-600',
        },
        {
            label: 'Teaching Staff',
            value: '244',
            change: '64%',
            changeType: 'neutral',
            icon: <GraduationCap className="w-5 h-5" />,
            iconBg: 'bg-emerald-50',
            iconColor: 'text-emerald-600',
        },
        {
            label: 'Non-Teaching',
            value: '103',
            change: '27%',
            changeType: 'neutral',
            icon: <Briefcase className="w-5 h-5" />,
            iconBg: 'bg-violet-50',
            iconColor: 'text-violet-600',
        },
        {
            label: 'Pending Requests',
            value: '45',
            change: 'Action needed',
            changeType: 'negative',
            icon: <Clock className="w-5 h-5" />,
            iconBg: 'bg-amber-50',
            iconColor: 'text-amber-600',
        },
    ];

    useEffect(() => {
        const fetchBudget = async () => {
            try {
                const res = await fetch('/api/dashboard/training-budget');
                const data = await res.json();
                setBudget(data.overall);
            } catch (error) {
                console.error('Failed to fetch budget:', error);
            }
        };
        fetchBudget();
    }, []);

    const utilizationPercent = budget
        ? Math.round((budget.utilized / budget.allocated) * 100)
        : 0;

    return (
        <div className="space-y-6">
            {/* Section Header */}
            <div>
                <h2 className="text-lg font-semibold text-slate-800">System Overview</h2>
                <p className="text-[13px] text-slate-400 mt-0.5">Key metrics at a glance</p>
            </div>

            {/* KPI Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {stats.map((stat, idx) => (
                    <div
                        key={idx}
                        className="bg-white rounded-xl border border-slate-200/80 p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
                    >
                        <div className="flex items-start justify-between">
                            <div className={`w-10 h-10 rounded-lg ${stat.iconBg} ${stat.iconColor} flex items-center justify-center`}>
                                {stat.icon}
                            </div>
                            {stat.changeType === 'positive' && (
                                <span className="flex items-center gap-0.5 text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                                    <ArrowUpRight className="w-3 h-3" />
                                    {stat.change}
                                </span>
                            )}
                            {stat.changeType === 'negative' && (
                                <span className="flex items-center gap-1 text-[11px] font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                    {stat.change}
                                </span>
                            )}
                        </div>
                        <div className="mt-4">
                            <p className="text-2xl font-bold text-slate-900 tracking-tight">{stat.value}</p>
                            <p className="text-[12px] text-slate-400 mt-1">{stat.label}</p>
                        </div>
                        {stat.changeType === 'neutral' && (
                            <div className="mt-3 flex items-center gap-1.5">
                                <TrendingUp className="w-3 h-3 text-slate-400" />
                                <span className="text-[11px] font-medium text-slate-500">{stat.change} of total</span>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Budget Overview Card */}
            {budget && (
                <div className="bg-slate-900 rounded-xl p-6 text-white overflow-hidden relative">
                    {/* Subtle background pattern */}
                    <div className="absolute inset-0 opacity-[0.03]"
                        style={{
                            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
                            backgroundSize: '24px 24px',
                        }}
                    />

                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-[15px] font-semibold text-white">Lifelong Education Budget</h3>
                                <p className="text-[12px] text-slate-400 mt-0.5">Fiscal Year 2026</p>
                            </div>
                            <span className="text-[11px] font-medium text-indigo-300 bg-indigo-500/20 px-3 py-1 rounded-full">
                                {utilizationPercent}% utilized
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Total Allocated */}
                            <div className="space-y-1">
                                <p className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">Total Allocated</p>
                                <p className="text-3xl font-bold tracking-tight text-white">
                                    ₱{(budget.allocated / 1000).toFixed(0)}K
                                </p>
                            </div>

                            {/* Utilized */}
                            <div className="space-y-1">
                                <p className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">Utilized Amount</p>
                                <p className="text-3xl font-bold tracking-tight text-amber-400">
                                    ₱{(budget.utilized / 1000).toFixed(0)}K
                                </p>
                                <div className="w-full bg-slate-700 rounded-full h-1.5 mt-2">
                                    <div
                                        className="bg-gradient-to-r from-amber-400 to-amber-500 h-1.5 rounded-full transition-all duration-700 ease-out"
                                        style={{ width: `${utilizationPercent}%` }}
                                    />
                                </div>
                            </div>

                            {/* Remaining */}
                            <div className="space-y-1">
                                <p className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">Remaining Balance</p>
                                <p className="text-3xl font-bold tracking-tight text-emerald-400">
                                    ₱{(budget.balance / 1000).toFixed(0)}K
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
