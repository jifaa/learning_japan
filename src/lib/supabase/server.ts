import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Create a Supabase client for use in Server Components and API Routes.
 * This client uses the anon key and respects the user's auth state.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing sessions.
          }
        },
      },
    }
  );
}

/**
 * Create a Supabase admin client for server-side operations.
 * This uses the service role key and should NEVER be exposed to the client.
 * Only use this for administrative tasks like:
 * - Creating users
 * - Managing subscriptions
 * - Server-side data operations
 */
export async function createAdminClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
          }
        },
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

/**
 * Singleton pattern for server client.
 * Note: In Next.js, each request should get a fresh instance,
 * but we cache within the same request for efficiency.
 */
const serverClients = new Map<string, ReturnType<typeof createServerClient>>();

export function getSupabaseServerClient(requestId?: string) {
  const key = requestId ?? "default";
  if (!serverClients.has(key)) {
    // This is a placeholder - actual implementation uses createClient()
    // which is async, so use createClient() directly instead
    return null;
  }
  return serverClients.get(key);
}
