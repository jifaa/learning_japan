/**
 * Daily Word (Kata Hari Ini) utility.
 * Returns the same vocabulary word for all users for the current calendar day.
 * Uses date-seeded selection for deterministic daily rotation.
 */

import { unstable_cache } from "next/cache";
import { createStaticClient } from "@/lib/supabase/server";
import type { Vocabulary } from "@/types/content";

/**
 * Get today's daily word — same word for all users, changes daily.
 */
export const getDailyWord = unstable_cache(
  async (): Promise<Vocabulary | null> => {
    const supabase = createStaticClient();

    // Use today's date as seed for deterministic selection
    const today = new Date();
    const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();

    // Get all vocabulary count
    const { count, error } = await supabase
      .from("vocabulary")
      .select("id", { count: "exact", head: true });

    if (error || !count || count === 0) {
      return null;
    }

    // Deterministic index from date seed (same word all day)
    const index = seed % count;

    const { data, error: wordError } = await supabase
      .from("vocabulary")
      .select("*")
      .eq("jlpt_level", "N5")
      .limit(100)
      .range(index, index)
      .single();

    if (wordError) {
      return null;
    }

    return data as Vocabulary;
  },
  ["daily-word"],
  { revalidate: 86400, tags: ["daily-word", "content"] }
);
