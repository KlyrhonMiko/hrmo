import { NextRequest, NextResponse } from "next/server";
import { backendEnvelopeRequest } from "@/lib/backend-api";

export async function POST(
    req: NextRequest,
    context: { params: Promise<{ employeeNo: string }> }
) {
    const { employeeNo } = await context.params;

    const token = req.cookies.get("hrmo_token")?.value;

    try {
        const payload = await backendEnvelopeRequest(
            `/api/employees/${employeeNo}/verify`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                // If there's an expected body, add here. But typically verify uses the JWT of current_user attached automatically by backendEnvelopeRequest.
            }
        );

        return NextResponse.json(payload);
    } catch (e: unknown) {
        const err = e as Error;
        console.error(`Verification proxy error for ${employeeNo}:`, err);
        return NextResponse.json(
            { success: false, message: err.message || "Failed to verify employee" },
            { status: 500 }
        );
    }
}
