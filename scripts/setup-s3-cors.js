const { S3Client, PutBucketCorsCommand } = require('@aws-sdk/client-s3')
require('dotenv').config({ path: '.env.local' })

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
})

const BUCKET_NAME = process.env.AWS_S3_BUCKET || 'realtor-image-generator'

const corsConfiguration = {
  CORSRules: [
    {
      AllowedHeaders: ['*'],
      AllowedMethods: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
      AllowedOrigins: [
        'http://localhost:3000',
        'https://localhost:3000',
        'http://127.0.0.1:3000',
        'https://127.0.0.1:3000',
        // Add your production domain here when you deploy
        // 'https://yourdomain.com',
      ],
      ExposeHeaders: ['ETag', 'x-amz-version-id'],
      MaxAgeSeconds: 3000,
    },
  ],
}

async function setupCORS() {
  try {
    console.log(`Setting up CORS for bucket: ${BUCKET_NAME}`)
    
    const command = new PutBucketCorsCommand({
      Bucket: BUCKET_NAME,
      CORSConfiguration: corsConfiguration,
    })

    await s3Client.send(command)
    console.log('✅ CORS configuration applied successfully!')
    console.log('Allowed origins:', corsConfiguration.CORSRules[0].AllowedOrigins)
  } catch (error) {
    console.error('❌ Error setting up CORS:', error)
    process.exit(1)
  }
}

setupCORS()
