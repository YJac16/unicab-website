-- 005_create_test_users.sql
-- Create TEST Driver and Member users
-- (Admin user is created in 004)


--------------------------------------------------
-- CREATE TEST GUIDE FOR DRIVER USER
--------------------------------------------------
-- First, create the guide that the driver user will be linked to
INSERT INTO guides (
  name,
  email,
  active
)
VALUES (
  'Driver User',
  'driver@unicabtravel.co.za',
  true
)
ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  active = true;


--------------------------------------------------
-- TEST DRIVER USER
--------------------------------------------------
-- Email: driver@unicabtravel.co.za
-- Password: Driver123!


INSERT INTO users (
  name,
  email,
  password_hash,
  role,
  active,
  guide_id
)
SELECT
  'Driver User',
  'driver@unicabtravel.co.za',
  '$2b$10$GbR3QJNwelZPCgP8Bd1tROY0OZYbkA5hzD0wSpVGT/.FGc0rthHoq',
  'DRIVER',
  true,
  g.id
FROM guides g
WHERE g.email = 'driver@unicabtravel.co.za'
ON CONFLICT (email) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  role = 'DRIVER',
  active = true,
  guide_id = (SELECT id FROM guides WHERE email = 'driver@unicabtravel.co.za');


--------------------------------------------------
-- TEST MEMBER USER
--------------------------------------------------
-- Email: member@unicabtravel.co.za
-- Password: Member123!


INSERT INTO users (
  name,
  email,
  password_hash,
  role,
  active
)
VALUES (
  'Member User',
  'member@unicabtravel.co.za',
  '$2b$10$b0qznRXyBePgqEDrBK06weab29JwcstOjJoOPPol4A3JPPXTVwbdq',
  'MEMBER',
  true
)
ON CONFLICT (email) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  role = 'MEMBER',
  active = true;
