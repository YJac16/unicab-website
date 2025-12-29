# ✅ Test Login Credentials - READY TO USE

## 🎯 Login Information

### Admin Account
- **Email:** `admin@unicabtravel.co.za`
- **Password:** `Admin123!`
- **Role:** ADMIN
- **Dashboard:** `/admin/dashboard`
- **Profile:** `/admin/profile`

### Driver Account
- **Email:** `driver@unicabtravel.co.za`
- **Password:** `Driver123!`
- **Role:** DRIVER
- **Dashboard:** `/driver/dashboard`
- **Profile:** `/driver/profile`

### Member Account
- **Email:** `member@unicabtravel.co.za`
- **Password:** `Member123!`
- **Role:** MEMBER
- **Dashboard:** `/member/dashboard`
- **Profile:** `/member/profile`

---

## 🚀 Quick Start

### Step 1: Run SQL Migration

The SQL file is **ready to use** with working password hashes:

**File:** `supabase/migrations/005_create_test_users.sql`

Just execute this file in your database (Supabase SQL Editor, pgAdmin, etc.)

### Step 2: Test Login

1. Start dev server: `npm run dev`
2. Go to: `http://localhost:5173/login`
3. Use any of the credentials above
4. Should redirect to the appropriate dashboard

---

## ✅ What's Ready

- ✅ All three test users created
- ✅ Working bcrypt password hashes
- ✅ Complete SQL migration file
- ✅ Safe to run multiple times (ON CONFLICT handling)

---

## 🧪 Testing Checklist

- [ ] Run SQL migration in database
- [ ] Admin login → `/admin/dashboard` ✅
- [ ] Driver login → `/driver/dashboard` ✅
- [ ] Member login → `/member/dashboard` ✅
- [ ] Profile dropdown works
- [ ] Profile pages accessible
- [ ] Sign out works

---

## ⚠️ Security Reminder

**These are TEST credentials only!**
- Never use in production
- Change all passwords before going live
- Use strong, unique passwords for production

---

## 📁 Files Created

- `supabase/migrations/005_create_test_users.sql` - Ready-to-run SQL
- `TEST_LOGIN_INFO.md` - Quick reference
- `TEST_CREDENTIALS_COMPLETE.md` - Detailed guide
- `QUICK_TEST_CREDENTIALS.md` - Quick reference

All credentials are ready to use! Just run the SQL file in your database.


