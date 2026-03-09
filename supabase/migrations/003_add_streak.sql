-- =============================================================
-- Kinalyze v1 — Add streak tracking to profiles
-- Paste into: Supabase Dashboard → SQL Editor → Run
-- =============================================================

alter table public.profiles
  add column if not exists current_streak  integer not null default 0,
  add column if not exists longest_streak  integer not null default 0,
  add column if not exists last_session_date date;
