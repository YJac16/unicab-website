# Login Troubleshooting Guide

## Issue: "Failed to sign in" Error

### ✅ What We Verified:
1. ✅ Database connection is working
2. ✅ Users exist in database (admin and member found)
3. ✅ Password verification works correctly
4. ✅ .env file is created with correct values

### ❌ The Problem:
The server is not reading the `.env` file. It's returning:
```
"Authentication not yet configured"
```

## Solution:

### Step 1: Restart the Server
**The server must be restarted after creating/updating the .env file!**

1. **Stop the current server** (if running):
   - Press `Ctrl+C` in the terminal where the server is running

2. **Start the server again**:
   ```bash
   node server.js
   ```

3. **Look for this message**:
   ```
   ✅ Database: Using Supabase (service role)
   ```
   If you see this, the .env file is being read correctly!

### Step 2: Verify Server is Reading .env

When you start the server, you should see:
```
✅ Database: Using Supabase (service role)
🚀 UNICAB Travel & Tours server running on port 3000
```

If you see:
```
⚠️  Database: Not configured
```
Then the .env file is not being read. Check:
- Is `.env` file in the project root? (`e:\Code Work\Unicab Website\.env`)
- Are there any typos in variable names?
- Are there spaces around the `=` sign? (should be `KEY=value`, not `KEY = value`)

### Step 3: Test Login Again

After restarting the server:
1. Go to: `http://localhost:5173/login`
2. Try logging in with:
   - Email: `admin@unicabtravel.co.za`
   - Password: `Admin123!`

### Step 4: Check Browser Console

If login still fails:
1. Open browser DevTools (F12)
2. Go to Console tab
3. Try logging in
4. Check for any error messages

### Step 5: Check Server Logs

In the terminal where the server is running, you should see:
```
Login request received: { email: 'provided' }
Login: Success for email: admin@unicabtravel.co.za role: ADMIN
```

If you see errors, they will help identify the issue.

## Common Issues:

### Issue 1: Server Not Restarted
**Symptom**: Server says "Authentication not yet configured"
**Fix**: Restart the server after creating .env file

### Issue 2: Wrong API URL
**Symptom**: Network error or connection refused
**Fix**: Make sure frontend is using `http://localhost:3000` for API calls

### Issue 3: CORS Error
**Symptom**: CORS error in browser console
**Fix**: Server should handle CORS automatically, but check server logs

### Issue 4: Users Not in Database
**Symptom**: "Invalid credentials" error
**Fix**: Run migrations in Supabase SQL Editor:
- `supabase/migrations/002_auth_and_unavailability.sql`
- `supabase/migrations/005_create_test_users.sql`

## Test Credentials:

- **Admin**: `admin@unicabtravel.co.za` / `Admin123!`
- **Member**: `member@unicabtravel.co.za` / `Member123!`
- **Driver**: `driver@unicabtravel.co.za` / `Driver123!` (may need to be created)

## Still Having Issues?

Run the diagnostic script:
```bash
node scripts/test-login.js
```

This will check:
- Database connection
- User existence
- Password verification
- All users in database







