import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import type { FullPDS } from "@/types";
import { backendRequest, BackendApiError } from "@/lib/backend-api";

type EmployeeMetaPayload = {
    employeeNo?: string;
    positionTitle?: string;
    dateHired?: string;
};

type OnboardRequestPayload = {
    formData: FullPDS;
    employeeMeta?: EmployeeMetaPayload;
};

export async function POST(request: Request) {
    try {
        const body = (await request.json()) as OnboardRequestPayload;

        if (!body?.formData) {
            return NextResponse.json(
                {
                    success: false,
                    stage: "validate_payload",
                    message: "Missing formData payload.",
                },
                { status: 400 }
            );
        }

        // Forward the auth token so the backend can self-link the employee record
        const cookieStore = await cookies();
        const token = cookieStore.get("hrmo_token")?.value;
        const authHeader: Record<string, string> = token
            ? { Authorization: `Bearer ${token}` }
            : {};

        const result = await backendRequest<{
            employeeNo: string;
            stages: Array<{ stage: string; created: number; skipped: number }>;
        }>("/api/employees/onboard-atomic", {
            method: "POST",
            headers: { "Content-Type": "application/json", ...authHeader },
            body: JSON.stringify(body),
        });

        return NextResponse.json(
            {
                success: true,
                message: "Employee onboarding completed successfully.",
                data: result,
            },
            { status: 201 }
        );
    } catch (error) {
        if (error instanceof BackendApiError) {
            const details =
                error.details && typeof error.details === "object" && "message" in (error.details as Record<string, unknown>)
                    ? (error.details as Record<string, unknown>)
                    : null;

            return NextResponse.json(
                {
                    success: false,
                    stage: "onboard_atomic",
                    message: (details?.message as string) || error.message,
                    details: error.details,
                    stages: details?.stages || [],
                },
                { status: error.status }
            );
        }

        return NextResponse.json(
            {
                success: false,
                stage: "onboard_atomic",
                message: "Failed to onboard employee.",
                error: error instanceof Error ? error.message : "Unknown error",
                stages: [],
            },
            { status: 500 }
        );
    }
}
