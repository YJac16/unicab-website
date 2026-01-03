-- =========================
-- 007e_DRIVER_AVAILABILITY
-- =========================

create table if not exists public.driver_availability (
  id uuid primary key default gen_random_uuid(),
  driver_id uuid references drivers(id) on delete cascade not null,
  date date not null,
  available boolean default true,
  reason text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (driver_id, date)
);

alter table public.driver_availability enable row level security;

-- Updated_at trigger
create or replace function set_driver_availability_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_driver_availability_updated_at on driver_availability;

create trigger trg_driver_availability_updated_at
before update on driver_availability
for each row
execute function set_driver_availability_updated_at();

-- Drivers manage own availability
create policy "Drivers manage own availability"
on driver_availability
for all
using (
  driver_id in (
    select id from drivers where user_id = auth.uid()
  )
)
with check (
  driver_id in (
    select id from drivers where user_id = auth.uid()
  )
);

-- Admins manage all availability
create policy "Admins manage all availability"
on driver_availability
for all
using (public.is_admin())
with check (public.is_admin());

-- Helper: check availability
create or replace function is_driver_available(driver_uuid uuid, check_date date)
returns boolean
language plpgsql
security definer
as $$
begin
  return coalesce(
    (
      select available
      from driver_availability
      where driver_id = driver_uuid
      and date = check_date
      limit 1
    ),
    true
  );
end;
$$;






