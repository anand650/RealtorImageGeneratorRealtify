import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { ensureAppUser } from '@/lib/userSync'
import { createPaddleBillingPortalSession } from '@/lib/paddle'

export async function POST(_request: NextRequest) {
  try {
    // Billing provider disabled
    if ((process.env.BILLING_PROVIDER || process.env.NEXT_PUBLIC_BILLING_PROVIDER) === 'none') {
      return NextResponse.json(
        {
          error: 'Billing is currently unavailable',
          details: 'The billing provider is disabled for this environment.',
        },
        { status: 503 }
      )
    }
    const clerkUser = await currentUser()
    if (!clerkUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Ensure user exists in our database
    const ensured = await ensureAppUser(clerkUser)
    if (!ensured.user || !ensured.tenant) {
      return NextResponse.json({ error: 'Failed to initialize user account' }, { status: 500 })
    }

    // Check if user is owner (only owners can manage billing)
    if (ensured.user.role !== 'OWNER') {
      return NextResponse.json({ error: 'Only workspace owners can manage billing' }, { status: 403 })
    }

    if (!ensured.tenant.paddleCustomerId) {
      return NextResponse.json({ error: 'No Paddle customer found for tenant' }, { status: 400 })
    }

    const returnUrl = `${process.env.APP_URL || 'http://localhost:3000'}/billing`

    const session = await createPaddleBillingPortalSession(ensured.tenant.paddleCustomerId, returnUrl)

    return NextResponse.json({
      success: true,
      url: session.url,
    })
  } catch (error) {
    console.error('Billing portal error:', error)
    return NextResponse.json(
      { error: 'Failed to create billing portal session' },
      { status: 500 }
    )
  }
}


