import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getPlanByPriceId } from '@/lib/paddle'
import crypto from 'crypto'

// Verify Paddle webhook signature
// Paddle sends signature in format: ts=timestamp;h1=signature
function verifyPaddleSignature(body: string, signatureHeader: string, secret: string): boolean {
  try {
    // Parse signature header: ts=timestamp;h1=signature
    const parts: Record<string, string> = {}
    signatureHeader.split(';').forEach(part => {
      const [key, value] = part.split('=')
      if (key && value) {
        parts[key] = value
      }
    })

    const timestamp = parts.ts
    const signature = parts.h1

    if (!timestamp || !signature) {
      return false
    }

    // Create signed payload: timestamp.body
    const signedPayload = `${timestamp}.${body}`

    // Calculate HMAC
    const hmac = crypto.createHmac('sha256', secret)
    hmac.update(signedPayload)
    const calculatedSignature = hmac.digest('hex')

    // Compare signatures using timing-safe comparison
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(calculatedSignature)
    )
  } catch (error) {
    console.error('Signature verification error:', error)
    return false
  }
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signatureHeader = request.headers.get('paddle-signature') || ''

  // Verify webhook signature
  const webhookSecret = process.env.PADDLE_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error('PADDLE_WEBHOOK_SECRET is not set')
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
  }

  // Verify Paddle signature
  const isValid = verifyPaddleSignature(body, signatureHeader, webhookSecret)
  
  if (!isValid) {
    console.error('Paddle webhook signature verification failed')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  let event: any
  try {
    event = JSON.parse(body)
  } catch (error) {
    console.error('Failed to parse webhook body:', error)
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  try {
    switch (event.event_type) {
      case 'transaction.completed':
        await handleTransactionCompleted(event.data)
        break

      case 'subscription.created':
        await handleSubscriptionCreated(event.data)
        break

      case 'subscription.updated':
        await handleSubscriptionUpdated(event.data)
        break

      case 'subscription.canceled':
        await handleSubscriptionCanceled(event.data)
        break

      case 'subscription.past_due':
        await handleSubscriptionPastDue(event.data)
        break

      case 'invoice.paid':
        await handleInvoicePaid(event.data)
        break

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data)
        break

      default:
        console.log(`Unhandled event type: ${event.event_type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

async function handleTransactionCompleted(data: any) {
  // Transaction completed typically means a subscription was created or renewed
  const customerId = data.customer_id
  const subscriptionId = data.subscription_id
  const priceId = data.items?.[0]?.price?.id

  if (!priceId || !customerId) {
    console.error('Transaction missing required data:', { customerId, priceId })
    return
  }

  const plan = getPlanByPriceId(priceId)
  const tenant = await prisma.tenant.findFirst({
    where: { paddleCustomerId: customerId },
  })

  if (!tenant) {
    console.error('Tenant not found for customer:', customerId)
    return
  }

  const tokensAllocated = plan?.tokensAllocated ?? tenant.tokensAllocated
  const periodStart = data.billing_period?.starts_at ? new Date(data.billing_period.starts_at) : new Date()
  const periodEnd = data.billing_period?.ends_at ? new Date(data.billing_period.ends_at) : new Date()

  if (subscriptionId) {
    await prisma.subscription.upsert({
      where: { paddleSubscriptionId: subscriptionId },
      update: {
        status: 'active',
        currentPeriodStart: periodStart,
        currentPeriodEnd: periodEnd,
        paddlePriceId: priceId,
        planName: plan?.name || tenant.subscriptionPlan,
        price: plan?.price ?? data.total ?? 0,
        tokensIncluded: tokensAllocated,
      },
      create: {
        tenantId: tenant.id,
        paddleCustomerId: customerId,
        paddleSubscriptionId: subscriptionId,
        paddlePriceId: priceId,
        planName: plan?.name || tenant.subscriptionPlan,
        price: plan?.price ?? data.total ?? 0,
        tokensIncluded: tokensAllocated,
        status: 'active',
        currentPeriodStart: periodStart,
        currentPeriodEnd: periodEnd,
      },
    })

    await prisma.tenant.update({
      where: { id: tenant.id },
      data: {
        subscriptionPlan: plan?.id || tenant.subscriptionPlan,
        tokensAllocated,
        tokensUsed: 0,
        billingStatus: 'active',
        paddleSubscriptionId: subscriptionId,
        paddlePriceId: priceId,
        currentPeriodStart: periodStart,
        currentPeriodEnd: periodEnd,
        isActive: true,
      },
    })
  }
}

async function handleSubscriptionCreated(data: any) {
  const customerId = data.customer_id
  const subscriptionId = data.id
  const priceId = data.items?.[0]?.price?.id

  if (!priceId || !customerId) {
    console.error('Subscription missing required data:', { customerId, priceId })
    return
  }

  const plan = getPlanByPriceId(priceId)
  const tenant = await prisma.tenant.findFirst({
    where: { paddleCustomerId: customerId },
  })

  if (!tenant) {
    console.error('Tenant not found for customer:', customerId)
    return
  }

  const tokensAllocated = plan?.tokensAllocated ?? tenant.tokensAllocated
  const periodStart = data.current_billing_period?.starts_at ? new Date(data.current_billing_period.starts_at) : new Date()
  const periodEnd = data.current_billing_period?.ends_at ? new Date(data.current_billing_period.ends_at) : new Date()

  await prisma.subscription.upsert({
    where: { paddleSubscriptionId: subscriptionId },
    update: {
      status: data.status || 'active',
      currentPeriodStart: periodStart,
      currentPeriodEnd: periodEnd,
      paddlePriceId: priceId,
      planName: plan?.name || tenant.subscriptionPlan,
      price: plan?.price ?? 0,
      tokensIncluded: tokensAllocated,
    },
    create: {
      tenantId: tenant.id,
      paddleCustomerId: customerId,
      paddleSubscriptionId: subscriptionId,
      paddlePriceId: priceId,
      planName: plan?.name || tenant.subscriptionPlan,
      price: plan?.price ?? 0,
      tokensIncluded: tokensAllocated,
      status: data.status || 'active',
      currentPeriodStart: periodStart,
      currentPeriodEnd: periodEnd,
    },
  })

  await prisma.tenant.update({
    where: { id: tenant.id },
    data: {
      subscriptionPlan: plan?.id || tenant.subscriptionPlan,
      tokensAllocated,
      tokensUsed: 0,
      billingStatus: data.status || 'active',
      paddleSubscriptionId: subscriptionId,
      paddlePriceId: priceId,
      currentPeriodStart: periodStart,
      currentPeriodEnd: periodEnd,
      isActive: data.status === 'active' || data.status === 'trialing',
    },
  })
}

async function handleSubscriptionUpdated(data: any) {
  const customerId = data.customer_id
  const subscriptionId = data.id

  const tenant = await prisma.tenant.findFirst({
    where: { paddleCustomerId: customerId },
  })

  if (!tenant) {
    console.error('Tenant not found for customer:', customerId)
    return
  }

  const priceId = data.items?.[0]?.price?.id
  const plan = priceId ? getPlanByPriceId(priceId) : undefined
  const periodStart = data.current_billing_period?.starts_at ? new Date(data.current_billing_period.starts_at) : tenant.currentPeriodStart
  const periodEnd = data.current_billing_period?.ends_at ? new Date(data.current_billing_period.ends_at) : tenant.currentPeriodEnd
  const tokensAllocated = plan?.tokensAllocated ?? tenant.tokensAllocated

  await prisma.subscription.updateMany({
    where: { paddleSubscriptionId: subscriptionId },
    data: {
      status: data.status || 'active',
      currentPeriodStart: periodStart,
      currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd: data.cancel_at_period_end || false,
      paddlePriceId: priceId,
      planName: plan?.name || tenant.subscriptionPlan,
      price: plan?.price ?? 0,
      tokensIncluded: tokensAllocated,
    },
  })

  await prisma.tenant.update({
    where: { id: tenant.id },
    data: {
      subscriptionPlan: plan?.id || tenant.subscriptionPlan,
      tokensAllocated,
      tokensUsed: Math.min(tenant.tokensUsed, tokensAllocated),
      billingStatus: data.status || 'active',
      paddleSubscriptionId: subscriptionId,
      paddlePriceId: priceId,
      currentPeriodStart: periodStart,
      currentPeriodEnd: periodEnd,
      isActive: data.status === 'active' || data.status === 'trialing',
    },
  })
}

async function handleSubscriptionCanceled(data: any) {
  const customerId = data.customer_id
  const subscriptionId = data.id

  const tenant = await prisma.tenant.findFirst({
    where: { paddleCustomerId: customerId },
  })

  if (!tenant) {
    console.error('Tenant not found for customer:', customerId)
    return
  }

  await prisma.subscription.updateMany({
    where: { paddleSubscriptionId: subscriptionId },
    data: {
      status: 'canceled',
    },
  })

  await prisma.tenant.update({
    where: { id: tenant.id },
    data: {
      isActive: false,
      billingStatus: 'canceled',
      paddleSubscriptionId: null,
      paddlePriceId: null,
    },
  })
}

async function handleSubscriptionPastDue(data: any) {
  const customerId = data.customer_id

  const tenant = await prisma.tenant.findFirst({
    where: { paddleCustomerId: customerId },
  })

  if (!tenant) {
    console.error('Tenant not found for customer:', customerId)
    return
  }

  await prisma.tenant.update({
    where: { id: tenant.id },
    data: {
      billingStatus: 'past_due',
    },
  })
}

async function handleInvoicePaid(data: any) {
  const customerId = data.customer_id

  const tenant = await prisma.tenant.findFirst({
    where: { paddleCustomerId: customerId },
  })

  if (!tenant) {
    console.error('Tenant not found for customer:', customerId)
    return
  }

  const priceId = data.items?.[0]?.price?.id
  const plan = priceId ? getPlanByPriceId(priceId) : undefined
  const periodStart = data.billing_period?.starts_at ? new Date(data.billing_period.starts_at) : tenant.currentPeriodStart || new Date()
  const periodEnd = data.billing_period?.ends_at ? new Date(data.billing_period.ends_at) : tenant.currentPeriodEnd || new Date()
  const tokensAllocated = plan?.tokensAllocated ?? tenant.tokensAllocated

  // Create invoice record
  await prisma.invoice.create({
    data: {
      tenantId: tenant.id,
      paddleInvoiceId: data.id,
      amount: data.total || 0,
      status: 'paid',
      paidDate: new Date(),
      invoiceUrl: data.invoice_url,
    },
  })

  // Reset token usage for new billing period
  await prisma.tenant.update({
    where: { id: tenant.id },
    data: {
      tokensUsed: 0,
      tokensAllocated,
      subscriptionPlan: plan?.id || tenant.subscriptionPlan,
      billingStatus: 'active',
      currentPeriodStart: periodStart,
      currentPeriodEnd: periodEnd,
    },
  })
}

async function handleInvoicePaymentFailed(data: any) {
  const customerId = data.customer_id

  const tenant = await prisma.tenant.findFirst({
    where: { paddleCustomerId: customerId },
  })

  if (!tenant) {
    console.error('Tenant not found for customer:', customerId)
    return
  }

  // Create invoice record
  await prisma.invoice.create({
    data: {
      tenantId: tenant.id,
      paddleInvoiceId: data.id,
      amount: data.total || 0,
      status: 'open',
      dueDate: data.due_date ? new Date(data.due_date) : null,
    },
  })

  await prisma.tenant.update({
    where: { id: tenant.id },
    data: {
      billingStatus: 'past_due',
    },
  })

  // Send notification to user about payment failure
  const users = await prisma.user.findMany({
    where: { tenantId: tenant.id },
  })

  for (const user of users) {
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: 'warning',
        title: 'Payment Failed',
        message: 'Your payment could not be processed. Please update your payment method.',
        actionUrl: '/billing',
      },
    })
  }
}

