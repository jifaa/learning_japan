"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateUserPreferencesAction(data: {
  displayName?: string;
  dailyGoal?: number;
  newCardsPerDay?: number;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  // Get current profile to merge preferences
  const { data: profile } = await supabase
    .from("profiles")
    .select("preferences")
    .eq("id", user.id)
    .single();

  // Build updates object
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };

  if (data.displayName !== undefined) {
    updates.display_name = data.displayName;
  }

  // Update preferences JSONB
  const currentPreferences = (profile?.preferences as Record<string, unknown>) || {};
  updates.preferences = {
    ...currentPreferences,
    dailyGoal: data.dailyGoal,
    newCardsPerDay: data.newCardsPerDay,
  };

  const { error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", user.id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  return { success: true };
}
