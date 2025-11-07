/**
 * Script to check and fix free tier tenants with incorrect token allocations
 * Usage: node scripts/check-free-tier-tokens.js
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkAndFixFreeTierTokens() {
  try {
    console.log('Checking all free tier tenants...')
    
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

    console.log(`Found ${freeTierTenants.length} free tier tenant(s)\n`)

    let fixedCount = 0
    let alreadyCorrectCount = 0

    for (const tenant of freeTierTenants) {
      const userEmails = tenant.users.map(u => u.email).join(', ') || 'No users'
      
      if (tenant.tokensAllocated !== 4) {
        const oldAllocated = tenant.tokensAllocated
        const oldUsed = tenant.tokensUsed
        const newUsed = Math.min(tenant.tokensUsed, 4)
        
        await prisma.tenant.update({
          where: { id: tenant.id },
          data: {
            tokensAllocated: 4,
            tokensUsed: newUsed,
          },
        })

        console.log(`✅ FIXED tenant ${tenant.id}:`)
        console.log(`   - User(s): ${userEmails}`)
        console.log(`   - Old allocation: ${oldAllocated} → New allocation: 4`)
        console.log(`   - Old used: ${oldUsed} → New used: ${newUsed}`)
        console.log(`   - Remaining: ${oldAllocated - oldUsed} → ${4 - newUsed}\n`)
        
        fixedCount++
      } else {
        console.log(`✓ OK tenant ${tenant.id}:`)
        console.log(`   - User(s): ${userEmails}`)
        console.log(`   - Allocation: ${tenant.tokensAllocated}, Used: ${tenant.tokensUsed}, Remaining: ${tenant.tokensAllocated - tenant.tokensUsed}\n`)
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
    console.error('❌ Error checking free tier tokens:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
checkAndFixFreeTierTokens()
  .then(() => {
    console.log('\n✅ Script completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error)
    process.exit(1)
  })

