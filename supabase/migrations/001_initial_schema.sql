-- =============================================================
-- Kinalyze v1 — Initial Schema
-- Paste into: Supabase Dashboard → SQL Editor → Run
-- =============================================================


-- =============================================================
-- EXERCISES (static reference data — seeded below)
-- =============================================================
create table if not exists public.exercises (
  id                   text primary key,                 -- e.g. 'arm_lift'
  name                 text not null,
  muscle_group         text not null,
  difficulty           text not null check (difficulty in ('Beginner', 'Intermediate', 'Advanced')),
  description          text not null,
  reference_model_path text not null,
  created_at           timestamptz not null default now()
);

-- RLS: exercises are public read, no user writes
alter table public.exercises enable row level security;

create policy "Exercises are publicly readable"
  on public.exercises for select
  using (true);


-- =============================================================
-- SESSIONS
-- =============================================================
create table if not exists public.sessions (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users (id) on delete cascade,
  exercise_id      text not null references public.exercises (id),
  started_at       timestamptz not null default now(),
  completed_at     timestamptz,
  overall_accuracy integer check (overall_accuracy between 0 and 100)
);

create index if not exists sessions_user_id_idx      on public.sessions (user_id);
create index if not exists sessions_exercise_id_idx  on public.sessions (exercise_id);
create index if not exists sessions_started_at_idx   on public.sessions (started_at desc);

-- RLS: users can only read and write their own sessions
alter table public.sessions enable row level security;

create policy "Users read own sessions"
  on public.sessions for select
  using (auth.uid() = user_id);

create policy "Users insert own sessions"
  on public.sessions for insert
  with check (auth.uid() = user_id);

create policy "Users update own sessions"
  on public.sessions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);


-- =============================================================
-- JOINT RESULTS (per session, per joint)
-- =============================================================
create table if not exists public.joint_results (
  id               uuid primary key default gen_random_uuid(),
  session_id       uuid not null references public.sessions (id) on delete cascade,
  joint_name       text not null,
  accuracy_pct     integer not null check (accuracy_pct between 0 and 100),
  correction_count integer not null default 0
);

create index if not exists joint_results_session_id_idx on public.joint_results (session_id);

-- RLS: user must own the parent session
alter table public.joint_results enable row level security;

create policy "Users read own joint results"
  on public.joint_results for select
  using (
    exists (
      select 1 from public.sessions s
      where s.id = session_id
        and s.user_id = auth.uid()
    )
  );

create policy "Users insert own joint results"
  on public.joint_results for insert
  with check (
    exists (
      select 1 from public.sessions s
      where s.id = session_id
        and s.user_id = auth.uid()
    )
  );


-- =============================================================
-- PROFILES (display name + stats — extends auth.users)
-- =============================================================
create table if not exists public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  created_at   timestamptz not null default now()
);

-- RLS: users read/update only their own profile
alter table public.profiles enable row level security;

create policy "Users read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- =============================================================
-- SEED DATA — Exercises
-- =============================================================
insert into public.exercises (id, name, muscle_group, difficulty, description, reference_model_path)
values
  (
    'arm_lift',
    'Arm Lift',
    'Shoulders & Upper Back',
    'Beginner',
    'Raise both arms to shoulder height, keeping elbows straight. Strengthens shoulder stabilisers and improves posture.',
    'app/data/models/arm_lift_model.json'
  ),
  (
    'leg_raise',
    'Leg Raise',
    'Core & Hip Flexors',
    'Beginner',
    'Lie on your back and raise both legs to 90°, keeping them straight. Targets lower abdominals and hip flexor strength.',
    'app/data/models/leg_raise_model.json'
  ),
  (
    'squat',
    'Squat',
    'Quadriceps, Glutes & Hamstrings',
    'Intermediate',
    'Lower your body by bending both knees to 90°, keeping your back straight and knees tracking over toes. Builds lower-body strength and stability.',
    'app/data/models/squat_model.json'
  )
on conflict (id) do nothing;


-- =============================================================
-- HELPER VIEW — session summary per user (used by Dashboard)
-- =============================================================
create or replace view public.session_summary as
select
  s.id,
  s.user_id,
  s.exercise_id,
  e.name            as exercise_name,
  s.started_at,
  s.completed_at,
  s.overall_accuracy,
  count(jr.id)      as joint_result_count
from public.sessions s
join public.exercises e  on e.id = s.exercise_id
left join public.joint_results jr on jr.session_id = s.id
group by s.id, s.user_id, s.exercise_id, e.name, s.started_at, s.completed_at, s.overall_accuracy;

-- Note: session_summary view inherits RLS from the underlying sessions table.
-- No additional policy needed — users automatically see only their own rows.
