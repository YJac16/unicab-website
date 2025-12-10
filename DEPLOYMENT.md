# Deployment Guide for unicabtraveltours.com

## Quick Deploy Options

### Option 1: Vercel (Recommended - Easiest)
1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Deploy:**
   ```bash
   npm run build
   vercel --prod
   ```

3. **Connect Domain:**
   - Go to [vercel.com](https://vercel.com) → Your Project → Settings → Domains
   - Add `unicabtraveltours.com` and `www.unicabtraveltours.com`
   - Follow DNS instructions (add A/CNAME records)

**Note:** For Vercel, you'll need to create a `vercel.json` to handle the API routes:
```json
{
  "rewrites": [
    { "source": "/api/:path*", "destination": "/api/:path*" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### Option 2: Netlify
1. **Install Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   ```

2. **Deploy:**
   ```bash
   npm run build
   netlify deploy --prod --dir=dist
   ```

3. **Connect Domain:**
   - Netlify Dashboard → Site Settings → Domain Management
   - Add custom domain and follow DNS setup

### Option 3: Railway / Render (Full-Stack)
1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

2. **Deploy on Railway:**
   - Go to [railway.app](https://railway.app)
   - New Project → Deploy from GitHub
   - Select your repo
   - Railway auto-detects Node.js and runs `npm start`
   - Add custom domain in project settings

3. **Deploy on Render:**
   - Go to [render.com](https://render.com)
   - New → Web Service → Connect GitHub
   - Build Command: `npm run build`
   - Start Command: `node server.js`
   - Add custom domain in settings

### Option 4: Traditional Hosting (cPanel, etc.)
1. **Build the site:**
   ```bash
   npm run build
   ```

2. **Upload files:**
   - Upload entire project folder to your hosting
   - Or upload `dist/` folder + `server.js` + `package.json`

3. **Install dependencies on server:**
   ```bash
   npm install --production
   ```

4. **Run with PM2 (recommended):**
   ```bash
   npm install -g pm2
   pm2 start server.js --name unicab
   pm2 save
   pm2 startup
   ```

## DNS Configuration

### For unicabtraveltours.com:

**If using Vercel/Netlify:**
- Add CNAME record: `www` → `your-deployment-url.vercel.app` (or Netlify URL)
- Add A record: `@` → IP provided by hosting (or use CNAME flattening)

**If using Railway/Render:**
- Add CNAME record: `www` → `your-app.up.railway.app`
- Add CNAME record: `@` → `your-app.up.railway.app` (or use A record if provided)

**If using traditional hosting:**
- Add A record: `@` → Your server IP
- Add CNAME record: `www` → `unicabtraveltours.com`

## Environment Variables

Create a `.env` file (or set in hosting dashboard):
```
NODE_ENV=production
PORT=3000
```

## SSL/HTTPS

- **Vercel/Netlify:** Automatic SSL via Let's Encrypt
- **Railway/Render:** Automatic SSL
- **Traditional hosting:** Install Let's Encrypt certificate via cPanel or Certbot

## Post-Deployment Checklist

- [ ] Test `https://unicabtraveltours.com` loads correctly
- [ ] Test `https://www.unicabtraveltours.com` redirects (if configured)
- [ ] Test contact form submission
- [ ] Verify all images/assets load
- [ ] Test mobile responsiveness
- [ ] Check browser console for errors
- [ ] Set up email service for contact form (SendGrid, Mailgun, etc.)

## Email Integration (Contact Form)

Currently the contact form logs to console. To send real emails:

1. **Install Nodemailer:**
   ```bash
   npm install nodemailer
   ```

2. **Update `server.js`** to send emails (see example in comments)

3. **Add email credentials to environment variables:**
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   ```

## Monitoring

- Set up uptime monitoring (UptimeRobot, Pingdom)
- Enable error tracking (Sentry, LogRocket)
- Monitor server logs for contact form submissions

