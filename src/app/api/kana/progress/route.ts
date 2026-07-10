/**
 * GET /api/kana/progress
 * Ambil progress kana untuk user (mastery_count per kana)
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
    let progress: any[] = [];

    // Strategy 1: If mastery_count exists in kana_characters, use it
    try {
      const { data: kanaData, error: kanaError } = await supabase
        .from("kana_characters")
        .select("id, mastery_count")
        .eq("script", script);

      if (!kanaError && kanaData && kanaData.length > 0) {
        progress = kanaData
          .filter((k: any) => k.mastery_count > 0)
          .map((k: any) => ({
            kana_id: k.id,
            mastery_count: k.mastery_count || 0,
          }));

        return NextResponse.json({ progress });
      }
    } catch {
      // mastery_count column doesn't exist, try next strategy
    }

    // Strategy 2: Count from kana_quiz_history
    try {
      const { data: historyData, error: historyError } = await supabase
        .from("kana_quiz_history")
        .select("kana_id, is_correct")
        .eq("user_id", user.id)
        .eq("script", script);

      if (!historyError && historyData && historyData.length > 0) {
        const counts: Record<string, number> = {};
        historyData.forEach((h: any) => {
          if (h.is_correct) {
            counts[h.kana_id] = (counts[h.kana_id] || 0) + 1;
          }
        });
        progress = Object.entries(counts).map(([kana_id, mastery_count]) => ({
          kana_id,
          mastery_count,
        }));
      }
    } catch {
      // kana_quiz_history table doesn't exist
    }

    return NextResponse.json({ progress });
  } catch (error) {
    console.error("[kana-progress] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
