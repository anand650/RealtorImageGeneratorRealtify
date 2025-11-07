# Database Setup Guide

Your application is currently unable to connect to the AWS RDS database. Here are your options:

## 🚨 Current Issue

```
Can't reach database server at realtor-image-generator-db.ce1qio26ynqb.us-east-1.rds.amazonaws.com:5432
```

This means the AWS RDS instance is either:
- Stopped (to save costs)
- Deleted
- Behind a firewall/security group that blocks your IP
- In a VPC without public access

---

## ✅ Solution 1: Local PostgreSQL with Docker (Recommended for Development)

### Prerequisites
- Install [Docker Desktop](https://www.docker.com/products/docker-desktop/)

### Steps

1. **Start local database services:**
```powershell
cd realtor-image-generator
docker-compose -f docker-compose.dev.yml up -d
```

2. **Update `.env.local`:**
```env
DATABASE_URL="postgresql://postgres:Passwd123456789@localhost:5432/realtor_dev?schema=public"
REDIS_URL="redis://localhost:6379"
```

3. **Run migrations:**
```powershell
npx prisma migrate dev
```

4. **Start the app:**
```powershell
npm run dev
```

### Stop services when done:
```powershell
docker-compose -f docker-compose.dev.yml down
```

---

## ✅ Solution 2: Fix AWS RDS Connection

### Check RDS Status

1. Go to [AWS Console → RDS](https://console.aws.amazon.com/rds/)
2. Find `realtor-image-generator-db` in `us-east-1` region
3. Check status:
   - If **Stopped**: Click Actions → Start
   - If **Not found**: The instance was deleted (use Solution 1 or 3)

### Fix Security Group

1. Click on the RDS instance
2. Go to **Connectivity & security** tab
3. Click on the **VPC security groups** link
4. Edit **Inbound rules**
5. Add rule:
   - Type: PostgreSQL
   - Port: 5432
   - Source: `0.0.0.0/0` (for testing) or your specific IP
6. Save rules

### Test Connection
```powershell
npx prisma db pull
```

---

## ✅ Solution 3: Use Supabase (Free PostgreSQL Hosting)

### Setup

1. Go to [supabase.com](https://supabase.com)
2. Sign up and create a new project
3. Wait for database to provision (~2 minutes)
4. Go to **Settings → Database**
5. Copy the **Connection string** (URI format)

### Update `.env.local`
```env
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT-REF].supabase.co:5432/postgres?schema=public"
```

### Run migrations
```powershell
npx prisma migrate dev
```

---

## ✅ Solution 4: Use Neon (Serverless PostgreSQL)

### Setup

1. Go to [neon.tech](https://neon.tech)
2. Sign up and create a new project
3. Copy the connection string

### Update `.env.local`
```env
DATABASE_URL="postgresql://[user]:[password]@[host]/[database]?sslmode=require"
```

### Run migrations
```powershell
npx prisma migrate dev
```

---

## 🔍 Troubleshooting

### Test database connectivity:
```powershell
# Using Prisma
npx prisma db pull

# Using psql (if installed)
psql "postgresql://postgres:Passwd123456789@localhost:5432/realtor_dev"
```

### Common Issues

**"Port 5432 already in use"**
- Another PostgreSQL instance is running
- Stop it or use a different port in docker-compose.dev.yml

**"Docker not found"**
- Install Docker Desktop from docker.com
- Restart your terminal after installation

**"Migration failed"**
- Database might have old schema
- Try: `npx prisma migrate reset` (⚠️ deletes all data)

---

## 📝 Current Configuration

Your `.env.local` currently points to:
```
DATABASE_URL="postgresql://postgres:Passwd123456789@realtor-image-generator-db.ce1qio26ynqb.us-east-1.rds.amazonaws.com:5432/postgres?schema=public"
```

**Recommendation**: Use Solution 1 (Docker) for local development, keep AWS RDS for production.

---

## 🚀 Quick Start (Docker)

```powershell
# 1. Start services
docker-compose -f docker-compose.dev.yml up -d

# 2. Update .env.local to use localhost

# 3. Run migrations
npx prisma migrate dev

# 4. Start app
npm run dev
```

That's it! Your app should now work with a local database.




