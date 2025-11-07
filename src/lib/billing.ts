import { prisma } from './prisma'
import { ensurePaddleCustomer, createPaddleCheckoutSession, getPlanById } from './paddle'

interface CheckoutSessionInput {
  clerkUserId: string
  planId: string
}

export async function createCheckoutSessionForPlan({ clerkUserId, planId }: CheckoutSessionInput) {
  if ((process.env.BILLING_PROVIDER || process.env.NEXT_PUBLIC_BILLING_PROVIDER) === 'none') {
    throw new Error('Billing provider disabled')
  }
  const user = await prisma.user.findUnique({
    where: { clerkId: clerkUserId },
    include: { tenant: true },
  })

  if (!user || !user.tenant) {
    throw new Error('User or tenant not found')
  }

  const plan = getPlanById(planId)
  if (!plan) {
    throw new Error(`Invalid plan: ${planId}`)
  }

  const customer = await ensurePaddleCustomer(
    user.email,
    `${user.firstName || ''} ${user.lastName || ''}`.trim() || null,
    user.tenant.id,
    user.tenant.paddleCustomerId || undefined
  )

  if (!customer || !customer.id) {
    throw new Error('Failed to create or retrieve Paddle customer')
  }

  if (!user.tenant.paddleCustomerId) {
    await prisma.tenant.update({
      where: { id: user.tenant.id },
      data: {
        paddleCustomerId: customer.id,
      },
    })
  }

  const appUrl = process.env.APP_URL || 'http://localhost:3000'

  const session = await createPaddleCheckoutSession({
    customerId: customer.id,
    planId: plan.id,
    successUrl: `${appUrl}/billing?session_id={CHECKOUT_SESSION_ID}`,
    cancelUrl: `${appUrl}/billing?canceled=1`,
    metadata: {
      tenantId: user.tenant.id,
    },
  })

  if (!session.url) {
    throw new Error('Checkout session missing URL')
  }

  await prisma.tenant.update({
    where: { id: user.tenant.id },
    data: {
      subscriptionPlan: plan.id,
      billingStatus: 'pending',
    },
  })

  await prisma.usageLog.create({
    data: {
      userId: user.id,
      tenantId: user.tenant.id,
      action: 'subscription_checkout_created',
      tokensConsumed: 0,
      metadata: {
        planId: plan.id,
        checkoutSessionId: session.id,
      },
    },
  })

  return { session, plan, user, tenant: user.tenant }
}



