# Troubleshooting - Website Not Showing on Localhost

## Quick Fixes

### 1. Install Dependencies First

If you haven't installed dependencies yet:

```bash
npm install
```

Wait for it to complete, then try again.

### 2. Check if Port is Already in Use

The dev server uses port 5173 by default. If something else is using it:

**Option A:** Kill the process using the port (Windows PowerShell):
```powershell
netstat -ano | findstr :5173
# Note the PID number, then:
taskkill /PID <PID_NUMBER> /F
```

**Option B:** Use a different port:
```bash
npm run dev -- --port 3001
```

### 3. Check for Errors in Terminal

When you run `npm run dev`, look for:
- ✅ "Local: http://localhost:5173/" - This means it's working!
- ❌ Any red error messages - These need to be fixed

### 4. Try These Commands in Order

```bash
# Step 1: Make sure you're in the project directory
cd "e:\Code Work\Unicab Website"

# Step 2: Install dependencies (if not done)
npm install

# Step 3: Start the dev server
npm run dev
```

### 5. Check the Terminal Output

After running `npm run dev`, you should see something like:

```
  VITE v6.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

**Copy the exact URL shown** (it might be a different port like 5174, 5175, etc.)

### 6. Open the Correct URL

- The terminal will show the exact URL to use
- It's usually `http://localhost:5173/`
- But could be `http://localhost:5174/` or another port
- **Use the exact URL shown in your terminal**

## Common Issues

### Issue: "Cannot find module" errors

**Solution:**
```bash
npm install
```

### Issue: Port already in use

**Solution:**
- Close other terminals running the dev server
- Or use a different port: `npm run dev -- --port 3001`

### Issue: "Command not found: npm"

**Solution:**
- Make sure Node.js is installed
- Download from: https://nodejs.org/
- Restart your terminal after installing

### Issue: Blank page or "Cannot GET /"

**Solution:**
- Make sure you're accessing the **root URL**: `http://localhost:5173/`
- Not `http://localhost:5173/api` or other paths
- Check browser console (F12) for errors

### Issue: "Failed to load resource" errors

**Solution:**
- Check that all files are saved
- Make sure `src/main.jsx` exists
- Check browser console for specific error messages

## Step-by-Step Debugging

1. **Open Terminal/PowerShell**
   - Navigate to project: `cd "e:\Code Work\Unicab Website"`

2. **Check Node.js is installed:**
   ```bash
   node --version
   npm --version
   ```
   - Should show version numbers (e.g., v18.x.x, 9.x.x)

3. **Install dependencies:**
   ```bash
   npm install
   ```
   - Wait for it to finish (may take 1-2 minutes)

4. **Start dev server:**
   ```bash
   npm run dev
   ```

5. **Look for the URL in terminal:**
   - Should show: `Local: http://localhost:XXXX/`
   - Copy that exact URL

6. **Open in browser:**
   - Paste the URL in your browser
   - Should see the website

## Still Not Working?

### Check These Files Exist:
- ✅ `package.json`
- ✅ `index.html`
- ✅ `src/main.jsx`
- ✅ `src/App.jsx`
- ✅ `vite.config.mjs`

### Check Browser Console:
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for red error messages
4. Share those errors for help

### Check Terminal for Errors:
- Copy any error messages from the terminal
- Look for file path errors
- Look for import errors

## Alternative: Build and Serve

If dev server doesn't work, try building:

```bash
# Build the project
npm run build

# Preview the build
npm run preview
```

This will serve the built version on a different port (usually 4173).

## Need More Help?

Share:
1. The exact error message from terminal
2. The exact error from browser console (F12)
3. What you see when you visit localhost (blank page? error page?)
4. The output of `npm run dev`







