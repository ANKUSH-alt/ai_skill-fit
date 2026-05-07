# ✅ DEPLOYMENT CHECKLIST

## Pre-Deployment

### Code Preparation
- [ ] All features tested locally
- [ ] No console errors
- [ ] Build succeeds: `npm run build`
- [ ] Backend runs without errors
- [ ] All environment variables documented
- [ ] Sensitive data removed from code
- [ ] .gitignore updated

### Security
- [ ] Change default admin password
- [ ] Generate strong SECRET_KEY (32+ chars)
- [ ] Review CORS settings
- [ ] Enable HTTPS only
- [ ] Add rate limiting (optional)
- [ ] Review file upload limits
- [ ] Enable Supabase RLS policies

### Documentation
- [ ] README.md updated
- [ ] DEPLOYMENT.md reviewed
- [ ] API endpoints documented
- [ ] Environment variables listed
- [ ] Deployment credentials secured

## Deployment Steps

### 1. Database Setup (Supabase)
- [ ] Create Supabase account
- [ ] Create new project
- [ ] Run SQL schema (from DEPLOYMENT.md)
- [ ] Copy Supabase URL
- [ ] Copy Supabase Key
- [ ] Test connection
- [ ] Enable RLS policies (optional)
- [ ] Setup backups

### 2. Backend Deployment

#### Option A: Railway (Free)
- [ ] Create Railway account
- [ ] Install Railway CLI: `npm install -g @railway/cli`
- [ ] Login: `railway login`
- [ ] Initialize: `railway init`
- [ ] Add environment variables:
  - [ ] SUPABASE_URL
  - [ ] SUPABASE_KEY
  - [ ] SECRET_KEY
  - [ ] OPENAI_API_KEY (optional)
  - [ ] DEBUG=False
- [ ] Deploy: `railway up`
- [ ] Copy backend URL
- [ ] Test health endpoint: `/health`

#### Option B: Render (Free)
- [ ] Create Render account
- [ ] New Web Service
- [ ] Connect GitHub repo
- [ ] Set build command: `cd backend && pip install -r requirements.txt`
- [ ] Set start command: `cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT`
- [ ] Add environment variables
- [ ] Deploy
- [ ] Copy backend URL

#### Option C: Docker
- [ ] Build image: `docker build -t ai-skillfit-backend ./backend`
- [ ] Test locally: `docker run -p 8000:8000 ai-skillfit-backend`
- [ ] Push to registry
- [ ] Deploy to server

### 3. Frontend Deployment

#### Option A: Vercel (Free - Recommended)
- [ ] Create Vercel account
- [ ] Install Vercel CLI: `npm install -g vercel`
- [ ] Login: `vercel login`
- [ ] Add environment variable:
  - [ ] VITE_API_URL=https://your-backend-url
- [ ] Deploy: `vercel --prod`
- [ ] Copy frontend URL
- [ ] Test all pages

#### Option B: Netlify (Free)
- [ ] Create Netlify account
- [ ] New site from Git
- [ ] Build command: `npm run build`
- [ ] Publish directory: `dist`
- [ ] Add environment variable: VITE_API_URL
- [ ] Deploy
- [ ] Copy frontend URL

#### Option C: AWS S3 + CloudFront
- [ ] Create S3 bucket
- [ ] Enable static website hosting
- [ ] Build: `npm run build`
- [ ] Upload dist/ to S3
- [ ] Create CloudFront distribution
- [ ] Configure custom domain (optional)

### 4. Post-Deployment Configuration

#### Backend
- [ ] Update CORS origins with frontend URL
- [ ] Test all API endpoints
- [ ] Verify file uploads work
- [ ] Check AI models loaded
- [ ] Test database connection
- [ ] Monitor logs for errors

#### Frontend
- [ ] Test all pages load
- [ ] Verify API calls work
- [ ] Test candidate flow end-to-end
- [ ] Test admin panel
- [ ] Test candidate dashboard
- [ ] Check mobile responsiveness
- [ ] Test all 3 languages

## Testing

### Functional Testing
- [ ] Complete candidate registration
- [ ] Upload photo (fraud detection)
- [ ] Answer all 7 questions
- [ ] View processing animation
- [ ] See results on Thank You page
- [ ] Access candidate dashboard
- [ ] Login to admin panel
- [ ] Review candidate
- [ ] Update status
- [ ] View analytics

### Performance Testing
- [ ] Page load < 2 seconds
- [ ] API response < 1 second
- [ ] Video upload works
- [ ] Video processing completes
- [ ] Run Lighthouse audit (score > 80)

### Security Testing
- [ ] HTTPS enabled
- [ ] Admin routes protected
- [ ] JWT tokens work
- [ ] File upload validation works
- [ ] SQL injection prevented
- [ ] XSS prevented
- [ ] CORS configured correctly

### Cross-Browser Testing
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge
- [ ] Mobile browsers

## Monitoring & Maintenance

### Setup Monitoring
- [ ] Add error tracking (Sentry)
- [ ] Add analytics (Google Analytics)
- [ ] Setup uptime monitoring
- [ ] Configure alerts
- [ ] Setup log aggregation

### Backups
- [ ] Database backups enabled
- [ ] File storage backups
- [ ] Backup schedule configured
- [ ] Test restore process

### Documentation
- [ ] Document deployment process
- [ ] Share credentials securely
- [ ] Create runbook for common issues
- [ ] Document rollback procedure

## Launch

### Pre-Launch
- [ ] Final testing complete
- [ ] Team trained on admin panel
- [ ] Support documentation ready
- [ ] Monitoring active
- [ ] Backups configured

### Launch Day
- [ ] Deploy to production
- [ ] Verify all systems operational
- [ ] Monitor error logs
- [ ] Test critical flows
- [ ] Announce to users

### Post-Launch
- [ ] Monitor performance
- [ ] Check error rates
- [ ] Gather user feedback
- [ ] Fix critical issues
- [ ] Plan improvements

## Rollback Plan

If issues occur:
- [ ] Identify issue
- [ ] Check logs
- [ ] Revert to previous version:
  - Vercel: `vercel rollback`
  - Railway: Redeploy previous commit
- [ ] Verify rollback successful
- [ ] Investigate root cause
- [ ] Fix and redeploy

## Cost Optimization

### Free Tier Limits
- [ ] Monitor Vercel bandwidth (100GB/month)
- [ ] Monitor Railway hours (~500/month)
- [ ] Monitor Supabase storage (1GB)
- [ ] Setup alerts for limits

### Production Optimization
- [ ] Enable CDN caching
- [ ] Optimize images
- [ ] Minimize bundle size
- [ ] Use lazy loading
- [ ] Enable compression

## Support

### Documentation
- [ ] README.md - Quick start
- [ ] DEPLOYMENT.md - Deployment guide
- [ ] DOCUMENTATION.md - Complete docs
- [ ] API docs available at /docs

### Contacts
- [ ] Technical lead contact
- [ ] DevOps contact
- [ ] Support email
- [ ] Emergency contact

---

## Quick Deploy Commands

```bash
# 1. Setup Supabase (manual)
# See DEPLOYMENT.md Step 1

# 2. Deploy Backend (Railway)
railway login
railway init
railway up

# 3. Deploy Frontend (Vercel)
vercel login
vercel --prod

# Done! 🎉
```

---

## Deployment Status

- [ ] Database: _______________
- [ ] Backend: _______________
- [ ] Frontend: _______________
- [ ] Testing: _______________
- [ ] Monitoring: _______________
- [ ] Launch: _______________

**Deployed By:** _______________  
**Date:** _______________  
**Version:** 2.0  
**Status:** _______________
