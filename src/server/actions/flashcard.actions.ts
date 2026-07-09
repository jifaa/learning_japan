"use server";

import { revalidatePath } from "next/cache";
import { reviewCard as reviewSrsCard } from "@/lib/db/srs";
import { updateStreak, addXP, recordDailyActivity } from "@/lib/db/progress";
import { XP_REWARDS } from "@/types/progress";
import type { SRSRating } from "@/types/srs";

/**
 * Server action to review an SRS flashcard.
 * Updates the card state, streak, XP, and schedules the next review.
 */
export async function reviewFlashcardAction(
  cardId: string,
  rating: SRSRating,
  timeTakenMs: number
) {
  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    // Review the card
    const result = await reviewSrsCard(cardId, user.id, rating, timeTakenMs);

    // Update streak (called after any learning activity)
    await updateStreak(user.id);

    // Add XP for review (2 XP per review)
    await addXP(user.id, XP_REWARDS.srs_review);

    // Record daily activity
    await recordDailyActivity(user.id, {
      xp: XP_REWARDS.srs_review,
      timeMinutes: Math.round(timeTakenMs / 60000),
    });

    revalidatePath("/flashcards");
    revalidatePath("/dashboard");
    revalidatePath("/progress");

    return { success: true, result };
  } catch (error) {
    console.error("Review error:", error);
    return { success: false, error: "Gagal menyimpan tinjauan" };
  }
}
