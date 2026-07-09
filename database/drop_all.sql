-- ============================================================
-- Learning Japan - DROP ALL TABLES & TYPES
-- ============================================================
-- Run this FIRST to wipe the old schema, then run supabase_schema.sql
-- WARNING: This deletes ALL data. Only use in development.
-- ============================================================

-- Drop triggers first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS update_user_progress_updated_at ON public.user_progress;
DROP TRIGGER IF EXISTS update_lesson_progress_updated_at ON public.lesson_progress;
DROP TRIGGER IF EXISTS update_user_srs_cards_updated_at ON public.user_srs_cards;

-- Drop functions
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;

-- Drop all content / seed tables
DROP TABLE IF EXISTS public.rewards CASCADE;
DROP TABLE IF EXISTS public.xp_levels CASCADE;
DROP TABLE IF EXISTS public.achievement_triggers CASCADE;
DROP TABLE IF EXISTS public.achievements CASCADE;
DROP TABLE IF EXISTS public.srs_deck_configs CASCADE;
DROP TABLE IF EXISTS public.roadmap_milestones CASCADE;
DROP TABLE IF EXISTS public.lesson_content_map CASCADE;
DROP TABLE IF EXISTS public.lesson_roadmap_tree CASCADE;
DROP TABLE IF EXISTS public.quiz_sections CASCADE;
DROP TABLE IF EXISTS public.quiz_answer_schemas CASCADE;
DROP TABLE IF EXISTS public.quiz_templates CASCADE;
DROP TABLE IF EXISTS public.reading_questions CASCADE;
DROP TABLE IF EXISTS public.reading_passages CASCADE;
DROP TABLE IF EXISTS public.example_sentences CASCADE;
DROP TABLE IF EXISTS public.calendar_time CASCADE;
DROP TABLE IF EXISTS public.counter_forms CASCADE;
DROP TABLE IF EXISTS public.counters CASCADE;
DROP TABLE IF EXISTS public.numbers CASCADE;
DROP TABLE IF EXISTS public.conjugation_rules CASCADE;
DROP TABLE IF EXISTS public.kanji_radical_map CASCADE;
DROP TABLE IF EXISTS public.radical_variants CASCADE;
DROP TABLE IF EXISTS public.radicals CASCADE;
DROP TABLE IF EXISTS public.kanji CASCADE;
DROP TABLE IF EXISTS public.vocabulary CASCADE;
DROP TABLE IF EXISTS public.grammar_points CASCADE;
DROP TABLE IF EXISTS public.particles CASCADE;
DROP TABLE IF EXISTS public.symbols CASCADE;
DROP TABLE IF EXISTS public.kana_characters CASCADE;

-- Drop user/activity tables
DROP TABLE IF EXISTS public.user_achievements CASCADE;
DROP TABLE IF EXISTS public.achievement_definitions CASCADE;
DROP TABLE IF EXISTS public.quiz_results CASCADE;
DROP TABLE IF EXISTS public.lesson_progress CASCADE;
DROP TABLE IF EXISTS public.daily_stats CASCADE;
DROP TABLE IF EXISTS public.user_progress CASCADE;
DROP TABLE IF EXISTS public.srs_review_log CASCADE;
DROP TABLE IF EXISTS public.user_srs_cards CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Drop enum types
DROP TYPE IF EXISTS achievement_category CASCADE;
DROP TYPE IF EXISTS lesson_type CASCADE;
DROP TYPE IF EXISTS quiz_type CASCADE;
DROP TYPE IF EXISTS srs_rating CASCADE;
DROP TYPE IF EXISTS srs_state CASCADE;
DROP TYPE IF EXISTS script_type CASCADE;
DROP TYPE IF EXISTS jlpt_level CASCADE;
DROP TYPE IF EXISTS part_of_speech CASCADE;
DROP TYPE IF EXISTS question_type CASCADE;

-- Done
SELECT 'All tables and types dropped successfully.' AS status;
