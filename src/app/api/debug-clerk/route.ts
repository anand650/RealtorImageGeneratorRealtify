import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const secret = process.env.CLERK_SECRET_KEY ?? ''
  const publishable = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? ''

  return NextResponse.json({
    hasSecret: Boolean(secret),
    secretPrefix: secret.slice(0, 6),
    secretLength: secret.length,
    hasPublishable: Boolean(publishable),
    publishablePrefix: publishable.slice(0, 6),
    publishableLength: publishable.length,
  })
}


