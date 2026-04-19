"use client";

import React, { ReactNode } from 'react';
import type { Role } from '@/types';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { logout } from '@/lib/auth';
import {
    LayoutDashboard,
    FileBarChart,
    UserPlus,
    Users,
    GraduationCap,
    User,
    LogOut,
    ScanLine,
    FolderOpen,
    ClipboardList,
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
    readOnly?: boolean;
}

/** URL prefix per frontend Role */
const ROLE_URL_PREFIX: Record<Role, string> = {
    'HR Head':        '/hrmo',
    'HR Record Asst': '/hr-record-asst',
    'President':      '/president',
    'Employee':       '/employee',
};

export function RoleLayout({ children, userRole, readOnly = false }: RoleLayoutProps) {
    const pathname = usePathname();
    const router   = useRouter();
    const prefix   = ROLE_URL_PREFIX[userRole];
    const navLinks: NavLink[] = [];

    // Dashboard — every role
    navLinks.push({ href: `${prefix}/dashboard`, label: 'Dashboard', icon: LayoutDashboard });

    // HR Head & HR Record Asst: PDS Data Entry (onboard)
    if (userRole === 'HR Head' || userRole === 'HR Record Asst') {
        navLinks.push({ href: `${prefix}/onboard`, label: 'PDS Data Entry', icon: UserPlus });
    }

    // HR Head only: User Management
    if (userRole === 'HR Head') {
        navLinks.push({ href: `${prefix}/users`, label: 'User Management', icon: Users });
    }


    // Admin roles: shared data pages
    if (userRole === 'HR Head' || userRole === 'HR Record Asst' || userRole === 'President') {
        navLinks.push({ href: `${prefix}/directory`,            label: 'Employee 201',      icon: FolderOpen });
        navLinks.push({ href: `${prefix}/certificates`,         label: 'Certificates / MOV', icon: ScanLine });
        navLinks.push({ href: `${prefix}/training/tracking`,    label: 'Training Tracking',  icon: GraduationCap });
        
        if (userRole !== 'President') {
            navLinks.push({ href: `${prefix}/training/requests`, label: 'Training Requests',  icon: ClipboardList });
        }
        
        navLinks.push({ href: `${prefix}/reports`,              label: 'Reports',            icon: FileBarChart });
    }

    // Employee-specific pages
    if (userRole === 'Employee') {
        navLinks.push({ href: `${prefix}/my-pds`,                  label: 'My 201 File',   icon: User });
        navLinks.push({ href: `${prefix}/onboard`,                  label: 'My Profile',    icon: ClipboardList });
        navLinks.push({ href: `${prefix}/training/my-requests`,     label: 'My Training',   icon: GraduationCap });
    }

    const today = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    async function handleSignOut() {
        await logout();
        router.push('/auth/login');
    }

    return (
        <div className="flex h-screen bg-stone-50">
            <aside className="w-64 bg-white border-r border-stone-200 flex flex-col">
                <div className="h-16 flex items-center gap-3 px-6 border-b border-stone-100">
                    <div className="w-8 h-8 rounded-lg bg-green-700 flex items-center justify-center">
                        <span className="text-white font-bold text-sm">HR</span>
                    </div>
                    <div>
                        <h1 className="text-sm font-semibold text-stone-900 leading-none">HRMO System</h1>
                        <p className="text-[11px] text-stone-400 mt-0.5">
                            {userRole}{readOnly ? ' · Read Only' : ''}
                        </p>
                    </div>
                </div>

                <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                    {navLinks.map((link) => {
                        const Icon = link.icon;
                        const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`group flex items-center gap-3 px-3 py-2.5 text-[13px] font-medium rounded-lg transition-all duration-200 ${isActive
                                    ? 'bg-green-50 text-green-700'
                                    : 'text-stone-600 hover:bg-green-50 hover:text-green-700'
                                    }`}
                            >
                                <Icon className={`w-[18px] h-[18px] transition-colors duration-200 ${isActive ? 'text-green-700' : 'text-stone-400 group-hover:text-green-700'
                                    }`} />
                                {link.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="px-3 py-4 border-t border-stone-100">
                    <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-[13px] font-medium text-stone-500 rounded-lg hover:bg-red-50 hover:text-red-600 transition-all duration-200"
                    >
                        <LogOut className="w-[18px] h-[18px]" />
                        Sign Out
                    </button>
                </div>
            </aside>

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
