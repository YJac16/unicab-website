# Quick Test Credentials Reference

## Login Credentials

### 🔴 Admin
- **Email:** `admin@unicabtravel.co.za`
- **Password:** `Admin123!`
- **URL:** `/admin/dashboard`

### 🟡 Driver
- **Email:** `driver@unicabtravel.co.za`
- **Password:** `Driver123!`
- **URL:** `/driver/dashboard`

### 🟢 Member
- **Email:** `member@unicabtravel.co.za`
- **Password:** `Member123!`
- **URL:** `/member/dashboard`

---

## Quick Setup Steps

1. **Generate password hashes:**
   - Visit: https://bcrypt-generator.com/
   - For each password above:
     - Enter password
     - Set rounds: 10
     - Click "Generate"
     - Copy the hash

2. **Update SQL file:**
   - Open: `supabase/migrations/005_create_test_users.sql`
   - Replace `<REPLACE_WITH_BCRYPT_HASH_FOR_...>` with actual hashes

3. **Run SQL in database:**
   - Execute the migration file in your database

4. **Test login:**
   - Go to: `http://localhost:5173/login`
   - Use credentials above
   - Should redirect to appropriate dashboard

---

## Alternative: Use Script

If bcrypt is installed:
```bash
npm install bcrypt
node scripts/generate-password-hashes.js
```

This will output the complete SQL with hashes ready to copy/paste.

---

## Testing Checklist

- [ ] Admin login → `/admin/dashboard`
- [ ] Driver login → `/driver/dashboard`
- [ ] Member login → `/member/dashboard`
- [ ] Profile dropdown shows correct user
- [ ] Profile page accessible
- [ ] Can edit profile (when API connected)
- [ ] Sign out works

---

**Note:** These are test credentials. Change all passwords before production!


