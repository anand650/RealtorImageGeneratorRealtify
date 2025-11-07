import { prisma } from './prisma'
import { headers } from 'next/headers'

export interface UsageResult {
  canGenerate: boolean
  remainingImages: number
  isAnonymous: boolean
  requiresSignup: boolean
  requiresSubscription: boolean
  message?: string
}

/**
 * Get client IP address from request headers
 */
export async function getClientIp(): Promise<string> {
  const headersList = await headers()
  const forwarded = headersList.get('x-forwarded-for')
  const realIp = headersList.get('x-real-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (realIp) {
    return realIp
  }
  
  // Fallback for development
  return '127.0.0.1'
}

/**
 * Check if anonymous user (by IP) can generate images
 */
export async function checkAnonymousUsage(ipAddress: string): Promise<UsageResult> {
  const today = new Date().toISOString().split('T')[0]
  
  try {
    // Get or create IP usage record
    let ipUsage = await prisma.ipUsageTracking.findUnique({
      where: { ipAddress }
    })
    
    if (!ipUsage) {
      // Create new IP usage record
      ipUsage = await prisma.ipUsageTracking.create({
        data: {
          ipAddress,
          imagesGenerated: 0,
          dailyUsage: { [today]: 0 }
        }
      })
    }
    
    const dailyUsage = ipUsage.dailyUsage as Record<string, number>
    const todayUsage = dailyUsage[today] || 0
    const totalUsage = ipUsage.imagesGenerated
    
    // Anonymous users get 2 free images total
    const ANONYMOUS_LIMIT = 2
    const DAILY_LIMIT = 2 // Prevent abuse
    
    if (totalUsage >= ANONYMOUS_LIMIT) {
      return {
        canGenerate: false,
        remainingImages: 0,
        isAnonymous: true,
        requiresSignup: true,
        requiresSubscription: false,
        message: 'You have used your 2 free images. Sign up to get 2 more free images!'
      }
    }
    
    if (todayUsage >= DAILY_LIMIT) {
      return {
        canGenerate: false,
        remainingImages: ANONYMOUS_LIMIT - totalUsage,
        isAnonymous: true,
        requiresSignup: false,
        requiresSubscription: false,
        message: 'Daily limit reached. Try again tomorrow or sign up for more images.'
      }
    }
    
    return {
      canGenerate: true,
      remainingImages: ANONYMOUS_LIMIT - totalUsage,
      isAnonymous: true,
      requiresSignup: false,
      requiresSubscription: false
    }
  } catch (error) {
    console.error('Error checking anonymous usage:', error)
    return {
      canGenerate: false,
      remainingImages: 0,
      isAnonymous: true,
      requiresSignup: false,
      requiresSubscription: false,
      message: 'Unable to verify usage. Please try again.'
    }
  }
}

/**
 * Check if authenticated user can generate images
 */
export async function checkUserUsage(userId: string): Promise<UsageResult> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        tenant: {
          include: {
            subscriptions: {
              where: { status: 'active' },
              orderBy: { createdAt: 'desc' },
              take: 1
            }
          }
        }
      }
    })
    
    if (!user) {
      return {
        canGenerate: false,
        remainingImages: 0,
        isAnonymous: false,
        requiresSignup: false,
        requiresSubscription: true,
        message: 'User not found'
      }
    }
    
    // Check if user has active subscription
    const activeSubscription = user.tenant?.subscriptions[0]
    
    if (activeSubscription) {
      // User has subscription - check tenant limits
      const tenant = user.tenant!
      const remainingTokens = tenant.tokensAllocated - tenant.tokensUsed
      
      return {
        canGenerate: remainingTokens > 0,
        remainingImages: remainingTokens,
        isAnonymous: false,
        requiresSignup: false,
        requiresSubscription: false,
        message: remainingTokens <= 0 ? 'Subscription limit reached. Upgrade your plan for more images.' : undefined
      }
    }
    
    // No subscription - check free tier
    // Free tier users use tenant tokens (4 tokens allocated for free tier)
    if (user.tenant) {
      const tenant = user.tenant
      const remainingTokens = tenant.tokensAllocated - tenant.tokensUsed
      
      if (remainingTokens > 0) {
        return {
          canGenerate: true,
          remainingImages: remainingTokens,
          isAnonymous: false,
          requiresSignup: false,
          requiresSubscription: false,
          message: undefined
        }
      }
      
      return {
        canGenerate: false,
        remainingImages: 0,
        isAnonymous: false,
        requiresSignup: false,
        requiresSubscription: true,
        message: 'You\'ve used all 4 free credits. Subscribe to continue generating images!'
      }
    }
    
    // Fallback: Check user-level free images (for backwards compatibility)
    const remainingFree = user.freeImagesLimit - user.freeImagesUsed
    
    if (remainingFree > 0) {
      return {
        canGenerate: true,
        remainingImages: remainingFree,
        isAnonymous: false,
        requiresSignup: false,
        requiresSubscription: false
      }
    }
    
    return {
      canGenerate: false,
      remainingImages: 0,
      isAnonymous: false,
      requiresSignup: false,
      requiresSubscription: true,
      message: 'Free credits used up. Subscribe to continue generating images.'
    }
  } catch (error) {
    console.error('Error checking user usage:', error)
    return {
      canGenerate: false,
      remainingImages: 0,
      isAnonymous: false,
      requiresSignup: false,
      requiresSubscription: false,
      message: 'Unable to verify usage. Please try again.'
    }
  }
}

/**
 * Record image generation for anonymous user
 */
export async function recordAnonymousUsage(ipAddress: string): Promise<void> {
  const today = new Date().toISOString().split('T')[0]
  
  try {
    // First get the current record to update daily usage properly
    const currentRecord = await prisma.ipUsageTracking.findUnique({
      where: { ipAddress }
    })
    
    const currentDailyUsage = (currentRecord?.dailyUsage as Record<string, number>) || {}
    const todayCount = currentDailyUsage[today] || 0
    
    await prisma.ipUsageTracking.upsert({
      where: { ipAddress },
      update: {
        imagesGenerated: { increment: 1 },
        lastUsedAt: new Date(),
        dailyUsage: {
          ...currentDailyUsage,
          [today]: todayCount + 1
        }
      },
      create: {
        ipAddress,
        imagesGenerated: 1,
        dailyUsage: { [today]: 1 }
      }
    })
  } catch (error) {
    console.error('Error recording anonymous usage:', error)
  }
}

/**
 * Record image generation for authenticated user
 */
export async function recordUserUsage(userId: string): Promise<void> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        tenant: {
          include: {
            subscriptions: {
              where: { status: 'active' },
              orderBy: { createdAt: 'desc' },
              take: 1
            }
          }
        }
      }
    })
    
    if (!user) return
    
    const activeSubscription = user.tenant?.subscriptions[0]
    
    if (activeSubscription && user.tenant) {
      // User with subscription - increment tenant tokens
      await prisma.tenant.update({
        where: { id: user.tenant.id },
        data: { tokensUsed: { increment: 1 } }
      })
    } else if (user.tenant) {
      // Free tier user - increment tenant tokens (free tier uses tenant tokens)
      await prisma.tenant.update({
        where: { id: user.tenant.id },
        data: { tokensUsed: { increment: 1 } }
      })
    } else {
      // Fallback: Increment user-level free usage (for backwards compatibility)
      await prisma.user.update({
        where: { id: userId },
        data: { freeImagesUsed: { increment: 1 } }
      })
    }
    
    // Log usage
    await prisma.usageLog.create({
      data: {
        userId,
        tenantId: user.tenantId,
        action: 'image_generated',
        tokensConsumed: 1,
        metadata: {
          hasSubscription: !!activeSubscription,
          timestamp: new Date().toISOString()
        }
      }
    })
  } catch (error) {
    console.error('Error recording user usage:', error)
  }
}

/**
 * Grant signup bonus to new user
 */
export async function grantSignupBonus(userId: string): Promise<void> {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        hasUsedSignupBonus: true,
        freeImagesLimit: 4 // 2 base + 2 signup bonus
      }
    })
  } catch (error) {
    console.error('Error granting signup bonus:', error)
  }
}
