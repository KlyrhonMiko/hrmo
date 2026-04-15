import { NextResponse } from "next/server";

import { backendRequest, BackendApiError } from "@/lib/backend-api";

export async function GET() {
    try {
        const data = await backendRequest<unknown>("/api/dashboard/pending-approvals");
        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        const status = error instanceof BackendApiError ? error.status : 500;
        const message = error instanceof Error ? error.message : "Failed to load pending approvals.";

        return NextResponse.json(
            {
                success: false,
                message,
                details: error instanceof BackendApiError ? error.details : undefined,
            },
            { status }
        );
    }
}
