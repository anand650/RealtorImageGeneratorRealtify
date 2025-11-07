# 🚀 Quick Deployment Guide

## For AWS Amplify (Recommended - Easiest)

### Step 1: Prepare Your Code
```bash
# Make sure all changes are committed
git add .
git commit -m "Prepare for production deployment"
git push origin main
```

### Step 2: Install Amplify CLI
```bash
npm install -g @aws-amplify/cli
```

### Step 3: Initialize Amplify
```bash
amplify init
# Follow the prompts:
# - Project name: realtor-image-generator
# - Environment: production
# - Default editor: VS Code (or your preference)
# - Type of app: javascript
# - Framework: React
# - Source directory: ./
# - Build command: npm run build
# - Start command: npm start
# - Distribution directory: .next
```

### Step 4: Add Hosting
```bash
amplify add hosting
# Choose: Hosting with Amplify Console (Managed hosting)
```

### Step 5: Connect Your Repository
1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify)
2. Click "New app" → "Host web app"
3. Connect your Git repository (GitHub, GitLab, Bitbucket, or AWS CodeCommit)
4. Select your branch (usually `main`)

### Step 6: Configure Build Settings
Amplify will auto-detect your `amplify.yml` file. If not, add:
```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
        - npx prisma generate
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
```

### Step 7: Set Environment Variables
In Amplify Console → App Settings → Environment variables, add ALL variables from `.env.production`:

**Required Variables:**
- `DATABASE_URL` (with connection pooling)
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `PADDLE_API_KEY`
- `PADDLE_ENVIRONMENT=production`
- `PADDLE_WEBHOOK_SECRET`
- `PADDLE_PRICE_ID_STARTER`
- `PADDLE_PRICE_ID_PRO`
- `PADDLE_PRICE_ID_ENTERPRISE`
- `GEMINI_API_KEY`
- `S3_ACCESS_KEY_ID` (renamed from AWS_ACCESS_KEY_ID - Amplify doesn't allow AWS_ prefix)
- `S3_SECRET_ACCESS_KEY` (renamed from AWS_SECRET_ACCESS_KEY)
- `S3_REGION=eu-north-1` (renamed from AWS_REGION)
- `S3_BUCKET_NAME=realtor-image-generator` (renamed from AWS_S3_BUCKET)
- `NEXT_PUBLIC_S3_REGION=eu-north-1` (renamed from NEXT_PUBLIC_AWS_REGION)
- `NEXT_PUBLIC_S3_BUCKET=realtor-image-generator` (renamed from NEXT_PUBLIC_AWS_S3_BUCKET)
- `REDIS_URL`
- `NEXT_PUBLIC_APP_URL` (your production domain)
- `APP_URL` (your production domain)
- `NODE_ENV=production`
- `MAX_CONCURRENT_PROCESSING=10`
- `MAX_QUEUE_SIZE=100`
- `ADMIN_SECRET`

### Step 8: Run Database Migrations
```bash
# Set DATABASE_URL first
export DATABASE_URL="your-production-database-url"
npx prisma migrate deploy
```

### Step 9: Add Custom Domain
1. In Amplify Console → Domain management
2. Click "Add domain"
3. Enter your domain
4. Follow DNS verification steps
5. Update your DNS records as instructed

### Step 10: Deploy
```bash
amplify publish
```
Or simply push to your connected branch - Amplify will auto-deploy!

### Step 11: Update Paddle Webhook
1. Go to Paddle Dashboard → Developer Tools → Notifications
2. Update webhook URL to: `https://yourdomain.com/api/webhooks/paddle`
3. Verify webhook secret matches your `PADDLE_WEBHOOK_SECRET`

---

## For Docker/ECS (Alternative)

### Step 1: Build Docker Image
```bash
docker build -t realtor-image-generator .
```

### Step 2: Test Locally
```bash
docker run -p 3000:3000 --env-file .env.production realtor-image-generator
```

### Step 3: Push to ECR
```bash
# Create ECR repository
aws ecr create-repository --repository-name realtor-image-generator --region us-east-1

# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

# Tag and push
docker tag realtor-image-generator:latest YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/realtor-image-generator:latest
docker push YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/realtor-image-generator:latest
```

### Step 4: Create ECS Service
Use AWS Console or CloudFormation to:
1. Create ECS cluster
2. Create task definition
3. Create service with Application Load Balancer
4. Configure auto-scaling

---

## Pre-Deployment Checklist

- [ ] All environment variables set in deployment platform
- [ ] Database migrations run (`npx prisma migrate deploy`)
- [ ] RDS security groups allow app server access
- [ ] Redis/ElastiCache security groups configured
- [ ] S3 bucket policies configured
- [ ] Paddle webhook URL updated
- [ ] Domain DNS configured
- [ ] SSL certificate configured (auto with Amplify)
- [ ] CloudWatch logging enabled (optional but recommended)

---

## Post-Deployment Testing

1. **Health Check:**
   - Visit: `https://yourdomain.com/api/health`
   - Should return `{"status":"healthy"}`

2. **Homepage:**
   - Visit: `https://yourdomain.com`
   - Should load correctly

3. **Authentication:**
   - Test sign up/login
   - Verify Clerk integration works

4. **Image Processing:**
   - Upload an image
   - Process an image
   - Verify it saves to S3

5. **Billing:**
   - Test Paddle checkout
   - Verify webhook receives events

---

## Troubleshooting

### Build Fails
- Check `amplify.yml` configuration
- Verify all dependencies in `package.json`
- Check Prisma schema is valid

### Database Connection Issues
- Verify `DATABASE_URL` is correct
- Check RDS security groups allow Amplify/ECS IPs
- Verify connection pooling parameters

### S3 Access Issues
- Verify AWS credentials are correct
- Check IAM permissions for S3 bucket
- Verify bucket name matches

### Redis Connection Issues
- Verify `REDIS_URL` is correct
- Check ElastiCache security groups
- Verify network connectivity

---

## Support

For detailed instructions, see `AWS_DEPLOYMENT_GUIDE.md`

