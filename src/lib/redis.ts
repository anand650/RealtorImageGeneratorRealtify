import { createClient } from 'redis'

const redis = createClient({
  url: process.env.REDIS_URL!,
})

redis.on('error', (err) => console.error('Redis Client Error', err))

export async function connectRedis() {
  if (!redis.isOpen) {
    await redis.connect()
  }
  return redis
}

export async function setCache(key: string, value: any, ttlSeconds = 3600) {
  const client = await connectRedis()
  await client.setEx(key, ttlSeconds, JSON.stringify(value))
}

export async function getCache(key: string) {
  const client = await connectRedis()
  const value = await client.get(key)
  return value ? JSON.parse(value) : null
}

export async function deleteCache(key: string) {
  const client = await connectRedis()
  await client.del(key)
}

export async function incrementCounter(key: string, ttlSeconds = 3600) {
  const client = await connectRedis()
  const count = await client.incr(key)
  if (count === 1) {
    await client.expire(key, ttlSeconds)
  }
  return count
}

export async function getCounter(key: string) {
  const client = await connectRedis()
  const count = await client.get(key)
  return count ? parseInt(count) : 0
}

// Rate limiting functions
export async function checkRateLimit(userId: string, action: string, limit: number, windowSeconds = 3600) {
  const key = `rate_limit:${userId}:${action}`
  const count = await incrementCounter(key, windowSeconds)
  return {
    allowed: count <= limit,
    count,
    limit,
    resetTime: Date.now() + windowSeconds * 1000,
  }
}

// Token usage tracking
export async function trackTokenUsage(userId: string, tokensUsed: number) {
  const today = new Date().toISOString().split('T')[0]
  const key = `tokens:${userId}:${today}`
  await incrementCounter(key, 86400) // 24 hours
  await incrementCounter(`tokens:${userId}:total`, 86400 * 30) // 30 days
}

export async function getTokenUsage(userId: string, period: 'today' | 'month' | 'total') {
  const today = new Date().toISOString().split('T')[0]
  
  switch (period) {
    case 'today':
      return await getCounter(`tokens:${userId}:${today}`)
    case 'month':
      return await getCounter(`tokens:${userId}:total`)
    case 'total':
      return await getCounter(`tokens:${userId}:total`)
    default:
      return 0
  }
}



