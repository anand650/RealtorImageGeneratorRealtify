/**
 * Script to fix ALL tenants with incorrect token allocations
 * Specifically fixes free tier tenants with 49 or 50 credits
 * Usage: node scripts/fix-all-wrong-credits.js
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function fixAllWrongCredits() {
  try {
    console.log('Finding all tenants with incorrect free tier allocations...\n')
    
    // Find all free tier tenants with incorrect allocations (not 4)
    const wrongTenants = await prisma.tenant.findMany({
      where: {
        subscriptionPlan: 'free',
        tokensAllocated: {
          not: 4
        }
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

    console.log(`Found ${wrongTenants.length} tenant(s) with incorrect allocations\n`)

    if (wrongTenants.length === 0) {
      console.log('✅ No tenants need fixing! All free tier tenants have 4 credits.')
      return
    }

    for (const tenant of wrongTenants) {
      const userEmails = tenant.users.map(u => u.email).join(', ') || 'No users'
      const oldAllocated = tenant.tokensAllocated
      const oldUsed = tenant.tokensUsed
      const newUsed = Math.min(tenant.tokensUsed, 4)
      const oldRemaining = oldAllocated - oldUsed
      const newRemaining = 4 - newUsed
      
      await prisma.tenant.update({
        where: { id: tenant.id },
        data: {
          tokensAllocated: 4,
          tokensUsed: newUsed,
        },
      })

      console.log(`✅ FIXED tenant ${tenant.id}:`)
      console.log(`   - User(s): ${userEmails}`)
      console.log(`   - Old: ${oldAllocated} allocated, ${oldUsed} used, ${oldRemaining} remaining`)
      console.log(`   - New: 4 allocated, ${newUsed} used, ${newRemaining} remaining`)
      console.log(`   - Change: ${oldRemaining} → ${newRemaining} remaining credits\n`)
    }

    console.log(`\n✅ Fixed ${wrongTenants.length} tenant(s)!`)
    console.log('All free tier tenants now have exactly 4 credits.\n')
    
  } catch (error) {
    console.error('❌ Error fixing tenants:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
fixAllWrongCredits()
  .then(() => {
    console.log('✅ Script completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Script failed:', error)
    process.exit(1)
  })

