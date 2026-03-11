"use client";

import React from "react";
import { RoleLayout } from "@/components/layout/RoleLayout";
import { DashboardStats, BudgetCard } from "@/components/dashboard/DashboardStats";
import { ComplianceSummary } from "@/components/dashboard/ComplianceSummary";

export default function LifelongHeadDashboard() {
    return (
        <RoleLayout userRole="Lifelong Head">
            <div className="space-y-6 pb-8">
                {/* KPI Cards */}
                <DashboardStats />

                {/* Budget + Compliance side by side */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <BudgetCard />
                    <ComplianceSummary />
                </div>
            </div>
        </RoleLayout>
    );
}
