/**
 * Cross-table search utility.
 * Searches vocabulary, kanji, and grammar tables.
 */
import { createClient } from "@/lib/supabase/server";

export interface SearchVocab {
  id: string;
  expression: string;
  reading?: string | null;
  romaji?: string | null;
  meaning_id?: string | null;
  meaning_en?: string | null;
  part_of_speech?: string | null;
}

export interface SearchKanji {
  id: string;
  kanji: string;
  meaning_id?: string | null;
  meaning_en?: string | null;
  onyomi_romaji?: string | null;
  onyomi_katakana?: string | null;
  kunyomi_romaji?: string | null;
  kunyomi_hiragana?: string | null;
}

export interface SearchGrammar {
  id: string;
  grammar_point: string;
  meaning_id?: string | null;
  meaning_en?: string | null;
  structure_pattern?: string | null;
}

export interface SearchResults {
  vocabulary: SearchVocab[];
  kanji: SearchKanji[];
  grammar: SearchGrammar[];
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
