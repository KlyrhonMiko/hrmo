"use client";

import React, { useState, useEffect, useRef } from "react";
import {
    X,
    FileText,
    Sparkles,
} from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface CreateReportModalProps {
    open: boolean;
    onClose: () => void;
    onCreated: () => void;
}

export function CreateReportModal({
    open,
    onClose,
    onCreated,
}: CreateReportModalProps) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [groupBy, setGroupBy] = useState("department");
    const [submitting, setSubmitting] = useState(false);
    const [visible, setVisible] = useState(false);
    const titleRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (open) {
            requestAnimationFrame(() => setVisible(true));
            setTimeout(() => titleRef.current?.focus(), 150);
        } else {
            setVisible(false);
        }
    }, [open]);

    const handleClose = () => {
        setVisible(false);
        setTimeout(onClose, 200);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;
        setSubmitting(true);

        try {
            const res = await fetch("/api/reports", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: title.trim(), description: description.trim(), groupBy }),
            });
            if (!res.ok) throw new Error("Failed to create report");
            setTitle("");
            setDescription("");
            setGroupBy("department");
            onCreated();
            handleClose();
        } catch (err) {
            console.error(err);
            alert("Failed to create report. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    if (!open) return null;

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-200 ${visible ? "bg-black/30 backdrop-blur-[2px]" : "bg-transparent"}`}
            onClick={handleClose}
        >
            <div
                className={`bg-white rounded-2xl shadow-2xl border border-slate-200/80 w-full max-w-lg mx-4 transform transition-all duration-200 ${visible ? "scale-100 opacity-100 translate-y-0" : "scale-95 opacity-0 translate-y-4"}`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center">
                            <Sparkles className="w-[18px] h-[18px] text-indigo-600" />
                        </div>
                        <div>
                            <h2 className="text-[15px] font-semibold text-slate-800">
                                Create Report
                            </h2>
                            <p className="text-[12px] text-slate-400">
                                Generate a new personnel report
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Title */}
                    <div>
                        <label className="block text-[11px] uppercase tracking-wider font-medium text-slate-400 mb-1.5">
                            Report Title <span className="text-red-400">*</span>
                        </label>
                        <input
                            ref={titleRef}
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Q1 2026 Department Headcount"
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[13px] text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
                            required
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-[11px] uppercase tracking-wider font-medium text-slate-400 mb-1.5">
                            Description
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Brief summary of this report's purpose..."
                            rows={3}
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[13px] text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all resize-none"
                        />
                    </div>

                    {/* Group By */}
                    <div>
                        <label className="block text-[11px] uppercase tracking-wider font-medium text-slate-400 mb-1.5">
                            Group By <span className="text-red-400">*</span>
                        </label>
                        <Select value={groupBy} onValueChange={(v) => { if (v) setGroupBy(v); }}>
                            <SelectTrigger className="w-full bg-slate-50 border-slate-200 text-[13px] font-medium text-slate-700 h-10">
                                <SelectValue placeholder="Select criteria" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="department">
                                    <div className="flex items-center gap-2">
                                        <FileText className="w-3.5 h-3.5 text-slate-400" />
                                        Department
                                    </div>
                                </SelectItem>
                                <SelectItem value="status">
                                    <div className="flex items-center gap-2">
                                        <FileText className="w-3.5 h-3.5 text-slate-400" />
                                        Employment Status
                                    </div>
                                </SelectItem>
                                <SelectItem value="degree">
                                    <div className="flex items-center gap-2">
                                        <FileText className="w-3.5 h-3.5 text-slate-400" />
                                        Highest Degree
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-4 py-2.5 text-[13px] font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting || !title.trim()}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-[13px] font-medium rounded-lg hover:bg-indigo-700 active:scale-[0.98] shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Sparkles className="w-3.5 h-3.5" />
                            {submitting ? "Creating..." : "Create Report"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
