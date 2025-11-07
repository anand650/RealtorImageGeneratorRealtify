# Deployment Preparation Script for Windows PowerShell
# This script prepares the application for production deployment

Write-Host "🚀 Preparing application for production deployment..." -ForegroundColor Cyan

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: package.json not found. Please run this script from the project root." -ForegroundColor Red
    exit 1
}

# 1. Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm ci
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

# 2. Generate Prisma Client
Write-Host "🔧 Generating Prisma Client..." -ForegroundColor Yellow
npx prisma generate
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to generate Prisma Client" -ForegroundColor Red
    exit 1
}

# 3. Check database URL
Write-Host "🗄️  Checking database configuration..." -ForegroundColor Yellow
$dbUrl = $env:DATABASE_URL
if (-not $dbUrl) {
    Write-Host "⚠️  Warning: DATABASE_URL not set. Skipping migration check." -ForegroundColor Yellow
} else {
    Write-Host "✅ Database URL configured. Ready for migrations." -ForegroundColor Green
    Write-Host "   Run 'npx prisma migrate deploy' after deployment to apply migrations." -ForegroundColor Cyan
}

# 4. Build the application
Write-Host "🏗️  Building application..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}

# 5. Verify build
if (Test-Path ".next") {
    Write-Host "✅ Build successful!" -ForegroundColor Green
} else {
    Write-Host "❌ Build output not found!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ Preparation complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Review .env.production.template and create .env.production"
Write-Host "   2. Update all production environment variables"
Write-Host "   3. Run database migrations: npx prisma migrate deploy"
Write-Host "   4. Deploy using your chosen method (Amplify, ECS, or Vercel)"
Write-Host ""

