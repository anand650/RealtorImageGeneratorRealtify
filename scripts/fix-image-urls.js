const { PrismaClient } = require('@prisma/client')
require('dotenv').config({ path: '.env.local' })

const prisma = new PrismaClient()

async function fixImageUrls() {
  try {
    console.log('🔍 Checking for images with incorrect URL format...')
    
    // Find images where originalUrl contains 'https://' (should be S3 keys only)
    const imagesWithFullUrls = await prisma.image.findMany({
      where: {
        originalUrl: {
          contains: 'https://'
        }
      }
    })

    console.log(`Found ${imagesWithFullUrls.length} images with full URLs instead of S3 keys`)

    if (imagesWithFullUrls.length === 0) {
      console.log('✅ All images have correct S3 key format')
      return
    }

    // Fix each image
    for (const image of imagesWithFullUrls) {
      console.log(`Fixing image ${image.id}...`)
      console.log(`Current originalUrl: ${image.originalUrl}`)
      
      // Extract S3 key from the URL
      // URL format: https://bucket.s3.region.amazonaws.com/key
      const urlParts = image.originalUrl.split('.amazonaws.com/')
      if (urlParts.length > 1) {
        const key = urlParts[1].split('?')[0] // Remove query parameters
        console.log(`Extracted key: ${key}`)
        
        await prisma.image.update({
          where: { id: image.id },
          data: {
            originalUrl: key
          }
        })
        
        console.log(`✅ Updated image ${image.id}`)
      } else {
        console.log(`❌ Could not extract key from URL: ${image.originalUrl}`)
      }
    }

    console.log('🎉 Image URL cleanup completed!')
    
  } catch (error) {
    console.error('❌ Error fixing image URLs:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixImageUrls()
