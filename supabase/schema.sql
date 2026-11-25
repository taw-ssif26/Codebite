-- =====================================================================
-- Codezy Christmas CodeBite 1.0 — Supabase schema
-- Run this whole file once in: Supabase Dashboard > SQL Editor > New query
-- Then edit the SUPER-ADMIN email at the bottom and run that statement.
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------- Tables ---------------------------------------------------

create table if not exists public.site_settings (
  key   text primary key,
  value jsonb not null default '""'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.admins (
  email      text primary key,
  role       text not null default 'admin' check (role in ('admin','super_admin')),
  invited_by text,
  created_at timestamptz not null default now()
);

create table if not exists public.instructors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text not null default '',
  bio text not null default '',
  photo_url text,
  stack text[] not null default '{}',
  teaches text not null default '',
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.segments (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  starts_at timestamptz,
  duration text not null default '',
  tags text[] not null default '{}',
  prerequisites text not null default 'None — Zero to One',
  tools text[] not null default '{}',
  outcomes text not null default '',
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.notices (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null default '',
  priority text not null default 'GENERAL' check (priority in ('URGENT','SCHEDULE','GENERAL')),
  featured_on_home boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.resources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  session text not null default 'General',
  kind text not null check (kind in ('pdf','jpg','drive','url','video')),
  url text,        -- external link (drive / url / video)
  file_path text,  -- path inside the private "resources" bucket (pdf / jpg / uploaded video)
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  student_code text unique,
  full_name text not null,
  phone text not null,
  email text not null unique,
  grade text not null check (grade in ('school_6_8','school_9_10','college_hsc','university')),
  institution text not null,
  address text not null,
  experience text not null check (experience in ('zero','basic','built')),
  preferred_field text check (preferred_field in ('web','ai','cp','game','cyber','undecided')),
  photo_path text,
  consent boolean not null default false,
  verified_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.email_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  subject text not null,
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists students_grade_idx on public.students(grade);
create index if not exists students_created_idx on public.students(created_at desc);

-- ---------- Helper functions ----------------------------------------

-- Returns 'super_admin' | 'admin' | null for the signed-in user (matched by JWT email).
create or replace function public.admin_role()
returns text language sql stable security definer set search_path = public as $$
  select role from public.admins
  where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  limit 1;
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select public.admin_role() is not null;
$$;

create or replace function public.is_super_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select public.admin_role() = 'super_admin';
$$;

create or replace function public.is_student()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.students where user_id = auth.uid());
$$;

-- Student ID generator: CB1-XXXX (no ambiguous characters). SECURITY DEFINER so the
-- collision check can see every row regardless of RLS.
create or replace function public.gen_student_code()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  alphabet text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  candidate text;
  i int;
begin
  if tg_op = 'INSERT' then
    loop
      candidate := 'CB1-';
      for i in 1..4 loop
        candidate := candidate || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
      end loop;
      exit when not exists (select 1 from public.students where student_code = candidate);
    end loop;
    new.student_code := candidate;
  end if;
  return new;
end $$;

drop trigger if exists students_gen_code on public.students;
create trigger students_gen_code before insert on public.students
  for each row execute function public.gen_student_code();

-- Students may not change identity columns; admins may.
create or replace function public.students_guard()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  new.updated_at := now();
  if not public.is_admin() then
    new.user_id := old.user_id;
    new.student_code := old.student_code;
    new.email := old.email;
    new.verified_at := old.verified_at;
  end if;
  return new;
end $$;

drop trigger if exists students_guard_trg on public.students;
create trigger students_guard_trg before update on public.students
  for each row execute function public.students_guard();

-- Public, privacy-minimal view of a pass (used by the QR landing page /pass/[id]).
-- Deliberately exposes: abbreviated name, grade, verified flag. No photo, phone, email, institution.
create or replace function public.get_public_pass(sid text)
returns table (student_code text, display_name text, grade text, verified_at timestamptz)
language sql stable security definer set search_path = public as $$
  select s.student_code,
         split_part(s.full_name, ' ', 1) ||
           case when position(' ' in trim(s.full_name)) > 0
                then ' ' || left(regexp_replace(trim(s.full_name), '^.*\s', ''), 1) || '.'
                else '' end,
         s.grade,
         s.verified_at
  from public.students s
  where s.student_code = upper(sid)
  limit 1;
$$;
grant execute on function public.get_public_pass(text) to anon, authenticated;

-- ---------- Row Level Security --------------------------------------

alter table public.site_settings   enable row level security;
alter table public.admins          enable row level security;
alter table public.instructors     enable row level security;
alter table public.segments        enable row level security;
alter table public.notices         enable row level security;
alter table public.resources       enable row level security;
alter table public.students        enable row level security;
alter table public.email_templates enable row level security;

-- Public read, admin write
do $$
declare t text;
begin
  foreach t in array array['site_settings','instructors','segments','notices'] loop
    execute format('drop policy if exists "%1$s public read" on public.%1$s', t);
    execute format('create policy "%1$s public read" on public.%1$s for select using (true)', t);
    execute format('drop policy if exists "%1$s admin write" on public.%1$s', t);
    execute format('create policy "%1$s admin write" on public.%1$s for all using (public.is_admin()) with check (public.is_admin())', t);
  end loop;
end $$;

-- Resources: registered students + admins read; admins write
drop policy if exists "resources student read" on public.resources;
create policy "resources student read" on public.resources for select
  using (public.is_student() or public.is_admin());
drop policy if exists "resources admin write" on public.resources;
create policy "resources admin write" on public.resources for all
  using (public.is_admin()) with check (public.is_admin());

-- Students
drop policy if exists "students self read" on public.students;
create policy "students self read" on public.students for select
  using (user_id = auth.uid() or public.is_admin());
drop policy if exists "students self insert" on public.students;
create policy "students self insert" on public.students for insert
  with check (user_id = auth.uid() and lower(email) = lower(coalesce(auth.jwt() ->> 'email','')));
drop policy if exists "students self update" on public.students;
create policy "students self update" on public.students for update
  using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());
drop policy if exists "students admin delete" on public.students;
create policy "students admin delete" on public.students for delete
  using (public.is_admin());

-- Admins table: any admin can read the list; only the super-admin can change it
drop policy if exists "admins read" on public.admins;
create policy "admins read" on public.admins for select using (public.is_admin());
drop policy if exists "admins super write" on public.admins;
create policy "admins super write" on public.admins for all
  using (public.is_super_admin()) with check (public.is_super_admin());

-- Email templates: admin only
drop policy if exists "templates admin" on public.email_templates;
create policy "templates admin" on public.email_templates for all
  using (public.is_admin()) with check (public.is_admin());

-- ---------- Storage --------------------------------------------------
-- instructors    : PUBLIC  (portraits)
-- student-photos : PRIVATE (face photos; owner folder = auth.uid(), admins can read)
-- resources      : PRIVATE (PDF/JPG/video for registered students; served via signed URLs)

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('instructors',    'instructors',    true,  5242880,  array['image/jpeg','image/png','image/webp']),
  ('student-photos', 'student-photos', false, 2097152,  array['image/jpeg','image/png','image/webp']),
  ('resources',      'resources',      false, 52428800, null)
on conflict (id) do nothing;

drop policy if exists "instructors public read" on storage.objects;
create policy "instructors public read" on storage.objects for select
  using (bucket_id = 'instructors');
drop policy if exists "instructors admin write" on storage.objects;
create policy "instructors admin write" on storage.objects for all
  using (bucket_id = 'instructors' and public.is_admin())
  with check (bucket_id = 'instructors' and public.is_admin());

drop policy if exists "photos owner all" on storage.objects;
create policy "photos owner all" on storage.objects for all
  using (bucket_id = 'student-photos' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'student-photos' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "photos admin read" on storage.objects;
create policy "photos admin read" on storage.objects for select
  using (bucket_id = 'student-photos' and public.is_admin());

drop policy if exists "resources student read" on storage.objects;
create policy "resources student read" on storage.objects for select
  using (bucket_id = 'resources' and (public.is_student() or public.is_admin()));
drop policy if exists "resources admin write" on storage.objects;
create policy "resources admin write" on storage.objects for all
  using (bucket_id = 'resources' and public.is_admin())
  with check (bucket_id = 'resources' and public.is_admin());

-- ---------- Seed content (safe placeholders — edit in /admin) --------

insert into public.email_templates (name, subject, body) values
('Event reminder', 'See you soon, {{name}} — CodeBite 1.0',
 E'Hi {{name}},\n\nCodezy Christmas CodeBite 1.0 is almost here. Your Student ID is {{student_id}}.\n\nBring your pass: {{profile_url}}\n\nNo experience needed — see you in the lab.'),
('General notice', 'An update for {{grade}} students',
 E'Hi {{name}},\n\nWe have an update for {{institution}} students.\n\n(Write your message here.)\n\n— Team Codezy')
on conflict do nothing;

-- ---------- SUPER-ADMIN (EDIT THE EMAIL, THEN RUN) -------------------
insert into public.admins (email, role) values ('you@example.com', 'super_admin')
on conflict (email) do update set role = 'super_admin';
