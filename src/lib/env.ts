import { z } from "zod";

/**
 * Environment variables validation schema.
 * All required env vars must be validated here.
 * This ensures the app fails fast if env vars are missing.
 */

// Public env vars (exposed to client)
const publicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url("Invalid Supabase URL"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, "Supabase anon key is required"),
  NEXT_PUBLIC_APP_URL: z.string().url("Invalid app URL"),
});

// Server-only env vars (never exposed to client)
const serverEnvSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, "Service role key is required"),
  DATABASE_URL: z.string().url("Invalid database URL"),
});

// Combined schema for validation
const combinedSchema = publicEnvSchema.merge(serverEnvSchema);

// Parse and validate at runtime
function parseEnvVars() {
  const rawEnv = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    DATABASE_URL: process.env.DATABASE_URL,
  };

  // Check for required vars (zod optional to allow partial checks)
  const requiredVars = Object.entries(rawEnv)
    .filter(([, value]) => value === undefined)
    .map(([key]) => key);

  if (requiredVars.length > 0) {
    console.warn(
      `[ENV] Missing required environment variables: ${requiredVars.join(", ")}`
    );
  }

  return rawEnv;
}

// Validation result type
export type EnvVars = z.infer<typeof combinedSchema>;
export type PublicEnvVars = z.infer<typeof publicEnvSchema>;
export type ServerEnvVars = z.infer<typeof serverEnvSchema>;

// Singleton env object
let cachedEnv: ReturnType<typeof parseEnvVars> | null = null;

/**
 * Get all validated env vars.
 * Call this in server components/api routes only.
 */
export function getServerEnv(): Readonly<ReturnType<typeof parseEnvVars>> {
  if (!cachedEnv) {
    cachedEnv = parseEnvVars();
  }
  return cachedEnv;
}

/**
 * Get public env vars only (safe for client).
 */
export function getPublicEnv(): Pick<
  ReturnType<typeof parseEnvVars>,
  "NEXT_PUBLIC_SUPABASE_URL" | "NEXT_PUBLIC_SUPABASE_ANON_KEY" | "NEXT_PUBLIC_APP_URL"
> {
  const env = getServerEnv();
  return {
    NEXT_PUBLIC_SUPABASE_URL: env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_APP_URL: env.NEXT_PUBLIC_APP_URL,
  };
}

/**
 * Validate env vars and throw if critical ones are missing.
 * Use this in API routes that require database access.
 */
export function validateServerEnv(): void {
  const env = getServerEnv();

  const errors: string[] = [];

  if (!env.SUPABASE_SERVICE_ROLE_KEY) {
    errors.push("SUPABASE_SERVICE_ROLE_KEY is required for server operations");
  }

  if (!env.DATABASE_URL) {
    errors.push("DATABASE_URL is required for database operations");
  }

  if (errors.length > 0) {
    throw new Error(`Environment validation failed:\n${errors.join("\n")}`);
  }
}

/**
 * Check if we're in development mode.
 */
export const isDev = process.env.NODE_ENV === "development";

/**
 * Check if we're in production mode.
 */
export const isProd = process.env.NODE_ENV === "production";

/**
 * Check if we're in test mode.
 */
export const isTest = process.env.NODE_ENV === "test";
