# Admin & Driver Dashboards Implementation

## Overview

Full implementation of role-based admin and driver dashboards with JWT authentication and unavailability-based driver availability management.

## Database Schema

### New Tables

1. **users** - JWT authentication users
   - id, name, email (unique), password_hash, role (ADMIN|DRIVER), active, driver_id, created_at, updated_at

2. **driver_unavailability** - Unavailability-based model
   - id, driver_id, date, reason, created_at
   - UNIQUE(driver_id, date)

### Migration

Run: `supabase/migrations/002_auth_and_unavailability.sql`

## Authentication

### JWT-Based Auth

- Uses `jsonwebtoken` and `bcrypt` packages
- Token stored in localStorage as `auth_token`
- Token expires in 7 days
- Middleware: `requireAuth`, `requireAdmin`, `requireDriver`

### Environment Variables

```bash
JWT_SECRET=your-secret-key-change-in-production
```

## Backend API Routes

### Public Routes

- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/register` - Register new user (admin only)

### Driver Routes (Protected)

- `GET /api/driver/bookings` - Get CONFIRMED bookings for driver
- `GET /api/driver/unavailability` - Get blocked dates
- `POST /api/driver/unavailability` - Block a date
- `DELETE /api/driver/unavailability/:date` - Unblock a date

### Admin Routes (Protected)

- `GET /api/admin/bookings` - All bookings (with filters)
- `PATCH /api/admin/bookings/:id` - Update booking status
- `GET /api/admin/drivers` - List all drivers
- `POST /api/admin/drivers` - Create driver + user account
- `PATCH /api/admin/drivers/:id` - Activate/deactivate driver
- `GET /api/admin/drivers/:id/unavailability` - View driver blocked dates
- `POST /api/admin/drivers/:id/unavailability` - Admin block date for driver
- `DELETE /api/admin/drivers/:id/unavailability/:date` - Admin unblock date

## Driver Dashboard

**Route:** `/driver/dashboard`

### Features

1. **Upcoming Bookings**
   - Shows only CONFIRMED bookings
   - Displays: Date, Tour name, Group size, Customer info, Total price
   - Drivers cannot edit bookings (read-only)

2. **Availability Management**
   - Date picker to block dates
   - Optional reason field
   - List of blocked dates with remove button
   - Validates no CONFIRMED booking exists before blocking

### Access Control

- Only DRIVER role can access
- Drivers see only their own data
- Cannot see other drivers
- Cannot edit bookings

## Admin Dashboard

**Route:** `/admin/dashboard`

### Features

1. **Bookings Management**
   - View all bookings with filters (status, date range, driver)
   - Update booking status (PENDING → CONFIRMED → CANCELLED)
   - Full visibility of all bookings

2. **Drivers Management**
   - List all drivers
   - Activate/deactivate drivers
   - View driver availability
   - Block/unblock dates for any driver (admin override)

### Access Control

- Only ADMIN role can access
- Full visibility and override authority
- Can manage all drivers and bookings

## Availability Logic

### Unavailability-Based Model

- **If record exists** in `driver_unavailability` for a date → Driver is UNAVAILABLE
- **If no record exists** → Driver is AVAILABLE

### Server-Side Enforcement

When checking available drivers:
1. Exclude drivers with `active = false`
2. Exclude drivers with unavailability record for the date
3. Exclude drivers with CONFIRMED booking on that date

This is enforced in:
- `get_available_drivers_for_date()` database function
- `/api/guides/available` endpoint
- Booking creation validation

## Frontend Integration

### API Client

Updated `src/lib/api.js` with:
- `login()` - JWT authentication
- Driver API functions (with token)
- Admin API functions (with token)

### Authentication Flow

1. User logs in via `/api/auth/login`
2. Token stored in `localStorage.getItem('auth_token')`
3. Token sent in `Authorization: Bearer <token>` header
4. Middleware validates token and role
5. Redirects based on role:
   - ADMIN → `/admin/dashboard`
   - DRIVER → `/driver/dashboard`

## Security Features

✅ Role-based access control (RBAC)
✅ JWT token authentication
✅ Password hashing with bcrypt
✅ Server-side validation
✅ Protected routes with middleware
✅ Drivers can only see their own data
✅ Admin has full override authority

## Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set environment variable:**
   ```bash
   JWT_SECRET=your-secret-key
   ```

3. **Run database migration:**
   - Execute `supabase/migrations/002_auth_and_unavailability.sql`

4. **Connect database to API routes:**
   - Update TODO sections in API route files
   - Replace placeholder queries with actual database queries

## Testing

### Create Test Users

```sql
-- Create admin user (password: admin123)
INSERT INTO users (name, email, password_hash, role, active)
VALUES (
  'Admin User',
  'admin@unicabtravel.co.za',
  '$2b$10$...', -- bcrypt hash of 'admin123'
  'ADMIN',
  true
);

-- Create driver user (password: driver123)
INSERT INTO users (name, email, password_hash, role, driver_id, active)
VALUES (
  'Driver User',
  'driver@unicabtravel.co.za',
  '$2b$10$...', -- bcrypt hash of 'driver123'
  'DRIVER',
  '<driver_id>',
  true
);
```

### Test Endpoints

Use Postman or curl with JWT token:

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@unicabtravel.co.za","password":"admin123"}'

# Use token in subsequent requests
curl http://localhost:3000/api/admin/bookings \
  -H "Authorization: Bearer <token>"
```

## Next Steps

1. ✅ Database schema created
2. ✅ Backend routes created
3. ✅ Frontend dashboards updated
4. ⏳ Connect database queries in API routes
5. ⏳ Test authentication flow
6. ⏳ Test driver availability blocking
7. ⏳ Test admin override features

## Notes

- All routes are protected with role-based middleware
- Drivers cannot edit bookings (read-only access)
- Admin has full override authority
- Unavailability model: record exists = unavailable, no record = available
- Server-side validation prevents double-booking
- JWT tokens expire after 7 days







