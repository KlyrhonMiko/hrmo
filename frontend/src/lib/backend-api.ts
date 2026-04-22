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

export function getBackendApiBaseUrl(): string {
    // In browsers `process.env.NEXT_PUBLIC_BACKEND_URL` is statically replaced by Next.js during build/dev.
    // On the server, we prefer `BACKEND_API_URL` (for internal container networking).
    const isServer = typeof window === "undefined";
    const isDocker = process.env.RUNNING_IN_DOCKER === "true";

    const configured = isServer 
        ? (isDocker ? process.env.BACKEND_API_URL : process.env.NEXT_PUBLIC_BACKEND_URL)
        : process.env.NEXT_PUBLIC_BACKEND_URL;



    if (!configured || !configured.trim()) {
        throw new Error("Backend API URL is missing. Set NEXT_PUBLIC_BACKEND_URL or BACKEND_API_URL in .env.local.");
    }

    const normalized = configured.trim();
    let parsed: URL;

    try {
        parsed = new URL(normalized);
    } catch {
        throw new Error(`Backend API URL is invalid: "${normalized}". Provide a full URL (e.g., http://localhost:8000).`);
    }

    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        throw new Error("Backend API URL must use http:// or https://.");
    }

    return normalized.replace(/\/$/, "");
}

export function toBackendUrl(path: string): string {
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    return `${getBackendApiBaseUrl()}${normalizedPath}`;
}

function getAuthTokenFromCookie(): string | null {
    if (typeof document === "undefined") return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; hrmo_token=`);
    if (parts.length === 2) {
        return parts.pop()?.split(";").shift() || null;
    }
    return null;
}

function getRequestInitWithAuth(init?: RequestInit): RequestInit {
    const token = getAuthTokenFromCookie();
    const headers = new Headers(init?.headers);

    if (!headers.has("Accept")) {
        headers.set("Accept", "application/json");
    }

    if (token && !headers.has("Authorization")) {
        headers.set("Authorization", `Bearer ${token}`);
    }

    if (init?.body && !headers.has("Content-Type")) {
        // Only set if not already set (e.g., for FormData)
        if (typeof init.body === "string") {
            headers.set("Content-Type", "application/json");
        }
    }

    return {
        ...init,
        headers,
    };
}

/**
 * Handle unauthorized responses by clearing session and redirecting to login.
 * Only triggers in the browser and for non-login paths.
 */
function handleUnauthorized(status: number, path: string): boolean {
    if (status === 401 && !path.includes("/auth/login") && typeof window !== "undefined") {
        console.warn(`Unauthorized access to ${path}. Redirecting to login...`);
        // Clear auth cookies
        document.cookie = "hrmo_token=; Path=/; Max-Age=0; SameSite=Lax";
        document.cookie = "hrmo_role=; Path=/; Max-Age=0; SameSite=Lax";
        
        // Clear localStorage
        try {
            localStorage.removeItem("hrmo_user");
        } catch {
            /* ignore */
        }

        // Hard redirect to login page
        window.location.href = "/auth/login";
        return true;
    }
    return false;
}



async function parseBackendResponseBody<T>(response: Response): Promise<T | null> {
    if (response.status === 204) {
        return null;
    }

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.toLowerCase().includes("application/json")) {
        return null;
    }

    let json;
    try {
        json = (await response.json()) as BackendEnvelope<T> | T;
    } catch {
        return null;
    }

    if (json && typeof json === "object" && "data" in (json as BackendEnvelope<T>)) {
        return ((json as BackendEnvelope<T>).data ?? null) as T | null;
    }

    return json as T;
}

export async function backendRequest<T>(path: string, init?: RequestInit): Promise<T> {
    const mergedInit = getRequestInitWithAuth(init);
    const response = await fetch(toBackendUrl(path), {
        ...mergedInit,
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

        handleUnauthorized(response.status, path);
        throw new BackendApiError(message, response.status, details);
    }

    const data = await parseBackendResponseBody<T>(response);
    return (data ?? ({} as T)) as T;
}

export async function backendEnvelopeRequest<T>(path: string, init?: RequestInit): Promise<BackendResponseEnvelope<T>> {
    const mergedInit = getRequestInitWithAuth(init);
    const response = await fetch(toBackendUrl(path), {
        ...mergedInit,
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

        handleUnauthorized(response.status, path);
        throw new BackendApiError(message, response.status, details);
    }

    if (response.status === 204) {
        return { success: true, data: null as unknown as T } as BackendResponseEnvelope<T>;
    }

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.toLowerCase().includes("application/json")) {
        return { success: true } as BackendResponseEnvelope<T>;
    }

    let json;
    try {
        json = (await response.json()) as BackendResponseEnvelope<T> | T;
    } catch {
        return { success: true } as BackendResponseEnvelope<T>;
    }
    
    if (json && typeof json === "object" && "data" in (json as BackendResponseEnvelope<T>)) {
        return json as BackendResponseEnvelope<T>;
    }

    return {
        success: true,
        data: json as T,
    };
}

export async function backendFormRequest<T>(path: string, formData: FormData, init?: Omit<RequestInit, "body">): Promise<T> {
    const mergedInit = getRequestInitWithAuth(init as RequestInit);
    const response = await fetch(toBackendUrl(path), {
        ...mergedInit,
        method: mergedInit.method || "POST",
        body: formData,
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

        handleUnauthorized(response.status, path);
        throw new BackendApiError(message, response.status, details);
    }

    const data = await parseBackendResponseBody<T>(response);
    return (data ?? ({} as T)) as T;
}
