import { NextResponse } from "next/server";

import type { CertificateRecord } from "@/types";
import { backendRequest, backendFormRequest, BackendApiError, getBackendApiBaseUrl } from "@/lib/backend-api";

type BackendEmployee = {
    employee_no: string;
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
};

type CertificateEmployeeOption = {
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

function inferCertificateStatus(expiryDate?: string | null): CertificateRecord["status"] {
    if (!expiryDate) {
        return "Active";
    }

    const expiry = new Date(expiryDate);
    if (Number.isNaN(expiry.getTime())) {
        return "Active";
    }

    return expiry < new Date() ? "Expired" : "Active";
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
    const employees = await backendRequest<BackendEmployee[]>("/api/employees?skip=0&limit=500");

    const options = await Promise.all(
        employees.map(async (employee) => {
            const basicInfo = await optionalRequest<BackendBasicInformation | null>(
                `/api/basic-information/${encodeURIComponent(employee.employee_no)}`,
                null
            );

            return {
                employeeNo: employee.employee_no,
                name: buildEmployeeName(basicInfo),
            };
        })
    );

    return options;
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
        status: inferCertificateStatus(certificate.expiry_date),
    };
}

async function loadCertificates(employeeOptions: CertificateEmployeeOption[]): Promise<CertificateRecord[]> {
    const byEmployee = await Promise.all(
        employeeOptions.map(async (employee) => {
            const certificates = await optionalRequest<BackendCertificate[]>(
                `/api/certificates/${encodeURIComponent(employee.employeeNo)}?skip=0&limit=200`,
                []
            );

            return certificates.map((certificate) =>
                mapCertificate(certificate, employee.employeeNo, employee.name)
            );
        })
    );

    return byEmployee.flat();
}

export async function GET() {
    try {
        const employees = await loadEmployees();
        const certificates = await loadCertificates(employees);

        return NextResponse.json(
            {
                success: true,
                data: {
                    employees,
                    certificates,
                },
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
