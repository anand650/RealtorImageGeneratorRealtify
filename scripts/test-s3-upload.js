const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3')
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner')
require('dotenv').config({ path: '.env.local' })

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
})

const BUCKET_NAME = process.env.AWS_S3_BUCKET || 'realtor-image-generator'

async function testS3Upload() {
  try {
    console.log('🧪 Testing S3 upload functionality...')
    console.log(`Bucket: ${BUCKET_NAME}`)
    console.log(`Region: ${process.env.AWS_REGION || 'us-east-1'}`)
    
    // Generate a test key
    const testKey = `test/upload-test-${Date.now()}.txt`
    
    // Create a PutObjectCommand
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: testKey,
      ContentType: 'text/plain',
    })

    // Generate pre-signed URL
    const uploadUrl = await getSignedUrl(s3Client, command, { 
      expiresIn: 3600, // 1 hour
      signableHeaders: new Set(['host', 'content-type'])
    })

    console.log('\n✅ Pre-signed URL generated successfully!')
    console.log('Upload URL:', uploadUrl)
    
    // Test the URL with a simple fetch (this would be done from the browser)
    console.log('\n🌐 Testing URL accessibility...')
    
    // Create test content
    const testContent = 'This is a test upload from the Realtor Image Generator app'
    
    try {
      const response = await fetch(uploadUrl, {
        method: 'PUT',
        body: testContent,
        headers: {
          'Content-Type': 'text/plain',
        },
      })

      if (response.ok) {
        console.log('✅ Test upload successful!')
        console.log('Response status:', response.status)
        console.log('Response headers:', Object.fromEntries(response.headers.entries()))
      } else {
        console.log('❌ Test upload failed')
        console.log('Response status:', response.status)
        console.log('Response text:', await response.text())
      }
    } catch (fetchError) {
      console.log('❌ Fetch error (this might be expected in Node.js):', fetchError.message)
      console.log('💡 The pre-signed URL should work from a browser with proper CORS')
    }
    
  } catch (error) {
    console.error('❌ Error testing S3 upload:', error)
    
    if (error.name === 'CredentialsProviderError') {
      console.log('\n💡 AWS credentials issue:')
      console.log('1. Check your .env.local file has the correct AWS credentials')
      console.log('2. Verify AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY are set')
    }
    
    if (error.name === 'NoSuchBucket') {
      console.log('\n💡 Bucket not found:')
      console.log('1. Check the bucket name in AWS_S3_BUCKET')
      console.log('2. Verify the bucket exists in the correct region')
    }
  }
}

testS3Upload()
