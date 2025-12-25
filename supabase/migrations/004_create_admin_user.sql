-- 004_create_admin_user.sql
-- Create default ADMIN user (JWT auth)


-- IMPORTANT:
-- Replace the password_hash value with a REAL bcrypt hash.
-- Plain text passwords WILL NOT WORK.


INSERT INTO users (
  name,
  email,
  password_hash,
  role,
  active
) VALUES (
  'Admin User',
  'admin@unicabtravel.co.za',
  '$2b$10$mPEGDoogRJfWQutb2TSN3uJZ7cuyah4uYEWgAg/w57aEfX2wJxQp2',
  'ADMIN',
  true
)
ON CONFLICT (email) DO NOTHING;
