"use client";

import React, { ReactNode } from 'react';
import type { Role } from '@/types';
import Link from 'next/link';
import {
    LayoutDashboard,
    FileBarChart,
    UserPlus,
    Users,
    Wallet,
    GraduationCap,
    ClipboardList,
    User,
    LogOut,
    type LucideIcon,
} from 'lucide-react';

interface NavLink {
    href: string;
    label: string;
    icon: LucideIcon;
}

interface RoleLayoutProps {
    children: ReactNode;
    userRole: Role;
}

export function RoleLayout({ children, userRole }: RoleLayoutProps) {
    const navLinks: NavLink[] = [];

    if (userRole === 'HR Head') {
        navLinks.push({ href: '/dashboard/hrmo', label: 'Dashboard', icon: LayoutDashboard });
    } else if (userRole === 'Lifelong Head') {
        navLinks.push({ href: '/dashboard/lifelong-head', label: 'Dashboard', icon: LayoutDashboard });
    } else if (userRole === 'President') {
        navLinks.push({ href: '/dashboard/president', label: 'Dashboard', icon: LayoutDashboard });
    } else if (userRole === 'Employee') {
        navLinks.push({ href: '/dashboard/employee', label: 'Dashboard', icon: LayoutDashboard });
    }

    if (['HR Head', 'President', 'Lifelong Head'].includes(userRole)) {
        navLinks.push({ href: '/reports', label: 'Reports', icon: FileBarChart });
    }

    if (userRole === 'HR Head') {
        navLinks.push({ href: '/employees/onboard', label: 'Onboard Employee', icon: UserPlus });
        navLinks.push({ href: '/employees/directory', label: 'Employee Directory', icon: Users });
    }

    if (userRole === 'Lifelong Head' || userRole === 'HR Head') {
        navLinks.push({ href: '/training/budget', label: 'Training Budget', icon: Wallet });
        navLinks.push({ href: '/training/requests', label: 'Training Requests', icon: ClipboardList });
    }

    if (userRole === 'Employee') {
        navLinks.push({ href: '/my-pds', label: 'My PDS', icon: User });
        navLinks.push({ href: '/training/my-requests', label: 'My Training', icon: GraduationCap });
    }

    const today = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return (
        <div className="flex h-screen bg-stone-50">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-stone-200 flex flex-col">
                {/* Brand */}
                <div className="h-16 flex items-center gap-3 px-6 border-b border-stone-100">
                    <div className="w-8 h-8 rounded-lg bg-green-700 flex items-center justify-center">
                        <span className="text-white font-bold text-sm">HR</span>
                    </div>
                    <div>
                        <h1 className="text-sm font-semibold text-stone-900 leading-none">HRMO System</h1>
                        <p className="text-[11px] text-stone-400 mt-0.5">{userRole}</p>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                    {navLinks.map((link) => {
                        const Icon = link.icon;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="group flex items-center gap-3 px-3 py-2.5 text-[13px] font-medium text-stone-600 rounded-lg hover:bg-green-50 hover:text-green-700 transition-all duration-200"
                            >
                                <Icon className="w-[18px] h-[18px] text-stone-400 group-hover:text-green-700 transition-colors duration-200" />
                                {link.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* Sign Out */}
                <div className="px-3 py-4 border-t border-stone-100">
                    <button className="w-full flex items-center gap-3 px-3 py-2.5 text-[13px] font-medium text-stone-500 rounded-lg hover:bg-red-50 hover:text-red-600 transition-all duration-200">
                        <LogOut className="w-[18px] h-[18px]" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden">
                <header className="h-16 bg-white border-b border-stone-200 flex items-center justify-between px-8">
                    <div>
                        <h2 className="text-[15px] font-semibold text-stone-800">
                            Welcome back, {userRole}
                        </h2>
                        <p className="text-[12px] text-stone-400">{today}</p>
                    </div>
                </header>
                <div className="flex-1 overflow-auto p-8 bg-stone-50">
                    {children}
                </div>
            </main>
        </div>
    );
}
