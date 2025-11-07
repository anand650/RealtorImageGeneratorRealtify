import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30' // days
    const days = parseInt(period)

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { tenant: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Get usage statistics
    const [
      totalImages,
      successfulImages,
      failedImages,
      totalTokensUsed,
      roomTypeStats,
      dailyUsage,
      processingTimes,
    ] = await Promise.all([
      // Total images in period
      prisma.image.count({
        where: {
          userId: user.id,
          createdAt: { gte: startDate },
        },
      }),

      // Successful images
      prisma.image.count({
        where: {
          userId: user.id,
          createdAt: { gte: startDate },
          status: 'completed',
        },
      }),

      // Failed images
      prisma.image.count({
        where: {
          userId: user.id,
          createdAt: { gte: startDate },
          status: 'failed',
        },
      }),

      // Total tokens used
      prisma.usageLog.aggregate({
        where: {
          userId: user.id,
          createdAt: { gte: startDate },
          action: 'image_processing_started',
        },
        _sum: { tokensConsumed: true },
      }),

      // Room type statistics
      prisma.image.groupBy({
        by: ['roomType'],
        where: {
          userId: user.id,
          createdAt: { gte: startDate },
          status: 'completed',
        },
        _count: { roomType: true },
      }),

      // Daily usage for chart
      prisma.usageLog.groupBy({
        by: ['createdAt'],
        where: {
          userId: user.id,
          createdAt: { gte: startDate },
          action: 'image_processing_started',
        },
        _sum: { tokensConsumed: true },
      }),

      // Processing times
      prisma.image.findMany({
        where: {
          userId: user.id,
          createdAt: { gte: startDate },
          status: 'completed',
          processingTime: { not: null },
        },
        select: { processingTime: true },
      }),
    ])

    // Calculate success rate
    const successRate = totalImages > 0 ? (successfulImages / totalImages) * 100 : 0

    // Calculate average processing time
    const avgProcessingTime = processingTimes.length > 0
      ? processingTimes.reduce((sum, img) => sum + (img.processingTime || 0), 0) / processingTimes.length
      : 0

    // Format room type stats
    const roomTypeStatsFormatted = roomTypeStats.map(stat => ({
      type: stat.roomType,
      count: stat._count.roomType,
      percentage: totalImages > 0 ? (stat._count.roomType / totalImages) * 100 : 0,
    }))

    // Format daily usage
    const dailyUsageFormatted = dailyUsage.map(usage => ({
      date: usage.createdAt.toISOString().split('T')[0],
      tokens: usage._sum.tokensConsumed || 0,
    }))

    // Get previous period for comparison
    const previousStartDate = new Date(startDate)
    previousStartDate.setDate(previousStartDate.getDate() - days)

    const previousPeriodImages = await prisma.image.count({
      where: {
        userId: user.id,
        createdAt: {
          gte: previousStartDate,
          lt: startDate,
        },
      },
    })

    const currentPeriodImages = totalImages
    const trend = previousPeriodImages > 0
      ? ((currentPeriodImages - previousPeriodImages) / previousPeriodImages) * 100
      : 0

    return NextResponse.json({
      overview: {
        totalImages,
        successfulImages,
        failedImages,
        successRate: Math.round(successRate * 100) / 100,
        totalTokensUsed: totalTokensUsed._sum.tokensConsumed || 0,
        averageProcessingTime: Math.round(avgProcessingTime),
      },
      roomTypeStats: roomTypeStatsFormatted,
      dailyUsage: dailyUsageFormatted,
      trends: {
        imagesProcessed: {
          current: currentPeriodImages,
          previous: previousPeriodImages,
          trend: Math.round(trend * 100) / 100,
        },
      },
      period: {
        days,
        startDate: startDate.toISOString(),
        endDate: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}



