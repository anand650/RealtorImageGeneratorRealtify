const { PrismaClient } = require('@prisma/client')
const { S3Client, HeadObjectCommand } = require('@aws-sdk/client-s3')
require('dotenv').config({ path: '.env.local' })

const prisma = new PrismaClient()
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'eu-north-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
})

const BUCKET_NAME = process.env.AWS_S3_BUCKET || 'realtor-image-generator'

async function checkImageExists(key) {
  try {
    const headCommand = new HeadObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    })
    await s3Client.send(headCommand)
    return true
  } catch (error) {
    return false
  }
}

async function cleanupMissingImages() {
  try {
    console.log('🔍 Checking for images in database that don\'t exist in S3...')
    
    // Get all images from database
    const images = await prisma.image.findMany({
      select: {
        id: true,
        originalUrl: true,
        status: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log(`Found ${images.length} images in database`)

    const missingImages = []
    const existingImages = []

    // Check each image
    for (const image of images) {
      console.log(`Checking ${image.id}...`)
      const exists = await checkImageExists(image.originalUrl)
      
      if (exists) {
        console.log(`  ✅ Exists in S3`)
        existingImages.push(image)
      } else {
        console.log(`  ❌ Missing from S3`)
        missingImages.push(image)
      }
    }

    console.log(`\n📊 Summary:`)
    console.log(`  ✅ Existing images: ${existingImages.length}`)
    console.log(`  ❌ Missing images: ${missingImages.length}`)

    if (missingImages.length > 0) {
      console.log(`\n🗑️ Missing images to clean up:`)
      missingImages.forEach(img => {
        console.log(`  - ${img.id} (${img.originalUrl}) - ${img.createdAt}`)
      })

      console.log(`\n⚠️  Would you like to delete these missing images from the database?`)
      console.log(`   Run with --delete flag to actually delete them`)
      
      // If --delete flag is passed, delete them
      if (process.argv.includes('--delete')) {
        console.log(`\n🗑️ Deleting missing images from database...`)
        
        const deleteResult = await prisma.image.deleteMany({
          where: {
            id: {
              in: missingImages.map(img => img.id)
            }
          }
        })
        
        console.log(`✅ Deleted ${deleteResult.count} missing images from database`)
      }
    } else {
      console.log(`\n✅ All database images exist in S3!`)
    }

    if (existingImages.length > 0) {
      console.log(`\n📋 Recent existing images:`)
      existingImages.slice(0, 5).forEach(img => {
        console.log(`  - ${img.id} (${img.status}) - ${img.createdAt}`)
      })
    }

  } catch (error) {
    console.error('❌ Error during cleanup:', error)
  } finally {
    await prisma.$disconnect()
  }
}

cleanupMissingImages()
