# Quick Fix: White Page Issue

## Most Likely Causes

### 1. Missing Dependencies (Most Common)

The backend needs `bcrypt` and `jsonwebtoken`. Install them:

```bash
npm install
```

This will install all dependencies including the new ones.

### 2. Wrong Port / Wrong Server

**Make sure you're accessing the FRONTEND server:**
- ✅ Correct: `http://localhost:5173` (Vite dev server)
- ❌ Wrong: `http://localhost:3000` (Express API server - will show white page)

**Check your terminal output:**
- When you run `npm run dev`, it shows: `Local: http://localhost:XXXX/`
- Use that EXACT URL

### 3. JavaScript Error

**Check browser console:**
1. Press F12
2. Go to Console tab
3. Look for red errors
4. Common errors:
   - `Cannot find module` → Run `npm install`
   - `Unexpected token` → Syntax error in a file
   - `Failed to fetch` → Backend not running

### 4. Server Not Running

Make sure the dev server is actually running:
```bash
npm run dev
```

You should see:
```
VITE v6.x.x  ready in xxx ms
➜  Local:   http://localhost:5173/
```

## Step-by-Step Fix

1. **Stop any running servers** (Ctrl+C)

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start dev server:**
   ```bash
   npm run dev
   ```

4. **Copy the URL from terminal** (usually `http://localhost:5173/`)

5. **Open in browser** and press F12 → Console

6. **Share any errors** you see in the console

## If Still Not Working

**Check these files exist:**
- ✅ `src/main.jsx`
- ✅ `src/App.jsx`
- ✅ `index.html`

**Check for syntax errors:**
- All new files should have `export default`
- All imports should be correct

**Try clearing cache:**
- Hard refresh: `Ctrl+Shift+R`
- Or clear browser cache completely

## Common Error Messages

### "Cannot find module 'bcrypt'"
**Fix:** `npm install`

### "Cannot find module './pages/MemberLogin'"
**Fix:** Check that `src/pages/MemberLogin.jsx` exists and has `export default`

### "Unexpected token"
**Fix:** Check for syntax errors in the file mentioned in the error

### Blank page, no console errors
**Fix:** Check you're on the right URL (port 5173, not 3000)


