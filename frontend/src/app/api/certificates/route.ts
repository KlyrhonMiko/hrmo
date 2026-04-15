import { NextResponse } from "next/server";

import type { CertificateRecord, PaginationMeta } from "@/types";
import { backendEnvelopeRequest, backendRequest, backendFormRequest, BackendApiError, getBackendApiBaseUrl } from "@/lib/backend-api";

type BackendEmployee = {
    id: string;
    employee_no: string;
    basic_information?: {
        full_name?: string | null;
        surname?: string | null;
        first_name?: string | null;
        middle_name?: string | null;
    } | null;
};

type BackendBasicInformation = {
    surname: string;
    first_name: string;
    middle_name?: string | null;
};

type BackendCertificate = {
    id: string;
    employee_id: string;
    certificate_type: string;
    issuing_body: string;
    certificate_no: string;
    date_issued: string;
    expiry_date?: string | null;
    description?: string | null;
    file?: string | null;
    verified_by?: string | null;
    verified_at?: string | null;
};

type CertificateEmployeeOption = {
    employeeId: string;
    employeeNo: string;
    name: string;
};

function clean(value?: string | null): string {
    return (value || "").trim();
}

function hasValue(value?: string | null): boolean {
    return clean(value).length > 0;
}

function buildEmployeeName(basicInfo?: BackendBasicInformation | null): string {
    if (!basicInfo) {
        return "Unnamed Employee";
    }

    const surname = basicInfo.surname || "";
    const first = basicInfo.first_name || "";
    const middle = basicInfo.middle_name || "";
    const middleInitial = middle ? `${middle.charAt(0)}.` : "";

    return `${surname}, ${first} ${middleInitial}`.trim().replace(/\s+/g, " ");
}

function inferCertificateCategory(value: string): CertificateRecord["category"] {
    const normalized = value.toLowerCase();
    if (normalized.includes("training") || normalized.includes("seminar") || normalized.includes("workshop")) {
        return "Training";
    }
    if (normalized.includes("eligibility") || normalized.includes("civil service")) {
        return "Eligibility";
    }
    if (normalized.includes("diploma") || normalized.includes("degree") || normalized.includes("academic")) {
        return "Academic";
    }
    if (normalized.includes("license") || normalized.includes("professional")) {
        return "Professional";
    }
    return "Other";
}

function inferCertificateStatus(expiryDate?: string | null, verifiedAt?: string | null): CertificateRecord["status"] {
    if (expiryDate) {
        const expiry = new Date(expiryDate);
        if (!Number.isNaN(expiry.getTime()) && expiry < new Date()) {
            return "Expired";
        }
    }

    if (verifiedAt) {
        return "Active";
    }

    return "Pending Verification";
}

function toCertificateFileUrl(relativePath?: string | null): string {
    if (!relativePath) {
        return "";
    }

    const normalized = relativePath.replace(/^\/+/, "");
    return `${getBackendApiBaseUrl()}/uploads/${normalized}`;
}

async function optionalRequest<T>(path: string, fallback: T): Promise<T> {
    try {
        return await backendRequest<T>(path);
    } catch (error) {
        if (error instanceof BackendApiError && error.status === 404) {
            return fallback;
        }
        throw error;
    }
}

async function loadEmployees(): Promise<CertificateEmployeeOption[]> {
    const response = await backendEnvelopeRequest<BackendEmployee[]>("/api/employees/all?skip=0&limit=500");
    const employees = response.data || [];

    return employees.map((employee) => {
        const basicInfo = employee.basic_information;
        const name =
            clean(basicInfo?.full_name) ||
            buildEmployeeName(
                basicInfo
                    ? {
                        surname: basicInfo.surname || "",
                        first_name: basicInfo.first_name || "",
                        middle_name: basicInfo.middle_name,
                    }
                    : null
            );

        return {
            employeeId: employee.id,
            employeeNo: employee.employee_no,
            name,
        };
    });
}

function mapCertificate(
    certificate: BackendCertificate,
    employeeNo: string,
    employeeName: string
): CertificateRecord {
    return {
        id: certificate.id,
        employeeId: employeeNo,
        employeeName,
        title: certificate.certificate_type,
        issuingBody: certificate.issuing_body,
        dateIssued: certificate.date_issued,
        expiryDate: certificate.expiry_date || undefined,
        certificateNumber: certificate.certificate_no,
        category: inferCertificateCategory(certificate.certificate_type),
        fileUrl: toCertificateFileUrl(certificate.file),
        fileName: certificate.file?.split("/").pop() || `${certificate.certificate_no}.pdf`,
        status: inferCertificateStatus(certificate.expiry_date, certificate.verified_at),
        verifiedBy: certificate.verified_by || undefined,
        verifiedAt: certificate.verified_at || undefined,
    };
}

async function loadCertificates(
    employeeOptions: CertificateEmployeeOption[],
    page: number,
    limit: number
): Promise<{ certificates: CertificateRecord[]; meta: PaginationMeta }> {
    const skip = (page - 1) * limit;
    const response = await backendEnvelopeRequest<BackendCertificate[]>(`/api/certificates/all?skip=${skip}&limit=${limit}`);
    const certificates = response.data || [];
    const responseMeta = (response.meta || {}) as Partial<PaginationMeta>;

    const employeeById = new Map(employeeOptions.map((employee) => [employee.employeeId, employee]));

    const mappedCertificates = certificates.map((certificate) => {
        const employee = employeeById.get(certificate.employee_id);
        const employeeNo = employee?.employeeNo || certificate.employee_id;
        const employeeName = employee?.name || "Unnamed Employee";
        return mapCertificate(certificate, employeeNo, employeeName);
    });

    const currentPage = responseMeta.current_page || page;
    const totalPages = responseMeta.total_pages || 0;
    const totalRecords = responseMeta.total_records || mappedCertificates.length;

    return {
        certificates: mappedCertificates,
        meta: {
            skip: responseMeta.skip ?? skip,
            limit: responseMeta.limit ?? limit,
            current_page: currentPage,
            total_pages: totalPages,
            total_records: totalRecords,
            has_previous: responseMeta.has_previous ?? currentPage > 1,
            has_next: responseMeta.has_next ?? (totalPages > 0 ? currentPage < totalPages : false),
        },
    };
}

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const page = Math.max(Number(url.searchParams.get("page") || "1") || 1, 1);
        const limit = Math.max(Number(url.searchParams.get("limit") || "10") || 10, 1);

        const employees = await loadEmployees();
        const { certificates, meta } = await loadCertificates(employees, page, limit);

        return NextResponse.json(
            {
                success: true,
                data: {
                    employees,
                    certificates,
                },
                meta,
            },
            { status: 200 }
        );
    } catch (error) {
        const status = error instanceof BackendApiError ? error.status : 500;
        const message = error instanceof Error ? error.message : "Failed to load certificates.";

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
        const incomingFormData = await request.formData();

        const employeeNo = clean(incomingFormData.get("employeeNo") as string | null);
        const certificateType = clean(incomingFormData.get("certificateType") as string | null);
        const issuingBody = clean(incomingFormData.get("issuingBody") as string | null);
        const certificateNo = clean(incomingFormData.get("certificateNo") as string | null);
        const dateIssued = clean(incomingFormData.get("dateIssued") as string | null);
        const expiryDate = clean(incomingFormData.get("expiryDate") as string | null);
        const description = clean(incomingFormData.get("description") as string | null);
        const file = incomingFormData.get("file");

        if (!hasValue(employeeNo) || !hasValue(certificateType) || !hasValue(certificateNo) || !hasValue(dateIssued)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Missing required fields: employeeNo, certificateType, certificateNo, dateIssued.",
                },
                { status: 400 }
            );
        }

        const backendFormData = new FormData();
        backendFormData.set("certificate_type", certificateType);
        backendFormData.set("issuing_body", issuingBody || "N/A");
        backendFormData.set("certificate_no", certificateNo);
        backendFormData.set("date_issued", dateIssued);

        if (hasValue(expiryDate)) {
            backendFormData.set("expiry_date", expiryDate);
        }

        if (hasValue(description)) {
            backendFormData.set("description", description);
        }

        if (file instanceof File) {
            backendFormData.set("file", file, file.name);
        }

        const created = await backendFormRequest<BackendCertificate>(
            `/api/certificates/${encodeURIComponent(employeeNo)}`,
            backendFormData,
            { method: "POST" }
        );

        const basicInfo = await optionalRequest<BackendBasicInformation | null>(
            `/api/basic-information/${encodeURIComponent(employeeNo)}`,
            null
        );

        const mappedCertificate = mapCertificate(
            created,
            employeeNo,
            buildEmployeeName(basicInfo)
        );

        return NextResponse.json({ success: true, data: mappedCertificate }, { status: 201 });
    } catch (error) {
        const status = error instanceof BackendApiError ? error.status : 500;
        const message = error instanceof Error ? error.message : "Failed to upload certificate.";

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

export async function PATCH(request: Request) {
    try {
        const incomingFormData = await request.formData();

        const employeeNo = clean(incomingFormData.get("employeeNo") as string | null);
        const certificateId = clean(incomingFormData.get("certificateId") as string | null);
        const certificateType = incomingFormData.get("certificateType");
        const issuingBody = incomingFormData.get("issuingBody");
        const certificateNo = incomingFormData.get("certificateNo");
        const dateIssued = incomingFormData.get("dateIssued");
        const expiryDate = incomingFormData.get("expiryDate");
        const description = incomingFormData.get("description");
        const verifiedBy = incomingFormData.get("verifiedBy");
        const verifiedAt = incomingFormData.get("verifiedAt");
        const file = incomingFormData.get("file");

        if (!hasValue(employeeNo) || !hasValue(certificateId)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Missing required fields: employeeNo, certificateId.",
                },
                { status: 400 }
            );
        }

        const backendFormData = new FormData();

        if (hasValue(certificateType as string | null)) {
            backendFormData.set("certificate_type", certificateType as string);
        }
        if (hasValue(issuingBody as string | null)) {
            backendFormData.set("issuing_body", issuingBody as string);
        }
        if (hasValue(certificateNo as string | null)) {
            backendFormData.set("certificate_no", certificateNo as string);
        }
        if (hasValue(dateIssued as string | null)) {
            backendFormData.set("date_issued", dateIssued as string);
        }
        if (hasValue(expiryDate as string | null)) {
            backendFormData.set("expiry_date", expiryDate as string);
        }
        if (hasValue(description as string | null)) {
            backendFormData.set("description", description as string);
        }
        if (hasValue(verifiedBy as string | null)) {
            backendFormData.set("verified_by", verifiedBy as string);
        }
        if (hasValue(verifiedAt as string | null)) {
            backendFormData.set("verified_at", verifiedAt as string);
        }

        if (file instanceof File) {
            backendFormData.set("file", file, file.name);
        }

        const updated = await backendFormRequest<BackendCertificate>(
            `/api/certificates/${encodeURIComponent(employeeNo)}/${encodeURIComponent(certificateId)}`,
            backendFormData,
            { method: "PATCH" }
        );

        const basicInfo = await optionalRequest<BackendBasicInformation | null>(
            `/api/basic-information/${encodeURIComponent(employeeNo)}`,
            null
        );

        return NextResponse.json(
            {
                success: true,
                data: mapCertificate(updated, employeeNo, buildEmployeeName(basicInfo)),
            },
            { status: 200 }
        );
    } catch (error) {
        const status = error instanceof BackendApiError ? error.status : 500;
        const message = error instanceof Error ? error.message : "Failed to update certificate.";

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
