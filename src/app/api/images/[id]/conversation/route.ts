import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Get user info
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
    })

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get the image and its conversation
    const image = await prisma.image.findFirst({
      where: {
        id,
        userId: dbUser.id,
      },
      include: {
        refinementRequests: {
          orderBy: { createdAt: 'asc' },
        },
        refinements: {
          orderBy: { createdAt: 'asc' },
          include: {
            refinementRequests: {
              orderBy: { createdAt: 'asc' },
            },
          },
        },
        parentImage: {
          include: {
            refinementRequests: {
              orderBy: { createdAt: 'asc' },
            },
          },
        },
      },
    })

    if (!image) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 })
    }

    // Build conversation history
    const conversation = []

    // If this is a refinement, start with the parent image
    if (image.parentImage) {
      conversation.push({
        type: 'original',
        imageId: image.parentImage.id,
        timestamp: image.parentImage.createdAt,
        status: image.parentImage.status,
      })

      // Add parent's refinement requests
      image.parentImage.refinementRequests.forEach(req => {
        conversation.push({
          type: 'feedback',
          requestId: req.id,
          feedback: req.userFeedback,
          specificRequests: req.specificRequests,
          timestamp: req.createdAt,
          status: req.status,
        })
      })
    } else {
      // This is the original image
      conversation.push({
        type: 'original',
        imageId: image.id,
        timestamp: image.createdAt,
        status: image.status,
      })
    }

    // Add this image's refinement requests
    image.refinementRequests.forEach(req => {
      conversation.push({
        type: 'feedback',
        requestId: req.id,
        feedback: req.userFeedback,
        specificRequests: req.specificRequests,
        timestamp: req.createdAt,
        status: req.status,
      })
    })

    // Add refinements
    image.refinements.forEach(refinement => {
      conversation.push({
        type: 'refinement',
        imageId: refinement.id,
        timestamp: refinement.createdAt,
        status: refinement.status,
        tokensUsed: refinement.tokensUsed,
      })

      // Add refinement's feedback requests
      refinement.refinementRequests.forEach(req => {
        conversation.push({
          type: 'feedback',
          requestId: req.id,
          feedback: req.userFeedback,
          specificRequests: req.specificRequests,
          timestamp: req.createdAt,
          status: req.status,
        })
      })
    })

    // Sort by timestamp
    conversation.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

    return NextResponse.json({
      success: true,
      conversation,
      conversationId: image.conversationId,
      totalRefinements: image.refinementCount,
      metadata: {
        originalImageId: image.parentImageId || image.id,
        currentImageId: image.id,
        roomType: image.roomType,
        style: image.style,
      },
    })
  } catch (error) {
    console.error('Get conversation error:', error)
    return NextResponse.json(
      { error: 'Failed to get conversation history' },
      { status: 500 }
    )
  }
}
