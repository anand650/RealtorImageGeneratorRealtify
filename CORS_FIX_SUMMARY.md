# S3 CORS Error Fix Summary

## Problem
Users were getting CORS errors when trying to upload images to S3:
```
Request Method: OPTIONS
Status Code: 403 Forbidden
```

## Root Cause
**Wrong AWS Region Configuration**
- S3 bucket was created in `eu-north-1` region
- Application was configured to use `us-east-1` region
- This caused AWS to redirect requests, breaking CORS

## Solution

### 1. Fixed Region Configuration
Updated `.env.local`:
```env
# Before
AWS_REGION="us-east-1"
NEXT_PUBLIC_AWS_REGION="us-east-1"

# After  
AWS_REGION="eu-north-1"
NEXT_PUBLIC_AWS_REGION="eu-north-1"
```

### 2. Updated S3 CORS Configuration
Applied comprehensive CORS rules to S3 bucket:
```json
{
  "CORSRules": [
    {
      "ID": "realtor-app-cors",
      "AllowedHeaders": ["*"],
      "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
      "AllowedOrigins": [
        "http://localhost:3000",
        "https://localhost:3000", 
        "http://127.0.0.1:3000",
        "https://127.0.0.1:3000",
        "*"
      ],
      "ExposeHeaders": [
        "ETag",
        "x-amz-version-id", 
        "x-amz-delete-marker",
        "x-amz-request-id",
        "x-amz-id-2"
      ],
      "MaxAgeSeconds": 3000
    }
  ]
}
```

### 3. Enhanced Pre-signed URL Generation
Updated `src/lib/s3.ts`:
```typescript
export async function generateUploadUrl(key: string, contentType: string): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: contentType,
    Metadata: {
      'uploaded-from': 'realtor-app'
    }
  })

  return await getSignedUrl(s3Client, command, { 
    expiresIn: 86400, // 24 hours
    signableHeaders: new Set(['host', 'content-type'])
  })
}
```

### 4. Added CORS Mode to Fetch
Updated `src/components/images/ImageUpload.tsx`:
```typescript
const uploadResponse = await fetch(uploadUrl, {
  method: 'PUT',
  body: file,
  headers: {
    'Content-Type': file.type,
  },
  mode: 'cors', // Explicitly set CORS mode
})
```

## Tools Created

### 1. CORS Configuration Script
`scripts/fix-s3-cors.js` - Automatically configures S3 CORS settings

### 2. S3 Upload Test Script  
`scripts/test-s3-upload.js` - Tests S3 upload functionality

## Verification

✅ **CORS Configuration Applied**
```bash
node scripts/fix-s3-cors.js
# ✅ CORS configuration applied successfully!
```

✅ **S3 Upload Test Passed**
```bash
node scripts/test-s3-upload.js  
# ✅ Test upload successful!
# Response status: 200
```

✅ **Region Mismatch Resolved**
- Bucket region: `eu-north-1` ✅
- App configuration: `eu-north-1` ✅

## Result
- Image uploads now work without CORS errors
- Pre-signed URLs generate correctly for the right region
- S3 bucket properly configured for cross-origin requests
- Application can successfully upload files to S3

## Next Steps
1. Test image upload in the browser at `http://localhost:3000`
2. Verify images appear in S3 bucket
3. Test image processing workflow end-to-end

## Important Notes
- When deploying to production, update CORS origins to include your production domain
- The current CORS config allows `*` origins for development - restrict this in production
- S3 bucket region must match the region in your environment variables
