-- 002a_add_guide_id_to_users.sql
-- Extend users table to link drivers/guides


DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'users'
      AND column_name = 'guide_id'
  ) THEN
    ALTER TABLE users
      ADD COLUMN guide_id UUID REFERENCES guides(id) ON DELETE SET NULL;
  END IF;
END $$;


CREATE INDEX IF NOT EXISTS idx_users_guide_id
  ON users(guide_id);

