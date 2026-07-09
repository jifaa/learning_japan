-- ============================================================
-- Learning Japan - Supabase Database Schema (FULL)
-- ============================================================
-- Idempotent: safe to run multiple times.
-- Covers all 27 tables required by seed-mappers.ts
-- ============================================================

-- ============================================================
-- SECTION 1: ENUM TYPES
-- ============================================================

DO $$ BEGIN CREATE TYPE jlpt_level AS ENUM ('N5','N4','N3','N2','N1');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE TYPE script_type AS ENUM ('hiragana','katakana','kanji','mixed','vocabulary','grammar');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE TYPE srs_state AS ENUM ('new','learning','review','relearning','graduated');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE TYPE srs_rating AS ENUM ('again','hard','good','easy');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE TYPE quiz_type AS ENUM ('vocabulary','grammar','kanji','reading','mixed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE TYPE lesson_type AS ENUM ('vocabulary','grammar','kanji','reading','quiz','review');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE TYPE achievement_category AS ENUM ('streak','progress','mastery','social','special');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- SECTION 2: USER / AUTH TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email) VALUES (NEW.id, NEW.email) ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- SECTION 3: SRS TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS public.user_srs_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  card_type script_type NOT NULL,
  content_id TEXT NOT NULL,
  deck_key TEXT NOT NULL,
  state srs_state DEFAULT 'new',
  due_date TIMESTAMPTZ DEFAULT NOW(),
  interval INTEGER DEFAULT 0,
  ease_factor DECIMAL(4,2) DEFAULT 2.5,
  reviews INTEGER DEFAULT 0,
  lapses INTEGER DEFAULT 0,
  last_review TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, card_type, content_id)
);
CREATE INDEX IF NOT EXISTS idx_user_srs_cards_user_id ON public.user_srs_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_user_srs_cards_due_date ON public.user_srs_cards(user_id, due_date);
CREATE INDEX IF NOT EXISTS idx_user_srs_cards_state ON public.user_srs_cards(user_id, state);
ALTER TABLE public.user_srs_cards ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Users can manage own SRS cards" ON public.user_srs_cards FOR ALL USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.srs_review_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  card_id UUID NOT NULL REFERENCES public.user_srs_cards(id) ON DELETE CASCADE,
  rating srs_rating NOT NULL,
  time_taken_ms INTEGER NOT NULL,
  was_correct BOOLEAN NOT NULL,
  reviewed_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_srs_review_log_user_id ON public.srs_review_log(user_id);
CREATE INDEX IF NOT EXISTS idx_srs_review_log_card_id ON public.srs_review_log(card_id);
ALTER TABLE public.srs_review_log ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Users can manage own review logs" ON public.srs_review_log FOR ALL USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- SECTION 4: USER PROGRESS TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS public.user_progress (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  total_xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Users can manage own progress" ON public.user_progress FOR ALL USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.daily_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  xp_earned INTEGER DEFAULT 0,
  lessons_completed INTEGER DEFAULT 0,
  time_spent_minutes INTEGER DEFAULT 0,
  accuracy DECIMAL(5,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);
CREATE INDEX IF NOT EXISTS idx_daily_stats_user_date ON public.daily_stats(user_id, date);
ALTER TABLE public.daily_stats ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Users can manage own daily stats" ON public.daily_stats FOR ALL USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL,
  lesson_type lesson_type NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  progress_percent INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_user_id ON public.lesson_progress(user_id);
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Users can manage own lesson progress" ON public.lesson_progress FOR ALL USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- SECTION 5: QUIZ / RESULT TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS public.quiz_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  quiz_type quiz_type NOT NULL,
  score INTEGER NOT NULL,
  total_points INTEGER NOT NULL,
  correct_answers INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  time_spent_seconds INTEGER NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_quiz_results_user_id ON public.quiz_results(user_id);
ALTER TABLE public.quiz_results ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Users can manage own quiz results" ON public.quiz_results FOR ALL USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- SECTION 6: ACHIEVEMENT TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  badge_id TEXT NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON public.user_achievements(user_id);
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Users can view own achievements" ON public.user_achievements FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- SECTION 7: PUBLIC CONTENT TABLES (seed targets)
-- ============================================================

-- 1. kana_characters
CREATE TABLE IF NOT EXISTS public.kana_characters (
  id TEXT PRIMARY KEY,
  script TEXT,
  category TEXT,
  kana TEXT NOT NULL,
  romaji TEXT NOT NULL,
  romaji_alt TEXT,
  row_group TEXT,
  vowel TEXT,
  base_kana TEXT,
  base_romaji TEXT,
  pair_key TEXT,
  is_digraph BOOLEAN DEFAULT FALSE,
  is_common BOOLEAN DEFAULT TRUE,
  n5_relevant BOOLEAN DEFAULT TRUE,
  audio_path TEXT,
  stroke_order_path TEXT,
  unicode_codepoints TEXT,
  unicode_names TEXT,
  display_order INTEGER DEFAULT 0,
  raw_data JSONB
);
CREATE INDEX IF NOT EXISTS idx_kana_script ON public.kana_characters(script);

-- 2. symbols
CREATE TABLE IF NOT EXISTS public.symbols (
  id TEXT PRIMARY KEY,
  symbol TEXT NOT NULL,
  visible_symbol TEXT,
  unicode_codepoint TEXT,
  unicode_name TEXT,
  category TEXT,
  subcategory TEXT,
  japanese_name TEXT,
  romaji_name TEXT,
  meaning_id TEXT,
  usage_id TEXT,
  input_aliases TEXT,
  normalized_nfkc TEXT,
  pair_key TEXT,
  pair_role TEXT,
  is_pair BOOLEAN DEFAULT FALSE,
  is_common BOOLEAN DEFAULT TRUE,
  n5_relevant BOOLEAN DEFAULT FALSE,
  recommended_for_quiz BOOLEAN DEFAULT FALSE,
  example_jp TEXT,
  example_id TEXT,
  display_order INTEGER DEFAULT 0,
  raw_data JSONB
);

-- 3. particles
CREATE TABLE IF NOT EXISTS public.particles (
  id TEXT PRIMARY KEY,
  jlpt_level TEXT,
  particle TEXT NOT NULL,
  reading_kana TEXT,
  romaji TEXT,
  romaji_alt TEXT,
  particle_category TEXT,
  function_key TEXT,
  meaning_id TEXT,
  meaning_en TEXT,
  usage_explanation_id TEXT,
  pattern TEXT,
  example_jp TEXT,
  example_romaji TEXT,
  example_meaning_id TEXT,
  position TEXT,
  is_common BOOLEAN DEFAULT TRUE,
  is_core_n5 BOOLEAN DEFAULT FALSE,
  recommended_for_quiz BOOLEAN DEFAULT TRUE,
  confusable_with TEXT,
  common_mistake_id TEXT,
  input_aliases TEXT,
  display_order INTEGER DEFAULT 0,
  raw_data JSONB
);

-- 4. grammar_points
CREATE TABLE IF NOT EXISTS public.grammar_points (
  id TEXT PRIMARY KEY,
  jlpt_level TEXT,
  grammar_point TEXT NOT NULL,
  reading_kana TEXT,
  romaji TEXT,
  meaning_id TEXT,
  meaning_en TEXT,
  category_id TEXT,
  lesson_group TEXT,
  structure_pattern TEXT,
  usage_explanation_id TEXT,
  example_jp TEXT,
  example_romaji TEXT,
  example_meaning_id TEXT,
  practice_type TEXT,
  practice_prompt_id TEXT,
  practice_answer TEXT,
  related_points TEXT,
  confusable_with TEXT,
  formality TEXT,
  polarity TEXT,
  register TEXT,
  difficulty_order INTEGER DEFAULT 0,
  tags TEXT[],
  is_core_n5 BOOLEAN DEFAULT FALSE,
  recommended_for_quiz BOOLEAN DEFAULT TRUE,
  illustration_path TEXT,
  audio_path TEXT,
  source_basis TEXT,
  display_order INTEGER DEFAULT 0,
  raw_data JSONB
);
CREATE INDEX IF NOT EXISTS idx_grammar_jlpt ON public.grammar_points(jlpt_level);

-- 5. vocabulary
CREATE TABLE IF NOT EXISTS public.vocabulary (
  id TEXT PRIMARY KEY,
  jlpt_level TEXT,
  expression TEXT NOT NULL,
  primary_expression TEXT,
  reading TEXT,
  romaji TEXT,
  script_type TEXT,
  part_of_speech_id TEXT,
  part_of_speech TEXT,
  semantic_category TEXT,
  meaning_id TEXT,
  meaning_en TEXT,
  tags TEXT[],
  is_common BOOLEAN DEFAULT TRUE,
  is_official_jlpt_list BOOLEAN DEFAULT FALSE,
  source_basis TEXT,
  audio_path TEXT,
  example_sentence_jp TEXT,
  example_sentence_id TEXT,
  example_sentence_romaji TEXT,
  example_sentence_review_status TEXT,
  display_order INTEGER DEFAULT 0,
  raw_data JSONB
);
CREATE INDEX IF NOT EXISTS idx_vocabulary_jlpt ON public.vocabulary(jlpt_level);
CREATE INDEX IF NOT EXISTS idx_vocabulary_expression ON public.vocabulary(expression);

-- 6. kanji
CREATE TABLE IF NOT EXISTS public.kanji (
  id TEXT PRIMARY KEY,
  jlpt_level TEXT,
  kanji TEXT NOT NULL,
  unicode_codepoint TEXT,
  unicode_name TEXT,
  stroke_count INTEGER DEFAULT 0,
  onyomi_romaji TEXT,
  onyomi_katakana TEXT,
  kunyomi_romaji TEXT,
  kunyomi_hiragana TEXT,
  meaning_en TEXT,
  meaning_id TEXT,
  example_word TEXT,
  example_reading TEXT,
  example_romaji TEXT,
  example_meaning_id TEXT,
  example_sentence_jp TEXT,
  example_sentence_id TEXT,
  mnemonic_id TEXT,
  radical_kanji TEXT,
  audio_path TEXT,
  stroke_order_path TEXT,
  display_order INTEGER DEFAULT 0,
  raw_data JSONB
);
CREATE INDEX IF NOT EXISTS idx_kanji_jlpt ON public.kanji(jlpt_level);

-- 7. radicals
CREATE TABLE IF NOT EXISTS public.radicals (
  id TEXT PRIMARY KEY,
  radical_system TEXT DEFAULT 'kangxi_214_japanese',
  radical_number INTEGER DEFAULT 0,
  stroke_count INTEGER DEFAULT 0,
  base_radical TEXT NOT NULL,
  kangxi_radical_symbol TEXT,
  unicode_codepoint TEXT,
  unicode_name TEXT,
  kangxi_unicode_codepoint TEXT,
  japanese_name_hiragana TEXT,
  japanese_name_romaji TEXT,
  meaning_en TEXT,
  meaning_id TEXT,
  variant_forms TEXT,
  variant_notes_id TEXT,
  is_common_for_japanese_learners BOOLEAN DEFAULT FALSE,
  n5_relevant BOOLEAN DEFAULT FALSE,
  recommended_for_quiz BOOLEAN DEFAULT FALSE,
  raw_data JSONB
);

-- 8. radical_variants
CREATE TABLE IF NOT EXISTS public.radical_variants (
  id TEXT PRIMARY KEY,
  base_radical_id TEXT NOT NULL,
  radical_number INTEGER DEFAULT 0,
  base_radical TEXT NOT NULL,
  variant_form TEXT NOT NULL,
  variant_unicode_codepoint TEXT,
  variant_unicode_name TEXT,
  variant_position_category TEXT,
  japanese_name_hiragana TEXT,
  japanese_name_romaji TEXT,
  meaning_id TEXT,
  is_common BOOLEAN DEFAULT FALSE,
  n5_relevant BOOLEAN DEFAULT FALSE,
  raw_data JSONB
);

-- 9. kanji_radical_map
CREATE TABLE IF NOT EXISTS public.kanji_radical_map (
  id TEXT PRIMARY KEY,
  jlpt_level TEXT,
  kanji TEXT NOT NULL,
  kanji_meaning_id TEXT,
  radical_form_used TEXT NOT NULL,
  canonical_radical TEXT NOT NULL,
  radical_id TEXT NOT NULL,
  radical_number INTEGER DEFAULT 0,
  radical_name_hiragana TEXT,
  radical_name_romaji TEXT,
  radical_meaning_id TEXT,
  radical_position_guess TEXT,
  is_variant_form BOOLEAN DEFAULT FALSE,
  is_core_80 BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0,
  raw_data JSONB
);

-- 10. conjugation_rules
CREATE TABLE IF NOT EXISTS public.conjugation_rules (
  id TEXT PRIMARY KEY,
  jlpt_level TEXT,
  conjugation_type TEXT NOT NULL,
  rule_family TEXT,
  form_key TEXT NOT NULL,
  form_name_id TEXT,
  meaning_id TEXT,
  applies_to_ending TEXT,
  match_condition TEXT,
  operation TEXT,
  stem_change TEXT,
  append_text TEXT,
  result_formula_id TEXT,
  result_ending TEXT,
  example_verb TEXT,
  example_adjective TEXT,
  example_reading TEXT,
  example_romaji TEXT,
  example_result TEXT,
  example_result_romaji TEXT,
  example_meaning_id TEXT,
  polarity TEXT,
  tense TEXT,
  politeness TEXT,
  formality TEXT,
  is_core_n5 BOOLEAN DEFAULT FALSE,
  recommended_for_quiz BOOLEAN DEFAULT TRUE,
  priority INTEGER DEFAULT 0,
  display_order INTEGER DEFAULT 0,
  raw_data JSONB
);

-- 11. numbers
CREATE TABLE IF NOT EXISTS public.numbers (
  id TEXT PRIMARY KEY,
  jlpt_level TEXT,
  number_value INTEGER NOT NULL,
  kanji TEXT,
  reading_kana TEXT,
  romaji TEXT,
  reading_alt_kana TEXT,
  romaji_alt TEXT,
  number_type TEXT,
  meaning_id TEXT,
  is_common BOOLEAN DEFAULT TRUE,
  n5_relevant BOOLEAN DEFAULT TRUE,
  recommended_for_quiz BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  raw_data JSONB
);

-- 12. counters
CREATE TABLE IF NOT EXISTS public.counters (
  id TEXT PRIMARY KEY,
  jlpt_level TEXT,
  counter_symbol TEXT NOT NULL,
  counter_reading_kana TEXT,
  counter_romaji TEXT NOT NULL,
  counter_romaji_alt TEXT,
  counter_category TEXT,
  usage_id TEXT,
  usage_en TEXT,
  example_nouns_jp TEXT,
  example_nouns_id TEXT,
  how_many_form TEXT,
  how_many_reading TEXT,
  counting_range_recommended TEXT,
  has_sound_changes BOOLEAN DEFAULT FALSE,
  is_core_n5 BOOLEAN DEFAULT FALSE,
  is_common BOOLEAN DEFAULT TRUE,
  recommended_for_quiz BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  raw_data JSONB
);

-- 13. counter_forms
CREATE TABLE IF NOT EXISTS public.counter_forms (
  id TEXT PRIMARY KEY,
  jlpt_level TEXT,
  counter_id TEXT NOT NULL,
  counter_symbol TEXT NOT NULL,
  counter_category TEXT,
  number_value INTEGER NOT NULL,
  form_kanji TEXT,
  reading_kana TEXT,
  romaji TEXT,
  reading_alt_kana TEXT,
  romaji_alt TEXT,
  meaning_id TEXT,
  example_noun_jp TEXT,
  example_phrase_jp TEXT,
  example_sentence_jp TEXT,
  example_sentence_id TEXT,
  is_irregular BOOLEAN DEFAULT FALSE,
  is_common BOOLEAN DEFAULT TRUE,
  recommended_for_quiz BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  raw_data JSONB
);

-- 14. calendar_time
CREATE TABLE IF NOT EXISTS public.calendar_time (
  id TEXT PRIMARY KEY,
  jlpt_level TEXT,
  calendar_type TEXT NOT NULL,
  value TEXT NOT NULL,
  kanji TEXT,
  reading_kana TEXT,
  romaji TEXT,
  romaji_alt TEXT,
  meaning_id TEXT,
  is_irregular BOOLEAN DEFAULT FALSE,
  is_common BOOLEAN DEFAULT TRUE,
  recommended_for_quiz BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  raw_data JSONB
);

-- 15. example_sentences
CREATE TABLE IF NOT EXISTS public.example_sentences (
  id TEXT PRIMARY KEY,
  jlpt_level TEXT,
  sentence_jp TEXT NOT NULL,
  sentence_kana TEXT,
  sentence_romaji TEXT,
  meaning_id TEXT,
  meaning_en TEXT,
  difficulty_level INTEGER DEFAULT 0,
  sentence_type TEXT,
  target_vocab_ids TEXT[],
  target_vocab_terms TEXT[],
  target_grammar_ids TEXT[],
  target_grammar_points TEXT[],
  target_kanji_ids TEXT[],
  target_kanji_chars TEXT[],
  tags TEXT[],
  recommended_for_flashcard BOOLEAN DEFAULT FALSE,
  recommended_for_quiz BOOLEAN DEFAULT FALSE,
  audio_path TEXT,
  illustration_path TEXT,
  review_status TEXT,
  display_order INTEGER DEFAULT 0,
  raw_data JSONB
);

-- 16. reading_passages
CREATE TABLE IF NOT EXISTS public.reading_passages (
  id TEXT PRIMARY KEY,
  jlpt_level TEXT,
  passage_key TEXT,
  title_id TEXT,
  title_en TEXT,
  topic TEXT,
  difficulty_order INTEGER DEFAULT 0,
  reading_format TEXT,
  passage_jp TEXT NOT NULL,
  passage_romaji TEXT,
  passage_id TEXT,
  character_count INTEGER DEFAULT 0,
  estimated_reading_seconds INTEGER DEFAULT 0,
  question_count INTEGER DEFAULT 0,
  target_vocab_ids TEXT[],
  target_vocab_terms TEXT[],
  target_grammar_ids TEXT[],
  target_grammar_points TEXT[],
  target_kanji_ids TEXT[],
  target_kanji_chars TEXT[],
  structured_data JSONB,
  recommended_for_mvp BOOLEAN DEFAULT FALSE,
  recommended_for_quiz BOOLEAN DEFAULT FALSE,
  used_in_mock_test BOOLEAN DEFAULT FALSE,
  review_status TEXT,
  display_order INTEGER DEFAULT 0,
  raw_data JSONB
);
CREATE INDEX IF NOT EXISTS idx_reading_jlpt ON public.reading_passages(jlpt_level);

-- 17. reading_questions
CREATE TABLE IF NOT EXISTS public.reading_questions (
  id TEXT PRIMARY KEY,
  jlpt_level TEXT,
  passage_id TEXT NOT NULL,
  passage_key TEXT,
  question_order INTEGER DEFAULT 0,
  question_type TEXT,
  skill_focus TEXT,
  question_jp TEXT NOT NULL,
  question_romaji TEXT,
  question_id TEXT,
  choices JSONB,
  correct_answer JSONB,
  explanation_id TEXT,
  difficulty_order INTEGER DEFAULT 0,
  points INTEGER DEFAULT 1,
  time_limit_seconds INTEGER DEFAULT 60,
  quiz_template_key TEXT,
  recommended_for_mvp BOOLEAN DEFAULT FALSE,
  review_status TEXT,
  display_order INTEGER DEFAULT 0,
  raw_data JSONB
);

-- 18. quiz_templates
CREATE TABLE IF NOT EXISTS public.quiz_templates (
  id TEXT PRIMARY KEY,
  jlpt_level TEXT,
  skill_domain TEXT,
  lesson_scope TEXT,
  template_key TEXT NOT NULL,
  display_name_id TEXT,
  description_id TEXT,
  question_type TEXT,
  interaction_type TEXT,
  ui_component TEXT,
  source_dataset TEXT,
  source_entity_type TEXT,
  required_fields TEXT[],
  prompt_template_id TEXT,
  stem_template_jp TEXT,
  stem_template_id TEXT,
  answer_mode TEXT,
  choice_count INTEGER DEFAULT 4,
  allowed_response_format TEXT,
  case_sensitive BOOLEAN DEFAULT FALSE,
  normalize_whitespace BOOLEAN DEFAULT TRUE,
  normalize_nfkc BOOLEAN DEFAULT TRUE,
  normalize_kana BOOLEAN DEFAULT FALSE,
  allow_romaji BOOLEAN DEFAULT FALSE,
  requires_audio BOOLEAN DEFAULT FALSE,
  requires_image BOOLEAN DEFAULT FALSE,
  requires_drag_drop BOOLEAN DEFAULT FALSE,
  scoring_strategy TEXT,
  points INTEGER DEFAULT 1,
  partial_credit BOOLEAN DEFAULT FALSE,
  time_limit_seconds INTEGER DEFAULT 30,
  difficulty_min INTEGER DEFAULT 1,
  difficulty_max INTEGER DEFAULT 5,
  distractor_strategy TEXT,
  validator_key TEXT,
  feedback_template_id TEXT,
  hint_template_id TEXT,
  recommended_for_mvp BOOLEAN DEFAULT FALSE,
  is_jlpt_style BOOLEAN DEFAULT FALSE,
  used_in_daily_challenge BOOLEAN DEFAULT FALSE,
  tags TEXT[],
  display_order INTEGER DEFAULT 0,
  raw_data JSONB
);

-- 19. quiz_answer_schemas
CREATE TABLE IF NOT EXISTS public.quiz_answer_schemas (
  id TEXT PRIMARY KEY,
  question_type TEXT NOT NULL,
  interaction_type TEXT,
  answer_payload_schema JSONB,
  response_payload_schema JSONB,
  validator_key TEXT,
  scoring_strategy TEXT,
  normalization_rules TEXT,
  supports_partial_credit BOOLEAN DEFAULT FALSE,
  ui_notes_id TEXT,
  raw_data JSONB
);

-- 20. quiz_sections
CREATE TABLE IF NOT EXISTS public.quiz_sections (
  id TEXT PRIMARY KEY,
  jlpt_level TEXT,
  quiz_mode TEXT,
  section_key TEXT NOT NULL,
  display_name_id TEXT,
  description_id TEXT,
  template_pool TEXT[],
  question_count INTEGER DEFAULT 0,
  time_limit_seconds INTEGER DEFAULT 0,
  scoring_mode TEXT,
  score_max INTEGER DEFAULT 0,
  passing_hint_id TEXT,
  shuffle_questions BOOLEAN DEFAULT FALSE,
  shuffle_choices BOOLEAN DEFAULT FALSE,
  allow_review_after_submit BOOLEAN DEFAULT TRUE,
  requires_audio BOOLEAN DEFAULT FALSE,
  recommended_for_mvp BOOLEAN DEFAULT FALSE,
  raw_data JSONB
);

-- 21. lesson_roadmap_tree
CREATE TABLE IF NOT EXISTS public.lesson_roadmap_tree (
  id TEXT PRIMARY KEY,
  jlpt_level TEXT,
  tree_version TEXT,
  node_type TEXT NOT NULL,
  parent_id TEXT,
  path TEXT NOT NULL,
  slug TEXT,
  title_id TEXT,
  title_en TEXT,
  description_id TEXT,
  content_type TEXT,
  skill_domain TEXT,
  lesson_group TEXT,
  route_path TEXT,
  icon_key TEXT,
  estimated_minutes INTEGER DEFAULT 0,
  target_xp INTEGER DEFAULT 0,
  coin_reward INTEGER DEFAULT 0,
  difficulty_order INTEGER DEFAULT 0,
  unlock_order INTEGER DEFAULT 0,
  is_mvp BOOLEAN DEFAULT FALSE,
  is_required_for_n5 BOOLEAN DEFAULT FALSE,
  is_checkpoint BOOLEAN DEFAULT FALSE,
  checkpoint_type TEXT,
  completion_rule_key TEXT,
  completion_rule JSONB,
  primary_dataset_refs TEXT[],
  secondary_dataset_refs TEXT[],
  item_filter JSONB,
  quiz_section_id TEXT,
  srs_deck_key TEXT,
  prerequisite_mode TEXT,
  recommended_review_after_days INTEGER,
  tags TEXT[],
  display_order INTEGER DEFAULT 0,
  raw_data JSONB
);

-- 22. lesson_content_map
CREATE TABLE IF NOT EXISTS public.lesson_content_map (
  id TEXT PRIMARY KEY,
  lesson_id TEXT NOT NULL,
  lesson_title_id TEXT,
  map_type TEXT,
  dataset_ref TEXT,
  source_entity_type TEXT,
  filter JSONB,
  target_count INTEGER DEFAULT 0,
  required_count INTEGER DEFAULT 0,
  sort_strategy TEXT,
  selection_strategy TEXT,
  quiz_template_keys TEXT[],
  srs_card_type TEXT,
  display_mode TEXT,
  review_status TEXT,
  raw_data JSONB
);

-- 23. roadmap_milestones
CREATE TABLE IF NOT EXISTS public.roadmap_milestones (
  id TEXT PRIMARY KEY,
  jlpt_level TEXT,
  milestone_key TEXT NOT NULL,
  title_id TEXT,
  description_id TEXT,
  roadmap_phase_id TEXT,
  completion_rule_key TEXT,
  completion_rule JSONB,
  target_metric_key TEXT,
  target_value INTEGER DEFAULT 0,
  reward_xp INTEGER DEFAULT 0,
  reward_badge_key TEXT,
  unlock_next_phase_id TEXT,
  recommended_for_mvp BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0,
  raw_data JSONB
);

-- 24. srs_deck_configs
CREATE TABLE IF NOT EXISTS public.srs_deck_configs (
  id TEXT PRIMARY KEY,
  deck_key TEXT NOT NULL,
  display_name_id TEXT,
  description_id TEXT,
  content_domain TEXT,
  preset_key TEXT,
  parent_deck_key TEXT,
  source_dataset_refs TEXT[],
  card_template_keys TEXT[],
  new_cards_per_day INTEGER DEFAULT 20,
  max_reviews_per_day INTEGER DEFAULT 200,
  max_learning_cards_per_day INTEGER DEFAULT 25,
  target_retention DECIMAL(4,3) DEFAULT 0.9,
  priority_order INTEGER DEFAULT 0,
  introduce_new_cards_when_backlog_over BOOLEAN DEFAULT FALSE,
  backlog_review_threshold INTEGER DEFAULT 100,
  leech_threshold INTEGER DEFAULT 8,
  leech_action TEXT,
  sibling_bury_scope TEXT,
  allow_reverse_cards BOOLEAN DEFAULT FALSE,
  allow_typing_cards BOOLEAN DEFAULT FALSE,
  default_daily_target_cards INTEGER DEFAULT 50,
  unlock_lesson_dependency TEXT,
  recommended_for_mvp BOOLEAN DEFAULT FALSE,
  tags TEXT[],
  raw_data JSONB
);

-- 25. achievements
CREATE TABLE IF NOT EXISTS public.achievements (
  id TEXT PRIMARY KEY,
  achievement_key TEXT NOT NULL,
  category TEXT,
  tier TEXT,
  title_id TEXT,
  title_en TEXT,
  description_id TEXT,
  criteria_summary_id TEXT,
  trigger_rule_key TEXT,
  metric_key TEXT,
  comparator TEXT,
  threshold_value DECIMAL,
  threshold_unit TEXT,
  scope_key TEXT,
  repeatability TEXT,
  repeat_limit INTEGER,
  prerequisite_achievement_keys TEXT[],
  reward_xp INTEGER DEFAULT 0,
  reward_coins INTEGER DEFAULT 0,
  reward_item_key TEXT,
  badge_icon_key TEXT,
  title_reward_key TEXT,
  rarity TEXT,
  hidden_until_unlocked BOOLEAN DEFAULT FALSE,
  recommended_for_mvp BOOLEAN DEFAULT FALSE,
  open_badges_compatible BOOLEAN DEFAULT FALSE,
  open_badge_achievement_type TEXT,
  evidence_type TEXT,
  tags TEXT[],
  display_order INTEGER DEFAULT 0,
  raw_data JSONB
);

-- 26. achievement_triggers
CREATE TABLE IF NOT EXISTS public.achievement_triggers (
  id TEXT PRIMARY KEY,
  achievement_key TEXT NOT NULL,
  trigger_type TEXT,
  trigger_config JSONB,
  priority INTEGER DEFAULT 0,
  raw_data JSONB
);

-- 27. xp_levels
CREATE TABLE IF NOT EXISTS public.xp_levels (
  id TEXT PRIMARY KEY,
  level INTEGER NOT NULL,
  level_title_id TEXT,
  required_total_xp INTEGER DEFAULT 0,
  xp_to_next_level INTEGER DEFAULT 0,
  reward_coins INTEGER DEFAULT 0,
  reward_item_key TEXT,
  unlock_feature_keys TEXT[],
  daily_xp_soft_cap INTEGER DEFAULT 0,
  daily_xp_hard_cap INTEGER DEFAULT 0,
  recommended_new_cards_bonus INTEGER DEFAULT 0,
  badge_key TEXT,
  raw_data JSONB
);

-- 28. rewards
CREATE TABLE IF NOT EXISTS public.rewards (
  id TEXT PRIMARY KEY,
  reward_item_key TEXT NOT NULL,
  reward_type TEXT,
  display_name_id TEXT,
  description_id TEXT,
  unlock_condition_type TEXT,
  unlock_condition_key TEXT,
  cost_coins INTEGER DEFAULT 0,
  is_purchasable BOOLEAN DEFAULT FALSE,
  rarity TEXT,
  equippable_slot TEXT,
  effect_key TEXT,
  recommended_for_mvp BOOLEAN DEFAULT FALSE,
  raw_data JSONB
);

-- ============================================================
-- SECTION 8: BOOKMARKS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL CHECK (content_type IN ('vocabulary', 'kanji', 'grammar', 'kana')),
  content_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, content_type, content_id)
);

ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN CREATE POLICY "Users can view own bookmarks" ON public.bookmarks FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE POLICY "Users can insert own bookmarks" ON public.bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE POLICY "Users can delete own bookmarks" ON public.bookmarks FOR DELETE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON public.bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_content ON public.bookmarks(user_id, content_type, content_id);

-- ============================================================
-- SECTION 9: NOTES TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL CHECK (content_type IN ('vocabulary', 'kanji', 'grammar', 'kana', 'lesson')),
  content_id TEXT NOT NULL,
  title TEXT,
  body TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN CREATE POLICY "Users can view own notes" ON public.notes FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE POLICY "Users can insert own notes" ON public.notes FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE POLICY "Users can update own notes" ON public.notes FOR UPDATE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE POLICY "Users can delete own notes" ON public.notes FOR DELETE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS idx_notes_user_id ON public.notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_content ON public.notes(user_id, content_type, content_id);

-- ============================================================
-- SECTION 10: UTILITY FUNCTIONS & TRIGGERS
-- ============================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_progress_updated_at ON public.user_progress;
CREATE TRIGGER update_user_progress_updated_at BEFORE UPDATE ON public.user_progress FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_lesson_progress_updated_at ON public.lesson_progress;
CREATE TRIGGER update_lesson_progress_updated_at BEFORE UPDATE ON public.lesson_progress FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_srs_cards_updated_at ON public.user_srs_cards;
CREATE TRIGGER update_user_srs_cards_updated_at BEFORE UPDATE ON public.user_srs_cards FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_notes_updated_at ON public.notes;
CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON public.notes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- END OF SCHEMA
-- ============================================================

-- ============================================================
-- FIX: Enable public read access for all content tables
-- ============================================================
DO $$ 
DECLARE
  t text;
  tables text[] := ARRAY[
    'kana_characters', 'symbols', 'particles', 'grammar_points',
    'vocabulary', 'kanji', 'radicals', 'radical_variants',
    'kanji_radical_map', 'conjugation_rules', 'reading_passages',
    'reading_questions'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format('ALTER TABLE IF EXISTS public.%I ENABLE ROW LEVEL SECURITY;', t);
    EXECUTE format('DROP POLICY IF EXISTS "Allow public read access" ON public.%I;', t);
    EXECUTE format('CREATE POLICY "Allow public read access" ON public.%I FOR SELECT USING (true);', t);
  END LOOP;
END $$;
