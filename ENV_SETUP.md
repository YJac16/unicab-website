# Environment Variables Setup

This document describes all environment variables needed for the tour booking system.

## Required Environment Variables

### Database (Supabase/PostgreSQL)
```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### API Configuration
```bash
# Optional: Custom API URL (defaults to same origin)
VITE_API_URL=http://localhost:3000
```

### Stripe Payment Integration (Future)
```bash
# Stripe Secret Key (server-side only - DO NOT expose to frontend)
STRIPE_SECRET_KEY=sk_test_...

# Stripe Publishable Key (can be used in frontend)
STRIPE_PUBLISHABLE_KEY=pk_test_...

# Stripe Webhook Secret (for verifying webhook signatures)
STRIPE_WEBHOOK_SECRET=whsec_...

# Frontend URL for redirects after payment
FRONTEND_URL=https://yourdomain.com
```

## Railway Deployment

When deploying to Railway, add these environment variables in the Railway dashboard:

1. Go to your project settings
2. Navigate to "Variables"
3. Add each variable with its value

### For Development
Create a `.env` file in the project root:
```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
VITE_API_URL=http://localhost:3000
```

### For Production
Set these in Railway's environment variables:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `STRIPE_SECRET_KEY` (when ready to enable payments)
- `STRIPE_WEBHOOK_SECRET` (when ready to enable payments)
- `FRONTEND_URL`

## Stripe Integration Status

**Current Status:** Payments are disabled/stubbed

To enable Stripe payments:
1. Add Stripe environment variables above
2. Uncomment Stripe code in `api/payments.js`
3. Install Stripe package: `npm install stripe`
4. Update frontend to handle payment sessions
5. Test with Stripe test keys

## Security Notes

- **Never commit** `.env` files or environment variables to git
- `STRIPE_SECRET_KEY` should **only** be used server-side
- `STRIPE_WEBHOOK_SECRET` should **only** be used server-side
- Frontend can safely use `STRIPE_PUBLISHABLE_KEY`
