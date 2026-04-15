import { NextResponse } from "next/server";

import { backendRequest, BackendApiError } from "@/lib/backend-api";

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const limit = Math.max(Number(url.searchParams.get("limit") || "10") || 10, 1);
        const data = await backendRequest<unknown>(`/api/dashboard/recent-activity?limit=${limit}`);
        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        const status = error instanceof BackendApiError ? error.status : 500;
        const message = error instanceof Error ? error.message : "Failed to load recent activity.";

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
