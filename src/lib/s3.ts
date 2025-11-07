import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const s3Client = new S3Client({
  region: process.env.S3_REGION || process.env.AWS_REGION || 'us-east-1', // Support both for backward compatibility
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY || '',
  },
})

const BUCKET_NAME = process.env.S3_BUCKET_NAME || process.env.AWS_S3_BUCKET || 'realtor-image-generator'

export function generateImageKey(userId: string, imageId: string, type: 'original' | 'processed'): string {
  const timestamp = Date.now()
  const extension = type === 'original' ? 'jpg' : 'jpg'
  return `users/${userId}/images/${imageId}/${type}-${timestamp}.${extension}`
}

export function getImageUrl(key: string): string {
  // Use CloudFront if configured (for better performance and lower costs)
  const cloudFrontDomain = process.env.CLOUDFRONT_DOMAIN
  if (cloudFrontDomain) {
    return `https://${cloudFrontDomain}/${key}`
  }
  // Fallback to S3 direct URL
  const region = process.env.S3_REGION || process.env.AWS_REGION || 'us-east-1'
  return `https://${BUCKET_NAME}.s3.${region}.amazonaws.com/${key}`
}

export async function generateUploadUrl(key: string, contentType: string): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: contentType,
    // Add CORS headers to the pre-signed URL
    Metadata: {
      'uploaded-from': 'realtor-app'
    }
  })

  return await getSignedUrl(s3Client, command, { 
    expiresIn: 86400, // 24 hours
    // Ensure CORS headers are included
    signableHeaders: new Set(['host', 'content-type'])
  })
}

export async function generateDownloadUrl(key: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  })

  return await getSignedUrl(s3Client, command, { expiresIn: 86400 }) // 24 hours
}

export async function uploadToS3(key: string, file: Buffer, contentType: string): Promise<void> {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: file,
    ContentType: contentType,
  })

  await s3Client.send(command)
}

/**
 * Check if a URL is expired by parsing the X-Amz-Expires parameter
 */
export function isUrlExpired(url: string): boolean {
  try {
    const urlObj = new URL(url)
    const expires = urlObj.searchParams.get('X-Amz-Expires')
    const date = urlObj.searchParams.get('X-Amz-Date')
    
    if (!expires || !date) return false
    
    const expiresInSeconds = parseInt(expires)
    const urlDate = new Date(date)
    const expirationTime = new Date(urlDate.getTime() + expiresInSeconds * 1000)
    
    return new Date() > expirationTime
  } catch {
    return false
  }
}