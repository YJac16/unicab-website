# Quick Fix: Localhost Site Not Showing

## 🚀 Quick Start (3 Steps)

### Step 1: Install Dependencies (if not done)
```bash
cd "E:\Code Work\Unicab Website"
npm install
```

### Step 2: Start the Dev Server
```bash
npm run dev
```

### Step 3: Open the URL Shown
- Look in your terminal for: `Local: http://localhost:5173/`
- Copy that exact URL and open it in your browser
- **Important:** Use the port number shown in your terminal (might be 5173, 5174, etc.)

## 🔍 Troubleshooting

### Issue: "Command not found: npm"
**Solution:** Install Node.js from https://nodejs.org/

### Issue: Port Already in Use
**Solution:** 
```powershell
# Find what's using port 5173
netstat -ano | findstr :5173

# Kill the process (replace PID with the number from above)
taskkill /PID <PID_NUMBER> /F

# Or use a different port
npm run dev -- --port 3001
```

### Issue: White Page / Blank Screen
1. **Open Browser DevTools (F12)**
2. **Check Console tab for errors**
3. **Check Network tab** - Are files loading? (200 = OK, 404 = missing)

### Issue: "Cannot find module" Errors
**Solution:**
```bash
npm install
```

### Issue: Wrong Port
- ✅ **Correct:** `http://localhost:5173` (Vite frontend)
- ❌ **Wrong:** `http://localhost:3000` (Express backend - will show white page)

## 📋 What You Should See

### In Terminal:
```
VITE v6.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### In Browser:
- UNICAB Travel & Tours homepage
- Logo in header
- Navigation menu
- No errors in console (F12)

## 🛠️ Complete Reset (If Nothing Works)

1. **Stop all servers** (Ctrl+C in all terminals)

2. **Clear and reinstall:**
   ```bash
   cd "E:\Code Work\Unicab Website"
   Remove-Item -Recurse -Force node_modules
   Remove-Item package-lock.json
   npm install
   ```

3. **Start fresh:**
   ```bash
   npm run dev
   ```

4. **Open the URL shown in terminal**

## ✅ Verification Checklist

- [ ] Dependencies installed (`node_modules` folder exists)
- [ ] Dev server running (`npm run dev` shows URL)
- [ ] Using correct URL (from terminal, usually port 5173)
- [ ] No errors in terminal
- [ ] No errors in browser console (F12)
- [ ] Browser shows the website (not white page)

## 🆘 Still Not Working?

1. **Check browser console (F12 → Console tab)**
   - Copy any red error messages
   - Share them for help

2. **Check terminal output**
   - Copy any error messages
   - Share them for help

3. **Verify files exist:**
   - `src/main.jsx` exists
   - `src/App.jsx` exists
   - `index.html` exists
   - `package.json` exists

