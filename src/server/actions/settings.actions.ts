"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateUserPreferencesAction(preferences: Record<string, unknown>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const { error } = await supabase
    .from("profiles")
    .update({ preferences, updated_at: new Date().toISOString() })
    .eq("id", user.id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/settings");
  return { success: true };
}
