# Deployment Notes

## Database Setup

Before deploying or running the application with the new features, you'll need to run database migrations:

### 1. Generate Prisma Client
```bash
npx prisma generate
```

### 2. Push Schema Changes (Development)
```bash
npx prisma db push
```

### 3. Create Migration (Production)
```bash
npx prisma migrate dev --name add-usage-tracking-and-folders
```

## New Features Implemented

### ✅ Phase 1: Free Tier & Usage Tracking
- IP-based anonymous usage tracking (2 free images)
- Registered user free tier (4 free images: 2 base + 2 signup bonus)
- Subscription plan structure ($5/$15/$35 monthly)
- Usage validation in image processing API

### ✅ Phase 2: Analytics Dashboard
- Comprehensive usage analytics with charts
- Room type and style preference tracking
- Success rate and processing time metrics
- Real-time usage monitoring

### ✅ Phase 3: Advanced Image Gallery
- Hierarchical folder organization
- Advanced search and filtering
- Tag system for image organization
- Grid/list view modes
- Bulk operations and favorites

## Environment Variables

Make sure these are set in your `.env.local`:

```env
# Development Mode (bypasses Clerk auth)
DISABLE_AUTH="true"

# Database
DATABASE_URL="your_postgresql_connection_string"

# Google Gemini AI
GEMINI_API_KEY="your_gemini_api_key"

# AWS Configuration
AWS_ACCESS_KEY_ID="your_aws_access_key"
AWS_SECRET_ACCESS_KEY="your_aws_secret_key"
AWS_REGION="your_aws_region"
AWS_S3_BUCKET="your_s3_bucket_name"
```

## API Endpoints Added

- `GET /api/usage` - Check current usage limits
- `GET /api/analytics/usage?period=30` - Get usage analytics
- `POST /api/images/process` - Enhanced with usage tracking

## Components Created

- `UsageOverview.tsx` - Usage metrics dashboard
- `RoomTypeBreakdown.tsx` - Room type analytics
- `UsageCharts.tsx` - Usage trends visualization
- `FolderManager.tsx` - Folder organization UI
- `EnhancedImageGallery.tsx` - Advanced image gallery
- `Badge.tsx` - UI component for tags and labels

## Database Models Added

- `IpUsageTracking` - Anonymous user usage tracking
- `ImageFolder` - Hierarchical folder organization
- Enhanced `User` model with free tier fields
- Enhanced `Image` model with tags and folder support

## Next Steps

1. Set up real Clerk authentication keys
2. Configure Stripe for subscription billing
3. Implement team collaboration features
4. Add performance optimizations (caching, lazy loading)
5. Deploy to production environment

## Troubleshooting

### Prisma Generation Issues
If you encounter permission errors with `npx prisma generate`, try:
1. Close all development servers
2. Delete `node_modules/.prisma` folder
3. Run `npm install` again
4. Run `npx prisma generate`

### Development Mode
The application runs in development mode with `DISABLE_AUTH="true"` to bypass Clerk authentication. This allows testing all features without setting up authentication.
