# Database Setup - Step by Step Guide

Follow these steps to configure your database for authentication.

## Step 1: Create Supabase Project (if you don't have one)

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click **"New Project"**
4. Fill in:
   - **Name:** `unicab-travel-tours` (or any name)
   - **Database Password:** Create a strong password (save it!)
   - **Region:** Choose closest to your location
5. Click **"Create new project"**
6. Wait 2-3 minutes for project to be created

## Step 2: Get Your Supabase Credentials

1. In your Supabase project dashboard, go to **Settings** (gear icon) → **API**
2. You'll see:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public** key (starts with `eyJ...`)
   - **service_role** key (starts with `eyJ...`) - **KEEP THIS SECRET!**

3. Copy these values - you'll need them in the next step

## Step 3: Create Environment Variables File

1. In your project root (`e:\Code Work\Unicab Website`), create a file named `.env`
2. Copy the template from `.env.example` or use this:

```bash
# Supabase Configuration (REQUIRED for backend authentication)
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your_key_here

# Frontend Supabase (optional)
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your_anon_key_here

# API Configuration
VITE_API_URL=http://localhost:3000

# JWT Secret (for token signing)
JWT_SECRET=your-secret-key-change-in-production-use-random-string
```

3. Replace the placeholder values with your actual Supabase credentials

**Important:** The `.env` file should already be in `.gitignore` - never commit it to git!

## Step 4: Run Database Migrations

1. In Supabase Dashboard, go to **SQL Editor** (left sidebar)
2. Click **"New query"**

### Migration 1: Create Users Table

1. Open the file: `supabase/migrations/002_auth_and_unavailability.sql`
2. Copy the entire contents
3. Paste into Supabase SQL Editor
4. Click **"Run"** (or press Ctrl+Enter)
5. You should see: "Success. No rows returned"

### Migration 2: Create Test Users

1. Open the file: `supabase/migrations/005_create_test_users.sql`
2. Copy the entire contents
3. Paste into Supabase SQL Editor
4. **IMPORTANT:** Before running, you need to replace the password hashes!

#### Generate Password Hashes:

**Option A: Use the script (recommended)**
```bash
npm install bcryptjs  # if not already installed
node scripts/generate-hashes-simple.js
```

This will output SQL with real password hashes. Copy and use that SQL instead.

**Option B: Use online generator**
1. Go to: https://bcrypt-generator.com/
2. For each password:
   - Enter: `Admin123!` (or `Driver123!` or `Member123!`)
   - Rounds: `10`
   - Click "Generate Hash"
   - Copy the hash
3. Replace `<REPLACE_WITH_BCRYPT_HASH_FOR_...>` in the SQL file with the actual hash

5. After updating the hashes, run the SQL in Supabase SQL Editor

## Step 5: Verify Database Setup

1. In Supabase Dashboard, go to **Table Editor**
2. You should see:
   - `users` table
   - Click on `users` table
   - You should see 3 rows (Admin, Driver, Member users)

## Step 6: Install dotenv (for loading .env file)

The server needs to load environment variables from `.env` file:

```bash
npm install dotenv
```

## Step 7: Update server.js to Load .env

The server needs to load the `.env` file. Let me check if it's already configured...

## Step 8: Test the Connection

1. **Start the backend server:**
   ```bash
   node server.js
   ```

2. **Look for this message in the console:**
   ```
   ✅ Database: Using Supabase (service role)
   ```

3. **If you see "Database not configured":**
   - Check that `.env` file exists
   - Check that `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set correctly
   - Restart the server

4. **Test login:**
   - Go to: `http://localhost:5173/login`
   - Try logging in with:
     - Email: `admin@unicabtravel.co.za`
     - Password: `Admin123!`

## Troubleshooting

### "Database not configured" error
- ✅ Check `.env` file exists in project root
- ✅ Check `SUPABASE_URL` starts with `https://`
- ✅ Check `SUPABASE_SERVICE_ROLE_KEY` is the **service_role** key (not anon key)
- ✅ Restart server after creating/updating `.env`

### "Invalid credentials" error
- ✅ Verify users exist in Supabase Table Editor
- ✅ Check password hashes are correct (use bcrypt generator)
- ✅ Ensure `active = true` for all test users

### "Table 'users' does not exist"
- ✅ Run migration: `supabase/migrations/002_auth_and_unavailability.sql`
- ✅ Check in Table Editor that `users` table exists

### Server won't start
- ✅ Make sure `dotenv` is installed: `npm install dotenv`
- ✅ Check for syntax errors in `.env` file (no spaces around `=`)

## Quick Checklist

- [ ] Supabase project created
- [ ] Credentials copied (URL and service_role key)
- [ ] `.env` file created with correct values
- [ ] Migration 002 run (users table created)
- [ ] Migration 005 run (test users created with correct password hashes)
- [ ] `dotenv` package installed
- [ ] Server shows "✅ Database: Using Supabase"
- [ ] Login works with test credentials

## Next Steps

Once login works:
1. Test all three roles (Admin, Driver, Member)
2. Test registration for new members
3. Connect other API routes to database (bookings, tours, etc.)
