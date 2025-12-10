# Connecting unicabtraveltours.com Domain

This guide will help you connect your custom domain `unicabtraveltours.com` to your website.

## Prerequisites
- You own the domain `unicabtraveltours.com`
- Access to your domain registrar (where you bought the domain)
- A deployment platform account (Vercel, Netlify, etc.)

---

## Option 1: Vercel (Recommended - Easiest & Free)

### Step 1: Deploy to Vercel

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy your project:**
   ```bash
   vercel
   ```
   Follow the prompts. For production deployment:
   ```bash
   vercel --prod
   ```

   Or deploy via GitHub:
   - Push your code to GitHub
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Vite and deploy

### Step 2: Connect Your Domain

1. **In Vercel Dashboard:**
   - Go to your project → **Settings** → **Domains**

2. **Add Domain:**
   - Enter: `unicabtraveltours.com`
   - Click "Add"
   - Also add: `www.unicabtraveltours.com` (optional but recommended)

3. **Configure DNS:**
   Vercel will show you DNS records to add. You'll typically see:
   - **Type:** A Record
   - **Name:** @ (or blank)
   - **Value:** Vercel's IP address (e.g., `76.76.21.21`)

   OR

   - **Type:** CNAME Record
   - **Name:** www
   - **Value:** `cname.vercel-dns.com`

### Step 3: Update DNS at Your Domain Registrar

1. **Log into your domain registrar** (GoDaddy, Namecheap, Google Domains, etc.)

2. **Find DNS Management:**
   - Look for "DNS Settings", "DNS Management", or "Name Servers"

3. **Add DNS Records:**
   - Add the A record or CNAME record that Vercel provided
   - Save changes

4. **Wait for Propagation:**
   - DNS changes can take 24-48 hours, but usually work within a few hours
   - Check status at: [whatsmydns.net](https://www.whatsmydns.net)

### Step 4: SSL Certificate (Automatic)
- Vercel automatically provides SSL certificates (HTTPS)
- Your site will be available at `https://unicabtraveltours.com`

---

## Option 2: Netlify

### Step 1: Deploy to Netlify

1. **Install Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   ```

2. **Build your site:**
   ```bash
   npm run build
   ```

3. **Deploy:**
   ```bash
   netlify deploy --prod --dir=dist
   ```

   Or via GitHub:
   - Push to GitHub
   - Go to [netlify.com](https://netlify.com)
   - "Add new site" → "Import from Git"
   - Connect GitHub and select your repo
   - Build command: `npm run build`
   - Publish directory: `dist`

### Step 2: Connect Domain

1. **In Netlify Dashboard:**
   - Site Settings → Domain Management → Add custom domain
   - Enter: `unicabtraveltours.com`

2. **Configure DNS:**
   - Netlify will provide DNS records
   - Add them at your domain registrar

---

## Option 3: Railway / Render (Full-Stack with Backend)

If you need the backend API (`server.js`), use Railway or Render:

### Railway Setup:

1. **Push to GitHub**

2. **Go to [railway.app](https://railway.app)**
   - New Project → Deploy from GitHub
   - Select your repository

3. **Configure:**
   - Build Command: `npm run build`
   - Start Command: `node server.js`
   - Add environment variables if needed

4. **Add Custom Domain:**
   - Settings → Domains → Add `unicabtraveltours.com`
   - Follow DNS instructions

### Render Setup:

1. **Go to [render.com](https://render.com)**

2. **Create Web Service:**
   - Connect GitHub repository
   - Build Command: `npm run build`
   - Start Command: `node server.js`

3. **Add Custom Domain:**
   - Settings → Custom Domains → Add `unicabtraveltours.com`

---

## DNS Record Types Explained

### A Record (IPv4 Address)
- **Name:** @ (or blank for root domain)
- **Value:** IP address provided by hosting
- **Use for:** Root domain (`unicabtraveltours.com`)

### CNAME Record (Alias)
- **Name:** www
- **Value:** Hosting provider's domain
- **Use for:** Subdomains (`www.unicabtraveltours.com`)

### AAAA Record (IPv6 Address)
- Similar to A record but for IPv6
- Usually optional

---

## Common Domain Registrars DNS Setup

### GoDaddy:
1. Log in → My Products → DNS
2. Add/Edit records as provided by hosting

### Namecheap:
1. Domain List → Manage → Advanced DNS
2. Add new records

### Google Domains:
1. DNS → Custom resource records
2. Add records

### Cloudflare:
1. DNS → Records
2. Add A or CNAME records
3. **Note:** If using Cloudflare, set proxy status to "DNS only" (gray cloud) initially

---

## Testing Your Domain

1. **Check DNS Propagation:**
   - Visit [whatsmydns.net](https://www.whatsmydns.net)
   - Enter your domain
   - Check if DNS records are propagated globally

2. **Test Your Site:**
   - Visit `http://unicabtraveltours.com` (should redirect to HTTPS)
   - Visit `https://unicabtraveltours.com`

3. **Verify SSL:**
   - Your site should automatically have HTTPS
   - Check for padlock icon in browser

---

## Troubleshooting

### Domain Not Working?
- **Wait 24-48 hours** for DNS propagation
- Check DNS records are correct at registrar
- Verify records at [whatsmydns.net](https://www.whatsmydns.net)
- Clear browser cache
- Try incognito/private browsing

### SSL Certificate Issues?
- Most platforms (Vercel, Netlify) auto-provision SSL
- Wait a few minutes after domain connection
- Check platform dashboard for SSL status

### Site Shows "Not Found"?
- Verify build completed successfully
- Check deployment logs in platform dashboard
- Ensure `dist` folder is being deployed correctly

### React Router Not Working?
- Ensure your hosting platform is configured for SPA (Single Page Application)
- Vercel: Already configured in `vercel.json`
- Netlify: Create `_redirects` file in `public` folder:
  ```
  /*    /index.html   200
  ```

---

## Quick Checklist

- [ ] Code pushed to GitHub (if using Git deployment)
- [ ] Site deployed to hosting platform
- [ ] Domain added in hosting platform dashboard
- [ ] DNS records added at domain registrar
- [ ] Waited for DNS propagation (check with whatsmydns.net)
- [ ] Tested site at `https://unicabtraveltours.com`
- [ ] SSL certificate active (HTTPS working)

---

## Recommended: Vercel Setup

For the easiest setup, I recommend Vercel:

1. **Build command:** `npm run build`
2. **Output directory:** `dist`
3. **Install command:** `npm install`
4. **Framework preset:** Vite

The `vercel.json` file is already configured in your project!

---

## Need Help?

- **Vercel Docs:** [vercel.com/docs](https://vercel.com/docs)
- **Netlify Docs:** [docs.netlify.com](https://docs.netlify.com)
- **DNS Help:** Contact your domain registrar support

