import { NextResponse } from "next/server";

import { getBackendApiBaseUrl } from "@/lib/backend-api";

function clean(value?: string | null): string {
    return (value || "").trim();
}

export async function GET(request: Request) {
    const url = new URL(request.url);
    const employeeNo = clean(url.searchParams.get("employeeNo"));
    const certificateId = clean(url.searchParams.get("certificateId"));

    if (!employeeNo || !certificateId) {
        return NextResponse.json(
            {
                success: false,
                message: "Missing required query parameters: employeeNo, certificateId.",
            },
            { status: 400 }
        );
    }

    const backendUrl = `${getBackendApiBaseUrl()}/api/certificates/${encodeURIComponent(employeeNo)}/${encodeURIComponent(certificateId)}/download`;
    const backendResponse = await fetch(backendUrl, {
        method: "GET",
        cache: "no-store",
    });

    if (!backendResponse.ok) {
        const contentType = backendResponse.headers.get("content-type") || "";
        if (contentType.toLowerCase().includes("application/json")) {
            const payload = await backendResponse.json();
            return NextResponse.json(payload, { status: backendResponse.status });
        }

        const message = await backendResponse.text();
        return NextResponse.json(
            {
                success: false,
                message: message || "Failed to download certificate file.",
            },
            { status: backendResponse.status }
        );
    }

    const fileBuffer = await backendResponse.arrayBuffer();
    const contentType = backendResponse.headers.get("content-type") || "application/octet-stream";
    const contentDisposition =
        backendResponse.headers.get("content-disposition") ||
        `attachment; filename="certificate-${certificateId}.bin"`;

    return new Response(fileBuffer, {
        status: 200,
        headers: {
            "Content-Type": contentType,
            "Content-Disposition": contentDisposition,
            "Cache-Control": "no-store",
        },
    });
}
