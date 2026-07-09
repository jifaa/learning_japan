/**
 * Cross-table search utility.
 * Searches vocabulary, kanji, and grammar tables.
 */
import { createClient } from "@/lib/supabase/server";

export interface SearchResults {
  vocabulary: any[];
  kanji: any[];
  grammar: any[];
}

export async function searchAll(query: string, limit = 20): Promise<SearchResults> {
  if (!query || query.length < 2) {
    return { vocabulary: [], kanji: [], grammar: [] };
  }

  const supabase = await createClient();
  const like = "%" + query + "%";

  const [vocabRes, kanjiRes, grammarRes] = await Promise.all([
    supabase
      .from("vocabulary")
      .select("id, expression, reading, romaji, meaning_id, meaning_en, part_of_speech")
      .ilike("expression", like)
      .limit(limit),
    supabase
      .from("kanji")
      .select("id, kanji, meaning_id, meaning_en, onyomi_romaji, onyomi_katakana, kunyomi_romaji, kunyomi_hiragana")
      .ilike("kanji", like)
      .limit(limit),
    supabase
      .from("grammar_points")
      .select("id, grammar_point, meaning_id, meaning_en, structure_pattern")
      .ilike("grammar_point", like)
      .limit(limit),
  ]);

  return {
    vocabulary: vocabRes.data || [],
    kanji: kanjiRes.data || [],
    grammar: grammarRes.data || [],
  };
}
