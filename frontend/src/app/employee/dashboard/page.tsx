"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    User,
    FileText,
    GraduationCap,
    Clock,
    CheckCircle,
    AlertCircle,
    ChevronRight,
    Upload,
    Calendar,
    Briefcase,
    Award,
    MapPin,
    Hash,
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import { backendEnvelopeRequest } from '@/lib/backend-api';
import type { EmployeeDashboardData } from '@/types';

const ICON_MAP: Record<string, React.ElementType> = {
    AlertCircle,
    Upload,
    FileText,
    Calendar,
};

export default function EmployeeDashboard() {
    const [data, setData] = useState<EmployeeDashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await backendEnvelopeRequest<EmployeeDashboardData>("/api/dashboard/employee");
                if (res.data) {
                    setData(res.data);
                }
            } catch (err) {
                console.error("Failed to fetch dashboard data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <div className="animate-spin w-10 h-10 border-4 border-stone-100 border-t-green-600 rounded-full" />
                <p className="text-stone-400 text-sm font-medium animate-pulse tracking-wide">Initializing Dashboard...</p>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="bg-white rounded-2xl border border-stone-200 p-20 text-center shadow-sm">
                <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-stone-900">Dashboard Unavailable</h3>
                <p className="text-stone-500 mt-2">We couldn&apos;t load your professional overview. Please ensure your PDS is completed.</p>
                <Link href="/employee/onboard" className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-stone-900 text-white rounded-xl font-bold hover:bg-stone-800 transition-all">
                    Complete Onboarding
                </Link>
            </div>
        );
    }

    const { profile, stats, upcoming_trainings, recent_documents, training_progress, action_items } = data;
    return (
        <div className="space-y-6 pb-12">
                {/* Profile Summary Card */}
                <div className="bg-white rounded-xl border border-stone-200/80 shadow-sm overflow-hidden">
                    <div className="bg-gradient-to-r from-green-700 to-green-600 px-6 py-5">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center">
                                    <User className="w-7 h-7 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">{profile.full_name}</h2>
                                    <div className="flex items-center gap-3 mt-0.5">
                                        <p className="text-green-100 text-sm">{profile.position}</p>
                                        {(profile.sex || profile.civil_status) && (
                                            <div className="flex gap-1.5 ml-1">
                                                {profile.sex && (
                                                    <span className="px-1.5 py-0.5 bg-white/20 text-[10px] font-bold text-white uppercase tracking-wider rounded border border-white/20">
                                                        {profile.sex}
                                                    </span>
                                                )}
                                                {profile.civil_status && (
                                                    <span className="px-1.5 py-0.5 bg-white/20 text-[10px] font-bold text-white uppercase tracking-wider rounded border border-white/20">
                                                        {profile.civil_status}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                            </div>
                            <div className="flex gap-2">
                                <Link
                                    href="/employee/my-pds"
                                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white/15 hover:bg-white/25 text-white text-sm font-medium rounded-lg transition-colors"
                                >
                                    <User className="w-4 h-4" />
                                    View My 201
                                </Link>
                                <Link
                                    href="/employee/training/my-requests"
                                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white/15 hover:bg-white/25 text-white text-sm font-medium rounded-lg transition-colors"
                                >
                                    <GraduationCap className="w-4 h-4" />
                                    My Training
                                </Link>
                            </div>
                        </div>
                    </div>
                    <div className="px-6 py-4 flex items-center justify-between border-t border-stone-100">
                        <div className="flex items-center gap-6 text-sm text-stone-600">
                            <span className="flex items-center gap-1.5">
                                <MapPin className="w-4 h-4 text-stone-400" />
                                {profile.department}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Hash className="w-4 h-4 text-stone-400" />
                                {profile.employee_no}
                            </span>
                            {profile.birth_date && (
                                <span className="flex items-center gap-1.5">
                                    <Calendar className="w-4 h-4 text-stone-400" />
                                    {profile.birth_date}
                                </span>
                            )}
                        </div>

                        <div className="flex items-center gap-6">
                            <div className="text-center">
                                <p className="text-lg font-bold text-green-700">{stats.years_service}</p>
                                <p className="text-[11px] text-stone-500 uppercase tracking-wide">Years of Service</p>
                            </div>
                            <div className="w-px h-8 bg-stone-200" />
                            <div className="text-center">
                                <p className="text-lg font-bold text-green-700">{stats.total_trainings}</p>
                                <p className="text-[11px] text-stone-500 uppercase tracking-wide">Total Trainings</p>
                            </div>
                            <div className="w-px h-8 bg-stone-200" />
                            <div className="text-center">
                                <p className="text-lg font-bold text-green-700">{stats.total_documents}</p>
                                <p className="text-[11px] text-stone-500 uppercase tracking-wide">Docs Uploaded</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Stats Row */}
                <div className="grid grid-cols-4 gap-4">
                    <div className="bg-white rounded-xl border border-stone-200/80 shadow-sm p-5">
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                            </div>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">
                                {stats.pds_status}
                            </span>
                        </div>
                        <p className="text-sm font-medium text-stone-500">PDS Status</p>
                        <p className="text-xs text-stone-400 mt-1">Last updated: {stats.last_pds_update}</p>
                    </div>

                    <div className="bg-white rounded-xl border border-stone-200/80 shadow-sm p-5">
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                                <Clock className="w-5 h-5 text-blue-600" />
                            </div>
                            <span className="text-xl font-bold text-stone-800">{stats.annual_training_hours} hrs</span>
                        </div>
                        <p className="text-sm font-medium text-stone-500">Training Hours This Year</p>
                        <div className="mt-2">
                            <div className="flex items-center justify-between text-xs text-stone-400 mb-1">
                                <span>Progress</span>
                                <span>{stats.annual_training_hours} / {stats.training_target} hrs</span>
                            </div>
                            <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-green-500 rounded-full" 
                                    style={{ width: `${Math.min((stats.annual_training_hours / stats.training_target) * 100, 100)}%` }} 
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-stone-200/80 shadow-sm p-5">
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center">
                                <AlertCircle className="w-5 h-5 text-amber-600" />
                            </div>
                            <span className="text-xl font-bold text-stone-800">{stats.pending_requests_count}</span>
                        </div>
                        <p className="text-sm font-medium text-stone-500">Pending Requests</p>
                        <p className="text-xs text-stone-400 mt-1">Tracking and approvals</p>
                    </div>

                    <div className="bg-white rounded-xl border border-stone-200/80 shadow-sm p-5">
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-9 h-9 rounded-lg bg-violet-50 flex items-center justify-center">
                                <FileText className="w-5 h-5 text-violet-600" />
                            </div>
                            <span className="text-xl font-bold text-stone-800">{stats.total_documents}</span>
                        </div>
                        <p className="text-sm font-medium text-stone-500">Documents</p>
                        <p className="text-xs text-stone-400 mt-1">
                            <span className="text-green-600 font-medium">{stats.verified_docs_count}</span> verified
                            {' · '}
                            <span className="text-amber-600 font-medium">{stats.pending_docs_count}</span> pending
                        </p>
                    </div>
                </div>

                {/* Two-Column Layout */}
                <div className="grid grid-cols-3 gap-6">
                    {/* Left Column */}
                    <div className="col-span-2 space-y-6">
                        {/* Upcoming Training */}
                        <div className="bg-white rounded-xl border border-stone-200/80 shadow-sm">
                            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
                                <div className="flex items-center gap-2">
                                    <GraduationCap className="w-5 h-5 text-green-700" />
                                    <h3 className="text-sm font-semibold text-stone-800">Upcoming Training</h3>
                                </div>
                                <Link href="/employee/training/my-requests" className="text-green-700 hover:text-green-800 text-sm font-medium flex items-center gap-1">
                                    View All <ChevronRight className="w-4 h-4" />
                                </Link>
                            </div>
                            <div className="divide-y divide-stone-100">
                                {upcoming_trainings.length > 0 ? (
                                    upcoming_trainings.map((training, i) => (
                                        <div key={i} className="px-6 py-4 flex items-center justify-between hover:bg-stone-50/50 transition-colors">
                                            <div className="flex items-start gap-3">
                                                <div className="mt-0.5 w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                                                    <Award className="w-4 h-4 text-green-600" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-stone-800">{training.title}</p>
                                                    <div className="flex items-center gap-3 mt-1">
                                                        <span className="text-xs text-stone-500 flex items-center gap-1">
                                                            <Calendar className="w-3.5 h-3.5" />
                                                            {training.date}
                                                        </span>
                                                        <span className="text-xs text-stone-500 flex items-center gap-1">
                                                            <MapPin className="w-3.5 h-3.5" />
                                                            {training.venue}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <span className="text-[11px] font-medium text-stone-500 bg-stone-100 px-2.5 py-1 rounded-full">
                                                {training.type}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="px-6 py-8 text-center">
                                        <p className="text-stone-400 italic text-sm">No upcoming training events assigned.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Recent Documents */}
                        <div className="bg-white rounded-xl border border-stone-200/80 shadow-sm">
                            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
                                <div className="flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-green-700" />
                                    <h3 className="text-sm font-semibold text-stone-800">Recent Documents</h3>
                                </div>
                                <Link href="/employee/my-pds" className="text-green-700 hover:text-green-800 text-sm font-medium flex items-center gap-1">
                                    View All <ChevronRight className="w-4 h-4" />
                                </Link>
                            </div>
                            <div className="divide-y divide-stone-100">
                                {recent_documents.length > 0 ? (
                                    recent_documents.map((doc, i) => (
                                        <div key={i} className="px-6 py-3.5 flex items-center justify-between hover:bg-stone-50/50 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-stone-50 flex items-center justify-center flex-shrink-0">
                                                    <FileText className="w-4 h-4 text-stone-400" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-stone-700">{doc.name}</p>
                                                    <p className="text-xs text-stone-400 mt-0.5">{doc.date}</p>
                                                </div>
                                            </div>
                                            {doc.status === 'verified' ? (
                                                <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 px-2.5 py-1 rounded-full">
                                                    <CheckCircle className="w-3.5 h-3.5" />
                                                    Verified
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    Pending
                                                </span>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="px-6 py-8 text-center">
                                        <p className="text-stone-400 italic text-sm">No documented activity.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        {/* Training Progress Chart */}
                        <div className="bg-white rounded-xl border border-stone-200/80 shadow-sm">
                            <div className="px-6 py-4 border-b border-stone-100">
                                <div className="flex items-center gap-2">
                                    <Briefcase className="w-5 h-5 text-green-700" />
                                    <h3 className="text-sm font-semibold text-stone-800">Training Progress</h3>
                                </div>
                                <p className="text-xs text-stone-400 mt-1">Hours completed vs. target by category</p>
                            </div>
                            <div className="px-4 py-4">
                                <ResponsiveContainer width="100%" height={220}>
                                    <BarChart data={training_progress} barGap={4}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                                        <XAxis
                                            dataKey="category"
                                            tick={{ fontSize: 11, fill: '#78716c' }}
                                            axisLine={{ stroke: '#d6d3d1' }}
                                            tickLine={false}
                                        />
                                        <YAxis
                                            tick={{ fontSize: 11, fill: '#78716c' }}
                                            axisLine={{ stroke: '#d6d3d1' }}
                                            tickLine={false}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                fontSize: 12,
                                                borderRadius: 8,
                                                border: '1px solid #e7e5e4',
                                                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                                            }}
                                        />
                                        <Bar dataKey="completed" name="Completed" fill="#15803d" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="target" name="Target" fill="#bbf7d0" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                                <div className="flex items-center justify-center gap-4 mt-2 text-xs text-stone-500">
                                    <span className="flex items-center gap-1.5">
                                        <span className="w-3 h-3 rounded-sm bg-green-700" /> Completed
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <span className="w-3 h-3 rounded-sm bg-green-200" /> Target
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Action Items */}
                        <div className="bg-white rounded-xl border border-stone-200/80 shadow-sm">
                            <div className="px-6 py-4 border-b border-stone-100">
                                <div className="flex items-center gap-2">
                                    <AlertCircle className="w-5 h-5 text-amber-600" />
                                    <h3 className="text-sm font-semibold text-stone-800">Action Items</h3>
                                </div>
                                <p className="text-xs text-stone-400 mt-1">Items needing your attention</p>
                            </div>
                            <div className="divide-y divide-stone-100">
                                {action_items.length > 0 ? (
                                    action_items.map((item, i) => {
                                        const Icon = ICON_MAP[item.icon] || AlertCircle;
                                        return (
                                            <div key={i} className="px-6 py-3.5 flex items-start gap-3 hover:bg-stone-50/50 transition-colors cursor-pointer group">
                                                <div className={`mt-0.5 w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 ${
                                                    item.priority === 'high'
                                                        ? 'bg-red-50'
                                                        : item.priority === 'medium'
                                                        ? 'bg-amber-50'
                                                        : 'bg-stone-50'
                                                }`}>
                                                    <Icon className={`w-3.5 h-3.5 ${
                                                        item.priority === 'high'
                                                            ? 'text-red-500'
                                                            : item.priority === 'medium'
                                                            ? 'text-amber-500'
                                                            : 'text-stone-400'
                                                    }`} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm text-stone-700 group-hover:text-stone-900">{item.text}</p>
                                                    <span className={`text-[11px] font-medium ${
                                                        item.priority === 'high'
                                                            ? 'text-red-600'
                                                            : item.priority === 'medium'
                                                            ? 'text-amber-600'
                                                            : 'text-stone-400'
                                                }`}>
                                                    {item.priority === 'high' ? 'High Priority' : item.priority === 'medium' ? 'Medium' : 'Low'}
                                                </span>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-stone-300 group-hover:text-stone-500 mt-1 flex-shrink-0" />
                                        </div>
                                    );
                                })
                                ) : (
                                    <div className="px-6 py-8 text-center">
                                        <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2 opacity-20" />
                                        <p className="text-stone-400 italic text-sm">All caught up!</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
        </div>
    );
}
