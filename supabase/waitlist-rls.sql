-- Run in the Supabase SQL editor to allow browser-only waitlist submissions.
-- This keeps public users insert-only: no select, update, or delete access.

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
