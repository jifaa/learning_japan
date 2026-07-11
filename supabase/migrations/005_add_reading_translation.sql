-- ============================================================
-- Add Indonesian translation column to reading passages
-- Seed data uses passage_id for translation; rename to meaning_id
-- ============================================================

-- Add meaning_id column
ALTER TABLE public.reading_passages
  ADD COLUMN IF NOT EXISTS meaning_id TEXT;

-- Migrate existing translation data from passage_id to meaning_id
-- passage_id in seed data actually contains Indonesian translations
UPDATE public.reading_passages
  SET meaning_id = passage_id
  WHERE passage_id IS NOT NULL AND meaning_id IS NULL;
