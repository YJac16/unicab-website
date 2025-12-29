# Custom Tour Booking System

This document describes the custom tour booking system implementation.

## Overview

A full-stack tour booking system built with:
- **Frontend:** React with Vite
- **Backend:** Node.js with Express
- **Database:** PostgreSQL (via Supabase or direct connection)
- **Payment:** Stripe (prepared but not yet integrated)

## Features

✅ Multi-step booking flow
✅ Guide availability checking
✅ Double-booking prevention
✅ Price calculation based on group size
✅ Booking status management (PENDING, CONFIRMED, CANCELLED)
✅ Admin routes for managing bookings and guides
✅ Payment stub endpoints ready for Stripe integration

## Database Schema

### Tables

1. **tours** - Tour information
   - id, name, description, duration, pricing (JSONB), max_people, active

2. **guides** - Guide information
   - id, name, email, active

3. **guide_availability** - Guide availability tracking
   - id, guide_id, date, is_available

4. **bookings** - Booking records
   - id, tour_id, guide_id, booking_date, group_size, total_amount, status, customer info

### Migration

Run the migration file to set up the database:
```sql
-- File: supabase/migrations/001_add_guides_and_availability.sql
```

## API Endpoints

### Public Endpoints

- `GET /api/tours` - Get all active tours
- `GET /api/guides/available?date=YYYY-MM-DD` - Get available guides for a date
- `POST /api/bookings` - Create a new booking (status: PENDING)

### Payment Endpoints (Stubs)

- `POST /api/payments/create-session` - Create Stripe checkout session (disabled)
- `POST /api/payments/webhook` - Stripe webhook handler (disabled)

### Admin Endpoints

- `GET /api/admin/bookings` - Get all bookings (with filters)
- `GET /api/admin/guides` - Get all guides

**Note:** Admin endpoints are currently accessible without authentication. Add auth middleware before production use.

## Booking Flow

1. **Select Tour** - User selects a tour from the tour detail page
2. **Select Date** - User picks a booking date
3. **Select Group Size** - User enters number of people
4. **Select Guide** - System shows available guides for the selected date
5. **Booking Summary** - User reviews booking details
6. **Payment** - Currently disabled with "Online payments coming soon" message

## Business Logic

### Guide Availability

A guide is available if:
- Guide is marked as `active = true`
- No existing booking for that guide on that date (status != 'cancelled')
- Guide availability record shows `is_available = true` (or no record exists)

### Booking Status

- **PENDING** - Default status when booking is created (before payment)
- **CONFIRMED** - Booking confirmed after payment (will be set via webhook)
- **CANCELLED** - Booking cancelled

### Price Calculation

Prices are calculated based on group size using the tour's pricing structure:
- 1 person: pricing[1]
- 2 people: pricing[2]
- 3 people: pricing[3]
- 4 people: pricing[4]
- 5-6 people: pricing["5-6"]
- 7-10 people: pricing["7-10"]
- 11-14 people: pricing["11-14"]
- 15-18 people: pricing["15-18"]
- 19-22 people: pricing["19-22"]

## Frontend Components

### Booking Flow

- `TourBookingNew.jsx` - New multi-step booking component (recommended)
- `TourBooking.jsx` - Original booking component (still functional)
- `TourCheckout.jsx` - Checkout page with payment form (payment disabled)

### API Client

- `src/lib/api.js` - API client that calls backend Express routes
  - Falls back to Supabase if backend unavailable
  - Falls back to local data if Supabase unavailable

## Stripe Integration (Future)

### Setup Steps

1. Install Stripe package:
   ```bash
   npm install stripe
   ```

2. Add environment variables (see `ENV_SETUP.md`):
   - `STRIPE_SECRET_KEY`
   - `STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `FRONTEND_URL`

3. Uncomment Stripe code in `api/payments.js`

4. Update frontend to:
   - Call `/api/payments/create-session`
   - Redirect to Stripe Checkout
   - Handle success/cancel redirects
   - Listen for webhook confirmations

### Webhook Configuration

Configure Stripe webhook to point to:
```
https://yourdomain.com/api/payments/webhook
```

Events to listen for:
- `checkout.session.completed` - Update booking status to CONFIRMED

## Testing

### Without Database

The system works with fallbacks:
1. Backend API (if configured)
2. Supabase (if configured)
3. Local data (always available)

### With Database

1. Run database migration
2. Set up environment variables
3. Test booking flow end-to-end
4. Verify guide availability logic
5. Test double-booking prevention

## Deployment

### Railway

1. Connect GitHub repository
2. Add environment variables in Railway dashboard
3. Deploy automatically on push

### Environment Variables Required

See `ENV_SETUP.md` for complete list.

Minimum required:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Code Structure

```
├── api/                    # Backend Express routes
│   ├── tours.js           # Tours API
│   ├── guides.js          # Guides API
│   ├── bookings.js        # Bookings API
│   ├── payments.js        # Payment stubs
│   └── admin.js           # Admin API
├── src/
│   ├── lib/
│   │   └── api.js         # Frontend API client
│   └── pages/
│       ├── TourBookingNew.jsx  # New booking flow
│       └── TourCheckout.jsx    # Checkout page
└── supabase/
    └── migrations/        # Database migrations
```

## Next Steps

1. ✅ Database schema created
2. ✅ Backend API routes created
3. ✅ Frontend booking flow created
4. ✅ Payment stubs created
5. ⏳ Connect to actual database
6. ⏳ Add authentication for admin routes
7. ⏳ Integrate Stripe payments
8. ⏳ Add email notifications
9. ⏳ Add booking management UI

## Notes

- All bookings start as PENDING status
- Payments are currently disabled/stubbed
- Admin routes are accessible without auth (add auth before production)
- System works with fallbacks if database not configured
- Double-booking is prevented at database level (UNIQUE constraint)


