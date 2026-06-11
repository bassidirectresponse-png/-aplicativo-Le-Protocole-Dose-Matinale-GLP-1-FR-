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
