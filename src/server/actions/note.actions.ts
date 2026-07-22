"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function upsertNote(noteId: string, title: string, body: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  if (noteId) {
    const { data: existingNote } = await supabase
      .from("user_notes")
      .select("user_id")
      .eq("id", noteId)
      .maybeSingle();

    if (existingNote && existingNote.user_id !== user.id) {
      return { success: false, error: "Unauthorized" };
    }
  }

  const { error } = await supabase
    .from("user_notes")
    .upsert(
      { id: noteId, user_id: user.id, title: title || null, body },
      { onConflict: "id" }
    );

  if (error) return { success: false, error: error.message };

  revalidatePath("/notes");
  return { success: true };
}

export async function deleteNoteAction(noteId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const { error } = await supabase
    .from("user_notes")
    .delete()
    .eq("id", noteId)
    .eq("user_id", user.id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/notes");
  return { success: true };
}
