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
"[project]/frontend/src/app/api/employees/onboard/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$lib$2f$backend$2d$api$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/src/lib/backend-api.ts [app-route] (ecmascript)");
;
;
async function POST(request) {
    try {
        const body = await request.json();
        if (!body?.formData) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                stage: "validate_payload",
                message: "Missing formData payload."
            }, {
                status: 400
            });
        }
        const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$lib$2f$backend$2d$api$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["backendRequest"])("/api/employees/onboard-atomic", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            message: "Employee onboarding completed successfully.",
            data: result
        }, {
            status: 201
        });
    } catch (error) {
        if (error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$lib$2f$backend$2d$api$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["BackendApiError"]) {
            const details = error.details && typeof error.details === "object" && "message" in error.details ? error.details : null;
            return __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                stage: "onboard_atomic",
                message: details?.message || error.message,
                details: error.details,
                stages: details?.stages || []
            }, {
                status: error.status
            });
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            stage: "onboard_atomic",
            message: "Failed to onboard employee.",
            error: error instanceof Error ? error.message : "Unknown error",
            stages: []
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__c6345f5d._.js.map