-- 002b_auth_and_unavailability.sql
-- Users, roles, and driver/guide unavailability
-- Designed for custom JWT auth (NOT Supabase auth)


--------------------------------------------------
-- ROLE ENUM (STRICT)
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
  guide_id UUID REFERENCES guides(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);


--------------------------------------------------
-- DRIVER / GUIDE UNAVAILABILITY (SINGLE SOURCE OF TRUTH)
--------------------------------------------------
-- Reuse guide_unavailability created in 001
-- DO NOT create a second availability table


--------------------------------------------------
-- INDEXES
--------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(active);
CREATE INDEX IF NOT EXISTS idx_users_guide_id ON users(guide_id);


--------------------------------------------------
-- UPDATED_AT TRIGGER
--------------------------------------------------


--------

