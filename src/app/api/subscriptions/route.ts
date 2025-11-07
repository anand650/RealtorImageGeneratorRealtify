import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { ensureAppUser } from '@/lib/userSync'
import { prisma } from '@/lib/prisma'
import { createCheckoutSessionForPlan } from '@/lib/billing'
import { z } from 'zod'

const createSubscriptionSchema = z.object({
  planName: z.enum(['starter', 'professional', 'enterprise']),
})

export async function GET(request: NextRequest) {
  try {
    const clerkUser = await currentUser()
    if (!clerkUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const ensured = await ensureAppUser(clerkUser)
    if (!ensured.user) {
      return NextResponse.json({ error: 'Failed to initialize user' }, { status: 500 })
    }

    const user = await prisma.user.findUnique({
      where: { id: ensured.user.id },
      include: {
        tenant: {
          include: {
            subscriptions: true,
          },
        },
      },
    })

    if (!user || !user.tenant) {
      return NextResponse.json({ error: 'User or tenant not found' }, { status: 404 })
    }

    return NextResponse.json({
      currentPlan: user.tenant.subscriptionPlan,
      tokensAllocated: user.tenant.tokensAllocated,
      tokensUsed: user.tenant.tokensUsed,
      tokensRemaining: user.tenant.tokensAllocated - user.tenant.tokensUsed,
      currentPeriodEnd: user.tenant.currentPeriodEnd,
      subscriptions: user.tenant.subscriptions,
    })
  } catch (error) {
    console.error('Get subscription error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subscription' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const clerkUser = await currentUser()
    if (!clerkUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const ensured = await ensureAppUser(clerkUser)
    if (!ensured.user || !ensured.tenant) {
      return NextResponse.json({ error: 'Failed to initialize user account' }, { status: 500 })
    }

    const body = await request.json()
    const { planName } = createSubscriptionSchema.parse(body)

    const { session, plan } = await createCheckoutSessionForPlan({
      clerkUserId: clerkUser.id,
      planId: planName,
    })

    return NextResponse.json({
      success: true,
      url: session.url,
      sessionId: session.id,
      plan,
    })
  } catch (error) {
    console.error('Create subscription error:', error)
    return NextResponse.json(
      { error: 'Failed to create subscription' },
      { status: 500 }
    )
  }
}



