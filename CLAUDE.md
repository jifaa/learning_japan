# CLAUDE.md - Learning Japan Project Rules

## Project Context

This is a Next.js Japanese language learning app for absolute beginners. The brand is Muji-inspired minimalism — calm, intentional, and encouraging.

## Tech Stack

- **Framework**: Next.js App Router + TypeScript
- **Package Manager**: npm
- **Styling**: Tailwind CSS v4
- **Components**: shadcn/ui (not yet installed)
- **Animation**: Framer Motion / motion.dev
- **Database**: Supabase (PostgreSQL) — not yet installed
- **ORM**: Prisma — not yet installed

## Design System

See `DESIGN.md` for the complete design system including:
- Color palette (teal primary, paper white background)
- Typography (Geist family)
- Component patterns
- Motion principles

## Development Rules

### Core Principles

1. **Work incrementally** — Build one feature at a time, test, then move on.
2. **Do not build unrelated features** — Stick to the current task scope.
3. **Prefer server components by default** — Use them unless interactivity is required.
4. **Use client components only for interactive UI** — Buttons, forms, animations, etc.
5. **Never expose Supabase service role key to client** — Use server-side auth only.
6. **Keep content data public-read, user data private** — Auth-gate user-specific data.
7. **Use Motion sparingly and purposefully** — Motion serves learning, not decoration.
8. **Use impeccable/ui-ux-pro-max for visual design review** — Before finalizing UI work.
9. **Use ponytail mindset** — Avoid overengineering; write the smallest clean solution.

### Security Rules

- Supabase anon key is safe for public data (read-only)
- Supabase service role key must NEVER reach the client
- User data queries must include auth.uid() checks
- Row Level Security (RLS) on all user-owned tables

### Data Architecture

- **Public content** (vocabulary, grammar, lessons): public-read via anon key
- **User data** (progress, quiz results, streaks): auth-gated, private per user
- **Achievements/XP**: computed from user actions, stored per user

### Performance Rules

- Keep client components minimal
- Use React Server Components for data fetching
- Lazy load heavy components (kanji rendering, audio)
- Optimize images with next/image

### Code Organization

- Server components: `app/**/page.tsx` and `app/**/layout.tsx`
- Client components: `components/ui/**` (marked with 'use client')
- API routes: `app/api/**/route.ts`
- Lib utilities: `lib/supabase/**`, `lib/srs/**`, etc.
- Seed data: `data/**/seed/**` (move from root when ready)

## Current Status

- **Framework**: Next.js 16.2.10, React 19, TypeScript 5, Tailwind v4
- **Database**: Supabase PostgreSQL with 35 tables, full RLS policies + bookmarks/notes tables
- **Auth**: Functional (login/register with real Supabase auth)
- **Backend**: Complete data-access layer in `src/lib/db/*.ts`
  - `content.ts` — vocabulary/grammar/kanji/kana/particles/reading getters + enriched bookmarks
  - `srs.ts` — spaced repetition engine (getDueCards, reviewCard, calculateNextReview)
  - `quiz.ts` — quiz session management, scoring, history
  - `progress.ts` — XP, streaks, lesson progress, daily stats
- **Seed Data**: 46 CSV files (5,568 rows), all validated
- **UI — all 23 routes wired**: Dashboard, Kana, Vocabulary, Grammar, Kanji, Flashcards (SRS review), Quiz (4 types), Reading, Progress (with chart), Learn/Roadmap, Daily Challenge, Settings, Search, Bookmarks, Notes, Mock Test, Listening, Achievements
- **Routes**: /dashboard, /learn, /kana, /vocabulary, /grammar, /kanji, /quiz, /flashcards, /reading, /progress, /daily-challenge, /search, /bookmarks, /notes, /mock-test, /listening, /achievements, /settings, /login, /register
- **Middleware**: Fixed — protects all 17 app routes, redirects authenticated users from auth pages, root redirects to /dashboard
- **Audio**: Web Speech API (ja-JP) implemented in Kana chart, vocabulary, kanji, flashcard sessions, and Listening practice
- **Localization**: All pages fully Indonesian (Bahasa Indonesia) — nav, landing, all 22 pages
- **Next Step**: Stroke order diagrams for Kanji (need SVG asset strategy), visual polish pass

## File Locations

- App routes: `app/`
- Components: `components/`
- Library code: `lib/`
- Seed data: `data/` (after migration from root)
- Documentation: `docs/`
