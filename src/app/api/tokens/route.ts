import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { getTokenUsage, refreshMonthlyTokens, upgradePlan, TOKEN_PLANS } from '@/lib/tokens'
import { z } from 'zod'

const upgradeSchema = z.object({
  planId: z.string()
})

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Refresh tokens if needed
    await refreshMonthlyTokens(user.id)

    const usage = await getTokenUsage(user.id)
    if (!usage) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      usage,
      plans: TOKEN_PLANS
    })
  } catch (error) {
    console.error('Token usage error:', error)
    return NextResponse.json(
      { error: 'Failed to get token usage' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { planId } = upgradeSchema.parse(body)

    const updatedTenant = await upgradePlan(user.id, planId)

    return NextResponse.json({
      success: true,
      message: 'Plan upgraded successfully',
      tenant: updatedTenant
    })
  } catch (error) {
    console.error('Plan upgrade error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upgrade plan' },
      { status: 500 }
    )
  }
}
