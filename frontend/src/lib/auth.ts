"use client"

import { backendEnvelopeRequest } from "@/lib/backend-api"
import type { BackendUser, BackendUserRole as BackendRole } from "@/types"


export type { BackendRole, BackendUser }


export interface AuthTokenPayload {
  access_token: string
  token_type: "bearer"
  expires_in: number
  user: BackendUser
}

/** Canonical dashboard path per backend role */
export const ROLE_HOME: Record<BackendRole, string> = {
  admin:          "/hrmo/dashboard",
  hr:             "/hrmo/dashboard",
  "hr-assistant": "/hr-record-asst/dashboard",
  president:      "/president/dashboard",
  employee:       "/employee/dashboard",
}

/** Allowed URL prefix per backend role — used by middleware */
export const ROLE_PREFIX: Record<BackendRole, string> = {
  admin:          "/hrmo",
  hr:             "/hrmo",
  "hr-assistant": "/hr-record-asst",
  president:      "/president",
  employee:       "/employee",
}

export async function login(username_or_email: string, password: string): Promise<BackendUser> {
  const envelope = await backendEnvelopeRequest<AuthTokenPayload>("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username_or_email, password }),
  })

  const data = envelope.data
  if (!data) throw new Error("Empty response from auth")

  // store token and role in non-HttpOnly cookie so middleware can read it
  const maxAgeSeconds = Math.max(60, data.expires_in) * 60
  document.cookie = [
    `hrmo_token=${data.access_token}`,
    `Path=/`,
    `Max-Age=${maxAgeSeconds}`,
    `SameSite=Lax`,
  ].join("; ")

  // store role separately for middleware checks
  document.cookie = `hrmo_role=${data.user.role}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax`

  // lightweight user payload in localStorage
  try {
    localStorage.setItem("hrmo_user", JSON.stringify(data.user))
  } catch {
    /* ignore */
  }

  return data.user
}

export async function register(payload: {
  surname: string
  first_name: string
  middle_name?: string
  email: string
  phone_number?: string
  username: string
  password: string
  role?: BackendRole
}): Promise<BackendUser> {
  const env = await backendEnvelopeRequest<BackendUser>("/api/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })

  if (!env.data) throw new Error("Failed to register user")
  return env.data
}

export async function logout(): Promise<void> {
  // Try to notify backend, but ignore errors if session already expired
  try {
    await backendEnvelopeRequest("/api/auth/logout", { method: "POST" })
  } catch {
    /* ignore */
  }

  document.cookie = "hrmo_token=; Path=/; Max-Age=0"
  document.cookie = "hrmo_role=; Path=/; Max-Age=0"
  try {
    localStorage.removeItem("hrmo_user")
  } catch {}
}

export function getStoredUser(): BackendUser | null {
  try {
    const raw = localStorage.getItem("hrmo_user")
    if (!raw) return null
    return JSON.parse(raw) as BackendUser
  } catch {
    return null
  }
}
