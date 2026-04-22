import { NextResponse } from "next/server";
import { backendEnvelopeRequest, BackendApiError } from "@/lib/backend-api";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ employeeNo: string }> }
) {
    try {
        const { employeeNo } = await params;
        const res = await backendEnvelopeRequest(`/api/addresses/${employeeNo}`);
        return NextResponse.json(res);
    } catch (error) {
        const status = error instanceof BackendApiError ? error.status : 500;
        return NextResponse.json(
            { success: false, message: error instanceof Error ? error.message : "Internal Server Error" },
            { status }
        );
    }
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ employeeNo: string }> }
) {
    try {
        const { employeeNo } = await params;
        const body = await request.json();
        const res = await backendEnvelopeRequest(`/api/addresses/${employeeNo}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });
        return NextResponse.json(res);
    } catch (error) {
        const status = error instanceof BackendApiError ? error.status : 500;
        return NextResponse.json(
            { success: false, message: error instanceof Error ? error.message : "Internal Server Error" },
            { status }
        );
    }
}
