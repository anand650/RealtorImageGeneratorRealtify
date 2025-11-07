import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const user = await currentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const dbUser = await prisma.user.findUnique({ where: { clerkId: user.id } })
    if (!dbUser || !dbUser.tenantId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    if (dbUser.role !== 'OWNER') return NextResponse.json({ error: 'Only owner can change roles' }, { status: 403 })

    const { role } = await request.json()
    if (!['OWNER', 'MEMBER', 'VIEWER'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    const target = await prisma.user.findFirst({ where: { id, tenantId: dbUser.tenantId } })
    if (!target) return NextResponse.json({ error: 'User not in team' }, { status: 404 })

    const updated = await prisma.user.update({ where: { id: target.id }, data: { role } })
    return NextResponse.json({ success: true, user: { id: updated.id, role: updated.role } })
  } catch (e) {
    console.error('Update role error:', e)
    return NextResponse.json({ error: 'Failed to update role' }, { status: 500 })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const user = await currentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const dbUser = await prisma.user.findUnique({ where: { clerkId: user.id } })
    if (!dbUser || !dbUser.tenantId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    if (dbUser.role !== 'OWNER') return NextResponse.json({ error: 'Only owner can remove members' }, { status: 403 })

    const target = await prisma.user.findFirst({ where: { id, tenantId: dbUser.tenantId } })
    if (!target) return NextResponse.json({ error: 'User not in team' }, { status: 404 })

    await prisma.user.update({ where: { id: target.id }, data: { tenantId: null, role: 'VIEWER' } })
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('Remove member error:', e)
    return NextResponse.json({ error: 'Failed to remove member' }, { status: 500 })
  }
}




