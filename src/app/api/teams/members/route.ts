import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function GET(_: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const dbUser = await prisma.user.findUnique({ where: { clerkId: user.id } })
    if (!dbUser || !dbUser.tenantId) return NextResponse.json({ error: 'User not found or no team' }, { status: 404 })

    let members = await prisma.user.findMany({
      where: { tenantId: dbUser.tenantId },
      select: { id: true, email: true, firstName: true, lastName: true, role: true, createdAt: true },
      orderBy: [{ role: 'asc' }, { createdAt: 'asc' }]
    })

    let ownerCount = members.filter(member => member.role === 'OWNER').length
    let effectiveUser = dbUser

    // Ensure the current user is promoted to OWNER if no owners exist yet
    if (ownerCount === 0) {
      effectiveUser = await prisma.user.update({
        where: { id: dbUser.id },
        data: { role: 'OWNER' }
      })

      members = await prisma.user.findMany({
        where: { tenantId: dbUser.tenantId },
        select: { id: true, email: true, firstName: true, lastName: true, role: true, createdAt: true },
        orderBy: [{ role: 'asc' }, { createdAt: 'asc' }]
      })

      ownerCount = members.filter(member => member.role === 'OWNER').length
    }

    const res = NextResponse.json({
      success: true,
      members,
      currentUser: { id: effectiveUser.id, role: effectiveUser.role },
      ownerCount,
      canManage: effectiveUser.role === 'OWNER'
    })
    res.headers.set('Cache-Control', 'private, no-store')
    return res
  } catch (e) {
    console.error('List members error:', e)
    return NextResponse.json({ error: 'Failed to list members' }, { status: 500 })
  }
}

