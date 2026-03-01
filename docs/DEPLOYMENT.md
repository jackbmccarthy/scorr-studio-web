# Deployment Guide

This guide covers deploying Scorr Studio V2 to production.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Vercel Deployment](#vercel-deployment)
- [Convex Setup](#convex-setup)
- [WorkOS Configuration](#workos-configuration)
- [Environment Variables](#environment-variables)
- [Post-Deployment](#post-deployment)
- [Monitoring & Maintenance](#monitoring--maintenance)

---

## Prerequisites

Before deploying, ensure you have:

| Requirement | Notes |
|-------------|-------|
| GitHub account | For repository hosting |
| Vercel account | Free tier works |
| Convex account | Free tier available |
| WorkOS account | For authentication |
| Stripe account | Optional, for billing |
| Domain name | Optional, for custom domain |

---

## Vercel Deployment

### Option 1: Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Log in to Vercel
vercel login

# Deploy to production
vercel --prod
```

### Option 2: GitHub Integration (Recommended)

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Select the repository

3. **Configure Project**
   - Framework Preset: **Next.js**
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `.next`

4. **Set Environment Variables** (see below)

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete

### Vercel Settings

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "regions": ["iad1"],
  "functions": {
    "src/app/api/**/*.{ts,tsx}": {
      "maxDuration": 30
    }
  }
}
```

### Custom Domain

1. Go to your Vercel project settings
2. Navigate to "Domains"
3. Add your custom domain
4. Configure DNS records as instructed

---

## Convex Setup

### Creating a Production Deployment

1. **Log in to Convex Dashboard**
   ```bash
   npx convex login
   ```

2. **Create Production Deployment**
   - Go to [dashboard.convex.dev](https://dashboard.convex.dev)
   - Create a new project
   - Note the deployment URL

3. **Deploy Schema and Functions**
   ```bash
   # Deploy to production
   npx convex deploy --prod
   ```

4. **Get Production URL**
   - In Convex dashboard, go to Settings
   - Copy the "Deployment URL"
   - This is your `NEXT_PUBLIC_CONVEX_URL`

### Convex Environment Variables

Set these in Convex dashboard (Settings → Environment Variables):

| Variable | Description |
|----------|-------------|
| `WORKOS_CLIENT_ID` | WorkOS client ID |
| `WORKOS_CLIENT_SECRET` | WorkOS client secret |

### Convex Limits (Free Tier)

| Resource | Limit |
|----------|-------|
| Documents | 10,000 |
| Bandwidth | 5 GB/month |
| Operations | 1M/month |
| WebSocket connections | 1,000 |

Upgrade to Pro for higher limits.

---

## WorkOS Configuration

### Setting Up WorkOS

1. **Create WorkOS Account**
   - Go to [workos.com](https://workos.com)
   - Sign up for an account

2. **Create an Application**
   - In WorkOS dashboard, create a new application
   - Note the Client ID and Client Secret

3. **Configure Redirect URI**
   - Add your production URL:
     ```
     https://your-domain.com/auth/callback
     ```
   - Also add for preview deployments:
     ```
     https://*.vercel.app/auth/callback
     ```

4. **Configure Allowed Origins**
   - Add your domain(s)
   - Include subdomain wildcards if needed

### WorkOS Environment Variables

| Variable | Where to Get |
|----------|--------------|
| `WORKOS_CLIENT_ID` | WorkOS Dashboard → Application |
| `WORKOS_CLIENT_SECRET` | WorkOS Dashboard → Application |
| `WORKOS_REDIRECT_URI` | Your production URL + `/auth/callback` |

### Organization-First Auth

Scorr Studio uses WorkOS organizations for multi-tenancy:

1. Organizations are created automatically on first login
2. Users can be invited to organizations
3. Each organization has isolated data

---

## Environment Variables

### Complete Checklist

Set these variables in **Vercel** (Settings → Environment Variables):

```bash
# ============================================
# REQUIRED - Core Application
# ============================================
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
WORKOS_CLIENT_ID=client_xxx
WORKOS_CLIENT_SECRET=sk_xxx
WORKOS_REDIRECT_URI=https://your-domain.com/auth/callback

# ============================================
# OPTIONAL - Stripe Billing
# ============================================
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx

# ============================================
# OPTIONAL - Social Integrations
# ============================================
TWITTER_CLIENT_ID=xxx
TWITTER_CLIENT_SECRET=xxx

# ============================================
# OPTIONAL - Analytics
# ============================================
NEXT_PUBLIC_ANALYTICS_ID=xxx
```

### Vercel Environment Setup

1. Go to your Vercel project
2. Settings → Environment Variables
3. Add each variable for:
   - **Production**
   - **Preview**
   - **Development**

### Variable Priority

Variables are loaded in this order:
1. System environment variables
2. `.env.local` (git-ignored)
3. `.env.development` / `.env.production`
4. `.env`

---

## Post-Deployment

### Verification Checklist

After deployment, verify:

- [ ] Application loads without errors
- [ ] Login/registration works
- [ ] Can create an organization
- [ ] Can create a match
- [ ] Real-time updates work
- [ ] Convex functions execute
- [ ] Print features work
- [ ] Mobile responsive

### Initial Setup

1. **Create Admin Organization**
   - Log in with your email
   - Create your organization
   - Note your organization ID

2. **Configure Settings**
   - Upload logo
   - Set brand colors
   - Enable sports
   - Configure custom fields

3. **Test Core Flows**
   - Create a test match
   - Score the match
   - Print schedule
   - Share bracket

### Stripe Setup (Optional)

If using billing:

1. **Create Products in Stripe**
   - Create subscription products
   - Note price IDs

2. **Configure Webhook**
   - Add endpoint: `https://your-domain.com/api/webhooks/stripe`
   - Select events:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
   - Copy webhook secret

3. **Test Payment Flow**
   - Use test mode first
   - Verify webhook delivery
   - Check subscription status

---

## Monitoring & Maintenance

### Vercel Analytics

Enable Vercel Analytics for:
- Page views
- Performance metrics
- Error tracking

```bash
# In your Vercel project
vercel analytics enable
```

### Convex Dashboard

Monitor in Convex dashboard:
- Query performance
- Function logs
- Usage metrics
- Error rates

### Error Tracking

Consider adding Sentry:

```bash
npm install @sentry/nextjs
```

```javascript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
});
```

### Uptime Monitoring

Set up uptime monitoring:
- [UptimeRobot](https://uptimerobot.com) (free)
- [Pingdom](https://pingdom.com)
- Vercel's built-in monitoring

### Backup Strategy

Convex automatically backs up data, but consider:
- Export critical data periodically
- Document restore procedures
- Test recovery process

---

## Scaling Considerations

### Vercel

- **Pro Plan**: Faster builds, more bandwidth
- **Edge Functions**: For global distribution
- **Image Optimization**: Enable for logos/images

### Convex

- **Pro Plan**: Higher limits, priority support
- **Indexed Queries**: Ensure indexes for common queries
- **Function Optimization**: Monitor slow functions

### Database

Convex handles scaling automatically, but:
- Monitor document counts
- Archive old matches if needed
- Consider data retention policies

---

## Troubleshooting

### Build Failures

```bash
# Check build locally
npm run build

# Common issues:
# - Missing environment variables
# - TypeScript errors
# - Dependency conflicts
```

### Runtime Errors

1. Check Vercel function logs
2. Check Convex function logs
3. Verify environment variables
4. Test Convex connectivity

### Authentication Issues

1. Verify WorkOS credentials
2. Check redirect URI matches exactly
3. Ensure cookies are enabled
4. Check CORS settings

### Convex Connection Issues

1. Verify `NEXT_PUBLIC_CONVEX_URL`
2. Check Convex deployment status
3. Ensure functions are deployed
4. Check browser console for errors

### Performance Issues

1. Check Vercel function duration
2. Review Convex query performance
3. Optimize images
4. Enable caching where appropriate

---

## Rollback

If deployment has issues:

### Vercel Rollback

1. Go to Vercel dashboard
2. Select your project
3. Go to "Deployments"
4. Find last working deployment
5. Click "..." → "Promote to Production"

### Convex Rollback

1. Convex doesn't have traditional rollback
2. Redeploy functions: `npx convex deploy --prod`
3. Data changes require manual intervention

---

## Security Checklist

- [ ] All secrets stored in environment variables
- [ ] No secrets in git repository
- [ ] HTTPS enforced
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] Input validation on all forms
- [ ] SQL injection not possible (Convex handles)
- [ ] XSS prevention (React handles, but verify)
- [ ] CSRF protection (Next.js handles)
