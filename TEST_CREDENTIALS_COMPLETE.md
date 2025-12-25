# Complete Test Login Credentials

## 🎯 Quick Login Reference

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

## 📝 How to Create Test Users in Database

### Step 1: Generate Password Hashes

**Easiest Method - Online Generator:**
1. Visit: **https://bcrypt-generator.com/**
2. For each password:
   - Enter password (e.g., `Admin123!`)
   - Set **Rounds: 10**
   - Click **"Generate Hash"**
   - Copy the hash

**Alternative - Node.js:**
```bash
# Install bcryptjs (pure JS, no compilation)
npm install bcryptjs

# Generate hashes
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('Admin123!', 10).then(h => console.log('Admin:', h));"
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('Driver123!', 10).then(h => console.log('Driver:', h));"
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('Member123!', 10).then(h => console.log('Member:', h));"
```

### Step 2: Update SQL File

1. Open: `supabase/migrations/005_create_test_users.sql`
2. Replace the placeholder hashes with your generated hashes
3. Save the file

### Step 3: Run SQL in Database

Execute the SQL file in your database (Supabase SQL Editor, pgAdmin, etc.)

---

## 🧪 Testing Steps

1. **Start dev server:**
   ```bash
   npm run dev
   ```

2. **Navigate to login:**
   - URL: `http://localhost:5173/login`

3. **Test each account:**
   - **Admin:** Login → Should redirect to `/admin/dashboard`
   - **Driver:** Login → Should redirect to `/driver/dashboard`
   - **Member:** Login → Should redirect to `/member/dashboard`

4. **Test profile pages:**
   - Click profile dropdown (top right)
   - Click "Profile"
   - Should navigate to role-specific profile page
   - Try editing profile information

---

## 📋 Complete SQL Template

```sql
-- Admin User
INSERT INTO users (name, email, password_hash, role, active)
VALUES (
  'Admin User',
  'admin@unicabtravel.co.za',
  '<PASTE_BCRYPT_HASH_HERE>', -- Hash for: Admin123!
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
  '<PASTE_BCRYPT_HASH_HERE>', -- Hash for: Driver123!
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
  '<PASTE_BCRYPT_HASH_HERE>', -- Hash for: Member123!
  'MEMBER',
  true
)
ON CONFLICT (email) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  role = 'MEMBER',
  active = true;
```

---

## ⚠️ Security Reminders

- These are **TEST credentials only**
- **Never use in production**
- Change all passwords before going live
- Use strong, unique passwords for production
- Never commit passwords to git

---

## 🔧 Troubleshooting

### "Authentication not yet configured"
- API routes need database connection
- Update `api/auth.js` with actual queries
- See `ADMIN_LOGIN_SETUP.md`

### "Invalid credentials"
- Check user exists in database
- Verify password hash is correct
- Ensure `active = true`
- Check `role` is exactly `'ADMIN'`, `'DRIVER'`, or `'MEMBER'`

### Can't generate hashes
- Use online generator: https://bcrypt-generator.com/
- Or install: `npm install bcryptjs`
- Then run: `node scripts/generate-hashes-simple.js`
