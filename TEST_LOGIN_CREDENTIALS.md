# Test Login Credentials

## Quick Reference

### Admin Account
- **Email:** `admin@unicabtravel.co.za`
- **Password:** `Admin123!`
- **Role:** ADMIN
- **Dashboard:** `/admin/dashboard`

### Driver Account
- **Email:** `driver@unicabtravel.co.za`
- **Password:** `Driver123!`
- **Role:** DRIVER
- **Dashboard:** `/driver/dashboard`

### Member Account
- **Email:** `member@unicabtravel.co.za`
- **Password:** `Member123!`
- **Role:** MEMBER
- **Dashboard:** `/member/dashboard`

---

## How to Create Test Users

### Option 1: Use the SQL Migration (Recommended)

Run the SQL migration file:
```sql
-- File: supabase/migrations/005_create_test_users.sql
```

This will create all three test users with the passwords above.

### Option 2: Generate Password Hashes Manually

1. **Install bcrypt** (if not already installed):
   ```bash
   npm install bcrypt
   ```

2. **Run the hash generator script:**
   ```bash
   node scripts/generate-password-hashes.js
   ```

3. **Copy the generated SQL** and run it in your database

### Option 3: Use Online Bcrypt Generator

1. Go to: https://bcrypt-generator.com/
2. Enter password: `Admin123!`
3. Rounds: 10
4. Copy the hash
5. Repeat for Driver and Member passwords

### Option 4: Use Node.js One-Liner

```bash
node -e "const bcrypt = require('bcrypt'); bcrypt.hash('Admin123!', 10).then(h => console.log('Admin:', h));"
node -e "const bcrypt = require('bcrypt'); bcrypt.hash('Driver123!', 10).then(h => console.log('Driver:', h));"
node -e "const bcrypt = require('bcrypt'); bcrypt.hash('Member123!', 10).then(h => console.log('Member:', h));"
```

---

## SQL Insert Statements

Once you have the password hashes, use this SQL:

```sql
-- Admin User
INSERT INTO users (name, email, password_hash, role, active)
VALUES (
  'Admin User',
  'admin@unicabtravel.co.za',
  '<bcrypt-hash-here>', -- Replace with actual hash
  'ADMIN',
  true
)
ON CONFLICT (email) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  role = 'ADMIN',
  active = true;

-- Driver User
INSERT INTO users (name, email, password_hash, role, active, driver_id)
VALUES (
  'Driver User',
  'driver@unicabtravel.co.za',
  '<bcrypt-hash-here>', -- Replace with actual hash
  'DRIVER',
  true,
  NULL
)
ON CONFLICT (email) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  role = 'DRIVER',
  active = true;

-- Member User
INSERT INTO users (name, email, password_hash, role, active)
VALUES (
  'Member User',
  'member@unicabtravel.co.za',
  '<bcrypt-hash-here>', -- Replace with actual hash
  'MEMBER',
  true
)
ON CONFLICT (email) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  role = 'MEMBER',
  active = true;
```

---

## Testing the Login

1. **Start your development server:**
   ```bash
   npm run dev
   ```

2. **Navigate to:** `http://localhost:5173/login`

3. **Test each account:**
   - Login as Admin → Should redirect to `/admin/dashboard`
   - Login as Driver → Should redirect to `/driver/dashboard`
   - Login as Member → Should redirect to `/member/dashboard`

4. **Test Profile Pages:**
   - Click profile dropdown → "Profile"
   - Should navigate to role-specific profile page
   - Try editing profile information

---

## Security Notes

⚠️ **IMPORTANT:**
- These are **TEST credentials only**
- **Never use these passwords in production**
- Change all passwords before going live
- Use strong, unique passwords for production accounts
- Never commit passwords or hashes to version control

---

## Troubleshooting

### "Authentication not yet configured" Error
- The API routes need database connection
- Update `api/auth.js` with actual database queries
- See `ADMIN_LOGIN_SETUP.md` for details

### "Invalid credentials" Error
- Verify user exists in database
- Check password hash is correct
- Ensure user's `active` field is `true`
- Verify `role` is exactly `'ADMIN'`, `'DRIVER'`, or `'MEMBER'` (case-sensitive)

### Can't Generate Password Hash
- Make sure `bcrypt` is installed: `npm install bcrypt`
- Or use online bcrypt generator
- Or use the SQL migration file with pre-generated hashes

---

## Quick Test Checklist

- [ ] Database connected
- [ ] Test users created in database
- [ ] API routes connected to database
- [ ] Login page accessible
- [ ] Admin login works → redirects to admin dashboard
- [ ] Driver login works → redirects to driver dashboard
- [ ] Member login works → redirects to member dashboard
- [ ] Profile pages accessible from dropdown
- [ ] Profile editing works (with API connected)


