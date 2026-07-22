/**
 * Cross-table search utility.
 * Searches vocabulary, kanji, grammar, and kana_characters tables.
 */
import { createClient } from "@/lib/supabase/server";

export interface SearchVocab {
  id: string;
  jlpt_level?: string | null;
  expression: string;
  reading?: string | null;
  romaji?: string | null;
  meaning_id?: string | null;
  meaning_en?: string | null;
  part_of_speech?: string | null;
  audio_path?: string | null;
  example_sentence_jp?: string | null;
  example_sentence_id?: string | null;
  example_sentence_romaji?: string | null;
}

export interface SearchKanji {
  id: string;
  kanji: string;
  jlpt_level?: string | null;
  stroke_count?: number | null;
  meaning_id?: string | null;
  meaning_en?: string | null;
  onyomi_romaji?: string | null;
  onyomi_katakana?: string | null;
  kunyomi_romaji?: string | null;
  kunyomi_hiragana?: string | null;
  example_word?: string | null;
  example_meaning_id?: string | null;
}

export interface SearchGrammar {
  id: string;
  jlpt_level?: string | null;
  grammar_point: string;
  reading?: string | null;
  romaji?: string | null;
  meaning_id?: string | null;
  meaning_en?: string | null;
  structure_pattern?: string | null;
  example_jp?: string | null;
  example_meaning_id?: string | null;
}

export interface SearchKana {
  id: string;
  script: "hiragana" | "katakana";
  category: string;
  kana: string;
  romaji: string;
  romaji_alt?: string | null;
  audio_path?: string | null;
}

export interface SearchResults {
  vocabulary: SearchVocab[];
  kanji: SearchKanji[];
  grammar: SearchGrammar[];
  kana: SearchKana[];
}

export async function searchAll(query: string, limit = 20): Promise<SearchResults> {
  const trimmed = query.trim();
  if (!trimmed || trimmed.length < 1) {
    return { vocabulary: [], kanji: [], grammar: [], kana: [] };
  }

  const supabase = await createClient();
  const like = "%" + trimmed + "%";

  const [vocabRes, kanjiRes, grammarRes, kanaRes] = await Promise.all([
    supabase
      .from("vocabulary")
      .select(
        "id, jlpt_level, expression, reading, romaji, meaning_id, meaning_en, part_of_speech, audio_path, example_sentence_jp, example_sentence_id, example_sentence_romaji"
      )
      .or(
        `expression.ilike.${like},reading.ilike.${like},romaji.ilike.${like},meaning_id.ilike.${like},meaning_en.ilike.${like}`
      )
      .limit(limit),
    supabase
      .from("kanji")
      .select(
        "id, kanji, jlpt_level, stroke_count, meaning_id, meaning_en, onyomi_romaji, onyomi_katakana, kunyomi_romaji, kunyomi_hiragana, example_word, example_meaning_id"
      )
      .or(
        `kanji.ilike.${like},onyomi_romaji.ilike.${like},onyomi_katakana.ilike.${like},kunyomi_romaji.ilike.${like},kunyomi_hiragana.ilike.${like},meaning_id.ilike.${like},meaning_en.ilike.${like}`
      )
      .limit(limit),
    supabase
      .from("grammar_points")
      .select(
        "id, jlpt_level, grammar_point, reading, romaji, meaning_id, meaning_en, structure_pattern, example_jp, example_meaning_id"
      )
      .or(
        `grammar_point.ilike.${like},reading.ilike.${like},romaji.ilike.${like},meaning_id.ilike.${like},meaning_en.ilike.${like},structure_pattern.ilike.${like}`
      )
      .limit(limit),
    supabase
      .from("kana_characters")
      .select("id, script, category, kana, romaji, romaji_alt, audio_path")
      .or(
        `kana.ilike.${like},romaji.ilike.${like},romaji_alt.ilike.${like},category.ilike.${like}`
      )
      .limit(limit),
  ]);

  if (vocabRes.error) console.error("search vocabulary error:", vocabRes.error);
  if (kanjiRes.error) console.error("search kanji error:", kanjiRes.error);
  if (grammarRes.error) console.error("search grammar error:", grammarRes.error);
  if (kanaRes.error) console.error("search kana error:", kanaRes.error);

  return {
    vocabulary: vocabRes.data || [],
    kanji: kanjiRes.data || [],
    grammar: grammarRes.data || [],
    kana: kanaRes.data || [],
  };
}
