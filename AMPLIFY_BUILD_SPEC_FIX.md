# Fixing Amplify Build Specification Issue

## Problem
Amplify is still running `npm ci` even though `amplify.yml` has been updated to use `npm install`. This usually happens when:
1. Changes haven't been committed/pushed to git
2. Amplify Console has a build specification that overrides `amplify.yml`

## Solution Steps

### Option 1: Verify Changes Are Committed and Pushed

1. **Check git status:**
   ```bash
   cd realtor-image-generator
   git status
   ```

2. **If amplify.yml shows as modified, commit and push:**
   ```bash
   git add amplify.yml
   git commit -m "Fix Amplify build - use npm install instead of npm ci"
   git push origin main
   ```

3. **Trigger a new build in Amplify Console:**
   - Go to AWS Amplify Console
   - Click on your app
   - Click "Redeploy this version" or wait for automatic deployment

### Option 2: Check Amplify Console Build Settings

If the issue persists after pushing, Amplify Console might have a build specification configured:

1. **Go to AWS Amplify Console:**
   - Navigate to your app
   - Click on "Build settings" in the left sidebar

2. **Check if there's a build specification:**
   - Look for "Build specification" section
   - If it shows a YAML configuration, it might be overriding `amplify.yml`

3. **Update Build Settings:**
   - Click "Edit" on the build specification
   - Make sure it matches the `amplify.yml` file:
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - echo "Installing dependencies..."
           - npm install
           - echo "Generating Prisma Client..."
           - npx prisma generate
       build:
         commands:
           - echo "Building application..."
           - npm run build
     artifacts:
       baseDirectory: .next
       files:
         - '**/*'
     cache:
       paths:
         - node_modules/**/*
         - .next/cache/**/*
         - .next/standalone/**/*
   ```

4. **Or delete the build specification:**
   - If you want to use `amplify.yml` from the repository, delete the build specification in the console
   - Amplify will then use the `amplify.yml` file from your repository

### Option 3: Verify App Root Directory

If your app is in a subdirectory (`realtor-image-generator`):

1. **In Amplify Console:**
   - Go to "App settings" → "General"
   - Check "App root directory"
   - It should be set to `realtor-image-generator` (not `/`)

2. **If it's set to `/`, update it:**
   - Change to `realtor-image-generator`
   - Save and redeploy

## Current amplify.yml Content

The file should contain:
```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - echo "Installing dependencies..."
        - npm install
        - echo "Generating Prisma Client..."
        - npx prisma generate
    build:
      commands:
        - echo "Building application..."
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
      - .next/cache/**/*
      - .next/standalone/**/*
```

## Verification

After making changes:
1. Commit and push all changes
2. Wait for Amplify to detect the new commit
3. Check the build logs - you should see `npm install` instead of `npm ci`
4. The build should complete successfully

