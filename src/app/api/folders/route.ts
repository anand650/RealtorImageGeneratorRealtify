import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createFolderSchema = z.object({
  name: z.string().min(1, 'Folder name is required'),
  description: z.string().optional(),
  parentFolderId: z.string().optional(),
})

const updateFolderSchema = z.object({
  name: z.string().min(1, 'Folder name is required'),
  description: z.string().optional(),
})

// GET /api/folders - Get all folders for the user
export async function GET(request: NextRequest) {
  try {
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

    // Get all folders for the user with image counts
    const folders = await prisma.imageFolder.findMany({
      where: { userId: dbUser.id },
      include: {
        images: {
          select: { id: true }
        },
        subFolders: {
          include: {
            images: {
              select: { id: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    })

    // Transform the data to include image counts
    const foldersWithCounts = folders.map(folder => ({
      id: folder.id,
      name: folder.name,
      description: folder.description,
      parentFolderId: folder.parentFolderId,
      imageCount: folder.images.length,
      subFolders: folder.subFolders.map(subFolder => ({
        id: subFolder.id,
        name: subFolder.name,
        description: subFolder.description,
        parentFolderId: subFolder.parentFolderId,
        imageCount: subFolder.images.length,
      }))
    }))

    return NextResponse.json({ folders: foldersWithCounts })
  } catch (error) {
    console.error('Get folders error:', error)
    return NextResponse.json(
      { error: 'Failed to get folders' },
      { status: 500 }
    )
  }
}

// POST /api/folders - Create a new folder
export async function POST(request: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, parentFolderId } = createFolderSchema.parse(body)

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
    })

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // If parentFolderId is provided, verify it exists and belongs to the user
    if (parentFolderId) {
      const parentFolder = await prisma.imageFolder.findFirst({
        where: {
          id: parentFolderId,
          userId: dbUser.id,
        }
      })

      if (!parentFolder) {
        return NextResponse.json(
          { error: 'Parent folder not found' },
          { status: 404 }
        )
      }
    }

    // Create the folder
    const folder = await prisma.imageFolder.create({
      data: {
        name,
        description,
        userId: dbUser.id,
        parentFolderId: parentFolderId || null,
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
        id: folder.id,
        name: folder.name,
        description: folder.description,
        parentFolderId: folder.parentFolderId,
        imageCount: folder.images.length,
        createdAt: folder.createdAt,
        updatedAt: folder.updatedAt,
      }
    })
  } catch (error) {
    console.error('Create folder error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to create folder' },
      { status: 500 }
    )
  }
}




