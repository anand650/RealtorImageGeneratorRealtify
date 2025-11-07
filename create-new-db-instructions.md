# Create New RDS Database

## Steps to Create New RDS Instance:

1. **Go to AWS RDS Console**
2. **Click "Create database"**
3. **Choose "PostgreSQL"**
4. **Template**: Free tier (for development)
5. **DB instance identifier**: `realtor-image-generator-db`
6. **Master username**: `postgres`
7. **Master password**: `Passwd123456789` (same as before)
8. **DB instance class**: db.t3.micro (free tier)
9. **Storage**: 20 GB (free tier)
10. **VPC**: Default VPC
11. **Subnet group**: Default
12. **Public access**: Yes (for development)
13. **VPC security group**: Create new
14. **Database name**: `postgres`
15. **Backup retention**: 7 days
16. **Monitoring**: Disable (to save costs)

## After Creation:
1. **Note the endpoint** (will be different)
2. **Update .env.local** with new endpoint
3. **Run Prisma migrations** to create tables
4. **Test connection**

## Security Group Rules:
Add these inbound rules:
- **Type**: PostgreSQL
- **Port**: 5432
- **Source**: Your IP (223.185.36.73/32)
- **Description**: Development access

