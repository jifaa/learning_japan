import { type SeedClient } from './seed-utils'
import { readCsv, extractExtraColumns, parseJsonField, parseArrayField, seedPath, type SeedError, type ImportResult, upsertRows } from './seed-utils'

// ─── Shared column sets ───────────────────────────────────────────────────────

const COMMON_FIELDS = [
  'id',
  'jlpt_level',
  'display_order',
  'set_type',
  'notes',
  'source_url',
]

// ─── Kana ─────────────────────────────────────────────────────────────────────

interface KanaRow {
  id: string; script: string; category: string; kana: string; romaji: string
  romaji_alt: string; row_group: string; vowel: string; base_kana: string
  base_romaji: string; pair_key: string; is_digraph: string; is_common: string
  n5_relevant: string; audio_path: string; stroke_order_path: string
  unicode_codepoints: string; unicode_names: string; notes: string
  source_url: string; display_order: string
}

export async function importKana(
  supabase: SeedClient,
  dryRun: boolean
): Promise<ImportResult> {
  const rows = readCsv<KanaRow>(seedPath('kana_characters_hiragana_katakana.csv'))
  const mapped = rows.map((r) => {
    const extra = extractExtraColumns(r, COMMON_FIELDS)
    return {
      id: r.id,
      script: r.script,
      category: r.category,
      kana: r.kana,
      romaji: r.romaji,
      romaji_alt: r.romaji_alt || null,
      row_group: r.row_group || null,
      vowel: r.vowel || null,
      base_kana: r.base_kana || null,
      base_romaji: r.base_romaji || null,
      pair_key: r.pair_key || null,
      is_digraph: r.is_digraph === 'true',
      is_common: r.is_common === 'true',
      n5_relevant: r.n5_relevant === 'true',
      audio_path: r.audio_path || null,
      stroke_order_path: r.stroke_order_path || null,
      unicode_codepoints: r.unicode_codepoints || null,
      unicode_names: r.unicode_names || null,
      display_order: parseInt(r.display_order) || 0,
      raw_data: Object.keys(extra).length ? extra : null,
    }
  })
  if (dryRun) return { table: 'kana_characters', file: 'kana_characters_hiragana_katakana.csv', success: true, upserted: mapped.length, skipped: 0, errors: [] }
  const { upserted, errors } = await upsertRows(supabase, 'kana_characters', mapped)
  return { table: 'kana_characters', file: 'kana_characters_hiragana_katakana.csv', success: true, upserted, skipped: mapped.length - upserted, errors }
}

// ─── Symbols (Japanese Punctuation) ──────────────────────────────────────────

interface SymbolRow {
  id: string; set_type: string; display_order: string; symbol: string
  visible_symbol: string; unicode_codepoint: string; unicode_name: string
  unicode_escape: string; utf8_hex: string; category: string; subcategory: string
  japanese_name: string; romaji_name: string; meaning_id: string; usage_id: string
  input_aliases: string; normalized_nfkc: string; suggested_normalized_to: string
  pair_key: string; pair_role: string; is_pair: string; is_common: string
  n5_relevant: string; recommended_for_quiz: string; example_jp: string
  example_id: string; source_url: string; notes: string
}

export async function importSymbols(
  supabase: SeedClient,
  dryRun: boolean
): Promise<ImportResult> {
  const rows = readCsv<SymbolRow>(seedPath('japanese_symbols_punctuation_seed.csv'))
  const mapped = rows.map((r) => {
    const extra = extractExtraColumns(r, [...COMMON_FIELDS, 'id', 'set_type', 'display_order'])
    return {
      id: r.id,
      symbol: r.symbol,
      visible_symbol: r.visible_symbol || r.symbol,
      unicode_codepoint: r.unicode_codepoint || null,
      unicode_name: r.unicode_name || null,
      category: r.category || null,
      subcategory: r.subcategory || null,
      japanese_name: r.japanese_name || null,
      romaji_name: r.romaji_name || null,
      meaning_id: r.meaning_id || null,
      usage_id: r.usage_id || null,
      input_aliases: r.input_aliases || null,
      normalized_nfkc: r.normalized_nfkc || null,
      pair_key: r.pair_key || null,
      pair_role: r.pair_role || null,
      is_pair: r.is_pair === 'true',
      is_common: r.is_common === 'true',
      n5_relevant: r.n5_relevant === 'true',
      recommended_for_quiz: r.recommended_for_quiz === 'true',
      example_jp: r.example_jp || null,
      example_id: r.example_id || null,
      display_order: parseInt(r.display_order) || 0,
      raw_data: Object.keys(extra).length ? extra : null,
    }
  })
  if (dryRun) return { table: 'symbols', file: 'japanese_symbols_punctuation_seed.csv', success: true, upserted: mapped.length, skipped: 0, errors: [] }
  const { upserted, errors } = await upsertRows(supabase, 'symbols', mapped)
  return { table: 'symbols', file: 'japanese_symbols_punctuation_seed.csv', success: true, upserted, skipped: mapped.length - upserted, errors }
}

// ─── Particles ────────────────────────────────────────────────────────────────

interface ParticleRow {
  id: string; jlpt_level: string; set_type: string; display_order: string
  particle: string; reading_kana: string; romaji: string; romaji_alt: string
  particle_category: string; function_key: string; meaning_id: string
  meaning_en: string; usage_explanation_id: string; pattern: string
  example_jp: string; example_romaji: string; example_meaning_id: string
  position: string; is_common: string; is_core_n5: string
  recommended_for_quiz: string; confusable_with: string
  common_mistake_id: string; input_aliases: string; source_url: string; notes: string
}

export async function importParticles(
  supabase: SeedClient,
  dryRun: boolean
): Promise<ImportResult> {
  const rows = readCsv<ParticleRow>(seedPath('jlpt_n5_particles_seed.csv'))
  const mapped = rows.map((r) => {
    const extra = extractExtraColumns(r, COMMON_FIELDS)
    return {
      id: r.id,
      jlpt_level: r.jlpt_level || null,
      particle: r.particle,
      reading_kana: r.reading_kana || null,
      romaji: r.romaji,
      romaji_alt: r.romaji_alt || null,
      particle_category: r.particle_category || null,
      function_key: r.function_key || null,
      meaning_id: r.meaning_id || null,
      meaning_en: r.meaning_en || null,
      usage_explanation_id: r.usage_explanation_id || null,
      pattern: r.pattern || null,
      example_jp: r.example_jp || null,
      example_romaji: r.example_romaji || null,
      example_meaning_id: r.example_meaning_id || null,
      position: r.position || null,
      is_common: r.is_common === 'true',
      is_core_n5: r.is_core_n5 === 'true',
      recommended_for_quiz: r.recommended_for_quiz === 'true',
      confusable_with: r.confusable_with || null,
      common_mistake_id: r.common_mistake_id || null,
      input_aliases: r.input_aliases || null,
      display_order: parseInt(r.display_order) || 0,
      raw_data: Object.keys(extra).length ? extra : null,
    }
  })
  if (dryRun) return { table: 'particles', file: 'jlpt_n5_particles_seed.csv', success: true, upserted: mapped.length, skipped: 0, errors: [] }
  const { upserted, errors } = await upsertRows(supabase, 'particles', mapped)
  return { table: 'particles', file: 'jlpt_n5_particles_seed.csv', success: true, upserted, skipped: mapped.length - upserted, errors }
}

// ─── Grammar ──────────────────────────────────────────────────────────────────

interface GrammarRow {
  id: string; jlpt_level: string; set_type: string; display_order: string
  grammar_point: string; reading_kana: string; romaji: string; meaning_id: string
  meaning_en: string; category_id: string; lesson_group: string
  structure_pattern: string; usage_explanation_id: string; example_jp: string
  example_romaji: string; example_meaning_id: string; practice_type: string
  practice_prompt_id: string; practice_answer: string; related_points: string
  confusable_with: string; formality: string; polarity: string; register: string
  difficulty_order: string; tags: string; is_core_n5: string
  recommended_for_quiz: string; illustration_path: string; audio_path: string
  source_basis: string; source_url: string; notes: string
}

export async function importGrammar(
  supabase: SeedClient,
  dryRun: boolean
): Promise<ImportResult> {
  const rows = readCsv<GrammarRow>(seedPath('jlpt_n5_grammar_seed.csv'))
  const mapped = rows.map((r) => {
    const extra = extractExtraColumns(r, COMMON_FIELDS)
    return {
      id: r.id,
      jlpt_level: r.jlpt_level || null,
      grammar_point: r.grammar_point,
      reading_kana: r.reading_kana || null,
      romaji: r.romaji || null,
      meaning_id: r.meaning_id || null,
      meaning_en: r.meaning_en || null,
      category_id: r.category_id || null,
      lesson_group: r.lesson_group || null,
      structure_pattern: r.structure_pattern || null,
      usage_explanation_id: r.usage_explanation_id || null,
      example_jp: r.example_jp || null,
      example_romaji: r.example_romaji || null,
      example_meaning_id: r.example_meaning_id || null,
      practice_type: r.practice_type || null,
      practice_prompt_id: r.practice_prompt_id || null,
      practice_answer: r.practice_answer || null,
      related_points: r.related_points || null,
      confusable_with: r.confusable_with || null,
      formality: r.formality || null,
      polarity: r.polarity || null,
      register: r.register || null,
      difficulty_order: parseInt(r.difficulty_order) || 0,
      tags: parseArrayField(r.tags, ','),
      is_core_n5: r.is_core_n5 === 'true',
      recommended_for_quiz: r.recommended_for_quiz === 'true',
      illustration_path: r.illustration_path || null,
      audio_path: r.audio_path || null,
      source_basis: r.source_basis || null,
      display_order: parseInt(r.display_order) || 0,
      raw_data: Object.keys(extra).length ? extra : null,
    }
  })
  if (dryRun) return { table: 'grammar_points', file: 'jlpt_n5_grammar_seed.csv', success: true, upserted: mapped.length, skipped: 0, errors: [] }
  const { upserted, errors } = await upsertRows(supabase, 'grammar_points', mapped)
  return { table: 'grammar_points', file: 'jlpt_n5_grammar_seed.csv', success: true, upserted, skipped: mapped.length - upserted, errors }
}

// ─── Vocabulary ───────────────────────────────────────────────────────────────

interface VocabRow {
  id: string; jlpt_level: string; display_order: string; expression: string
  primary_expression: string; reading: string; romaji: string; script_type: string
  part_of_speech_id: string; part_of_speech: string; semantic_category: string
  meaning_id: string; meaning_en: string; tags_original: string; is_common: string
  is_official_jlpt_list: string; source_basis: string; source_url: string
  audio_path: string; example_sentence_jp: string; example_sentence_id: string
  notes: string; example_sentence_romaji: string
  example_sentence_review_status: string; example_sentence_source: string
}

export async function importVocabulary(
  supabase: SeedClient,
  dryRun: boolean
): Promise<ImportResult> {
  const rows = readCsv<VocabRow>(seedPath('jlpt_n5_vocabulary_seed_with_examples.csv'))
  const mapped = rows.map((r) => {
    const extra = extractExtraColumns(r, COMMON_FIELDS)
    return {
      id: r.id,
      jlpt_level: r.jlpt_level || null,
      expression: r.expression,
      primary_expression: r.primary_expression || r.expression,
      reading: r.reading || null,
      romaji: r.romaji || null,
      script_type: r.script_type || null,
      part_of_speech_id: r.part_of_speech_id || null,
      part_of_speech: r.part_of_speech || null,
      semantic_category: r.semantic_category || null,
      meaning_id: r.meaning_id || null,
      meaning_en: r.meaning_en || null,
      tags: parseArrayField(r.tags_original, ','),
      is_common: r.is_common === 'true',
      is_official_jlpt_list: r.is_official_jlpt_list === 'true',
      source_basis: r.source_basis || null,
      audio_path: r.audio_path || null,
      example_sentence_jp: r.example_sentence_jp || null,
      example_sentence_id: r.example_sentence_id || null,
      example_sentence_romaji: r.example_sentence_romaji || null,
      example_sentence_review_status: r.example_sentence_review_status || null,
      display_order: parseInt(r.display_order) || 0,
      raw_data: Object.keys(extra).length ? extra : null,
    }
  })
  if (dryRun) return { table: 'vocabulary', file: 'jlpt_n5_vocabulary_seed_with_examples.csv', success: true, upserted: mapped.length, skipped: 0, errors: [] }
  const { upserted, errors } = await upsertRows(supabase, 'vocabulary', mapped)
  return { table: 'vocabulary', file: 'jlpt_n5_vocabulary_seed_with_examples.csv', success: true, upserted, skipped: mapped.length - upserted, errors }
}

// ─── Kanji ────────────────────────────────────────────────────────────────────

interface KanjiRow {
  id: string; jlpt_level: string; set_type: string; display_order: string
  kanji: string; unicode_codepoint: string; unicode_name: string; stroke_count: string
  onyomi_romaji: string; onyomi_katakana: string; kunyomi_romaji: string
  kunyomi_hiragana: string; meaning_en: string; meaning_id: string
  example_word: string; example_reading: string; example_romaji: string
  example_meaning_id: string; example_sentence_jp: string; example_sentence_id: string
  mnemonic_id: string; radical_kanji: string; audio_path: string
  stroke_order_path: string; source_url: string; secondary_source_url: string; notes: string
}

export async function importKanji(
  supabase: SeedClient,
  dryRun: boolean
): Promise<ImportResult> {
  const rows = readCsv<KanjiRow>(seedPath('jlpt_n5_kanji_extended_103.csv'))
  const mapped = rows.map((r) => {
    const extra = extractExtraColumns(r, COMMON_FIELDS)
    return {
      id: r.id,
      jlpt_level: r.jlpt_level || null,
      kanji: r.kanji,
      unicode_codepoint: r.unicode_codepoint || null,
      unicode_name: r.unicode_name || null,
      stroke_count: parseInt(r.stroke_count) || 0,
      onyomi_romaji: r.onyomi_romaji || null,
      onyomi_katakana: r.onyomi_katakana || null,
      kunyomi_romaji: r.kunyomi_romaji || null,
      kunyomi_hiragana: r.kunyomi_hiragana || null,
      meaning_en: r.meaning_en || null,
      meaning_id: r.meaning_id || null,
      example_word: r.example_word || null,
      example_reading: r.example_reading || null,
      example_romaji: r.example_romaji || null,
      example_meaning_id: r.example_meaning_id || null,
      example_sentence_jp: r.example_sentence_jp || null,
      example_sentence_id: r.example_sentence_id || null,
      mnemonic_id: r.mnemonic_id || null,
      radical_kanji: r.radical_kanji || null,
      audio_path: r.audio_path || null,
      stroke_order_path: r.stroke_order_path || null,
      display_order: parseInt(r.display_order) || 0,
      raw_data: Object.keys(extra).length ? extra : null,
    }
  })
  if (dryRun) return { table: 'kanji', file: 'jlpt_n5_kanji_extended_103.csv', success: true, upserted: mapped.length, skipped: 0, errors: [] }
  const { upserted, errors } = await upsertRows(supabase, 'kanji', mapped)
  return { table: 'kanji', file: 'jlpt_n5_kanji_extended_103.csv', success: true, upserted, skipped: mapped.length - upserted, errors }
}

// ─── Radicals (214 Kangxi) ─────────────────────────────────────────────────────

interface RadicalRow {
  id: string; radical_system: string; radical_number: string; stroke_count: string
  base_radical: string; kangxi_radical_symbol: string; unicode_codepoint: string
  unicode_name: string; kangxi_unicode_codepoint: string; japanese_name_hiragana: string
  japanese_name_romaji: string; meaning_en: string; meaning_id: string
  variant_forms: string; variant_notes_id: string
  is_common_for_japanese_learners: string; n5_relevant: string
  recommended_for_quiz: string; source_url: string; secondary_source_url: string; notes: string
}

export async function importRadicals(
  supabase: SeedClient,
  dryRun: boolean
): Promise<ImportResult> {
  const rows = readCsv<RadicalRow>(seedPath('kanji_radicals_214_seed.csv'))
  const mapped = rows.map((r) => {
    const extra = extractExtraColumns(r, COMMON_FIELDS)
    return {
      id: r.id,
      radical_system: r.radical_system || 'kangxi_214_japanese',
      radical_number: parseInt(r.radical_number) || 0,
      stroke_count: parseInt(r.stroke_count) || 0,
      base_radical: r.base_radical,
      kangxi_radical_symbol: r.kangxi_radical_symbol || null,
      unicode_codepoint: r.unicode_codepoint || null,
      unicode_name: r.unicode_name || null,
      kangxi_unicode_codepoint: r.kangxi_unicode_codepoint || null,
      japanese_name_hiragana: r.japanese_name_hiragana || null,
      japanese_name_romaji: r.japanese_name_romaji || null,
      meaning_en: r.meaning_en || null,
      meaning_id: r.meaning_id || null,
      variant_forms: r.variant_forms || null,
      variant_notes_id: r.variant_notes_id || null,
      is_common_for_japanese_learners: r.is_common_for_japanese_learners === 'true',
      n5_relevant: r.n5_relevant === 'true',
      recommended_for_quiz: r.recommended_for_quiz === 'true',
      raw_data: Object.keys(extra).length ? extra : null,
    }
  })
  if (dryRun) return { table: 'radicals', file: 'kanji_radicals_214_seed.csv', success: true, upserted: mapped.length, skipped: 0, errors: [] }
  const { upserted, errors } = await upsertRows(supabase, 'radicals', mapped)
  return { table: 'radicals', file: 'kanji_radicals_214_seed.csv', success: true, upserted, skipped: mapped.length - upserted, errors }
}

// ─── Radical Variants ─────────────────────────────────────────────────────────

interface RadicalVariantRow {
  id: string; base_radical_id: string; radical_number: string; base_radical: string
  variant_form: string; variant_unicode_codepoint: string; variant_unicode_name: string
  variant_position_category: string; japanese_name_hiragana: string
  japanese_name_romaji: string; meaning_id: string; is_common: string
  n5_relevant: string; source_url: string; notes_id: string
}

export async function importRadicalVariants(
  supabase: SeedClient,
  dryRun: boolean
): Promise<ImportResult> {
  const rows = readCsv<RadicalVariantRow>(seedPath('kanji_radical_variants_seed.csv'))
  const mapped = rows.map((r) => {
    const extra = extractExtraColumns(r, ['id', 'base_radical_id', 'radical_number', 'base_radical', 'variant_form', 'variant_unicode_codepoint', 'variant_unicode_name', 'variant_position_category', 'japanese_name_hiragana', 'japanese_name_romaji', 'meaning_id', 'is_common', 'n5_relevant', 'source_url', 'notes_id'])
    return {
      id: r.id,
      base_radical_id: r.base_radical_id,
      radical_number: parseInt(r.radical_number) || 0,
      base_radical: r.base_radical,
      variant_form: r.variant_form,
      variant_unicode_codepoint: r.variant_unicode_codepoint || null,
      variant_unicode_name: r.variant_unicode_name || null,
      variant_position_category: r.variant_position_category || null,
      japanese_name_hiragana: r.japanese_name_hiragana || null,
      japanese_name_romaji: r.japanese_name_romaji || null,
      meaning_id: r.meaning_id || null,
      is_common: r.is_common === 'true',
      n5_relevant: r.n5_relevant === 'true',
      raw_data: Object.keys(extra).length ? extra : null,
    }
  })
  if (dryRun) return { table: 'radical_variants', file: 'kanji_radical_variants_seed.csv', success: true, upserted: mapped.length, skipped: 0, errors: [] }
  const { upserted, errors } = await upsertRows(supabase, 'radical_variants', mapped)
  return { table: 'radical_variants', file: 'kanji_radical_variants_seed.csv', success: true, upserted, skipped: mapped.length - upserted, errors }
}

// ─── Kanji Radical Map ────────────────────────────────────────────────────────

interface KanjiRadicalMapRow {
  id: string; jlpt_level: string; set_type: string; display_order: string
  kanji: string; kanji_meaning_id: string; radical_form_used: string
  canonical_radical: string; radical_id: string; radical_number: string
  radical_name_hiragana: string; radical_name_romaji: string
  radical_meaning_id: string; radical_position_guess: string
  is_variant_form: string; is_core_80: string; source_basis: string
  source_url: string; notes: string
}

export async function importKanjiRadicalMap(
  supabase: SeedClient,
  dryRun: boolean
): Promise<ImportResult> {
  const rows = readCsv<KanjiRadicalMapRow>(seedPath('jlpt_n5_kanji_radical_map_seed.csv'))
  const mapped = rows.map((r) => {
    const extra = extractExtraColumns(r, COMMON_FIELDS)
    return {
      id: r.id,
      jlpt_level: r.jlpt_level || null,
      kanji: r.kanji,
      kanji_meaning_id: r.kanji_meaning_id || null,
      radical_form_used: r.radical_form_used,
      canonical_radical: r.canonical_radical,
      radical_id: r.radical_id,
      radical_number: parseInt(r.radical_number) || 0,
      radical_name_hiragana: r.radical_name_hiragana || null,
      radical_name_romaji: r.radical_name_romaji || null,
      radical_meaning_id: r.radical_meaning_id || null,
      radical_position_guess: r.radical_position_guess || null,
      is_variant_form: r.is_variant_form === 'true',
      is_core_80: r.is_core_80 === 'true',
      display_order: parseInt(r.display_order) || 0,
      raw_data: Object.keys(extra).length ? extra : null,
    }
  })
  if (dryRun) return { table: 'kanji_radical_map', file: 'jlpt_n5_kanji_radical_map_seed.csv', success: true, upserted: mapped.length, skipped: 0, errors: [] }
  const { upserted, errors } = await upsertRows(supabase, 'kanji_radical_map', mapped)
  return { table: 'kanji_radical_map', file: 'jlpt_n5_kanji_radical_map_seed.csv', success: true, upserted, skipped: mapped.length - upserted, errors }
}

// ─── Conjugation Rules ────────────────────────────────────────────────────────

interface VerbConjugationRow {
  id: string; jlpt_level: string; set_type: string; display_order: string
  rule_family: string; form_key: string; form_name_id: string; meaning_id: string
  source_form: string; verb_group: string; applies_to_ending: string
  match_condition: string; operation: string; stem_change: string
  append_text: string; result_formula_id: string; example_verb: string
  example_reading: string; example_romaji: string; example_result: string
  example_result_romaji: string; example_meaning_id: string; polarity: string
  tense: string; politeness: string; used_by_grammar_points: string
  is_core_n5: string; recommended_for_quiz: string; priority: string
  source_url: string; notes: string
}

interface AdjConjugationRow {
  id: string; jlpt_level: string; set_type: string; display_order: string
  rule_family: string; adjective_type: string; form_key: string
  form_name_id: string; meaning_id: string; applies_to_ending: string
  match_condition: string; operation: string; result_ending: string
  example_adjective: string; example_reading: string; example_romaji: string
  example_result: string; example_result_romaji: string; example_meaning_id: string
  polarity: string; tense: string; formality: string; is_core_n5: string
  recommended_for_quiz: string; priority: string; source_url: string; notes: string
}

export async function importConjugationRules(
  supabase: SeedClient,
  dryRun: boolean
): Promise<ImportResult> {
  const verbRows = readCsv<VerbConjugationRow>(seedPath('jlpt_n5_verb_conjugation_rules_seed.csv'))
  const adjRows = readCsv<AdjConjugationRow>(seedPath('jlpt_n5_adjective_conjugation_rules_seed.csv'))
  
  const verbMapped = verbRows.map((r) => {
    const extra = extractExtraColumns(r, COMMON_FIELDS)
    return {
      id: r.id,
      jlpt_level: r.jlpt_level || null,
      conjugation_type: 'verb',
      rule_family: r.rule_family || null,
      form_key: r.form_key,
      form_name_id: r.form_name_id || null,
      meaning_id: r.meaning_id || null,
      applies_to_ending: r.applies_to_ending || null,
      match_condition: r.match_condition || null,
      operation: r.operation || null,
      stem_change: r.stem_change || null,
      append_text: r.append_text || null,
      result_formula_id: r.result_formula_id || null,
      example_verb: r.example_verb || null,
      example_reading: r.example_reading || null,
      example_romaji: r.example_romaji || null,
      example_result: r.example_result || null,
      example_result_romaji: r.example_result_romaji || null,
      example_meaning_id: r.example_meaning_id || null,
      polarity: r.polarity || null,
      tense: r.tense || null,
      politeness: r.politeness || null,
      is_core_n5: r.is_core_n5 === 'true',
      recommended_for_quiz: r.recommended_for_quiz === 'true',
      priority: parseInt(r.priority) || 0,
      display_order: parseInt(r.display_order) || 0,
      raw_data: Object.keys(extra).length ? extra : null,
    }
  })
  
  const adjMapped = adjRows.map((r) => {
    const extra = extractExtraColumns(r, COMMON_FIELDS)
    return {
      id: r.id,
      jlpt_level: r.jlpt_level || null,
      conjugation_type: 'adjective',
      rule_family: r.rule_family || null,
      form_key: r.form_key,
      form_name_id: r.form_name_id || null,
      meaning_id: r.meaning_id || null,
      applies_to_ending: r.applies_to_ending || null,
      match_condition: r.match_condition || null,
      operation: r.operation || null,
      result_ending: r.result_ending || null,
      example_adjective: r.example_adjective || null,
      example_reading: r.example_reading || null,
      example_romaji: r.example_romaji || null,
      example_result: r.example_result || null,
      example_result_romaji: r.example_result_romaji || null,
      example_meaning_id: r.example_meaning_id || null,
      polarity: r.polarity || null,
      tense: r.tense || null,
      formality: r.formality || null,
      is_core_n5: r.is_core_n5 === 'true',
      recommended_for_quiz: r.recommended_for_quiz === 'true',
      priority: parseInt(r.priority) || 0,
      display_order: parseInt(r.display_order) || 0,
      raw_data: Object.keys(extra).length ? extra : null,
    }
  })
  
  const allMapped = [...verbMapped, ...adjMapped]
  if (dryRun) return { table: 'conjugation_rules', file: 'jlpt_n5_verb_conjugation_rules_seed.csv + adj', success: true, upserted: allMapped.length, skipped: 0, errors: [] }
  const { upserted, errors } = await upsertRows(supabase, 'conjugation_rules', allMapped)
  return { table: 'conjugation_rules', file: 'jlpt_n5_verb_conjugation_rules_seed.csv + adj', success: true, upserted, skipped: allMapped.length - upserted, errors }
}
// ─── Numbers ─────────────────────────────────────────────────────────────────

interface NumberRow {
  id: string; jlpt_level: string; set_type: string; display_order: string
  number_value: string; kanji: string; reading_kana: string; romaji: string
  reading_alt_kana: string; romaji_alt: string; number_type: string
  meaning_id: string; is_common: string; n5_relevant: string
  recommended_for_quiz: string; source_url: string; notes: string
}

export async function importNumbers(
  supabase: SeedClient,
  dryRun: boolean
): Promise<ImportResult> {
  const rows = readCsv<NumberRow>(seedPath("japanese_numbers_seed.csv"))
  const mapped = rows.map((r) => {
    const extra = extractExtraColumns(r, COMMON_FIELDS)
    return {
      id: r.id,
      jlpt_level: r.jlpt_level || null,
      number_value: parseInt(r.number_value) || 0,
      kanji: r.kanji || null,
      reading_kana: r.reading_kana || null,
      romaji: r.romaji || null,
      reading_alt_kana: r.reading_alt_kana || null,
      romaji_alt: r.romaji_alt || null,
      number_type: r.number_type || null,
      meaning_id: r.meaning_id || null,
      is_common: r.is_common === "true",
      n5_relevant: r.n5_relevant === "true",
      recommended_for_quiz: r.recommended_for_quiz === "true",
      display_order: parseInt(r.display_order) || 0,
      raw_data: Object.keys(extra).length ? extra : null,
    }
  })
  if (dryRun) return { table: "numbers", file: "japanese_numbers_seed.csv", success: true, upserted: mapped.length, skipped: 0, errors: [] }
  const { upserted, errors } = await upsertRows(supabase, "numbers", mapped)
  return { table: "numbers", file: "japanese_numbers_seed.csv", success: true, upserted, skipped: mapped.length - upserted, errors }
}
// ─── Counters ────────────────────────────────────────────────────────────────

interface CounterRow {
  id: string; jlpt_level: string; set_type: string; display_order: string
  counter_symbol: string; counter_reading_kana: string; counter_romaji: string
  counter_romaji_alt: string; counter_category: string; usage_id: string
  usage_en: string; example_nouns_jp: string; example_nouns_id: string
  how_many_form: string; how_many_reading: string; counting_range_recommended: string
  has_sound_changes: string; is_core_n5: string; is_common: string
  recommended_for_quiz: string; source_url: string; notes: string
}

export async function importCounters(
  supabase: SeedClient,
  dryRun: boolean
): Promise<ImportResult> {
  const rows = readCsv<CounterRow>(seedPath("japanese_counters_seed.csv"))
  const mapped = rows.map((r) => {
    const extra = extractExtraColumns(r, COMMON_FIELDS)
    return {
      id: r.id,
      jlpt_level: r.jlpt_level || null,
      counter_symbol: r.counter_symbol,
      counter_reading_kana: r.counter_reading_kana || null,
      counter_romaji: r.counter_romaji,
      counter_romaji_alt: r.counter_romaji_alt || null,
      counter_category: r.counter_category || null,
      usage_id: r.usage_id || null,
      usage_en: r.usage_en || null,
      example_nouns_jp: r.example_nouns_jp || null,
      example_nouns_id: r.example_nouns_id || null,
      how_many_form: r.how_many_form || null,
      how_many_reading: r.how_many_reading || null,
      counting_range_recommended: r.counting_range_recommended || null,
      has_sound_changes: r.has_sound_changes === "true",
      is_core_n5: r.is_core_n5 === "true",
      is_common: r.is_common === "true",
      recommended_for_quiz: r.recommended_for_quiz === "true",
      display_order: parseInt(r.display_order) || 0,
      raw_data: Object.keys(extra).length ? extra : null,
    }
  })
  if (dryRun) return { table: "counters", file: "japanese_counters_seed.csv", success: true, upserted: mapped.length, skipped: 0, errors: [] }
  const { upserted, errors } = await upsertRows(supabase, "counters", mapped)
  return { table: "counters", file: "japanese_counters_seed.csv", success: true, upserted, skipped: mapped.length - upserted, errors }
}
// ─── Counter Forms ────────────────────────────────────────────────────────────

interface CounterFormRow {
  id: string; jlpt_level: string; set_type: string; display_order: string
  counter_id: string; counter_symbol: string; counter_category: string
  number_value: string; form_kanji: string; reading_kana: string; romaji: string
  reading_alt_kana: string; romaji_alt: string; meaning_id: string
  example_noun_jp: string; example_phrase_jp: string; example_sentence_jp: string
  example_sentence_id: string; is_irregular: string; is_common: string
  recommended_for_quiz: string; source_url: string; notes: string
}

export async function importCounterForms(
  supabase: SeedClient,
  dryRun: boolean
): Promise<ImportResult> {
  const rows = readCsv<CounterFormRow>(seedPath("japanese_counter_forms_n5_seed.csv"))
  const mapped = rows.map((r) => {
    const extra = extractExtraColumns(r, COMMON_FIELDS)
    return {
      id: r.id,
      jlpt_level: r.jlpt_level || null,
      counter_id: r.counter_id,
      counter_symbol: r.counter_symbol,
      counter_category: r.counter_category || null,
      number_value: parseInt(r.number_value) || 0,
      form_kanji: r.form_kanji || null,
      reading_kana: r.reading_kana || null,
      romaji: r.romaji || null,
      reading_alt_kana: r.reading_alt_kana || null,
      romaji_alt: r.romaji_alt || null,
      meaning_id: r.meaning_id || null,
      example_noun_jp: r.example_noun_jp || null,
      example_phrase_jp: r.example_phrase_jp || null,
      example_sentence_jp: r.example_sentence_jp || null,
      example_sentence_id: r.example_sentence_id || null,
      is_irregular: r.is_irregular === "true",
      is_common: r.is_common === "true",
      recommended_for_quiz: r.recommended_for_quiz === "true",
      display_order: parseInt(r.display_order) || 0,
      raw_data: Object.keys(extra).length ? extra : null,
    }
  })
  if (dryRun) return { table: "counter_forms", file: "japanese_counter_forms_n5_seed.csv", success: true, upserted: mapped.length, skipped: 0, errors: [] }
  const { upserted, errors } = await upsertRows(supabase, "counter_forms", mapped)
  return { table: "counter_forms", file: "japanese_counter_forms_n5_seed.csv", success: true, upserted, skipped: mapped.length - upserted, errors }
}

// ─── Calendar / Time ──────────────────────────────────────────────────────────

interface CalendarRow {
  id: string; jlpt_level: string; set_type: string; display_order: string
  calendar_type: string; value: string; kanji: string; reading_kana: string
  romaji: string; romaji_alt: string; meaning_id: string; is_irregular: string
  is_common: string; recommended_for_quiz: string; source_url: string; notes: string
}

export async function importCalendarTime(
  supabase: SeedClient,
  dryRun: boolean
): Promise<ImportResult> {
  const rows = readCsv<CalendarRow>(seedPath("japanese_calendar_time_n5_seed.csv"))
  const mapped = rows.map((r) => {
    const extra = extractExtraColumns(r, COMMON_FIELDS)
    return {
      id: r.id,
      jlpt_level: r.jlpt_level || null,
      calendar_type: r.calendar_type,
      value: r.value,
      kanji: r.kanji || null,
      reading_kana: r.reading_kana || null,
      romaji: r.romaji || null,
      romaji_alt: r.romaji_alt || null,
      meaning_id: r.meaning_id || null,
      is_irregular: r.is_irregular === "true",
      is_common: r.is_common === "true",
      recommended_for_quiz: r.recommended_for_quiz === "true",
      display_order: parseInt(r.display_order) || 0,
      raw_data: Object.keys(extra).length ? extra : null,
    }
  })
  if (dryRun) return { table: "calendar_time", file: "japanese_calendar_time_n5_seed.csv", success: true, upserted: mapped.length, skipped: 0, errors: [] }
  const { upserted, errors } = await upsertRows(supabase, "calendar_time", mapped)
  return { table: "calendar_time", file: "japanese_calendar_time_n5_seed.csv", success: true, upserted, skipped: mapped.length - upserted, errors }
}
// ─── Example Sentences ────────────────────────────────────────────────────────

interface ExampleSentenceRow {
  id: string; jlpt_level: string; set_type: string; display_order: string
  sentence_jp: string; sentence_kana: string; sentence_romaji: string
  meaning_id: string; meaning_en: string; difficulty_level: string
  sentence_type: string; target_vocab_ids: string; target_vocab_terms: string
  target_grammar_ids: string; target_grammar_points: string; target_kanji_ids: string
  target_kanji_chars: string; tags: string; recommended_for_flashcard: string
  recommended_for_quiz: string; audio_path: string; illustration_path: string
  source_basis: string; source_url: string; review_status: string; notes: string
}

export async function importExampleSentences(
  supabase: SeedClient,
  dryRun: boolean
): Promise<ImportResult> {
  const rows = readCsv<ExampleSentenceRow>(seedPath("jlpt_n5_example_sentences_seed.csv"))
  const mapped = rows.map((r) => {
    const extra = extractExtraColumns(r, COMMON_FIELDS)
    return {
      id: r.id,
      jlpt_level: r.jlpt_level || null,
      sentence_jp: r.sentence_jp,
      sentence_kana: r.sentence_kana || null,
      sentence_romaji: r.sentence_romaji || null,
      meaning_id: r.meaning_id || null,
      meaning_en: r.meaning_en || null,
      difficulty_level: parseInt(r.difficulty_level) || 0,
      sentence_type: r.sentence_type || null,
      target_vocab_ids: parseArrayField(r.target_vocab_ids, "|"),
      target_vocab_terms: parseArrayField(r.target_vocab_terms, "|"),
      target_grammar_ids: parseArrayField(r.target_grammar_ids, "|"),
      target_grammar_points: parseArrayField(r.target_grammar_points, "|"),
      target_kanji_ids: parseArrayField(r.target_kanji_ids, "|"),
      target_kanji_chars: parseArrayField(r.target_kanji_chars, "|"),
      tags: parseArrayField(r.tags, ","),
      recommended_for_flashcard: r.recommended_for_flashcard === "true",
      recommended_for_quiz: r.recommended_for_quiz === "true",
      audio_path: r.audio_path || null,
      illustration_path: r.illustration_path || null,
      review_status: r.review_status || null,
      display_order: parseInt(r.display_order) || 0,
      raw_data: Object.keys(extra).length ? extra : null,
    }
  })
  if (dryRun) return { table: "example_sentences", file: "jlpt_n5_example_sentences_seed.csv", success: true, upserted: mapped.length, skipped: 0, errors: [] }
  const { upserted, errors } = await upsertRows(supabase, "example_sentences", mapped)
  return { table: "example_sentences", file: "jlpt_n5_example_sentences_seed.csv", success: true, upserted, skipped: mapped.length - upserted, errors }
}
// ─── Reading Passages ────────────────────────────────────────────────────────

interface ReadingPassageRow {
  id: string; jlpt_level: string; set_type: string; display_order: string
  passage_key: string; title_id: string; title_en: string; topic: string
  difficulty_order: string; reading_format: string; passage_jp: string
  passage_romaji: string; passage_id: string; character_count: string
  estimated_reading_seconds: string; question_count: string; target_vocab_ids: string
  target_vocab_terms: string; target_grammar_ids: string; target_grammar_points: string
  target_kanji_ids: string; target_kanji_chars: string; structured_data_json: string
  recommended_for_mvp: string; recommended_for_quiz: string; used_in_mock_test: string
  source_basis: string; source_url: string; review_status: string; notes: string
}

export async function importReadingPassages(
  supabase: SeedClient,
  dryRun: boolean
): Promise<ImportResult> {
  const rows = readCsv<ReadingPassageRow>(seedPath("reading_passages_n5_seed.csv"))
  const mapped = rows.map((r) => {
    const extra = extractExtraColumns(r, COMMON_FIELDS)
    return {
      id: r.id,
      jlpt_level: r.jlpt_level || null,
      passage_key: r.passage_key,
      title_id: r.title_id || null,
      title_en: r.title_en || null,
      topic: r.topic || null,
      difficulty_order: parseInt(r.difficulty_order) || 0,
      reading_format: r.reading_format || null,
      passage_jp: r.passage_jp,
      passage_romaji: r.passage_romaji || null,
      passage_id: r.passage_id || null,
      character_count: parseInt(r.character_count) || 0,
      estimated_reading_seconds: parseInt(r.estimated_reading_seconds) || 0,
      question_count: parseInt(r.question_count) || 0,
      target_vocab_ids: parseArrayField(r.target_vocab_ids, "|"),
      target_vocab_terms: parseArrayField(r.target_vocab_terms, "|"),
      target_grammar_ids: parseArrayField(r.target_grammar_ids, "|"),
      target_grammar_points: parseArrayField(r.target_grammar_points, "|"),
      target_kanji_ids: parseArrayField(r.target_kanji_ids, "|"),
      target_kanji_chars: parseArrayField(r.target_kanji_chars, "|"),
      structured_data: parseJsonField(r.structured_data_json),
      recommended_for_mvp: r.recommended_for_mvp === "true",
      recommended_for_quiz: r.recommended_for_quiz === "true",
      used_in_mock_test: r.used_in_mock_test === "true",
      review_status: r.review_status || null,
      display_order: parseInt(r.display_order) || 0,
      raw_data: Object.keys(extra).length ? extra : null,
    }
  })
  if (dryRun) return { table: "reading_passages", file: "reading_passages_n5_seed.csv", success: true, upserted: mapped.length, skipped: 0, errors: [] }
  const { upserted, errors } = await upsertRows(supabase, "reading_passages", mapped)
  return { table: "reading_passages", file: "reading_passages_n5_seed.csv", success: true, upserted, skipped: mapped.length - upserted, errors }
}
// ─── Reading Questions ──────────────────────────────────────────────────────

interface ReadingQuestionRow {
  id: string; jlpt_level: string; passage_id: string; passage_key: string
  display_order: string; question_order: string; question_type: string
  skill_focus: string; question_jp: string; question_romaji: string
  question_id: string; choices_json: string; correct_answer_json: string
  explanation_id: string; difficulty_order: string; points: string
  time_limit_seconds: string; quiz_template_key: string
  recommended_for_mvp: string; source_basis: string; source_url: string
  review_status: string; notes: string
}

export async function importReadingQuestions(
  supabase: SeedClient,
  dryRun: boolean
): Promise<ImportResult> {
  const rows = readCsv<ReadingQuestionRow>(seedPath("reading_questions_n5_seed.csv"))
  const mapped = rows.map((r) => {
    const extra = extractExtraColumns(r, COMMON_FIELDS)
    return {
      id: r.id,
      jlpt_level: r.jlpt_level || null,
      passage_id: r.passage_id,
      passage_key: r.passage_key || null,
      question_order: parseInt(r.question_order) || 0,
      question_type: r.question_type || null,
      skill_focus: r.skill_focus || null,
      question_jp: r.question_jp,
      question_romaji: r.question_romaji || null,
      question_id: r.question_id || null,
      choices: parseJsonField(r.choices_json),
      correct_answer: parseJsonField(r.correct_answer_json),
      explanation_id: r.explanation_id || null,
      difficulty_order: parseInt(r.difficulty_order) || 0,
      points: parseInt(r.points) || 1,
      time_limit_seconds: parseInt(r.time_limit_seconds) || 60,
      quiz_template_key: r.quiz_template_key || null,
      recommended_for_mvp: r.recommended_for_mvp === "true",
      review_status: r.review_status || null,
      display_order: parseInt(r.display_order) || 0,
      raw_data: Object.keys(extra).length ? extra : null,
    }
  })
  if (dryRun) return { table: "reading_questions", file: "reading_questions_n5_seed.csv", success: true, upserted: mapped.length, skipped: 0, errors: [] }
  const { upserted, errors } = await upsertRows(supabase, "reading_questions", mapped)
  return { table: "reading_questions", file: "reading_questions_n5_seed.csv", success: true, upserted, skipped: mapped.length - upserted, errors }
}
// ─── Quiz Templates ──────────────────────────────────────────────────────────

interface QuizTemplateRow {
  id: string; jlpt_level: string; display_order: string; skill_domain: string
  lesson_scope: string; template_key: string; display_name_id: string
  description_id: string; question_type: string; interaction_type: string
  ui_component: string; source_dataset: string; source_entity_type: string
  required_fields: string; prompt_template_id: string; stem_template_jp: string
  stem_template_id: string; answer_mode: string; choice_count: string
  allowed_response_format: string; case_sensitive: string; normalize_whitespace: string
  normalize_nfkc: string; normalize_kana: string; allow_romaji: string
  requires_audio: string; requires_image: string; requires_drag_drop: string
  scoring_strategy: string; points: string; partial_credit: string
  time_limit_seconds: string; difficulty_min: string; difficulty_max: string
  distractor_strategy: string; validator_key: string; feedback_template_id: string
  hint_template_id: string; recommended_for_mvp: string; is_jlpt_style: string
  used_in_daily_challenge: string; tags: string; source_url: string; notes: string
}

export async function importQuizTemplates(
  supabase: SeedClient,
  dryRun: boolean
): Promise<ImportResult> {
  const rows = readCsv<QuizTemplateRow>(seedPath("jlpt_n5_quiz_templates_seed.csv"))
  const mapped = rows.map((r) => {
    const extra = extractExtraColumns(r, COMMON_FIELDS)
    return {
      id: r.id,
      jlpt_level: r.jlpt_level || null,
      skill_domain: r.skill_domain || null,
      lesson_scope: r.lesson_scope || null,
      template_key: r.template_key,
      display_name_id: r.display_name_id || null,
      description_id: r.description_id || null,
      question_type: r.question_type || null,
      interaction_type: r.interaction_type || null,
      ui_component: r.ui_component || null,
      source_dataset: r.source_dataset || null,
      source_entity_type: r.source_entity_type || null,
      required_fields: parseArrayField(r.required_fields, ","),
      prompt_template_id: r.prompt_template_id || null,
      stem_template_jp: r.stem_template_jp || null,
      stem_template_id: r.stem_template_id || null,
      answer_mode: r.answer_mode || null,
      choice_count: parseInt(r.choice_count) || 4,
      allowed_response_format: r.allowed_response_format || null,
      case_sensitive: r.case_sensitive === "true",
      normalize_whitespace: r.normalize_whitespace === "true",
      normalize_nfkc: r.normalize_nfkc === "true",
      normalize_kana: r.normalize_kana === "true",
      allow_romaji: r.allow_romaji === "true",
      requires_audio: r.requires_audio === "true",
      requires_image: r.requires_image === "true",
      requires_drag_drop: r.requires_drag_drop === "true",
      scoring_strategy: r.scoring_strategy || null,
      points: parseInt(r.points) || 1,
      partial_credit: r.partial_credit === "true",
      time_limit_seconds: parseInt(r.time_limit_seconds) || 30,
      difficulty_min: parseInt(r.difficulty_min) || 1,
      difficulty_max: parseInt(r.difficulty_max) || 5,
      distractor_strategy: r.distractor_strategy || null,
      validator_key: r.validator_key || null,
      feedback_template_id: r.feedback_template_id || null,
      hint_template_id: r.hint_template_id || null,
      recommended_for_mvp: r.recommended_for_mvp === "true",
      is_jlpt_style: r.is_jlpt_style === "true",
      used_in_daily_challenge: r.used_in_daily_challenge === "true",
      tags: parseArrayField(r.tags, ","),
      display_order: parseInt(r.display_order) || 0,
      raw_data: Object.keys(extra).length ? extra : null,
    }
  })
  if (dryRun) return { table: "quiz_templates", file: "jlpt_n5_quiz_templates_seed.csv", success: true, upserted: mapped.length, skipped: 0, errors: [] }
  const { upserted, errors } = await upsertRows(supabase, "quiz_templates", mapped)
  return { table: "quiz_templates", file: "jlpt_n5_quiz_templates_seed.csv", success: true, upserted, skipped: mapped.length - upserted, errors }
}
// ─── Quiz Answer Schemas ──────────────────────────────────────────────────────

interface QuizAnswerSchemaRow {
  id: string; question_type: string; interaction_type: string
  answer_payload_schema_json: string; response_payload_schema_json: string
  validator_key: string; scoring_strategy: string; normalization_rules: string
  supports_partial_credit: string; ui_notes_id: string; source_url: string
}

export async function importQuizAnswerSchemas(
  supabase: SeedClient,
  dryRun: boolean
): Promise<ImportResult> {
  const rows = readCsv<QuizAnswerSchemaRow>(seedPath("quiz_answer_schemas_seed.csv"))
  const mapped = rows.map((r) => {
    const extra = extractExtraColumns(r, ["id", "question_type", "interaction_type", "answer_payload_schema_json", "response_payload_schema_json", "validator_key", "scoring_strategy", "normalization_rules", "supports_partial_credit", "ui_notes_id", "source_url"])
    return {
      id: r.id,
      question_type: r.question_type,
      interaction_type: r.interaction_type || null,
      answer_payload_schema: parseJsonField(r.answer_payload_schema_json),
      response_payload_schema: parseJsonField(r.response_payload_schema_json),
      validator_key: r.validator_key || null,
      scoring_strategy: r.scoring_strategy || null,
      normalization_rules: r.normalization_rules || null,
      supports_partial_credit: r.supports_partial_credit === "true",
      ui_notes_id: r.ui_notes_id || null,
      raw_data: Object.keys(extra).length ? extra : null,
    }
  })
  if (dryRun) return { table: "quiz_answer_schemas", file: "quiz_answer_schemas_seed.csv", success: true, upserted: mapped.length, skipped: 0, errors: [] }
  const { upserted, errors } = await upsertRows(supabase, "quiz_answer_schemas", mapped)
  return { table: "quiz_answer_schemas", file: "quiz_answer_schemas_seed.csv", success: true, upserted, skipped: mapped.length - upserted, errors }
}

// ─── Quiz Sections ──────────────────────────────────────────────────────────

interface QuizSectionRow {
  id: string; jlpt_level: string; quiz_mode: string; section_key: string
  display_name_id: string; description_id: string; template_pool: string
  question_count: string; time_limit_seconds: string; scoring_mode: string
  score_max: string; passing_hint_id: string; shuffle_questions: string
  shuffle_choices: string; allow_review_after_submit: string; requires_audio: string
  recommended_for_mvp: string; source_url: string; notes: string
}

export async function importQuizSections(
  supabase: SeedClient,
  dryRun: boolean
): Promise<ImportResult> {
  const rows = readCsv<QuizSectionRow>(seedPath("jlpt_n5_quiz_sections_seed.csv"))
  const mapped = rows.map((r) => {
    const extra = extractExtraColumns(r, COMMON_FIELDS)
    return {
      id: r.id,
      jlpt_level: r.jlpt_level || null,
      quiz_mode: r.quiz_mode || null,
      section_key: r.section_key,
      display_name_id: r.display_name_id || null,
      description_id: r.description_id || null,
      template_pool: parseArrayField(r.template_pool, "|"),
      question_count: parseInt(r.question_count) || 0,
      time_limit_seconds: parseInt(r.time_limit_seconds) || 0,
      scoring_mode: r.scoring_mode || null,
      score_max: parseInt(r.score_max) || 0,
      passing_hint_id: r.passing_hint_id || null,
      shuffle_questions: r.shuffle_questions === "true",
      shuffle_choices: r.shuffle_choices === "true",
      allow_review_after_submit: r.allow_review_after_submit === "true",
      requires_audio: r.requires_audio === "true",
      recommended_for_mvp: r.recommended_for_mvp === "true",
      raw_data: Object.keys(extra).length ? extra : null,
    }
  })
  if (dryRun) return { table: "quiz_sections", file: "jlpt_n5_quiz_sections_seed.csv", success: true, upserted: mapped.length, skipped: 0, errors: [] }
  const { upserted, errors } = await upsertRows(supabase, "quiz_sections", mapped)
  return { table: "quiz_sections", file: "jlpt_n5_quiz_sections_seed.csv", success: true, upserted, skipped: mapped.length - upserted, errors }
}
// ─── Lesson Roadmap Tree ──────────────────────────────────────────────────────

interface RoadmapTreeRow {
  id: string; jlpt_level: string; tree_version: string; node_type: string
  parent_id: string; path: string; slug: string; display_order: string
  title_id: string; title_en: string; description_id: string; content_type: string
  skill_domain: string; lesson_group: string; route_path: string; icon_key: string
  estimated_minutes: string; target_xp: string; coin_reward: string
  difficulty_order: string; unlock_order: string; is_mvp: string
  is_required_for_n5: string; is_checkpoint: string; checkpoint_type: string
  completion_rule_key: string; completion_rule_json: string
  primary_dataset_refs: string; secondary_dataset_refs: string
  item_filter_json: string; quiz_section_id: string; srs_deck_key: string
  prerequisite_mode: string; recommended_review_after_days: string
  tags: string; source_basis: string; source_url: string; notes: string
}

export async function importLessonRoadmapTree(
  supabase: SeedClient,
  dryRun: boolean
): Promise<ImportResult> {
  const rows = readCsv<RoadmapTreeRow>(seedPath("jlpt_n5_lesson_roadmap_tree_seed.csv"))
  const mapped = rows.map((r) => {
    const extra = extractExtraColumns(r, COMMON_FIELDS)
    return {
      id: r.id,
      jlpt_level: r.jlpt_level || null,
      tree_version: r.tree_version || null,
      node_type: r.node_type,
      parent_id: r.parent_id || null,
      path: r.path,
      slug: r.slug || null,
      title_id: r.title_id || null,
      title_en: r.title_en || null,
      description_id: r.description_id || null,
      content_type: r.content_type || null,
      skill_domain: r.skill_domain || null,
      lesson_group: r.lesson_group || null,
      route_path: r.route_path || null,
      icon_key: r.icon_key || null,
      estimated_minutes: parseInt(r.estimated_minutes) || 0,
      target_xp: parseInt(r.target_xp) || 0,
      coin_reward: parseInt(r.coin_reward) || 0,
      difficulty_order: parseInt(r.difficulty_order) || 0,
      unlock_order: parseInt(r.unlock_order) || 0,
      is_mvp: r.is_mvp === "true",
      is_required_for_n5: r.is_required_for_n5 === "true",
      is_checkpoint: r.is_checkpoint === "true",
      checkpoint_type: r.checkpoint_type || null,
      completion_rule_key: r.completion_rule_key || null,
      completion_rule: parseJsonField(r.completion_rule_json),
      primary_dataset_refs: parseArrayField(r.primary_dataset_refs, ","),
      secondary_dataset_refs: parseArrayField(r.secondary_dataset_refs, ","),
      item_filter: parseJsonField(r.item_filter_json),
      quiz_section_id: r.quiz_section_id || null,
      srs_deck_key: r.srs_deck_key || null,
      prerequisite_mode: r.prerequisite_mode || null,
      recommended_review_after_days: parseInt(r.recommended_review_after_days) || null,
      tags: parseArrayField(r.tags, ","),
      display_order: parseInt(r.display_order) || 0,
      raw_data: Object.keys(extra).length ? extra : null,
    }
  })
  if (dryRun) return { table: "lesson_roadmap_tree", file: "jlpt_n5_lesson_roadmap_tree_seed.csv", success: true, upserted: mapped.length, skipped: 0, errors: [] }
  const { upserted, errors } = await upsertRows(supabase, "lesson_roadmap_tree", mapped)
  return { table: "lesson_roadmap_tree", file: "jlpt_n5_lesson_roadmap_tree_seed.csv", success: true, upserted, skipped: mapped.length - upserted, errors }
}
// ─── Lesson Content Map ──────────────────────────────────────────────────────

interface LessonContentMapRow {
  id: string; lesson_id: string; lesson_title_id: string; map_type: string
  dataset_ref: string; source_entity_type: string; filter_json: string
  target_count: string; required_count: string; sort_strategy: string
  selection_strategy: string; quiz_template_keys: string; srs_card_type: string
  display_mode: string; review_status: string; notes: string
}

export async function importLessonContentMap(
  supabase: SeedClient,
  dryRun: boolean
): Promise<ImportResult> {
  const rows = readCsv<LessonContentMapRow>(seedPath("jlpt_n5_lesson_content_map_seed.csv"))
  const mapped = rows.map((r) => {
    const extra = extractExtraColumns(r, ["id", "lesson_id", "lesson_title_id", "map_type", "dataset_ref", "source_entity_type", "filter_json", "target_count", "required_count", "sort_strategy", "selection_strategy", "quiz_template_keys", "srs_card_type", "display_mode", "review_status", "notes"])
    return {
      id: r.id,
      lesson_id: r.lesson_id,
      lesson_title_id: r.lesson_title_id || null,
      map_type: r.map_type || null,
      dataset_ref: r.dataset_ref || null,
      source_entity_type: r.source_entity_type || null,
      filter: parseJsonField(r.filter_json),
      target_count: parseInt(r.target_count) || 0,
      required_count: parseInt(r.required_count) || 0,
      sort_strategy: r.sort_strategy || null,
      selection_strategy: r.selection_strategy || null,
      quiz_template_keys: parseArrayField(r.quiz_template_keys, "|"),
      srs_card_type: r.srs_card_type || null,
      display_mode: r.display_mode || null,
      review_status: r.review_status || null,
      raw_data: Object.keys(extra).length ? extra : null,
    }
  })
  if (dryRun) return { table: "lesson_content_map", file: "jlpt_n5_lesson_content_map_seed.csv", success: true, upserted: mapped.length, skipped: 0, errors: [] }
  const { upserted, errors } = await upsertRows(supabase, "lesson_content_map", mapped)
  return { table: "lesson_content_map", file: "jlpt_n5_lesson_content_map_seed.csv", success: true, upserted, skipped: mapped.length - upserted, errors }
}

// ─── Roadmap Milestones ──────────────────────────────────────────────────────

interface RoadmapMilestoneRow {
  id: string; jlpt_level: string; display_order: string; milestone_key: string
  title_id: string; description_id: string; roadmap_phase_id: string
  completion_rule_key: string; completion_rule_json: string; target_metric_key: string
  target_value: string; reward_xp: string; reward_badge_key: string
  unlock_next_phase_id: string; recommended_for_mvp: string; source_basis: string
  source_url: string; notes: string
}

export async function importRoadmapMilestones(
  supabase: SeedClient,
  dryRun: boolean
): Promise<ImportResult> {
  const rows = readCsv<RoadmapMilestoneRow>(seedPath("jlpt_n5_roadmap_milestones_seed.csv"))
  const mapped = rows.map((r) => {
    const extra = extractExtraColumns(r, COMMON_FIELDS)
    return {
      id: r.id,
      jlpt_level: r.jlpt_level || null,
      milestone_key: r.milestone_key,
      title_id: r.title_id || null,
      description_id: r.description_id || null,
      roadmap_phase_id: r.roadmap_phase_id || null,
      completion_rule_key: r.completion_rule_key || null,
      completion_rule: parseJsonField(r.completion_rule_json),
      target_metric_key: r.target_metric_key || null,
      target_value: parseInt(r.target_value) || 0,
      reward_xp: parseInt(r.reward_xp) || 0,
      reward_badge_key: r.reward_badge_key || null,
      unlock_next_phase_id: r.unlock_next_phase_id || null,
      recommended_for_mvp: r.recommended_for_mvp === "true",
      display_order: parseInt(r.display_order) || 0,
      raw_data: Object.keys(extra).length ? extra : null,
    }
  })
  if (dryRun) return { table: "roadmap_milestones", file: "jlpt_n5_roadmap_milestones_seed.csv", success: true, upserted: mapped.length, skipped: 0, errors: [] }
  const { upserted, errors } = await upsertRows(supabase, "roadmap_milestones", mapped)
  return { table: "roadmap_milestones", file: "jlpt_n5_roadmap_milestones_seed.csv", success: true, upserted, skipped: mapped.length - upserted, errors }
}
// ─── SRS Config (Deck Configs + supporting tables) ────────────────────────────

interface SRSDeckConfigRow {
  id: string; deck_key: string; display_name_id: string; description_id: string
  content_domain: string; preset_key: string; parent_deck_key: string
  source_dataset_refs: string; card_template_keys: string
  new_cards_per_day: string; max_reviews_per_day: string
  max_learning_cards_per_day: string; target_retention: string
  priority_order: string; introduce_new_cards_when_backlog_over: string
  backlog_review_threshold: string; leech_threshold: string; leech_action: string
  sibling_bury_scope: string; allow_reverse_cards: string
  allow_typing_cards: string; default_daily_target_cards: string
  unlock_lesson_dependency: string; recommended_for_mvp: string; tags: string
  source_url: string; notes: string
}

export async function importSRSDeckConfigs(
  supabase: SeedClient,
  dryRun: boolean
): Promise<ImportResult> {
  const rows = readCsv<SRSDeckConfigRow>(seedPath("srs_deck_configs_seed.csv"))
  const mapped = rows.map((r) => {
    const extra = extractExtraColumns(r, COMMON_FIELDS)
    return {
      id: r.id,
      deck_key: r.deck_key,
      display_name_id: r.display_name_id || null,
      description_id: r.description_id || null,
      content_domain: r.content_domain || null,
      preset_key: r.preset_key || null,
      parent_deck_key: r.parent_deck_key || null,
      source_dataset_refs: parseArrayField(r.source_dataset_refs, ","),
      card_template_keys: parseArrayField(r.card_template_keys, "|"),
      new_cards_per_day: parseInt(r.new_cards_per_day) || 20,
      max_reviews_per_day: parseInt(r.max_reviews_per_day) || 200,
      max_learning_cards_per_day: parseInt(r.max_learning_cards_per_day) || 25,
      target_retention: parseFloat(r.target_retention) || 0.9,
      priority_order: parseInt(r.priority_order) || 0,
      introduce_new_cards_when_backlog_over: r.introduce_new_cards_when_backlog_over === "true",
      backlog_review_threshold: parseInt(r.backlog_review_threshold) || 100,
      leech_threshold: parseInt(r.leech_threshold) || 8,
      leech_action: r.leech_action || null,
      sibling_bury_scope: r.sibling_bury_scope || null,
      allow_reverse_cards: r.allow_reverse_cards === "true",
      allow_typing_cards: r.allow_typing_cards === "true",
      default_daily_target_cards: parseInt(r.default_daily_target_cards) || 50,
      unlock_lesson_dependency: r.unlock_lesson_dependency || null,
      recommended_for_mvp: r.recommended_for_mvp === "true",
      tags: parseArrayField(r.tags, ","),
      raw_data: Object.keys(extra).length ? extra : null,
    }
  })
  if (dryRun) return { table: "srs_deck_configs", file: "srs_deck_configs_seed.csv", success: true, upserted: mapped.length, skipped: 0, errors: [] }
  const { upserted, errors } = await upsertRows(supabase, "srs_deck_configs", mapped)
  return { table: "srs_deck_configs", file: "srs_deck_configs_seed.csv", success: true, upserted, skipped: mapped.length - upserted, errors }
}
// ─── Achievements ────────────────────────────────────────────────────────────

interface AchievementRow {
  id: string; achievement_key: string; category: string; tier: string
  display_order: string; title_id: string; title_en: string; description_id: string
  criteria_summary_id: string; trigger_rule_key: string; metric_key: string
  comparator: string; threshold_value: string; threshold_unit: string
  scope_key: string; repeatability: string; repeat_limit: string
  prerequisite_achievement_keys: string; reward_xp: string; reward_coins: string
  reward_item_key: string; badge_icon_key: string; title_reward_key: string
  rarity: string; hidden_until_unlocked: string; recommended_for_mvp: string
  open_badges_compatible: string; open_badge_achievement_type: string
  evidence_type: string; tags: string; source_url: string; notes: string
}

export async function importAchievements(
  supabase: SeedClient,
  dryRun: boolean
): Promise<ImportResult> {
  const badgeRows = readCsv<AchievementRow>(seedPath("achievement_badge_definitions_seed.csv"))
  const triggerRows = readCsv<{id: string; achievement_key: string; trigger_type: string; trigger_config_json: string; priority: string; source_url: string; notes: string}>(seedPath("achievement_trigger_rules_seed.csv"))

  const badgeMapped = badgeRows.map((r) => {
    const extra = extractExtraColumns(r, COMMON_FIELDS)
    return {
      id: r.id,
      achievement_key: r.achievement_key,
      category: r.category || null,
      tier: r.tier || null,
      title_id: r.title_id || null,
      title_en: r.title_en || null,
      description_id: r.description_id || null,
      criteria_summary_id: r.criteria_summary_id || null,
      trigger_rule_key: r.trigger_rule_key || null,
      metric_key: r.metric_key || null,
      comparator: r.comparator || null,
      threshold_value: parseFloat(r.threshold_value) || 0,
      threshold_unit: r.threshold_unit || null,
      scope_key: r.scope_key || null,
      repeatability: r.repeatability || null,
      repeat_limit: parseInt(r.repeat_limit) || null,
      prerequisite_achievement_keys: parseArrayField(r.prerequisite_achievement_keys, ","),
      reward_xp: parseInt(r.reward_xp) || 0,
      reward_coins: parseInt(r.reward_coins) || 0,
      reward_item_key: r.reward_item_key || null,
      badge_icon_key: r.badge_icon_key || null,
      title_reward_key: r.title_reward_key || null,
      rarity: r.rarity || null,
      hidden_until_unlocked: r.hidden_until_unlocked === "true",
      recommended_for_mvp: r.recommended_for_mvp === "true",
      open_badges_compatible: r.open_badges_compatible === "true",
      open_badge_achievement_type: r.open_badge_achievement_type || null,
      evidence_type: r.evidence_type || null,
      tags: parseArrayField(r.tags, ","),
      display_order: parseInt(r.display_order) || 0,
      raw_data: Object.keys(extra).length ? extra : null,
    }
  })

  const triggerMapped = triggerRows.map((r) => {
    const extra = extractExtraColumns(r, ["id", "achievement_key", "trigger_type", "trigger_config_json", "priority", "source_url", "notes"])
    return {
      id: r.id,
      achievement_key: r.achievement_key,
      trigger_type: r.trigger_type || null,
      trigger_config: parseJsonField(r.trigger_config_json),
      priority: parseInt(r.priority) || 0,
      raw_data: Object.keys(extra).length ? extra : null,
    }
  })

  const allMapped = [...badgeMapped, ...triggerMapped]
  if (dryRun) return { table: "achievements", file: "achievement_badge_definitions_seed.csv + trigger", success: true, upserted: allMapped.length, skipped: 0, errors: [] }
  const { upserted: bUpserted, errors: bErrors } = await upsertRows(supabase, "achievements", badgeMapped)
  const { upserted: tUpserted, errors: tErrors } = await upsertRows(supabase, "achievement_triggers", triggerMapped)
  const errors = [...bErrors, ...tErrors]
  const upserted = bUpserted + tUpserted
  return { table: "achievements + triggers", file: "achievement_*_seed.csv", success: true, upserted, skipped: allMapped.length - upserted, errors }
}
// ─── XP Levels ───────────────────────────────────────────────────────────────

interface XPLevelRow {
  id: string; level: string; level_title_id: string; required_total_xp: string
  xp_to_next_level: string; reward_coins: string; reward_item_key: string
  unlock_feature_keys: string; daily_xp_soft_cap: string; daily_xp_hard_cap: string
  recommended_new_cards_bonus: string; badge_key: string; source_url: string; notes: string
}

export async function importXPLevels(
  supabase: SeedClient,
  dryRun: boolean
): Promise<ImportResult> {
  const rows = readCsv<XPLevelRow>(seedPath("xp_level_config_seed.csv"))
  const mapped = rows.map((r) => {
    const extra = extractExtraColumns(r, COMMON_FIELDS)
    return {
      id: r.id,
      level: parseInt(r.level) || 0,
      level_title_id: r.level_title_id || null,
      required_total_xp: parseInt(r.required_total_xp) || 0,
      xp_to_next_level: parseInt(r.xp_to_next_level) || 0,
      reward_coins: parseInt(r.reward_coins) || 0,
      reward_item_key: r.reward_item_key || null,
      unlock_feature_keys: parseArrayField(r.unlock_feature_keys, ","),
      daily_xp_soft_cap: parseInt(r.daily_xp_soft_cap) || 0,
      daily_xp_hard_cap: parseInt(r.daily_xp_hard_cap) || 0,
      recommended_new_cards_bonus: parseInt(r.recommended_new_cards_bonus) || 0,
      badge_key: r.badge_key || null,
      raw_data: Object.keys(extra).length ? extra : null,
    }
  })
  if (dryRun) return { table: "xp_levels", file: "xp_level_config_seed.csv", success: true, upserted: mapped.length, skipped: 0, errors: [] }
  const { upserted, errors } = await upsertRows(supabase, "xp_levels", mapped)
  return { table: "xp_levels", file: "xp_level_config_seed.csv", success: true, upserted, skipped: mapped.length - upserted, errors }
}

// ─── Rewards ─────────────────────────────────────────────────────────────────

interface RewardRow {
  id: string; reward_item_key: string; reward_type: string; display_name_id: string
  description_id: string; unlock_condition_type: string; unlock_condition_key: string
  cost_coins: string; is_purchasable: string; rarity: string; equippable_slot: string
  effect_key: string; recommended_for_mvp: string; notes: string
}

export async function importRewards(
  supabase: SeedClient,
  dryRun: boolean
): Promise<ImportResult> {
  const rows = readCsv<RewardRow>(seedPath("reward_catalog_seed.csv"))
  const mapped = rows.map((r) => {
    const extra = extractExtraColumns(r, COMMON_FIELDS)
    return {
      id: r.id,
      reward_item_key: r.reward_item_key,
      reward_type: r.reward_type || null,
      display_name_id: r.display_name_id || null,
      description_id: r.description_id || null,
      unlock_condition_type: r.unlock_condition_type || null,
      unlock_condition_key: r.unlock_condition_key || null,
      cost_coins: parseInt(r.cost_coins) || 0,
      is_purchasable: r.is_purchasable === "true",
      rarity: r.rarity || null,
      equippable_slot: r.equippable_slot || null,
      effect_key: r.effect_key || null,
      recommended_for_mvp: r.recommended_for_mvp === "true",
      raw_data: Object.keys(extra).length ? extra : null,
    }
  })
  if (dryRun) return { table: "rewards", file: "reward_catalog_seed.csv", success: true, upserted: mapped.length, skipped: 0, errors: [] }
  const { upserted, errors } = await upsertRows(supabase, "rewards", mapped)
  return { table: "rewards", file: "reward_catalog_seed.csv", success: true, upserted, skipped: mapped.length - upserted, errors }
}
