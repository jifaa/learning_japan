"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function removeBookmark(bookmarkId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const { error } = await supabase
    .from("bookmarks")
    .delete()
    .eq("id", bookmarkId)
    .eq("user_id", user.id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/bookmarks");
  return { success: true };
}

export async function addBookmarkAction(contentType: string, contentId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const { error } = await supabase
    .from("bookmarks")
    .upsert(
      { user_id: user.id, content_type: contentType, content_id: contentId },
      { onConflict: "user_id,content_type,content_id" }
    );

  if (error) return { success: false, error: error.message };

  revalidatePath("/bookmarks");
  return { success: true };
}
