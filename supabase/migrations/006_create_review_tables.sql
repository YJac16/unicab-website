-- 010_create_review_tables.sql
-- Create separate driver_reviews and tour_reviews tables with RLS policies

-- Driver Reviews Table
CREATE TABLE IF NOT EXISTS driver_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  driver_id UUID REFERENCES drivers(id) ON DELETE CASCADE NOT NULL,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tour Reviews Table
CREATE TABLE IF NOT EXISTS tour_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tour_id UUID REFERENCES tours(id) ON DELETE CASCADE NOT NULL,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_driver_reviews_driver_id ON driver_reviews(driver_id);
CREATE INDEX IF NOT EXISTS idx_driver_reviews_user_id ON driver_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_driver_reviews_approved ON driver_reviews(approved);
CREATE INDEX IF NOT EXISTS idx_driver_reviews_booking_id ON driver_reviews(booking_id);

CREATE INDEX IF NOT EXISTS idx_tour_reviews_tour_id ON tour_reviews(tour_id);
CREATE INDEX IF NOT EXISTS idx_tour_reviews_user_id ON tour_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_tour_reviews_approved ON tour_reviews(approved);
CREATE INDEX IF NOT EXISTS idx_tour_reviews_booking_id ON tour_reviews(booking_id);

-- Enable Row Level Security
ALTER TABLE driver_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE tour_reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for driver_reviews

-- Users can INSERT only if auth.uid() = user_id
CREATE POLICY "Users can insert their own driver reviews" ON driver_reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users cannot UPDATE or DELETE their reviews
CREATE POLICY "Users cannot update driver reviews" ON driver_reviews
  FOR UPDATE USING (false);

CREATE POLICY "Users cannot delete driver reviews" ON driver_reviews
  FOR DELETE USING (false);

-- Public SELECT only approved reviews
CREATE POLICY "Public can view approved driver reviews" ON driver_reviews
  FOR SELECT USING (approved = true);

-- Admin can SELECT/UPDATE/DELETE all reviews
CREATE POLICY "Admins can view all driver reviews" ON driver_reviews
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update all driver reviews" ON driver_reviews
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete all driver reviews" ON driver_reviews
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for tour_reviews

-- Users can INSERT only if auth.uid() = user_id
CREATE POLICY "Users can insert their own tour reviews" ON tour_reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users cannot UPDATE or DELETE their reviews
CREATE POLICY "Users cannot update tour reviews" ON tour_reviews
  FOR UPDATE USING (false);

CREATE POLICY "Users cannot delete tour reviews" ON tour_reviews
  FOR DELETE USING (false);

-- Public SELECT only approved reviews
CREATE POLICY "Public can view approved tour reviews" ON tour_reviews
  FOR SELECT USING (approved = true);

-- Admin can SELECT/UPDATE/DELETE all reviews
CREATE POLICY "Admins can view all tour reviews" ON tour_reviews
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update all tour reviews" ON tour_reviews
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete all tour reviews" ON tour_reviews
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

