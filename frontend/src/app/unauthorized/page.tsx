"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { getStoredUser, ROLE_HOME } from "@/lib/auth";
import type { BackendRole } from "@/lib/auth";
import { ShieldX, ArrowLeft } from "lucide-react";

export default function UnauthorizedPage() {
    const router = useRouter();

    function handleBack() {
        const user = getStoredUser();
        if (user) {
            const home = ROLE_HOME[user.role as BackendRole];
            if (home) {
                router.replace(home);
                return;
            }
        }
        router.replace("/auth/login");
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-stone-50">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-stone-200 p-10 text-center space-y-5">
                <div className="flex justify-center">
                    <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center">
                        <ShieldX className="w-8 h-8 text-red-500" />
                    </div>
                </div>

                <div>
                    <h1 className="text-xl font-bold text-stone-900">Access Denied</h1>
                    <p className="text-sm text-stone-500 mt-1.5">
                        You don&apos;t have permission to access this page.
                        <br />
                        You&apos;ll be redirected to your dashboard.
                    </p>
                </div>

                <button
                    onClick={handleBack}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-700 text-white text-sm font-semibold rounded-xl hover:bg-green-800 transition-colors shadow-sm"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to My Dashboard
                </button>
            </div>
        </div>
    );
}
