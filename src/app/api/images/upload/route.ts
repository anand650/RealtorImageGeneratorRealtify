import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { generateUploadUrl, generateImageKey } from '@/lib/s3'
import { z } from 'zod'

const uploadSchema = z.object({
  fileName: z.string(),
  fileType: z.string(),
  fileSize: z.number(),
})

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { fileName, fileType, fileSize } = uploadSchema.parse(body)

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(fileType)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' },
        { status: 400 }
      )
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (fileSize > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      )
    }

    // Get user and tenant info
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
      include: { tenant: true },
    })

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check token availability
    if (dbUser.tenant && dbUser.tenant.tokensUsed >= dbUser.tenant.tokensAllocated) {
      return NextResponse.json(
        { error: 'No tokens remaining. Please upgrade your plan.' },
        { status: 402 }
      )
    }

    // Generate unique image ID
    const imageId = `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Generate S3 key
    const key = generateImageKey(dbUser.id, imageId, 'original')

    // Generate pre-signed URL
    const uploadUrl = await generateUploadUrl(key, fileType)

    // Create image record in database
    const image = await prisma.image.create({
      data: {
        id: imageId,
        userId: dbUser.id,
        tenantId: dbUser.tenantId,
        originalUrl: key, // Store the S3 key instead of the direct URL
        roomType: 'pending',
        style: 'pending',
        status: 'pending',
        tokensUsed: 0,
        metadata: {
          fileName,
          fileType,
          fileSize,
          uploadKey: key,
        },
      },
    })

    return NextResponse.json({
      success: true,
      imageId: image.id,
      uploadUrl,
      key,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to generate upload URL' },
      { status: 500 }
    )
  }
}



