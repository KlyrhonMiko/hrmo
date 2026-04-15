"use client";

import React, { useState } from 'react';
import type { ReportResult } from '@/types';
import { BarChart3, ChevronDown, Play, FileSearch } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export function ReportBuilder() {
    const PAGE_SIZE = 10;
    const [loading, setLoading] = useState(false);
    const [groupBy, setGroupBy] = useState('department');
    const [results, setResults] = useState<ReportResult[] | null>(null);
    const [page, setPage] = useState(1);

    const generateReport = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/reports/dynamic?groupBy=${groupBy}`);
            if (!response.ok) throw new Error('Network response not ok');
            const data = await response.json();
            setResults(data.data);
            setPage(1);
        } catch (error) {
            console.error('Failed to fetch report', error);
            alert('Error fetching report data');
        } finally {
            setLoading(false);
        }
    };

    const totalRows = results?.length || 0;
    const totalPages = totalRows > 0 ? Math.ceil(totalRows / PAGE_SIZE) : 1;
    const startIndex = (page - 1) * PAGE_SIZE;
    const pagedResults = (results || []).slice(startIndex, startIndex + PAGE_SIZE);

    return (
        <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 border-b border-slate-100">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
                        <BarChart3 className="w-[18px] h-[18px] text-slate-600" />
                    </div>
                    <div>
                        <h2 className="text-[15px] font-semibold text-slate-800">Dynamic Report Builder</h2>
                        <p className="text-[12px] text-slate-400">Generate aggregate counts by criteria</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <label className="block text-[11px] uppercase tracking-wider font-medium text-slate-400 mb-1.5">Group By</label>
                        <Select value={groupBy} onValueChange={(v) => { if (v) setGroupBy(v); }}>
                            <SelectTrigger className="w-[180px] bg-slate-50 border-slate-200 text-[13px] font-medium text-slate-700 h-9">
                                <SelectValue placeholder="Select criteria" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="department">Department</SelectItem>
                                <SelectItem value="status">Employment Status</SelectItem>
                                <SelectItem value="degree">Highest Degree</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="self-end">
                        <button
                            onClick={generateReport}
                            disabled={loading}
                            className="inline-flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white text-[13px] font-medium rounded-lg hover:bg-indigo-700 active:scale-[0.98] shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Play className="w-3.5 h-3.5" />
                            {loading ? 'Running...' : 'Run Report'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Results */}
            <div className="p-6">
                {results ? (
                    <div className="overflow-hidden rounded-lg border border-slate-200">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead>
                                <tr className="bg-slate-50">
                                    <th scope="col" className="px-5 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                                        {groupBy.charAt(0).toUpperCase() + groupBy.slice(1)}
                                    </th>
                                    <th scope="col" className="px-5 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                                        Headcount
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {pagedResults.map((item, idx) => (
                                    <tr key={idx} className={`transition-colors hover:bg-slate-50 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                                        <td className="px-5 py-3.5 text-[13px] font-medium text-slate-800">
                                            {item.group}
                                        </td>
                                        <td className="px-5 py-3.5 text-[13px] text-slate-600">
                                            <span className="inline-flex items-center min-w-[32px] justify-center px-2.5 py-0.5 rounded-md text-[12px] font-semibold bg-indigo-50 text-indigo-700">
                                                {item.value}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {results.length === 0 && (
                                    <tr>
                                        <td colSpan={2} className="px-5 py-10 text-center text-[13px] text-slate-400">
                                            No data found for this grouping.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                        {totalRows > 0 && (
                            <div className="px-5 py-3 border-t border-slate-200 flex items-center justify-between">
                                <p className="text-[12px] text-slate-400">
                                    Showing <span className="font-medium text-slate-600">{startIndex + 1}</span>-<span className="font-medium text-slate-600">{Math.min(startIndex + pagedResults.length, totalRows)}</span> of <span className="font-medium text-slate-600">{totalRows}</span> rows
                                </p>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                                        disabled={page <= 1}
                                        className="px-3 py-1.5 text-[12px] rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Prev
                                    </button>
                                    <span className="text-[12px] text-slate-500">Page {page} of {totalPages}</span>
                                    <button
                                        onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                                        disabled={page >= totalPages}
                                        className="px-3 py-1.5 text-[12px] rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mb-4">
                            <FileSearch className="w-6 h-6 text-slate-400" />
                        </div>
                        <p className="text-[13px] font-medium text-slate-500">No report generated yet</p>
                        <p className="text-[12px] text-slate-400 mt-1">Select parameters and click &quot;Run Report&quot; to view data</p>
                    </div>
                )}
            </div>
        </div>
    );
}
