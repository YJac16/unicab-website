# Managing Users and Profiles - Complete Guide

## Overview

This guide explains how to:
1. **Access profiles** for Admin, Driver, and Member accounts
2. **Create and manage** Admin and Driver accounts
3. **Allow Members** to register themselves

---

## 📋 Table of Contents

1. [Accessing Profiles](#accessing-profiles)
2. [Creating Admin Accounts](#creating-admin-accounts)
3. [Creating Driver Accounts](#creating-driver-accounts)
4. [Member Registration](#member-registration)
5. [Editing Profile Details](#editing-profile-details)

---

## 🔐 Accessing Profiles

### Admin Profile

**URL:** `https://www.unicabtravelandtours.com/admin/profile`

**How to Access:**
1. Sign in as Admin at `/login`
2. Click your name in the top right corner
3. Click "Profile" in the dropdown menu
4. Or go directly to `/admin/profile`

**What You Can Do:**
- ✅ View and edit your name
- ✅ View and edit your email
- ✅ Change your password (optional)
- ✅ View account information

### Driver Profile

**URL:** `https://www.unicabtravelandtours.com/driver/profile`

**How to Access:**
1. Sign in as Driver at `/login`
2. Click your name in the top right corner
3. Click "Profile" in the dropdown menu
4. Or go directly to `/driver/profile`

**What You Can Do:**
- ✅ View and edit your name
- ✅ View and edit your email
- ✅ View and edit your phone number
- ✅ Change your password (optional)
- ✅ View driver-specific information

### Member Profile

**URL:** `https://www.unicabtravelandtours.com/member/profile`

**How to Access:**
1. Sign in as Member at `/login` or `/member/login`
2. Click your name in the top right corner
3. Click "Profile" in the dropdown menu
4. Or go directly to `/member/profile`

**What You Can Do:**
- ✅ View and edit your name
- ✅ View and edit your email
- ✅ View and edit your phone number
- ✅ Change your password (optional)
- ✅ View member account information

---

## 👤 Creating Admin Accounts

Currently, Admin accounts need to be created via **SQL** or **script**. There are two methods:

### Method 1: Using the Script (Recommended)

1. **Run the admin creation script:**
   ```bash
   node scripts/create-admin.js
   ```

2. **Follow the prompts:**
   - Enter admin email (or press Enter for default: `admin@unicabtravel.co.za`)
   - Enter admin password
   - Enter admin name (or press Enter for default: `Admin User`)

3. **Copy the generated SQL** and run it in your database (Supabase SQL Editor, pgAdmin, etc.)

### Method 2: Manual SQL Creation

1. **Generate a password hash:**
   ```bash
   node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('YourPassword123!', 10).then(h => console.log(h));"
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

### Method 3: Using API (If authenticated as Admin)

You can also create admins via API if you're already logged in as an admin:

```javascript
// POST /api/auth/register
// Headers: Authorization: Bearer <admin-token>
// Body:
{
  "name": "New Admin",
  "email": "newadmin@unicabtravel.co.za",
  "password": "SecurePassword123!",
  "role": "ADMIN"
}
```

**Note:** The API endpoint `/api/auth/register` supports creating ADMIN accounts, but requires admin authentication.

---

## 🚗 Creating Driver Accounts

**Drivers can be created through the Admin Dashboard UI!**

### Steps to Create a Driver:

1. **Sign in as Admin:**
   - Go to `https://www.unicabtravelandtours.com/login`
   - Enter admin credentials
   - You'll be redirected to `/admin/dashboard`

2. **Navigate to Drivers Section:**
   - On the Admin Dashboard, scroll to the "Drivers" section
   - Click the **"+ Add Driver"** button

3. **Fill in Driver Details:**
   - **Name:** Driver's full name
   - **Email:** Driver's email address
   - **Password:** Temporary password (minimum 6 characters)
   - Click **"Create Driver"**

4. **Driver Account Created:**
   - The system will:
     - Create a guide entry
     - Create a user account with DRIVER role
     - Link them together
   - The driver can now sign in and access their dashboard

### Driver Details After Creation:

- Driver can sign in at `/login` using their email and password
- Driver can access their profile at `/driver/profile` to:
  - Update their name, email, phone number
  - Change their password
  - View their driver information

---

## 👥 Member Registration

**Members can register themselves!** No admin action required.

### How Members Register:

1. **Go to Registration Page:**
   - URL: `https://www.unicabtravelandtours.com/member/register`
   - Or click "Create Member Account" link on the login page

2. **Fill in Registration Form:**
   - **Full Name:** Member's name
   - **Email:** Member's email address
   - **Password:** Minimum 6 characters
   - **Confirm Password:** Must match password

3. **Submit Registration:**
   - Click "Create Account"
   - Member account is created automatically
   - Member is logged in and redirected to `/member/dashboard`

4. **Member Can Access Profile:**
   - After registration, member can:
     - Go to `/member/profile` to edit their details
     - Update name, email, phone number
     - Change password

### Registration Features:

- ✅ **Public Registration:** No authentication required
- ✅ **Automatic Login:** Member is logged in after registration
- ✅ **Role Assignment:** Automatically assigned MEMBER role
- ✅ **Email Validation:** Validates email format
- ✅ **Password Strength:** Minimum 6 characters required

---

## ✏️ Editing Profile Details

### For All Users (Admin, Driver, Member):

1. **Access Your Profile:**
   - Sign in to your account
   - Click your name in the top right
   - Click "Profile" in the dropdown
   - Or go directly to your profile URL

2. **Edit Your Information:**
   - **Name:** Update your full name
   - **Email:** Update your email address
   - **Phone:** Update phone number (Driver/Member only)
   - **Password:** Optionally change your password

3. **Save Changes:**
   - Click "Save Changes" button
   - Your profile will be updated

### Profile Form Fields:

**Admin Profile:**
- Name (required, min 2 characters)
- Email (required, valid email format)
- Current Password (if changing password)
- New Password (optional, min 6 characters)
- Confirm New Password (if changing password)

**Driver Profile:**
- Name (required, min 2 characters)
- Email (required, valid email format)
- Phone Number (optional)
- Current Password (if changing password)
- New Password (optional, min 6 characters)
- Confirm New Password (if changing password)

**Member Profile:**
- Name (required, min 2 characters)
- Email (required, valid email format)
- Phone Number (optional)
- Current Password (if changing password)
- New Password (optional, min 6 characters)
- Confirm New Password (if changing password)

---

## 🔑 Quick Reference URLs

Replace `www.unicabtravelandtours.com` with your actual domain:

### Login & Registration:
- **Login:** `https://www.unicabtravelandtours.com/login`
- **Member Registration:** `https://www.unicabtravelandtours.com/member/register`

### Profiles:
- **Admin Profile:** `https://www.unicabtravelandtours.com/admin/profile`
- **Driver Profile:** `https://www.unicabtravelandtours.com/driver/profile`
- **Member Profile:** `https://www.unicabtravelandtours.com/member/profile`

### Dashboards:
- **Admin Dashboard:** `https://www.unicabtravelandtours.com/admin/dashboard`
- **Driver Dashboard:** `https://www.unicabtravelandtours.com/driver/dashboard`
- **Member Dashboard:** `https://www.unicabtravelandtours.com/member/dashboard`

---

## 📝 Summary

### Admin Accounts:
- ✅ **Create:** Via SQL script or API
- ✅ **Edit:** Through `/admin/profile`
- ✅ **Manage Drivers:** Through Admin Dashboard

### Driver Accounts:
- ✅ **Create:** Through Admin Dashboard (UI)
- ✅ **Edit:** Through `/driver/profile`
- ✅ **Self-Service:** Drivers can update their own details

### Member Accounts:
- ✅ **Create:** Self-registration at `/member/register`
- ✅ **Edit:** Through `/member/profile`
- ✅ **No Admin Required:** Members register themselves

---

## 🚀 Next Steps

1. **Create your first Admin account** using the script or SQL
2. **Sign in as Admin** and create Driver accounts through the dashboard
3. **Test Member Registration** by visiting `/member/register`
4. **Access profiles** to verify all users can edit their details

---

## ⚠️ Important Notes

- **Password Security:** Use strong passwords for all accounts
- **Email Uniqueness:** Each email can only be used once
- **Role-Based Access:** Users can only access their own profile pages
- **Profile Updates:** Currently uses placeholder API - connect to backend for actual updates
- **Admin Creation:** Consider adding a UI for creating admins in the future

---

## 🆘 Troubleshooting

### Can't Access Profile?
- Make sure you're logged in
- Check that you have the correct role
- Try hard refresh (Ctrl+Shift+R)

### Can't Create Driver?
- Verify you're signed in as Admin
- Check that database is connected
- Ensure email is unique

### Member Registration Failing?
- Check email format is valid
- Ensure password is at least 6 characters
- Verify email isn't already registered
- Check browser console for errors

---

For more details, see:
- `HOW_TO_ACCESS_PROFILES.md` - Detailed profile access guide
- `ADMIN_LOGIN_SETUP.md` - Admin account setup
- `TEST_LOGIN_CREDENTIALS.md` - Test account information








