/**
 * POST /api/kana/quiz/answer
 * Submit jawaban quiz kana dan update progress
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

    // Calculate stats
    const correctCount = answers.filter((a: { isCorrect: boolean }) => a.isCorrect).length;
    const totalCount = answers.length;
    const xpEarned = correctCount * 2;
    const isPerfect = correctCount === totalCount;
    const bonusXp = isPerfect ? 20 : 0;
    const totalXp = xpEarned + bonusXp;

    // Store results for response
    const result = {
      success: true,
      correctCount,
      totalCount,
      xpEarned,
      isPerfect,
      bonusXp,
      totalXp,
      masteryUpdated: false,
    };

    // ========== INSERT INTO HISTORY (per-user progress) ==========
    const historyRecords = answers.map((answer: { kanaId: string; isCorrect: boolean }) => ({
      user_id: user.id,
      script,
      kana_id: answer.kanaId,
      is_correct: answer.isCorrect,
    }));

    try {
      const { error: historyError } = await supabase
        .from("kana_quiz_history")
        .insert(historyRecords);

      if (historyError) {
        console.error("[kana-quiz-answer] history insert failed:", historyError);
      } else {
        result.masteryUpdated = true;
      }
    } catch (historyErr) {
      console.error("[kana-quiz-answer] history insert exception:", historyErr);
    }

    // ========== INSERT SESSION SUMMARY (for analytics) ==========
    try {
      await supabase.from("kana_quiz_sessions").insert({
        user_id: user.id,
        script,
        total_questions: totalCount,
        correct_count: correctCount,
        wrong_count: totalCount - correctCount,
        xp_earned: totalXp,
        is_perfect: isPerfect,
      });
    } catch (sessErr) {
      console.warn("[kana-quiz-answer] session insert skipped:", sessErr);
    }

    // ========== ADD XP ==========
    if (totalXp > 0) {
      try {
        await addXP(user.id, totalXp);
        await updateStreak(user.id);
      } catch (xpErr) {
        console.error("[kana-quiz-answer] XP update failed:", xpErr);
      }
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("[kana-quiz-answer] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
