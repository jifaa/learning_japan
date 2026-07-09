/**
 * GET /api/kana/mastery-stats
 * Ambil statistik mastery kana (hiragana & katakana)
 *
 * Query params:
 * - script: "hiragana" | "katakana" | "all" (default: "all")
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { getHiragana, getKatakana } from "@/lib/db/content";
import { getKanaProgress } from "@/lib/db/progress";
import { getKanaMasteryStats, type KanaScript } from "@/lib/kana-quiz";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const scriptParam = searchParams.get("script") || "all";

    const supabase = await createClient();

    // Fetch kana data
    const [hiragana, katakana] = await Promise.all([
      getHiragana(),
      getKatakana(),
    ]);

    // Fetch user progress for both scripts
    const [hiraganaProgress, katakanaProgress] = await Promise.all([
      getKanaProgress(user.id, "hiragana"),
      getKanaProgress(user.id, "katakana"),
    ]);

    const hiraganaMap = new Map(
      (hiraganaProgress as any[]).map((p) => [p.kana_id, p.mastery_count || 0])
    );
    const katakanaMap = new Map(
      (katakanaProgress as any[]).map((p) => [p.kana_id, p.mastery_count || 0])
    );

    const result: Record<string, ReturnType<typeof getKanaMasteryStats>> = {};

    if (scriptParam === "all" || scriptParam === "hiragana") {
      result.hiragana = getKanaMasteryStats(hiragana, hiraganaMap);
    }
    if (scriptParam === "all" || scriptParam === "katakana") {
      result.katakana = getKanaMasteryStats(katakana, katakanaMap);
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("[kana-mastery-stats] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
