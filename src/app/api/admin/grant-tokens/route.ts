import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { initializeUserTokens } from '@/lib/tokens'

export async function POST(request: NextRequest) {
  try {
    const adminKey = request.headers.get('x-admin-key') || ''
    if (!process.env.ADMIN_SECRET || adminKey !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { email, amount } = await request.json()
    if (!email || typeof amount !== 'number') {
      return NextResponse.json({ error: 'email and amount required' }, { status: 400 })
    }

    // Lookup by email case-insensitively
    let user = await prisma.user.findFirst({ where: { email: { equals: email, mode: 'insensitive' } }, include: { tenant: true } })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    // If user exists but has no tenant yet, initialize one (makes them OWNER)
    if (!user.tenantId) {
      const tenant = await initializeUserTokens(user.id, 'starter')
      if (!tenant) {
        return NextResponse.json({ error: 'Failed to initialize tenant' }, { status: 500 })
      }
      user = await prisma.user.update({
        where: { id: user.id },
        data: { tenant: { connect: { id: tenant.id } }, role: 'OWNER' },
        include: { tenant: true },
      })
    }

    // Ensure user has a tenantId at this point
    if (!user.tenantId) {
      return NextResponse.json({ error: 'User has no tenant' }, { status: 500 })
    }

    const updated = await prisma.tenant.update({
      where: { id: user.tenantId },
      data: { tokensAllocated: { increment: amount } },
    })

    return NextResponse.json({ success: true, tenant: { id: updated.id, tokensAllocated: updated.tokensAllocated, tokensUsed: updated.tokensUsed } })
  } catch (e) {
    console.error('Grant tokens error:', e)
    return NextResponse.json({ error: 'Failed to grant tokens' }, { status: 500 })
  }
}


