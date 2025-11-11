import { PrismaClient } from '@prisma/client'
import path from 'path'
import fs from 'fs'

if (
  process.env.NODE_ENV === 'production' &&
  !process.env.PRISMA_QUERY_ENGINE_LIBRARY
) {
  const defaultEnginePath = path.join(
    process.cwd(),
    '.prisma',
    'client',
    'libquery_engine-rhel-openssl-3.0.x.so.node',
  )

  if (fs.existsSync(defaultEnginePath)) {
    process.env.PRISMA_QUERY_ENGINE_LIBRARY = defaultEnginePath
  }
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Production-optimized Prisma client
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'error', 'warn'] 
    : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  // Connection pooling is handled via DATABASE_URL parameters:
  // ?connection_limit=20&pool_timeout=10&sslmode=require
})

// Prevent multiple instances in development
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// Graceful shutdown
if (process.env.NODE_ENV === 'production') {
  process.on('beforeExit', async () => {
    await prisma.$disconnect()
  })
}



