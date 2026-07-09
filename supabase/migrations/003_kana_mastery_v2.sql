-- ============================================
-- Kana Mastery Quiz System v2 (Simplified)
-- Focus: Bukti penguasaan karakter
-- ============================================

-- Drop existing tables if exist (for clean migration)
DROP TABLE IF EXISTS kana_quiz_history CASCADE;
DROP TABLE IF EXISTS kana_quiz_sessions CASCADE;
DROP TABLE IF EXISTS user_kana_progress CASCADE;
DROP TABLE IF EXISTS kana_unlock_thresholds CASCADE;

-- ============================================
-- Table: user_kana_progress
-- Tracks mastery per character (simplified)
-- mastery_count = jumlah jawaban benar kumulatif
-- Dikuasai = mastery_count >= 3
-- ============================================

CREATE TABLE IF NOT EXISTS user_kana_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  kana_id TEXT NOT NULL,                    -- ID dari kana_characters
  script TEXT NOT NULL CHECK (script IN ('hiragana', 'katakana')),
  mastery_count INTEGER DEFAULT 0,            -- Hitungan jawaban benar
  last_quizzed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, kana_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_kana_progress_user_id ON user_kana_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_kana_progress_script ON user_kana_progress(script);
CREATE INDEX IF NOT EXISTS idx_kana_progress_mastery ON user_kana_progress(mastery_count);

-- ============================================
-- Table: kana_quiz_history
-- Track setiap jawaban quiz
-- ============================================

CREATE TABLE IF NOT EXISTS kana_quiz_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  script TEXT NOT NULL CHECK (script IN ('hiragana', 'katakana')),
  kana_id TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  answered_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_kana_history_user_id ON kana_quiz_history(user_id);
CREATE INDEX IF NOT EXISTS idx_kana_history_script ON kana_quiz_history(script);
CREATE INDEX IF NOT EXISTS idx_kana_history_answered_at ON kana_quiz_history(answered_at);

-- ============================================
-- Table: kana_quiz_sessions
-- Track hasil quiz per sesi
-- ============================================

CREATE TABLE IF NOT EXISTS kana_quiz_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  script TEXT NOT NULL CHECK (script IN ('hiragana', 'katakana')),
  total_questions INTEGER NOT NULL,
  correct_count INTEGER DEFAULT 0,
  wrong_count INTEGER DEFAULT 0,
  xp_earned INTEGER DEFAULT 0,
  is_perfect BOOLEAN DEFAULT FALSE,        -- TRUE jika 10/10
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_kana_sessions_user_id ON kana_quiz_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_kana_sessions_script ON kana_quiz_sessions(script);

-- ============================================
-- Functions
-- ============================================

-- Increment mastery count when answer is correct
CREATE OR REPLACE FUNCTION increment_kana_mastery()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_correct = TRUE THEN
    INSERT INTO user_kana_progress (user_id, kana_id, script, mastery_count, last_quizzed_at, updated_at)
    VALUES (NEW.user_id, NEW.kana_id, NEW.script, 1, NOW(), NOW())
    ON CONFLICT (user_id, kana_id)
    DO UPDATE SET
      mastery_count = user_kana_progress.mastery_count + 1,
      last_quizzed_at = NOW(),
      updated_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger untuk auto-update mastery
DROP TRIGGER IF EXISTS trigger_increment_kana_mastery ON kana_quiz_history;
CREATE TRIGGER trigger_increment_kana_mastery
  AFTER INSERT ON kana_quiz_history
  FOR EACH ROW
  EXECUTE FUNCTION increment_kana_mastery();

-- ============================================
-- RLS Policies
-- ============================================

ALTER TABLE user_kana_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE kana_quiz_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE kana_quiz_sessions ENABLE ROW LEVEL SECURITY;

-- User can only see/edit their own data
CREATE POLICY "Users can view own kana progress"
  ON user_kana_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own kana progress"
  ON user_kana_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own kana progress"
  ON user_kana_progress FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own quiz history"
  ON kana_quiz_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quiz history"
  ON kana_quiz_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own quiz sessions"
  ON kana_quiz_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quiz sessions"
  ON kana_quiz_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);
