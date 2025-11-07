import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { z } from 'zod'
import { ensureAppUser } from '@/lib/userSync'
import { createCheckoutSessionForPlan } from '@/lib/billing'

const checkoutSchema = z.object({
  planId: z.enum(['starter', 'professional', 'enterprise']),
})

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { planId } = checkoutSchema.parse(body)

    const { session, plan } = await createCheckoutSessionForPlan({
      clerkUserId: clerkUser.id,
      planId,
    })

    return NextResponse.json({
      success: true,
      url: session.url,
      sessionId: session.id,
      plan,
    })
  } catch (error) {
    console.error('Checkout creation error:', error)
    
    // Provide more specific error messages
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid plan ID', details: error.issues },
        { status: 400 }
      )
    }
    
    if (error instanceof Error) {
      // Check for Paddle configuration errors
      if (error.message.includes('Missing Paddle price ID')) {
        return NextResponse.json(
          { 
            error: 'Paddle configuration error',
            details: error.message,
            hint: 'Make sure PADDLE_PRICE_ID_STARTER, PADDLE_PRICE_ID_PRO, and PADDLE_PRICE_ID_ENTERPRISE are set in your environment variables.'
          },
          { status: 500 }
        )
      }
      
      if (error.message.includes('User or tenant not found')) {
        return NextResponse.json(
          { error: 'Account not initialized. Please refresh the page and try again.' },
          { status: 404 }
        )
      }
      
      return NextResponse.json(
        { 
          error: 'Failed to create checkout session',
          details: error.message
        },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create checkout session', details: 'Unknown error' },
      { status: 500 }
    )
  }
}


