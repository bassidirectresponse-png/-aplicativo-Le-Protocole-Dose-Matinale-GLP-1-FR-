-- Schema completo do app Dose Matinale GLP-1
-- Cole tudo no SQL Editor do Supabase e clique em RUN

-- ============================================================
-- 00001_initial_schema.sql
-- ============================================================
-- Initial Schema for Pink Salt Burn PWA

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Table: user_profiles
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  current_weight NUMERIC NOT NULL,
  target_weight NUMERIC NOT NULL,
  height NUMERIC NOT NULL,
  age INTEGER NOT NULL,
  previous_diets TEXT NOT NULL,
  preferred_language TEXT DEFAULT 'en',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: weight_entries
CREATE TABLE IF NOT EXISTS public.weight_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  weight NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security (RLS) Settings
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weight_entries ENABLE ROW LEVEL SECURITY;

-- Policies for user_profiles
CREATE POLICY "Users can view own profile" 
ON public.user_profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
ON public.user_profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON public.user_profiles FOR UPDATE 
USING (auth.uid() = id);

-- Policies for weight_entries
CREATE POLICY "Users can view own weight entries" 
ON public.weight_entries FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own weight entries" 
ON public.weight_entries FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own weight entries" 
ON public.weight_entries FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own weight entries" 
ON public.weight_entries FOR DELETE 
USING (auth.uid() = user_id);


-- ============================================================
-- 00002_recipes_schema.sql
-- ============================================================
-- Migration for Recipes Feature
-- Table: user_recipe_views

CREATE TABLE IF NOT EXISTS public.user_recipe_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  recipe_id TEXT NOT NULL,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_favourite BOOLEAN DEFAULT FALSE,
  UNIQUE(user_id, recipe_id)
);

-- Row Level Security (RLS) Settings
ALTER TABLE public.user_recipe_views ENABLE ROW LEVEL SECURITY;

-- Policies for user_recipe_views
CREATE POLICY "Users can view own recipe views" 
ON public.user_recipe_views FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recipe views" 
ON public.user_recipe_views FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recipe views" 
ON public.user_recipe_views FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own recipe views" 
ON public.user_recipe_views FOR DELETE 
USING (auth.uid() = user_id);


-- ============================================================
-- 00003_push_notifications.sql
-- ============================================================
create table if not exists public.push_subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.user_profiles(id) on delete cascade not null,
  endpoint text not null unique,
  subscription jsonb not null,
  user_agent text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.push_subscriptions enable row level security;

drop policy if exists "Users can view own push subscriptions" on public.push_subscriptions;
create policy "Users can view own push subscriptions"
  on public.push_subscriptions for select
  using (auth.uid() = user_id);

drop policy if exists "Users can create own push subscriptions" on public.push_subscriptions;
create policy "Users can create own push subscriptions"
  on public.push_subscriptions for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own push subscriptions" on public.push_subscriptions;
create policy "Users can update own push subscriptions"
  on public.push_subscriptions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own push subscriptions" on public.push_subscriptions;
create policy "Users can delete own push subscriptions"
  on public.push_subscriptions for delete
  using (auth.uid() = user_id);

create index if not exists idx_push_subscriptions_user_id on public.push_subscriptions(user_id);
create index if not exists idx_push_subscriptions_endpoint on public.push_subscriptions(endpoint);


-- ============================================================
-- 00004_create_profile_on_signup.sql
-- ============================================================
create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_profiles (
    id,
    email,
    full_name,
    current_weight,
    target_weight,
    height,
    age,
    previous_diets,
    preferred_language
  )
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'full_name', 'Cliente Pink Salt'),
    coalesce((new.raw_user_meta_data->>'current_weight')::numeric, 75),
    coalesce((new.raw_user_meta_data->>'target_weight')::numeric, 65),
    coalesce((new.raw_user_meta_data->>'height')::numeric, 165),
    coalesce((new.raw_user_meta_data->>'age')::integer, 35),
    coalesce(new.raw_user_meta_data->>'previous_diets', 'none'),
    coalesce(new.raw_user_meta_data->>'preferred_language', 'fr')
  )
  on conflict (id) do update
  set
    email = excluded.email,
    full_name = excluded.full_name,
    current_weight = excluded.current_weight,
    target_weight = excluded.target_weight,
    height = excluded.height,
    age = excluded.age,
    previous_diets = excluded.previous_diets,
    preferred_language = excluded.preferred_language;

  insert into public.weight_entries (user_id, date, weight)
  values (
    new.id,
    current_date,
    coalesce((new.raw_user_meta_data->>'current_weight')::numeric, 75)
  )
  on conflict do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_create_profile on auth.users;

create trigger on_auth_user_created_create_profile
  after insert on auth.users
  for each row execute function public.handle_new_user_profile();


-- ============================================================
-- 00005_course_progress.sql
-- ============================================================
-- Table: course_progress (progression des cours vidéo)
create table if not exists public.course_progress (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.user_profiles(id) on delete cascade not null,
  step_number integer not null,
  status text check (status in ('not_started', 'in_progress', 'completed')) default 'not_started' not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, step_number)
);

alter table public.course_progress enable row level security;

drop policy if exists "Users can view own course progress" on public.course_progress;
create policy "Users can view own course progress"
  on public.course_progress for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own course progress" on public.course_progress;
create policy "Users can insert own course progress"
  on public.course_progress for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update own course progress" on public.course_progress;
create policy "Users can update own course progress"
  on public.course_progress for update using (auth.uid() = user_id);

create index if not exists idx_course_progress_user_id on public.course_progress(user_id);


