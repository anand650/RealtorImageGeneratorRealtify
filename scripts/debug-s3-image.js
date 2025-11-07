const { S3Client, HeadObjectCommand, ListObjectsV2Command } = require('@aws-sdk/client-s3')
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner')
const { GetObjectCommand } = require('@aws-sdk/client-s3')
require('dotenv').config({ path: '.env.local' })

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'eu-north-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
})

const BUCKET_NAME = process.env.AWS_S3_BUCKET || 'realtor-image-generator'

async function debugS3Image() {
  try {
    const imageKey = 'users/cmh7vlqi70000wt44noyz56d7/images/img_1761504765823_hai8u3dph/original-1761504765823.jpg'
    
    console.log('🔍 Debugging S3 image access...')
    console.log(`Bucket: ${BUCKET_NAME}`)
    console.log(`Region: ${process.env.AWS_REGION}`)
    console.log(`Key: ${imageKey}`)
    
    // 1. Check if the object exists
    console.log('\n1. Checking if object exists...')
    try {
      const headCommand = new HeadObjectCommand({
        Bucket: BUCKET_NAME,
        Key: imageKey,
      })
      
      const headResult = await s3Client.send(headCommand)
      console.log('✅ Object exists!')
      console.log('Object metadata:', {
        ContentType: headResult.ContentType,
        ContentLength: headResult.ContentLength,
        LastModified: headResult.LastModified,
        ETag: headResult.ETag,
      })
    } catch (headError) {
      console.log('❌ Object does not exist or access denied:', headError.message)
      
      // List objects in the user directory to see what's there
      console.log('\n2. Listing objects in user directory...')
      const listCommand = new ListObjectsV2Command({
        Bucket: BUCKET_NAME,
        Prefix: 'users/cmh7vlqi70000wt44noyz56d7/images/',
        MaxKeys: 10,
      })
      
      const listResult = await s3Client.send(listCommand)
      console.log('Objects found:')
      if (listResult.Contents && listResult.Contents.length > 0) {
        listResult.Contents.forEach(obj => {
          console.log(`  - ${obj.Key} (${obj.Size} bytes, ${obj.LastModified})`)
        })
      } else {
        console.log('  No objects found in this directory')
      }
      return
    }
    
    // 2. Generate a pre-signed URL
    console.log('\n3. Generating pre-signed URL...')
    const getCommand = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: imageKey,
    })
    
    const signedUrl = await getSignedUrl(s3Client, getCommand, { 
      expiresIn: 3600 // 1 hour
    })
    
    console.log('✅ Pre-signed URL generated:')
    console.log(signedUrl)
    
    // 3. Test the URL with fetch
    console.log('\n4. Testing URL with fetch...')
    try {
      const response = await fetch(signedUrl, { method: 'HEAD' })
      console.log(`Response status: ${response.status}`)
      console.log('Response headers:', Object.fromEntries(response.headers.entries()))
      
      if (response.ok) {
        console.log('✅ URL is accessible!')
      } else {
        console.log('❌ URL returned error:', response.status, response.statusText)
      }
    } catch (fetchError) {
      console.log('❌ Fetch error:', fetchError.message)
    }
    
  } catch (error) {
    console.error('❌ Debug error:', error)
  }
}

debugS3Image()
