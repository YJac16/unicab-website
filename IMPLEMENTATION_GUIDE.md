# UNICAB Booking System Implementation Guide

## Overview

This document describes the complete booking system implementation with Supabase backend, driver dashboards, admin capabilities, and review system.

## Architecture

- **Frontend:** React + Vite
- **Backend:** Supabase (PostgreSQL + Auth + RLS)
- **Authentication:** Supabase Auth with role-based access
- **Database:** PostgreSQL with Row Level Security

## Setup Instructions

### 1. Supabase Setup

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Run the SQL schema from `supabase/schema.sql` in the Supabase SQL Editor
3. Get your API credentials from Settings → API
4. Create `.env` file:

```env
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 2. Create Initial Users

#### Admin User
1. Create user in Authentication → Users
2. Run in SQL Editor:
```sql
INSERT INTO user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users
WHERE email = 'admin@unicabtravel.co.za';
```

#### Driver Users
1. Create user in Authentication → Users
2. Insert driver record:
```sql
INSERT INTO drivers (name, email, phone, experience, languages, skills, vehicle_id)
VALUES (
  'Thabo M.',
  'thabo@unicabtravel.co.za',
  '+27123456789',
  '12 years with UNICAB',
  ARRAY['English', 'isiXhosa', 'Afrikaans'],
  ARRAY['City & Peninsula specialist'],
  (SELECT id FROM vehicles WHERE type = 'sedan' LIMIT 1)
);
```
3. Link to user and assign role:
```sql
UPDATE drivers
SET user_id = (SELECT id FROM auth.users WHERE email = 'thabo@unicabtravel.co.za')
WHERE email = 'thabo@unicabtravel.co.za';

INSERT INTO user_roles (user_id, role)
SELECT id, 'driver'
FROM auth.users
WHERE email = 'thabo@unicabtravel.co.za';
```

### 3. Seed Data

Run seed queries in Supabase SQL Editor to populate:
- Vehicles
- Tours (migrate from `src/data.js`)
- Drivers

## Features Implemented

### 1. Booking Flow

**Route:** `/tours/:id/booking`

- User selects group size (1-22)
- User selects date
- System calculates price based on group size
- User confirms details
- System shows available drivers for selected date
- User selects driver
- User proceeds to checkout

**API Functions:**
- `getTour(id)` - Fetch tour details
- `getAvailableDrivers(date, groupSize)` - Get drivers available for date with sufficient vehicle capacity
- `calculateTourPrice(tour, groupSize)` - Calculate price per person

### 2. Driver Dashboard

**Route:** `/driver/dashboard` (Protected - Driver role only)

**Features:**
- View assigned bookings (upcoming and past)
- Update booking status (pending → confirmed → completed)
- Block unavailable dates
- View blocked dates with ability to unblock

**API Functions:**
- `getBookings({ driver_id })` - Get driver's bookings
- `getDriverAvailability(driver_id)` - Get blocked dates
- `blockDriverDate(driver_id, date, reason)` - Block a date
- `unblockDriverDate(availability_id)` - Unblock a date
- `updateBooking(booking_id, updates)` - Update booking status

### 3. Admin Dashboard

**Route:** `/admin` (Protected - Admin role only)

**Features:**
- View all bookings with filters (status, date range)
- Update booking status
- View tours and drivers
- Statistics dashboard

**API Functions:**
- `getBookings(filters)` - Get all bookings with filters
- `getTours()` - Get all tours
- `getDrivers()` - Get all drivers
- `updateBooking(booking_id, updates)` - Update any booking

### 4. Review System

**Implementation:**
- Reviews can only be created for completed bookings
- Reviews require admin approval before appearing publicly
- Reviews are linked to both tour and driver
- Average ratings calculated per tour and driver

**API Functions:**
- `createReview(reviewData)` - Create review (requires booking_id)
- `getReviews(filters)` - Get approved reviews

### 5. Authentication

**Routes:**
- `/login` - Sign in page
- Protected routes automatically redirect to login

**Roles:**
- `admin` - Full access
- `driver` - Driver dashboard access
- `customer` - Default role for new users

## Database Schema

### Key Tables

1. **tours** - Tour information with pricing structure
2. **vehicles** - Vehicle types and capacities
3. **drivers** - Driver profiles linked to users
4. **driver_availability** - Blocked dates for drivers
5. **bookings** - All tour bookings
6. **reviews** - Customer reviews (requires approval)
7. **user_roles** - User role assignments

### Security

- Row Level Security (RLS) enabled on all tables
- Policies enforce:
  - Public read access for tours, vehicles, drivers
  - Drivers see only their own bookings and availability
  - Admins see everything
  - Customers can create bookings and reviews

## API Integration

All API functions are in `src/lib/api.js`:

- Automatically falls back to localStorage if Supabase not configured
- Handles errors gracefully
- Returns consistent data structure

## Frontend Components

### New Components

1. **AuthContext** (`src/contexts/AuthContext.jsx`)
   - Manages authentication state
   - Provides user role and profile
   - Handles sign in/out

2. **ProtectedRoute** (`src/components/ProtectedRoute.jsx`)
   - Wraps routes requiring authentication
   - Optionally requires specific role

3. **Login** (`src/pages/Login.jsx`)
   - Sign in page
   - Redirects based on role after login

4. **DriverDashboard** (`src/pages/DriverDashboard.jsx`)
   - Driver's booking management interface

5. **AdminDashboard** (`src/pages/AdminDashboard.jsx`)
   - Admin's management interface

### Updated Components

1. **TourBooking** (`src/pages/TourBooking.jsx`)
   - Now uses API to fetch tours and drivers
   - Real-time availability checking
   - Integrated driver selection

2. **App.jsx**
   - Added protected routes
   - Wrapped with AuthProvider

## Testing

### Without Supabase

The system works in "mock mode" using localStorage:
- Bookings stored locally
- No authentication required
- All features work but data is not persistent

### With Supabase

1. Set environment variables
2. Run schema SQL
3. Create users and assign roles
4. Test booking flow
5. Test driver dashboard
6. Test admin dashboard

## Next Steps

1. **Payment Integration**
   - Add payment gateway (Stripe, PayPal, etc.)
   - Update checkout to process payments
   - Update booking status after payment

2. **Email Notifications**
   - Booking confirmations
   - Status updates
   - Review notifications

3. **Advanced Features**
   - Recurring bookings
   - Multi-day tours
   - Vehicle assignment automation
   - Calendar view for drivers

4. **Mobile App**
   - React Native version
   - Push notifications
   - Offline support

## Troubleshooting

### "Supabase not configured" warnings
- Check `.env` file exists
- Verify environment variables are set
- Restart dev server after adding `.env`

### Authentication not working
- Verify Supabase project is active
- Check RLS policies are correct
- Verify user roles are assigned

### Drivers not showing
- Check driver_availability table for blocked dates
- Verify vehicle capacity >= group size
- Check bookings table for conflicts

### Bookings not saving
- Check RLS policies allow inserts
- Verify user has correct permissions
- Check browser console for errors

## Support

For issues or questions:
1. Check Supabase logs in dashboard
2. Check browser console for errors
3. Verify database schema matches `supabase/schema.sql`
4. Test with localStorage fallback first



