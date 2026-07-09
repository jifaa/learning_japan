---
name: Learning Japan
description: A Japanese language learning app for beginners — calm, intentional, Muji-inspired
colors:
  bg: oklch(1.000 0.000 0)
  surface: oklch(0.985 0.002 170)
  ink: oklch(0.135 0.018 165)
  primary: oklch(0.400 0.080 170)
  accent: oklch(0.960 0.020 90)
  muted: oklch(0.660 0.014 165)
typography:
  display:
    fontFamily: "Geist, Helvetica Neue, Arial, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Geist, Helvetica Neue, Arial, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.015em"
  title:
    fontFamily: "Geist, Helvetica Neue, Arial, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Geist, Helvetica Neue, Arial, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.65
    letterSpacing: "0"
  label:
    fontFamily: "Geist, Helvetica Neue, Arial, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.01em"
rounded:
  none: "0px"
  sm: "4px"
  md: "8px"
  lg: "12px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "40px"
  xxl: "64px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: "12px 24px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "12px 24px"
  button-ghost-hover:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "12px 24px"
  input:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    borderColor: "{colors.muted}"
    padding: "10px 14px"
---

# Design System: Learning Japan

## 1. Overview

**Creative North Star: "The Paper & Ink Room"**

A Muji-inspired learning surface — the calm of a Japanese stationery shop. Light fills the space freely. Nothing competes for attention. The teal brand anchor reads like a single drop of ink on a clean page: precise, deliberate, carrying all the meaning. Typography does the heavy lifting; color steps aside.

The system is flat by default. Depth comes from tonal layering — a slightly cooler surface shade here, a muted border there — and from purposeful motion. Shadows are reserved for state changes and interactive elevation. Restraint is the aesthetic, not a compromise.

**Key Characteristics:**
- Pure white paper background; no hidden warmth
- Deep oxidized teal as the sole brand anchor — used ≤10% of any screen
- Warm paper cream accent for active states and links — restrained, intentional
- Typography-first hierarchy; no decorative color competing with content
- Flat surfaces with tonal layering; ambient shadows only on hover/elevation

## 2. Colors

The palette is restrained: one saturated primary, one muted accent. Nothing decorative.

**The Restrained Rule.** The teal primary appears on ≤10% of any given screen. Its rarity is the point — a single stroke of intentional ink, not a brand wallpaper.

### Primary
- **Oxidized Teal** (`oklch(0.400 0.080 170)`): Primary actions (buttons), active navigation states, key progress indicators, the brand mark. This color is precious — it is used when meaning must be communicated, not for decoration.

### Accent
- **Warm Paper Cream** (`oklch(0.960 0.020 90)`): Hover backgrounds on ghost buttons, subtle active-state fills, accent underlines on key links. Used with extreme restraint. Never as a primary button fill — white text on this cream does not read clearly.

### Neutral
- **Paper White** (`oklch(1.000 0.000 0)`): The body background. Pure white — no tint, no warmth. The paper the ink lands on.
- **Cool Off-White Surface** (`oklch(0.985 0.002 170)`): Cards, panels, input backgrounds. A barely-there tonal shift from pure white — 1.5% toward the brand hue. Creates subtle layering without feeling tinted.
- **Deep Near-Black Ink** (`oklch(0.135 0.018 165)`): Body text, labels, headings. A near-neutral with the barest cool undertone toward the teal — warmth lives in the typography and accent, not the ink.
- **Muted Gray** (`oklch(0.660 0.014 165)`): Placeholder text, disabled states, secondary labels, dividers. Must not be used for body text — does not meet WCAG AA for prose.

## 3. Typography

**Font:** Geist (with Helvetica Neue and Arial fallbacks). Single-family throughout — no display/body pairing. Product UI does not need typographic theatre; one well-tuned sans carries everything.

**Character:** Clean and precise. Geist's neutral geometry serves the content without asserting personality. The calm of well-typeset technical documentation, not the personality of a magazine.

### Hierarchy
- **Display** (600, 2.25rem / 1.1 / −0.02em): Lesson titles, screen headers. Tight tracking, moderate weight — authoritative without shouting.
- **Headline** (600, 1.75rem / 1.2 / −0.015em): Section headings within lessons, card titles.
- **Title** (500, 1.25rem / 1.3 / −0.01em): Subsection headings, component labels, navigation items.
- **Body** (400, 1rem / 1.65): Lesson content, explanations, descriptions. Line length capped at 70ch for readability.
- **Label** (500, 0.875rem / 1.4 / 0.01em): Button text, form labels, status badges, secondary UI text.

**Named Rules:**
- **The Display Ceiling Rule.** Display size never exceeds 2.25rem. The interface teaches Japanese — it should feel focused and precise, not like a marketing page.
- **The Body Length Rule.** Body text wraps at 70ch maximum. Line length beyond this causes eye-fatigue; enforce it at the container level.

## 4. Elevation

This is a flat-by-default system. Depth is conveyed through tonal layering and spacing — not through shadow depth.

**The Flat-By-Default Rule.** Surfaces are flat at rest. Shadows appear only as a response to state (hover, dropdown, modal, focus). Elevation communicates interaction, not hierarchy.

### Shadow Vocabulary
- **Hover Lift** (`0 2px 8px oklch(0.135 0.018 165 / 0.08)`): Subtle, low-opacity shadow on interactive elements at hover. Communicates "this is clickable." Not dramatic — just enough to separate the element from the surface.
- **Focus Ring** (`0 0 0 2px oklch(0.400 0.080 170)`): The primary teal as a 2px outline on focused interactive elements. Visible but not aggressive.

### Tonal Layering
- **Layer 0 (bg):** Pure white — the base.
- **Layer 1 (surface):** `oklch(0.985 0.002 170)` — used for cards, input backgrounds, subtle inset panels.
- **Layer 2 (border):** `oklch(0.660 0.014 165)` — muted gray borders on inputs, inactive tabs, dividers.
- **Layer 3 (surface-hover):** A 50/50 mix of surface and white — used for ghost button hover, row hover in lists.

## 5. Components

All interactive components have: default, hover, focus, active, disabled, loading. State richness is not optional — a component that skips disabled or loading states is incomplete.

### Buttons
- **Shape:** Gently curved — 8px radius. Not fully rounded (no pill buttons unless a specific lesson calls for it). Not sharp — Muji has soft edges.
- **Primary:** Teal fill (`oklch(0.400 0.080 170)`), white text. Padding 12px 24px. On hover: slightly darker teal (`oklch(0.360 0.080 170)`), subtle shadow lift. On focus: 2px teal focus ring, offset 2px.
- **Ghost:** Transparent background, ink-colored text. On hover: surface background (`oklch(0.985 0.002 170)`), no shadow. Communicates secondary action — present but not competing.
- **Disabled:** 40% opacity on text. No cursor pointer. No hover state.
- **Loading:** Replace label with a subtle pulsing opacity animation (not a spinner inside the button — that reads as interruptive).

### Cards / Containers
- **Corner Style:** 8px radius.
- **Background:** Surface color (`oklch(0.985 0.002 170)`) or pure white depending on nesting depth.
- **Border:** 1px muted gray border (`oklch(0.660 0.014 165)`) for card-on-white. No border between cards on a white bg — use spacing instead.
- **Shadow Strategy:** None at rest. On hover: subtle shadow lift (the Hover Lift shadow).
- **Internal Padding:** 24px.

### Inputs / Fields
- **Style:** 1px muted gray border, surface-white background. 8px radius.
- **Focus:** Border shifts to primary teal, 2px. No glow, no shadow — a clean border color shift.
- **Error:** Border shifts to a muted red (not primary red — `oklch(0.550 0.100 25)`). Error message in this same red, below the field, in label size.
- **Disabled:** Background shifts to the surface color, text to muted. 50% opacity.

### Navigation
- **Style:** Clean horizontal top nav or vertical side nav depending on screen size. Ink-colored text, label weight.
- **Default:** Ink color text, no background.
- **Hover:** Surface background on the item.
- **Active:** Primary teal text or surface background with teal text. The current location must be unmistakable.

### Progress Indicator
- **Style:** A thin horizontal bar or step indicator using the primary teal fill against the muted border color. Clean, geometric — no rounded pill progress bars.
- **Motion:** Progress advances with a 200ms ease-out transition. No bounce.

## 6. Do's and Don'ts

### Do:
- **Do** use the primary teal as a signal of importance — primary actions, active states, the current lesson. Its scarcity is part of its meaning.
- **Do** leave space. If an element feels crowded, add 8–16px before reaching for a smaller font size.
- **Do** use pure white as the body background. No warmth, no tint — the paper is blank by design.
- **Do** use focus rings on every interactive element. Never trap a keyboard user.
- **Do** cap body text line length at 70ch. This is not optional — it is the difference between readable and exhausting.
- **Do** provide disabled and loading states on every interactive component. Never leave a button visually ambiguous mid-action.

### Don't:
- **Don't** use the primary teal as decoration. If the screen has teal on it and the user can't explain why, remove it.
- **Don't** use gradient backgrounds or glass effects anywhere. The Muji aesthetic is flat, clean, and intentional — frosted glass and gradients are the opposite of this.
- **Don't** use border-left or border-right as a colored accent stripe on cards, list items, or callouts. Full borders, background tints, or nothing.
- **Don't** use rounded pill buttons (border-radius: 9999px) except as explicit badges or lesson-type labels.
- **Don't** use anime mascots, cartoon characters, or "kawaii" illustrations. The language is serious; the design should treat it that way.
- **Don't** use muted gray for body text. Use it for placeholders, labels, and disabled states only.
- **Don't** use gradient text anywhere. Solid colors only — emphasis comes from weight and size.
- **Don't** use warm-toned backgrounds (cream, beige, parchment, sand, wheat, bone). Warmth lives in the typography and in the warm cream accent, not in the body surface.
- **Don't** animate layout properties (width, height, padding). Animate opacity and transform only.
- **Don't** use motion as decoration. Every animation should communicate state change, feedback, or guide attention.
