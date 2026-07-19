-- Run in the Supabase SQL editor to create the waitlist table and allow
-- browser-only waitlist submissions.
-- Public users are insert-only: no select, update, or delete access.

create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  name text,
  company text,
  role text,
  contact text,
  presentation_type text,
  preferred_mode text,
  volume text,
  locale text,
  created_at timestamptz not null default now()
);

create unique index if not exists waitlist_email_key
on public.waitlist (lower(trim(email)));

alter table public.waitlist enable row level security;

drop policy if exists "Allow public waitlist inserts" on public.waitlist;

create policy "Allow public waitlist inserts"
on public.waitlist
for insert
to anon
with check (
  email is not null
  and length(trim(email)) between 3 and 320
);

grant usage on schema public to anon;
grant insert on public.waitlist to anon;
