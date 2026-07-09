-- ============================================================
-- FIX: Update script_type enum to support all CardTypes
-- Run in: Supabase Dashboard > SQL Editor
-- ============================================================

-- Postgres 12+ supports ADD VALUE IF NOT EXISTS
ALTER TYPE public.script_type ADD VALUE IF NOT EXISTS 'vocabulary';
ALTER TYPE public.script_type ADD VALUE IF NOT EXISTS 'grammar';

-- Verification: check the enum values
SELECT 
  n.nspname AS schema,
  t.typname AS type,
  e.enumlabel AS value
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
WHERE t.typname = 'script_type';
