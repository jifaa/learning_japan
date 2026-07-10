-- ============================================================
-- KANA QUIZ TABLES - Migration Script
-- Run this in Supabase Dashboard > SQL Editor
-- ============================================================

-- Step 1: Add mastery_count column to kana_characters
-- This is the main column we use for tracking progress
ALTER TABLE public.kana_characters
ADD COLUMN IF NOT EXISTS mastery_count INTEGER DEFAULT 0;

-- Step 2: Create kana_quiz_history table (for analytics)
CREATE TABLE IF NOT EXISTS public.kana_quiz_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  script TEXT NOT NULL CHECK (script IN ('hiragana', 'katakana')),
  kana_id TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kana_quiz_history_user_id ON public.kana_quiz_history(user_id);
CREATE INDEX IF NOT EXISTS idx_kana_quiz_history_script ON public.kana_quiz_history(script);

-- Step 3: Create kana_quiz_sessions table (for analytics)
CREATE TABLE IF NOT EXISTS public.kana_quiz_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  script TEXT NOT NULL CHECK (script IN ('hiragana', 'katakana')),
  total_questions INTEGER NOT NULL,
  correct_count INTEGER NOT NULL,
  wrong_count INTEGER NOT NULL,
  xp_earned INTEGER NOT NULL DEFAULT 0,
  is_perfect BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kana_quiz_sessions_user_id ON public.kana_quiz_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_kana_quiz_sessions_created_at ON public.kana_quiz_sessions(created_at);

-- Step 4: Enable RLS on new tables
ALTER TABLE public.kana_quiz_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kana_quiz_sessions ENABLE ROW LEVEL SECURITY;

-- Step 5: Create RLS policies for kana_quiz_history
DROP POLICY IF EXISTS "Users can view own kana quiz history" ON public.kana_quiz_history;
CREATE POLICY "Users can view own kana quiz history"
  ON public.kana_quiz_history FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own kana quiz history" ON public.kana_quiz_history;
CREATE POLICY "Users can insert own kana quiz history"
  ON public.kana_quiz_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Step 6: Create RLS policies for kana_quiz_sessions
DROP POLICY IF EXISTS "Users can view own kana quiz sessions" ON public.kana_quiz_sessions;
CREATE POLICY "Users can view own kana quiz sessions"
  ON public.kana_quiz_sessions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own kana quiz sessions" ON public.kana_quiz_sessions;
CREATE POLICY "Users can insert own kana quiz sessions"
  ON public.kana_quiz_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- VERIFICATION
-- ============================================================
-- Run this to verify:
-- SELECT id, kana, mastery_count FROM public.kana_characters LIMIT 5;
