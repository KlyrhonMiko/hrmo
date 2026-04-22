import { NextResponse } from "next/server";

import { backendEnvelopeRequest, BackendApiError } from "@/lib/backend-api";

type RouteContext = {
    params: Promise<{ userNo: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
    try {
        const { userNo } = await context.params;
        const payload = await request.json();

        const data = await backendEnvelopeRequest<unknown>(`/api/users/${encodeURIComponent(userNo)}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        const status = error instanceof BackendApiError ? error.status : 500;
        const message = error instanceof Error ? error.message : "Failed to update user.";

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

export async function DELETE(_: Request, context: RouteContext) {
    try {
        const { userNo } = await context.params;

        await backendEnvelopeRequest<unknown>(`/api/users/${encodeURIComponent(userNo)}`, {
            method: "DELETE",
        });

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        const status = error instanceof BackendApiError ? error.status : 500;
        const message = error instanceof Error ? error.message : "Failed to deactivate user.";

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