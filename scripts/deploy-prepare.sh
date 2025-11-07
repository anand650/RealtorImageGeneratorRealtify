#!/bin/bash

# Deployment Preparation Script
# This script prepares the application for production deployment

set -e

echo "🚀 Preparing application for production deployment..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
  echo "❌ Error: package.json not found. Please run this script from the project root."
  exit 1
fi

# 1. Install dependencies
echo "📦 Installing dependencies..."
npm ci

# 2. Generate Prisma Client
echo "🔧 Generating Prisma Client..."
npx prisma generate

# 3. Run database migrations (dry run check)
echo "🗄️  Checking database migrations..."
if [ -z "$DATABASE_URL" ]; then
  echo "⚠️  Warning: DATABASE_URL not set. Skipping migration check."
else
  echo "✅ Database URL configured. Ready for migrations."
  echo "   Run 'npx prisma migrate deploy' after deployment to apply migrations."
fi

# 4. Build the application
echo "🏗️  Building application..."
npm run build

# 5. Verify build
if [ -d ".next" ]; then
  echo "✅ Build successful!"
else
  echo "❌ Build failed!"
  exit 1
fi

echo ""
echo "✅ Preparation complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Review .env.production.template and create .env.production"
echo "   2. Update all production environment variables"
echo "   3. Run database migrations: npx prisma migrate deploy"
echo "   4. Deploy using your chosen method (Amplify, ECS, or Vercel)"
echo ""

