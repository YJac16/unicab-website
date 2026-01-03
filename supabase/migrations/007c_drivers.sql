-- =========================
-- 007c_DRIVERS
-- =========================

create table if not exists public.drivers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users(id) on delete cascade,
  name text not null,
  phone text,
  license_number text,
  active boolean default true,
  created_at timestamptz default now()
);

alter table public.drivers enable row level security;

-- Drivers see their own record
create policy "Drivers read own record"
on public.drivers
for select
using (user_id = auth.uid());

-- Admins manage drivers
create policy "Admins manage drivers"
on public.drivers
for all
using (public.is_admin())
with check (public.is_admin());






