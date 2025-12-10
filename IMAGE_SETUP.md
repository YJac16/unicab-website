# Image Setup Instructions

## Required Images

Add these images to the `public/` folder:

### 1. Logo
- **File:** `public/logo.png`
- **Description:** UNICAB Travel & Tours logo (white logo on transparent or dark background)
- **Recommended size:** 200-300px wide, PNG with transparency
- **Status:** ✅ Already configured in code

### 2. Main Hero Banner
- **File:** `public/cape-town-banner.jpg`
- **Description:** Cape Town aerial/cityscape image for the main hero section
- **Recommended size:** 1920x1080px or larger, JPG format
- **Status:** ✅ Already configured in code

### 3. Wine Tour Image
- **File:** `public/wine-tour.jpg`
- **Description:** Franschhoek Wine Tram image for wine tour card
- **Recommended size:** 800x600px, JPG format
- **Status:** ✅ Already configured in code (Franschhoek Wine Tram & Winelands Tour)

### 4. Safari Image (Aquila Private Game Reserve)
- **File:** `public/safari.jpg`
- **Description:** Aquila Private Game Reserve safari image
- **Recommended size:** 800x600px, JPG format
- **Status:** ✅ Already configured in code (Aquila Private Game Reserve Safari - Exclusive Partner)

## Quick Setup Steps

1. **Copy your images to the `public` folder:**
   ```
   E:\Code Work\Unicab Website\public\
   ├── logo.png              ← Your UNICAB logo
   ├── cape-town-banner.jpg  ← Cape Town cityscape for hero
   ├── wine-tour.jpg         ← Franschhoek Wine Tram image
   └── safari.jpg            ← Aquila Private Game Reserve image
   ```

2. **Build and test:**
   ```powershell
   npm run build
   node server.js
   ```

3. **Open browser:** `http://localhost:3000`
   - Check that logo appears in header
   - Check that Cape Town banner appears in hero section

## Image Optimization Tips

Before adding images, optimize them:

1. **Use online tools:**
   - [TinyPNG](https://tinypng.com) - Compress PNG/JPG
   - [Squoosh](https://squoosh.app) - Advanced compression with preview

2. **Recommended file sizes:**
   - Logo: Under 50KB
   - Hero banner: Under 500KB (optimized)
   - Tour images: Under 200KB each

3. **Formats:**
   - Logo: PNG (with transparency)
   - Photos: JPG or WebP (better compression)

## Current Image Configuration

### Logo (Header)
- **Location:** `src/App.jsx` line ~102
- **Path:** `/logo.png`
- **CSS Class:** `.logo-img`

### Hero Banner
- **Location:** `src/styles.css` line ~304
- **Path:** `/cape-town-banner.jpg`
- **CSS Class:** `.hero-bg-image`

## Troubleshooting

**Images not showing?**
1. Check file names match exactly (case-sensitive)
2. Verify files are in `public/` folder (not `src/`)
3. Clear browser cache (Ctrl+Shift+R)
4. Check browser console for 404 errors
5. Rebuild: `npm run build`

**Logo too big/small?**
- Edit `src/styles.css` → `.logo-img` → adjust `height` value

**Hero image not covering properly?**
- Edit `src/styles.css` → `.hero-bg-image` → adjust `background-size` or `background-position`

## Next Steps

After adding images:
1. ✅ Test locally
2. ✅ Push to GitHub
3. ✅ Deploy to production
4. ✅ Verify images load on live site

