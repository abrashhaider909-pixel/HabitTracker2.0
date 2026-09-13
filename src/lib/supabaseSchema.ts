export const SUPABASE_SQL_SCHEMA = `-- HabitPulse SaaS PostgreSQL Schema for Supabase
-- Run this in your Supabase Dashboard -> SQL Editor

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Habits & Daily Tasks Table
CREATE TABLE IF NOT EXISTS public.habits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID DEFAULT auth.uid(),
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL CHECK (category IN ('education', 'social', 'religion', 'health', 'career')),
    is_daily BOOLEAN DEFAULT true,
    completed_dates TEXT[] DEFAULT '{}',
    target_duration_minutes INT DEFAULT 30,
    time_of_day TEXT DEFAULT 'anytime',
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
    streak INT DEFAULT 0,
    best_streak INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Financial Transactions Table (Income, Expenses, Savings)
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID DEFAULT auth.uid(),
    type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'savings')),
    amount NUMERIC(12, 2) NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_method TEXT DEFAULT 'Card',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. 5D AI Life Judgement Evaluations Table
CREATE TABLE IF NOT EXISTS public.evaluations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID DEFAULT auth.uid(),
    date DATE NOT NULL,
    overall_score INT NOT NULL,
    grade TEXT NOT NULL,
    verdict TEXT NOT NULL,
    dimensions JSONB NOT NULL,
    action_items TEXT[] DEFAULT '{}',
    stoic_quote TEXT,
    ai_generated BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, date)
);

-- 5. Software Engineering Career Milestones Table
CREATE TABLE IF NOT EXISTS public.career_milestones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID DEFAULT auth.uid(),
    pillar TEXT NOT NULL CHECK (pillar IN ('dsa', 'system_design', 'fullstack', 'cloud_devops')),
    level TEXT NOT NULL CHECK (level IN ('junior', 'mid', 'senior', 'lead')),
    title TEXT NOT NULL,
    description TEXT,
    topics TEXT[] DEFAULT '{}',
    completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMPTZ,
    target_count INT DEFAULT 1,
    current_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Enable Row Level Security (RLS)
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_milestones ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies (Allow public demo access or authenticated user access)
CREATE POLICY "Public full access for demo" ON public.habits FOR ALL USING (true);
CREATE POLICY "Public full access for demo" ON public.transactions FOR ALL USING (true);
CREATE POLICY "Public full access for demo" ON public.evaluations FOR ALL USING (true);
CREATE POLICY "Public full access for demo" ON public.career_milestones FOR ALL USING (true);

-- Indexing for fast queries
CREATE INDEX IF NOT EXISTS idx_habits_category ON public.habits (category);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON public.transactions (date);
CREATE INDEX IF NOT EXISTS idx_evaluations_date ON public.evaluations (date);
`;
