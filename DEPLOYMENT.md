# 🚀 Deployment Guide - Sands Club

## Prerequisites

1. Base44 account with active project
2. Stripe account (production keys)
3. Sentry account (error tracking)
4. Google Analytics setup
5. Domain configured for HTTPS

## Local Setup

```bash
# 1. Clone repository
git clone <repo-url>
cd app2.1marinabaysands

# 2. Install dependencies
npm install

# 3. Install Base44 CLI
npm install -g base44@latest

# 4. Create .env.local
cp .env.example .env.local

# 5. Configure environment variables
# Edit .env.local with production values
```

## Environment Configuration

### Production Variables (.env.local)

```env
# Base44 Configuration - FROM YOUR BASE44 DASHBOARD
VITE_BASE44_APP_ID=your_production_app_id
VITE_BASE44_APP_BASE_URL=https://your-app.base44.app

# API Configuration
VITE_API_URL=https://your-app.base44.app/api
VITE_APP_NAME=Sands Club
VITE_APP_VERSION=1.0.0

# Authentication
VITE_AUTH_ENABLED=true
VITE_SESSION_TIMEOUT=3600000

# Payment Integration - PRODUCTION STRIPE KEYS
VITE_STRIPE_PUBLIC_KEY=pk_live_your_actual_stripe_public_key

# Error Tracking - SENTRY
VITE_SENTRY_DSN=https://your-sentry-key@sentry.io/your-project-id

# Analytics
VITE_ANALYTICS_ENABLED=true
VITE_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX

# Feature Flags
VITE_ENABLE_DEMO_MODE=false
VITE_ENABLE_ADMIN_PANEL=true
VITE_ENABLE_NOTIFICATIONS=true
VITE_LOG_LEVEL=warn
```

## Build & Test

```bash
# 1. Run linting
npm run lint
npm run lint:fix  # Auto-fix issues

# 2. Type checking
npm run typecheck

# 3. Build for production
npm run build

# 4. Preview production build
npm run preview

# Visit: http://localhost:4173
```

## Deployment to Base44

### Using Base44 CLI

```bash
# 1. Open Base44 dashboard
base44 dashboard open

# 2. Configure deployment in dashboard
# - Link GitHub repository
# - Set build command: npm run build
# - Set output directory: ./dist
# - Set environment variables

# 3. Deploy
# Push changes to main branch, Base44 auto-deploys
# OR manually trigger from dashboard
```

### GitHub Integration

1. Go to Base44 Dashboard
2. Settings → Integrations → GitHub
3. Connect repository
4. Configure auto-deploy on push to `main`
5. Set branch protection rules on `main`

## Post-Deployment Checks

### Functional Testing
- [ ] Login/Register works
- [ ] User profile loads correctly
- [ ] Game listings display
- [ ] Betting functionality works
- [ ] Payments process correctly
- [ ] Notifications send
- [ ] Error handling displays gracefully

### Performance
- [ ] Page load time < 3s
- [ ] API response time < 500ms
- [ ] No console errors
- [ ] Images optimized
- [ ] CSS/JS bundled correctly

### Security
- [ ] HTTPS enforced
- [ ] No secrets in code/env
- [ ] CORS headers correct
- [ ] Authentication tokens secure
- [ ] Payment data not logged

### Monitoring
- [ ] Sentry capturing errors
- [ ] Analytics tracking events
- [ ] Base44 dashboard shows activity
- [ ] Database connections healthy
- [ ] API quotas monitored

## Rollback Procedure

```bash
# If deployment fails, rollback to previous version
base44 dashboard open

# Select previous deployment version and promote to live
```

## Scaling & Performance

### Base44 Auto-Scaling
- Enable auto-scaling in Base44 dashboard
- Set min/max instances based on traffic
- Monitor API quotas

### CDN Configuration
- Base44 includes CDN by default
- Static assets cached at edge
- Configure cache headers in build

### Database Optimization
- Monitor query performance
- Create indexes on frequently queried fields
- Implement connection pooling

## Troubleshooting

### Build Fails
```bash
# Clear cache and rebuild
rm -rf dist node_modules
npm install
npm run build
```

### Deployment Stuck
- Check Base44 dashboard logs
- Verify environment variables set correctly
- Check GitHub integration status

### Runtime Errors
- Check Sentry for error tracking
- Review Base44 application logs
- Check browser console for client-side errors

## Support

- Base44 Docs: https://docs.base44.com
- CLI Reference: https://docs.base44.com/developers/references/cli/commands/introduction
- Support: https://app.base44.com/support
- Stripe Docs: https://stripe.com/docs
