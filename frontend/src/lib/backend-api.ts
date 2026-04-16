export class BackendApiError extends Error {
    status: number;
    details?: unknown;

    constructor(message: string, status: number, details?: unknown) {
        super(message);
        this.name = "BackendApiError";
        this.status = status;
        this.details = details;
    }
}

type BackendEnvelope<T> = {
    success?: boolean;
    data?: T;
    meta?: unknown;
    path?: string;
    timestamp?: string;
};

export type BackendResponseEnvelope<T> = BackendEnvelope<T>;

const FALLBACK_BACKEND_API_URL = "http://127.0.0.1:8000";

export function getBackendApiBaseUrl(): string {
    const configured =
        process.env.BACKEND_API_URL ||
        process.env.NEXT_PUBLIC_BACKEND_API_URL ||
        FALLBACK_BACKEND_API_URL;

    return configured.replace(/\/$/, "");
}

export function toBackendUrl(path: string): string {
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    return `${getBackendApiBaseUrl()}${normalizedPath}`;
}

async function parseBackendResponseBody<T>(response: Response): Promise<T | null> {
    if (response.status === 204) {
        return null;
    }

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.toLowerCase().includes("application/json")) {
        return null;
    }

    const json = (await response.json()) as BackendEnvelope<T> | T;

    if (json && typeof json === "object" && "data" in (json as BackendEnvelope<T>)) {
        return ((json as BackendEnvelope<T>).data ?? null) as T | null;
    }

    return json as T;
}

export async function backendRequest<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetch(toBackendUrl(path), {
        ...init,
        headers: {
            Accept: "application/json",
            ...(init?.headers || {}),
        },
        cache: "no-store",
    });

    if (!response.ok) {
        const contentType = response.headers.get("content-type") || "";
        let message = `Backend request failed (${response.status})`;
        let details: unknown;

        if (contentType.toLowerCase().includes("application/json")) {
            const payload = (await response.json()) as {
                detail?: string;
                message?: string;
                data?: { message?: string };
            };
            details = payload;
            message =
                payload?.detail ||
                payload?.message ||
                payload?.data?.message ||
                message;
        }

        throw new BackendApiError(message, response.status, details);
    }

    const data = await parseBackendResponseBody<T>(response);
    return (data ?? ({} as T)) as T;
}

export async function backendEnvelopeRequest<T>(path: string, init?: RequestInit): Promise<BackendResponseEnvelope<T>> {
    const response = await fetch(toBackendUrl(path), {
        ...init,
        headers: {
            Accept: "application/json",
            ...(init?.headers || {}),
        },
        cache: "no-store",
    });

    if (!response.ok) {
        const contentType = response.headers.get("content-type") || "";
        let message = `Backend request failed (${response.status})`;
        let details: unknown;

        if (contentType.toLowerCase().includes("application/json")) {
            const payload = (await response.json()) as {
                detail?: string;
                message?: string;
                data?: { message?: string };
            };
            details = payload;
            message =
                payload?.detail ||
                payload?.message ||
                payload?.data?.message ||
                message;
        }

        throw new BackendApiError(message, response.status, details);
    }

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.toLowerCase().includes("application/json")) {
        return {} as BackendResponseEnvelope<T>;
    }

    const json = (await response.json()) as BackendResponseEnvelope<T> | T;
    if (json && typeof json === "object" && "data" in (json as BackendResponseEnvelope<T>)) {
        return json as BackendResponseEnvelope<T>;
    }

    return {
        success: true,
        data: json as T,
    };
}

export async function backendFormRequest<T>(path: string, formData: FormData, init?: Omit<RequestInit, "body">): Promise<T> {
    const response = await fetch(toBackendUrl(path), {
        ...init,
        method: init?.method || "POST",
        body: formData,
        headers: {
            Accept: "application/json",
            ...(init?.headers || {}),
        },
        cache: "no-store",
    });

    if (!response.ok) {
        const contentType = response.headers.get("content-type") || "";
        let message = `Backend request failed (${response.status})`;
        let details: unknown;

        if (contentType.toLowerCase().includes("application/json")) {
            const payload = (await response.json()) as {
                detail?: string;
                message?: string;
                data?: { message?: string };
            };
            details = payload;
            message =
                payload?.detail ||
                payload?.message ||
                payload?.data?.message ||
                message;
        }

        throw new BackendApiError(message, response.status, details);
    }

    const data = await parseBackendResponseBody<T>(response);
    return (data ?? ({} as T)) as T;
}
