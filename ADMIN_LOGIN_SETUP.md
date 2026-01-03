# Admin Login Setup Guide

## Current Status

⚠️ **The authentication system is not yet connected to the database.** The API routes have placeholder responses and need database connection.

## Quick Setup (Once Database is Connected)

### Option 1: Use the Script (Recommended)

1. **Run the admin creation script:**
   ```bash
   node scripts/create-admin.js
   ```

2. **Follow the prompts:**
   - Enter admin email (or press Enter for default)
   - Enter admin password
   - Enter admin name (or press Enter for default)

3. **Copy the generated SQL** and run it in your database

### Option 2: Manual SQL Creation

1. **Generate a password hash:**
   ```bash
   node -e "const bcrypt = require('bcrypt'); bcrypt.hash('YourPassword123!', 10).then(h => console.log(h));"
   ```

2. **Run this SQL in your database:**
   ```sql
   INSERT INTO users (name, email, password_hash, role, active)
   VALUES (
     'Admin User',
     'admin@unicabtravel.co.za',
     '<paste-bcrypt-hash-here>',
     'ADMIN',
     true
   )
   ON CONFLICT (email) DO UPDATE SET
     password_hash = EXCLUDED.password_hash,
     role = 'ADMIN',
     active = true;
   ```

## Default Admin Credentials (After Setup)

Once you've created the admin user, you can use:

- **Email:** `admin@unicabtravel.co.za`
- **Password:** (whatever you set when creating the user)

## Testing the Login

1. **Start your development server:**
   ```bash
   npm run dev
   ```

2. **Navigate to:** `http://localhost:5173/login`

3. **Enter your admin credentials**

4. **You should be redirected to:** `/admin/dashboard`

## Important Notes

1. **Database Connection Required:** The login will only work after:
   - Database is connected
   - API routes are updated with actual database queries
   - Admin user is created in the `users` table

2. **Password Security:**
   - Use a strong password
   - Never commit passwords to git
   - Change default passwords in production

3. **Current API Status:**
   - The `/api/auth/login` endpoint currently returns a 501 error
   - You need to connect the database queries in `api/auth.js`

## Next Steps

1. ✅ Create admin user script (done)
2. ⏳ Connect database to API routes
3. ⏳ Test login functionality
4. ⏳ Create additional admin users if needed

## Troubleshooting

### "Authentication not yet configured" Error

This means the database queries in `api/auth.js` are still placeholders. You need to:
1. Set up database connection (PostgreSQL client)
2. Replace TODO comments with actual queries
3. Test the connection

### "Invalid credentials" Error

- Check that the user exists in the `users` table
- Verify the password hash is correct
- Ensure the user's `active` field is `true`
- Check that the `role` is exactly `'ADMIN'` (case-sensitive)

### Can't Generate Password Hash

Make sure `bcrypt` is installed:
```bash
npm install bcrypt
```







