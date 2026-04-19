"use client";

import React from "react";
import { DashboardStats, BudgetCard } from "@/components/dashboard/DashboardStats";
import { PersonnelCharts } from "@/components/dashboard/PersonnelCharts";
import { ComplianceSummary } from "@/components/dashboard/ComplianceSummary";

export default function PresidentDashboard() {
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
        </div>
    );
}
