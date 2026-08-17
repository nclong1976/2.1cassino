-- ====================================================================
-- SUPABASE DATABASE SCHEMA FOR 2.1 CASSINO APP
-- Run this SQL in your Supabase Project SQL Editor (https://app.supabase.com)
-- ====================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS PROFILE TABLE
CREATE TABLE IF NOT EXISTS public.users_profile (
        id TEXT PRIMARY KEY,
        account TEXT UNIQUE NOT NULL,
        email TEXT,
        full_name TEXT,
        password_hash TEXT,
        role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
        balance NUMERIC(14, 2) DEFAULT 0.00 CHECK (balance >= 0),
        turnover NUMERIC(14, 2) DEFAULT 0,
        profit NUMERIC(14, 2) DEFAULT 0,
        pay_password TEXT,
        locked BOOLEAN DEFAULT FALSE,
        bank_info JSONB DEFAULT '{}'::jsonb,
        phone TEXT,
        admin_note TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
    );

-- 2. TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS public.transactions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES public.users_profile(id) ON DELETE CASCADE,
        type TEXT NOT NULL, -- 'ADMIN_DEPOSIT', 'ADMIN_WITHDRAW', 'DEPOSIT', 'WITHDRAW', 'GAME_WIN', 'GAME_BET'
    amount NUMERIC(14, 2) NOT NULL,
        status TEXT DEFAULT 'completed', -- 'pending', 'completed', 'rejected', 'failed'
    method TEXT DEFAULT 'System',
        reason TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
    );

-- 3. WITHDRAW REQUESTS TABLE
CREATE TABLE IF NOT EXISTS public.withdraw_requests (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES public.users_profile(id) ON DELETE CASCADE,
        account TEXT NOT NULL,
        full_name TEXT,
        amount NUMERIC(14, 2) NOT NULL,
        bank_info JSONB DEFAULT '{}'::jsonb,
        status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
    );

-- 4. GAME BETS TABLE
CREATE TABLE IF NOT EXISTS public.game_bets (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES public.users_profile(id) ON DELETE CASCADE,
        game_type TEXT NOT NULL,
        amount NUMERIC(14, 2) NOT NULL,
        payout NUMERIC(14, 2) DEFAULT 0,
        status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'win', 'loss', 'cancelled')),
        details JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ DEFAULT NOW()
    );

-- 5. CHAT MESSAGES TABLE (Realtime Chat)
CREATE TABLE IF NOT EXISTS public.chat_messages (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        username TEXT NOT NULL,
        message TEXT NOT NULL,
        avatar TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
    );

-- 6. BANNERS TABLE
CREATE TABLE IF NOT EXISTS public.banners (
        id TEXT PRIMARY KEY,
        title TEXT,
        image_url TEXT NOT NULL,
        link TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        display_order INT DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW()
    );

-- INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_users_profile_account ON public.users_profile(account);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_withdraw_requests_status ON public.withdraw_requests(status);
CREATE INDEX IF NOT EXISTS idx_game_bets_user_id ON public.game_bets(user_id);
CREATE INDEX IF NOT EXISTS idx_game_bets_created_at ON public.game_bets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON public.chat_messages(created_at DESC);

-- SEED DEFAULT ADMIN USERS IF NOT EXISTS
INSERT INTO public.users_profile (id, account, full_name, role, balance, pay_password, password_hash)
VALUES 
    ('u_super_admin', 'leo1102', 'Super Admin', 'super_admin', 1000000000.00, '141219', '141219'),
    ('u_admin_default', 'admin', 'Quản trị viên', 'admin', 1000000000.00, '121212', '121212')
ON CONFLICT (account) DO NOTHING;

-- DISABLE RLS FOR EASE OF FRONTEND ACCESS (or grant full public access for demo/development)
ALTER TABLE public.users_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdraw_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_bets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;

-- PERMISSIVE RLS POLICIES FOR CLIENT-SIDE APP ACCESS
DROP POLICY IF EXISTS "Allow public read/write users_profile" ON public.users_profile;
DROP POLICY IF EXISTS "Allow public read/write transactions" ON public.transactions;
DROP POLICY IF EXISTS "Allow public read/write withdraw_requests" ON public.withdraw_requests;
DROP POLICY IF EXISTS "Allow public read/write game_bets" ON public.game_bets;
DROP POLICY IF EXISTS "Allow public read/write chat_messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Allow public read/write banners" ON public.banners;

CREATE POLICY "Allow public read/write users_profile" ON public.users_profile FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write transactions" ON public.transactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write withdraw_requests" ON public.withdraw_requests FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write game_bets" ON public.game_bets FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write chat_messages" ON public.chat_messages FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write banners" ON public.banners FOR ALL USING (true) WITH CHECK (true);

-- ENABLE SUPABASE REALTIME REPLICATION FOR CHAT & TRANSACTIONS
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime FOR TABLE public.chat_messages, public.users_profile, public.transactions, public.withdraw_requests, public.banners;
COMMIT;
