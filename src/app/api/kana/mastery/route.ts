/**
 * GET /api/kana/mastery
 * Ambil statistik mastery kana untuk user
 *
 * Query: ?script=hiragana|katakana
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

    const script = request.nextUrl.searchParams.get("script");
    if (!script || !["hiragana", "katakana"].includes(script)) {
      return NextResponse.json({ error: "Valid script required" }, { status: 400 });
    }

    const supabase = await createClient();

    // Get total kana count
    const { count: totalKana } = await supabase
      .from("kana_characters")
      .select("*", { count: "exact", head: true })
      .eq("script", script);

    // Get mastered kana count (mastery_count >= 3)
    const { data: masteredData, error: masteredError } = await supabase
      .from("kana_characters")
      .select("id")
      .eq("script", script)
      .gte("mastery_count", 3);

    // Get total quiz sessions count
    let totalSessions = 0;
    let totalCorrect = 0;

    try {
      const { data: sessions } = await supabase
        .from("kana_quiz_sessions")
        .select("total_questions, correct_count")
        .eq("user_id", user.id)
        .eq("script", script);

      if (sessions) {
        totalSessions = sessions.length;
        totalCorrect = sessions.reduce((sum, s) => sum + s.correct_count, 0);
      }
    } catch {
      // kana_quiz_sessions table may not exist yet
    }

    const masteredCount = masteredError ? 0 : (masteredData?.length || 0);

    return NextResponse.json({
      totalKana: totalKana || 0,
      masteredCount,
      masteryPercent: totalKana ? Math.round((masteredCount / totalKana) * 100) : 0,
      totalSessions,
      totalCorrect,
    });
  } catch (error) {
    console.error("[kana-mastery] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
