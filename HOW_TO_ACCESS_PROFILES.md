# How to Access Profiles on Live Server

## Quick Guide

### Step 1: Sign In
1. Go to your live website (e.g., `https://yourdomain.com`)
2. Click the **"Sign In"** button in the top right corner of the header
3. Enter your login credentials (see test credentials below)

### Step 2: Access Your Profile

**Method 1: Through Profile Dropdown (Recommended)**
1. After signing in, you'll see your name in the top right corner
2. Click on your name/profile button
3. A dropdown menu will appear
4. Click **"Profile"** in the dropdown
5. You'll be taken to your profile page

**Method 2: Direct URL**
You can also access your profile directly by typing the URL:
- **Admin Profile:** `https://www.unicabtravelandtours.com/admin/profile`
- **Driver Profile:** `https://www.unicabtravelandtours.com/driver/profile`
- **Member Profile:** `https://www.unicabtravelandtours.com/member/profile`

---

## Profile URLs by Role

### Admin Profile
- **URL:** `/admin/profile`
- **Full URL:** `https://yourdomain.com/admin/profile`
- **Access:** ADMIN role only
- **Features:**
  - View and edit name
  - View and edit email
  - Change password (optional)
  - Account information

### Driver Profile
- **URL:** `/driver/profile`
- **Full URL:** `https://yourdomain.com/driver/profile`
- **Access:** DRIVER role only
- **Features:**
  - View and edit name
  - View and edit email
  - View and edit phone number
  - Change password (optional)
  - Driver-specific information

### Member Profile
- **URL:** `/member/profile`
- **Full URL:** `https://yourdomain.com/member/profile`
- **Access:** MEMBER role only
- **Features:**
  - View and edit name
  - View and edit email
  - View and edit phone number
  - Change password (optional)
  - Member account information

---

## Test Credentials (For Testing)

### Admin Account
- **Email:** `admin@unicabtravel.co.za`
- **Password:** `Admin123!`
- **Profile URL:** `/admin/profile`

### Driver Account
- **Email:** `driver@unicabtravel.co.za`
- **Password:** `Driver123!`
- **Profile URL:** `/driver/profile`

### Member Account
- **Email:** `member@unicabtravel.co.za`
- **Password:** `Member123!`
- **Profile URL:** `/member/profile`

---

## Step-by-Step Instructions

### For Admin Users:
1. Visit: `https://yourdomain.com/login`
2. Enter admin email and password
3. You'll be redirected to `/admin/dashboard`
4. Click your name in the top right → Click "Profile"
5. Or go directly to: `https://yourdomain.com/admin/profile`

### For Driver Users:
1. Visit: `https://yourdomain.com/login`
2. Enter driver email and password
3. You'll be redirected to `/driver/dashboard`
4. Click your name in the top right → Click "Profile"
5. Or go directly to: `https://yourdomain.com/driver/profile`

### For Member Users:
1. Visit: `https://yourdomain.com/login` or `/member/login`
2. Enter member email and password
3. You'll be redirected to `/member/dashboard`
4. Click your name in the top right → Click "Profile"
5. Or go directly to: `https://yourdomain.com/member/profile`

---

## Security & Access Control

### Protected Routes
All profile pages are **protected** and require:
1. **Authentication:** You must be logged in
2. **Role Authorization:** You must have the correct role
   - Admin can only access `/admin/profile`
   - Driver can only access `/driver/profile`
   - Member can only access `/member/profile`

### What Happens If:
- **Not logged in:** You'll be redirected to `/login`
- **Wrong role:** You'll be redirected to your appropriate dashboard
- **Invalid token:** You'll be logged out and redirected to login

---

## Troubleshooting

### Profile Link Not Showing?
1. Make sure you're logged in (check top right for your name)
2. Hard refresh the page (Ctrl+Shift+R or Cmd+Shift+R)
3. Clear browser cache and cookies
4. Check browser console for errors

### Can't Access Profile Page?
1. Verify you're logged in with the correct account
2. Check that your user has the correct role in the database
3. Ensure your authentication token is valid
4. Try logging out and logging back in

### Profile Dropdown Not Appearing?
1. Check that you're signed in (should see your name, not "Sign In")
2. Click on your name/profile button in the top right
3. The dropdown should appear with options:
   - Dashboard
   - Profile
   - Payments
   - Subscriptions
   - Sign Out

---

## Profile Features

### What You Can Do on Profile Pages:
✅ **View** your account information
✅ **Edit** your name and email
✅ **Update** your phone number (Driver/Member)
✅ **Change** your password (optional)
✅ **View** your role and account status

### Form Validation:
- Name: Minimum 2 characters required
- Email: Must be valid email format
- Password: Minimum 6 characters (if changing)
- Password confirmation: Must match new password

---

## Quick Reference URLs

Replace `yourdomain.com` with your actual domain:

```
Login Page:
https://yourdomain.com/login

Admin Profile:
https://yourdomain.com/admin/profile

Driver Profile:
https://yourdomain.com/driver/profile

Member Profile:
https://yourdomain.com/member/profile

Admin Dashboard:
https://yourdomain.com/admin/dashboard

Driver Dashboard:
https://yourdomain.com/driver/dashboard

Member Dashboard:
https://yourdomain.com/member/dashboard
```

---

## Notes

- All profile pages are **mobile-responsive**
- Profile updates require API connection (may be placeholder in some cases)
- Password change is **optional** - you can update profile without changing password
- Profile pages include a "Back to Dashboard" link for easy navigation

---

## Need Help?

If you're having trouble accessing profiles:
1. Check that the database has the correct user roles
2. Verify the authentication system is working
3. Check browser console for JavaScript errors
4. Ensure the live server has the latest code deployed

