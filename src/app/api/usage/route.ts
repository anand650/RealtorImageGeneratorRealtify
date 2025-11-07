import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { checkUserUsage, checkAnonymousUsage, getClientIp } from '@/lib/usage-tracking'
import { ensureAppUser } from '@/lib/userSync'

export async function GET(request: NextRequest) {
  try {
    // Check if authentication is disabled for development
    const isAuthDisabled = process.env.DISABLE_AUTH === 'true'
    
    if (!isAuthDisabled) {
      const clerkUser = await currentUser()
      
      if (clerkUser) {
        // Get database user ID (not Clerk ID)
        const ensured = await ensureAppUser(clerkUser)
        if (!ensured.user) {
          const errorResponse = NextResponse.json(
            { error: 'Failed to initialize user' },
            { status: 500 }
          )
          errorResponse.headers.set('Cache-Control', 'private, no-store, no-cache, must-revalidate')
          return errorResponse
        }
        
        // Authenticated user - use database user ID
        const usageResult = await checkUserUsage(ensured.user.id)
        
        const dataResponse = NextResponse.json({
          ...usageResult,
          userId: ensured.user.id,
          clerkUserId: clerkUser.id,
        }, {
          headers: {
            'Cache-Control': 'private, no-store, no-cache, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
          },
        })
        return dataResponse
      }
    }
    
    // Anonymous user
    const clientIp = await getClientIp()
    const usageResult = await checkAnonymousUsage(clientIp)
    
    const dataResponse = NextResponse.json({
      ...usageResult,
      ipAddress: clientIp
    }, {
      headers: {
        'Cache-Control': 'private, no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    })
    return dataResponse
  } catch (error) {
    console.error('Error checking usage:', error)
    return NextResponse.json(
      { error: 'Failed to check usage' },
      { status: 500 }
    )
  }
}
