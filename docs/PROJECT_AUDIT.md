# PROJECT_AUDIT.md

## Audit Date: 2026-07-02

---

## 1. Current Stack

| Category | Status | Details |
|----------|--------|---------|
| **Framework** | Next.js 9.3.3 | Very outdated. Latest is 15.x |
| **Package Manager** | npm | `package-lock.json` detected |
| **TypeScript** | ✅ Installed | v5 |
| **React** | ✅ 19.2.4 | |
| **Tailwind CSS** | ✅ v4 | Via `@tailwindcss/postcss` |
| **Framer Motion** | ✅ v12 | Both `framer-motion` and `motion` |
| **shadcn/ui** | ❌ Not installed | No `components.json` |
| **Supabase** | ❌ Not installed | No `@supabase/*` packages |
| **Prisma** | ❌ Not installed | No `prisma` or `@prisma/client` |

### Existing App Routes

Only the default Next.js scaffold exists:
- `app/page.tsx` — Default landing page (boilerplate)
- `app/layout.tsx` — Root layout with Geist fonts
- `app/globals.css` — Basic Tailwind v4 setup

No custom routes, API routes, or pages implemented.

---

## 2. Seed Files Found

**Location**: Project root (46 CSV + 20 MD files)

### CSV Files (46 total)

**Vocabulary & Kanji:**
- `jlpt_n5_vocabulary_seed_categories.csv` (441 KB)
- `jlpt_n5_vocabulary_seed_with_examples.csv` (544 KB)
- `jlpt_n5_vocab_example_sentences_autogen.csv` (457 KB)
- `jlpt_n5_kanji_extended_103.csv`
- `jlpt_n5_kanji_radical_map_seed.csv`
- `kanji_radicals_214_seed.csv` (76 KB)
- `kanji_radical_variants_seed.csv`
- `kana_characters_hiragana_katakana.csv` (91 KB)

**Grammar & Conjugation:**
- `jlpt_n5_grammar_seed.csv` (75 KB)
- `jlpt_n5_grammar_core_84_seed.csv` (54 KB)
- `jlpt_n5_verb_conjugation_rules_seed.csv` (38 KB)
- `jlpt_n5_verb_conjugation_test_cases_seed.csv`
- `jlpt_n5_adjective_conjugation_rules_seed.csv` (33 KB)
- `jlpt_n5_adjective_conjugation_test_cases_seed.csv` (42 KB)
- `jlpt_n5_particles_seed.csv` (20 KB)
- `jlpt_n5_example_sentences_seed.csv` (134 KB)

**Numbers & Counters:**
- `japanese_numbers_seed.csv` (28 KB)
- `japanese_counters_seed.csv`
- `japanese_counter_forms_n5_seed.csv` (42 KB)
- `japanese_calendar_time_n5_seed.csv`

**Reading & Quiz:**
- `reading_passages_n5_seed.csv` (54 KB)
- `reading_questions_n5_seed.csv` (93 KB)
- `reading_passage_content_map_n5_seed.csv` (37 KB)
- `reading_sections_n5_seed.csv`
- `jlpt_n5_quiz_templates_seed.csv` (25 KB)
- `jlpt_n5_quiz_sections_seed.csv`
- `jlpt_n5_quiz_item_samples_seed.csv`
- `quiz_answer_schemas_seed.csv`

**Lesson & Roadmap:**
- `jlpt_n5_lesson_roadmap_tree_seed.csv` (87 KB)
- `jlpt_n5_lesson_content_map_seed.csv` (50 KB)
- `jlpt_n5_roadmap_milestones_seed.csv`

**SRS (Spaced Repetition):**
- `srs_card_templates_seed.csv`
- `srs_deck_configs_seed.csv`
- `srs_config_seed_notes.md` (MD)
- `srs_algorithm_presets_seed.csv`
- `srs_queue_rules_seed.csv`
- `srs_rating_options_seed.csv`
- `srs_state_transition_rules_seed.csv`
- `srs_user_card_state_schema_seed.csv`

**Achievements & Rewards:**
- `achievement_badge_definitions_seed.csv` (31 KB)
- `achievement_metric_catalog_seed.csv`
- `achievement_trigger_rules_seed.csv` (49 KB)
- `achievement_anti_farming_rules_seed.csv`
- `achievement_user_state_schema_seed.csv`
- `reward_catalog_seed.csv`
- `xp_level_config_seed.csv`

**Symbols:**
- `japanese_symbols_punctuation_seed.csv` (38 KB)

### MD Documentation Files (20 total)

- `jlpt_n5_grammar_seed_notes.md`
- `jlpt_n5_verb_conjugation_seed_notes.md`
- `jlpt_n5_adjective_conjugation_seed_notes.md`
- `jlpt_n5_particles_seed_notes.md`
- `jlpt_n5_example_sentences_seed_notes.md`
- `jlpt_n5_vocabulary_seed_notes.md`
- `jlpt_n5_lesson_roadmap_seed_notes.md`
- `jlpt_n5_quiz_templates_seed_notes.md`
- `kanji_radicals_seed_notes.md`
- `japanese_numbers_counters_seed_notes.md`
- `japanese_symbols_punctuation_notes.md`
- `reading_n5_seed_notes.md`
- `achievement_badge_config_seed_notes.md`
- `srs_config_seed_notes.md`

### SQL Files

**None found.**

---

## 3. Missing Dependencies

### Critical (Required for MVP)

```bash
# Database & ORM
npm install @supabase/supabase-js @supabase/ssr
npm install prisma @prisma/client

# UI Components
npm install -D @tailwindcss/postcss
npx shadcn@latest init

# Utilities
npm install @tanstack/react-query  # For data fetching
npm install zustand                 # Client state management (if needed)
npm install clsx tailwind-merge    # Class name utilities (shadcn deps)
```

### Recommended (Future)

```bash
npm install @supabase/auth-helpers-nextjs
npm install lucide-react            # Icons (shadcn dependency)
npm install date-fns                # Date utilities
npm install zod                     # Validation
```

---

## 4. Recommended Implementation Order

### Phase 1: Foundation (Start Here)

1. **Upgrade Next.js** — 9.3.3 is very outdated. Upgrade to 14.x or 15.x
2. **Set up Supabase project** — Create project, get API keys
3. **Configure Prisma** — Define schema, connect to Supabase PostgreSQL
4. **Set up shadcn/ui** — Initialize with custom design tokens from DESIGN.md
5. **Configure auth** — Supabase auth with middleware protection

### Phase 2: Core Data (Before UI)

1. **Import vocabulary CSV** — Map to Prisma schema, seed database
2. **Import kanji/radicals CSV** — Include stroke order data
3. **Import grammar CSV** — Sentence patterns and examples
4. **Import lesson roadmap CSV** — Build the progression tree
5. **Test SRS algorithm** — Validate against seed test cases

### Phase 3: Basic Pages

1. **Home/Dashboard page** — Show progress, streak, next lesson
2. **Lesson viewer** — Display vocabulary, grammar, examples
3. **Quiz system** — Render quiz templates, validate answers
4. **Progress tracking** — Store quiz results, update SRS cards

### Phase 4: Gamification (Polish)

1. **XP system** — Calculate from quiz completion
2. **Achievement system** — Trigger rules from seed data
3. **Streak tracking** — Daily login, lesson completion

---

## 5. Risks & Unknowns

### High Priority

| Risk | Impact | Mitigation |
|------|--------|------------|
| **Next.js 9.3.3 is ancient** | Missing App Router features, security issues | Upgrade to latest LTS (15.x) |
| **No database schema** | Can't import seed data | Design Prisma schema first |
| **No auth flow** | Can't protect user data | Implement before building user-facing pages |
| **Large CSV files (544KB+)** | Memory issues during import | Process in batches, use streaming |

### Medium Priority

| Risk | Impact | Mitigation |
|------|--------|------------|
| **No shadcn/ui setup** | Inconsistent components | Set up early with custom tokens |
| **Tailwind v4 is new** | Limited community knowledge | Check docs, test thoroughly |
| **No API routes yet** | Direct client DB access risk | Design API layer early |
| **Duplicate file** | `jlpt_n5_lesson_roadmap_seed_notes (1).md` | Needs cleanup |

### Low Priority

| Risk | Impact | Mitigation |
|------|--------|------------|
| **Grammar check needed** | CSV column names inconsistent? | Review each file's schema |
| **No test coverage** | Regression risk | Add tests after basic flow works |
| **No error monitoring** | Production issues hidden | Add Sentry later |

### Unknowns

1. **How are CSV columns mapped to DB tables?** — Need to review each file's structure
2. **What's the SRS interval algorithm?** — Check `srs_algorithm_presets_seed.csv`
3. **Quiz scoring logic?** — Need to understand answer validation
4. **Audio assets?** — No audio files found; how to handle pronunciation?

---

## 6. Next Actions

1. **Upgrade Next.js** to 14/15.x
2. **Set up Supabase** project and get API keys
3. **Design Prisma schema** based on CSV structures
4. **Move CSV files** to `data/seed/` directory
5. **Initialize shadcn/ui** with design tokens from `DESIGN.md`
6. **Create first API route** for vocabulary fetching

---

## 7. Commands Reference

```bash
# Check current Next.js version
npm list next

# Check all dependencies
npm list --depth=0

# Upgrade Next.js
npm install next@latest

# Initialize shadcn/ui (after Next.js upgrade)
npx shadcn@latest init

# Set up Prisma
npx prisma init

# Run dev server
npm run dev

# Build for production
npm run build
```
