import { NextResponse, type NextRequest } from "next/server"

type BackendRole = "admin" | "president" | "hr" | "hr-assistant" | "employee"

/** Canonical dashboard redirect per role */
const ROLE_HOME: Record<BackendRole, string> = {
  admin:          "/hrmo/dashboard",
  hr:             "/hrmo/dashboard",
  "hr-assistant": "/hr-record-asst/dashboard",
  president:      "/president/dashboard",
  employee:       "/employee/dashboard",
}

/** Allowed URL prefix per role — everything else is out of bounds */
const ROLE_PREFIX: Record<BackendRole, string> = {
  admin:          "/hrmo",
  hr:             "/hrmo",
  "hr-assistant": "/hr-record-asst",
  president:      "/president",
  employee:       "/employee",
}

/** All distinct role prefixes */
const ALL_PREFIXES: string[] = [...new Set(Object.values(ROLE_PREFIX))]

/** All valid backend role strings */
const VALID_ROLES = new Set<string>(Object.keys(ROLE_PREFIX))

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // ── 1. Always allow public & Next.js internals ───────────────────────────
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/uploads") ||
    pathname === "/" ||
    pathname === "/favicon.ico" ||
    pathname === "/unauthorized"
  ) {
    return NextResponse.next()
  }

  // ── 2. Require authentication ────────────────────────────────────────────
  const rawRole = req.cookies.get("hrmo_role")?.value ?? null
  if (!rawRole) {
    return NextResponse.redirect(new URL("/auth/login", req.url))
  }

  // ── 3. Unknown / invalid role ────────────────────────────────────────────
  if (!VALID_ROLES.has(rawRole)) {
    return NextResponse.redirect(new URL("/unauthorized", req.url))
  }

  const role       = rawRole as BackendRole
  const allowedPrefix = ROLE_PREFIX[role]
  const homeUrl       = ROLE_HOME[role]

  // ── 4. Cross-role path → redirect to own home ───────────────────────────
  for (const prefix of ALL_PREFIXES) {
    if (prefix !== allowedPrefix && (pathname === prefix || pathname.startsWith(prefix + "/"))) {
      return NextResponse.redirect(new URL(homeUrl, req.url))
    }
  }

  // ── 5. Path is inside an unknown/unprotected prefix → pass through ───────
  return NextResponse.next()
}

export const config = {
  // Match every path EXCEPT Next.js internals, API routes, auth pages,
  // static assets, and the unauthorized page itself.
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|api/|auth/|uploads/|unauthorized).*)",
  ],
}
