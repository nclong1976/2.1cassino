-- ====================================================================
-- MIGRATION 002: Enable cross-device sync for balance/turnover/profit
-- Run this once in your Supabase Project SQL Editor
-- (https://app.supabase.com -> SQL Editor -> New query -> paste -> Run)
--
-- WHY: The app was only saving balance, bet history (turnover/profit)
-- to the browser's localStorage. Logging in on a second device read the
-- user row from Supabase, which never had these fields updated, so the
-- device showed an empty/reset account. This migration adds the missing
-- columns so the app (after the accompanying code fix) can keep every
-- device in sync through Supabase instead of local-only storage.
-- ====================================================================

ALTER TABLE public.users_profile
  ADD COLUMN IF NOT EXISTS turnover NUMERIC(14, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS profit NUMERIC(14, 2) DEFAULT 0;

-- game_bets already existed in schema.sql but was never written to by the
-- frontend. Make sure status also accepts the values the app now sends.
ALTER TABLE public.game_bets
  DROP CONSTRAINT IF EXISTS game_bets_status_check;

ALTER TABLE public.game_bets
  ADD CONSTRAINT game_bets_status_check
  CHECK (status IN ('pending', 'win', 'loss', 'cancelled'));

CREATE INDEX IF NOT EXISTS idx_game_bets_user_id ON public.game_bets(user_id);
CREATE INDEX IF NOT EXISTS idx_game_bets_created_at ON public.game_bets(created_at DESC);
