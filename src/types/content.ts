/**
 * Content types for vocabulary, grammar, kanji, and lessons.
 * These map to the public.content tables in Supabase.
 */

export type JLPTLevel = "N5" | "N4" | "N3" | "N2" | "N1";

// ============================================
// Vocabulary
// ============================================

/**
 * Vocabulary item from database.
 * Columns match public.vocabulary table.
 */
export interface Vocabulary {
  id: string;
  jlpt_level: JLPTLevel;
  expression: string;
  primary_expression: string | null;
  reading: string | null;
  romaji: string | null;
  script_type: ScriptType;
  part_of_speech_id: string | null;
  part_of_speech: string | null;
  semantic_category: string | null;
  meaning_id: string | null;
  meaning_en: string;
  tags: string[] | null;
  is_common: boolean;
  is_official_jlpt_list: boolean;
  audio_path: string | null;
  example_sentence_jp: string | null;
  example_sentence_id: string | null;
  example_sentence_romaji: string | null;
  display_order: number;
}

/**
 * Script/character type.
 */
export type ScriptType = "hiragana" | "katakana" | "kanji" | "mixed";

/**
 * Create vocabulary input (for forms).
 */
export interface VocabularyInput {
  jlpt_level?: JLPTLevel;
  expression: string;
  reading?: string;
  meaning_en: string;
  part_of_speech?: string;
  script_type?: ScriptType;
}

/**
 * Vocabulary with user SRS state.
 */
export interface VocabularyWithState extends Vocabulary {
  srs_state?: SRSCardState | null;
  next_review?: string | null;
}

type SRSCardState = "new" | "learning" | "review" | "relearning" | "graduated";

// ============================================
// Grammar
// ============================================

/**
 * Grammar point from database.
 */
export interface GrammarPoint {
  id: string;
  jlpt_level: JLPTLevel;
  display_order: number;
  grammar_point: string;
  reading: string | null;
  romaji: string | null;
  meaning_en: string;
  meaning_id: string | null;
  category_id: string | null;
  structure_pattern: string | null;
  usage_explanation: string | null;
  example_jp: string | null;
  example_romaji: string | null;
  example_meaning: string | null;
  is_core_n5: boolean;
  recommended_for_quiz: boolean;
}

/**
 * Grammar example structure.
 */
export interface GrammarExample {
  japanese: string;
  reading?: string;
  meaning: string;
  notes?: string;
}

/**
 * Grammar with parsed examples.
 */
export interface GrammarPointFull extends GrammarPoint {
  examples: GrammarExample[];
}

// ============================================
// Kanji
// ============================================

/**
 * Kanji character from database.
 * Columns match public.kanji table in supabase_schema.sql.
 */
export interface KanjiCharacter {
  id: string;
  kanji: string;            // The kanji character itself
  jlpt_level: JLPTLevel;
  stroke_count: number | null;
  onyomi_romaji: string | null;
  onyomi_katakana: string | null;
  kunyomi_romaji: string | null;
  kunyomi_hiragana: string | null;
  meaning_en: string | null;
  meaning_id: string | null;
  example_word: string | null;
  example_reading: string | null;
  example_romaji: string | null;
  example_meaning_id: string | null;
  mnemonic_id: string | null;
  radical_kanji: string | null;
  audio_path: string | null;
  stroke_order_path: string | null;
  display_order: number;
}

/**
 * Kanji example word.
 */
export interface KanjiExample {
  word: string;
  reading: string;
  meaning: string;
}

/**
 * Kanji input for creation.
 */
export interface KanjiInput {
  character: string;
  jlpt_level?: JLPTLevel;
  meaning: string;
  onyomi?: string[];
  kunyomi?: string[];
  stroke_count?: number;
  radical?: string;
}

// ============================================
// Kana
// ============================================

/**
 * Kana character (hiragana or katakana).
 * Matches public.kana_characters schema.
 */
export interface KanaCharacter {
  id: string;
  script: "hiragana" | "katakana";
  category: string;
  kana: string;
  romaji: string;
  romaji_alt: string | null;
  row_group: string | null;
  vowel: string | null;
  base_kana: string | null;
  base_romaji: string | null;
  pair_key: string | null;
  is_digraph: boolean;
  is_common: boolean;
  n5_relevant: boolean;
  audio_path: string | null;
  stroke_order_path: string | null;
  unicode_codepoints: string | null;
  unicode_names: string | null;
  display_order: number;
}

/**
 * Complete kana chart data.
 */
export interface KanaChart {
  hiragana: KanaCharacter[];
  katakana: KanaCharacter[];
}

// ============================================
// Particles
// ============================================

/**
 * Japanese particle.
 */
export interface Particle {
  id: string;
  particle: string;
  reading: string | null;
  romaji: string | null;
  meaning_en: string;
  meaning_id: string | null;
  usage_examples: ParticleExample[];
  jlpt_level: JLPTLevel;
}

/**
 * Particle usage example.
 */
export interface ParticleExample {
  sentence: string;
  meaning: string;
}

// ============================================
// Reading
// ============================================

/**
 * Reading passage from database.
 * Columns match public.reading_passages table.
 */
export interface ReadingPassage {
  id: string;
  jlpt_level: JLPTLevel;
  passage_key: string | null;
  title_id: string | null;
  title_en: string | null;
  topic: string | null;
  difficulty_order: number | null;
  reading_format: string | null;
  passage_jp: string | null;
  passage_romaji: string | null;
  passage_id: string | null;
  character_count: number | null;
  estimated_reading_seconds: number | null;
  question_count: number | null;
}

/**
 * Reading passage with metadata.
 */
export interface ReadingPassageFull extends ReadingPassage {
  estimated_time_minutes: number;
}

// ============================================
// Lessons
// ============================================

/**
 * Lesson structure.
 */
export interface Lesson {
  id: string;
  title: string;
  description: string;
  type: LessonType;
  jlpt_level?: JLPTLevel;
  order: number;
}

/**
 * Lesson type.
 */
export type LessonType =
  | "vocabulary"
  | "grammar"
  | "kanji"
  | "reading"
  | "quiz"
  | "review";

/**
 * Lesson section.
 */
export interface LessonSection {
  id: string;
  type: SectionType;
  title?: string;
  content: SectionContent;
}

type SectionType = "text" | "vocabulary" | "grammar" | "example" | "exercise";
type SectionContent = string | Vocabulary[] | GrammarPoint[];

/**
 * Lesson with content.
 */
export interface LessonFull extends Lesson {
  sections: LessonSection[];
}

/**
 * Lesson with user progress.
 */
export interface LessonWithProgress extends Lesson {
  is_completed: boolean;
  progress_percent: number;
}
