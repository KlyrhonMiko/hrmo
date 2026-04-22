"use client";

import { useEffect } from "react";

/**
 * A global network interceptor that monitors all fetch calls for 401 Unauthorized responses.
 * 
 * This acts as a "safety net" for pages that use raw fetch() instead of the 
 * centralized backendEnvelopeRequest utility. It ensures that token expiration 
 * leads to a clean redirect to the login page across all roles and pages.
 */
export function GlobalApiInterceptor() {
    useEffect(() => {
        // Only run in browser
        if (typeof window === "undefined") return;

        const originalFetch = window.fetch;

        // Patch global fetch
        window.fetch = async (...args) => {
            const response = await originalFetch(...args);

            // Handle 401 Unauthorized
            if (response.status === 401) {
                // Ensure we have a string representing the URL
                let url = "";
                if (typeof args[0] === "string") {
                    url = args[0];
                } else if (args[0] instanceof URL) {
                    url = args[0].toString();
                } else if (args[0] instanceof Request) {
                    url = args[0].url;
                }
                
                // Safety: Don't intercept login attempts or Next.js internal chunks
                const isAuthRequest = url.includes("/api/auth/login") || url.includes("/auth/login");
                const isInternalRequest = url.includes("/_next/") || url.includes("webpack-hmr");

                if (!isAuthRequest && !isInternalRequest) {
                    console.warn(`[AuthInterceptor] 401 Unauthorized detected from ${url}. Cleaning session...`);
                    
                    // Clear auth cookies
                    document.cookie = "hrmo_token=; Path=/; Max-Age=0; SameSite=Lax";
                    document.cookie = "hrmo_role=; Path=/; Max-Age=0; SameSite=Lax";

                    // Clear localStorage
                    try {
                        localStorage.removeItem("hrmo_user");
                    } catch {
                        /* ignore */
                    }

                    // Force redirect to login
                    window.location.href = "/auth/login";
                }
            }

            return response;
        };

        return () => {
            // Restore original fetch if component unmounts (though it's in root layout)
            window.fetch = originalFetch;
        };
    }, []);

    return null; // This component doesn't render anything
}
