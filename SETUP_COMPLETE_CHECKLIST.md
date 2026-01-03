# Database Setup Checklist

Follow these steps in order to configure your database.

## ✅ Step 1: Supabase Project

- [ ] Created Supabase project at [supabase.com](https://supabase.com)
- [ ] Project is active and ready

## ✅ Step 2: Get Credentials

- [ ] Opened Supabase Dashboard → Settings → API
- [ ] Copied **Project URL** (e.g., `https://xxxxx.supabase.co`)
- [ ] Copied **service_role key** (long key starting with `eyJ...`)
- [ ] Copied **anon key** (for frontend, optional)

## ✅ Step 3: Create .env File

**Option A: Use Setup Script (Easiest)**
```bash
node scripts/setup-database.js
```

**Option B: Manual Setup**
1. Create `.env` file in project root
2. Add:
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_API_URL=http://localhost:3000
JWT_SECRET=your-random-secret-key
```

- [ ] `.env` file created
- [ ] All values filled in correctly

## ✅ Step 4: Run Database Migrations

### Migration 1: Create Users Table

1. Go to Supabase Dashboard → **SQL Editor**
2. Click **"New query"**
3. Open: `supabase/migrations/002_auth_and_unavailability.sql`
4. Copy entire file contents
5. Paste into SQL Editor
6. Click **"Run"**

- [ ] Migration 002 executed successfully
- [ ] `users` table exists (check in Table Editor)

### Migration 2: Create Test Users

1. In SQL Editor, click **"New query"**
2. Open: `supabase/migrations/005_create_test_users.sql`
3. Copy entire file contents
4. Paste into SQL Editor
5. Click **"Run"**

- [ ] Migration 005 executed successfully
- [ ] 3 users created (check in Table Editor → users table)

## ✅ Step 5: Verify Installation

- [ ] `dotenv` package installed (`npm install dotenv` - already done)
- [ ] `bcryptjs` package installed (already done)
- [ ] `@supabase/supabase-js` package installed (already done)

## ✅ Step 6: Start Server

```bash
node server.js
```

**Look for this message:**
```
✅ Database: Using Supabase (service role)
```

- [ ] Server starts without errors
- [ ] Database connection message appears

## ✅ Step 7: Test Login

1. Start frontend: `npm run dev` (in another terminal)
2. Go to: `http://localhost:5173/login`
3. Test each account:

- [ ] Admin login works → redirects to `/admin/dashboard`
- [ ] Driver login works → redirects to `/driver/dashboard`
- [ ] Member login works → redirects to `/member/dashboard`

## 🎉 Setup Complete!

If all checkboxes are checked, your database is configured and ready to use!

## 🆘 Troubleshooting

### Server shows "Database not configured"
- Check `.env` file exists in project root
- Check `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set
- Restart server after creating/updating `.env`

### "Invalid credentials" when logging in
- Verify users exist in Supabase Table Editor
- Check password hashes in migration 005 are correct
- Ensure `active = true` for all users

### "Table 'users' does not exist"
- Run migration 002 in Supabase SQL Editor
- Check table exists in Table Editor

### Server crashes on start
- Check for syntax errors in `.env` file
- Ensure no spaces around `=` in `.env`
- Check all required packages are installed

## 📚 Additional Resources

- **Quick Setup:** `QUICK_DATABASE_SETUP.md`
- **Detailed Guide:** `DATABASE_SETUP_STEP_BY_STEP.md`
- **Test Credentials:** `TEST_LOGIN_INFO.md`







