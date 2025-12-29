-- =========================
-- 007b_ADMIN_HELPERS
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

-- Admins can update any profile
create policy "Admins update profiles"
on public.profiles
for update
using (public.is_admin());

