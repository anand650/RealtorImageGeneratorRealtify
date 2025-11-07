# AWS Deployment Guide - Production Setup

## 🏗️ Infrastructure Overview

Your application uses the following AWS services:
- **RDS PostgreSQL**: `realtor-image-generator-db.ce1qio26ynqb.us-east-1.rds.amazonaws.com`
- **S3 Bucket**: `realtor-image-generator` (eu-north-1)
- **ElastiCache Redis**: `realtor-redis-cache.vjm3hs.aps1.cache.amazonaws.com`
- **Domain**: Your custom domain

## 🚀 Deployment: AWS Amplify (Recommended)

**Why AWS Amplify?**
- ✅ **Cost-effective**: Free tier available, then ~$0-15/month for small apps
- ✅ Zero configuration for Next.js
- ✅ Automatic SSL certificates
- ✅ Built-in CI/CD
- ✅ Auto-scaling
- ✅ Global CDN included
- ✅ Perfect for Next.js applications

**Cost Breakdown:**
- **Free Tier**: 15 build minutes/day, 5 GB storage, 15 GB data transfer
- **Small App**: $0-5/month (likely free)
- **Medium Traffic**: $5-15/month
- **Much cheaper than ECS** (~$80-100/month)

**Steps:**

1. **Install AWS Amplify CLI:**
   ```bash
   npm install -g @aws-amplify/cli
   ```

2. **Initialize Amplify:**
   ```bash
   amplify init
   # Follow prompts:
   # - Project name: realtor-image-generator
   # - Environment: production
   # - Default editor: VS Code (or your choice)
   # - Type of app: javascript
   # - Framework: React
   # - Source directory: ./
   # - Build command: npm run build
   # - Start command: npm start
   ```

3. **Add Hosting:**
   ```bash
   amplify add hosting
   # Choose: Hosting with Amplify Console
   ```

4. **Configure Custom Domain:**
   - Go to AWS Amplify Console
   - Select your app → Domain management
   - Add your domain
   - Follow DNS verification steps

5. **Set Environment Variables:**
   - Amplify Console → App Settings → Environment variables
   - Add all variables from `.env.production`

6. **Deploy:**
   ```bash
   amplify publish
   ```

### Alternative: Vercel (Not AWS, but very cost-effective)

If you want to explore alternatives, Vercel offers excellent Next.js support with a free tier:

```bash
npm install -g vercel
vercel --prod
```

**Note:** Vercel will still use your AWS RDS, S3, and ElastiCache services.

## 📋 Pre-Deployment Checklist

### 1. Database Setup

**Update DATABASE_URL with connection pooling:**
```env
DATABASE_URL="postgresql://postgres:Passwd123456789@realtor-image-generator-db.ce1qio26ynqb.us-east-1.rds.amazonaws.com:5432/postgres?schema=public&connection_limit=20&pool_timeout=10&sslmode=require"
```

**RDS Optimizations:**
- [ ] Enable Multi-AZ for high availability
- [ ] Enable automated backups (7-day retention)
- [ ] Enable Performance Insights
- [ ] Create read replica for scaling (optional)
- [ ] Update security groups to allow app server access

### 2. S3 Optimization

**S3 Bucket Configuration:**
- [ ] Enable versioning (for backups)
- [ ] Configure lifecycle policies (move old images to Glacier after 90 days)
- [ ] Set up CORS configuration
- [ ] Block public access (use pre-signed URLs only)

**CloudFront CDN Setup (Recommended):**
1. Create CloudFront distribution
2. Origin: S3 bucket `realtor-image-generator`
3. Enable compression
4. Cache policy: Cache-Control Headers
5. Add custom domain with SSL
6. Update `CLOUDFRONT_DOMAIN` in environment variables

### 3. Redis/ElastiCache

**Verify Configuration:**
- [ ] Redis endpoint is accessible from app servers
- [ ] Security groups allow access
- [ ] Enable encryption in transit (if needed)

### 4. Environment Variables

**Required Production Variables:**
```env
# Database (with connection pooling)
DATABASE_URL="postgresql://postgres:Passwd123456789@realtor-image-generator-db.ce1qio26ynqb.us-east-1.rds.amazonaws.com:5432/postgres?schema=public&connection_limit=20&pool_timeout=10&sslmode=require"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_live_..."
CLERK_SECRET_KEY="sk_live_..."

# Paddle Billing
PADDLE_API_KEY="live_..."
PADDLE_ENVIRONMENT="production"
PADDLE_WEBHOOK_SECRET="..."
PADDLE_PRICE_ID_STARTER="pri_..."
PADDLE_PRICE_ID_PRO="pri_..."
PADDLE_PRICE_ID_ENTERPRISE="pri_..."

# Google Gemini AI
GEMINI_API_KEY="..."

# AWS Configuration (S3)
# Note: AWS Amplify doesn't allow environment variables starting with "AWS_"
# Use these renamed variables for Amplify deployment
S3_ACCESS_KEY_ID="..."
S3_SECRET_ACCESS_KEY="..."
S3_REGION="eu-north-1"
S3_BUCKET_NAME="realtor-image-generator"

# CloudFront (if configured)
CLOUDFRONT_DOMAIN="d1234abcd.cloudfront.net"

# Redis
REDIS_URL="redis://master.realtor-redis-cache.vjm3hs.aps1.cache.amazonaws.com:6379"

# Application
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
APP_URL="https://yourdomain.com"
NODE_ENV="production"

# Processing Configuration
MAX_CONCURRENT_PROCESSING="10"
MAX_QUEUE_SIZE="100"

# Admin
ADMIN_SECRET="..."
```

### 5. Paddle Webhook Configuration

**Update Paddle Webhook URL:**
- Go to Paddle Dashboard → Developer Tools → Notifications
- Update webhook URL to: `https://yourdomain.com/api/webhooks/paddle`
- Verify webhook secret matches `PADDLE_WEBHOOK_SECRET`

### 6. Database Migrations

**Run migrations before deployment:**
```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate deploy
```

## 🔧 Deployment Steps

### Step-by-Step Amplify Deployment

1. **Install Amplify CLI:**
   ```bash
   npm install -g @aws-amplify/cli
   ```

2. **Initialize:**
   ```bash
   amplify init
   ```

3. **Add Hosting:**
   ```bash
   amplify add hosting
   ```

4. **Configure Domain:**
   - Use Amplify Console to add custom domain
   - Update DNS records as instructed

5. **Set Environment Variables:**
   - Amplify Console → App Settings → Environment variables
   - Add all variables from `.env.production`

6. **Deploy:**
   ```bash
   amplify publish
   ```

For detailed step-by-step instructions, see `QUICK_DEPLOYMENT.md`.

## 🔒 Security Checklist

- [ ] Move AWS credentials to AWS Secrets Manager or IAM roles
- [ ] Enable RDS encryption at rest
- [ ] Configure S3 bucket policies (private access)
- [ ] Set up WAF for DDoS protection (optional)
- [ ] Enable CloudWatch logging
- [ ] Configure security groups properly
- [ ] Use SSL/TLS everywhere
- [ ] Rotate credentials regularly

## 📊 Monitoring Setup

### CloudWatch Alarms

Set up alarms for:
- High error rates
- Database connection issues
- High CPU/Memory usage
- S3 bucket size
- API response times

### Application Logging

- Application logs → CloudWatch Logs
- Error tracking → CloudWatch Insights
- Performance metrics → CloudWatch Metrics

## 💰 Cost Optimization

1. **RDS:**
   - Use reserved instances for 1-3 year commitments
   - Enable automated backups with appropriate retention

2. **S3:**
   - Enable Intelligent-Tiering
   - Lifecycle policies for old images

3. **CloudFront:**
   - Reduces S3 requests (saves money)
   - Caches images globally

4. **Auto-scaling:**
   - Scale down during low traffic
   - Right-size instances

## 🧪 Testing After Deployment

1. **Health Check:**
   - `https://yourdomain.com/api/health` (if implemented)
   - Verify homepage loads

2. **Authentication:**
   - Test sign up/login
   - Verify Clerk integration

3. **Image Processing:**
   - Upload an image
   - Process an image
   - Verify S3 storage

4. **Billing:**
   - Test Paddle checkout
   - Verify webhook receives events

5. **Database:**
   - Verify connections
   - Test queries
   - Check performance

## 📝 Post-Deployment

1. **Monitor:**
   - Check CloudWatch logs
   - Monitor error rates
   - Watch performance metrics

2. **Optimize:**
   - Adjust auto-scaling thresholds
   - Optimize database queries
   - Fine-tune caching

3. **Backup:**
   - Verify automated backups
   - Test restore procedures

## 🆘 Troubleshooting

### Database Connection Issues
- Check security groups allow app server IP
- Verify DATABASE_URL is correct
- Check connection pooling settings

### S3 Access Issues
- Verify IAM permissions
- Check bucket policies
- Verify CORS configuration

### Redis Connection Issues
- Check ElastiCache security groups
- Verify Redis endpoint is correct
- Check network connectivity

## 📞 Support

For deployment issues:
- Check CloudWatch logs
- Review AWS service health
- Verify all environment variables are set
- Check security groups and IAM permissions

