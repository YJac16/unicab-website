-- =========================
-- 008_ASSIGN_DRIVERS
-- =========================
-- Assign driver role and create driver record for existing user

-- Update profile role to 'driver'
update public.profiles
set role = 'driver'
where id = 'f10fa8aa-2cff-4d42-b0d5-eb918692f0ff';

-- Insert driver record
insert into public.drivers (
  user_id,
  name,
  phone,
  license_number,
  active
)
values (
  'f10fa8aa-2cff-4d42-b0d5-eb918692f0ff',
  'Yaseen Jacobs',
  '+27823277446',
  '600100150F46',
  true
)
on conflict (user_id) do nothing;

-- Verify the assignment
select
  u.email,
  p.role,
  d.name,
  d.active
from auth.users u
join profiles p on p.id = u.id
left join drivers d on d.user_id = u.id
where u.id = 'f10fa8aa-2cff-4d42-b0d5-eb918692f0ff';








