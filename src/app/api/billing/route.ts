import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { getPaddleInvoices, getPaddleCustomer } from '@/lib/paddle'
import { ensureAppUser } from '@/lib/userSync'

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
            invoices: {
              orderBy: { createdAt: 'desc' },
              take: 10,
            },
          },
        },
      },
    })

    if (!user || !user.tenant) {
      return NextResponse.json({ error: 'User or tenant not found' }, { status: 404 })
    }

    // Get Paddle customer and payment methods
    let paymentMethods: any[] = []
    let customer = null

    if (user.tenant.paddleCustomerId) {
      try {
        customer = await getPaddleCustomer(user.tenant.paddleCustomerId)
        // Paddle doesn't expose payment methods directly like Stripe
        // Payment methods are managed through Paddle's hosted checkout
        // We can return empty array or fetch from transactions if needed
        paymentMethods = []
      } catch (error) {
        console.error('Error fetching Paddle data:', error)
      }
    }

    // Calculate monthly usage
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const monthlyUsage = await prisma.usageLog.aggregate({
      where: {
        userId: user.id,
        createdAt: { gte: startOfMonth },
        action: 'image_processing_started',
      },
      _sum: { tokensConsumed: true },
    })

    const response = NextResponse.json({
      currentPlan: {
        name: user.tenant.subscriptionPlan,
        tokensAllocated: user.tenant.tokensAllocated,
        tokensUsed: user.tenant.tokensUsed,
        tokensRemaining: user.tenant.tokensAllocated - user.tenant.tokensUsed,
        currentPeriodEnd: user.tenant.currentPeriodEnd,
        currentPeriodStart: user.tenant.currentPeriodStart,
        isActive: user.tenant.isActive,
        billingStatus: user.tenant.billingStatus,
      },
      monthlyUsage: monthlyUsage._sum.tokensConsumed || 0,
      invoices: user.tenant.invoices,
      paymentMethods: paymentMethods.map(method => ({
        id: method.id,
        brand: method.card?.brand,
        last4: method.card?.last4,
        expMonth: method.card?.exp_month,
        expYear: method.card?.exp_year,
        isDefault: false, // Paddle manages payment methods differently
      })),
      subscriptions: user.tenant.subscriptions,
      role: user.role,
      canManageBilling: user.role === 'OWNER',
    })
    
    // Disable caching to ensure fresh data
    response.headers.set('Cache-Control', 'private, no-store, no-cache, must-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    
    return response
  } catch (error) {
    console.error('Billing error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch billing information' },
      { status: 500 }
    )
  }
}



