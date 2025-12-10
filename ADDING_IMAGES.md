# Adding Logo and Images to Your Website

## Step 1: Add Your Files to the `public` Folder

1. **Copy your logo and images** to the `public` folder:
   ```
   E:\Code Work\Unicab Website\public\
   ├── logo.png (or logo.svg, logo.jpg)
   ├── hero-image.jpg
   ├── tour-image-1.jpg
   └── ... (any other images)
   ```

2. **Recommended file formats:**
   - **Logo:** PNG or SVG (transparent background preferred)
   - **Photos:** JPG or WebP (optimized for web)
   - **Icons:** SVG or PNG

3. **Recommended sizes:**
   - **Logo:** 200-300px wide, transparent PNG
   - **Hero images:** 1920x1080px or larger
   - **Tour/vehicle images:** 800x600px minimum

## Step 2: Update the Logo in the Header

1. **Open `src/App.jsx`**
2. **Find the logo section** (around line 102)
3. **Uncomment and update the logo image:**

```jsx
<a href="#home" className="logo" aria-label="Cape Elite Transfers and Tours - Home">
  <img src="/logo.png" alt="Cape Elite Transfers & Tours" className="logo-img" />
  {/* Remove or keep text below if you want text alongside logo */}
  {/* <span className="logo-main">Cape Elite</span>
  <span className="logo-sub">Transfers &amp; Tours</span> */}
</a>
```

**If your logo file has a different name:**
- Change `/logo.png` to `/your-logo-filename.png`

## Step 3: Add Images to Sections

### Hero Section Background Image

**Option A: CSS Background (Recommended)**
1. Add your hero image to `public/hero-bg.jpg`
2. Open `src/styles.css`
3. Find `.hero` section (around line 300)
4. Update:

```css
.hero {
  background-image: 
    url('/hero-bg.jpg'),
    radial-gradient(circle at 20% 10%, rgba(44, 195, 200, 0.12), transparent 35%);
  background-size: cover;
  background-position: center;
  /* ... rest of styles ... */
}
```

### Tour/Vehicle Images

**✅ Tour images are already set up in the code!**

1. **Add images to `public/` folder:**
   - `wine-tour.jpg` - Franschhoek Wine Tram (already configured)
   - `cape-town-tour.jpg` - For Cape Town city tour (optional)
   - `peninsula-tour.jpg` - For Peninsula tour (optional)
   - `safari.jpg` - For safari/wildlife tours (optional)
   - `vehicles/sedan.jpg` - Vehicle images (optional)
   - etc.

2. **To add images to other tours**, update `src/data.js`:

```javascript
const tours = [
  {
    id: "ct-city-table-mountain",
    name: "Cape Town & Table Mountain City Tour",
    image: "/cape-town-tour.jpg", // Add this line
    // ... rest of tour data
  },
  // ... other tours
];
```

3. **Tour images are automatically displayed** - The code in `src/App.jsx` already handles this:
   - Images appear at the top of tour cards
   - Hover effect with zoom animation
   - Responsive and optimized

4. **CSS is already configured** in `src/styles.css`:
   - `.tour-image-wrapper` - Container with proper spacing
   - `.tour-image` - Image styling with hover effects

## Step 4: Optimize Images (Important!)

Before uploading, optimize your images:

1. **Use online tools:**
   - [TinyPNG](https://tinypng.com) - Compress PNG/JPG
   - [Squoosh](https://squoosh.app) - Advanced compression
   - [ImageOptim](https://imageoptim.com) - Mac app

2. **Or use command line:**
   ```bash
   npm install -g sharp-cli
   sharp -i public/logo.png -o public/logo-optimized.png
   ```

## Step 5: Test Your Images

1. **Build the site:**
   ```powershell
   npm run build
   ```

2. **Start the server:**
   ```powershell
   node server.js
   ```

3. **Open browser:** `http://localhost:3000`
4. **Check that all images load correctly**

## File Structure Example

```
public/
├── logo.png
├── logo-white.png (for dark backgrounds)
├── hero-bg.jpg
├── favicon.ico
├── tours/
│   ├── cape-town-tour.jpg
│   ├── peninsula-tour.jpg
│   └── garden-route.jpg
├── vehicles/
│   ├── sedan.jpg
│   ├── suv.jpg
│   └── minivan.jpg
└── drivers/
    ├── driver-1.jpg
    └── driver-2.jpg
```

## Quick Reference: Image Paths

- Files in `public/` are accessible at the root:
  - `public/logo.png` → Use as `/logo.png` in code
  - `public/tours/cape-town.jpg` → Use as `/tours/cape-town.jpg`

- Vite automatically copies `public/` files to `dist/` during build

## Need Help?

If images don't show:
1. Check file names match exactly (case-sensitive)
2. Verify files are in `public/` folder (not `src/`)
3. Clear browser cache (Ctrl+Shift+R)
4. Check browser console for 404 errors

