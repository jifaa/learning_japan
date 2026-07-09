# PRD — Learning Japan

### Japanese Learning Platform for Indonesian Speakers

**Doc owner:** Ghifari · **Status:** Living document — supersedes `PRODUCT.md` · **Audience:** Claude Code (primary), future contributors

---

## 1. Overview

Learning Japan is a web app that teaches Japanese (targeting JLPT N5) to **Indonesian-speaking learners**, using a self-contained curriculum (kana, vocabulary, grammar, kanji), spaced-repetition flashcards, varied quiz formats, and gamification to keep learners consistent.

This PRD is the source of truth for **what the product must do**. It reflects the feature list the product owner defined, mapped onto the actual state of the codebase today (verified directly, not assumed) so that Claude Code can pick up exactly where the project left off instead of re-deriving requirements from scratch.

---

## 2. Problem & Goals

**Problem:** Self-taught Japanese learners abandon apps that are either too generic (not explained in the learner's own language) or too passive (reading without active recall). Indonesian speakers in particular have few JLPT-focused, Indonesian-language options that combine structured curriculum with proven retention mechanics (SRS + gamification).

**Goals**

1. Take a complete beginner from zero to JLPT N5-ready across hiragana, katakana, ~800 vocabulary words, ~50 grammar points, ~100 kanji.
2. Make daily practice the path of least resistance via streaks, daily challenges, and due-card reviews surfaced automatically.
3. Explain everything in Bahasa Indonesia — this is not an English-medium app with a translation layer bolted on.

**Non-goals:** teaching JLPT N4+ content, live tutoring/community features beyond an optional leaderboard, mobile native apps (web-first, responsive).

---

## 3. Target Users

- **Primary:** Indonesian-speaking adult/teen self-learners starting Japanese from zero, studying independently (no classroom), motivated by JLPT N5 as a concrete goal.
- **Secondary:** learners who've dabbled (know some kana) and want a structured way to fill gaps and start retaining vocabulary/kanji long-term.

---

## 4. Current Implementation Status (ground truth as of this doc)

This section exists so Claude Code does not have to rediscover the state of the repo. Verify anything below yourself before relying on it (`grep`, read the file) — but treat `docs/PROJECT_AUDIT.md` as **stale/superseded by this section**, since it predates most of what's listed here.

**Stack (installed and working):** Next.js 16.2.10 (App Router), React 19, TypeScript, Tailwind v4, Framer Motion, `@supabase/supabase-js` + `@supabase/ssr`, Zod, date-fns, papaparse, Radix UI primitives (hand-rolled shadcn-style, no CLI). No ORM — raw SQL schema + Supabase client by design; keep it that way.

> **Next.js version warning (from `AGENTS.md`):** this project runs Next.js 16.2.10, newer than most training data, with breaking API/convention changes. Read `node_modules/next/dist/docs/` before writing routing or data-fetching code.

**Database — `database/supabase_schema.sql`:** 35 tables, RLS-protected where user-owned. Content tables (public-read): `kana_characters`, `symbols`, `particles`, `grammar_points`, `vocabulary`, `kanji`, `radicals`, `radical_variants`, `kanji_radical_map`, `conjugation_rules`, `numbers`, `counters`, `counter_forms`, `calendar_time`, `example_sentences`, `reading_passages`, `reading_questions`, `quiz_templates`, `quiz_answer_schemas`, `quiz_sections`, `lesson_roadmap_tree`, `lesson_content_map`, `roadmap_milestones`, `srs_deck_configs`, `achievements`, `achievement_triggers`, `xp_levels`, `rewards`. User tables: `profiles`, `user_srs_cards`, `srs_review_log`, `user_progress`, `daily_stats`, `lesson_progress`, `quiz_results`, `user_achievements`. Almost every content table has `meaning_id` / `usage_explanation_id` / `example_meaning_id` / `mnemonic_id` columns (Bahasa Indonesia) alongside `_en` fallbacks — the schema was built Indonesian-first.

**Seed data — `data/seed/*.csv`:** 46 files, 5,568 rows, all passing `npm run seed:validate` (`data/seed/seed-manifest.md`). Covers vocabulary (718 words, tagged with `part_of_speech`/`semantic_category`), kanji (103, with radicals + mnemonics), kana (267 characters incl. dakuten/handakuten/yōon/foreign-sound extensions/archaic ゐゑ), grammar (113, 84 flagged `is_core_n5`), particles, conjugation rules, numbers/counters/calendar, reading passages+questions, quiz templates/sections/answer-schemas, a full lesson roadmap tree + milestones, SRS presets, achievement/XP/reward catalogs. `scripts/import-seed.ts` + helpers implement the import pipeline.

> **Known data bug to fix before/during import:** in `kana_characters` seed data, the hiragana **ゔ** (U+3094, "additional_voiced_v" category) has `romaji="tzu"`, `romaji_alt="tz"`, `row_group="tz"`. This is wrong — ゔ is the hiragana counterpart to katakana ヴ and should read `romaji="vu"`, `romaji_alt="v"`, `row_group="v"` (matching the katakana row, which is already correct). Everything else checked in this table — Unicode codepoints, Unicode names, all other romaji/row_group/vowel/base_kana values — is verified correct.

**Backend code — real implementations, not stubs:**

- `src/lib/db/content.ts` — vocabulary/grammar/kanji/kana/particles/reading getters (real Supabase queries).
- `src/lib/db/srs.ts` — `getDueCards`, `getNewCards`, `getOrCreateSRSCard`, `reviewCard`, `calculateNextReview`, `getDeckStats`, etc. A working SRS engine.
- `src/lib/db/quiz.ts` — `saveQuizResult`, `createQuizSession`, `calculateQuizResult`, `getScoreTrend`, `getAccuracyByType`, `getQuizStreak`, etc.
- `src/lib/db/progress.ts` — `addXP`, `updateStreak`, `getStreakInfo`, `getWeeklyStats`, `updateLessonProgress`, `getProgressSummary`, etc.
- `src/lib/auth.ts` + `src/server/actions/auth.actions.ts` — real Supabase auth (`signInAction`/`signUpAction`/`signOutAction`).
- `src/types/*.ts` — typed shapes for all of the above; use these, don't invent new ones.

**Auth is functional today:** `/login` and `/register` call the real server actions. `.env.local` already has live Supabase credentials.

**UI shell (reuse, don't rebuild):** `components/layout/{app-shell,app-header,app-sidebar,mobile-nav,nav-items}`, `components/motion/*`, `components/ui/{button,card,input,label,avatar,dropdown-menu,progress,progress-bar,progress-ring,stats-card,section-header,empty-state,skeleton,loading-skeleton,separator,sheet}`. Full visual spec in `DESIGN.md` (Muji-inspired: paper-white background, single oxidized-teal primary used sparingly, flat surfaces, Geist type, 8px radii, no gradients/glass/shadows-for-decoration).

**The core gap:** every route below exists but is a **static visual mockup** — hardcoded numbers, zero Supabase calls anywhere in `src/app` (verified via `grep -rl "supabase" src/app` → no results). Wiring these to the real backend above is the largest single item of remaining work.

**Routes that exist (as mockups):** `/dashboard`, `/learn`, `/kana`, `/vocabulary`, `/grammar`, `/kanji`, `/quiz`, `/flashcards`, `/reading`, `/progress`, `/daily-challenge`, `/settings`, `/login`, `/register`.

**Routes that don't exist yet:** mock test, listening practice, bookmarks, notes, search, and any gamification screens (badges/achievements/rewards/leaderboard).

**Known bugs:**

- `src/middleware.ts` protects `/app`, `/lessons`, `/profile` — none of these match real routes (`(app)` is a route _group_, invisible in the URL; there is no `/profile`, only `/settings`).
- Header search input, notifications dropdown, and "Sign out" menu item are all decorative (no state/results, hardcoded items, not wired to `signOutAction`).
- No charting library installed, but Progress needs a real chart.
- No audio files or stroke-order assets exist in `public/`, despite `audio_path`/`stroke_order_path` columns existing on `kana_characters`, `kanji`, `vocabulary`, `grammar_points`.

---

## 5. Product Scope

### 5.1 MVP — Fitur Wajib

| #   | Feature                  | Summary                                                                                                      |
| --- | ------------------------ | ------------------------------------------------------------------------------------------------------------ |
| 1   | Dashboard                | Learning progress %, daily streak 🔥, today's target, due reviews                                            |
| 2   | Hiragana & Katakana      | Per-character learning, pronunciation audio, stroke-order animation, typing quiz, multiple-choice quiz       |
| 3   | Vocabulary N5            | Kanji + hiragana + romaji (hideable) + Indonesian meaning + audio + example sentence + usage note per word   |
| 4   | Grammar N5               | Explanation + formula/pattern + examples + illustration + practice exercise per point                        |
| 5   | Flashcards (⭐ critical) | Anki-style front/back cards with real SRS scheduling                                                         |
| 6   | Quiz                     | Multiple choice, drag-and-drop, typing, sentence construction, guess-the-meaning, guess-the-kanji, listening |
| 7   | Kanji N5                 | Stroke order, onyomi, kunyomi, meaning, example word, mnemonic                                               |
| 8   | Progress                 | Vocabulary/grammar/kanji completion stats, quiz accuracy, growth chart                                       |

### 5.2 Mid-tier — Fitur Menengah

| Feature                 | Summary                                                                                                                            |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Daily Challenge         | Daily checklist (e.g. 10 vocab, 5 grammar, 20 flashcards, 1 listening) with completion tracking                                    |
| Daily Word (今日の単語) | One featured vocabulary word shown on the Dashboard, same for the whole day, changes daily                                         |
| Bookmark                | Save any vocabulary/kanji/grammar item for later review                                                                            |
| Notes                   | Free-text personal notes attached to any lesson/word/kanji                                                                         |
| Search                  | Find any vocabulary/kanji/grammar item by Indonesian meaning, romaji, or Japanese text                                             |
| JLPT Roadmap            | Visual N5 checklist (Hiragana, Katakana, 800 Vocabulary, 100 Kanji, 50 Grammar, Listening, Mock Test) with lock/unlock progression |
| Listening               | Audio prompt → answer selection                                                                                                    |
| Reading                 | Short passage → comprehension questions                                                                                            |
| Mock Test JLPT          | Timed (30 min) full mock exam with score + answer review                                                                           |

### 5.3 Gamification

XP, Level, Badges, Achievements, Daily streak, Coins, Avatar unlocks. **Leaderboard is explicitly optional** — build last, and only if time allows (check RLS/privacy implications before exposing any user's data to another).

### 5.4 Information Architecture

```
🏠 Dashboard
📚 Belajar
    ├── Hiragana
    ├── Katakana
    ├── Vocabulary
    ├── Grammar
    └── Kanji
📝 Quiz
🃏 Flashcards
🎧 Listening
📖 Reading
📊 Progress
🎯 Daily Challenge
⚙️ Settings
```

Plus (not in the original nav, add as needed): Search, Bookmarks, Notes, Mock Test, Achievements/Rewards. These can live as header/utility actions rather than crowding the primary sidebar — use judgment consistent with `DESIGN.md`.

---

## 6. Detailed Feature Requirements

Each feature below lists: what a learner can do, which existing table/seed file backs it, and acceptance criteria. "Data source" columns refer to tables in `database/supabase_schema.sql`; populate from the matching `data/seed/*.csv` — don't invent placeholder content where seed data already exists.

### 6.1 Dashboard

- **Learner can:** see overall % progress toward N5, current streak, today's target (with progress toward it), and a list of cards/items due for review right now, and jump straight into review or today's next lesson from this screen.
- **Data source:** `user_progress`, `daily_stats`, `getDueCards()` in `srs.ts`, `getStreakInfo()`/`getWeeklyStats()` in `progress.ts`.
- **Acceptance criteria:** numbers are real per-user data (not the same for every account); an empty/new-user state exists (no fake "1,234 reviewed" for day-one users); due-reviews count matches what `/flashcards` actually shows as due; one clear primary CTA to start the day's work.

### 6.2 Hiragana & Katakana

- **Learner can:** browse all kana grouped by row (a/ka/sa/ta.../dakuten/handakuten/yōon), open a character to see stroke order animation + hear pronunciation, and take a typing quiz or multiple-choice quiz per group.
- **Data source:** `kana_characters` (267 rows: basic, dakuon, handakuon, yoon, yoon_rare, small, foreign_sound, archaic, additional_voiced_v, special). **Fix the ゔ romaji bug (§4) in the seed CSV before import.**
- **Acceptance criteria:** every character renders with correct native glyph + romaji (spot-check against §4's verified fields); audio and stroke order both work (see §7 for the asset strategy decision this depends on); typing quiz accepts the primary romaji and reasonable alt-romaji (e.g. `shi`/`si`, `fu`/`hu`, `tsu`/`tu`) as correct; multiple-choice quiz never shows the same character as two different choices.

### 6.3 Vocabulary N5

- **Learner can:** browse/filter vocabulary by word type (noun, verb, i-adjective, na-adjective, etc., from `part_of_speech`) and by topic (`semantic_category`); open a word to see kanji, hiragana, romaji (toggle to hide), Indonesian meaning, audio, and an example sentence with its own Indonesian translation.
- **Data source:** `vocabulary`, `example_sentences`.
- **Acceptance criteria:** romaji visibility is a per-session (or per-user preference) toggle, not always-on; word type is shown as a human-readable Indonesian label (e.g. "Kata Kerja", not `verb`); every word that has an example sentence in the seed data displays one.

### 6.4 Grammar N5

- **Learner can:** browse grammar points, each showing explanation, pattern/formula, examples, and a practice exercise; also reach `particles` and `conjugation_rules` from the same section.
- **Data source:** `grammar_points`, `particles`, `conjugation_rules`.
- **Acceptance criteria:** the `is_core_n5`-flagged 84 points are clearly distinguished from the remaining 29 (e.g. a filter or badge) so learners know what's essential vs. supplementary; each point's practice exercise is actually gradeable, not just illustrative text.

### 6.5 Kanji N5

- **Learner can:** browse all 103 N5 kanji, see stroke order, onyomi, kunyomi, meaning, an example word, and a mnemonic; see related radicals.
- **Data source:** `kanji`, `radicals`, `radical_variants`, `kanji_radical_map`.
- **Acceptance criteria:** stroke order renders (per §7's asset decision); mnemonic text is always present (no blank field shown to the learner).

### 6.6 Flashcards (SRS)

- **Learner can:** start a review session that pulls due + new cards, see the front, reveal the back, and rate recall (e.g. Again/Hard/Good/Easy or equivalent), which reschedules the card via the real algorithm.
- **Data source:** `user_srs_cards`, `srs_review_log`, `srs_deck_configs`; functions already in `srs.ts` (`getDueCards`, `getNewCards`, `getOrCreateSRSCard`, `reviewCard`, `calculateNextReview`).
- **Acceptance criteria:** **a real review session screen must exist** — today `/flashcards` is only a deck list with no review flow at all; after rating a card, the next due/new card appears without a full page reload; session summary (cards reviewed, accuracy) shown at the end.

### 6.7 Quiz

- **Learner can:** take quizzes in every format the seed data defines: multiple choice, drag-and-drop, typing, sentence construction ("susun kalimat"), guess-the-meaning, guess-the-kanji, and listening.
- **Data source:** `quiz_templates`, `quiz_answer_schemas`, `quiz_sections` — check each row's `interaction_type`/`ui_component`/`requires_drag_drop`/`requires_audio` to know what to render.
- **Acceptance criteria:** the quiz engine is data-driven (one renderer that branches on interaction type), not one hardcoded question type; every interaction type present in the seed data has a working UI; results save via `saveQuizResult`/`calculateQuizResult`.

### 6.8 Progress

- **Learner can:** see vocab/grammar/kanji completion counts, quiz accuracy, and a chart of progress over time.
- **Data source:** `daily_stats`, `lesson_progress`, `getProgressSummary()`/`getWeeklyStats()` in `progress.ts`, `getScoreTrend()`/`getAccuracyByType()` in `quiz.ts`.
- **Acceptance criteria:** a real chart renders (pick and install a charting approach per §7); stats match what other pages show for the same user (no drift between Dashboard and Progress numbers).

### 6.9 Daily Challenge

- **Learner can:** see today's checklist (e.g. 10 vocab, 5 grammar, 20 flashcards, 1 listening), with live progress against each, and claim a reward on completion.
- **Data source:** `daily_stats`, `xp_levels`, `rewards`.
- **Acceptance criteria:** checklist resets at local-midnight per user's timezone (or a documented, consistent policy); progress updates as the learner does the underlying activity elsewhere in the app (not a separate silo).

### 6.10 Daily Word

- **Learner can:** see one featured vocabulary word on the Dashboard (今日の単語), same for everyone all day, different tomorrow.
- **Data source:** `vocabulary`, deterministic date-seeded selection (no new table needed).
- **Acceptance criteria:** the same word shows all day regardless of how many times the page reloads; changes at local-midnight.

### 6.11 Bookmark

- **Learner can:** bookmark any vocabulary/kanji/grammar item from its detail view, and see all bookmarks in one place.
- **Data source:** **new table required** (doesn't exist in the current schema) — add a migration for a user-owned `bookmarks` table (polymorphic reference to vocabulary/kanji/grammar_points, or three nullable FK columns — pick one pattern and use it consistently) with RLS matching the other user tables, plus a `db/bookmarks.ts`.
- **Acceptance criteria:** bookmarking is a single click/tap from anywhere the item is shown; a dedicated bookmarks view lists everything saved, filterable by type.

### 6.12 Notes

- **Learner can:** attach a free-text personal note to any lesson/word/kanji/grammar point.
- **Data source:** **new table required** — add a user-owned `notes` table + RLS + `db/notes.ts`, same reference pattern as bookmarks.
- **Acceptance criteria:** notes persist and are editable; a note indicator shows on any item that has one.

### 6.13 Search

- **Learner can:** type in the header search box and get real results across vocabulary/kanji/grammar (by Indonesian meaning, romaji, or Japanese text), and jump straight to the item.
- **Data source:** `searchVocabulary` already exists in `content.ts` as a pattern — add equivalents for kanji and grammar.
- **Acceptance criteria:** typing shows live/near-live results (debounced), not just on full-form submit; empty query shows no results (not an error state).

### 6.14 JLPT Roadmap (`/learn`)

- **Learner can:** see the N5 checklist (Hiragana / Katakana / 800 Vocabulary / 100 Kanji / 50 Grammar / Listening / Mock Test) with real lock/unlock state based on actual progress.
- **Data source:** `lesson_roadmap_tree`, `roadmap_milestones`, `lesson_content_map`, `lesson_progress`. (Today's `learn/page.tsx` has this exact 6-phase structure hardcoded — replace the array with the real tables.)
- **Acceptance criteria:** locked items are visibly locked and not clickable into content; unlocking reflects real completion thresholds from the roadmap tree, not a fixed percentage guess.

### 6.15 Listening

- **Learner can:** play an audio prompt and choose the correct answer.
- **Data source:** `quiz_sections`/`quiz_templates` rows where `requires_audio = true`. **New page — doesn't exist yet.**
- **Acceptance criteria:** audio can be replayed; depends on the audio-asset decision in §7.

### 6.16 Reading

- **Learner can:** read a short passage and answer comprehension questions about it.
- **Data source:** `reading_passages`, `reading_questions` (today's `/reading` page is a mockup with no real passage rendering).
- **Acceptance criteria:** passage + questions come from the real tables; score shown after submission.

### 6.17 Mock Test JLPT

- **Learner can:** start a timed (30 min, per spec) full mock exam, answer sections in sequence, submit (or auto-submit on timeout), and review a results screen with score + per-question review.
- **Data source:** `quiz_sections` — already has `time_limit_seconds`, `score_max`, `shuffle_questions`, `shuffle_choices`, purpose-built for exactly this. **New page — doesn't exist yet.**
- **Acceptance criteria:** visible countdown timer; auto-submits at zero; results screen shows which answers were right/wrong with the correct answer revealed.

### 6.18 Gamification

- **Learner can:** see current level + XP + progress to next level, earn and view badges/achievements, and (if built) spend coins on avatar unlocks.
- **Data source:** `xp_levels`, `achievements`, `achievement_triggers`, `rewards`, `user_achievements`. **New pages — data model exists, no UI exists yet.**
- **Acceptance criteria:** XP/level shown consistently in the header or dashboard, not just on a separate page; earning an achievement produces a visible moment (toast/modal), not a silent DB write.

### 6.19 Settings

- **Learner can:** view/edit profile info, sign out, and change real preferences (not decorative toggles).
- **Data source:** `profiles`, `signOutAction`.
- **Acceptance criteria:** sign-out actually signs out and redirects to `/login`; every visible toggle/setting persists and takes effect somewhere.

---

## 7. Non-Functional Requirements

**Language:** All learner-facing copy — nav labels, buttons, headings, empty states, errors, toasts — must be **Bahasa Indonesia** by default, sourced from the `_id` columns in the schema, not `_en`. Code, comments, and internal docs stay in English. This is a requirement, not a nice-to-have: the schema was built Indonesian-first and the product only makes sense for its target users if the UI matches.

**Design:** Follow `DESIGN.md` exactly for all new UI — paper-white background, single oxidized-teal primary used sparingly, flat surfaces (no gradients/glass/drop-shadow-for-decoration), Geist typography, 8px corner radii, 44px minimum touch targets, visible keyboard focus rings, respects `prefers-reduced-motion` (`lib/use-reduced-motion.ts` already exists — use it). Reuse the existing component kit in `components/ui/*` rather than introducing new visual patterns.

**Audio strategy (decide once, apply everywhere):** no audio files exist today. The pragmatic zero-asset option is the browser's `SpeechSynthesis` (Web Speech API) with a `ja-JP` voice, triggered client-side, for kana/vocabulary/grammar pronunciation.

**Stroke-order strategy (decide once, apply everywhere):** no stroke-order assets exist today. Either source an openly-licensed stroke-order dataset (e.g. KanjiVG, CC BY-SA — verify license terms before bundling) mapped by character to `kana_characters`/`kanji`, or build a simpler numbered-stroke illustration. Whichever is chosen, implement it consistently for both kana and kanji, not ad hoc per page.

**Charting:** Progress needs a real growth-over-time chart; no charting library is installed yet. Pick one consistent with the flat/no-gradient design language (a lightweight library, or a hand-rolled SVG chart) and use it everywhere a chart is needed.

**Accessibility:** WCAG AA contrast minimum; all interactive elements keyboard-reachable; quiz/flashcard interactions must not depend on drag-only input (provide a non-drag alternative for drag-and-drop quiz questions, for accessibility and mobile).

**Performance:** server components by default; client components only where interactivity requires it (per `CLAUDE.md`'s existing rule) — this matters more here than usual given how much per-page data this app fetches.

**Security:** RLS enforced on every user-owned table (including the two new ones this PRD requires — bookmarks, notes); service-role key never exposed client-side.

---

## 8. Release Plan

Ship in this order — each phase should be independently testable and demoable, not a big-bang release.

1. **Infra correctness:** confirm schema is live on Supabase, fix the ゔ romaji bug in seed data, validate → dry-run → import seed data (only if tables are actually empty), fix `middleware.ts`, wire header sign-out.
2. **Foundational data layer:** audit `db/*.ts` against the real schema; add `bookmarks`/`notes` tables + RLS + db helpers now so nothing later is blocked on schema work.
3. **Core learning loop, wired to real data (§6.1–6.10 roughly in this order):** Kana → Vocabulary → Kanji → Grammar (+particles/conjugation) → Flashcards (real review session) → Quiz engine (all interaction types) → Reading → Learn/Roadmap → Dashboard → Progress (+chart) → Daily Challenge → Daily Word.
4. **New surfaces:** Search → Bookmarks → Notes → Listening → Mock Test.
5. **Gamification UI:** level/XP display, badges/achievements gallery, rewards/avatar unlocks. Leaderboard last, only if time remains.
6. **Localization pass:** Indonesian-ify everything (can run alongside phases 3–5 per-page rather than as one big pass at the end — don't ship a page and leave it in English "for now").
7. **Assets:** implement the audio + stroke-order strategies (§7) and back-fill Kana/Kanji/Vocabulary.
8. **Polish:** accessibility pass, `DESIGN.md` compliance check, visual review (the `impeccable` skill referenced in `CLAUDE.md`) on every screen before calling it done.

---

## 9. Success Metrics

- **Activation:** % of new sign-ups who complete their first flashcard review session.
- **Retention:** 7-day and 30-day streak retention (learners still logging daily-challenge completion).
- **Progression:** % of active users reaching each JLPT Roadmap milestone (Hiragana done, Katakana done, etc.).
- **Mastery:** average SRS retention rate (cards rated "Good"/"Easy" on due date vs. lapsed).
- **Coverage:** % of the 800-word/100-kanji/50-grammar N5 corpus a learner has touched at least once within 60 days of signup.

_(No analytics/telemetry pipeline currently exists — instrumenting these is a separate, later task, not blocking for the phases above.)_

---

## 10. Out of Scope (for now)

- JLPT N4 and above.
- Native mobile apps (responsive web only).
- Social features beyond an optional leaderboard (no friends, chat, comments, user-generated content).
- Payment/subscription — no monetization requirements defined yet.
- Multi-language UI (English/other locales) — Indonesian is the only required locale; don't block on future i18n architecture, but don't make Indonesian hard to extract later either.

---

## 11. Open Questions

These aren't blocking — make a reasonable call consistent with the seed data already provided (e.g. `srs_algorithm_presets_seed.csv`, `xp_level_config_seed.csv`) and leave a short comment explaining the choice, rather than stalling on them:

- Exact SRS interval curve and XP-per-level curve (seed presets exist — use them as the default rather than inventing new numbers).
- Bookmark/notes data model: polymorphic single table vs. three typed FK columns.
- Whether Daily Challenge resets at UTC midnight or the learner's local midnight.
- Whether Leaderboard ships at all in this release (spec marks it optional).
