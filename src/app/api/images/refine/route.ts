import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { processImageWithNanoBanana, getRoomPrompt } from '@/lib/nano-banana'
import { generateDownloadUrl } from '@/lib/s3'
import { calculateTokenUsage } from '@/lib/utils'
import { z } from 'zod'

const refineSchema = z.object({
  imageId: z.string(),
  userFeedback: z.string(),
  specificRequests: z.object({
    colors: z.string().optional(),
    furniture: z.string().optional(),
    lighting: z.string().optional(),
    style: z.string().optional(),
    other: z.string().optional(),
  }).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { imageId, userFeedback, specificRequests } = refineSchema.parse(body)

    // Get user and tenant info
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
      include: { tenant: true },
    })

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get the original image
    const originalImage = await prisma.image.findFirst({
      where: {
        id: imageId,
        userId: dbUser.id,
      },
    })

    if (!originalImage) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 })
    }

    // Calculate token usage for refinement
    const tokensNeeded = calculateTokenUsage(originalImage.roomType, originalImage.style)

    // Check if user has enough tokens
    if (dbUser.tenant && dbUser.tenant.tokensUsed + tokensNeeded > dbUser.tenant.tokensAllocated) {
      return NextResponse.json(
        { error: 'Insufficient tokens. Please upgrade your plan.' },
        { status: 402 }
      )
    }

    // For now, skip creating refinement request record until Prisma client is updated
    // const refinementRequest = await prisma.imageRefinementRequest.create({
    //   data: {
    //     imageId: originalImage.id,
    //     userId: dbUser.id,
    //     userFeedback,
    //     specificRequests: specificRequests || {},
    //     tokensUsed: tokensNeeded,
    //   },
    // })

    // Generate conversation ID if this is the first refinement
    const conversationId = originalImage.conversationId || `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Create a new refined image record
    const refinedImageId = `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const refinedImage = await prisma.image.create({
      data: {
        id: refinedImageId,
        userId: dbUser.id,
        tenantId: dbUser.tenantId,
        originalUrl: originalImage.originalUrl, // Same original image
        roomType: originalImage.roomType,
        style: originalImage.style,
        status: 'processing',
        tokensUsed: tokensNeeded,
        clientNotes: userFeedback,
        metadata: {
          isRefinement: true,
          originalImageId: originalImage.id,
          userFeedback,
          specificRequests: specificRequests || {},
          conversationId,
        },
      },
    })

    // Update original image with conversation ID if not set
    if (!originalImage.conversationId) {
      await prisma.image.update({
        where: { id: originalImage.id },
        data: { conversationId },
      })
    }

    // Update tenant token usage
    if (dbUser.tenant) {
      await prisma.tenant.update({
        where: { id: dbUser.tenant.id },
        data: {
          tokensUsed: {
            increment: tokensNeeded,
          },
        },
      })
    }

    // Build enhanced prompt with conversation context
    const basePrompt = getRoomPrompt(originalImage.roomType, originalImage.style)
    
    // Build conversation context (simplified for now)
    const conversationContext = ''

    const refinementPrompt = `${basePrompt}

IMPORTANT REFINEMENT CONTEXT:
This is a refinement of a previously generated image. The user provided the following feedback:
"${userFeedback}"

${specificRequests ? `
Specific requests:
${specificRequests.colors ? `- Colors: ${specificRequests.colors}` : ''}
${specificRequests.furniture ? `- Furniture: ${specificRequests.furniture}` : ''}
${specificRequests.lighting ? `- Lighting: ${specificRequests.lighting}` : ''}
${specificRequests.style ? `- Style adjustments: ${specificRequests.style}` : ''}
${specificRequests.other ? `- Other changes: ${specificRequests.other}` : ''}
` : ''}

${conversationContext ? `
Previous conversation:
${conversationContext}
` : ''}

Please generate an improved version that addresses the user's feedback while maintaining the overall room structure and design quality.`

    // Get the original image URL for processing
    const imageUrlForProcessing = await generateDownloadUrl(originalImage.originalUrl)
    
    // Process image with enhanced refinement prompt
    const result = await processImageWithNanoBanana({
      image_url: imageUrlForProcessing,
      prompt: refinementPrompt,
      style: 'photorealistic',
      quality: 'standard',
    })

    if (result.success && result.result_url) {
      // Update refined image with result
      await prisma.image.update({
        where: { id: refinedImageId },
        data: {
          status: 'completed',
          processedUrl: result.result_url,
          processingTime: Math.max(1, Math.round((result.processing_time || 0) / 1000)),
        },
      })

      // Skip updating refinement request status for now
      // await prisma.imageRefinementRequest.update({
      //   where: { id: refinementRequest.id },
      //   data: {
      //     status: 'completed',
      //     aiResponse: 'Successfully generated refined image based on user feedback',
      //   },
      // })

      // Log successful processing
      await prisma.usageLog.create({
        data: {
          userId: dbUser.id,
          tenantId: dbUser.tenantId,
          action: 'image_refinement_completed',
          tokensConsumed: tokensNeeded,
          metadata: {
            originalImageId: originalImage.id,
            refinedImageId,
            userFeedback,
            processingTime: Math.max(1, Math.round((result.processing_time || 0) / 1000)),
          },
        },
      })
    } else {
      // Update refined image with error
      await prisma.image.update({
        where: { id: refinedImageId },
        data: {
          status: 'failed',
        },
      })

      // Skip updating refinement request status for now
      // await prisma.imageRefinementRequest.update({
      //   where: { id: refinementRequest.id },
      //   data: {
      //     status: 'failed',
      //     aiResponse: result.error || 'Failed to generate refined image',
      //   },
      // })

      // Refund tokens since processing failed
      if (dbUser.tenant) {
        await prisma.tenant.update({
          where: { id: dbUser.tenant.id },
          data: {
            tokensUsed: {
              decrement: tokensNeeded,
            },
          },
        })
      }

      // Log failed processing
      await prisma.usageLog.create({
        data: {
          userId: dbUser.id,
          tenantId: dbUser.tenantId,
          action: 'image_refinement_failed',
          tokensConsumed: -tokensNeeded, // Negative to indicate refund
          metadata: {
            originalImageId: originalImage.id,
            refinedImageId,
            userFeedback,
            error: result.error,
          },
        },
      })
    }

    return NextResponse.json({
      success: result.success,
      message: result.success ? 'Image refinement completed' : 'Image refinement failed',
      refinedImageId,
      conversationId,
      result: {
        status: result.success ? 'completed' : 'failed',
        processedUrl: result.result_url,
        processingTime: Math.max(1, Math.round((result.processing_time || 0) / 1000)),
        error: result.error,
        errorCode: result.errorCode,
      },
    })
  } catch (error) {
    console.error('Refinement error:', error)
    return NextResponse.json(
      { error: 'Failed to process image refinement', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
