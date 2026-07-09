-- ============================================================
-- FIX: Enable public read access for all content tables
-- Run in: Supabase Dashboard > SQL Editor
-- ============================================================

-- Function to safely enable RLS and add a select policy
DO $$ 
DECLARE
  t text;
  tables text[] := ARRAY[
    'kana_characters',
    'symbols',
    'particles',
    'grammar_points',
    'vocabulary',
    'kanji',
    'radicals',
    'radical_variants',
    'kanji_radical_map',
    'conjugation_rules',
    'reading_passages',
    'reading_questions'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    -- Enable RLS
    EXECUTE format('ALTER TABLE IF EXISTS public.%I ENABLE ROW LEVEL SECURITY;', t);
    
    -- Drop policy if it already exists to avoid errors, then recreate
    EXECUTE format('DROP POLICY IF EXISTS "Allow public read access" ON public.%I;', t);
    EXECUTE format('CREATE POLICY "Allow public read access" ON public.%I FOR SELECT USING (true);', t);
  END LOOP;
END $$;
