import { NextResponse } from "next/server";

import { backendEnvelopeRequest, BackendApiError } from "@/lib/backend-api";

type RouteContext = {
    params: Promise<{ userNo: string }>;
};

export async function POST(_: Request, context: RouteContext) {
    try {
        const { userNo } = await context.params;

        const data = await backendEnvelopeRequest<unknown>(`/api/users/${encodeURIComponent(userNo)}/restore`, {
            method: "POST",
        });

        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        const status = error instanceof BackendApiError ? error.status : 500;
        const message = error instanceof Error ? error.message : "Failed to restore user.";

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