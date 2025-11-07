import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'
import { sendInviteEmail } from '@/lib/mailer'

export async function GET() {
  try {
    const user = await currentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const dbUser = await prisma.user.findUnique({ where: { clerkId: user.id } })
    if (!dbUser || !dbUser.tenantId) return NextResponse.json({ error: 'No team' }, { status: 404 })

    const invites = await prisma.teamInvite.findMany({ where: { tenantId: dbUser.tenantId, acceptedAt: null } })
    const res = NextResponse.json({ success: true, invites })
    res.headers.set('Cache-Control', 'private, max-age=60, stale-while-revalidate=300')
    return res
  } catch (e) {
    console.error('List invites error:', e)
    return NextResponse.json({ error: 'Failed to list invites' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const dbUser = await prisma.user.findUnique({ where: { clerkId: user.id } })
    if (!dbUser || !dbUser.tenantId) return NextResponse.json({ error: 'No team' }, { status: 403 })
    if (dbUser.role !== 'OWNER') return NextResponse.json({ error: 'Only owner can invite' }, { status: 403 })

    const { email, role, sendEmail = true, message } = await request.json()
    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })
    const targetRole = ['OWNER','MEMBER','VIEWER'].includes(role) ? role : 'MEMBER'
    const token = crypto.randomBytes(24).toString('hex')
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24) // 24h

    const invite = await prisma.teamInvite.create({
      data: {
        tenantId: dbUser.tenantId,
        email,
        role: targetRole,
        token,
        expiresAt,
        createdById: dbUser.id,
      },
    })

    // App-facing link (not API) to accept invite
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || ''
    const link = `${baseUrl}/invite/${invite.token}`

    // Optionally send email
    let emailResult: { sent: boolean; reason?: string } | undefined
    if (sendEmail) {
      try {
        const inviterName = [dbUser.firstName, dbUser.lastName].filter(Boolean).join(' ')
        emailResult = await sendInviteEmail(email, link, inviterName, message)
      } catch (e) {
        emailResult = { sent: false, reason: 'SEND_FAILED' }
      }
    }

    return NextResponse.json({ success: true, invite, link, email: emailResult })
  } catch (e) {
    console.error('Create invite error:', e)
    return NextResponse.json({ error: 'Failed to create invite' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const dbUser = await prisma.user.findUnique({ where: { clerkId: user.id } })
    if (!dbUser || !dbUser.tenantId) return NextResponse.json({ error: 'No team' }, { status: 403 })
    if (dbUser.role !== 'OWNER') return NextResponse.json({ error: 'Only owner can revoke' }, { status: 403 })

    const { searchParams } = new URL(request.url)
    const inviteId = searchParams.get('inviteId')
    if (!inviteId) return NextResponse.json({ error: 'inviteId required' }, { status: 400 })

    await prisma.teamInvite.delete({ where: { id: inviteId } })
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('Revoke invite error:', e)
    return NextResponse.json({ error: 'Failed to revoke invite' }, { status: 500 })
  }
}

