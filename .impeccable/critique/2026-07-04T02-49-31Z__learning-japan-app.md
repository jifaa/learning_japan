---
timestamp: 2026-07-04T02-49-31Z
slug: learning-japan-app
---
# Design Critique: Learning Japan App

**Method: dual-agent (A: afe2eab0c1f35d445 · B: abacbb96711f3c03c)**

---

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Dashboard stats good, but sidebar daily goal hardcoded to 0% |
| 2 | Match System / Real World | 4 | Excellent Indonesian localization, Muji aesthetic resonates |
| 3 | User Control and Freedom | 2 | No backtracking in flashcards/quiz, no keyboard shortcuts |
| 4 | Consistency and Standards | 4 | Excellent across all 23 routes, consistent component patterns |
| 5 | Error Prevention | 2 | No form validation hints, quiz has no confirmation dialog |
| 6 | Recognition Rather Than Recall | 4 | Clear nav labels, familiar icons, no memory demands |
| 7 | Flexibility and Efficiency | 2 | No keyboard shortcuts, no customizable features, no power-user paths |
| 8 | Aesthetic and Minimalist Design | 4 | Exceptional Muji execution, teal used sparingly, flat surfaces |
| 9 | Error Recovery | 1 | No recovery paths, wrong quiz answers have no retry, no undo |
| 10 | Help and Documentation | 1 | No tooltips, no SRS explanation, no onboarding, no contextual help |
| **Total** | | **27/40** | **Good — solid foundation with targeted improvements needed** |

---

## Anti-Patterns Verdict

### LLM Assessment

**PASS** — The Muji-inspired design is executed with genuine discipline. No AI-generated aesthetic patterns detected:

- No gradient heroes or glass cards
- No eyebrow text above sections
- No numbered section scaffolding
- No identical card grids
- No side-stripe borders
- Flat surfaces with tonal layering throughout
- Teal primary (oklch 0.400 0.080 170) used as brand anchor ≤10% of screen

The aesthetic commitment is real, not performative. Typography hierarchy is clear. Spacing rhythm is purposeful. This is a well-crafted learning surface.

### Deterministic Scan

**Clean CLI scan** (exit 0, 0 findings in project source). All 375 detections were from the bundled detector's own JS files — not the project codebase.

**Browser injection unavailable**: Playwright failed to install (ENOSPC on C: drive). The dashboard route also requires auth, preventing external visualization. Assessment B was degraded by environment constraints, not design failures.

### Visual Overlays

No user-visible overlay available (browser automation unavailable). Fallback signal: manual code review confirms flat, clean aesthetic throughout.

---

## Overall Impression

This is a **strong foundation with critical gaps in user support systems**. The visual design is excellent — restrained, intentional, Muji-authentic. The product feels calm and serious, which matches the "respect the language" design principle.

The gaps are functional, not aesthetic:
1. **No help system** — absolute beginners face a steep learning curve with no guidance
2. **Hardcoded progress** — daily goal at 0% undermines the primary motivation loop
3. **Cognitive overload on vocabulary** — 800+ words render at once
4. **Auth pages break immersion** — English copy vs Indonesian app creates jarring transition

---

## What's Working

1. **Muji aesthetic execution is authentic, not imitative.** Flat surfaces, teal as precious accent, Geist typography, zero decorative noise. The restraint is the design.

2. **Indonesian localization is consistent and encouraging.** "Selamat Datang Kembali" and warm microcopy create genuine welcome. The app feels like it respects the learner.

3. **Component vocabulary is cohesive across 23 routes.** Same button variants, card patterns, FadeIn animations, spacing rhythm. A unified system, not a collection of pages.

---

## Priority Issues

### [P0] Sidebar daily goal progress bar hardcoded to 0%

**What**: The daily goal progress in `src/components/layout/app-sidebar.tsx:152` shows 0% regardless of actual progress.

**Why it matters**: The daily goal is the primary motivation loop. Seeing 0% when the user has been active creates distrust — "is this thing tracking me?" It undermines the gamification layer entirely.

**Fix**: Connect to actual progress data from the progress API. If no data exists, show "mulai latihan hari ini" instead of a false 0%.

**Suggested command**: `/impeccable harden` (for error handling) + `/impeccable audit` (for data flow)

---

### [P0] Vocabulary page renders all 800+ words without pagination

**What**: `src/app/(app)/vocabulary/vocabulary-client.tsx` renders every vocabulary item at once.

**Why it matters**: Performance degrades with 800+ DOM nodes. Cognitive overload — users see everything instead of "here's what to learn next." Progressive disclosure is missing entirely.

**Fix**: Implement pagination (20-30 per page) or infinite scroll with intersection observer. Group by lesson/difficulty. Show "belajar 20 kata dulu, sisanya nanti" approach.

**Suggested command**: `/impeccable audit` (performance) + `/impeccable distill` (reduce to essence)

---

### [P1] Auth pages use English while app uses Bahasa Indonesia

**What**: Login (`src/app/(auth)/login/page.tsx`) and register pages use English copy; all in-app pages use Indonesian.

**Why it matters**: Language inconsistency breaks brand immersion. Users register in Indonesian, log in in English, then return to Indonesian. Jarring.

**Fix**: Translate auth forms and buttons to Bahasa Indonesia. "Masuk" not "Login", "Daftar" not "Register", placeholders in Indonesian.

**Suggested command**: `/impeccable clarify` (for copy clarity and consistency)

---

### [P1] Quiz has no confirmation before final answer lock

**What**: Quiz sessions commit answers immediately with no "review before submit" step.

**Why it matters**: Users cannot verify their selection before committing. For a learning app, this creates anxiety — "did I pick the right one?" with no way to check.

**Fix**: Add a "periksa jawaban" (review answers) step before final submission. Show selected answers, allow changes, then confirm.

**Suggested command**: `/impeccable harden` (for error prevention)

---

### [P2] 17 navigation items with no semantic grouping

**What**: Sidebar lists all 17 routes without grouping: Learn, Kana, Vocabulary, Grammar, Kanji, Quiz, Flashcards, Reading, Progress, Daily Challenge, Search, Bookmarks, Notes, Mock Test, Listening, Achievements, Settings.

**Why it matters**: Users scan all 17 items to find what they need. Information architecture is flat. Cognitive load is high.

**Fix**: Group into semantic categories: "Belajar" (Learn, Kana, Vocabulary, Grammar, Kanji), "Latihan" (Quiz, Flashcards, Listening, Mock Test), "Lacak" (Progress, Daily Challenge, Achievements), "Perpustakaan" (Reading, Search, Bookmarks, Notes), "Akun" (Settings).

**Suggested command**: `/impeccable layout` (for navigation restructuring)

---

### [P2] Learn page shows all 6 phases including locked ones

**What**: The roadmap displays all phases simultaneously, including locked future phases.

**Why it matters**: Locked content creates visual noise and "what's next?" anxiety. The in-progress phase should dominate; future phases should be de-emphasized or hidden.

**Fix**: Show current phase prominently, collapse future phases into a "rencana belajar" expandable section. Or follow Duolingo's model: hide future content entirely.

**Suggested command**: `/impeccable onboard` (for first-run and progression flows)

---

### [P2] No SRS explanation on flashcard page

**What**: The flashcards page uses SRS terminology (Again, Hard, Good, Easy) without explaining what SRS means.

**Why it matters**: Absolute beginners don't know "Spaced Repetition System." The buttons are meaningless without context.

**Fix**: Add a one-time tooltip or small info icon explaining SRS. "Kartu ini akan muncul lagi besok (Spaced Repetition)".

**Suggested command**: `/impeccable clarify` (for tooltips and explanations)

---

### [P3] No keyboard shortcuts for power users

**What**: No keyboard navigation exists for flashcards (Space to flip) or quiz (1-4 for answers).

**Why it matters**: Daily learners who use the app frequently would benefit from efficiency gains. Keyboard shortcuts are standard in learning apps (Anki, Duolingo).

**Suggested command**: `/impeccable audit` (accessibility + efficiency)

---

### [P3] Progress chart has no interactive hover states

**What**: The chart in `src/app/(app)/progress/progress-chart.tsx` displays data but offers no hover details.

**Why it matters**: Static charts feel decorative. Users want to see "Tuesday: 45 XP earned" on hover.

**Suggested command**: `/impeccable animate` (for micro-interactions)

---

## Persona Red Flags

**Alex (Power User)**: 17 navigation items overwhelm. Vocabulary page with 800+ words creates choice paralysis. No keyboard shortcuts detected. Daily goal hardcoded — cannot customize target.

**Jordan (First-Timer)**: No onboarding flow for absolute beginners. SRS terminology unexplained. Locked phases in Learn feel punitive. Auth pages in English while app is Indonesian.

**Sam (Accessibility-Dependent)**: Focus rings present ✓. Color contrast appears WCAG AA compliant ✓. Screen reader labels need verification — Kanji readings, SRS buttons may lack ARIA descriptions.

---

## Minor Observations

1. `CardTitle` uses `text-2xl` by default but often wrapped in `CardHeader` with `pb-2` — redundant sizing
2. `StatsCard` logic appears inverted: `TrendingDown` icon shown for 0% trend but labeled as "positive" (trend.value >= 0)
3. All FadeIn animations use identical 200ms duration — reducing visual rhythm variety
4. Button loading state uses inline spinner SVG instead of skeleton pattern
5. Grammar page has commented-out code visible — technical debt in source

---

## Questions to Consider

1. **What is the "wow moment"** when a user completes their first flashcard session? The emotional peak is unclear — XP gained, streak increment, or something else?

2. **Why is the daily goal** (the primary motivation loop) relegated to a small sidebar instead of dashboard prominence?

3. **Should locked future content** be hidden entirely (Duolingo model) or shown as aspiration (current approach)?

4. **What differentiates this app** from a well-organized spreadsheet? The SRS mechanics and Muji aesthetic are distinctive — is there a secret retention sauce?

---

**First run for this target, no trend yet.**
