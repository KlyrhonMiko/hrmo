import { backendEnvelopeRequest } from "@/lib/backend-api";
import type { BackendUser, BackendUserRole, PaginatedResult, PaginationMeta } from "@/types";


/**
 * Fetches users with pagination.
 */
export async function fetchUsers(skip: number = 0, limit: number = 10): Promise<PaginatedResult<BackendUser>> {
    const env = await backendEnvelopeRequest<BackendUser[]>(`/api/users?skip=${skip}&limit=${limit}`, {
        method: "GET"
    });

    if (!env.data || !env.meta) throw new Error("Failed to load users");

    
    return {
        data: env.data,
        meta: env.meta as PaginationMeta
    };
}


/**
 * Creates a new user.
 */
export async function createUser(data: Partial<BackendUser> & { password?: string }): Promise<BackendUser> {
    const env = await backendEnvelopeRequest<BackendUser>("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });

    if (!env.data) throw new Error("Failed to create user");
    return env.data;
}

/**
 * Updates an existing user.
 */
export async function updateUser(userNo: string, data: Partial<BackendUser> & { password?: string }): Promise<BackendUser> {
    const env = await backendEnvelopeRequest<BackendUser>(`/api/users/${userNo}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });

    if (!env.data) throw new Error("Failed to update user");
    return env.data;
}

/**
 * Deletes a user (soft delete).
 */
export async function deleteUser(userNo: string): Promise<void> {
    await backendEnvelopeRequest<void>(`/api/users/${userNo}`, {
        method: "DELETE"
    });
}

/**
 * Restores a deleted user.
 */
export async function restoreUser(userNo: string): Promise<BackendUser> {
    const env = await backendEnvelopeRequest<BackendUser>(`/api/users/${userNo}/restore`, {
        method: "POST"
    });

    if (!env.data) throw new Error("Failed to restore user");
    return env.data;
}
