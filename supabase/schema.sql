-- ============================================
-- SPORT PLANNER – Schéma Supabase PostgreSQL
-- À coller dans l'éditeur SQL de Supabase
-- ============================================

-- Table séances
create table public.sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  date date not null,
  type text not null, -- 'circuit1' | 'circuit2' | 'circuit3' | 'insanity' | 'rest' | 'custom'
  label text,
  done boolean default false,
  intensity int check (intensity between 1 and 5),
  note text,
  duration_min int,
  created_at timestamptz default now()
);

-- Table poids
create table public.weight_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  date date not null,
  weight_kg numeric(5,2) not null,
  created_at timestamptz default now(),
  unique(user_id, date)
);

-- Table profil (objectifs)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  display_name text,
  goal_sessions_per_month int default 16,
  goal_weight_kg numeric(5,2),
  start_weight_kg numeric(5,2),
  created_at timestamptz default now()
);

-- RLS : chaque user ne voit que ses données
alter table public.sessions enable row level security;
alter table public.weight_logs enable row level security;
alter table public.profiles enable row level security;

create policy "sessions: user owns" on public.sessions
  for all using (auth.uid() = user_id);

create policy "weight_logs: user owns" on public.weight_logs
  for all using (auth.uid() = user_id);

create policy "profiles: user owns" on public.profiles
  for all using (auth.uid() = id);

-- Trigger: créer un profil automatiquement à l'inscription
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
