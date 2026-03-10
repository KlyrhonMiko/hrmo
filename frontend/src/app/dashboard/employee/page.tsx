"use client";

import React from 'react';
import { RoleLayout } from '@/components/layout/RoleLayout';

export default function EmployeeDashboard() {
    return (
        <RoleLayout userRole="Employee">
            <div className="space-y-8 pb-12">
                {/* Placeholder for employee specific dashboard widgets */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Welcome to your Dashboard</h3>
                    <p className="text-gray-600">
                        From here you can view your profile, manage your PDS, and view your training requests.
                    </p>
                </div>
            </div>
        </RoleLayout>
    );
}
