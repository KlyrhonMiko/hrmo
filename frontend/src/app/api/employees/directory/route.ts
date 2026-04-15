import { NextResponse } from "next/server";

import type { Employee201, CertificateRecord, TrainingRecord, PaginationMeta } from "@/types";
import { backendEnvelopeRequest, backendRequest, BackendApiError, getBackendApiBaseUrl } from "@/lib/backend-api";

type BackendEmployee = {
    id: string;
    employee_no: string;
    office_department: string;
    position_title: string;
    employment_status: Employee201["employmentStatus"];
    date_hired: string;
    is_deleted: boolean;
};

type BackendBasicInformation = {
    surname: string;
    first_name: string;
    middle_name?: string | null;
};

type BackendContactInformation = {
    email_address: string;
    mobile_no: string;
};

type BackendCertificate = {
    id: string;
    certificate_type: string;
    issuing_body: string;
    date_issued: string;
    expiry_date?: string | null;
    certificate_no: string;
    file?: string | null;
};

type BackendTraining = {
    id: string;
    training_title: string;
    training_type: string;
    conducted_by: string;
    date_from: string;
    date_to: string;
    number_of_hours: string;
};

const TRAINING_TYPES: TrainingRecord["type"][] = [
    "Seminar",
    "Workshop",
    "Conference",
    "Webinar",
    "Certification",
    "Other",
];

function toTrainingType(value: string): TrainingRecord["type"] {
    const normalized = value.trim().toLowerCase();
    const match = TRAINING_TYPES.find((type) => type.toLowerCase() === normalized);
    return match || "Other";
}

function buildFullName(basicInfo?: BackendBasicInformation | null): string {
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

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const page = Math.max(Number(url.searchParams.get("page") || "1") || 1, 1);
        const limit = Math.max(Number(url.searchParams.get("limit") || "10") || 10, 1);
        const skip = (page - 1) * limit;

        const employeesResponse = await backendEnvelopeRequest<BackendEmployee[]>(
            `/api/employees?skip=${skip}&limit=${limit}`
        );
        const employees = employeesResponse.data || [];

        const defaultMeta: PaginationMeta = {
            skip,
            limit,
            current_page: page,
            total_pages: 0,
            total_records: employees.length,
            has_previous: page > 1,
            has_next: false,
        };
        const meta = (employeesResponse.meta as PaginationMeta | undefined) || defaultMeta;

        const mappedEmployees = await Promise.all(
            employees.map(async (employee): Promise<Employee201> => {
                const employeeNo = employee.employee_no;

                const [basicInfo, contactInfo, certificates, trainingRecords] = await Promise.all([
                    optionalRequest<BackendBasicInformation | null>(
                        `/api/basic-information/${encodeURIComponent(employeeNo)}`,
                        null
                    ),
                    optionalRequest<BackendContactInformation | null>(
                        `/api/contact-information/${encodeURIComponent(employeeNo)}`,
                        null
                    ),
                    optionalRequest<BackendCertificate[]>(
                        `/api/certificates/${encodeURIComponent(employeeNo)}?skip=0&limit=200`,
                        []
                    ),
                    optionalRequest<BackendTraining[]>(
                        `/api/training/${encodeURIComponent(employeeNo)}`,
                        []
                    ),
                ]);

                const fullName = buildFullName(basicInfo);

                const mappedCertificates: CertificateRecord[] = certificates.map((certificate) => {
                    const fileUrl = toCertificateFileUrl(certificate.file);
                    return {
                        id: certificate.id,
                        employeeId: employeeNo,
                        employeeName: fullName,
                        title: certificate.certificate_type,
                        issuingBody: certificate.issuing_body,
                        dateIssued: certificate.date_issued,
                        expiryDate: certificate.expiry_date || undefined,
                        certificateNumber: certificate.certificate_no,
                        category: inferCertificateCategory(certificate.certificate_type),
                        fileUrl,
                        fileName: certificate.file?.split("/").pop() || `${certificate.certificate_no}.pdf`,
                        status: inferCertificateStatus(certificate.expiry_date),
                    };
                });

                const mappedTraining: TrainingRecord[] = trainingRecords.map((training) => ({
                    id: training.id,
                    title: training.training_title,
                    type: toTrainingType(training.training_type),
                    conductedBy: training.conducted_by,
                    venue: "",
                    dateFrom: training.date_from,
                    dateTo: training.date_to,
                    numberOfHours: Number(training.number_of_hours) || 0,
                    status: "Completed",
                    employeeId: employeeNo,
                    employeeName: fullName,
                    office: employee.office_department,
                }));

                return {
                    id: employee.id,
                    employeeNo,
                    fullName,
                    surname: basicInfo?.surname || "",
                    firstName: basicInfo?.first_name || "",
                    middleName: basicInfo?.middle_name || "",
                    office: employee.office_department,
                    position: employee.position_title,
                    employmentStatus: employee.employment_status,
                    dateHired: employee.date_hired,
                    email: contactInfo?.email_address || "",
                    mobileNo: contactInfo?.mobile_no || "",
                    documents: [],
                    certificates: mappedCertificates,
                    trainingsAttended: mappedTraining,
                    isActive: !employee.is_deleted,
                };
            })
        );

        return NextResponse.json({ success: true, data: mappedEmployees, meta }, { status: 200 });
    } catch (error) {
        const status = error instanceof BackendApiError ? error.status : 500;
        const message = error instanceof Error ? error.message : "Failed to load employee directory data.";

        return NextResponse.json(
            { success: false, message, details: error instanceof BackendApiError ? error.details : undefined },
            { status }
        );
    }
}
