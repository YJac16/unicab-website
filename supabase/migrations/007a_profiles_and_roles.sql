-- =========================
-- 007a_PROFILES_and_ROLES
-- =========================

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('admin', 'driver', 'customer')),
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.profiles (id, role)
  values (new.id, 'customer');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute procedure public.handle_new_user();

-- Users can read their own profile
create policy "Users read own profile"
on public.profiles
for select
using (id = auth.uid());

