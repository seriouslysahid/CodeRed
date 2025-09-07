# Deployment Guide

## Overview

This document outlines the deployment process for the CodeRed Frontend application, including environment configuration, CI/CD pipeline setup, and deployment verification.

## Environment Configuration

### Required Environment Variables

#### Production Environment
```bash
# API Configuration
NEXT_PUBLIC_API_BASE=https://your-api-domain.com/api
API_BASE_URL=https://your-api-domain.com/api

# Database (if needed for API health checks)
DATABASE_URL=your-database-connection-string

# Authentication (if implemented)
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=https://your-domain.com

# Analytics (optional)
NEXT_PUBLIC_GA_ID=your-google-analytics-id
```

#### Development Environment
```bash
# API Configuration
NEXT_PUBLIC_API_BASE=http://localhost:3001/api
API_BASE_URL=http://localhost:3001/api

# Development flags
NODE_ENV=development
```

#### Testing Environment
```bash
# API Configuration
NEXT_PUBLIC_API_BASE=http://localhost:3001/api
API_BASE_URL=http://localhost:3001/api

# Testing flags
NODE_ENV=test
CI=true
```

### Environment Setup Instructions

1. **Local Development**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your local configuration
   ```

2. **Vercel Deployment**
   - Go to Vercel Dashboard → Project Settings → Environment Variables
   - Add all production environment variables
   - Set different values for Preview and Development environments

3. **GitHub Secrets**
   - Go to Repository Settings → Secrets and Variables → Actions
   - Add the following secrets:
     - `NEXT_PUBLIC_API_BASE`
     - `API_BASE_URL`
     - `VERCEL_TOKEN` (for deployment)

## Deployment Checklist

### Pre-Deployment Checklist

- [ ] **Code Quality**
  - [ ] All tests pass locally (`npm run ci`)
  - [ ] ESLint passes without errors
  - [ ] TypeScript compilation succeeds
  - [ ] Prettier formatting applied

- [ ] **Environment Configuration**
  - [ ] Environment variables configured in Vercel
  - [ ] GitHub secrets updated
  - [ ] API endpoints accessible from deployment environment

- [ ] **Dependencies**
  - [ ] `package-lock.json` is up to date
  - [ ] No security vulnerabilities (`npm audit`)
  - [ ] All dependencies compatible with Node.js 18+

- [ ] **Build Verification**
  - [ ] Application builds successfully (`npm run build`)
  - [ ] No build warnings or errors
  - [ ] Bundle size within acceptable limits

### Deployment Process

1. **Automatic Deployment (Recommended)**
   ```bash
   # Push to main branch triggers automatic deployment
   git push origin main
   ```

2. **Manual Deployment**
   ```bash
   # Using Vercel CLI
   npm install -g vercel
   vercel --prod
   ```

### Post-Deployment Checklist

- [ ] **Functionality Verification**
  - [ ] Application loads without errors
  - [ ] API connectivity working
  - [ ] All major features functional
  - [ ] Mobile responsiveness verified

- [ ] **Performance Verification**
  - [ ] Page load times acceptable (< 3s)
  - [ ] Core Web Vitals within thresholds
  - [ ] No console errors in production

- [ ] **Security Verification**
  - [ ] HTTPS enabled
  - [ ] Security headers present
  - [ ] No sensitive data exposed in client

- [ ] **Monitoring Setup**
  - [ ] Error tracking configured
  - [ ] Performance monitoring active
  - [ ] Health checks responding

## CI/CD Pipeline

### GitHub Actions Workflow

The CI/CD pipeline consists of the following stages:

1. **Lint and Type Check**
   - ESLint validation
   - Prettier formatting check
   - TypeScript type checking

2. **Testing**
   - Unit tests with coverage
   - Integration tests
   - E2E tests with Playwright

3. **Build**
   - Next.js application build
   - Build artifact upload

4. **Health Check**
   - API connectivity verification
   - Dependency status check

### Pipeline Configuration

```yaml
# .github/workflows/ci.yml
# See the actual file for complete configuration
```

### Branch Strategy

- **main**: Production deployments
- **develop**: Staging deployments
- **feature/***: Preview deployments

## Vercel Configuration

### Project Settings

```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm ci"
}
```

### Domain Configuration

1. **Custom Domain Setup**
   - Add custom domain in Vercel dashboard
   - Configure DNS records
   - Enable automatic HTTPS

2. **Preview Deployments**
   - Automatic preview for pull requests
   - Branch-specific preview URLs
   - Environment variable inheritance

## Health Checks and Monitoring

### Application Health Check

The application includes built-in health check endpoints:

```typescript
// app/api/health/route.ts
export async function GET() {
  try {
    // Check API connectivity
    const apiResponse = await fetch(`${process.env.API_BASE_URL}/health`);
    
    if (!apiResponse.ok) {
      throw new Error('API health check failed');
    }
    
    return Response.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version,
      api: 'connected'
    });
  } catch (error) {
    return Response.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    }, { status: 503 });
  }
}
```

### Monitoring Integration

1. **Vercel Analytics**
   - Automatic performance monitoring
   - Core Web Vitals tracking
   - Real user metrics

2. **Error Tracking**
   - Sentry integration (optional)
   - Error boundary reporting
   - API error logging

3. **Uptime Monitoring**
   - External uptime monitoring service
   - Health check endpoint monitoring
   - Alert configuration

## Troubleshooting

### Common Deployment Issues

1. **Build Failures**
   ```bash
   # Check build logs
   vercel logs
   
   # Local build test
   npm run build
   ```

2. **Environment Variable Issues**
   ```bash
   # Verify environment variables
   vercel env ls
   
   # Pull environment variables locally
   vercel env pull .env.local
   ```

3. **API Connectivity Issues**
   ```bash
   # Test API connectivity
   curl -f https://your-api-domain.com/health
   
   # Check CORS configuration
   curl -H "Origin: https://your-domain.com" https://your-api-domain.com/api/learners
   ```

### Performance Issues

1. **Bundle Size Optimization**
   ```bash
   # Analyze bundle size
   npm run build
   npx @next/bundle-analyzer
   ```

2. **Image Optimization**
   - Use Next.js Image component
   - Configure image domains in next.config.js
   - Implement lazy loading

3. **Caching Strategy**
   - Configure React Query cache times
   - Implement service worker (if needed)
   - Use Vercel Edge Cache

## Security Considerations

### Content Security Policy

```javascript
// next.config.js
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;"
  }
];
```

### Environment Variable Security

- Never commit `.env` files to version control
- Use Vercel's environment variable encryption
- Rotate secrets regularly
- Audit environment variable access

### API Security

- Implement proper CORS configuration
- Use HTTPS for all API communications
- Validate all user inputs
- Implement rate limiting

## Rollback Procedures

### Vercel Rollback

1. **Via Dashboard**
   - Go to Vercel Dashboard → Deployments
   - Select previous successful deployment
   - Click "Promote to Production"

2. **Via CLI**
   ```bash
   vercel rollback [deployment-url]
   ```

### Git Rollback

```bash
# Revert to previous commit
git revert HEAD

# Push revert commit
git push origin main
```

## Support and Maintenance

### Regular Maintenance Tasks

- [ ] Update dependencies monthly
- [ ] Review and rotate secrets quarterly
- [ ] Monitor performance metrics weekly
- [ ] Review error logs daily
- [ ] Update documentation as needed

### Support Contacts

- **Development Team**: dev-team@company.com
- **DevOps Team**: devops@company.com
- **Emergency Contact**: on-call@company.com

### Documentation Updates

This document should be updated whenever:
- New environment variables are added
- Deployment process changes
- New monitoring tools are integrated
- Security requirements change