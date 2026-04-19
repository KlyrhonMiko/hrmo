import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { backendRequest, BackendApiError, backendEnvelopeRequest } from "@/lib/backend-api";

export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("hrmo_token")?.value;

        if (!token) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        const result = await backendEnvelopeRequest("/api/employees/me/pds", {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        return NextResponse.json(result);
    } catch (error) {
        if (error instanceof BackendApiError) {
            return NextResponse.json(
                { success: false, message: error.message, details: error.details },
                { status: error.status }
            );
        }

        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch PDS data",
                error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}
