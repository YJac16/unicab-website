-- 000b_create_users.sql
-- Base users table (FOUNDATION for auth)


CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


--------------------------------------------------
-- ROLE ENUM
--------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('ADMIN', 'DRIVER', 'MEMBER');
  END IF;
END $$;


--------------------------------------------------
-- USERS TABLE
--------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),


  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,


  role user_role NOT NULL,
  active BOOLEAN DEFAULT true,


  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);


--------------------------------------------------
-- UPDATED_AT TRIGGER
--------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION set_updated_at();


--------------------------------------------------
-- INDEXES
--------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

