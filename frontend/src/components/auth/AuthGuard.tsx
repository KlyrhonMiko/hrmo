"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import type { BackendRole } from "@/lib/auth";
import { ROLE_HOME, getStoredUser } from "@/lib/auth";

interface AuthGuardProps {
    /** The backend roles allowed to access this layout's routes */
    allowedRoles: BackendRole[];
    children: React.ReactNode;
}

/**
 * Client-side route guard — placed in each role-specific layout.
 *
 * It reads the stored user from localStorage (set by login()) and
 * redirects immediately if:
 *  - No user is stored → /auth/login
 *  - User's role is not in allowedRoles → their own dashboard (or /unauthorized if unknown)
 */
export function AuthGuard({ allowedRoles, children }: AuthGuardProps) {
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const user = getStoredUser();

        // Not logged in at all
        if (!user) {
            router.replace("/auth/login");
            return;
        }

        const role = user.role as BackendRole;

        // Role not allowed for this layout
        if (!allowedRoles.includes(role)) {
            const home = ROLE_HOME[role];
            if (home) {
                router.replace(home);
            } else {
                router.replace("/unauthorized");
            }
            return;
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pathname, router, allowedRoles.join(',')]);

    return <>{children}</>;
}
