"use client";

import React from "react";
import { RoleLayout } from "@/components/layout/RoleLayout";
import { DashboardStats, BudgetCard } from "@/components/dashboard/DashboardStats";
import { PersonnelCharts } from "@/components/dashboard/PersonnelCharts";
import { ComplianceSummary } from "@/components/dashboard/ComplianceSummary";

export default function PresidentDashboard() {
    React.useEffect(() => {
        if (typeof window !== 'undefined') localStorage.setItem('userRole', 'President');
    }, []);

    return (
        <RoleLayout userRole="President">
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
            </div>
        </RoleLayout>
    );
}
