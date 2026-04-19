"use client";

import React from "react";
import { DashboardStats, BudgetCard } from "@/components/dashboard/DashboardStats";
import { PersonnelCharts } from "@/components/dashboard/PersonnelCharts";
import { ComplianceSummary } from "@/components/dashboard/ComplianceSummary";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { PendingApprovals } from "@/components/dashboard/PendingApprovals";

export default function HRMODashboard() {
    return (
        <div className="space-y-6 pb-8">
            <DashboardStats />

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2">
                    <PersonnelCharts />
                </div>
                <div className="space-y-5">
                    <BudgetCard />
                    <ComplianceSummary />
                </div>
            </div>

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
    );
}
