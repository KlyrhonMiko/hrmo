import type { NextConfig } from "next";
import { loadEnvConfig } from "@next/env";
import { existsSync } from "node:fs";
import path from "node:path";

const frontendRoot = process.cwd();
const workspaceRoot = path.resolve(frontendRoot, "..");
const isDev = process.env.NODE_ENV !== "production";

// Load frontend env first, then workspace root env to support single root-level .env.local.
loadEnvConfig(frontendRoot, isDev);
if (existsSync(path.join(workspaceRoot, ".env.local"))) {
  loadEnvConfig(workspaceRoot, isDev);
}

const nextPublicBackendUrl = process.env.NEXT_PUBLIC_BACKEND_URL?.trim();

if (nextPublicBackendUrl) process.env.NEXT_PUBLIC_BACKEND_URL = nextPublicBackendUrl;

const nextConfig: NextConfig = {
  turbopack: {
    root: workspaceRoot,
  },
  env: {
    NEXT_PUBLIC_BACKEND_URL: nextPublicBackendUrl,
  },
};

export default nextConfig;
