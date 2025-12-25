# 🚀 Database Setup - START HERE

## Quick Start (Choose One Method)

### Method 1: Interactive Setup Script (Easiest) ⭐

```bash
node scripts/setup-database.js
```

This will guide you through:
- Creating `.env` file
- Entering Supabase credentials
- Setting up configuration

Then follow the on-screen instructions to run migrations.

### Method 2: Manual Setup

1. **Create `.env` file** (see template below)
2. **Run migrations** in Supabase SQL Editor
3. **Start server** and test

---

## 📋 Complete Setup Steps

### 1. Get Supabase Credentials

1. Go to [supabase.com](https://supabase.com)
2. Open your project (or create new one)
3. **Settings** → **API**
4. Copy:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **service_role key**: `eyJ...` (long key)
   - **anon key**: `eyJ...` (for frontend)

### 2. Create .env File

Create `.env` in project root with:

```bash
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here

VITE_API_URL=http://localhost:3000
JWT_SECRET=change-this-to-random-string-in-production
```

### 3. Run Database Migrations

**In Supabase Dashboard → SQL Editor:**

1. **Run Migration 002:**
   - Open: `supabase/migrations/002_auth_and_unavailability.sql`
   - Copy all contents
   - Paste in SQL Editor
   - Click **"Run"**

2. **Run Migration 005:**
   - Open: `supabase/migrations/005_create_test_users.sql`
   - Copy all contents
   - Paste in SQL Editor
   - Click **"Run"**

### 4. Start Server

```bash
node server.js
```

**Expected output:**
```
✅ Database: Using Supabase (service role)
UNICAB Travel & Tours site running on port 3000
```

### 5. Test Login

1. Start frontend: `npm run dev` (in another terminal)
2. Go to: `http://localhost:5173/login`
3. Login with:
   - **Admin:** `admin@unicabtravel.co.za` / `Admin123!`
   - **Driver:** `driver@unicabtravel.co.za` / `Driver123!`
   - **Member:** `member@unicabtravel.co.za` / `Member123!`

---

## ✅ Verification Checklist

- [ ] `.env` file exists with correct values
- [ ] Migration 002 run successfully
- [ ] Migration 005 run successfully
- [ ] Server shows "✅ Database: Using Supabase"
- [ ] Login works for all three roles

---

## 📚 Documentation

- **Quick Setup:** `QUICK_DATABASE_SETUP.md`
- **Step-by-Step:** `DATABASE_SETUP_STEP_BY_STEP.md`
- **Checklist:** `SETUP_COMPLETE_CHECKLIST.md`
- **Troubleshooting:** See `DATABASE_SETUP.md`

---

## 🆘 Common Issues

### "Database not configured"
- ✅ Check `.env` file exists
- ✅ Check values are correct (no spaces)
- ✅ Restart server

### "Invalid credentials"
- ✅ Verify users in Supabase Table Editor
- ✅ Check password hashes are correct
- ✅ Ensure `active = true`

### Need more help?
See `DATABASE_SETUP_STEP_BY_STEP.md` for detailed instructions.
