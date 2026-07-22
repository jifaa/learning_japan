/**
 * Content database access helpers.
 * All functions require authentication context.
 */

import { unstable_cache } from "next/cache";
import { createClient, createStaticClient } from "@/lib/supabase/server";
import type { Vocabulary, GrammarPoint, KanjiCharacter, KanaCharacter, Particle, ReadingPassage } from "@/types/content";
import type { JLPTLevel } from "@/types/common";

// ============================================
// Bookmarks
// ============================================

export async function getUserBookmarks(userId: string) {
  const supabase = await createClient();

  const { data: rawBookmarks, error } = await supabase
    .from("bookmarks")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  // If table doesn't exist yet in schema cache, return empty gracefully
  if (error) {
    if (error.code === "PGRST205" || error.message?.includes("schema cache")) {
      console.warn("[getUserBookmarks] bookmarks table missing from schema cache:", error.message);
      return [];
    }
    throw error;
  }
  if (!rawBookmarks || rawBookmarks.length === 0) return [];

  // Fetch actual content for each bookmark
  const enriched = await Promise.all(
    rawBookmarks.map(async (bookmark) => {
      let content: Record<string, unknown> = {};

      if (bookmark.content_type === "vocabulary") {
        const { data } = await supabase
          .from("vocabulary")
          .select("expression, reading, romaji, meaning_id, meaning_en")
          .eq("id", bookmark.content_id)
          .single();
        content = data || {};
      } else if (bookmark.content_type === "kanji") {
        const { data } = await supabase
          .from("kanji")
          .select("kanji, meaning_id, meaning_en, onyomi_romaji, kunyomi_hiragana")
          .eq("id", bookmark.content_id)
          .single();
        content = data || {};
      } else if (bookmark.content_type === "grammar") {
        const { data } = await supabase
          .from("grammar_points")
          .select("grammar_point, meaning_id, meaning_en, structure_pattern")
          .eq("id", bookmark.content_id)
          .single();
        content = data || {};
      }

      return { ...bookmark, ...content };
    })
  );

  return enriched;
}

export async function addBookmark(userId: string, contentType: string, contentId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("bookmarks")
    .upsert(
      { user_id: userId, content_type: contentType, content_id: contentId },
      { onConflict: "user_id,content_type,content_id" }
    )
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function removeBookmark(userId: string, contentType: string, contentId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("bookmarks")
    .delete()
    .eq("user_id", userId)
    .eq("content_type", contentType)
    .eq("content_id", contentId);

  if (error) throw error;
}

export async function isBookmarked(userId: string, contentType: string, contentId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("bookmarks")
    .select("id")
    .eq("user_id", userId)
    .eq("content_type", contentType)
    .eq("content_id", contentId)
    .maybeSingle();

  if (error) throw error;
  return data !== null;
}

// ============================================
// Notes
// ============================================

export async function getUserNotes(userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("user_notes")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function getContentNote(userId: string, contentType: string, contentId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("user_notes")
    .select("*")
    .eq("user_id", userId)
    .eq("content_type", contentType)
    .eq("content_id", contentId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function upsertNote(
  userId: string,
  contentType: string,
  contentId: string,
  body: string,
  title?: string
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("user_notes")
    .upsert(
      { user_id: userId, content_type: contentType, content_id: contentId, body, title },
      { onConflict: "user_id,content_type,content_id" }
    )
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteNote(userId: string, noteId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("user_notes")
    .delete()
    .eq("id", noteId)
    .eq("user_id", userId);

  if (error) throw error;
}

// ============================================
// Search
// ============================================

export async function searchAll(query: string, limit = 10) {
  const supabase = await createClient();
  const like = `%${query}%`;

  const [vocabRes, kanjiRes, grammarRes] = await Promise.all([
    supabase
      .from("vocabulary")
      .select("id, expression, reading, romaji, meaning_id, meaning_en, part_of_speech")
      .or(`expression.ilike.${like},reading.ilike.${like},meaning_id.ilike.${like},meaning_en.ilike.${like}`)
      .limit(limit),
    supabase
      .from("kanji")
      .select("id, kanji, meaning_id, meaning_en, onyomi_romaji, kunyomi_romaji")
      .or(`kanji.ilike.${like},meaning_id.ilike.${like},meaning_en.ilike.${like}`)
      .limit(limit),
    supabase
      .from("grammar_points")
      .select("id, grammar_point, meaning_id, meaning_en, structure_pattern")
      .or(`grammar_point.ilike.${like},meaning_id.ilike.${like},meaning_en.ilike.${like}`)
      .limit(limit),
  ]);

  return {
    vocabulary: vocabRes.data ?? [],
    kanji: kanjiRes.data ?? [],
    grammar: grammarRes.data ?? [],
  };
}

// ============================================
// Vocabulary
// ============================================

/**
 * Get vocabulary by JLPT level.
 */
export function getVocabularyByLevel(level: JLPTLevel) {
  return unstable_cache(
    async () => {
      const supabase = createStaticClient();
      const { data, error } = await supabase
        .from("vocabulary")
        .select("*")
        .eq("jlpt_level", level)
        .order("display_order");

      if (error) throw error;
      return data as Vocabulary[];
    },
    ["vocabulary-by-level", level],
    { revalidate: 86400, tags: ["content", "vocabulary", `vocab-${level}`] }
  )();
}

/**
 * Get vocabulary by ID.
 */
export function getVocabularyById(id: string) {
  return unstable_cache(
    async () => {
      const supabase = createStaticClient();
      const { data, error } = await supabase
        .from("vocabulary")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as Vocabulary;
    },
    ["vocabulary-by-id", id],
    { revalidate: 86400, tags: ["content", "vocabulary"] }
  )();
}

/**
 * Search vocabulary by expression or meaning.
 */
export async function searchVocabulary(query: string, limit = 20) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("vocabulary")
    .select("*")
    .or(`expression.ilike.%${query}%,meaning_en.ilike.%${query}%`)
    .limit(limit);

  if (error) throw error;
  return data as Vocabulary[];
}

/**
 * Get vocabulary count by level.
 */
export function getVocabularyCount(level?: JLPTLevel) {
  return unstable_cache(
    async () => {
      const supabase = createStaticClient();
      let query = supabase.from("vocabulary").select("id", { count: "exact", head: true });

      if (level) {
        query = query.eq("jlpt_level", level);
      }

      const { count, error } = await query;

      if (error) throw error;
      return count ?? 0;
    },
    ["vocabulary-count", level || "all"],
    { revalidate: 86400, tags: ["content", "vocabulary"] }
  )();
}

// ============================================
// Grammar
// ============================================

/**
 * Get grammar points by JLPT level.
 */
export function getGrammarByLevel(level: JLPTLevel) {
  return unstable_cache(
    async () => {
      const supabase = createStaticClient();
      const { data, error } = await supabase
        .from("grammar_points")
        .select("*")
        .eq("jlpt_level", level)
        .order("display_order");

      if (error) throw error;
      return data as GrammarPoint[];
    },
    ["grammar-by-level", level],
    { revalidate: 86400, tags: ["content", "grammar", `grammar-${level}`] }
  )();
}

/**
 * Get grammar point by ID.
 */
export function getGrammarById(id: string) {
  return unstable_cache(
    async () => {
      const supabase = createStaticClient();
      const { data, error } = await supabase
        .from("grammar_points")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as GrammarPoint;
    },
    ["grammar-by-id", id],
    { revalidate: 86400, tags: ["content", "grammar"] }
  )();
}

/**
 * Get core N5 grammar points.
 */
export const getCoreGrammarN5 = unstable_cache(
  async () => {
    const supabase = createStaticClient();
    const { data, error } = await supabase
      .from("grammar_points")
      .select("*")
      .eq("jlpt_level", "N5")
      .eq("is_core_n5", true)
      .order("display_order");

    if (error) throw error;
    return data as GrammarPoint[];
  },
  ["core-grammar-n5"],
  { revalidate: 86400, tags: ["content", "grammar"] }
);

// ============================================
// Kanji
// ============================================

/**
 * Get kanji by JLPT level.
 */
export function getKanjiByLevel(level: JLPTLevel) {
  return unstable_cache(
    async () => {
      const supabase = createStaticClient();
      const { data, error } = await supabase
        .from("kanji")
        .select("*")
        .eq("jlpt_level", level)
        .order("stroke_count");

      if (error) throw error;
      return data as KanjiCharacter[];
    },
    ["kanji-by-level", level],
    { revalidate: 86400, tags: ["content", "kanji", `kanji-${level}`] }
  )();
}

/**
 * Get kanji by character.
 */
export function getKanjiByCharacter(character: string) {
  return unstable_cache(
    async () => {
      const supabase = createStaticClient();
      const { data, error } = await supabase
        .from("kanji")
        .select("*")
        .eq("kanji", character)
        .single();

      if (error) throw error;
      return data as KanjiCharacter;
    },
    ["kanji-by-char", character],
    { revalidate: 86400, tags: ["content", "kanji"] }
  )();
}

/**
 * Get kanji count by level.
 */
export function getKanjiCount(level?: JLPTLevel) {
  return unstable_cache(
    async () => {
      const supabase = createStaticClient();
      let query = supabase.from("kanji").select("id", { count: "exact", head: true });

      if (level) {
        query = query.eq("jlpt_level", level);
      }

      const { count, error } = await query;

      if (error) throw error;
      return count ?? 0;
    },
    ["kanji-count", level || "all"],
    { revalidate: 86400, tags: ["content", "kanji"] }
  )();
}

// ============================================
// Kana
// ============================================

/**
 * Get all hiragana.
 */
export const getHiragana = unstable_cache(
  async () => {
    const supabase = createStaticClient();
    const { data, error } = await supabase
      .from("kana_characters")
      .select("*")
      .eq("script", "hiragana")
      .order("display_order");

    if (error) throw error;
    return data as KanaCharacter[];
  },
  ["hiragana-characters"],
  { revalidate: 86400, tags: ["content", "kana", "hiragana"] }
);

/**
 * Get all katakana.
 */
export const getKatakana = unstable_cache(
  async () => {
    const supabase = createStaticClient();
    const { data, error } = await supabase
      .from("kana_characters")
      .select("*")
      .eq("script", "katakana")
      .order("display_order");

    if (error) throw error;
    return data as KanaCharacter[];
  },
  ["katakana-characters"],
  { revalidate: 86400, tags: ["content", "kana", "katakana"] }
);

/**
 * Get kana chart (hiragana + katakana).
 */
export async function getKanaChart() {
  const [hiragana, katakana] = await Promise.all([
    getHiragana(),
    getKatakana(),
  ]);

  return { hiragana, katakana };
}

// ============================================
// Particles
// ============================================

/**
 * Get particles by JLPT level.
 */
export function getParticlesByLevel(level: JLPTLevel) {
  return unstable_cache(
    async () => {
      const supabase = createStaticClient();
      const { data, error } = await supabase
        .from("particles")
        .select("*")
        .eq("jlpt_level", level)
        .order("particle");

      if (error) throw error;
      return data as Particle[];
    },
    ["particles-by-level", level],
    { revalidate: 86400, tags: ["content", "particles"] }
  )();
}

// ============================================
// Reading
// ============================================

/**
 * Get reading passages by JLPT level.
 */
export function getReadingPassages(level: JLPTLevel) {
  return unstable_cache(
    async () => {
      const supabase = createStaticClient();
      const { data, error } = await supabase
        .from("reading_passages")
        .select("*")
        .eq("jlpt_level", level)
        .order("display_order");

      if (error) throw error;
      return data as ReadingPassage[];
    },
    ["reading-passages-by-level", level],
    { revalidate: 86400, tags: ["content", "reading"] }
  )();
}

/**
 * Get reading passage by ID.
 */
export function getReadingPassageById(id: string) {
  return unstable_cache(
    async () => {
      const supabase = createStaticClient();
      const { data, error } = await supabase
        .from("reading_passages")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as ReadingPassage;
    },
    ["reading-passage-by-id", id],
    { revalidate: 86400, tags: ["content", "reading"] }
  )();
}

// ============================================
// Batch Operations
// ============================================

/**
 * Get vocabulary by IDs (batch).
 */
export async function getVocabularyByIds(ids: string[]) {
  if (ids.length === 0) return [];

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("vocabulary")
    .select("*")
    .in("id", ids);

  if (error) throw error;
  return data as Vocabulary[];
}

/**
 * Get kanji by IDs (batch).
 */
export async function getKanjiByIds(ids: string[]) {
  if (ids.length === 0) return [];

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("kanji")
    .select("*")
    .in("id", ids);

  if (error) throw error;
  return data as KanjiCharacter[];
}
