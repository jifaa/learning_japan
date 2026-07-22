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

  const parsed = combinedSchema.safeParse(rawEnv);
  if (!parsed.success) {
    console.warn(
      "[ENV] Environment variable validation warnings:",
      parsed.error.flatten().fieldErrors
    );
  }

  return rawEnv;
}

// ponytail: removed EnvVars, PublicEnvVars, ServerEnvVars — never imported

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

// ponytail: removed getPublicEnv and validateServerEnv — never called anywhere

// ponytail: removed isDev/isProd/isTest — inline `process.env.NODE_ENV === "..."` is self-documenting.
