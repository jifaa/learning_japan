# Database Setup Guide

This directory contains the Supabase database schema and setup instructions.

## Files

| File | Description |
|------|-------------|
| `supabase_schema.sql` | Complete database schema for the Japanese learning MVP |

## Prerequisites

1. A Supabase project (create at [supabase.com](https://supabase.com))
2. Access to your Supabase SQL Editor

## Setup Instructions

### Step 1: Access Supabase SQL Editor

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Click on **SQL Editor** in the left sidebar
4. Click **New Query**

### Step 2: Run the Schema

1. Copy the contents of `supabase_schema.sql`
2. Paste into the SQL Editor
3. Click **Run** (or press `Cmd/Ctrl + Enter`)

The schema will create:
- Enum types (JLPT levels, SRS states, quiz types, etc.)
- User tables with Row Level Security (RLS)
- Public content tables (vocabulary, grammar, kanji, etc.)
- RLS policies protecting user data
- Auto-creation triggers for user profiles

### Step 3: Verify Setup

Run this query to verify tables were created:

```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

You should see:
- `profiles`
- `user_srs_cards`
- `srs_review_log`
- `user_progress`
- `daily_stats`
- `lesson_progress`
- `quiz_results`
- `user_achievements`
- `achievement_definitions`
- `vocabulary`
- `grammar_points`
- `kanji_characters`
- `kana_characters`
- `particles`
- `reading_passages`

### Step 4: Verify RLS

Check that RLS is enabled:

```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

All user tables should have `rowsecurity = true`.

## Database Architecture

### Public Tables (Content)

These tables contain learning content and are readable by all authenticated users:

- `vocabulary` - JLPT vocabulary items
- `grammar_points` - Grammar patterns
- `kanji_characters` - Kanji with readings and meanings
- `kana_characters` - Hiragana and katakana
- `particles` - Japanese particles
- `reading_passages` - Reading comprehension texts
- `achievement_definitions` - Achievement badge definitions

### User-Protected Tables

These tables contain user data and are protected by RLS:

- `profiles` - User profiles (extends Supabase auth)
- `user_srs_cards` - Spaced repetition card progress
- `srs_review_log` - SRS review history
- `user_progress` - XP, levels, streaks
- `daily_stats` - Daily activity tracking
- `lesson_progress` - Lesson completion tracking
- `quiz_results` - Quiz attempt history
- `user_achievements` - Earned achievements

## Row Level Security (RLS)

All user data is protected by Supabase Row Level Security. This means:

- Users can only see their own data
- Service role key bypasses RLS (use carefully!)
- Anon key respects RLS policies

## Environment Variables

Add these to your `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DATABASE_URL=postgresql://postgres:password@db.xxx.supabase.co:5432/postgres
```

## Next Steps

1. Import seed data from `/data/seed/*.csv`
2. Test authentication flow
3. Implement lesson content loading
4. Build SRS card review system

## Troubleshooting

### "permission denied" errors

Make sure you're authenticated in Supabase and have admin access.

### Schema already exists

Drop existing tables first (DANGER - this deletes all data):

```sql
DROP TABLE IF EXISTS 
  reading_passages,
  particles,
  kana_characters,
  kanji_characters,
  grammar_points,
  vocabulary,
  achievement_definitions,
  user_achievements,
  quiz_results,
  lesson_progress,
  daily_stats,
  user_progress,
  srs_review_log,
  user_srs_cards,
  profiles
CASCADE;
```

Then re-run the schema.
