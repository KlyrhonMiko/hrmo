import { NextResponse } from "next/server";
import { backendEnvelopeRequest, BackendApiError } from "@/lib/backend-api";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ employeeNo: string }> }
) {
    try {
        const { employeeNo } = await params;
        const res = await backendEnvelopeRequest(`/api/basic-information/${employeeNo}`);
        return NextResponse.json(res);
    } catch (error) {
        const status = error instanceof BackendApiError ? error.status : 500;
        return NextResponse.json(
            { success: false, message: error instanceof Error ? error.message : "Internal Server Error" },
            { status }
        );
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ employeeNo: string }> }
) {
    try {
        const { employeeNo } = await params;
        const body = await request.json();
        const res = await backendEnvelopeRequest(`/api/basic-information/${employeeNo}`, {
            method: "PATCH",
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
