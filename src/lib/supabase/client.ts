import { createBrowserClient } from "@supabase/ssr";

/**
 * Create a Supabase client for use in the browser.
 * This client uses the anon key and is safe for public data operations.
 * Never use this for server-side operations or sensitive data.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

/**
 * Singleton browser client instance.
 * This avoids creating multiple client instances during re-renders.
 */
let browserClient: ReturnType<typeof createBrowserClient> | undefined;

/**
 * Get or create the singleton Supabase browser client.
 * Use this in client components only.
 */
export function getSupabaseBrowserClient() {
  if (!browserClient) {
    browserClient = createClient();
  }
  return browserClient;
}
