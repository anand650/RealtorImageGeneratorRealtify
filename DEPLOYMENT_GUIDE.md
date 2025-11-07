# Deployment Guide - Database Strategy

## 🏗️ **Development vs Production Setup**

### **Development (Local)**
- **Database**: Local PostgreSQL
- **File**: `.env.local`
- **Benefits**: 
  - No IP restrictions
  - Fast development
  - No AWS costs
  - Works offline

### **Production (AWS)**
- **Database**: AWS RDS
- **File**: `.env.production`
- **Benefits**:
  - Scalable
  - Managed
  - Backups
  - High availability

## 🚀 **Deployment Process**

### **Step 1: Development Setup**
```bash
# Install PostgreSQL locally
# Update .env.local with local database URL
# Run migrations
npx prisma migrate dev
npx prisma generate
```

### **Step 2: Production Deployment**
```bash
# Switch to production environment
cp .env.production .env.local

# Run production migrations
npx prisma migrate deploy

# Deploy to Vercel/AWS
vercel deploy --prod
```

### **Step 3: Environment Variables in Vercel**
1. **Vercel Dashboard** → **Your Project** → **Settings** → **Environment Variables**
2. **Add all variables** from `.env.production`
3. **Set environment** to "Production"

## 🔄 **Database Migration Strategy**

### **Schema Changes**
1. **Develop locally** with local database
2. **Test migrations** on local database
3. **Deploy migrations** to production RDS
4. **No code changes needed** - Prisma handles it

### **Data Migration**
1. **Export** from local database
2. **Import** to production RDS
3. **Or** use Prisma's built-in migration tools

## 🛡️ **Security Considerations**

### **Development**
- Local database (no external access)
- Use `.env.local` (gitignored)

### **Production**
- AWS RDS with proper security groups
- Environment variables in deployment platform
- Never commit production secrets

## 📋 **Quick Commands**

### **Switch to Local Development**
```bash
# Use local database
cp .env.local .env.local.backup
# Edit .env.local to use local database URL
npx prisma migrate dev
```

### **Switch to Production**
```bash
# Use production database
cp .env.production .env.local
npx prisma migrate deploy
```

### **Test Database Connection**
```bash
node test-db-connection.js
```

## 🎯 **Benefits of This Approach**

1. **No IP restrictions** during development
2. **Same codebase** for dev and production
3. **Easy switching** between environments
4. **No deployment complexity**
5. **Cost-effective** development


