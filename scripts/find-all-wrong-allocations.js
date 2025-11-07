/**
 * Script to find ALL tenants with 49 or 50 credits (likely wrong allocations)
 * Usage: node scripts/find-all-wrong-allocations.js
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function findAllWrongAllocations() {
  try {
    console.log('Finding ALL tenants with 49 or 50 credits...\n')
    
    // Find all tenants with 49 or 50 credits
    const wrongTenants = await prisma.tenant.findMany({
      where: {
        OR: [
          { tokensAllocated: 49 },
          { tokensAllocated: 50 }
        ]
      },
      include: {
        users: {
          select: {
            id: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log(`Found ${wrongTenants.length} tenant(s) with 49 or 50 credits\n`)

    if (wrongTenants.length === 0) {
      console.log('✅ No tenants found with 49 or 50 credits!')
      return
    }

    for (const tenant of wrongTenants) {
      const userEmails = tenant.users.map(u => u.email).join(', ') || 'No users'
      const remaining = tenant.tokensAllocated - tenant.tokensUsed
      
      console.log(`⚠️  Tenant ${tenant.id}:`)
      console.log(`   - User(s): ${userEmails}`)
      console.log(`   - Plan: ${tenant.subscriptionPlan}`)
      console.log(`   - Allocated: ${tenant.tokensAllocated}`)
      console.log(`   - Used: ${tenant.tokensUsed}`)
      console.log(`   - Remaining: ${remaining}`)
      console.log(`   - Created: ${tenant.createdAt}`)
      
      if (tenant.subscriptionPlan === 'free') {
        console.log(`   → Should be fixed to 4 credits\n`)
        
        // Fix it
        const newUsed = Math.min(tenant.tokensUsed, 4)
        await prisma.tenant.update({
          where: { id: tenant.id },
          data: {
            tokensAllocated: 4,
            tokensUsed: newUsed,
          },
        })
        console.log(`   ✅ FIXED: 4 allocated, ${newUsed} used, ${4 - newUsed} remaining\n`)
      } else {
        console.log(`   → Has subscription plan: ${tenant.subscriptionPlan}\n`)
      }
    }

    console.log(`\n✅ Script completed!`)
    
  } catch (error) {
    console.error('❌ Error:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
findAllWrongAllocations()
  .then(() => {
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Script failed:', error)
    process.exit(1)
  })

