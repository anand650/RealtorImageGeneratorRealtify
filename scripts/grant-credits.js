/**
 * Script to grant credits to a user by email
 * Usage: node scripts/grant-credits.js <email> <amount>
 * Example: node scripts/grant-credits.js anand@automyzai.com 50
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function grantCredits(email, amount) {
  try {
    console.log(`Looking up user with email: ${email}...`)
    
    // Find user by email (case-insensitive)
    const user = await prisma.user.findFirst({
      where: { 
        email: { 
          equals: email, 
          mode: 'insensitive' 
        } 
      },
      include: { tenant: true }
    })

    if (!user) {
      console.error(`❌ User with email "${email}" not found.`)
      console.log('Please make sure the user has signed up first.')
      process.exit(1)
    }

    console.log(`✅ Found user: ${user.email} (ID: ${user.id})`)

    // If user has no tenant, we need to create one first
    if (!user.tenantId) {
      console.log('User has no tenant. Creating free tier tenant...')
      
      const tenant = await prisma.tenant.create({
        data: {
          name: 'Personal Account',
          slug: `user-${user.id}`,
          tokensAllocated: 4, // Free tier default
          tokensUsed: 0,
          subscriptionPlan: 'free',
          billingStatus: 'inactive',
          users: {
            connect: { id: user.id }
          }
        }
      })

      await prisma.user.update({
        where: { id: user.id },
        data: { 
          tenantId: tenant.id,
          role: 'OWNER'
        }
      })

      console.log(`✅ Created tenant for user (ID: ${tenant.id})`)
    }

    // Get updated user with tenant
    const updatedUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { tenant: true }
    })

    if (!updatedUser || !updatedUser.tenant) {
      throw new Error('Failed to get tenant information')
    }

    const currentTokens = updatedUser.tenant.tokensAllocated
    const newTokens = currentTokens + amount

    console.log(`Current tokens allocated: ${currentTokens}`)
    console.log(`Adding ${amount} credits...`)

    // Grant the credits
    const updatedTenant = await prisma.tenant.update({
      where: { id: updatedUser.tenant.id },
      data: {
        tokensAllocated: { increment: amount }
      }
    })

    console.log(`✅ Successfully granted ${amount} credits!`)
    console.log(`New total tokens allocated: ${updatedTenant.tokensAllocated}`)
    console.log(`Tokens used: ${updatedTenant.tokensUsed}`)
    console.log(`Tokens remaining: ${updatedTenant.tokensAllocated - updatedTenant.tokensUsed}`)

    // Create usage log entry
    await prisma.usageLog.create({
      data: {
        userId: updatedUser.id,
        tenantId: updatedTenant.id,
        action: 'admin_credit_grant',
        tokensConsumed: 0,
        metadata: {
          creditsGranted: amount,
          previousAllocated: currentTokens,
          newAllocated: updatedTenant.tokensAllocated,
          grantedBy: 'admin_script'
        }
      }
    })

    console.log('✅ Usage log created')
    
    return updatedTenant
  } catch (error) {
    console.error('❌ Error granting credits:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Get command line arguments
const email = process.argv[2]
const amount = parseInt(process.argv[3])

if (!email || !amount || isNaN(amount)) {
  console.error('Usage: node scripts/grant-credits.js <email> <amount>')
  console.error('Example: node scripts/grant-credits.js anand@automyzai.com 50')
  process.exit(1)
}

// Run the script
grantCredits(email, amount)
  .then(() => {
    console.log('\n✅ Script completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error)
    process.exit(1)
  })

