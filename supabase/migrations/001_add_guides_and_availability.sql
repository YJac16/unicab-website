-- 001_add_guides_and_availability.sql
-- Base tables for guides and guide availability (FOUNDATION)


-- Enable UUID support
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


--------------------------------------------------
-- GUIDES TABLE
--------------------------------------------------
CREATE TABLE IF NOT EXISTS guides (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);


--------------------------------------------------
-- GUIDE UNAVAILABILITY (BLOCKED DATES MODEL)
--------------------------------------------------
CREATE TABLE IF NOT EXISTS guide_unavailability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  guide_id UUID NOT NULL REFERENCES guides(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (guide_id, date)
);


--------------------------------------------------
-- BOOKINGS TABLE EXTENSION
--------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'bookings'
      AND column_name = 'guide_id'
  ) THEN
    ALTER TABLE bookings
      ADD COLUMN guide_id UUID REFERENCES guides(id);
  END IF;
END $$;


--------------------------------------------------
-- BOOKING STATUS CONSTRAINT (STRICT)
--------------------------------------------------
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_status_check;


ALTER TABLE bookings
  ADD CONSTRAINT bookings_status_check
  CHECK (status IN ('pending', 'confirmed', 'cancelled'));


--------------------------------------------------
-- TOURS EXTENSIONS
--------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tours' AND column_name = 'max_people'
  ) THEN
    ALTER TABLE tours ADD COLUMN max_people INTEGER DEFAULT 22;
  END IF;
END $$;


DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tours' AND column_name = 'price_zar'
  ) THEN
    ALTER TABLE tours ADD COLUMN price_zar NUMERIC(10,2);
  END IF;
END $$;


--------------------------------------------------
-- INDEXES
--------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_guides_active
  ON guides(active);


CREATE INDEX IF NOT EXISTS idx_guide_unavailability
  ON guide_unavailability(guide_id, date);


CREATE INDEX IF NOT EXISTS idx_bookings_guide_date
  ON bookings(guide_id, date);


--------------------------------------------------
-- UPDATED_AT TRIGGER FUNCTION (SAFE)
--------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER trg_guides_updated_at
BEFORE UPDATE ON guides
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
