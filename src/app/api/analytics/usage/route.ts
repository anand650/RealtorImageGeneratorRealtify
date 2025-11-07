import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Check if authentication is disabled for development
    const user = await currentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const dbUser = await prisma.user.findUnique({ where: { clerkId: user.id }, include: { tenant: true } })
    if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30' // days
    const periodDays = parseInt(period)
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - periodDays)

    // Get usage statistics
    const tenantWhere = dbUser.tenantId ? { tenantId: dbUser.tenantId } : { userId: dbUser.id }

    const activeCutoff = new Date(Date.now() - 15 * 60 * 1000) // last 15 minutes considered actively processing

    const [totalImages, completedImages, failedImages, processingImages, recentUsage, roomTypeStats, styleStats] = await Promise.all([
      prisma.image.count({ where: { ...tenantWhere, createdAt: { gte: startDate } } }),
      prisma.image.count({ where: { ...tenantWhere, status: 'completed', createdAt: { gte: startDate } } }),
      prisma.image.count({ where: { ...tenantWhere, status: 'failed', createdAt: { gte: startDate } } }),
      prisma.image.count({
        where: {
          ...tenantWhere,
          OR: [
            { status: 'processing', updatedAt: { gte: activeCutoff } },
            { status: 'pending', createdAt: { gte: activeCutoff } }
          ]
        }
      }),
      prisma.$queryRawUnsafe(`
        SELECT to_char(date_trunc('day', "createdAt"), 'YYYY-MM-DD') as date,
               COUNT(*) as count,
               COUNT(*) FILTER (WHERE status = 'completed') as completed,
               COUNT(*) FILTER (WHERE status = 'failed') as failed
        FROM "images"
        WHERE ${dbUser.tenantId ? '"tenantId" = $1' : '"userId" = $1'}
          AND "createdAt" >= $2
        GROUP BY 1
        ORDER BY 1 DESC
      `, dbUser.tenantId || dbUser.id, startDate),
      prisma.image.groupBy({ by: ['roomType'], where: { ...tenantWhere, createdAt: { gte: startDate }, status: 'completed' }, _count: true }),
      prisma.image.groupBy({ by: ['style'], where: { ...tenantWhere, createdAt: { gte: startDate }, status: 'completed' }, _count: true })
    ])

    // Calculate success rate
    const successRate = totalImages > 0 ? (completedImages / totalImages) * 100 : 0

    // Get average processing time
    // Compute average from timestamps to avoid legacy ms vs s inconsistencies
    const avgRow: any = await prisma.$queryRawUnsafe(
      `SELECT COALESCE(AVG(GREATEST(1, EXTRACT(EPOCH FROM ("updatedAt" - "createdAt")))), 0) AS avg_seconds
       FROM "images"
       WHERE ${dbUser.tenantId ? '"tenantId" = $1' : '"userId" = $1'}
         AND "createdAt" >= $2
         AND status = 'completed'`,
      dbUser.tenantId || dbUser.id,
      startDate,
    )

    // Fallback to column-based average if timestamp delta yields 0 (older rows, clock skew, etc.)
    const avgCol = await prisma.image.aggregate({
      where: { ...tenantWhere, status: 'completed', processingTime: { not: null }, createdAt: { gte: startDate } },
      _avg: { processingTime: true }
    })
    const avgColRaw = Number(avgCol._avg.processingTime || 0)
    // If legacy ms values exist, convert to seconds; otherwise use as-is
    const avgFromColSeconds = avgColRaw > 1000 ? avgColRaw / 1000 : avgColRaw
    const avgFromTimestamps = Number(avgRow?.avg_seconds || 0)
    const finalAvgSeconds = Math.round(Math.max(avgFromTimestamps, avgFromColSeconds))

    // Current usage limits
    const currentUsage = {
      freeImagesUsed: dbUser.freeImagesUsed || 0,
      freeImagesLimit: dbUser.freeImagesLimit || 4,
      subscriptionImages: dbUser.tenant ? {
        used: dbUser.tenant.tokensUsed || 0,
        limit: dbUser.tenant.tokensAllocated || 0
      } : null
    }

    // Normalize potential BigInt values from raw SQL
    const normalizedDaily = (recentUsage as any[]).map((r: any) => ({
      date: String(r.date),
      count: Number(r.count || 0),
      completed: Number(r.completed || 0),
      failed: Number(r.failed || 0),
    }))

    return NextResponse.json({
      period: periodDays,
      overview: {
        totalImages,
        completedImages,
        failedImages,
        processingImages,
        successRate: Math.round(successRate * 100) / 100,
        avgProcessingTime: finalAvgSeconds
      },
      usage: currentUsage,
      trends: { daily: normalizedDaily, roomTypes: roomTypeStats, styles: styleStats }
    })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}
