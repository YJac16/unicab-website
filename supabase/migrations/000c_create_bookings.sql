-- 000c_create_bookings.sql
-- Base bookings table (FOUNDATION)


CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),


  tour_id UUID REFERENCES tours(id) ON DELETE SET NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,


  date DATE NOT NULL,
  group_size INTEGER NOT NULL DEFAULT 1,


  status TEXT NOT NULL DEFAULT 'pending',


  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);


CREATE TRIGGER trg_bookings_updated_at
BEFORE UPDATE ON bookings
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

