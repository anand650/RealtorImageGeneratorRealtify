import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { ensureAppUser } from '@/lib/userSync'

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const ensured = await ensureAppUser(user)

    let message = 'User already initialized'
    if (ensured.meta.userCreated) {
      message = 'User initialized successfully'
    } else if (ensured.meta.userLinkedByEmail) {
      message = 'Existing account linked to Clerk user'
    } else if (ensured.meta.tenantCreated) {
      message = 'User tenant initialized successfully'
    }

    return NextResponse.json({
      success: true,
      message,
      user: ensured.user,
      tenant: ensured.tenant,
    })
  } catch (error) {
    console.error('User initialization error:', error)
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('Invalid plan')) {
        return NextResponse.json(
          { error: 'Invalid subscription plan' },
          { status: 400 }
        )
      }
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to initialize user',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
