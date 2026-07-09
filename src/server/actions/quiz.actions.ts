"use server";

import { revalidatePath } from "next/cache";
import { saveQuizResult } from "@/lib/db/quiz";
import { updateStreak, addXP, recordDailyActivity } from "@/lib/db/progress";
import { XP_REWARDS } from "@/types/progress";
import type { QuizType } from "@/types/quiz";

/**
 * Save quiz result and update streak + XP.
 */
export async function completeQuizAction(
  quizType: QuizType,
  score: number,
  totalQuestions: number,
  correctAnswers: number,
  timeSpentSeconds: number
) {
  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    // Save quiz result
    await saveQuizResult(user.id, {
      quiz_type: quizType,
      score,
      total_points: score,
      correct_answers: correctAnswers,
      total_questions: totalQuestions,
      time_spent_seconds: timeSpentSeconds,
    });

    // Update streak (called after any learning activity)
    await updateStreak(user.id);

    // Calculate XP based on performance
    let xpEarned = correctAnswers * XP_REWARDS.quiz_correct;
    if (score === 100) {
      xpEarned += XP_REWARDS.quiz_perfect; // Bonus for perfect score
    }

    // Add XP
    await addXP(user.id, xpEarned);

    // Record daily activity
    await recordDailyActivity(user.id, {
      xp: xpEarned,
      lessonsCompleted: 1,
      timeMinutes: Math.round(timeSpentSeconds / 60),
      accuracy: score,
    });

    revalidatePath("/quiz");
    revalidatePath("/dashboard");
    revalidatePath("/progress");

    return { success: true, xpEarned };
  } catch (error) {
    console.error("Quiz completion error:", error);
    return { success: false, error: "Gagal menyimpan hasil kuis" };
  }
}
