#!/usr/bin/env node
/**
 * import-seed.ts
 *
 * Robust seed importer for Supabase.
 * Run modes:
 *   pnpm seed:validate  — Check CSV files and row counts (no DB needed)
 *   pnpm seed:dry-run  — Show what would be imported (env vars optional)
 *   pnpm seed:import   — Actual import (requires full env)
 *
 * Import order matters for foreign key dependencies.
 */

import {
  createServiceClient,
  getSupabaseUrl,
  getServiceRoleKey,
  printReport,
  seedPath,
  type DryRunReport,
} from './seed-utils'
import {
  importKana,
  importSymbols,
  importParticles,
  importGrammar,
  importVocabulary,
  importKanji,
  importRadicals,
  importRadicalVariants,
  importKanjiRadicalMap,
  importConjugationRules,
  importNumbers,
  importCounters,
  importCounterForms,
  importCalendarTime,
  importExampleSentences,
  importReadingPassages,
  importReadingQuestions,
  importQuizTemplates,
  importQuizAnswerSchemas,
  importQuizSections,
  importLessonRoadmapTree,
  importLessonContentMap,
  importRoadmapMilestones,
  importSRSDeckConfigs,
  importAchievements,
  importXPLevels,
  importRewards,
} from './seed-mappers'
import type { ImportResult } from './seed-utils'

type Mode = 'validate' | 'dry-run' | 'import'

// ─── Mode Detection ────────────────────────────────────────────────────────────

function detectMode(): Mode {
  const modeArg = process.argv[2]
  if (modeArg === 'validate') return 'validate'
  if (modeArg === 'dry-run') return 'dry-run'
  if (modeArg === 'import') return 'import'
  // Default to dry-run
  return 'dry-run'
}

// ─── Env Check ────────────────────────────────────────────────────────────────

function checkEnv(): { hasSupabaseUrl: boolean; hasServiceRoleKey: boolean } {
  try {
    getSupabaseUrl()
    getServiceRoleKey()
    return { hasSupabaseUrl: true, hasServiceRoleKey: true }
  } catch {
    return {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    }
  }
}

// ─── Validate CSVs (no DB) ─────────────────────────────────────────────────────

function validateFiles(): { valid: boolean; errors: string[] } {
  const fs = require('fs')
  const errors: string[] = []

  const requiredFiles = [
    // Core content
    'kana_characters_hiragana_katakana.csv',
    'japanese_symbols_punctuation_seed.csv',
    'jlpt_n5_particles_seed.csv',
    'jlpt_n5_grammar_seed.csv',
    'jlpt_n5_vocabulary_seed_with_examples.csv',
    'jlpt_n5_kanji_extended_103.csv',
    'kanji_radicals_214_seed.csv',
    'kanji_radical_variants_seed.csv',
    'jlpt_n5_kanji_radical_map_seed.csv',
    'jlpt_n5_verb_conjugation_rules_seed.csv',
    'jlpt_n5_adjective_conjugation_rules_seed.csv',
    'japanese_numbers_seed.csv',
    'japanese_counters_seed.csv',
    'japanese_counter_forms_n5_seed.csv',
    'japanese_calendar_time_n5_seed.csv',
    'jlpt_n5_example_sentences_seed.csv',
    'reading_passages_n5_seed.csv',
    'reading_questions_n5_seed.csv',
    // Quiz
    'jlpt_n5_quiz_templates_seed.csv',
    'quiz_answer_schemas_seed.csv',
    'jlpt_n5_quiz_sections_seed.csv',
    // Roadmap
    'jlpt_n5_lesson_roadmap_tree_seed.csv',
    'jlpt_n5_lesson_content_map_seed.csv',
    'jlpt_n5_roadmap_milestones_seed.csv',
    // SRS / Gamification
    'srs_deck_configs_seed.csv',
    'achievement_badge_definitions_seed.csv',
    'achievement_trigger_rules_seed.csv',
    'xp_level_config_seed.csv',
    'reward_catalog_seed.csv',
  ]

  for (const file of requiredFiles) {
    const fullPath = seedPath(file)
    if (!fs.existsSync(fullPath)) {
      errors.push(`Missing required file: data/seed/${file}`)
    }
  }

  return { valid: errors.length === 0, errors }
}

// ─── Main Runner ───────────────────────────────────────────────────────────────

async function runImport(mode: Mode): Promise<void> {
  console.log(`\n🚀 Starting seed import — mode: ${mode.toUpperCase()}\n`)

  const envCheck = checkEnv()

  // Validate mode: check files exist
  if (mode === 'validate') {
    const { valid, errors } = validateFiles()
    if (!valid) {
      console.error('❌ Validation failed:')
      errors.forEach((e) => console.error(`   ${e}`))
      process.exit(1)
    }
    console.log('✅ All required seed files present')
    // Count rows per file
    const { readCsv } = await import('./seed-utils')
    const fs = require('fs')
    const Papa = require('papaparse')
    const requiredFiles = [
      'kana_characters_hiragana_katakana.csv',
      'japanese_symbols_punctuation_seed.csv',
      'jlpt_n5_particles_seed.csv',
      'jlpt_n5_grammar_seed.csv',
      'jlpt_n5_vocabulary_seed_with_examples.csv',
      'jlpt_n5_kanji_extended_103.csv',
      'kanji_radicals_214_seed.csv',
      'kanji_radical_variants_seed.csv',
      'jlpt_n5_kanji_radical_map_seed.csv',
      'jlpt_n5_verb_conjugation_rules_seed.csv',
      'jlpt_n5_adjective_conjugation_rules_seed.csv',
      'japanese_numbers_seed.csv',
      'japanese_counters_seed.csv',
      'japanese_counter_forms_n5_seed.csv',
      'japanese_calendar_time_n5_seed.csv',
      'jlpt_n5_example_sentences_seed.csv',
      'reading_passages_n5_seed.csv',
      'reading_questions_n5_seed.csv',
      'jlpt_n5_quiz_templates_seed.csv',
      'quiz_answer_schemas_seed.csv',
      'jlpt_n5_quiz_sections_seed.csv',
      'jlpt_n5_lesson_roadmap_tree_seed.csv',
      'jlpt_n5_lesson_content_map_seed.csv',
      'jlpt_n5_roadmap_milestones_seed.csv',
      'srs_deck_configs_seed.csv',
      'achievement_badge_definitions_seed.csv',
      'achievement_trigger_rules_seed.csv',
      'xp_level_config_seed.csv',
      'reward_catalog_seed.csv',
    ]
    console.log('\n📊 Row counts per file:')
    for (const file of requiredFiles) {
      const fullPath = seedPath(file)
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf-8')
        const result = Papa.parse(content, { header: true, skipEmptyLines: true })
        console.log(`   ${file.padEnd(50)} ${String(result.data.length).padStart(5)} rows`)
      }
    }
    console.log('\n✅ Validation complete')
    return
  }

  // Dry-run or import: need service role for actual DB ops
  if (mode === 'dry-run' && !envCheck.hasServiceRoleKey) {
    console.log('⚠️  Service role key not set — running in read-only dry-run (no DB calls)\n')
  }

  if (mode === 'import') {
    if (!envCheck.hasServiceRoleKey || !envCheck.hasSupabaseUrl) {
      console.error('❌ Import requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
      console.error('   Set them in your .env.local file.')
      process.exit(1)
    }
  }

  const supabase =
    envCheck.hasServiceRoleKey && envCheck.hasSupabaseUrl
      ? createServiceClient()
      : null

  const dryRun = mode === 'dry-run'
  const results: ImportResult[] = []

  // ── Import Order (respects FK dependencies) ─────────────────────────────────
  const steps: Array<{ name: string; fn: () => Promise<ImportResult> }> = [
    // 1. Kana (no FK deps)
    { name: 'kana_characters', fn: () => importKana(supabase!, dryRun) },
    // 2. Symbols (no FK deps)
    { name: 'symbols', fn: () => importSymbols(supabase!, dryRun) },
    // 3. Particles (no FK deps)
    { name: 'particles', fn: () => importParticles(supabase!, dryRun) },
    // 4. Grammar (no FK deps)
    { name: 'grammar_points', fn: () => importGrammar(supabase!, dryRun) },
    // 5. Vocabulary (no FK deps)
    { name: 'vocabulary', fn: () => importVocabulary(supabase!, dryRun) },
    // 6. Kanji (no FK deps)
    { name: 'kanji', fn: () => importKanji(supabase!, dryRun) },
    // 7. Radicals (no FK deps)
    { name: 'radicals', fn: () => importRadicals(supabase!, dryRun) },
    // 8. Radical Variants (FK: radicals)
    { name: 'radical_variants', fn: () => importRadicalVariants(supabase!, dryRun) },
    // 9. Kanji Radical Map (FK: kanji, radicals)
    { name: 'kanji_radical_map', fn: () => importKanjiRadicalMap(supabase!, dryRun) },
    // 10. Conjugation Rules (no FK deps — references grammar/vocab by key)
    { name: 'conjugation_rules', fn: () => importConjugationRules(supabase!, dryRun) },
    // 11. Numbers (no FK deps)
    { name: 'numbers', fn: () => importNumbers(supabase!, dryRun) },
    // 12. Counters (no FK deps)
    { name: 'counters', fn: () => importCounters(supabase!, dryRun) },
    // 13. Counter Forms (FK: counters)
    { name: 'counter_forms', fn: () => importCounterForms(supabase!, dryRun) },
    // 14. Calendar/Time (no FK deps)
    { name: 'calendar_time', fn: () => importCalendarTime(supabase!, dryRun) },
    // 15. Example Sentences (FK: vocabulary, grammar, kanji by key)
    { name: 'example_sentences', fn: () => importExampleSentences(supabase!, dryRun) },
    // 16. Reading Passages (no FK deps)
    { name: 'reading_passages', fn: () => importReadingPassages(supabase!, dryRun) },
    // 17. Reading Questions (FK: reading_passages, quiz_templates)
    { name: 'reading_questions', fn: () => importReadingQuestions(supabase!, dryRun) },
    // 18. Quiz Templates (no FK deps)
    { name: 'quiz_templates', fn: () => importQuizTemplates(supabase!, dryRun) },
    // 19. Quiz Answer Schemas (no FK deps)
    { name: 'quiz_answer_schemas', fn: () => importQuizAnswerSchemas(supabase!, dryRun) },
    // 20. Quiz Sections (FK: quiz_templates)
    { name: 'quiz_sections', fn: () => importQuizSections(supabase!, dryRun) },
    // 21. Lesson Roadmap Tree (no FK deps — self-referential by key)
    { name: 'lesson_roadmap_tree', fn: () => importLessonRoadmapTree(supabase!, dryRun) },
    // 22. Lesson Content Map (FK: lesson_roadmap_tree)
    { name: 'lesson_content_map', fn: () => importLessonContentMap(supabase!, dryRun) },
    // 23. Roadmap Milestones (FK: lesson_roadmap_tree)
    { name: 'roadmap_milestones', fn: () => importRoadmapMilestones(supabase!, dryRun) },
    // 24. SRS Deck Configs (no FK deps)
    { name: 'srs_deck_configs', fn: () => importSRSDeckConfigs(supabase!, dryRun) },
    // 25. Achievements (no FK deps)
    { name: 'achievements', fn: () => importAchievements(supabase!, dryRun) },
    // 26. XP Levels (no FK deps)
    { name: 'xp_levels', fn: () => importXPLevels(supabase!, dryRun) },
    // 27. Rewards (no FK deps)
    { name: 'rewards', fn: () => importRewards(supabase!, dryRun) },
  ]

  // Run in sequence to respect FK order
  for (const step of steps) {
    process.stdout.write(`  Importing ${step.name.padEnd(28)} `)
    try {
      const result = await step.fn()
      results.push(result)
      const icon = result.errors.filter((e) => e.severity === 'error').length > 0
        ? '⚠️ '
        : result.upserted > 0
          ? '✅'
          : 'ℹ️ '
      process.stdout.write(`${icon} ${result.upserted} rows\n`)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      // Non-fatal: collect error and continue
      results.push({
        table: step.name,
        file: 'unknown',
        success: false,
        upserted: 0,
        skipped: 0,
        errors: [
          {
            file: step.name,
            row: 0,
            id: 'unknown',
            message,
            severity: 'error',
          },
        ],
      })
      process.stdout.write(`❌ ${message}\n`)
    }
  }

  // Build and print report
  const summary = results.reduce(
    (acc, r) => ({
      totalTables: acc.totalTables + 1,
      totalUpserted: acc.totalUpserted + r.upserted,
      totalSkipped: acc.totalSkipped + r.skipped,
      totalErrors: acc.totalErrors + r.errors.filter((e) => e.severity === 'error').length,
    }),
    { totalTables: 0, totalUpserted: 0, totalSkipped: 0, totalErrors: 0 }
  )

  const report: DryRunReport = {
    mode,
    timestamp: new Date().toISOString(),
    results,
    summary,
    envCheck,
  }

  printReport(report)

  if (mode === 'import' && summary.totalErrors > 0) {
    console.log('⚠️  Import completed with errors. Review the report above.')
    process.exit(1)
  }
}

// ─── Entry Point ──────────────────────────────────────────────────────────────

const mode = detectMode()
runImport(mode).catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
