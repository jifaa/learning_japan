---
timestamp: 2026-07-09T15-22-25Z
slug: hiragana-katakana-pages
---
# Critique: Hiragana & Katakana Pages

**Method: dual-agent (A: a9bb89c8aaee51a79 · B: ada384dce5c5eadb3)**

---

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 4/4 | Excellent — progress bars, mastery counts, locked icons |
| 2 | Match System / Real World | 4/4 | Authentic Indonesian; real kana chart layout |
| 3 | User Control and Freedom | 4/4 | Quiz always accessible; direct character links |
| 4 | Consistency and Standards | 3/4 | "Huruf Dasar" vs "Huruf Biasa" hardcoded mismatch |
| 5 | Error Prevention | 2/4 | Missing typed-input practice mode — no safety net for learners who fail repeatedly |
| 6 | Recognition Rather Than Recall | 3/4 | No legend for the three status icons (CheckCircle2/Circle/Lock) |
| 7 | Flexibility and Efficiency | 3/4 | No keyboard navigation through kana cells |
| 8 | Aesthetic and Minimalist Design | 3/4 | Locked grid at 12 columns = wall of 70 gray boxes — overwhelming |
| 9 | Error Recovery | 2/4 | No quiz failure state anywhere on the page |
| 10 | Help and Documentation | 3/4 | Tips card is buried; Volume2 icon has no aria-label |
| **Total** | | **31/40** | **Good — solid foundation with clear improvement areas** |

---

## Anti-Patterns Verdict

### LLM Assessment: AI Slop — **PASS**

Zero banned patterns detected across all four files reviewed. This is genuinely restrained, Muji-inspired work — no glassmorphism, no gradient text, no hero metrics, no decorative card grids, no eyebrow headers, no numbered section scaffolds. The design vocabulary is intentional and earned.

### Deterministic Scan

CLI detector ran clean across all 4 target files with **zero findings**:
- `src/app/(app)/hiragana/page.tsx` — Clean
- `src/app/(app)/katakana/page.tsx` — Clean
- `src/components/kana/kana-chart-with-lock.tsx` — Clean
- `src/components/ui/progress-bar.tsx` — Clean

**Additional issues the detector caught:**
- `ProgressBar` shows `value/max` as fraction without unit label — "5/10" is ambiguous
- Tailwind arbitrary selectors in `ProgressBar` depend on internal DOM structure — fragile
- No `aria-live` region for mastery completion — screen readers never announce when a user masters all characters

Browser visualization was skipped (auth middleware protects both pages).

---

## Overall Impression

The hiragana and katakana pages are genuinely well-crafted for a first pass. The Muji-inspired restraint shows: restrained palette, purposeful motion, authentic Indonesian copy that reads naturally. The layout architecture is mature.

The single biggest gap is **error and failure states**. The page handles success beautifully but goes completely silent when things go wrong. A learner who fails a quiz repeatedly gets no safety net, no additional practice path, no explanation. For a learning app, this is the highest-stakes moment and the product has nothing to say.

---

## What's Working

1. **Kana cell hover interaction is textbook excellent.** Border shifts to teal, romaji turns teal, Volume2 fades in — all in 150ms with no bounce.

2. **Layout architecture is mature.** Sticky sidebar + 2/3-1/3 grid is the correct structure for a kana reference chart.

3. **Language authenticity is strong.** "dikuasai", "Huruf Dasar", "Quiz Mastery" — the Indonesian copy reads as native, not machine-translated.

---

## Priority Issues

### [P0] No quiz failure state on the page
A learner who fails a quiz repeatedly produces no visible response. No additional practice path, no encouragement copy, no alternative mode.

**Fix:** Add a contextual callout when the current category is at 0% mastery after 1+ quiz attempts. Something like: "Masih kesulitan? Coba latihan dengan flashcards dulu."

**Suggested command:** `/impeccable harden` or `/impeccable clarify`

---

### [P0] Audio affordance invisible on mobile
`Volume2` icon fades in on hover only. On touch devices, the audio affordance is completely invisible — broken for ~50% of users.

**Fix:** Always show Volume2 on mobile (`md:opacity-0 md:group-hover:opacity-100`). Or add tap-hold interaction for audio.

**Suggested command:** `/impeccable adapt` or `/impeccable audit`

---

### [P1] Locked state shows all 70 characters at once
Wall of 70 gray boxes on first load — demotivating before Jordan has started. Locked content competes visually with the 5 unlocked items.

**Fix:** Progressive disclosure for locked categories — render only the header + unlock message until nearly unlocked.

**Suggested command:** `/impeccable distill` or `/impeccable layout`

---

### [P1] Dual CTAs of equal visual weight
Header "Quiz Mastery" and sidebar "Quiz Cepat" have equal weight and go to the same URL. No guidance on which to use first.

**Fix:** Deprioritize one visually. Header should be primary; sidebar should be secondary.

**Suggested command:** `/impeccable layout` or `/impeccable polish`

---

### [P2] No icon legend for status indicators
Three states (CheckCircle2/Circle/Lock) with no legend. WCAG risk for colorblind users; no label for screen readers.

**Fix:** Compact legend: "● Dalam proses · Dikuasai · Terkunci" with text alongside icons.

**Suggested command:** `/impeccable clarify` or `/impeccable audit`

---

### [P2] "Quiz Mastery" vs "Quiz Cepat" naming inconsistency
Same concept described two ways. Violates Nielsen #4 (Consistency).

**Fix:** Pick one name everywhere. "Quiz Cepat" is more action-oriented — recommend standardizing on this.

**Suggested command:** `/impeccable clarify`

---

## Persona Red Flags

**Jordan (First-Timer):**
- No "start here" guidance — page is fully informational, no explicit first step
- 70 locked character cells visible on first load — discouraging before beginning
- "Huruf Dasar" unexplained — what is it and why is it capitalized?
- Mobile: audio inaccessible, tap navigates away

**Sam (Accessibility):**
- `aria-label` on locked containers announces 70+ items as links — screen reader overload
- Keyboard cannot navigate individual kana cells — audio inaccessible via keyboard
- Status icons distinguished by color + shape — color-only aspects may fail in high-contrast mode
- Progress bar redundant with adjacent text for screen readers

---

## Minor Observations

- The layout grid fix (w-full on kana cells, items-start, sticky sidebar) was the right call.
- FadeIn stagger delay accumulates — last category animates at ~0.3s. Consider a max delay cap.
- ProgressBar label shows fraction without unit — "5/10 karakter" would be clearer.
- No aria-live for mastery completion — "Semua Hiragana dikuasai!" is purely visual.
- Tips card is buried — its content is valuable for Jordan but not discoverable.

---

## Questions to Consider

1. **Should the chart be the hub?** Jordan lands on a reference chart with no practice mode. Is there a practice-to-quiz flow?

2. **What does "all done" look like?** "Semua Hiragana dikuasai!" shows no next action — katakana? Kanji? The page ends with no path forward.

3. **Should mobile users get audio at all?** Current mobile experience breaks audio entirely. Is this intentional?
