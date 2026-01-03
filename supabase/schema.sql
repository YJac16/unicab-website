-- UNICAB Travel & Tours Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tours Table
CREATE TABLE IF NOT EXISTS tours (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  duration TEXT,
  image_url TEXT,
  price_from TEXT,
  promotion TEXT,
  highlights JSONB DEFAULT '[]'::jsonb,
  pricing JSONB NOT NULL, -- Stores pricing structure
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vehicles Table
CREATE TABLE IF NOT EXISTS vehicles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- sedan, suv, minivan, minicoach, etc.
  capacity INTEGER NOT NULL, -- max passengers
  features JSONB DEFAULT '[]'::jsonb,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Drivers Table
CREATE TABLE IF NOT EXISTS drivers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  experience TEXT,
  languages TEXT[] DEFAULT '{}',
  skills TEXT[] DEFAULT '{}',
  image_url TEXT,
  vehicle_id UUID REFERENCES vehicles(id),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Driver Availability (Blocked Dates)
CREATE TABLE IF NOT EXISTS driver_availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  driver_id UUID REFERENCES drivers(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  reason TEXT, -- vacation, maintenance, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(driver_id, date)
);

-- Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tour_id UUID REFERENCES tours(id) NOT NULL,
  driver_id UUID REFERENCES drivers(id) NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  date DATE NOT NULL,
  group_size INTEGER NOT NULL CHECK (group_size >= 1 AND group_size <= 22),
  price_per_person DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  special_requests TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Prevent double booking
  CONSTRAINT no_double_booking UNIQUE (driver_id, date)
);

-- Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  tour_id UUID REFERENCES tours(id),
  driver_id UUID REFERENCES drivers(id),
  reviewer_name TEXT NOT NULL,
  reviewer_email TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Roles (extends auth.users)
CREATE TABLE IF NOT EXISTS user_roles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'driver', 'customer')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(date);
CREATE INDEX IF NOT EXISTS idx_bookings_driver_date ON bookings(driver_id, date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_driver_availability_date ON driver_availability(driver_id, date);
CREATE INDEX IF NOT EXISTS idx_reviews_tour ON reviews(tour_id);
CREATE INDEX IF NOT EXISTS idx_reviews_driver ON reviews(driver_id);
CREATE INDEX IF NOT EXISTS idx_reviews_approved ON reviews(approved);

-- Functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_tours_updated_at BEFORE UPDATE ON tours
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_drivers_updated_at BEFORE UPDATE ON drivers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE tours ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE driver_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Tours: Public read, Admin write
CREATE POLICY "Tours are viewable by everyone" ON tours
  FOR SELECT USING (true);

CREATE POLICY "Tours are editable by admins" ON tours
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Vehicles: Public read, Admin write
CREATE POLICY "Vehicles are viewable by everyone" ON vehicles
  FOR SELECT USING (true);

CREATE POLICY "Vehicles are editable by admins" ON vehicles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Drivers: Public read, Admin/Driver write
CREATE POLICY "Drivers are viewable by everyone" ON drivers
  FOR SELECT USING (true);

CREATE POLICY "Drivers can update their own profile" ON drivers
  FOR UPDATE USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage drivers" ON drivers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Driver Availability: Drivers see their own, Admins see all
CREATE POLICY "Drivers see their own availability" ON driver_availability
  FOR SELECT USING (
    driver_id IN (
      SELECT id FROM drivers WHERE user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Drivers manage their own availability" ON driver_availability
  FOR ALL USING (
    driver_id IN (
      SELECT id FROM drivers WHERE user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Bookings: Customers see their own, Drivers see assigned, Admins see all
CREATE POLICY "Customers see their own bookings" ON bookings
  FOR SELECT USING (
    customer_email = (SELECT email FROM auth.users WHERE id = auth.uid()) OR
    driver_id IN (
      SELECT id FROM drivers WHERE user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Anyone can create bookings" ON bookings
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins and drivers can update bookings" ON bookings
  FOR UPDATE USING (
    driver_id IN (
      SELECT id FROM drivers WHERE user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Reviews: Public read approved, Admin write
CREATE POLICY "Approved reviews are viewable by everyone" ON reviews
  FOR SELECT USING (approved = true);

CREATE POLICY "Customers can create reviews for their bookings" ON reviews
  FOR INSERT WITH CHECK (
    booking_id IN (
      SELECT id FROM bookings
      WHERE customer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

CREATE POLICY "Admins can manage reviews" ON reviews
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- User Roles: Users see their own role, Admins see all
CREATE POLICY "Users see their own role" ON user_roles
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );

CREATE POLICY "Admins can manage roles" ON user_roles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Helper function to get available drivers for a date
CREATE OR REPLACE FUNCTION get_available_drivers(
  p_date DATE,
  p_group_size INTEGER
)
RETURNS TABLE (
  driver_id UUID,
  driver_name TEXT,
  driver_email TEXT,
  vehicle_type TEXT,
  vehicle_capacity INTEGER,
  rating DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.id,
    d.name,
    d.email,
    v.type,
    v.capacity,
    COALESCE(
      (SELECT AVG(rating)::DECIMAL(3,2)
       FROM reviews
       WHERE driver_id = d.id AND approved = true),
      0
    ) as rating
  FROM drivers d
  INNER JOIN vehicles v ON d.vehicle_id = v.id
  WHERE d.active = true
    AND v.capacity >= p_group_size
    AND NOT EXISTS (
      SELECT 1 FROM bookings b
      WHERE b.driver_id = d.id
        AND b.date = p_date
        AND b.status != 'cancelled'
    )
    AND NOT EXISTS (
      SELECT 1 FROM driver_availability da
      WHERE da.driver_id = d.id
        AND da.date = p_date
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;










