# Pre-Deployment Build Check Guide

## Quick Local Build Check

Before pushing changes to the server, run this command to verify everything builds successfully:

```bash
npm run build:check
```

This command will:
1. ✅ Generate Prisma Client
2. ✅ Build the Next.js application (same as Amplify will do)

**Note:** ESLint is not included in the build check to avoid blocking on warnings. Run `npm run lint:check` separately if you want to check code quality.

## What to Check

### ✅ Success Indicators
- No TypeScript errors
- No build errors
- Prisma client generates successfully
- All routes compile correctly

### ❌ Common Issues to Fix Before Pushing

1. **TypeScript Errors**
   - Fix all type errors before pushing
   - Check for async params in route handlers (Next.js 16 requirement)

2. **Missing Dependencies**
   - Ensure all build dependencies are in `dependencies` (not just `devDependencies`)
   - `autoprefixer`, `postcss`, and `tailwindcss` should be in `dependencies`

3. **Environment Variables**
   - Make sure all required env vars are documented
   - Check `.env.production.template` is up to date

4. **Test Files**
   - Test files are excluded from build (via `tsconfig.json`)
   - `jest.setup.ts` should not be included in production build

## Step-by-Step Pre-Deployment Process

1. **Clean build cache:**
   ```bash
   rm -rf .next
   rm -rf node_modules/.cache
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run build check:**
   ```bash
   npm run build:check
   ```

4. **If successful, commit and push:**
   ```bash
   git add .
   git commit -m "Your commit message"
   git push origin main
   ```

## Troubleshooting

### Build fails with "Cannot find module"
- Run `npm install` to ensure all dependencies are installed
- Check that build dependencies are in `dependencies` not `devDependencies`

### TypeScript errors in test files
- Test files should be excluded in `tsconfig.json`
- Check the `exclude` array includes test file patterns

### Prisma errors
- Run `npx prisma generate` manually
- Check that `DATABASE_URL` is set (even if not connecting during build)

### Next.js build errors
- Check for async params in route handlers
- Verify all imports are correct
- Check for missing environment variables

## Amplify Build vs Local Build

The local build check mimics what Amplify does:
- ✅ TypeScript compilation
- ✅ Next.js build
- ✅ Prisma client generation

However, Amplify also:
- Runs in a clean environment
- Uses production environment variables
- May have different Node.js version

If local build succeeds but Amplify fails, check:
- Environment variables in Amplify Console
- Node.js version compatibility
- Build settings in `amplify.yml`

