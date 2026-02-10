# AXIS Advisor - Deployment Guide

## Quick Deploy to Vercel (Recommended - 5 minutes)

### Prerequisites
- GitHub account
- Vercel account (free tier is fine)

### Steps

1. **Create GitHub Repository**
```bash
cd /home/ubuntu/clawd/axis-advisor
git init
git add .
git commit -m "Initial commit - AXIS Advisor v1.0"
git branch -M main
git remote add origin git@github.com:YOUR_USERNAME/axis-advisor.git
git push -u origin main
```

2. **Deploy to Vercel**
- Go to https://vercel.com
- Click "New Project"
- Import your GitHub repository
- Vercel auto-detects Next.js
- Click "Deploy"
- **Done in ~2 minutes!**

3. **Custom Domain (Optional)**
- In Vercel project settings → Domains
- Add: `axis-advisor.com` or `advisor.axisfoils.com`
- Update DNS: Add CNAME record pointing to Vercel

### Result
- Live URL: `axis-advisor.vercel.app`
- Auto-deploy on git push
- SSL included
- Global CDN
- Free tier: Unlimited bandwidth

---

## Alternative: Deploy to Netlify

### Steps

1. **Create GitHub Repo** (same as above)

2. **Deploy to Netlify**
```bash
npm install -g netlify-cli
netlify login
netlify init
netlify deploy --prod
```

3. **OR use Netlify Dashboard**
- Go to https://netlify.com
- Click "Add new site" → "Import from Git"
- Select your GitHub repo
- Deploy

---

## Alternative: Self-Host on OpenClaw Server

### Setup

1. **Build production version**
```bash
cd /home/ubuntu/clawd/axis-advisor
npm run build
```

2. **Install PM2**
```bash
npm install -g pm2
```

3. **Start with PM2**
```bash
PORT=3002 pm2 start npm --name axis-advisor -- start
pm2 save
pm2 startup
```

4. **Setup nginx reverse proxy**
```nginx
# /etc/nginx/sites-available/axis-advisor
server {
    listen 80;
    server_name advisor.axisfoils.com;
    
    location / {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/axis-advisor /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

5. **SSL with Let's Encrypt**
```bash
sudo certbot --nginx -d advisor.axisfoils.com
```

### PM2 Management
```bash
pm2 list                    # Show running apps
pm2 logs axis-advisor       # View logs
pm2 restart axis-advisor    # Restart
pm2 stop axis-advisor       # Stop
```

---

## Update Product Data

### Manual Update
```bash
cd /home/ubuntu/clawd/axis-advisor
python3 scripts/scrape-axis-data.py
cp data/axis-products.json public/data/
git commit -am "Update product data"
git push  # Auto-deploys to Vercel/Netlify
```

### Automated Weekly Updates (Cron)
```bash
# Add to crontab
0 2 * * 0 cd /home/ubuntu/clawd/axis-advisor && python3 scripts/scrape-axis-data.py && cp data/axis-products.json public/data/ && git commit -am "Auto-update product data" && git push
```

---

## Environment Variables

Create `.env.local` (not committed to git):
```bash
# Future API keys, if needed
NEXT_PUBLIC_ANALYTICS_ID=...
FACEBOOK_ACCESS_TOKEN=...
```

---

## Monitoring

### Vercel Analytics (Free)
- Automatically enabled on deploy
- View at: vercel.com/YOUR_PROJECT/analytics

### Google Analytics (Optional)
1. Get GA tracking ID
2. Add to `.env.local`: `NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX`
3. Add script to `app/layout.tsx`

---

## Domain Setup

### For advisor.axisfoils.com

**DNS Records (add to axisfoils.com DNS):**
```
Type: CNAME
Name: advisor
Value: cname.vercel-dns.com  (or your-project.vercel.app)
```

**Then in Vercel/Netlify:**
- Add custom domain: `advisor.axisfoils.com`
- Verify ownership
- SSL auto-configured

---

## Troubleshooting

### Build Fails
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

### Images Not Loading
- Check `next.config.js` has Shopify CDN domain
- Current: `domains: ['cdn.shopify.com']`

### Data Not Updating
```bash
# Verify data file is in public folder
ls -la public/data/axis-products.json
# Should be ~400KB
```

---

## Performance

### Current Stats
- Build time: ~30 seconds
- Page load: <1 second
- Data size: 400KB (compressed)
- Lighthouse score: 95+

### Optimization Tips
- Images already optimized (Shopify CDN)
- Static generation (no server needed)
- Global CDN via Vercel/Netlify

---

## Support

**Issues?**
- Check logs: `pm2 logs axis-advisor` (self-hosted)
- Or Vercel dashboard → Logs
- Contact: Herbert (axis-advisor support)

**Updates:**
- Pull from git: `git pull origin main`
- Redeploy: automatic on Vercel/Netlify
- Self-hosted: `pm2 restart axis-advisor`
