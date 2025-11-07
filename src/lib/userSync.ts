'use server'

import type { User } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { initializeUserTokens } from '@/lib/tokens'

interface EnsuredUserResult {
  user: Awaited<ReturnType<typeof prisma.user.findUnique>>
  tenant: Awaited<ReturnType<typeof prisma.tenant.findUnique>> | null
  meta: {
    userCreated: boolean
    userLinkedByEmail: boolean
    tenantCreated: boolean
  }
}

export async function ensureAppUser(clerkUser: User | null): Promise<EnsuredUserResult> {
  if (!clerkUser) {
    throw new Error('Missing Clerk user')
  }

  const primaryEmail = clerkUser.emailAddresses?.[0]?.emailAddress?.toLowerCase().trim()
  if (!primaryEmail) {
    throw new Error('Clerk user does not have an email address')
  }

  let userCreated = false
  let userLinkedByEmail = false
  let tenantCreated = false

  let dbUser = await prisma.user.findUnique({
    where: { clerkId: clerkUser.id },
    include: { tenant: true },
  })

  if (!dbUser) {
    const emailMatch = await prisma.user.findUnique({
      where: { email: primaryEmail },
      include: { tenant: true },
    })

    if (emailMatch) {
      dbUser = await prisma.user.update({
        where: { id: emailMatch.id },
        data: {
          clerkId: clerkUser.id,
          firstName: clerkUser.firstName || emailMatch.firstName || '',
          lastName: clerkUser.lastName || emailMatch.lastName || '',
          profileImageUrl: clerkUser.imageUrl || emailMatch.profileImageUrl || '',
          lastLoginAt: new Date(),
        },
        include: { tenant: true },
      })
      userLinkedByEmail = true
    }
  }

  if (!dbUser) {
    dbUser = await prisma.user.create({
      data: {
        clerkId: clerkUser.id,
        email: primaryEmail,
        firstName: clerkUser.firstName || '',
        lastName: clerkUser.lastName || '',
        profileImageUrl: clerkUser.imageUrl || '',
        lastLoginAt: new Date(),
        freeImagesLimit: 4,
        freeImagesUsed: 0,
      },
      include: { tenant: true },
    })
    userCreated = true
  }

  let tenant = dbUser.tenant

  if (!tenant) {
    // Create free tier tenant with 4 free credits for new users
    tenant = await initializeUserTokens(dbUser.id, 'free') // Create free tier tenant with 4 tokens
    if (!tenant) {
      throw new Error('Failed to initialize tenant')
    }
    dbUser = await prisma.user.update({
      where: { id: dbUser.id },
      data: {
        role: 'OWNER',
        tenant: { connect: { id: tenant.id } },
        freeImagesLimit: { set: 4 }, // Keep for backwards compatibility
        freeImagesUsed: { set: 0 },
      },
      include: { tenant: true },
    })
    tenantCreated = true
    tenant = dbUser.tenant // Reload tenant after update
  } else if (dbUser.role !== 'OWNER') {
    dbUser = await prisma.user.update({
      where: { id: dbUser.id },
      data: {
        role: 'OWNER',
      },
      include: { tenant: true },
    })
    tenant = dbUser.tenant
    
    // Ensure free tier users have exactly 4 credits (fix any incorrect allocations)
    if (tenant && tenant.subscriptionPlan === 'free' && tenant.tokensAllocated !== 4) {
      await prisma.tenant.update({
        where: { id: tenant.id },
        data: {
          tokensAllocated: 4,
          tokensUsed: Math.min(tenant.tokensUsed, 4), // Cap used tokens at allocated
        },
      })
      // Reload tenant
      tenant = await prisma.tenant.findUnique({ where: { id: tenant.id } })
    }
  } else if (tenant && tenant.subscriptionPlan === 'free' && tenant.tokensAllocated !== 4) {
    // Ensure existing free tier users have exactly 4 credits
    await prisma.tenant.update({
      where: { id: tenant.id },
      data: {
        tokensAllocated: 4,
        tokensUsed: Math.min(tenant.tokensUsed, 4), // Cap used tokens at allocated
      },
    })
    // Reload tenant
    tenant = await prisma.tenant.findUnique({ where: { id: tenant.id } })
  }

  // Final safety check: ensure ALL free tier tenants have exactly 4 credits
  if (tenant && tenant.subscriptionPlan === 'free' && tenant.tokensAllocated !== 4) {
    console.warn(`[userSync] Fixing tenant ${tenant.id} with incorrect allocation: ${tenant.tokensAllocated} -> 4`)
    await prisma.tenant.update({
      where: { id: tenant.id },
      data: {
        tokensAllocated: 4,
        tokensUsed: Math.min(tenant.tokensUsed, 4),
      },
    })
    tenant = await prisma.tenant.findUnique({ where: { id: tenant.id } })
  }

  // Safety check: Fix tenants with paid plans but no active subscriptions (revert to free tier)
  if (tenant && ['starter', 'professional', 'enterprise'].includes(tenant.subscriptionPlan)) {
    const hasActiveSubscription = await prisma.subscription.findFirst({
      where: {
        tenantId: tenant.id,
        status: 'active'
      }
    })
    
    if (!hasActiveSubscription && !tenant.paddleSubscriptionId && tenant.billingStatus !== 'active') {
      console.warn(`[userSync] Fixing tenant ${tenant.id}: Has ${tenant.subscriptionPlan} plan but no active subscription. Reverting to free tier.`)
      await prisma.tenant.update({
        where: { id: tenant.id },
        data: {
          subscriptionPlan: 'free',
          tokensAllocated: 4,
          tokensUsed: Math.min(tenant.tokensUsed, 4),
          billingStatus: 'inactive',
          isActive: false,
        },
      })
      tenant = await prisma.tenant.findUnique({ where: { id: tenant.id } })
    }
  }

  return {
    user: dbUser,
    tenant,
    meta: {
      userCreated,
      userLinkedByEmail,
      tenantCreated,
    },
  }
}

