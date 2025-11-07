#!/bin/bash

# Deployment Readiness Check Script
# This script checks if everything is ready for production deployment

set -e

echo "🔍 Checking deployment readiness..."
echo ""

ERRORS=0
WARNINGS=0

# Check required files
echo "📁 Checking required files..."
REQUIRED_FILES=("package.json" "next.config.ts" "prisma/schema.prisma" "Dockerfile" "amplify.yml")
for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✅ $file"
    else
        echo "  ❌ $file (missing)"
        ((ERRORS++))
    fi
done

# Check environment variables template
if [ -f ".env.production.template" ]; then
    echo "  ✅ .env.production.template"
else
    echo "  ⚠️  .env.production.template (missing, but not critical)"
    ((WARNINGS++))
fi

echo ""

# Check if DATABASE_URL is set
echo "🔌 Checking environment variables..."
if [ -z "$DATABASE_URL" ]; then
    echo "  ⚠️  DATABASE_URL not set (will need to set in deployment platform)"
    ((WARNINGS++))
else
    echo "  ✅ DATABASE_URL configured"
fi

# Check AWS credentials
if [ -z "$AWS_ACCESS_KEY_ID" ] || [ -z "$AWS_SECRET_ACCESS_KEY" ]; then
    echo "  ⚠️  AWS credentials not set (will need to set in deployment platform)"
    ((WARNINGS++))
else
    echo "  ✅ AWS credentials configured"
fi

# Check if can build
echo ""
echo "🏗️  Testing build..."
if npm run build > /dev/null 2>&1; then
    echo "  ✅ Build test passed"
else
    echo "  ❌ Build test failed"
    ((ERRORS++))
fi

# Check Prisma
echo ""
echo "🗄️  Checking Prisma..."
if npx prisma validate > /dev/null 2>&1; then
    echo "  ✅ Prisma schema is valid"
else
    echo "  ❌ Prisma schema validation failed"
    ((ERRORS++))
fi

echo ""
echo "📊 Summary:"
if [ $ERRORS -eq 0 ]; then
    echo "  ✅ Ready for deployment! ($WARNINGS warnings)"
    exit 0
else
    echo "  ❌ Not ready for deployment ($ERRORS errors, $WARNINGS warnings)"
    exit 1
fi

