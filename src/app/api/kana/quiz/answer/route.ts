/**
 * POST /api/kana/quiz/answer
 * Submit jawaban quiz
 *
 * Body:
 * - answers: Array of { kanaId, isCorrect }
 * - script: "hiragana" | "katakana"
 */
import { NextRequest, NextResponse } from "next/server";
import { addXP, updateStreak } from "@/lib/db/progress";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { answers, script } = body;

    if (!answers || !Array.isArray(answers)) {
      return NextResponse.json({ error: "Answers array required" }, { status: 400 });
    }

    if (!script || !["hiragana", "katakana"].includes(script)) {
      return NextResponse.json({ error: "Valid script required" }, { status: 400 });
    }

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = await createClient();

    // Calculate stats first (needed for session insert)
    const correctCount = answers.filter((a: { isCorrect: boolean }) => a.isCorrect).length;
    const totalCount = answers.length;
    const xpEarned = correctCount * 2;
    const isPerfect = correctCount === totalCount && totalCount === 10;
    const bonusXp = isPerfect ? 20 : 0;
    const totalXp = xpEarned + bonusXp;

    // Insert each answer into history
    const historyRecords = answers.map((answer: { kanaId: string; isCorrect: boolean }) => ({
      user_id: user.id,
      script,
      kana_id: answer.kanaId,
      is_correct: answer.isCorrect,
    }));

    const { error: historyError } = await supabase
      .from("kana_quiz_history")
      .insert(historyRecords);

    if (historyError) {
      console.error("[kana-quiz-answer] history error:", historyError);
      return NextResponse.json({ error: "Failed to save answers" }, { status: 500 });
    }

    // Update mastery: count correct answers from THIS quiz session only,
    // then add to existing mastery_count
    try {
      const kanaIds = answers.map((a: { kanaId: string }) => a.kanaId);

      // Count correct answers from THIS quiz only
      const correctInQuiz: Record<string, number> = {};
      for (const answer of answers) {
        if (answer.isCorrect) {
          correctInQuiz[answer.kanaId] = (correctInQuiz[answer.kanaId] || 0) + 1;
        }
      }

      // Fetch existing mastery for these kana
      const { data: existing } = await supabase
        .from("user_kana_progress")
        .select("kana_id, mastery_count")
        .eq("user_id", user.id)
        .in("kana_id", kanaIds);

      const existingMap = new Map((existing || []).map((r: any) => [r.kana_id, r.mastery_count || 0]));

      // Upsert: add correct count from THIS quiz to existing mastery
      const upsertRecords = Object.entries(correctInQuiz).map(([kana_id, correctInSession]) => ({
        user_id: user.id,
        script,
        kana_id,
        mastery_count: (existingMap.get(kana_id) || 0) + correctInSession,
        last_quizzed_at: new Date().toISOString(),
      }));

      if (upsertRecords.length > 0) {
        const { error: upsertError } = await supabase
          .from("user_kana_progress")
          .upsert(upsertRecords, {
            onConflict: "user_id,script,kana_id",
          });

        if (upsertError) {
          console.error("[kana-quiz-answer] mastery upsert error:", upsertError);
        }
      }
    } catch (e) {
      // Non-fatal — mastery update failure should not break the quiz
      console.error("[kana-quiz-answer] mastery update failed:", e);
    }

    // Insert session summary
    const { error: sessionError } = await supabase
      .from("kana_quiz_sessions")
      .insert({
        user_id: user.id,
        script,
        total_questions: totalCount,
        correct_count: correctCount,
        wrong_count: totalCount - correctCount,
        xp_earned: totalXp,
        is_perfect: isPerfect,
      });

    if (sessionError) {
      // Non-fatal: session insert failure should not fail the quiz save
      console.error("[kana-quiz-answer] session error:", sessionError);
    }

    // Add XP to user progress (only if quiz was completed — totalCount === 10)
    if (totalCount === 10 && totalXp > 0) {
      try {
        await addXP(user.id, totalXp);
        await updateStreak(user.id);
      } catch (xpError) {
        // Non-fatal: XP failure should not fail the whole quiz save
        console.error("[kana-quiz-answer] XP update failed:", xpError);
      }
    }

    return NextResponse.json({
      success: true,
      correctCount,
      totalCount,
      xpEarned,
      isPerfect,
      bonusXp,
      totalXp,
    });
  } catch (error) {
    console.error("[kana-quiz-answer] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
