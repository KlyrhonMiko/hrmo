"use client";

import React from "react";
import { RoleLayout } from "@/components/layout/RoleLayout";
import { DashboardStats, BudgetCard } from "@/components/dashboard/DashboardStats";
import { PersonnelCharts } from "@/components/dashboard/PersonnelCharts";
import { ComplianceSummary } from "@/components/dashboard/ComplianceSummary";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { PendingApprovals } from "@/components/dashboard/PendingApprovals";

export default function HRMODashboard() {
    return (
        <RoleLayout userRole="HR Head">
            <div className="space-y-6 pb-8">
                {/* KPI Cards */}
                <DashboardStats />

                {/* Main content — charts left, sidebar right */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    {/* Charts — takes 2/3 */}
                    <div className="xl:col-span-2">
                        <PersonnelCharts />
                    </div>

                    {/* Right sidebar — budget + compliance */}
                    <div className="space-y-5">
                        <BudgetCard />
                        <ComplianceSummary />
                    </div>
                </div>

                {/* Bottom row — activity feed + pending approvals + quick actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-6">
                    <div className="xl:col-span-5">
                        <RecentActivity />
                    </div>
                    <div className="xl:col-span-4">
                        <PendingApprovals />
                    </div>
                    <div className="xl:col-span-3">
                        <QuickActions />
                    </div>
                </div>
            </div>
        </RoleLayout>
    );
}
