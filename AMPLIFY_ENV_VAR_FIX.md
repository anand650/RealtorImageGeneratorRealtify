# AWS Amplify Environment Variable Fix

## Issue
AWS Amplify doesn't allow environment variables starting with the reserved prefix "AWS_". This caused build failures when trying to deploy.

## Solution
Renamed all AWS-related environment variables to use "S3_" prefix instead of "AWS_".

## Variable Name Changes

| Old Name | New Name | Notes |
|----------|----------|-------|
| `AWS_ACCESS_KEY_ID` | `S3_ACCESS_KEY_ID` | Required for Amplify |
| `AWS_SECRET_ACCESS_KEY` | `S3_SECRET_ACCESS_KEY` | Required for Amplify |
| `AWS_REGION` | `S3_REGION` | Required for Amplify |
| `AWS_S3_BUCKET` | `S3_BUCKET_NAME` | Required for Amplify |
| `NEXT_PUBLIC_AWS_REGION` | `NEXT_PUBLIC_S3_REGION` | Required for Amplify |
| `NEXT_PUBLIC_AWS_S3_BUCKET` | `NEXT_PUBLIC_S3_BUCKET` | Required for Amplify |

## Code Changes

### 1. `src/lib/s3.ts`
- Updated to use new variable names
- Added backward compatibility (supports both old and new names)
- This ensures local development still works with old variable names

### 2. `next.config.ts`
- Updated `env` section to use new variable names
- Added backward compatibility

### 3. Environment Files
- `.env.production` - Updated with new variable names
- `.env.production.template` - Updated with new variable names and notes
- `.env.local` - Kept old names (for local development only)

### 4. Documentation
- `QUICK_DEPLOYMENT.md` - Updated variable list
- `AWS_DEPLOYMENT_GUIDE.md` - Updated variable examples

## Backward Compatibility

The code supports both old and new variable names for backward compatibility:
- Local development can still use `AWS_*` variables
- Production (Amplify) must use `S3_*` variables
- Code checks for new names first, then falls back to old names

## Next Steps

1. **In AWS Amplify Console:**
   - Go to App Settings → Environment variables
   - Remove all variables starting with `AWS_`
   - Add the new variables with `S3_` prefix:
     - `S3_ACCESS_KEY_ID`
     - `S3_SECRET_ACCESS_KEY`
     - `S3_REGION`
     - `S3_BUCKET_NAME`
     - `NEXT_PUBLIC_S3_REGION`
     - `NEXT_PUBLIC_S3_BUCKET`

2. **Redeploy:**
   - The build should now succeed
   - No code changes needed (already updated)

## Local Development

For local development, you can continue using the old `AWS_*` variable names in `.env.local`. The code will automatically use them if the new `S3_*` variables are not found.

## Important Notes

- **Never commit** `.env.production` with actual credentials
- **Always use** `.env.production.template` as reference
- **Update Amplify Console** environment variables after pulling these changes
- The old variable names will still work locally, but **must** be changed in Amplify

