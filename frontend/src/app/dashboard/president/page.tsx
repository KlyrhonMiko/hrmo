"use client";

import React from 'react';
import { RoleLayout } from '@/components/layout/RoleLayout';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { ReportBuilder } from '@/components/reports/ReportBuilder';

export default function PresidentDashboard() {
    return (
        <RoleLayout userRole="President">
            <div className="space-y-8 pb-12">
                <DashboardStats />
                <ReportBuilder />
            </div>
        </RoleLayout>
    );
}
