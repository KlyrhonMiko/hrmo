import { NextResponse } from "next/server";

import { backendEnvelopeRequest, BackendApiError } from "@/lib/backend-api";

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const query = url.searchParams.toString();
        const path = query ? `/api/users?${query}` : "/api/users";

        const data = await backendEnvelopeRequest<unknown>(path, {
            method: "GET",
        });

        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        const status = error instanceof BackendApiError ? error.status : 500;
        const message = error instanceof Error ? error.message : "Failed to load users.";

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

export async function POST(request: Request) {
    try {
        const payload = await request.json();

        const data = await backendEnvelopeRequest<unknown>("/api/users", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        return NextResponse.json(data, { status: 201 });
    } catch (error) {
        const status = error instanceof BackendApiError ? error.status : 500;
        const message = error instanceof Error ? error.message : "Failed to create user.";

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