/**
 * Script to fix free tier tenants that have incorrect token allocations
 * Usage: node scripts/fix-free-tier-tokens.js
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function fixFreeTierTokens() {
  try {
    console.log('Finding free tier tenants with incorrect token allocations...')
    
    // Find all free tier tenants
    const freeTierTenants = await prisma.tenant.findMany({
      where: {
        subscriptionPlan: 'free'
      },
      include: {
        users: {
          select: {
            id: true,
            email: true
          }
        }
      }
    })

    console.log(`Found ${freeTierTenants.length} free tier tenant(s)`)

    let fixedCount = 0
    let alreadyCorrectCount = 0

    for (const tenant of freeTierTenants) {
      if (tenant.tokensAllocated !== 4) {
        const oldAllocated = tenant.tokensAllocated
        const oldUsed = tenant.tokensUsed
        
        await prisma.tenant.update({
          where: { id: tenant.id },
          data: {
            tokensAllocated: 4,
            tokensUsed: Math.min(tenant.tokensUsed, 4), // Cap used tokens at 4
          },
        })

        console.log(`✅ Fixed tenant ${tenant.id}:`)
        console.log(`   - User(s): ${tenant.users.map(u => u.email).join(', ') || 'No users'}`)
        console.log(`   - Old allocation: ${oldAllocated}, New allocation: 4`)
        console.log(`   - Old used: ${oldUsed}, New used: ${Math.min(oldUsed, 4)}`)
        
        fixedCount++
      } else {
        alreadyCorrectCount++
      }
    }

    console.log('\n📊 Summary:')
    console.log(`   - Fixed: ${fixedCount} tenant(s)`)
    console.log(`   - Already correct: ${alreadyCorrectCount} tenant(s)`)
    console.log(`   - Total: ${freeTierTenants.length} tenant(s)`)
    
    if (fixedCount > 0) {
      console.log('\n✅ All free tier tenants now have 4 credits allocated!')
    } else {
      console.log('\n✅ All free tier tenants already have correct allocations!')
    }
    
  } catch (error) {
    console.error('❌ Error fixing free tier tokens:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
fixFreeTierTokens()
  .then(() => {
    console.log('\n✅ Script completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error)
    process.exit(1)
  })

