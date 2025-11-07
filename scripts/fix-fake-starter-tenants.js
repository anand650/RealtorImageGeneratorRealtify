/**
 * Script to fix tenants marked as "starter" but without active subscriptions
 * These should be reverted to free tier with 4 credits
 * Usage: node scripts/fix-fake-starter-tenants.js
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function fixFakeStarterTenants() {
  try {
    console.log('Finding tenants with starter/pro/enterprise plan but no active subscription...\n')
    
    // Find tenants with paid plans
    const paidPlanTenants = await prisma.tenant.findMany({
      where: {
        subscriptionPlan: {
          in: ['starter', 'professional', 'enterprise']
        }
      },
      include: {
        users: {
          select: {
            id: true,
            email: true
          }
        },
        subscriptions: {
          where: {
            status: 'active'
          },
          select: {
            id: true,
            status: true,
            paddleSubscriptionId: true
          }
        }
      }
    })

    console.log(`Found ${paidPlanTenants.length} tenant(s) with paid plans\n`)

    let fixedCount = 0
    let validCount = 0

    for (const tenant of paidPlanTenants) {
      const userEmails = tenant.users.map(u => u.email).join(', ') || 'No users'
      const hasActiveSubscription = tenant.subscriptions.length > 0
      const hasPaddleSubscriptionId = !!tenant.paddleSubscriptionId
      const isActuallyActive = tenant.billingStatus === 'active' && tenant.isActive
      
      console.log(`Tenant ${tenant.id}:`)
      console.log(`   - User(s): ${userEmails}`)
      console.log(`   - Plan: ${tenant.subscriptionPlan}`)
      console.log(`   - Allocated: ${tenant.tokensAllocated}, Used: ${tenant.tokensUsed}`)
      console.log(`   - Has active subscription record: ${hasActiveSubscription}`)
      console.log(`   - Has Paddle subscription ID: ${hasPaddleSubscriptionId}`)
      console.log(`   - Billing status: ${tenant.billingStatus}, Is active: ${tenant.isActive}`)
      
      // If tenant has no active subscription and no Paddle subscription ID, it's fake
      if (!hasActiveSubscription && !hasPaddleSubscriptionId && !isActuallyActive) {
        console.log(`   → FAKE subscription detected! Reverting to free tier...`)
        
        const oldAllocated = tenant.tokensAllocated
        const oldUsed = tenant.tokensUsed
        const newUsed = Math.min(oldUsed, 4)
        
        await prisma.tenant.update({
          where: { id: tenant.id },
          data: {
            subscriptionPlan: 'free',
            tokensAllocated: 4,
            tokensUsed: newUsed,
            billingStatus: 'inactive',
            isActive: false,
            paddleCustomerId: null,
            paddleSubscriptionId: null,
            paddlePriceId: null,
          },
        })
        
        console.log(`   ✅ FIXED: Free tier, 4 allocated, ${newUsed} used, ${4 - newUsed} remaining\n`)
        fixedCount++
      } else {
        console.log(`   ✓ Valid subscription, keeping as is\n`)
        validCount++
      }
    }

    console.log('\n📊 Summary:')
    console.log(`   - Fixed (reverted to free): ${fixedCount} tenant(s)`)
    console.log(`   - Valid subscriptions: ${validCount} tenant(s)`)
    console.log(`   - Total: ${paidPlanTenants.length} tenant(s)`)
    
    if (fixedCount > 0) {
      console.log('\n✅ Fixed all fake subscriptions!')
    } else {
      console.log('\n✅ All tenants have valid subscriptions!')
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
fixFakeStarterTenants()
  .then(() => {
    console.log('\n✅ Script completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Script failed:', error)
    process.exit(1)
  })

