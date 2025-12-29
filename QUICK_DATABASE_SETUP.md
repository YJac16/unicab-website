# Quick Database Setup Guide

## 🚀 Fast Setup (5 minutes)

### Step 1: Get Supabase Credentials

1. Go to [supabase.com](https://supabase.com) and log in
2. Open your project (or create a new one)
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **service_role key** (the long one that starts with `eyJ...`)

### Step 2: Create .env File

1. In your project root, create a file named `.env`
2. Add this content (replace with your values):

```bash
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here

VITE_API_URL=http://localhost:3000
JWT_SECRET=change-this-to-a-random-string-in-production
```

### Step 3: Run Database Migrations in Supabase

1. Go to Supabase Dashboard → **SQL Editor**
2. Click **"New query"**

#### Migration 1: Create Tables

1. Open: `supabase/migrations/002_auth_and_unavailability.sql`
2. Copy all contents
3. Paste into SQL Editor
4. Click **"Run"**

#### Migration 2: Create Test Users

1. Run this command to generate SQL with password hashes:
   ```bash
   node scripts/generate-hashes-simple.js
   ```
2. Copy the SQL output (the INSERT statements)
3. Paste into Supabase SQL Editor
4. Click **"Run"**

**OR** use the pre-generated SQL from `supabase/migrations/005_create_test_users.sql` (hashes already included)

### Step 4: Start Server

```bash
node server.js
```

Look for: `✅ Database: Using Supabase (service role)`

### Step 5: Test Login

1. Go to: `http://localhost:5173/login`
2. Login with:
   - **Admin:** `admin@unicabtravel.co.za` / `Admin123!`
   - **Driver:** `driver@unicabtravel.co.za` / `Driver123!`
   - **Member:** `member@unicabtravel.co.za` / `Member123!`

## ✅ Checklist

- [ ] Supabase project created
- [ ] `.env` file created with `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Migration 002 run (users table)
- [ ] Migration 005 run (test users)
- [ ] Server shows "✅ Database: Using Supabase"
- [ ] Login works!

## 🆘 Troubleshooting

**"Database not configured"**
- Check `.env` file exists
- Check values are correct (no extra spaces)
- Restart server

**"Invalid credentials"**
- Verify users exist in Supabase Table Editor
- Check password hashes are correct

**Need help?** See `DATABASE_SETUP_STEP_BY_STEP.md` for detailed instructions.


