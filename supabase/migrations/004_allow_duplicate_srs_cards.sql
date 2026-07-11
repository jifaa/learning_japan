-- ============================================================
-- Allow duplicate SRS cards for the same content
-- One vocabulary/kanji/grammar can now have multiple SRS card entries
-- (e.g., for spaced repetition rounds or re-review sessions)
-- ============================================================

-- Drop the unique constraint that prevents duplicate cards
ALTER TABLE public.user_srs_cards
  DROP CONSTRAINT IF EXISTS user_srs_cards_user_id_card_type_content_id_key;

-- Add a non-unique index on (user_id, card_type, content_id) for fast lookups
-- Note: This is still useful for filtering but doesn't prevent duplicates
