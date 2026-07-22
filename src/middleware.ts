import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Supabase middleware helper.
 * Use this to create a Supabase client that can refresh sessions.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session if expired
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protected routes that require authentication
  // Note: (app) is a route group - actual URLs are /dashboard, /learn, etc.
  const protectedPaths = [
    "/dashboard",
    "/learn",
    "/hiragana",
    "/katakana",
    "/vocabulary",
    "/grammar",
    "/kanji",
    "/quiz",
    "/flashcards",
    "/reading",
    "/progress",
    "/daily-challenge",
    "/search",
    "/bookmarks",
    "/notes",
    "/mock-test",
    "/listening",
    "/achievements",
    "/settings",
    "/avatars",
  ];
  const isProtectedPath = protectedPaths.some(
    (path) =>
      request.nextUrl.pathname === path ||
      request.nextUrl.pathname.startsWith(path + "/")
  );

  // Auth routes that should redirect if already logged in
  const authPaths = ["/login", "/register"];
  const isAuthPath = authPaths.some(
    (path) =>
      request.nextUrl.pathname === path ||
      request.nextUrl.pathname.startsWith(path + "/")
  );

  // Redirect to login if accessing protected route without auth
  if (isProtectedPath && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  // Redirect to dashboard if accessing auth pages while logged in
  if (isAuthPath && user) {
    const rawRedirect = request.nextUrl.searchParams.get("redirect");
    const safeRedirect =
      rawRedirect &&
      rawRedirect.startsWith("/") &&
      !rawRedirect.startsWith("//") &&
      !rawRedirect.startsWith("/\\")
        ? rawRedirect
        : "/dashboard";
    const url = request.nextUrl.clone();
    url.pathname = safeRedirect;
    url.searchParams.delete("redirect");
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

/**
 * Default middleware export.
 * Protects routes and handles auth redirects.
 */
export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

/**
 * Matcher configuration.
 * Specifies which paths the middleware should run on.
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes (handled separately)
     */
    "/((?!_next/static|_next/image|favicon.ico|public|api).*)",
  ],
};
