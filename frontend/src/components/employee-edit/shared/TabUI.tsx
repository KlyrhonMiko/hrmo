"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon, Loader2, Save, CheckCircle2 } from "lucide-react";

// --- TabSection component ---
interface TabSectionProps {
    title: string;
    icon: LucideIcon;
    children: React.ReactNode;
    className?: string;
}

export function TabSection({ title, icon: Icon, children, className }: TabSectionProps) {
    return (
        <div className={cn(
            "bg-white rounded-2xl border border-stone-200/80 shadow-sm overflow-hidden transition-all hover:shadow-md hover:border-stone-300",
            className
        )}>
            <div className="px-5 py-4 border-b border-stone-100 bg-stone-50/50 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white border border-stone-200 flex items-center justify-center shadow-sm">
                    <Icon className="w-4 h-4 text-stone-600" />
                </div>
                <h3 className="text-[13px] font-bold text-stone-700 uppercase tracking-wider">{title}</h3>
            </div>
            <div className="p-6">
                {children}
            </div>
        </div>
    );
}

// --- TabField component ---
interface TabFieldProps {
    label: string;
    value: any;
    onChange: (v: string) => void;
    type?: string;
    placeholder?: string;
    step?: string | number;
    className?: string;
    icon?: LucideIcon;
}

export function TabField({ label, value, onChange, type = "text", placeholder, step, className, icon: Icon }: TabFieldProps) {
    return (
        <div className={cn("space-y-1.5 w-full", className)}>
            <label className="text-[10px] font-bold text-stone-500 uppercase tracking-tight ml-1 flex items-center gap-1">
                {Icon && <Icon className="w-3 h-3 text-stone-400" />}
                {label}
            </label>
            <input 
                type={type} 
                step={step}
                value={value !== null && value !== undefined ? value : ""} 
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full px-4 py-2.5 bg-stone-50/50 border border-stone-200 rounded-xl text-[13px] text-stone-800 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-green-600/10 focus:border-green-600 focus:bg-white transition-all shadow-inner-sm"
            />
        </div>
    );
}

// --- TabSelect component ---
interface TabSelectProps {
    label: string;
    value: any;
    onChange: (v: string) => void;
    options: { value: string; label: string }[];
    placeholder?: string;
    className?: string;
    icon?: LucideIcon;
}

export function TabSelect({ label, value, onChange, options, placeholder, className, icon: Icon }: TabSelectProps) {
    return (
        <div className={cn("space-y-1.5 w-full", className)}>
            <label className="text-[10px] font-bold text-stone-500 uppercase tracking-tight ml-1 flex items-center gap-1">
                {Icon && <Icon className="w-3 h-3 text-stone-400" />}
                {label}
            </label>
            <select 
                value={value !== null && value !== undefined ? value : ""} 
                onChange={(e) => onChange(e.target.value)}
                className="w-full px-4 py-2.5 bg-stone-50/50 border border-stone-200 rounded-xl text-[13px] text-stone-800 focus:outline-none focus:ring-2 focus:ring-green-600/10 focus:border-green-600 focus:bg-white transition-all shadow-inner-sm appearance-none cursor-pointer"
            >
                {placeholder && <option value="" disabled>{placeholder}</option>}
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
        </div>
    );
}

// --- TabSaveBar component ---
interface TabSaveBarProps {
    title: string;
    subtitle: string;
    saving: boolean;
    error: string | null;
    showSuccess: boolean;
    onSave: () => void;
    buttonLabel?: string;
    buttonIcon?: LucideIcon;
    variant?: "green" | "emerald" | "blue" | "indigo" | "amber" | "red" | "stone";
}

export function TabSaveBar({ 
    title, 
    subtitle, 
    saving, 
    error, 
    showSuccess, 
    onSave, 
    buttonLabel = "Save Changes", 
    buttonIcon: BtnIcon = Save,
    variant = "green"
}: TabSaveBarProps) {
    const variants = {
        green: "bg-green-700 hover:bg-green-800 shadow-green-600/20",
        emerald: "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20",
        blue: "bg-blue-600 hover:bg-blue-700 shadow-blue-600/20",
        indigo: "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20",
        amber: "bg-amber-600 hover:bg-amber-700 shadow-amber-600/20",
        red: "bg-red-600 hover:bg-red-700 shadow-red-600/20",
        stone: "bg-stone-800 hover:bg-black shadow-stone-600/20"
    };

    return (
        <div className="sticky bottom-0 bg-white/80 backdrop-blur-md border border-stone-200 p-4 rounded-2xl shadow-lg flex flex-col sm:flex-row items-center justify-between z-10 mt-auto">
            <div className="flex flex-col mb-4 sm:mb-0">
                <h4 className="text-[13px] font-bold text-stone-800">{title}</h4>
                <p className="text-[11px] text-stone-500">{subtitle}</p>
            </div>
            
            <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
                {error && (
                    <span className="text-[12px] text-red-500 font-medium bg-red-50 px-3 py-1.5 rounded-lg border border-red-100 animate-pulse hidden md:inline-block max-w-[300px] truncate">
                        {error}
                    </span>
                )}
                {showSuccess && (
                    <span className="flex items-center gap-1.5 text-[12px] text-emerald-600 font-bold bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 animate-in fade-in zoom-in duration-300">
                        <CheckCircle2 className="w-4 h-4" />
                        Changes saved successfully!
                    </span>
                )}
                <button 
                    onClick={onSave} 
                    disabled={saving}
                    className={cn(
                        "inline-flex items-center gap-2 px-8 py-2.5 rounded-xl text-[13px] font-bold transition-all active:scale-95 shadow-sm min-w-[180px] justify-center text-white",
                        saving ? "bg-stone-100 text-stone-400 cursor-not-allowed" : variants[variant]
                    )}
                >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <BtnIcon className="w-4 h-4" />}
                    {saving ? "Saving..." : buttonLabel}
                </button>
            </div>
            {error && (
                <div className="w-full mt-2 md:hidden">
                    <span className="text-[11px] text-red-500 font-medium bg-red-50 px-3 py-1.5 rounded-lg border border-red-100 block text-center">
                        {error}
                    </span>
                </div>
            )}
        </div>
    );
}

// --- TabContainer component for consistent min-height ---
export function TabContainer({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={cn(
            "flex flex-col min-h-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12",
            className
        )}>
            {children}
        </div>
    );
}
