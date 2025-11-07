import { NextRequest, NextResponse } from 'next/server'
import { currentUser, auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { generateDownloadUrl } from '@/lib/s3'

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Add caching headers for better performance
    const response = new NextResponse()
    response.headers.set('Cache-Control', 'private, no-store')

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const roomType = searchParams.get('roomType')
    const style = searchParams.get('style')
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const folderId = searchParams.get('folderId')

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
      include: { tenant: true }
    })

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get filter for current user vs all team
    const ownerFilter = searchParams.get('owner') // 'me', 'all', or specific userId
    
    // Build where clause - show team images if user has a tenant
    const where: any = {}
    
    if (ownerFilter === 'me') {
      // Only show current user's images
      where.userId = dbUser.id
    } else if (ownerFilter && ownerFilter !== 'all') {
      // Show specific user's images (must be in same tenant)
      where.userId = ownerFilter
      if (dbUser.tenantId) {
        // Verify the target user is in the same tenant
        const targetUser = await prisma.user.findFirst({
          where: { id: ownerFilter, tenantId: dbUser.tenantId }
        })
        if (!targetUser) {
          return NextResponse.json({ error: 'User not in your team' }, { status: 403 })
        }
      }
    } else {
      // Show all team images if user has a tenant, otherwise just their own
      if (dbUser.tenantId) {
        // Get all users in the same tenant
        const teamUsers = await prisma.user.findMany({
          where: { tenantId: dbUser.tenantId },
          select: { id: true }
        })
        where.userId = { in: teamUsers.map(u => u.id) }
      } else {
        where.userId = dbUser.id
      }
    }

    if (roomType) where.roomType = roomType
    if (style) where.style = style
    if (status) where.status = status
    if (folderId !== null) {
      if (folderId === 'null') {
        where.folderId = null
      } else if (folderId !== undefined) {
        where.folderId = folderId
      }
    }
    if (search) {
      where.OR = [
        { roomType: { contains: search, mode: 'insensitive' } },
        { style: { contains: search, mode: 'insensitive' } },
        { clientNotes: { contains: search, mode: 'insensitive' } },
      ]
    }

    // Get images with pagination
    const [images, total] = await Promise.all([
      prisma.image.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          collection: true,
          folder: true,
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              profileImageUrl: true
            }
          }
        },
      }),
      prisma.image.count({ where }),
    ])

    // Attach fresh pre-signed URLs for display (at most one presign per image)
    const imagesWithUrls = await Promise.all(images.map(async (img) => {
      try {
        let originalUrl = img.originalUrl
        let processedUrl = img.processedUrl as string | null
        // Strategy: pre-sign only the URL used for thumbnail display
        if (processedUrl) {
          // Pre-sign processed only; keep original as-is (key or full url)
          if (!processedUrl.startsWith('http')) {
            processedUrl = await generateDownloadUrl(processedUrl)
          }
        } else {
          // No processed yet → pre-sign original to show thumbnail
          if (!originalUrl.startsWith('http')) {
            originalUrl = await generateDownloadUrl(originalUrl)
          }
        }
        return { ...img, originalUrl, processedUrl }
      } catch {
        return img
      }
    }))

    // Get team members for filtering UI
    let teamMembers: any[] = []
    if (dbUser.tenantId) {
      teamMembers = await prisma.user.findMany({
        where: { tenantId: dbUser.tenantId },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          profileImageUrl: true
        }
      })
    }

    const data = {
      images: imagesWithUrls,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      teamMembers,
      currentUserId: dbUser.id
    }

    return NextResponse.json(data, { headers: response.headers })
  } catch (error) {
    console.error('Get images error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch images' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const imageId = searchParams.get('imageId')

    if (!imageId) {
      return NextResponse.json({ error: 'Image ID required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if image belongs to user
    const image = await prisma.image.findFirst({
      where: {
        id: imageId,
        userId: user.id,
      },
    })

    if (!image) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 })
    }

    // Delete image
    await prisma.image.delete({
      where: { id: imageId },
    })

    // Log deletion
    await prisma.usageLog.create({
      data: {
        userId: user.id,
        tenantId: user.tenantId,
        action: 'image_deleted',
        tokensConsumed: 0,
        metadata: {
          imageId,
        },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete image error:', error)
    return NextResponse.json(
      { error: 'Failed to delete image' },
      { status: 500 }
    )
  }
}



