# Setup Local PostgreSQL Database

## Install PostgreSQL (Windows):

1. **Download**: https://www.postgresql.org/download/windows/
2. **Install** with default settings
3. **Password**: `password` (remember this)
4. **Port**: 5432 (default)

## Create Database:

1. **Open pgAdmin** or **psql**
2. **Connect** to local PostgreSQL
3. **Create database**:
   ```sql
   CREATE DATABASE realtor_image_generator;
   ```

## Update Environment:

1. **Edit .env.local**:
   ```
   DATABASE_URL="postgresql://postgres:password@localhost:5432/realtor_image_generator?schema=public"
   ```

## Run Migrations:

```bash
npx prisma migrate dev
npx prisma generate
```

## Test Connection:

```bash
node test-db-connection.js
```


