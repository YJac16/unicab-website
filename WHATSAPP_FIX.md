# WhatsApp Link Fix Guide

## Problem: wa.link Short Links Don't Work

The `wa.link` short links (like `https://wa.link/xp8w06`) can expire or become invalid. This is why you're seeing "it does not exist" when opening the link.

## Solution: Use Direct wa.me Format

The direct `wa.me` format is more reliable and doesn't expire. The codebase now uses a centralized configuration file for easy updates.

## How to Update Your WhatsApp Number

### Step 1: Open the Config File

Open `src/config.js` and update the WhatsApp number:

```javascript
whatsapp: {
  number: "+27822818105", // Your full number with country code
  displayNumber: "+27 82 281 8105", // Formatted for display
  link: "https://wa.me/+27822818105", // Direct link (recommended)
  linkWithMessage: "https://wa.me/+27822818105?text=Hello%2C%20I%27d%20like%20to%20inquire%20about%20your%20services"
}
```

### Step 2: Convert Your Phone Number

**Format Rules:**
- Remove all spaces, dashes, and special characters
- Include country code (e.g., for South Africa: +27)
- Remove leading zero from local numbers
- Keep the `+` sign

**Examples:**
- South Africa: `+27822818105` (if local number is 082 281 8105)
- If your number is `+27 82 123 4567`, use: `+27821234567`
- If your number is `082 123 4567` (South Africa), use: `+27821234567`

### Step 3: Update the Config

Replace the number in `src/config.js`:

```javascript
whatsapp: {
  number: "+27XXXXXXXXX", // Replace with your number
  displayNumber: "+27 XX XXX XXXX", // Replace with formatted display
  link: "https://wa.me/+27XXXXXXXXX", // Replace with your number
  linkWithMessage: "https://wa.me/+27XXXXXXXXX?text=Hello%2C%20I%27d%20like%20to%20inquire%20about%20your%20services"
}
```

## Files Already Updated

The following files have been updated to use the config:
- ✅ `src/pages/Home.jsx`
- ✅ `src/pages/TourConfirmation.jsx`

## Files That Still Need Updating

To complete the migration, update these files to import and use `siteConfig`:

1. `src/pages/TourDetail.jsx`
2. `src/pages/Tours.jsx`
3. `src/pages/Vehicles.jsx`
4. `src/pages/Drivers.jsx`
5. `src/pages/Reviews.jsx`
6. `src/pages/Membership.jsx`
7. `src/pages/MembershipComparison.jsx`

### How to Update Each File

1. **Add import at the top:**
```javascript
import { siteConfig } from "../config";
```

2. **Replace hardcoded links:**
   - `https://wa.me/+27822818105` → `{siteConfig.whatsapp.link}`
   - `+27 82 281 8105` → `{siteConfig.whatsapp.displayNumber}`
   - `https://wa.me/+27822818105?text=...` → `{siteConfig.whatsapp.linkWithMessage}`
   - `info@unicabtravel.co.za` → `{siteConfig.email}`

## Testing

After updating:
1. Click any WhatsApp link on your site
2. It should open WhatsApp with the correct number
3. Test on both desktop (WhatsApp Web) and mobile (WhatsApp App)

## Why This is Better

✅ **Direct links don't expire** - Unlike `wa.link` short links  
✅ **Centralized configuration** - Update once, changes everywhere  
✅ **More reliable** - Works consistently across all devices  
✅ **Easier maintenance** - One file to update instead of many

## Need Help?

If you need to convert a `wa.link` to find the phone number:
1. Try opening the link in a browser
2. Check if it redirects to a `wa.me` link
3. Extract the number from the redirect URL
4. Or check your WhatsApp Business settings for the link details







