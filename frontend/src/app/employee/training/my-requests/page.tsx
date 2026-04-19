"use client";

import React, { useState, useEffect } from "react";
import type { TrainingRecord, TrainingRequest, EmpTrainingStats, TrainingEvent } from "@/types";
import { backendEnvelopeRequest } from "@/lib/backend-api";
import {
    GraduationCap,
    Clock,
    CheckCircle,
    Send,
    Calendar,
    MapPin,
    Building,
    Plus,
    X,
    FileText,
    AlertCircle,
    XCircle,
} from "lucide-react";

// Mock data removed for dynamic implementation

/* ───────────────────────── helpers ───────────────────────── */

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

function formatDateRange(from: string, to: string) {
    if (from === to) return formatDate(from);
    return `${formatDate(from)} – ${formatDate(to)}`;
}

const TYPE_COLORS: Record<string, string> = {
    Seminar: "border-l-blue-500",
    Workshop: "border-l-violet-500",
    Conference: "border-l-amber-500",
    Webinar: "border-l-teal-500",
    Certification: "border-l-rose-500",
    Other: "border-l-stone-400",
};

const TYPE_BADGES: Record<string, string> = {
    Seminar: "bg-blue-50 text-blue-700",
    Workshop: "bg-violet-50 text-violet-700",
    Conference: "bg-amber-50 text-amber-700",
    Webinar: "bg-teal-50 text-teal-700",
    Certification: "bg-rose-50 text-rose-700",
    Other: "bg-stone-100 text-stone-600",
};

const STATUS_BADGES: Record<string, string> = {
    Completed: "bg-green-50 text-green-700",
    completed: "bg-green-50 text-green-700",
    Ongoing: "bg-blue-50 text-blue-700",
    Upcoming: "bg-stone-100 text-stone-600",
    Cancelled: "bg-red-50 text-red-600",
    Pending: "bg-amber-50 text-amber-700",
    pending: "bg-amber-50 text-amber-700",
    Approved: "bg-green-50 text-green-700",
    approved: "bg-green-50 text-green-700",
    Rejected: "bg-red-50 text-red-600",
    rejected: "bg-red-50 text-red-600",
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
    Completed: <CheckCircle className="w-3.5 h-3.5" />,
    completed: <CheckCircle className="w-3.5 h-3.5" />,
    Ongoing: <Clock className="w-3.5 h-3.5" />,
    Pending: <AlertCircle className="w-3.5 h-3.5" />,
    pending: <AlertCircle className="w-3.5 h-3.5" />,
    Approved: <CheckCircle className="w-3.5 h-3.5" />,
    approved: <CheckCircle className="w-3.5 h-3.5" />,
    Rejected: <XCircle className="w-3.5 h-3.5" />,
    rejected: <XCircle className="w-3.5 h-3.5" />,
};

const TRAINING_TYPES = [
    "Seminar",
    "Workshop",
    "Conference",
    "Webinar",
    "Certification",
    "Other",
] as const;

/* ───────────────────────── component ───────────────────────── */

export default function MyTrainingPage() {
    const [activeTab, setActiveTab] = useState<"history" | "requests">("history");
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [history, setHistory] = useState<TrainingRecord[]>([]);
    const [requests, setRequests] = useState<TrainingRequest[]>([]);
    const [counters, setCounters] = useState<EmpTrainingStats>({
        attended: 0,
        hours: 0,
        pending: 0,
        approved: 0,
    });
    const [upcomingEvents, setUpcomingEvents] = useState<TrainingEvent[]>([]);
    const [selectedEventId, setSelectedEventId] = useState<string>("manual");

    const [form, setForm] = useState({
        title: "",
        training_type: "Seminar" as (typeof TRAINING_TYPES)[number],
        provider: "",
        venue: "",
        date_from: "",
        date_to: "",
        estimated_cost: "",
        number_of_hours: 0,
        justification: "",
        training_event_id: null as string | null,
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, historyRes, reqRes, upcomingEventsRes] = await Promise.all([
                    backendEnvelopeRequest<EmpTrainingStats>("/api/training/me/stats"),
                    backendEnvelopeRequest<TrainingRecord[]>("/api/training/me/history"),
                    backendEnvelopeRequest<TrainingRequest[]>("/api/training/me/requests"),
                    backendEnvelopeRequest<TrainingEvent[]>("/api/training-tracking/events?status=Upcoming"),
                ]);

                if (statsRes.data) setCounters(statsRes.data);
                if (historyRes.data) setHistory(historyRes.data);
                if (reqRes.data) setRequests(reqRes.data);
                if (upcomingEventsRes.data) setUpcomingEvents(upcomingEventsRes.data);
            } catch (err) {
                console.error("Failed to fetch training data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const stats = [
        {
            label: "Total Trainings Attended",
            value: counters.attended,
            icon: GraduationCap,
            color: "text-green-700 bg-green-50",
        },
        {
            label: "Hours Completed",
            value: counters.hours,
            icon: Clock,
            color: "text-blue-700 bg-blue-50",
        },
        {
            label: "Pending Requests",
            value: counters.pending,
            icon: Send,
            color: "text-amber-700 bg-amber-50",
        },
        {
            label: "Approved Requests",
            value: counters.approved,
            icon: CheckCircle,
            color: "text-green-700 bg-green-50",
        },
    ];

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        try {
            const res = await backendEnvelopeRequest("/api/training/me/requests", {
                method: "POST",
                body: JSON.stringify({
                    ...form,
                    estimated_cost: parseFloat(form.estimated_cost) || 0,
                    training_event_id: selectedEventId === "manual" ? null : selectedEventId,
                }),
            });

            if (res.success) {
                alert("Training request submitted successfully!");
                setShowModal(false);
                setForm({
                    title: "",
                    training_type: "Seminar",
                    provider: "",
                    venue: "",
                    date_from: "",
                    date_to: "",
                    estimated_cost: "",
                    number_of_hours: 0,
                    justification: "",
                    training_event_id: null,
                });
                // Optimistic refresh would be better, but let's just refresh counters and list
                const [statsRes, reqRes] = await Promise.all([
                    backendEnvelopeRequest<EmpTrainingStats>("/api/training/me/stats"),
                    backendEnvelopeRequest<TrainingRequest[]>("/api/training/me/requests"),
                ]);
                if (statsRes.data) setCounters(statsRes.data);
                if (reqRes.data) setRequests(reqRes.data);
            }
        } catch (err: unknown) {
            console.error("Submission failed", err);
            const error = err as { details?: { detail?: { msg: string }[] }, message?: string };
            const msg = error.details?.detail?.[0]?.msg || error.message || "Failed to submit request. Please try again.";
            alert(`Submission failed: ${msg}`);
        }
    }

    return (
        <>
            <div className="space-y-6 pb-8">
                {/* Page header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                            <GraduationCap className="w-5 h-5 text-green-700" />
                        </div>
                        <div>
                            <h1 className="text-[18px] font-bold text-stone-900">
                                My Training
                            </h1>
                            <p className="text-[13px] text-stone-400">
                                View training history and submit requests
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-700 text-white text-[13px] font-medium rounded-lg hover:bg-green-800 active:scale-[0.98] shadow-sm transition-all"
                    >
                        <Plus className="w-4 h-4" />
                        Request Training
                    </button>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {loading ? (
                        Array(4).fill(0).map((_, i) => (
                            <div key={i} className="bg-white rounded-xl border border-stone-200/80 shadow-sm p-5 animate-pulse">
                                <div className="flex items-center justify-between">
                                    <div className="h-4 w-24 bg-stone-100 rounded" />
                                    <div className="w-8 h-8 rounded-lg bg-stone-50" />
                                </div>
                                <div className="h-8 w-12 bg-stone-100 rounded mt-2" />
                            </div>
                        ))
                    ) : (
                        stats.map((s) => {
                            const Icon = s.icon;
                            return (
                                <div
                                    key={s.label}
                                    className="bg-white rounded-xl border border-stone-200/80 shadow-sm p-5"
                                >
                                    <div className="flex items-center justify-between">
                                        <p className="text-[12px] font-medium text-stone-400 uppercase tracking-wide">
                                            {s.label}
                                        </p>
                                        <div
                                            className={`w-8 h-8 rounded-lg flex items-center justify-center ${s.color}`}
                                        >
                                            <Icon className="w-4 h-4" />
                                        </div>
                                    </div>
                                    <p className="text-2xl font-bold text-stone-900 mt-2">
                                        {s.value}
                                    </p>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Tab bar */}
                <div className="border-b border-stone-200">
                    <nav className="flex gap-6">
                        {(
                            [
                                { key: "history", label: "Training History" },
                                { key: "requests", label: "Training Requests" },
                            ] as const
                        ).map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`pb-3 text-[13px] font-medium transition-colors ${
                                    activeTab === tab.key
                                        ? "text-green-700 border-b-2 border-green-700"
                                        : "text-stone-500 hover:text-stone-700"
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Tab content */}
                {activeTab === "history" ? (
                    <div className="space-y-3">
                        {loading ? (
                            Array(3).fill(0).map((_, i) => (
                                <div key={i} className="bg-white rounded-xl border border-stone-200/80 shadow-sm p-5 animate-pulse">
                                    <div className="h-4 w-1/3 bg-stone-100 rounded mb-4" />
                                    <div className="flex gap-4">
                                        <div className="h-3 w-20 bg-stone-50 rounded" />
                                        <div className="h-3 w-20 bg-stone-50 rounded" />
                                    </div>
                                </div>
                            ))
                        ) : history.length > 0 ? (
                            history.map((t) => (
                                <div
                                    key={t.id}
                                    className={`bg-white rounded-xl border border-stone-200/80 shadow-sm p-5 border-l-4 ${
                                        TYPE_COLORS[t.training_type || "Other"] ?? TYPE_COLORS.Other
                                    }`}
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h3 className="text-[14px] font-semibold text-stone-900">
                                                    {t.training_title || t.title}
                                                </h3>
                                                <span
                                                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${
                                                        TYPE_BADGES[t.training_type || "Other"] ?? TYPE_BADGES.Other
                                                    }`}
                                                >
                                                    {t.training_type}
                                                </span>
                                            </div>

                                            <div className="mt-2.5 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[12px] text-stone-500">
                                                <span className="inline-flex items-center gap-1.5">
                                                    <Calendar className="w-3.5 h-3.5 text-stone-400" />
                                                    {formatDateRange(t.date_from || "", t.date_to || "")}
                                                </span>
                                                <span className="inline-flex items-center gap-1.5">
                                                    <Clock className="w-3.5 h-3.5 text-stone-400" />
                                                    {t.number_of_hours} hours
                                                </span>
                                                <span className="inline-flex items-center gap-1.5">
                                                    <Building className="w-3.5 h-3.5 text-stone-400" />
                                                    {t.conducted_by}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="bg-white rounded-xl border border-dashed border-stone-300 p-12 text-center">
                                <GraduationCap className="w-8 h-8 text-stone-300 mx-auto mb-3" />
                                <p className="text-[13px] text-stone-400">No training records found in your profile.</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-3">
                        {loading ? (
                            Array(2).fill(0).map((_, i) => (
                                <div key={i} className="bg-white rounded-xl border border-stone-200/80 shadow-sm p-5 animate-pulse">
                                    <div className="h-4 w-1/2 bg-stone-100 rounded mb-4" />
                                    <div className="h-3 w-1/4 bg-stone-50 rounded" />
                                </div>
                            ))
                        ) : requests.length > 0 ? (
                            requests.map((r) => (
                                <div
                                    key={r.id}
                                    className="bg-white rounded-xl border border-stone-200/80 shadow-sm p-5"
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h3 className="text-[14px] font-semibold text-stone-900 truncate">
                                                    {r.title}
                                                </h3>
                                                <span
                                                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${
                                                        TYPE_BADGES[r.training_type] ?? TYPE_BADGES.Other
                                                    }`}
                                                >
                                                    {r.training_type}
                                                </span>
                                                <span
                                                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium capitalize ${
                                                        STATUS_BADGES[r.status]
                                                    }`}
                                                >
                                                    {STATUS_ICONS[r.status]}
                                                    {r.status}
                                                </span>
                                            </div>

                                            <div className="mt-2.5 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[12px] text-stone-500">
                                                <span className="inline-flex items-center gap-1.5">
                                                    <Building className="w-3.5 h-3.5 text-stone-400" />
                                                    {r.provider}
                                                </span>
                                                <span className="inline-flex items-center gap-1.5">
                                                    <MapPin className="w-3.5 h-3.5 text-stone-400" />
                                                    {r.venue}
                                                </span>
                                                <span className="inline-flex items-center gap-1.5">
                                                    <Calendar className="w-3.5 h-3.5 text-stone-400" />
                                                    {formatDateRange(r.date_from, r.date_to)}
                                                </span>
                                                <span className="inline-flex items-center gap-1.5">
                                                    <FileText className="w-3.5 h-3.5 text-stone-400" />
                                                    ₱{r.estimated_cost.toLocaleString()}
                                                </span>
                                            </div>

                                            <p className="mt-2 text-[12px] text-stone-400">
                                                <span className="text-stone-500 font-medium">Justification:</span>{" "}
                                                {r.justification}
                                            </p>

                                            {r.remarks && (
                                                <div className="mt-2 px-3 py-2 bg-stone-50 rounded-lg border border-stone-100">
                                                    <p className="text-[12px] text-stone-500">
                                                        <span className="font-medium text-stone-600">
                                                            Reviewer remarks:
                                                        </span>{" "}
                                                        {r.remarks}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="text-right shrink-0">
                                            <p className="text-[11px] text-stone-400">
                                                Submitted {formatDate(r.submitted_at)}
                                            </p>
                                            {r.reviewed_by && (
                                                <p className="text-[11px] text-stone-400 mt-0.5">
                                                    Reviewed by {r.reviewed_by}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="bg-white rounded-xl border border-dashed border-stone-300 p-12 text-center">
                                <Send className="w-8 h-8 text-stone-300 mx-auto mb-3" />
                                <p className="text-[13px] text-stone-400">You haven&apos;t submitted any training requests yet.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Request Training Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div
                        className="absolute inset-0 bg-black/40"
                        onClick={() => setShowModal(false)}
                    />
                    <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                                    <GraduationCap className="w-4 h-4 text-green-700" />
                                </div>
                                <h2 className="text-[15px] font-semibold text-stone-900">
                                    Request Training
                                </h2>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-1.5 rounded-lg hover:bg-stone-100 transition-colors text-stone-400 hover:text-stone-600"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-[12px] font-medium text-stone-600 mb-1.5">
                                    Select from Upcoming Trainings
                                </label>
                                <select
                                    value={selectedEventId}
                                    onChange={(e) => {
                                        const eventId = e.target.value;
                                        setSelectedEventId(eventId);
                                        if (eventId === "manual") {
                                            setForm({
                                                ...form,
                                                title: "",
                                                training_type: "Seminar",
                                                provider: "",
                                                venue: "",
                                                date_from: "",
                                                date_to: "",
                                                number_of_hours: 0,
                                            });
                                        } else {
                                            const event = upcomingEvents.find((ev) => ev.id === eventId);
                                            if (event) {
                                                setForm({
                                                    ...form,
                                                    training_event_id: event.id,
                                                    title: event.training_title,
                                                    training_type: event.training_type as (typeof TRAINING_TYPES)[number],
                                                    provider: event.conducted_by,
                                                    venue: event.venue,
                                                    date_from: event.date_from,
                                                    date_to: event.date_to,
                                                    number_of_hours: event.hours,
                                                });
                                            }
                                        }
                                    }}
                                    className="w-full px-3 py-2 text-[13px] border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600 transition-colors bg-white font-medium text-stone-900"
                                >
                                    <option value="manual">None (Manual Entry)</option>
                                    <optgroup label="Upcoming Sessions">
                                        {upcomingEvents.map((event) => (
                                            <option key={event.id} value={event.id}>
                                                {event.training_title} ({formatDate(event.date_from)})
                                            </option>
                                        ))}
                                    </optgroup>
                                </select>
                                <p className="mt-2 text-[11px] text-stone-500 italic">
                                    Selecting an upcoming training will auto-fill the details.
                                </p>
                            </div>

                            <div className="h-px bg-stone-100 my-2" />

                            <div>
                                <label className="block text-[12px] font-medium text-stone-600 mb-1.5">
                                    Training Title
                                </label>
                                <input
                                    required
                                    value={form.title}
                                    onChange={(e) =>
                                        setForm({ ...form, title: e.target.value })
                                    }
                                    readOnly={selectedEventId !== "manual"}
                                    className={`w-full px-3 py-2 text-[13px] border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600 transition-colors ${
                                        selectedEventId !== "manual" ? "bg-stone-50 text-stone-500" : ""
                                    }`}
                                    placeholder="e.g. Leadership Development Program"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[12px] font-medium text-stone-600 mb-1.5">
                                        Type
                                    </label>
                                    <select
                                        value={form.training_type}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                training_type: e.target
                                                    .value as (typeof TRAINING_TYPES)[number],
                                            })
                                        }
                                        disabled={selectedEventId !== "manual"}
                                        className={`w-full px-3 py-2 text-[13px] border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600 transition-colors bg-white ${
                                            selectedEventId !== "manual" ? "bg-stone-50 text-stone-500" : ""
                                        }`}
                                    >
                                        {TRAINING_TYPES.map((t) => (
                                            <option key={t} value={t}>
                                                {t}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[12px] font-medium text-stone-600 mb-1.5">
                                        Provider
                                    </label>
                                    <input
                                        required
                                        value={form.provider}
                                        onChange={(e) =>
                                            setForm({ ...form, provider: e.target.value })
                                        }
                                        readOnly={selectedEventId !== "manual"}
                                        className={`w-full px-3 py-2 text-[13px] border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600 transition-colors ${
                                            selectedEventId !== "manual" ? "bg-stone-50 text-stone-500" : ""
                                        }`}
                                        placeholder="Training provider"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[12px] font-medium text-stone-600 mb-1.5">
                                    Venue
                                </label>
                                <input
                                    required
                                    value={form.venue}
                                    onChange={(e) =>
                                        setForm({ ...form, venue: e.target.value })
                                    }
                                    readOnly={selectedEventId !== "manual"}
                                    className={`w-full px-3 py-2 text-[13px] border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600 transition-colors ${
                                        selectedEventId !== "manual" ? "bg-stone-50 text-stone-500" : ""
                                    }`}
                                    placeholder="Training venue or Online"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[12px] font-medium text-stone-600 mb-1.5">
                                        Date From
                                    </label>
                                    <input
                                        required
                                        type="date"
                                        value={form.date_from}
                                        onChange={(e) =>
                                            setForm({ ...form, date_from: e.target.value })
                                        }
                                        readOnly={selectedEventId !== "manual"}
                                        className={`w-full px-3 py-2 text-[13px] border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600 transition-colors ${
                                            selectedEventId !== "manual" ? "bg-stone-50 text-stone-500" : ""
                                        }`}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[12px] font-medium text-stone-600 mb-1.5">
                                        Date To
                                    </label>
                                    <input
                                        required
                                        type="date"
                                        value={form.date_to}
                                        onChange={(e) =>
                                            setForm({ ...form, date_to: e.target.value })
                                        }
                                        readOnly={selectedEventId !== "manual"}
                                        className={`w-full px-3 py-2 text-[13px] border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600 transition-colors ${
                                            selectedEventId !== "manual" ? "bg-stone-50 text-stone-500" : ""
                                        }`}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[12px] font-medium text-stone-600 mb-1.5">
                                        Estimated Cost
                                    </label>
                                    <input
                                        type="number"
                                        value={form.estimated_cost}
                                        onChange={(e) =>
                                            setForm({ ...form, estimated_cost: e.target.value })
                                        }
                                        className="w-full px-3 py-2 text-[13px] border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600 transition-colors"
                                        placeholder="0.00"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[12px] font-medium text-stone-600 mb-1.5">
                                        Training Hours
                                    </label>
                                    <input
                                        required
                                        type="number"
                                        value={form.number_of_hours}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                number_of_hours: parseInt(e.target.value) || 0,
                                            })
                                        }
                                        readOnly={selectedEventId !== "manual"}
                                        className={`w-full px-3 py-2 text-[13px] border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600 transition-colors ${
                                            selectedEventId !== "manual" ? "bg-stone-50 text-stone-500" : ""
                                        }`}
                                        placeholder="0"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[12px] font-medium text-stone-600 mb-1.5">
                                    Justification
                                </label>
                                <textarea
                                    required
                                    rows={3}
                                    value={form.justification}
                                    onChange={(e) =>
                                        setForm({ ...form, justification: e.target.value })
                                    }
                                    className="w-full px-3 py-2 text-[13px] border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600 transition-colors resize-none"
                                    placeholder="Explain how this training will benefit your role and the organization..."
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-[13px] font-medium text-stone-600 rounded-lg hover:bg-stone-100 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="inline-flex items-center gap-2 px-5 py-2 bg-green-700 text-white text-[13px] font-medium rounded-lg hover:bg-green-800 active:scale-[0.98] shadow-sm transition-all"
                                >
                                    <Send className="w-3.5 h-3.5" />
                                    Submit Request
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
