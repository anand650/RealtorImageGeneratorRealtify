import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const moveImageSchema = z.object({
  folderId: z.string().nullable(),
})

// PUT /api/images/[id]/move - Move image to a folder
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { folderId } = moveImageSchema.parse(body)

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
    })

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Find the image and verify ownership
    const image = await prisma.image.findFirst({
      where: {
        id,
        userId: dbUser.id,
      }
    })

    if (!image) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 })
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

    // Update the image's folder assignment
    const updatedImage = await prisma.image.update({
      where: { id },
      data: {
        folderId: folderId,
      },
      include: {
        folder: true,
      }
    })

    return NextResponse.json({
      success: true,
      image: {
        id: updatedImage.id,
        folderId: updatedImage.folderId,
        folderName: updatedImage.folder?.name || null,
      }
    })
  } catch (error) {
    console.error('Move image error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to move image' },
      { status: 500 }
    )
  }
}




