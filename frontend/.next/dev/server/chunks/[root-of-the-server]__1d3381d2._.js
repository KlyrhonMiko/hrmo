module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/frontend/src/lib/backend-api.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BackendApiError",
    ()=>BackendApiError,
    "backendFormRequest",
    ()=>backendFormRequest,
    "backendRequest",
    ()=>backendRequest,
    "getBackendApiBaseUrl",
    ()=>getBackendApiBaseUrl,
    "toBackendUrl",
    ()=>toBackendUrl
]);
class BackendApiError extends Error {
    status;
    details;
    constructor(message, status, details){
        super(message);
        this.name = "BackendApiError";
        this.status = status;
        this.details = details;
    }
}
const FALLBACK_BACKEND_API_URL = "http://127.0.0.1:8000";
function getBackendApiBaseUrl() {
    const configured = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_BACKEND_API_URL || FALLBACK_BACKEND_API_URL;
    return configured.replace(/\/$/, "");
}
function toBackendUrl(path) {
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    return `${getBackendApiBaseUrl()}${normalizedPath}`;
}
async function parseBackendResponseBody(response) {
    if (response.status === 204) {
        return null;
    }
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.toLowerCase().includes("application/json")) {
        return null;
    }
    const json = await response.json();
    if (json && typeof json === "object" && "data" in json) {
        return json.data ?? null;
    }
    return json;
}
async function backendRequest(path, init) {
    const response = await fetch(toBackendUrl(path), {
        ...init,
        headers: {
            Accept: "application/json",
            ...init?.headers || {}
        },
        cache: "no-store"
    });
    if (!response.ok) {
        const contentType = response.headers.get("content-type") || "";
        let message = `Backend request failed (${response.status})`;
        let details;
        if (contentType.toLowerCase().includes("application/json")) {
            const payload = await response.json();
            details = payload;
            message = payload?.detail || payload?.message || payload?.data?.message || message;
        }
        throw new BackendApiError(message, response.status, details);
    }
    const data = await parseBackendResponseBody(response);
    return data ?? {};
}
async function backendFormRequest(path, formData, init) {
    const response = await fetch(toBackendUrl(path), {
        ...init,
        method: init?.method || "POST",
        body: formData,
        headers: {
            Accept: "application/json",
            ...init?.headers || {}
        },
        cache: "no-store"
    });
    if (!response.ok) {
        const contentType = response.headers.get("content-type") || "";
        let message = `Backend request failed (${response.status})`;
        let details;
        if (contentType.toLowerCase().includes("application/json")) {
            const payload = await response.json();
            details = payload;
            message = payload?.detail || payload?.message || payload?.data?.message || message;
        }
        throw new BackendApiError(message, response.status, details);
    }
    const data = await parseBackendResponseBody(response);
    return data ?? {};
}
}),
"[project]/frontend/src/app/api/employees/directory/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$lib$2f$backend$2d$api$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/src/lib/backend-api.ts [app-route] (ecmascript)");
;
;
const TRAINING_TYPES = [
    "Seminar",
    "Workshop",
    "Conference",
    "Webinar",
    "Certification",
    "Other"
];
function toTrainingType(value) {
    const normalized = value.trim().toLowerCase();
    const match = TRAINING_TYPES.find((type)=>type.toLowerCase() === normalized);
    return match || "Other";
}
function buildFullName(basicInfo) {
    if (!basicInfo) {
        return "Unnamed Employee";
    }
    const surname = basicInfo.surname || "";
    const first = basicInfo.first_name || "";
    const middle = basicInfo.middle_name || "";
    const middleInitial = middle ? `${middle.charAt(0)}.` : "";
    return `${surname}, ${first} ${middleInitial}`.trim().replace(/\s+/g, " ");
}
function inferCertificateCategory(value) {
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
function inferCertificateStatus(expiryDate) {
    if (!expiryDate) {
        return "Active";
    }
    const expiry = new Date(expiryDate);
    if (Number.isNaN(expiry.getTime())) {
        return "Active";
    }
    return expiry < new Date() ? "Expired" : "Active";
}
function toCertificateFileUrl(relativePath) {
    if (!relativePath) {
        return "";
    }
    const normalized = relativePath.replace(/^\/+/, "");
    return `${(0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$lib$2f$backend$2d$api$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getBackendApiBaseUrl"])()}/uploads/${normalized}`;
}
async function optionalRequest(path, fallback) {
    try {
        return await (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$lib$2f$backend$2d$api$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["backendRequest"])(path);
    } catch (error) {
        if (error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$lib$2f$backend$2d$api$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["BackendApiError"] && error.status === 404) {
            return fallback;
        }
        throw error;
    }
}
async function GET(request) {
    try {
        const url = new URL(request.url);
        const page = Math.max(Number(url.searchParams.get("page") || "1") || 1, 1);
        const limit = Math.max(Number(url.searchParams.get("limit") || "10") || 10, 1);
        const skip = (page - 1) * limit;
        const employeesResponse = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$lib$2f$backend$2d$api$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["backendRequest"])(`/api/employees?skip=${skip}&limit=${limit}`);
        const employees = employeesResponse.data || [];
        const defaultMeta = {
            skip,
            limit,
            current_page: page,
            total_pages: 0,
            total_records: employees.length,
            has_previous: page > 1,
            has_next: false
        };
        const meta = employeesResponse.meta || defaultMeta;
        const mappedEmployees = await Promise.all(employees.map(async (employee)=>{
            const employeeNo = employee.employee_no;
            const [basicInfo, contactInfo, certificates, trainingRecords] = await Promise.all([
                optionalRequest(`/api/basic-information/${encodeURIComponent(employeeNo)}`, null),
                optionalRequest(`/api/contact-information/${encodeURIComponent(employeeNo)}`, null),
                optionalRequest(`/api/certificates/${encodeURIComponent(employeeNo)}?skip=0&limit=200`, []),
                optionalRequest(`/api/training/${encodeURIComponent(employeeNo)}`, [])
            ]);
            const fullName = buildFullName(basicInfo);
            const mappedCertificates = certificates.map((certificate)=>{
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
                    status: inferCertificateStatus(certificate.expiry_date)
                };
            });
            const mappedTraining = trainingRecords.map((training)=>({
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
                    office: employee.office_department
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
                isActive: !employee.is_deleted
            };
        }));
        return __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            data: mappedEmployees,
            meta
        }, {
            status: 200
        });
    } catch (error) {
        const status = error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$lib$2f$backend$2d$api$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["BackendApiError"] ? error.status : 500;
        const message = error instanceof Error ? error.message : "Failed to load employee directory data.";
        return __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            message,
            details: error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$lib$2f$backend$2d$api$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["BackendApiError"] ? error.details : undefined
        }, {
            status
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__1d3381d2._.js.map