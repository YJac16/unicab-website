# White Screen Debugging Guide

## 🔍 Immediate Steps

### 1. Open Browser Console (CRITICAL)
**Press F12** and check the **Console** tab for red error messages.

**Common errors to look for:**
- `Cannot find module` - Missing file or import error
- `Unexpected token` - Syntax error
- `is not defined` - Variable/function not found
- `Failed to fetch` - Network/API error
- `Cannot read property` - Null/undefined error

### 2. Check Network Tab
**Press F12 → Network tab**
- Look for files with **red status codes** (404, 500, etc.)
- Check if `main.jsx` loads (should be 200)
- Check if `App.jsx` loads
- Check if CSS files load

### 3. Check Terminal Output
Look at your terminal where `npm run dev` is running:
- Are there any **red error messages**?
- Does it say "Failed to compile"?
- Are there import errors?

## 🛠️ Quick Fixes

### Fix 1: Clear Browser Cache
1. **Hard Refresh:** `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
2. **Or clear cache completely:**
   - Chrome: Settings → Privacy → Clear browsing data
   - Firefox: Settings → Privacy → Clear Data
   - Edge: Settings → Privacy → Clear browsing data

### Fix 2: Restart Dev Server
1. **Stop server:** Press `Ctrl+C` in terminal
2. **Clear cache and restart:**
   ```bash
   npm run dev
   ```

### Fix 3: Check Environment Variables
Make sure `.env` file exists with:
```
VITE_SUPABASE_URL=your_url
VITE_SUPABASE_ANON_KEY=your_key
```

### Fix 4: Verify You're on Correct URL
- ✅ **Correct:** `http://localhost:5173` (check terminal for exact port)
- ❌ **Wrong:** `http://localhost:3000` (that's the backend API)

## 🐛 Common Causes

### Cause 1: JavaScript Error
**Symptom:** White screen, error in console
**Fix:** Check console for exact error, fix the issue

### Cause 2: Import Error
**Symptom:** "Cannot find module" in console
**Fix:** 
```bash
npm install
```

### Cause 3: AuthContext Hanging
**Symptom:** White screen, no errors, stuck loading
**Fix:** Added timeout - should auto-resolve after 5 seconds

### Cause 4: Missing Component
**Symptom:** "Component is not defined" error
**Fix:** Check that all imported components exist

## 📋 Diagnostic Checklist

Run through these steps:

1. **Browser Console (F12)**
   - [ ] Open Console tab
   - [ ] Look for red errors
   - [ ] Copy any error messages

2. **Network Tab (F12)**
   - [ ] Check if files are loading (200 = OK)
   - [ ] Look for 404 errors (file not found)
   - [ ] Check if main.jsx loads

3. **Terminal**
   - [ ] Check for compilation errors
   - [ ] Verify server is running
   - [ ] Check the URL shown

4. **Files**
   - [ ] `src/main.jsx` exists
   - [ ] `src/App.jsx` exists
   - [ ] `index.html` exists
   - [ ] `src/contexts/AuthContext.jsx` exists

## 🔧 What I Just Fixed

1. **Added ErrorBoundary** - Will catch React errors and show a friendly error page
2. **Added timeout to AuthContext** - Prevents infinite loading state
3. **Added root element check** - Better error if HTML is missing

## 🆘 Still White Screen?

**Please share:**
1. **Browser Console errors** (F12 → Console → Copy red errors)
2. **Terminal errors** (Copy any red text from `npm run dev`)
3. **Network tab status** (F12 → Network → Check main.jsx status)

This will help identify the exact issue!

