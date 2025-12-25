# Testing Guide - Tour Booking System

This guide will help you test the booking system on your website.

## Quick Start

### 1. Start the Development Server

Open a terminal in your project directory and run:

```bash
npm run dev
```

This will start the Vite development server, usually at `http://localhost:5173`

### 2. Start the Backend Server (Optional)

In a **second terminal**, start the Express backend:

```bash
npm start
```

Or if you want to run it in development mode with auto-reload:
```bash
node server.js
```

The backend will run on `http://localhost:3000`

**Note:** The frontend will work without the backend (it falls back to local data), but the backend API routes won't be available.

## Testing the Booking Flow

### Option 1: New Multi-Step Booking Flow (Recommended)

1. **Go to Tours Page**
   - Navigate to: `http://localhost:5173/tours`
   - You should see a list of available tours

2. **Select a Tour**
   - Click on any tour card
   - You'll be taken to the tour detail page: `/tours/[tour-id]`

3. **Start Booking (New Flow)**
   - Click "Book Now" button
   - Or navigate directly to: `/tours/[tour-id]/booking-new`
   - Example: `/tours/ct-city-table-mountain/booking-new`

4. **Follow the Steps:**
   - **Step 1:** Tour selection (already selected)
   - **Step 2:** Select a date (pick a future date)
   - **Step 3:** Enter group size (1-22 people)
   - **Step 4:** Select a guide (if available)
   - **Step 5:** Review booking summary
   - **Step 6:** Payment (disabled - shows "Online payments coming soon")

### Option 2: Original Booking Flow

1. Navigate to: `/tours/[tour-id]/booking`
   - Example: `/tours/ct-city-table-mountain/booking`

## Testing Checklist

### ✅ Frontend Pages

- [ ] **Home Page** (`/`)
  - Should load without errors
  - Navigation should work

- [ ] **Tours Page** (`/tours`)
  - Should display list of tours
  - Tour cards should be clickable

- [ ] **Tour Detail Page** (`/tours/[tour-id]`)
  - Should show tour information
  - "Book Now" button should be visible

- [ ] **New Booking Flow** (`/tours/[tour-id]/booking-new`)
  - Step 1: Tour info displayed
  - Step 2: Date picker works, validates past dates
  - Step 3: Group size input works, validates range
  - Step 4: Shows available guides (may be empty if no guides in data)
  - Step 5: Summary shows correct information
  - Step 6: Payment button is disabled with message

- [ ] **Checkout Page** (`/tours/[tour-id]/checkout`)
  - Should show booking form
  - Payment section should show "Online payments coming soon" warning
  - Submit button should be disabled

### ✅ Backend API (if running)

Test these endpoints in your browser or using a tool like Postman:

- [ ] **GET** `http://localhost:3000/api/tours`
  - Should return: `{ success: true, data: [], message: "..." }`

- [ ] **GET** `http://localhost:3000/api/guides/available?date=2024-12-25`
  - Should return: `{ success: true, data: [], date: "2024-12-25", ... }`

- [ ] **POST** `http://localhost:3000/api/bookings`
  - Send JSON body:
    ```json
    {
      "tour_id": "test-tour",
      "guide_id": "test-guide",
      "booking_date": "2024-12-25",
      "group_size": 2,
      "customer_name": "Test User",
      "customer_email": "test@example.com"
    }
    ```
  - Should return: `{ success: true, data: {...}, message: "..." }`

- [ ] **POST** `http://localhost:3000/api/payments/create-session`
  - Should return: `{ success: false, error: "Online payments coming soon", ... }`

- [ ] **GET** `http://localhost:3000/api/admin/bookings`
  - Should return: `{ success: true, data: [], ... }`

- [ ] **GET** `http://localhost:3000/api/admin/guides`
  - Should return: `{ success: true, data: [], ... }`

## Common Issues & Solutions

### Issue: "No guides available"

**Solution:** This is expected if:
- No guides are in the database
- The date selected has no available guides
- The backend API isn't connected to a database yet

The system will work with fallback data from `src/data.js` (drivers).

### Issue: Backend API returns empty data

**Solution:** This is normal! The API routes are stubs that return placeholder responses. They're ready to be connected to your database.

### Issue: Payment button is disabled

**Solution:** This is **intentional**! Payments are disabled/stubbed as per requirements. The button shows "Online payments coming soon".

### Issue: Booking doesn't save

**Solution:** Without a database connection, bookings are stored in:
- Browser localStorage (if using frontend API)
- Or returned as placeholder responses (if using backend API)

## Testing with Browser DevTools

1. **Open DevTools** (F12 or Right-click → Inspect)
2. **Check Console** for any errors
3. **Check Network Tab** to see API calls:
   - Look for calls to `/api/tours`, `/api/guides`, `/api/bookings`
   - Check if they return expected responses

## Testing the Full Flow

1. Start both servers (frontend + backend)
2. Navigate through the booking flow
3. Complete all steps
4. Check browser console for errors
5. Check Network tab to see API calls
6. Verify the checkout page shows payment disabled message

## Expected Behavior

### ✅ What Should Work:
- All pages load without errors
- Navigation between pages works
- Date picker validates dates
- Group size input validates range
- Booking summary calculates prices correctly
- Payment section shows disabled state

### ⚠️ What's Expected (Not Errors):
- Empty guide lists (no database yet)
- Placeholder API responses
- Disabled payment buttons
- Bookings stored in localStorage (not database)

## Next Steps After Testing

Once you've verified everything works:

1. **Connect to Database:**
   - Run the migration: `supabase/migrations/001_add_guides_and_availability.sql`
   - Add guides and tours to your database
   - Update API routes to query the database

2. **Test with Real Data:**
   - Add some guides to the database
   - Test guide availability
   - Test booking creation

3. **Enable Payments (When Ready):**
   - Follow instructions in `ENV_SETUP.md`
   - Uncomment Stripe code in `api/payments.js`
   - Test payment flow

## Quick Test URLs

Replace `[tour-id]` with an actual tour ID from your data:

- Home: `http://localhost:5173/`
- Tours: `http://localhost:5173/tours`
- Tour Detail: `http://localhost:5173/tours/ct-city-table-mountain`
- New Booking: `http://localhost:5173/tours/ct-city-table-mountain/booking-new`
- Original Booking: `http://localhost:5173/tours/ct-city-table-mountain/booking`
- Checkout: `http://localhost:5173/tours/ct-city-table-mountain/checkout`

## Need Help?

- Check browser console for errors
- Check Network tab for failed API calls
- Review `BOOKING_SYSTEM_README.md` for system overview
- Review `ENV_SETUP.md` for environment setup
