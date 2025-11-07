import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const bulkMoveSchema = z.object({
  imageIds: z.array(z.string()).min(1, 'At least one image ID is required'),
  folderId: z.string().nullable(),
})

// POST /api/images/bulk-move - Move multiple images to a folder
export async function POST(request: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { imageIds, folderId } = bulkMoveSchema.parse(body)

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
    })

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // If folderId is provided, verify the folder exists and belongs to the user
    if (folderId) {
      const folder = await prisma.imageFolder.findFirst({
        where: {
          id: folderId,
          userId: dbUser.id,
        }
      })

      if (!folder) {
        return NextResponse.json(
          { error: 'Folder not found' },
          { status: 404 }
        )
      }
    }

    // Verify all images belong to the user
    const images = await prisma.image.findMany({
      where: {
        id: { in: imageIds },
        userId: dbUser.id,
      },
      select: { id: true }
    })

    if (images.length !== imageIds.length) {
      return NextResponse.json(
        { error: 'Some images not found or not owned by user' },
        { status: 404 }
      )
    }

    // Update all images' folder assignments
    await prisma.image.updateMany({
      where: {
        id: { in: imageIds },
        userId: dbUser.id,
      },
      data: {
        folderId: folderId,
      }
    })

    return NextResponse.json({
      success: true,
      message: `Successfully moved ${imageIds.length} images`,
      movedCount: imageIds.length,
    })
  } catch (error) {
    console.error('Bulk move images error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to move images' },
      { status: 500 }
    )
  }
}




