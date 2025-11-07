import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateFolderSchema = z.object({
  name: z.string().min(1, 'Folder name is required'),
  description: z.string().optional(),
})

// PUT /api/folders/[id] - Update a folder
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
    const { name, description } = updateFolderSchema.parse(body)

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
    })

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Find the folder and verify ownership
    const folder = await prisma.imageFolder.findFirst({
      where: {
        id,
        userId: dbUser.id,
      }
    })

    if (!folder) {
      return NextResponse.json({ error: 'Folder not found' }, { status: 404 })
    }

    // Update the folder
    const updatedFolder = await prisma.imageFolder.update({
      where: { id },
      data: {
        name,
        description,
      },
      include: {
        images: {
          select: { id: true }
        }
      }
    })

    return NextResponse.json({
      success: true,
      folder: {
        id: updatedFolder.id,
        name: updatedFolder.name,
        description: updatedFolder.description,
        parentFolderId: updatedFolder.parentFolderId,
        imageCount: updatedFolder.images.length,
        createdAt: updatedFolder.createdAt,
        updatedAt: updatedFolder.updatedAt,
      }
    })
  } catch (error) {
    console.error('Update folder error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to update folder' },
      { status: 500 }
    )
  }
}

// DELETE /api/folders/[id] - Delete a folder
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
    })

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Find the folder and verify ownership
    const folder = await prisma.imageFolder.findFirst({
      where: {
        id,
        userId: dbUser.id,
      },
      include: {
        images: true,
        subFolders: true
      }
    })

    if (!folder) {
      return NextResponse.json({ error: 'Folder not found' }, { status: 404 })
    }

    // Check if folder has images or subfolders
    if (folder.images.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete folder with images. Please move or delete images first.' },
        { status: 400 }
      )
    }

    if (folder.subFolders.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete folder with subfolders. Please delete subfolders first.' },
        { status: 400 }
      )
    }

    // Delete the folder
    await prisma.imageFolder.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Folder deleted successfully'
    })
  } catch (error) {
    console.error('Delete folder error:', error)
    return NextResponse.json(
      { error: 'Failed to delete folder' },
      { status: 500 }
    )
  }
}




