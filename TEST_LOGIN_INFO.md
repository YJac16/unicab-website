# Test Login Credentials - Ready to Use

## ✅ Complete Test Accounts

### 🔴 Admin Account
- **Email:** `admin@unicabtravel.co.za`
- **Password:** `Admin123!`
- **Role:** ADMIN
- **Dashboard:** `/admin/dashboard`
- **Profile:** `/admin/profile`

### 🟡 Driver Account
- **Email:** `driver@unicabtravel.co.za`
- **Password:** `Driver123!`
- **Role:** DRIVER
- **Dashboard:** `/driver/dashboard`
- **Profile:** `/driver/profile`

### 🟢 Member Account
- **Email:** `member@unicabtravel.co.za`
- **Password:** `Member123!`
- **Role:** MEMBER
- **Dashboard:** `/member/dashboard`
- **Profile:** `/member/profile`

---

## 🚀 Quick Setup

1. **Run the SQL migration:**
   - File: `supabase/migrations/005_create_test_users.sql`
   - This file contains all three users with working password hashes
   - Execute in your database

2. **Test login:**
   - Go to: `http://localhost:5173/login`
   - Use the credentials above
   - Should redirect to appropriate dashboard

---

## 📋 What's Included

✅ All three test users
✅ Working bcrypt password hashes
✅ Ready-to-run SQL statements
✅ ON CONFLICT handling (safe to run multiple times)

---

## ⚠️ Important Security Notes

- **TEST CREDENTIALS ONLY** - Never use in production
- Change all passwords before going live
- Use strong, unique passwords for production
- Never commit passwords to version control

---

## 🧪 Testing Checklist

- [ ] Run SQL migration in database
- [ ] Admin login works → `/admin/dashboard`
- [ ] Driver login works → `/driver/dashboard`
- [ ] Member login works → `/member/dashboard`
- [ ] Profile dropdown shows correct user
- [ ] Profile pages accessible
- [ ] Sign out works

---

## 📝 SQL File Location

`supabase/migrations/005_create_test_users.sql`

This file is ready to run - just execute it in your database!







