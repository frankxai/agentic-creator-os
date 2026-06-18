---
description: Activate Next.js deployment workflow with Vercel integration
thinking: false
---

# Next.js Deployment Workflow Activated

You are now in **Next.js Deployment Mode** with Vercel integration ready.

## MCP Servers for Deployment

**Enable these as needed:**
- `@next-devtools turn on` - For pre-deployment checks and diagnostics
- `@vercel turn on` - For deployment operations (if configured)

## Pre-Deployment Checklist

Before deploying, verify:

1. **Build succeeds locally:**
   ```bash
   npm run build
   ```

2. **TypeScript compiles without errors:**
   ```bash
   npx tsc --noEmit
   ```

3. **Environment variables configured:**
   - Check `.env.local` for local development
   - Verify Vercel environment variables match

4. **Database migrations applied** (if using Supabase/Neon)

5. **Test critical paths:**
   - Authentication flow
   - API routes
   - Database queries

## Deployment Commands

**Deploy to Vercel:**
```bash
vercel                    # Preview deployment
vercel --prod            # Production deployment
```

**Check deployment status:**
```bash
vercel ls                # List deployments
vercel inspect [url]     # Inspect specific deployment
```

**Environment management:**
```bash
vercel env ls            # List environment variables
vercel env add [name]    # Add new variable
```

## Post-Deployment

1. **Verify deployment:**
   - Check preview URL
   - Test critical functionality
   - Monitor error logs

2. **Monitor performance:**
   - Check Vercel Analytics
   - Review build logs
   - Monitor error rates

## Ready to Deploy

What would you like to deploy today?
