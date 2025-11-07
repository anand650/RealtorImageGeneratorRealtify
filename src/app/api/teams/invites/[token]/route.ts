import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { ensureAppUser } from '@/lib/userSync'

export async function POST(request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;
    const user = await currentUser()
    if (!user) return NextResponse.json({ error: 'User not signed in' }, { status: 401 })

    const ensured = await ensureAppUser(user)
    const dbUser = ensured.user

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const invite = await prisma.teamInvite.findUnique({ where: { token } })
    if (!invite || invite.acceptedAt) return NextResponse.json({ error: 'Invalid or used invite' }, { status: 400 })
    if (invite.expiresAt < new Date()) return NextResponse.json({ error: 'Invite expired' }, { status: 400 })
    const invitedEmail = invite.email.toLowerCase()
    const userEmails = user.emailAddresses?.map((addr) => addr.emailAddress.toLowerCase()) ?? []

    if (!userEmails.includes(invitedEmail)) {
      return NextResponse.json({
        error: 'This invite is associated with a different email. Please sign in with the invited address to join the team.',
      }, { status: 403 })
    }
    // Prevent downgrading an existing owner by accepting their own invite with a lower role
    if (dbUser.tenantId === invite.tenantId && dbUser.role === 'OWNER' && invite.role !== 'OWNER') {
      return NextResponse.json({
        error: 'You are already an owner of this team. Assign another owner before changing your role.',
      }, { status: 400 })
    }

    // Attach user to tenant and set role (connect safely)
    const updated = await prisma.user.update({
      where: { id: dbUser.id },
      data: {
        tenant: { connect: { id: invite.tenantId } },
        role: invite.role,
      },
    })
    await prisma.teamInvite.update({ where: { id: invite.id }, data: { acceptedAt: new Date() } })
    return NextResponse.json({ success: true, user: { id: updated.id, tenantId: updated.tenantId, role: updated.role } })
  } catch (e) {
    console.error('Accept invite error:', e)
    return NextResponse.json({ error: 'Failed to accept invite' }, { status: 500 })
  }
}

