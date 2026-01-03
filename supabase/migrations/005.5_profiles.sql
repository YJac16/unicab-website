-- =========================
-- 1. PROFILES (USER ROLES)
-- =========================

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('admin', 'driver', 'customer')),
  created_at timestamp with time zone default now()
);

alter table public.profiles enable row level security;

-- =========================
-- 2. DRIVERS
-- =========================

create table if not exists public.drivers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users(id) on delete cascade,
  name text not null,
  phone text,
  license_number text,
  active boolean default true,
  created_at timestamp with time zone default now()
);

alter table public.drivers enable row level security;

-- =========================
-- 3. ADMIN HELPER FUNCTION
-- =========================

create or replace function public.is_admin()
returns boolean
language sql
security definer
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
    and role = 'admin'
  );
$$;

-- =========================
-- 4. PROFILES POLICIES
-- =========================

create policy "Users can read own profile"
on public.profiles
for select
using (id = auth.uid());

create policy "Admins can update profiles"
on public.profiles
for update
using (public.is_admin());

-- =========================
-- 5. DRIVERS POLICIES
-- =========================

create policy "Drivers can view own record"
on public.drivers
for select
using (user_id = auth.uid());

create policy "Admins can view all drivers"
on public.drivers
for select
using (public.is_admin());

create policy "Admins can insert drivers"
on public.drivers
for insert
with check (public.is_admin());

create policy "Admins can update drivers"
on public.drivers
for update
using (public.is_admin());

-- =========================
-- 6. SET ADMIN USER
-- =========================

-- Update existing admin user if exists
update public.profiles
set role = 'admin'
where id = '00e486a2-9122-4314-9070-043e0f53fc03';

-- Insert admin user if not exists
insert into public.profiles (id, role)
values ('00e486a2-9122-4314-9070-043e0f53fc03', 'admin')
on conflict (id) do update set role = 'admin';

-- Verify
select id, role from public.profiles;






