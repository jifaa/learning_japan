import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Get the current authenticated user.
 * Returns null if not authenticated.
 */
export const getCurrentUser = cache(async () => {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
});

/**
 * Require authentication.
 * Redirects to login if not authenticated.
 */
export async function requireAuth() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

/**
 * Get the current session.
 */
export async function getSession() {
  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session;
}

/**
 * Check if user is authenticated.
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser();
  return user !== null;
}

/**
 * Sign up a new user.
 */
export async function signUp(email: string, password: string) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  return { data, error };
}

/**
 * Sign in a user.
 */
export async function signIn(email: string, password: string) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  return { data, error };
}

/**
 * Sign out the current user.
 */
export async function signOut() {
  const supabase = await createClient();

  const { error } = await supabase.auth.signOut();

  return { error };
}

/**
 * Update user metadata.
 */
export async function updateUserMetadata(
  metadata: Record<string, unknown>
) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.updateUser(metadata);

  return { data, error };
}

/**
 * Send password reset email.
 */
export async function resetPassword(email: string) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL}/reset-password`,
  });

  return { data, error };
}

/**
 * Update user password (requires valid session from reset link).
 */
export async function updatePassword(newPassword: string) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  return { data, error };
}

/**
 * Get user profile data from profiles table.
 */
export const getUserProfile = cache(async () => {
  const supabase = await createClient();
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
});

/**
 * Auth error messages mapping.
 */
export const AUTH_ERROR_MESSAGES: Record<string, string> = {
  "Invalid login credentials": "Invalid email or password. Please try again.",
  "Email not confirmed": "Please verify your email address to continue.",
  "User already registered": "An account with this email already exists.",
  "Password should be at least 6 characters":
    "Password must be at least 6 characters long.",
  "Signup is disabled": "Sign up is currently disabled.",
  "Rate limit exceeded": "Too many attempts. Please wait a moment and try again.",
  "Invalid email": "Please enter a valid email address.",
  default: "An error occurred. Please try again.",
};

/**
 * Get a user-friendly error message.
 */
export function getAuthErrorMessage(errorMessage: string): string {
  return AUTH_ERROR_MESSAGES[errorMessage] || AUTH_ERROR_MESSAGES.default;
}
