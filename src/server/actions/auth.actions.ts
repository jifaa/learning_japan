"use server";

import { signOut as supabaseSignOut } from "@/lib/auth";
import { redirect } from "next/navigation";

/**
 * Server action for signing out the user.
 * After signing out, redirects to the home page.
 */
export async function signOutAction() {
  const { error } = await supabaseSignOut();

  if (error) {
    // Log error but still redirect
    console.error("Sign out error:", error);
  }

  redirect("/");
}

/**
 * Server action for signing in.
 * Returns the result for client-side handling.
 */
export async function signInAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return {
      success: false,
      error: "Email and password are required",
    };
  }

  const { data, error } = await import("@/lib/auth").then((m) =>
    m.signIn(email, password)
  );

  if (error) {
    let errorMessage = "An error occurred during sign in.";
    if (typeof error.message === "string") {
      errorMessage = error.message;
    } else if (typeof error === "object") {
      errorMessage = JSON.stringify(error);
    }
    return {
      success: false,
      error: errorMessage,
    };
  }

  return {
    success: true,
    user: data.user,
  };
}

/**
 * Server action for signing up.
 * Returns the result for client-side handling.
 */
export async function signUpAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!email || !password) {
    return {
      success: false,
      error: "Email and password are required",
    };
  }

  if (password !== confirmPassword) {
    return {
      success: false,
      error: "Passwords do not match",
    };
  }

  if (password.length < 6) {
    return {
      success: false,
      error: "Password must be at least 6 characters",
    };
  }

  const { data, error } = await import("@/lib/auth").then((m) =>
    m.signUp(email, password)
  );

  if (error) {
    let errorMessage = "An error occurred during sign up.";
    if (typeof error.message === "string") {
      errorMessage = error.message;
    } else if (typeof error === "object") {
      errorMessage = JSON.stringify(error);
    }
    return {
      success: false,
      error: errorMessage,
    };
  }

  return {
    success: true,
    user: data.user,
    needsEmailConfirmation: !data.session,
  };
}

/**
 * Server action for requesting password reset email.
 * Returns the result for client-side handling.
 */
export async function forgotPasswordAction(formData: FormData) {
  const email = formData.get("email") as string;

  if (!email) {
    return {
      success: false,
      error: "Email is required",
    };
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      success: false,
      error: "Please enter a valid email address",
    };
  }

  const { error } = await import("@/lib/auth").then((m) =>
    m.resetPassword(email)
  );

  if (error) {
    let errorMessage = "An error occurred while sending the reset email.";
    if (typeof error.message === "string") {
      errorMessage = error.message;
    }
    return {
      success: false,
      error: errorMessage,
    };
  }

  return {
    success: true,
    message: "Password reset email sent. Check your inbox.",
  };
}

/**
 * Server action for resetting password.
 * Called from the reset password page after clicking the email link.
 */
export async function resetPasswordAction(formData: FormData) {
  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!newPassword || !confirmPassword) {
    return {
      success: false,
      error: "Both password fields are required",
    };
  }

  if (newPassword.length < 6) {
    return {
      success: false,
      error: "Password must be at least 6 characters long",
    };
  }

  if (newPassword !== confirmPassword) {
    return {
      success: false,
      error: "Passwords do not match",
    };
  }

  const { error } = await import("@/lib/auth").then((m) =>
    m.updatePassword(newPassword)
  );

  if (error) {
    let errorMessage = "An error occurred while resetting the password.";
    if (typeof error.message === "string") {
      errorMessage = error.message;
    } else if (typeof error === "object") {
      errorMessage = JSON.stringify(error);
    }
    return {
      success: false,
      error: errorMessage,
    };
  }

  return {
    success: true,
    message: "Password has been reset successfully.",
  };
}
