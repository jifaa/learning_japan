/**
 * GET /api/kana/quiz/stats
 * Ambil statistik quiz user
 *
 * Query params:
 * - script: "hiragana" | "katakana" (default: hiragana)
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const script = searchParams.get("script") || "hiragana";

    const supabase = await createClient();

    // Get quiz sessions
    const { data: sessions, error } = await supabase
      .from("kana_quiz_sessions")
      .select("*")
      .eq("user_id", user.id)
      .eq("script", script)
      .order("completed_at", { ascending: false })
      .limit(20);

    if (error) {
      console.error("[kana-quiz-stats] error:", error);
      return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
    }

    // Calculate overall stats
    const totalQuizzes = sessions?.length ?? 0;
    const totalCorrect = sessions?.reduce((sum, s) => sum + s.correct_count, 0) ?? 0;
    const totalQuestions = sessions?.reduce((sum, s) => sum + s.total_questions, 0) ?? 0;
    const totalXp = sessions?.reduce((sum, s) => sum + s.xp_earned, 0) ?? 0;
    const perfectQuizzes = sessions?.filter((s) => s.is_perfect).length ?? 0;

    const avgScore = totalQuestions > 0
      ? Math.round((totalCorrect / totalQuestions) * 100)
      : 0;

    // Get mastery stats
    const { data: progress } = await supabase
      .from("user_kana_progress")
      .select("*")
      .eq("user_id", user.id)
      .eq("script", script);

    const masteredCount = progress?.filter((p) => p.mastery_count >= 3).length ?? 0;

    return NextResponse.json({
      script,
      totalQuizzes,
      totalCorrect,
      totalQuestions,
      totalXp,
      avgScore,
      perfectQuizzes,
      masteredCount,
      recentSessions: sessions ?? [],
    });
  } catch (error) {
    console.error("[kana-quiz-stats] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
