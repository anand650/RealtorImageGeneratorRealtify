const { S3Client, PutBucketCorsCommand, GetBucketCorsCommand } = require('@aws-sdk/client-s3')
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
      ID: 'realtor-app-cors',
      AllowedHeaders: [
        '*'
      ],
      AllowedMethods: [
        'GET',
        'PUT',
        'POST',
        'DELETE',
        'HEAD'
      ],
      AllowedOrigins: [
        'http://localhost:3000',
        'https://localhost:3000',
        'http://127.0.0.1:3000',
        'https://127.0.0.1:3000',
        '*' // Allow all origins for now - you can restrict this later
      ],
      ExposeHeaders: [
        'ETag',
        'x-amz-version-id',
        'x-amz-delete-marker',
        'x-amz-request-id',
        'x-amz-id-2'
      ],
      MaxAgeSeconds: 3000,
    },
  ],
}

async function checkCurrentCORS() {
  try {
    console.log(`Checking current CORS for bucket: ${BUCKET_NAME}`)
    
    const command = new GetBucketCorsCommand({
      Bucket: BUCKET_NAME,
    })

    const response = await s3Client.send(command)
    console.log('Current CORS configuration:')
    console.log(JSON.stringify(response.CORSRules, null, 2))
    return response.CORSRules
  } catch (error) {
    if (error.name === 'NoSuchCORSConfiguration') {
      console.log('No CORS configuration found')
      return null
    }
    console.error('Error getting CORS:', error)
    return null
  }
}

async function setupCORS() {
  try {
    console.log(`\n🔧 Setting up CORS for bucket: ${BUCKET_NAME}`)
    
    // Check current CORS
    await checkCurrentCORS()
    
    const command = new PutBucketCorsCommand({
      Bucket: BUCKET_NAME,
      CORSConfiguration: corsConfiguration,
    })

    await s3Client.send(command)
    console.log('\n✅ CORS configuration applied successfully!')
    console.log('New CORS configuration:')
    console.log(JSON.stringify(corsConfiguration.CORSRules, null, 2))
    
    // Verify the new configuration
    console.log('\n🔍 Verifying new CORS configuration...')
    await checkCurrentCORS()
    
  } catch (error) {
    console.error('❌ Error setting up CORS:', error)
    
    if (error.name === 'AccessDenied') {
      console.log('\n💡 Possible solutions:')
      console.log('1. Check your AWS credentials have s3:PutBucketCors permission')
      console.log('2. Verify the bucket name is correct')
      console.log('3. Ensure your IAM user/role has the necessary permissions')
    }
    
    process.exit(1)
  }
}

console.log('🚀 Starting S3 CORS configuration...')
console.log(`Bucket: ${BUCKET_NAME}`)
console.log(`Region: ${process.env.AWS_REGION || 'us-east-1'}`)
console.log(`Access Key: ${process.env.AWS_ACCESS_KEY_ID ? process.env.AWS_ACCESS_KEY_ID.substring(0, 8) + '...' : 'Not set'}`)

setupCORS()
