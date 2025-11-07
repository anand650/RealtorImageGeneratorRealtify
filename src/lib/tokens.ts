import { prisma } from './prisma'
import { PLAN_CATALOG } from '@/constants/planCatalog'

export interface TokenPlan {
  id: string
  name: string
  tokensAllocated: number
  price: number
  features: string[]
  billingIntervalDays: number
}

export const TOKEN_PLANS: TokenPlan[] = PLAN_CATALOG.map((plan) => ({
  id: plan.id,
  name: plan.name,
  tokensAllocated: plan.tokens,
  price: plan.price,
  features: plan.features,
  billingIntervalDays: plan.billingIntervalDays,
}))

function addDays(date: Date, days: number) {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

export async function initializeUserTokens(userId: string, planId: string | null = null) {
  // If no plan specified, create a free tier tenant
  const isFreeTier = !planId || planId === 'free'
  
  if (isFreeTier) {
    // Free tier: 4 images, inactive billing status, no subscription plan
    const baseSlug = `user-${userId}`
    
    // First check if tenant already exists
    let existingTenant = await prisma.tenant.findUnique({
      where: { slug: baseSlug }
    })
    
    if (existingTenant) {
      // If tenant exists but is free tier, ensure it has 4 credits
      if (existingTenant.subscriptionPlan === 'free') {
        await prisma.tenant.update({
          where: { id: existingTenant.id },
          data: {
            tokensAllocated: 4,
            tokensUsed: Math.min(existingTenant.tokensUsed, 4), // Cap used tokens at allocated
          },
        })
        // Reload tenant
        existingTenant = await prisma.tenant.findUnique({
          where: { id: existingTenant.id }
        })
      }
      return existingTenant!
    }
    
    // Create new free tier tenant with 4 credits
    let tenant = await prisma.tenant.create({
      data: {
        name: 'Personal Account',
        slug: baseSlug,
        tokensAllocated: 4, // Free tier: 4 images
        tokensUsed: 0,
        subscriptionPlan: 'free',
        billingStatus: 'inactive', // Free tier is not an active subscription
        currentPeriodStart: null,
        currentPeriodEnd: null,
      },
    })

    // If creation failed due to slug conflict, try with fallback
    if (!tenant) {
      const fallbackSlug = `${baseSlug}-${Date.now().toString(36).slice(-4)}`
      tenant = await prisma.tenant.create({
        data: {
          name: 'Personal Account',
          slug: fallbackSlug,
          tokensAllocated: 4,
          tokensUsed: 0,
          subscriptionPlan: 'free',
          billingStatus: 'inactive',
          currentPeriodStart: null,
          currentPeriodEnd: null,
        },
      })
    }

    return tenant
  }

  const plan = TOKEN_PLANS.find(p => p.id === planId)
  if (!plan) {
    throw new Error(`Invalid plan: ${planId}`)
  }

  // Check if tenant already exists for this user
  const existingTenant = await prisma.tenant.findFirst({
    where: {
      users: {
        some: {
          id: userId
        }
      }
    }
  })

  if (existingTenant) {
    // If it's a free tier tenant with wrong allocation, fix it
    if (existingTenant.subscriptionPlan === 'free' && existingTenant.tokensAllocated !== 4) {
      await prisma.tenant.update({
        where: { id: existingTenant.id },
        data: {
          tokensAllocated: 4,
          tokensUsed: Math.min(existingTenant.tokensUsed, 4),
        },
      })
      // Reload tenant
      return await prisma.tenant.findUnique({ where: { id: existingTenant.id } })!
    }
    return existingTenant
  }

  // Create or reuse tenant using collision-safe slug (id-based, not display name)
  const baseSlug = `user-${userId}`
  let tenant = await prisma.tenant.upsert({
    where: { slug: baseSlug },
    update: {},
    create: {
      name: 'Personal Account',
      slug: baseSlug,
      tokensAllocated: plan.tokensAllocated,
      tokensUsed: 0,
      subscriptionPlan: plan.id,
      billingStatus: 'active',
      currentPeriodStart: new Date(),
      currentPeriodEnd: addDays(new Date(), plan.billingIntervalDays),
    },
  })

  // Extremely rare: if another process created same slug between check and upsert variations, retry with a short suffix
  if (!tenant) {
    const fallbackSlug = `${baseSlug}-${Date.now().toString(36).slice(-4)}`
    tenant = await prisma.tenant.upsert({
      where: { slug: fallbackSlug },
      update: {},
      create: {
        name: 'Personal Account',
        slug: fallbackSlug,
        tokensAllocated: plan.tokensAllocated,
        tokensUsed: 0,
        subscriptionPlan: plan.id,
        billingStatus: 'active',
        currentPeriodStart: new Date(),
        currentPeriodEnd: addDays(new Date(), plan.billingIntervalDays),
      },
    })
  }

  return tenant
}

export async function checkTokenAvailability(userId: string, tokensNeeded: number): Promise<boolean> {
  // First get the user to find their tenant
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { tenant: true }
  })

  if (!user || !user.tenant) {
    return false
  }

  return (user.tenant.tokensUsed + tokensNeeded) <= user.tenant.tokensAllocated
}

export async function consumeTokens(userId: string, tokensUsed: number, action: string, metadata?: any) {
  // First get the user to find their tenant
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { tenant: true }
  })

  if (!user || !user.tenant) {
    throw new Error('Tenant not found')
  }

  // Update token usage
  const updatedTenant = await prisma.tenant.update({
    where: { id: user.tenant.id },
    data: {
      tokensUsed: {
        increment: tokensUsed
      }
    }
  })

  // Log usage
  await prisma.usageLog.create({
    data: {
      userId: userId,
      tenantId: user.tenant.id,
      action,
      tokensConsumed: tokensUsed,
      metadata: metadata || {}
    }
  })

  return updatedTenant
}

export async function refreshMonthlyTokens(userId: string) {
  // First get the user to find their tenant
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { tenant: true }
  })

  if (!user || !user.tenant) {
    throw new Error('Tenant not found')
  }

  const tenant = user.tenant
  const plan = TOKEN_PLANS.find(p => p.id === tenant.subscriptionPlan)

  if (!plan) {
    throw new Error('Invalid plan')
  }

  const now = new Date()
  const currentPeriodEnd = tenant.currentPeriodEnd

  if (!currentPeriodEnd || now >= currentPeriodEnd) {
    const nextEndDate = addDays(now, plan.billingIntervalDays)

    await prisma.tenant.update({
      where: { id: tenant.id },
      data: {
        tokensUsed: 0,
        tokensAllocated: plan.tokensAllocated,
        currentPeriodStart: now,
        currentPeriodEnd: nextEndDate,
        billingStatus: 'active'
      }
    })

    await prisma.usageLog.create({
      data: {
        userId: userId,
        tenantId: tenant.id,
        action: 'tokens_refreshed',
        tokensConsumed: 0,
        metadata: {
          tokensAllocated: plan.tokensAllocated,
          previousUsage: tenant.tokensUsed
        }
      }
    })

    return true
  }

  return false
}

export async function getTokenUsage(userId: string) {
  try {
    // First get the user to find their tenant
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { tenant: true }
    })

    if (!user || !user.tenant) {
      return null
    }

    const tenant = user.tenant
    const plan = TOKEN_PLANS.find(p => p.id === tenant.subscriptionPlan)

    if (!plan) {
      throw new Error('Invalid plan')
    }
    
    return {
      tokensUsed: tenant.tokensUsed,
      tokensAllocated: tenant.tokensAllocated,
      tokensRemaining: tenant.tokensAllocated - tenant.tokensUsed,
      plan: plan,
      lastRefresh: tenant.currentPeriodEnd ? addDays(tenant.currentPeriodEnd, -plan.billingIntervalDays) : null,
      nextRefresh: tenant.currentPeriodEnd
    }
  } catch (error) {
    // When DB is unreachable during local dev, avoid crashing the app
    console.error('getTokenUsage error:', error)
    return {
      tokensUsed: 0,
      tokensAllocated: 0,
      tokensRemaining: 0,
      plan: undefined,
      lastRefresh: null as unknown as Date | null,
      nextRefresh: null as unknown as Date | null,
    }
  }
}

export async function upgradePlan(userId: string, newPlanId: string) {
  const newPlan = TOKEN_PLANS.find(p => p.id === newPlanId)
  if (!newPlan) {
    throw new Error(`Invalid plan: ${newPlanId}`)
  }

  // First get the user to find their tenant
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { tenant: true }
  })

  if (!user || !user.tenant) {
    throw new Error('Tenant not found')
  }

  const tenant = user.tenant
  const oldPlan = TOKEN_PLANS.find(p => p.id === tenant.subscriptionPlan)
  const newTokensAllocated = newPlan.tokensAllocated
  const now = new Date()
  const existingPeriodEnd = tenant.currentPeriodEnd
  const nextEndDate = existingPeriodEnd && existingPeriodEnd > now
    ? existingPeriodEnd
    : addDays(now, newPlan.billingIntervalDays)
  const nextPeriodStart = existingPeriodEnd && existingPeriodEnd > now
    ? tenant.currentPeriodStart ?? now
    : now

  const updatedTenant = await prisma.tenant.update({
    where: { id: tenant.id },
    data: {
      subscriptionPlan: newPlan.id,
      tokensAllocated: newTokensAllocated,
      tokensUsed: Math.min(tenant.tokensUsed, newTokensAllocated),
      currentPeriodStart: nextPeriodStart,
      currentPeriodEnd: nextEndDate,
      billingStatus: 'active'
    }
  })

  await prisma.usageLog.create({
    data: {
      userId: userId,
      tenantId: tenant.id,
      action: 'plan_upgraded',
      tokensConsumed: 0,
      metadata: {
        oldPlan: oldPlan?.id,
        newPlan: newPlan.id,
        newTokensAllocated,
        previousUsage: tenant.tokensUsed
      }
    }
  })

  return updatedTenant
}
