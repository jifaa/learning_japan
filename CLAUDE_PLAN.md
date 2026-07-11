# Plan: Tombol "Tampilkan Arti" pada Bacaan

## Current State

- Reading page at `/reading/[id]/page.tsx` is a **server component** with no interactivity
- Japanese text (`passage_jp`) is shown as one block — sentences separated by `。`
- **Indonesian translation already exists** in seed data — stored in `passage_id` column (schema mislabels it; seed data uses it for translation)
- **No auto-show-on-click** logic — text just displays
- Currently shows: Japanese → Romaji section

## Key Discovery

The seed file `reading_passages_n5_seed.csv` has translations already in `passage_id`:

```
passage_jp:  はじめまして。私はアヤです。印尼人です。...
passage_id:  Perkenalkan. Saya Aya. Saya orang Indonesia,...
```

The schema's comment says `passage_id` is a reference ID, but seed data uses it for translation. We'll treat it as the translation field.

## Implementation

### 1. Database migration — rename column

File: `supabase/migrations/005_rename_reading_translation.sql`

```sql
ALTER TABLE public.reading_passages
  ADD COLUMN IF NOT EXISTS meaning_id TEXT;

-- Migrate existing translation data from passage_id to meaning_id
UPDATE public.reading_passages
  SET meaning_id = passage_id
  WHERE passage_id IS NOT NULL AND meaning_id IS NULL;

-- Optional: clear the misnamed column
-- ALTER TABLE public.reading_passages DROP COLUMN passage_id;
```

### 2. Type update

`src/types/content.ts` — rename `passage_id` → `meaning_id` in `ReadingPassage` interface (and keep `passage_id` for backward compat during migration).

### 3. New client component

File: `src/app/(app)/reading/[id]/reading-client.tsx`

- Split `passage_jp` by `。` into sentence units
- Per sentence: show Japanese text + "Tampilkan Arti" toggle button
- When toggled: show full Indonesian translation (`meaning_id`) below with smooth Framer Motion expand/collapse
- Button shows "Tampilkan Arti" → "Sembunyikan" (toggle)
- Per-sentence `useState<Set<number>>` for visibility

```tsx
// State: which sentence indices have translation visible
const [visibleTranslations, setVisibleTranslations] = useState<Set<number>>(new Set());

// Toggle
const toggleTranslation = (index: number) => {
  setVisibleTranslations(prev => {
    const next = new Set(prev);
    if (next.has(index)) next.delete(index);
    else next.add(index);
    return next;
  });
};
```

**Per-sentence UI:**
```
[Japanese sentence text here]                    [Tampilkan Arti ▼]
  ┌─────────────────────────────────────────────┐
  │ Indonesian translation text here...           │
  └─────────────────────────────────────────────┘
```

### 4. Server page → client component

`src/app/(app)/reading/[id]/page.tsx`
- Keep server component for `generateMetadata`
- Pass passage data to `<ReadingPassageClient passage={passage} />`
- Romaji section moves into the client component below sentences

### 5. Seed data update

`data/seed/reading_passages_n5_seed.csv` — add `meaning_id` column header and copy `passage_id` values into it.

## Edge Cases

- `meaning_id` is null/empty → show "Terjemahan belum tersedia" message in the toggle
- Single-sentence passage → still works (one toggle)
- Empty split segments → filtered out with `.filter(Boolean)`

## File Changes

| File | Change |
|---|---|
| `supabase/migrations/005_rename_reading_translation.sql` | New — add `meaning_id`, migrate data |
| `src/types/content.ts` | Add `meaning_id` to `ReadingPassage` |
| `src/app/(app)/reading/[id]/reading-client.tsx` | New — client component with per-sentence toggle |
| `src/app/(app)/reading/[id]/page.tsx` | Render `<ReadingPassageClient>`, move Romaji inside |
| `data/seed/reading_passages_n5_seed.csv` | Add `meaning_id` column header |
