import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { generateDownloadUrl } from '@/lib/s3'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user from database
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
    })

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Await params to get the id
    const { id } = await params
    
    // Get the image
    const image = await prisma.image.findFirst({
      where: {
        id: id,
        userId: dbUser.id,
      },
      include: {
        folder: true,
      },
    })

    if (!image) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 })
    }

    // Generate fresh pre-signed URLs for viewing
    const originalUrl = await generateDownloadUrl(image.originalUrl)
    let processedUrl = image.processedUrl

    // If processedUrl is an S3 key, generate a pre-signed URL
    // If it's already a full URL (like Unsplash), use it directly
    if (processedUrl && !processedUrl.startsWith('http')) {
      processedUrl = await generateDownloadUrl(processedUrl)
    }

    return NextResponse.json({
      success: true,
      image: {
        ...image,
        originalUrl,
        processedUrl,
      },
    })
  } catch (error) {
    console.error('Get image error:', error)
    return NextResponse.json(
      { error: 'Failed to get image' },
      { status: 500 }
    )
  }
}
