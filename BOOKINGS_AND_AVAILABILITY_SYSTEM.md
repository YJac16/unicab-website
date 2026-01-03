# Bookings and Driver Availability System

## ✅ Implementation Complete

A comprehensive bookings and driver availability system has been implemented using Supabase with Row Level Security (RLS) policies.

## 📊 Database Schema

### Bookings Table

```sql
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Customer
  driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
  tour_id UUID REFERENCES tours(id) ON DELETE SET NULL,
  booking_date DATE NOT NULL,
  group_size INTEGER NOT NULL DEFAULT 1,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  price_per_person DECIMAL(10, 2),
  total_price DECIMAL(10, 2),
  special_requests TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Driver Availability Table

```sql
CREATE TABLE driver_availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  driver_id UUID REFERENCES drivers(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  available BOOLEAN DEFAULT true,
  reason TEXT, -- reason for unavailability
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(driver_id, date)
);
```

## 🔒 Row Level Security (RLS) Policies

### Bookings RLS

1. **Customers: See own bookings**
   - `SELECT` policy: Only see bookings where `user_id = auth.uid()`
   - Role check: Must have `role = 'customer'` in profiles

2. **Customers: Create own bookings**
   - `INSERT` policy: Can only create bookings with `user_id = auth.uid()`
   - Role check: Must have `role = 'customer'` in profiles

3. **Drivers: See assigned bookings**
   - `SELECT` policy: Only see bookings where `driver_id` matches their driver record
   - Role check: Must have `role = 'driver'` in profiles

4. **Drivers: Update assigned bookings**
   - `UPDATE` policy: Can update status of bookings assigned to them
   - Role check: Must have `role = 'driver'` in profiles

5. **Admins: Full access**
   - `SELECT`, `INSERT`, `UPDATE`, `DELETE` policies
   - Can see and manage all bookings
   - Role check: Must have `role = 'admin'` in profiles

### Driver Availability RLS

1. **Drivers: See own availability**
   - `SELECT` policy: Only see their own availability records
   - Role check: Must have `role = 'driver'` in profiles

2. **Drivers: Manage own availability**
   - `INSERT`, `UPDATE`, `DELETE` policies
   - Can only manage their own availability
   - Role check: Must have `role = 'driver'` in profiles

3. **Admins: Full access**
   - `SELECT`, `INSERT`, `UPDATE`, `DELETE` policies
   - Can see and override all driver availability
   - Role check: Must have `role = 'admin'` in profiles

## 🔄 User Flows

### Customer Flow

1. **Create Booking**
   ```javascript
   import { createBookingSupabase } from '../lib/api';
   
   const booking = await createBookingSupabase({
     tour_id: 'tour-uuid',
     driver_id: 'driver-uuid',
     booking_date: '2024-12-25',
     group_size: 4,
     customer_name: 'John Doe',
     customer_email: 'john@example.com',
     customer_phone: '+27123456789',
     price_per_person: 500.00,
     total_price: 2000.00,
     special_requests: 'Vegetarian meals please'
   });
   ```

2. **View Own Bookings**
   ```javascript
   import { getCustomerBookings } from '../lib/api';
   
   const { data: bookings, error } = await getCustomerBookings();
   ```

### Driver Flow

1. **View Assigned Bookings**
   ```javascript
   import { getDriverBookings } from '../lib/api';
   
   const { data: bookings, error } = await getDriverBookings();
   ```

2. **Update Booking Status**
   ```javascript
   import { updateBookingStatusDriver } from '../lib/api';
   
   // Mark booking as completed
   await updateBookingStatusDriver(bookingId, 'completed');
   ```

3. **Manage Availability**
   ```javascript
   import { getDriverAvailability, setDriverAvailability } from '../lib/api';
   
   // Get availability for a date range
   const { data: availability } = await getDriverAvailability('2024-12-01', '2024-12-31');
   
   // Set unavailable for a date
   await setDriverAvailability('2024-12-25', false, 'Holiday');
   
   // Set available for a date
   await setDriverAvailability('2024-12-26', true);
   ```

### Admin Flow

1. **View All Bookings**
   ```javascript
   import { getAdminBookingsSupabase } from '../lib/api';
   
   // Get all bookings
   const { data: bookings } = await getAdminBookingsSupabase();
   
   // Get filtered bookings
   const { data: pendingBookings } = await getAdminBookingsSupabase({
     status: 'pending',
     date_from: '2024-12-01',
     date_to: '2024-12-31'
   });
   ```

2. **Assign Driver to Booking**
   ```javascript
   import { assignDriverToBooking } from '../lib/api';
   
   await assignDriverToBooking(bookingId, driverId);
   ```

3. **Update Booking Status**
   ```javascript
   import { updateBookingStatusAdmin } from '../lib/api';
   
   await updateBookingStatusAdmin(bookingId, 'confirmed');
   ```

4. **View All Driver Availability**
   ```javascript
   import { getAdminDriverAvailability, overrideDriverAvailability } from '../lib/api';
   
   // Get all availability
   const { data: availability } = await getAdminDriverAvailability();
   
   // Override driver availability
   await overrideDriverAvailability(driverId, '2024-12-25', false, 'Admin override');
   ```

5. **Get Available Drivers for Date**
   ```javascript
   import { getAvailableDrivers } from '../lib/api';
   
   const { data: availableDrivers } = await getAvailableDrivers('2024-12-25');
   ```

## 🛠️ Helper Functions

### Database Functions

1. **`is_driver_available(driver_uuid, check_date)`**
   - Returns `true` if driver is available on the date
   - Returns `false` if driver is unavailable
   - Returns `true` by default if no availability record exists

2. **`get_available_drivers(check_date)`**
   - Returns all drivers available on a specific date
   - Excludes drivers with bookings on that date
   - Excludes drivers marked as unavailable

## 📋 API Functions Reference

### Customer Functions

- `createBookingSupabase(bookingData)` - Create a new booking
- `getCustomerBookings()` - Get all bookings for the logged-in customer

### Driver Functions

- `getDriverBookings()` - Get all bookings assigned to the logged-in driver
- `updateBookingStatusDriver(bookingId, status)` - Update booking status
- `getDriverAvailability(startDate, endDate)` - Get own availability
- `setDriverAvailability(date, available, reason)` - Set availability for a date

### Admin Functions

- `getAdminBookingsSupabase(filters)` - Get all bookings with optional filters
- `assignDriverToBooking(bookingId, driverId)` - Assign driver to booking
- `updateBookingStatusAdmin(bookingId, status)` - Update booking status
- `getAdminDriverAvailability(driverId, startDate, endDate)` - Get all availability
- `overrideDriverAvailability(driverId, date, available, reason)` - Override availability
- `getAvailableDrivers(date)` - Get available drivers for a date

## 🔍 Status Values

### Booking Status

- `pending` - Booking created, awaiting confirmation
- `confirmed` - Booking confirmed by admin or driver
- `completed` - Tour completed
- `cancelled` - Booking cancelled

### Availability Status

- `available: true` - Driver is available on this date
- `available: false` - Driver is unavailable on this date
- No record - Driver is available by default

## 🧪 Testing Checklist

### Customer Tests

- [ ] Create booking as customer
- [ ] View own bookings only
- [ ] Cannot see other customers' bookings
- [ ] Cannot update booking status
- [ ] Cannot assign drivers

### Driver Tests

- [ ] View assigned bookings only
- [ ] Cannot see bookings assigned to other drivers
- [ ] Can update status of assigned bookings
- [ ] Can set own availability
- [ ] Cannot set other drivers' availability
- [ ] Cannot create bookings

### Admin Tests

- [ ] View all bookings
- [ ] Assign drivers to bookings
- [ ] Update any booking status
- [ ] View all driver availability
- [ ] Override driver availability
- [ ] Get available drivers for date

### Availability Tests

- [ ] Driver can mark dates as unavailable
- [ ] Driver can mark dates as available
- [ ] Admin can override availability
- [ ] Available drivers query excludes unavailable drivers
- [ ] Available drivers query excludes booked drivers

## 🔐 Security Notes

### RLS Enforcement

- All policies check user role from `profiles` table
- Policies use `auth.uid()` for user identification
- Drivers are identified via `drivers.user_id` link
- Admins have full access to all operations

### Best Practices

1. **Always check user role** before allowing operations
2. **Use RLS policies** as primary security layer
3. **Validate input** on both frontend and backend
4. **Log admin actions** for audit trail
5. **Handle errors gracefully** without exposing sensitive data

## 📊 Indexes

Performance indexes have been created for:

- `bookings.user_id` - Fast customer booking lookups
- `bookings.driver_id` - Fast driver booking lookups
- `bookings.booking_date` - Fast date-based queries
- `bookings.status` - Fast status filtering
- `bookings.driver_id, booking_date` - Fast driver date queries
- `driver_availability.driver_id, date` - Fast availability lookups

## 🚀 Migration

To apply this system, run:

```sql
-- Run in Supabase SQL Editor
\i supabase/migrations/011_bookings_and_availability_system.sql
```

Or copy and paste the migration file contents into the Supabase SQL Editor.

## ✅ Summary

The bookings and driver availability system is now fully implemented with:

- ✅ Complete database schema
- ✅ RLS policies for all roles
- ✅ API functions for all operations
- ✅ Helper functions for availability checks
- ✅ Performance indexes
- ✅ Role-based access control
- ✅ Secure data access

All users can now manage bookings and availability according to their role!






