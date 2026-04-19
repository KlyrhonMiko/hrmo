"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
    ClipboardList,
    CheckCircle,
    XCircle,
    Clock,
    Search,
    Filter,
    Eye,
    Check,
    X,
    User,
    Calendar,
    MapPin,
    GraduationCap,
    ArrowRight,
    AlertCircle,
    RotateCcw,
} from "lucide-react";
import {
    backendEnvelopeRequest,
} from "@/lib/backend-api";
import { TrainingRequest, TrainingRequestStatus } from "@/types";

const STATUS_CONFIG = {
    pending: { label: "Pending", icon: Clock, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
    approved: { label: "Approved", icon: CheckCircle, icon2: Check, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" },
    rejected: { label: "Rejected", icon: XCircle, icon2: X, color: "text-red-600", bg: "bg-red-50", border: "border-red-200" },
    completed: { label: "Completed", icon: CheckCircle, icon2: GraduationCap, color: "text-green-600", bg: "bg-green-50", border: "border-green-200" },
};

export default function TrainingRequestsAdminPage() {
    const [requests, setRequests] = useState<TrainingRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [activeTab, setActiveTab] = useState<TrainingRequestStatus | "all">("pending");
    const [selectedRequest, setSelectedRequest] = useState<TrainingRequest | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [remarks, setRemarks] = useState("");

    const fetchRequests = async () => {
        setIsLoading(true);
        try {
            const res = await backendEnvelopeRequest<TrainingRequest[]>("/api/training/admin/requests");
            if (res.data) {
                setRequests(res.data);
            }
        } catch (err) {
            console.error("Failed to fetch requests", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const filteredRequests = useMemo(() => {
        return requests.filter((req) => {
            const matchesTab = activeTab === "all" || req.status === activeTab;
            const matchesSearch =
                (req.employee_name || "").toLowerCase().includes(search.toLowerCase()) ||
                (req.title || "").toLowerCase().includes(search.toLowerCase()) ||
                (req.employee_no || "").toLowerCase().includes(search.toLowerCase());
            return matchesTab && matchesSearch;
        });
    }, [requests, activeTab, search]);

    const handleReview = async (requestId: string, status: TrainingRequestStatus) => {
        setIsProcessing(true);
        try {
            await backendEnvelopeRequest(`/api/training/requests/${requestId}/review`, {
                method: "PATCH",
                body: JSON.stringify({
                    status,
                    remarks: remarks || undefined,
                }),
            });
            setSelectedRequest(null);
            setRemarks("");
            fetchRequests();
        } catch (err) {
            console.error("Failed to process request", err);
            alert("Failed to process request. Please try again.");
        } finally {
            setIsProcessing(false);
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                        <ClipboardList className="w-5 h-5 text-green-700" />
                    </div>
                    <div>
                        <h1 className="text-[18px] font-bold text-stone-900">Training Requests</h1>
                        <p className="text-[13px] text-stone-400">Review and manage employee training applications</p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-stone-200/80 shadow-sm overflow-hidden">
                <div className="border-b border-stone-100 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex gap-1">
                        {["all", "pending", "approved", "completed", "rejected"].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as TrainingRequestStatus | "all")}
                                className={`px-4 py-2 text-[13px] font-medium rounded-lg transition-all ${
                                    activeTab === tab
                                        ? "bg-green-50 text-green-700"
                                        : "text-stone-500 hover:bg-stone-50 hover:text-stone-700"
                                }`}
                            >
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        ))}
                    </div>
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                        <input
                            type="text"
                            placeholder="Search employee or training..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600 transition-all font-medium"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-stone-50/50">
                                <th className="px-6 py-3 text-[11px] font-semibold text-stone-500 uppercase tracking-wider border-b border-stone-100">Employee</th>
                                <th className="px-6 py-3 text-[11px] font-semibold text-stone-500 uppercase tracking-wider border-b border-stone-100">Training Details</th>
                                <th className="px-6 py-3 text-[11px] font-semibold text-stone-500 uppercase tracking-wider border-b border-stone-100">Schedule</th>
                                <th className="px-6 py-3 text-[11px] font-semibold text-stone-500 uppercase tracking-wider border-b border-stone-100">Status</th>
                                <th className="px-6 py-3 text-[11px] font-semibold text-stone-500 uppercase tracking-wider border-b border-stone-100 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-stone-400 text-sm">Loading requests...</td>
                                </tr>
                            ) : filteredRequests.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-stone-400 text-sm">No training requests found.</td>
                                </tr>
                            ) : (
                                filteredRequests.map((req) => {
                                    const status = STATUS_CONFIG[req.status];
                                    const StatusIcon = status.icon;

                                    return (
                                        <tr key={req.id} className="hover:bg-stone-50/30 transition-colors">
                                            <td className="px-6 py-4 border-b border-stone-100">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-stone-500">
                                                        <User className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[13.5px] font-bold text-stone-800 leading-tight">{req.employee_name}</p>
                                                        <p className="text-[11.5px] text-stone-400 mt-0.5">{req.office}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 border-b border-stone-100">
                                                <div>
                                                    <p className="text-[13.5px] font-semibold text-stone-700 leading-snug">{req.title}</p>
                                                    <p className="text-[11.5px] text-stone-400 mt-0.5">{req.training_type} · {req.provider}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 border-b border-stone-100">
                                                <div className="text-[12.5px] text-stone-600">
                                                    <p className="font-medium">{formatDate(req.date_from)}</p>
                                                    <p className="text-stone-400 text-[11.5px]">{req.number_of_hours} hours</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 border-b border-stone-100">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${status.bg} ${status.color} ${status.border}`}>
                                                    <StatusIcon className="w-3.5 h-3.5" />
                                                    {status.label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 border-b border-stone-100 text-right">
                                                <button
                                                    onClick={() => setSelectedRequest(req)}
                                                    className="inline-flex items-center gap-2 px-3 py-1.5 text-[12px] font-medium text-stone-600 bg-stone-50 border border-stone-200 rounded-lg hover:bg-stone-100 transition-colors"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                    Review
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedRequest && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm" onClick={() => setSelectedRequest(null)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col animate-in fade-in zoom-in duration-200">
                        <div className="px-8 py-6 border-b border-stone-100 flex items-center justify-between sticky top-0 bg-white z-10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                                    <ClipboardList className="w-5 h-5 text-green-700" />
                                </div>
                                <div>
                                    <h2 className="text-[16px] font-bold text-stone-900 leading-none">Request Review</h2>
                                    <p className="text-[12px] text-stone-400 mt-1">Application ID: {selectedRequest.id.split("-")[0].toUpperCase()}</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedRequest(null)} className="p-2 hover:bg-stone-100 rounded-full transition-colors text-stone-400 hover:text-stone-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-8 space-y-8">
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <h3 className="text-[11px] font-bold text-stone-400 uppercase tracking-widest leading-none">Employee Profile</h3>
                                    <div className="flex items-start gap-3 p-4 bg-stone-50 rounded-xl border border-stone-200/60">
                                        <div className="w-10 h-10 rounded-full bg-white border border-stone-200 flex items-center justify-center text-stone-400 shadow-sm">
                                            <User className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-[14px] font-bold text-stone-800 leading-tight">{selectedRequest.employee_name}</p>
                                            <p className="text-[12px] text-stone-500 mt-1">{selectedRequest.employee_no} · {selectedRequest.office}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <h3 className="text-[11px] font-bold text-stone-400 uppercase tracking-widest leading-none">Current Status</h3>
                                    <div className={`flex items-center gap-2 p-4 rounded-xl border ${STATUS_CONFIG[selectedRequest.status].bg} ${STATUS_CONFIG[selectedRequest.status].border}`}>
                                        {React.createElement(STATUS_CONFIG[selectedRequest.status].icon, { className: `w-5 h-5 ${STATUS_CONFIG[selectedRequest.status].color}` })}
                                        <p className={`text-[13px] font-bold uppercase tracking-wide ${STATUS_CONFIG[selectedRequest.status].color}`}>
                                            {STATUS_CONFIG[selectedRequest.status].label}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 pt-2">
                                <h3 className="text-[11px] font-bold text-stone-400 uppercase tracking-widest leading-none">Training Details</h3>
                                <div className="bg-white rounded-xl border border-stone-200/80 p-5 space-y-4 shadow-sm">
                                    <h4 className="text-[16px] font-bold text-stone-800 leading-tight">{selectedRequest.title}</h4>
                                    
                                    <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                                        <div className="flex items-start gap-2.5">
                                            <div className="p-1.5 rounded-lg bg-stone-50 text-stone-400">
                                                <MapPin className="w-3.5 h-3.5" />
                                            </div>
                                            <div>
                                                <p className="text-[11px] font-bold text-stone-400 uppercase tracking-wide">Venue</p>
                                                <p className="text-[13px] text-stone-700 font-medium mt-0.5">{selectedRequest.venue}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-2.5">
                                            <div className="p-1.5 rounded-lg bg-stone-50 text-stone-400">
                                                <GraduationCap className="w-3.5 h-3.5" />
                                            </div>
                                            <div>
                                                <p className="text-[11px] font-bold text-stone-400 uppercase tracking-wide">Category</p>
                                                <p className="text-[13px] text-stone-700 font-medium mt-0.5">{selectedRequest.training_type}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-2.5">
                                            <div className="p-1.5 rounded-lg bg-stone-50 text-stone-400">
                                                <Calendar className="w-3.5 h-3.5" />
                                            </div>
                                            <div>
                                                <p className="text-[11px] font-bold text-stone-400 uppercase tracking-wide">Schedule</p>
                                                <p className="text-[13px] text-stone-700 font-medium mt-0.5">{formatDate(selectedRequest.date_from)} to {formatDate(selectedRequest.date_to)}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-2.5">
                                            <div className="p-1.5 rounded-lg bg-stone-50 text-stone-400">
                                                <Clock className="w-3.5 h-3.5" />
                                            </div>
                                            <div>
                                                <p className="text-[11px] font-bold text-stone-400 uppercase tracking-wide">Duration</p>
                                                <p className="text-[13px] text-stone-700 font-medium mt-0.5">{selectedRequest.number_of_hours} Hours</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-stone-100">
                                        <div className="flex items-center justify-between text-[13px]">
                                            <span className="text-stone-500 font-medium">Estimated Budget Required</span>
                                            <span className="font-bold text-stone-900 leading-none">₱{selectedRequest.estimated_cost.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h3 className="text-[11px] font-bold text-stone-400 uppercase tracking-widest leading-none">Employee Justification</h3>
                                <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-200/40 italic text-stone-600 text-[13.5px] leading-relaxed">
                                    &ldquo;{selectedRequest.justification}&rdquo;
                                </div>
                            </div>

                            <div className="space-y-3 pt-2">
                                <label className="text-[11px] font-bold text-stone-400 uppercase tracking-widest leading-none">Remarks / Notes</label>
                                <textarea
                                    value={remarks}
                                    onChange={(e) => setRemarks(e.target.value)}
                                    placeholder="Enter your assessment or instructions here..."
                                    rows={3}
                                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600 focus:bg-white transition-all outline-none"
                                />
                                {selectedRequest.status === "completed" && (
                                    <div className="flex items-start gap-2.5 px-3 py-2 bg-green-50/50 rounded-lg text-green-700 text-[11.5px] font-medium leading-relaxed">
                                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                        This request is already completed and recorded in the employee&apos;s PDS.
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="px-8 py-6 border-t border-stone-100 bg-stone-50/50 flex flex-wrap items-center justify-end gap-3 sticky bottom-0 z-10">
                            {selectedRequest.status === "pending" && (
                                <>
                                    <button
                                        disabled={isProcessing}
                                        onClick={() => handleReview(selectedRequest.id, "rejected")}
                                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-white text-red-600 text-[13px] font-bold rounded-xl border border-red-200 hover:bg-red-50 active:scale-[0.98] transition-all disabled:opacity-50"
                                    >
                                        <X className="w-4 h-4" />
                                        Reject Request
                                    </button>
                                    <button
                                        disabled={isProcessing}
                                        onClick={() => handleReview(selectedRequest.id, "approved")}
                                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-green-700 text-white text-[13px] font-bold rounded-xl hover:bg-green-800 active:scale-[0.98] shadow-md shadow-green-700/20 transition-all disabled:opacity-50"
                                    >
                                        <Check className="w-4 h-4" />
                                        Approve Request
                                    </button>
                                </>
                            )}
                            {selectedRequest.status === "approved" && (
                                <>
                                    <button
                                        disabled={isProcessing}
                                        onClick={() => handleReview(selectedRequest.id, "pending")}
                                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-white text-stone-600 text-[13px] font-bold rounded-xl border border-stone-200 hover:bg-stone-50 active:scale-[0.98] transition-all disabled:opacity-50"
                                    >
                                        <RotateCcw className="w-4 h-4" />
                                        Revert to Pending
                                    </button>
                                    <button
                                        disabled={isProcessing}
                                        onClick={() => handleReview(selectedRequest.id, "completed")}
                                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-green-700 text-white text-[13px] font-bold rounded-xl hover:bg-green-800 active:scale-[0.98] shadow-md shadow-green-700/20 transition-all disabled:opacity-50"
                                    >
                                        <GraduationCap className="w-4 h-4" />
                                        Mark Completed & Populate PDS
                                    </button>
                                </>
                            )}
                            {(selectedRequest.status === "rejected" || selectedRequest.status === "completed") && (
                                <button
                                    onClick={() => handleReview(selectedRequest.id, "pending")}
                                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-white text-stone-600 text-[13px] font-bold rounded-xl border border-stone-200 hover:bg-stone-50 active:scale-[0.98] transition-all"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                    Change Status
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
