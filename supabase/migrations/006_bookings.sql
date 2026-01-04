-- =========================
-- 006_bookings
-- =========================

alter table bookings enable row level security;

-- Add missing columns safely
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_name = 'bookings' and column_name = 'user_id'
  ) then
    alter table bookings
    add column user_id uuid references auth.users(id) on delete set null;
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_name = 'bookings' and column_name = 'driver_id'
  ) then
    alter table bookings
    add column driver_id uuid references drivers(id) on delete set null;
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_name = 'bookings' and column_name = 'booking_date'
  ) then
    alter table bookings
    add column booking_date date not null default current_date;
  end if;
end $$;

alter table bookings drop constraint if exists bookings_status_check;
alter table bookings
add constraint bookings_status_check
check (status in ('reserved','pending','confirmed','completed','cancelled'));

-- Users see own bookings
create policy "Users read own bookings"
on bookings
for select
using (user_id = auth.uid() or public.is_admin());

-- Users create own bookings
create policy "Users create bookings"
on bookings
for insert
with check (
  user_id = auth.uid()
  and exists (
    select 1 from profiles
    where id = auth.uid()
    and role in ('customer','admin')
  )
);

-- Drivers see assigned bookings
create policy "Drivers read assigned bookings"
on bookings
for select
using (
  driver_id in (
    select id from drivers where user_id = auth.uid()
  )
);

-- Drivers update assigned bookings
create policy "Drivers update assigned bookings"
on bookings
for update
using (
  driver_id in (
    select id from drivers where user_id = auth.uid()
  )
);

-- Admins full access
create policy "Admins manage bookings"
on bookings
for all
using (public.is_admin())
with check (public.is_admin());
