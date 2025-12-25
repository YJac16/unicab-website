-- 003_add_member_support.sql
-- Add MEMBER booking support (link bookings to users)


--------------------------------------------------
-- BOOKINGS → USER LINK
--------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'bookings'
      AND column_name = 'user_id'
  ) THEN
    ALTER TABLE bookings
      ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE SET NULL;


    CREATE INDEX IF NOT EXISTS idx_bookings_user_id
      ON bookings(user_id);
  END IF;
END $$;


-- NOTE:
-- Role support for MEMBER is handled by the user_role ENUM in 002
-- Access control is enforced in application middleware (JWT),
-- NOT via database RLS policies.
