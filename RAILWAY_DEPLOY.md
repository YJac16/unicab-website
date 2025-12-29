# Deploy to Railway and Connect Domain

This guide will help you deploy your UNICAB website to Railway and connect your custom domain `unicabtraveltours.com`.

## Step 1: Prepare Your Project

Your project is already configured for Railway! The `railway.json` file is set up.

## Step 2: Deploy to Railway

### Option A: Via Railway Dashboard (Easiest)

1. **Go to Railway:**
   - Visit [railway.app](https://railway.app)
   - Sign up or log in (you can use GitHub to sign in)

2. **Create New Project:**
   - Click **"New Project"**
   - Select **"Deploy from GitHub repo"**
   - Authorize Railway to access your GitHub
   - Select your repository: `YJac16/unicab-website`

3. **Configure Build Settings:**
   - Railway will auto-detect your project
   - **Build Command:** `npm run build` (should auto-detect)
   - **Start Command:** `node server.js` (should auto-detect)
   - **Root Directory:** Leave as default (`.`)

4. **Add Environment Variables (if needed):**
   - Go to **Variables** tab
   - Add `NODE_ENV=production`
   - Add `PORT` (Railway will auto-assign, but you can set it)

5. **Deploy:**
   - Railway will automatically start building and deploying
   - Wait for deployment to complete (usually 2-5 minutes)
   - You'll get a Railway URL like: `https://your-app.up.railway.app`

### Option B: Via Railway CLI

1. **Install Railway CLI:**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login:**
   ```bash
   railway login
   ```

3. **Initialize Project:**
   ```bash
   railway init
   ```

4. **Deploy:**
   ```bash
   railway up
   ```

## Step 3: Connect Your Custom Domain

### In Railway Dashboard:

1. **Go to Your Project:**
   - Click on your deployed project

2. **Open Settings:**
   - Click **"Settings"** tab
   - Scroll to **"Domains"** section

3. **Add Custom Domain:**
   - Click **"Add Domain"** or **"Custom Domain"**
   - Enter: `unicabtraveltours.com`
   - Click **"Add"**

4. **Add WWW Subdomain (Optional but Recommended):**
   - Add another domain: `www.unicabtraveltours.com`
   - Railway will handle redirects

5. **Get DNS Records:**
   - Railway will show you DNS records to add
   - You'll typically see:
     - **Type:** CNAME
     - **Name:** @ (or blank for root domain)
     - **Value:** `your-app.up.railway.app` (or similar)
   
   OR
   
     - **Type:** A Record
     - **Name:** @
     - **Value:** Railway's IP address

## Step 4: Configure DNS at Your Domain Registrar

1. **Log into Your Domain Registrar:**
   - Go to where you bought `unicabtraveltours.com`
   - (GoDaddy, Namecheap, Google Domains, etc.)

2. **Find DNS Management:**
   - Look for "DNS Settings", "DNS Management", or "Name Servers"

3. **Add DNS Records:**
   - Add the CNAME or A record that Railway provided
   - For root domain (`unicabtraveltours.com`):
     - **Type:** CNAME or A
     - **Name:** @ (or blank)
     - **Value:** Railway's provided value
   
   - For www subdomain:
     - **Type:** CNAME
     - **Name:** www
     - **Value:** Railway's provided value

4. **Save Changes**

## Step 5: Wait for DNS Propagation

- DNS changes can take **24-48 hours**, but usually work within **1-2 hours**
- Check propagation status at: [whatsmydns.net](https://www.whatsmydns.net)
- Enter your domain and check if DNS records are propagated

## Step 6: SSL Certificate (Automatic)

- Railway **automatically provides SSL certificates** (HTTPS)
- Once DNS propagates, your site will be available at:
  - `https://unicabtraveltours.com`
  - `https://www.unicabtraveltours.com`

## Important Notes for Railway

### Port Configuration

Railway automatically assigns a `PORT` environment variable. Your `server.js` should use:

```javascript
const PORT = process.env.PORT || 3000;
```

(Your server.js already has this!)

### Build Process

Railway will:
1. Run `npm install`
2. Run `npm run build` (builds your React app)
3. Run `node server.js` (starts your server)

### Static Files

Your `server.js` serves the `dist` folder (built React app), which is perfect for Railway.

## Troubleshooting

### Domain Not Working?

1. **Check DNS Records:**
   - Verify records are correct at your registrar
   - Check at [whatsmydns.net](https://www.whatsmydns.net)

2. **Wait for Propagation:**
   - DNS can take up to 48 hours
   - Usually works within 1-2 hours

3. **Check Railway Logs:**
   - Go to Railway dashboard → Your project → **Deployments** → Click on deployment → **View Logs**
   - Look for any errors

4. **Verify Build:**
   - Make sure `npm run build` completes successfully
   - Check that `dist` folder is created

### SSL Certificate Issues?

- Railway auto-provisions SSL
- Wait a few minutes after domain connection
- Check Railway dashboard for SSL status

### React Router Not Working?

Your `server.js` already handles this with:
```javascript
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});
```

This ensures all routes work correctly!

## Railway Pricing

- **Hobby Plan:** Free tier available (with limitations)
- **Pro Plan:** $5/month (recommended for production)
- Check [railway.app/pricing](https://railway.app/pricing) for current plans

## Quick Checklist

- [ ] Railway account created
- [ ] Project deployed from GitHub
- [ ] Build successful (check logs)
- [ ] Custom domain added in Railway
- [ ] DNS records added at domain registrar
- [ ] Waited for DNS propagation
- [ ] Tested site at `https://unicabtraveltours.com`
- [ ] SSL certificate active

## Need Help?

- **Railway Docs:** [docs.railway.app](https://docs.railway.app)
- **Railway Discord:** [discord.gg/railway](https://discord.gg/railway)
- **Support:** Check Railway dashboard for support options

Your website is ready to deploy! 🚀








