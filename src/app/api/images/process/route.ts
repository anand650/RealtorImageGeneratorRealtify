import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { processImageWithNanoBanana, getRoomPrompt } from '@/lib/nano-banana'
import { generateImageKey, getImageUrl, generateDownloadUrl } from '@/lib/s3'
import { calculateTokenUsage } from '@/lib/utils'
import { checkUserUsage, checkAnonymousUsage, recordUserUsage, recordAnonymousUsage, getClientIp } from '@/lib/usage-tracking'
import { getProcessingQueue } from '@/lib/request-queue'
import { z } from 'zod'

const processSchema = z.object({
  imageId: z.string(),
  roomType: z.string().optional(),
  style: z.string().optional(),
  clientNotes: z.string().optional(),
})

export async function POST(request: NextRequest) {
  let imageId: string | undefined
  const processingQueue = getProcessingQueue()
  
  try {
    // Check if authentication is disabled for development
    const isAuthDisabled = process.env.DISABLE_AUTH === 'true'
    let user = null
    let dbUser = null

    if (!isAuthDisabled) {
      user = await currentUser()
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      // Get user and tenant info
      dbUser = await prisma.user.findUnique({
        where: { clerkId: user.id },
        include: { tenant: true },
      })

      if (!dbUser) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }
    }

    const body = await request.json()
    const parsed = processSchema.parse(body)
    imageId = parsed.imageId
    const { roomType, style, clientNotes } = parsed

    // Check usage limits
    let usageResult
    if (dbUser) {
      // Authenticated user
      usageResult = await checkUserUsage(dbUser.id)
    } else {
      // Anonymous user
      const clientIp = await getClientIp()
      usageResult = await checkAnonymousUsage(clientIp)
    }

    if (!usageResult.canGenerate) {
      return NextResponse.json({
        error: 'Usage limit exceeded',
        details: usageResult.message,
        requiresSignup: usageResult.requiresSignup,
        requiresSubscription: usageResult.requiresSubscription,
        remainingImages: usageResult.remainingImages
      }, { status: 403 })
    }

    // Always use 1 credit per image generation (regardless of room type or style)
    const tokensNeeded = 1

    // Get user's subscription plan for queue priority
    let userPlan: 'free' | 'starter' | 'professional' | 'enterprise' = 'free'
    if (dbUser?.tenant) {
      const planName = dbUser.tenant.subscriptionPlan || 'free'
      if (planName === 'enterprise') userPlan = 'enterprise'
      else if (planName === 'professional') userPlan = 'professional'
      else if (planName === 'starter') userPlan = 'starter'
    }

    // Queue the request for processing (prevents concurrent processing of same image)
    try {
      await processingQueue.enqueue(imageId, dbUser?.id, userPlan)
    } catch (queueError) {
      if (queueError instanceof Error) {
        if (queueError.message.includes('already being processed')) {
          return NextResponse.json(
            { error: 'This image is already being processed. Please wait for it to complete.' },
            { status: 409 }
          )
        }
        if (queueError.message.includes('queue is full')) {
          return NextResponse.json(
            { error: 'Processing queue is full. Please try again in a few moments.' },
            { status: 503 }
          )
        }
      }
      throw queueError
    }

    try {
      // Use database transaction to prevent race conditions
      const transactionResult = await prisma.$transaction(async (tx) => {
      // Get the image and check status atomically
      const image = await tx.image.findFirst({
        where: {
          id: imageId,
          ...(dbUser ? { userId: dbUser.id } : {}),
        },
      })

      if (!image) {
        throw new Error('IMAGE_NOT_FOUND')
      }

      if (image.status !== 'pending') {
        throw new Error('IMAGE_ALREADY_PROCESSING')
      }

      // Check token availability atomically (only for authenticated users)
      if (dbUser && dbUser.tenantId) {
        // Re-fetch tenant to get latest token count
        const currentTenant = await tx.tenant.findUnique({
          where: { id: dbUser.tenantId },
        })

        if (!currentTenant) {
          throw new Error('TENANT_NOT_FOUND')
        }

        // Check if user has enough tokens with latest data
        if (currentTenant.tokensUsed + tokensNeeded > currentTenant.tokensAllocated) {
          throw new Error('INSUFFICIENT_TOKENS')
        }

        // Atomically update image status and increment tokens in same transaction
        await tx.image.update({
          where: { id: imageId },
          data: {
            ...(roomType ? { roomType } : {}),
            ...(style ? { style } : {}),
            status: 'processing',
            clientNotes,
            tokensUsed: tokensNeeded,
          },
        })

        // Atomically increment tenant tokens
        await tx.tenant.update({
          where: { id: dbUser.tenantId },
          data: {
            tokensUsed: {
              increment: tokensNeeded,
            },
          },
        })

        // Return updated image for processing
        return { image, currentTenant }
      } else {
        // For anonymous users, just update image status
        await tx.image.update({
          where: { id: imageId },
          data: {
            ...(roomType ? { roomType } : {}),
            ...(style ? { style } : {}),
            status: 'processing',
            clientNotes,
            tokensUsed: tokensNeeded,
          },
        })

        return { image, currentTenant: null }
      }
    }).catch((error) => {
      // Handle transaction errors
      if (error instanceof Error) {
        if (error.message === 'IMAGE_NOT_FOUND') {
          return { error: 'IMAGE_NOT_FOUND', status: 404 } as const
        }
        if (error.message === 'IMAGE_ALREADY_PROCESSING') {
          return { error: 'IMAGE_ALREADY_PROCESSING', status: 400 } as const
        }
        if (error.message === 'INSUFFICIENT_TOKENS') {
          return { error: 'INSUFFICIENT_TOKENS', status: 402 } as const
        }
        if (error.message === 'TENANT_NOT_FOUND') {
          return { error: 'TENANT_NOT_FOUND', status: 404 } as const
        }
      }
      throw error // Re-throw unknown errors
    })

    // Handle transaction error responses
    if ('error' in transactionResult) {
      const errorResult = transactionResult as { error: string; status: number }
      if (errorResult.error === 'IMAGE_NOT_FOUND') {
        return NextResponse.json({ error: 'Image not found' }, { status: errorResult.status })
      }
      if (errorResult.error === 'IMAGE_ALREADY_PROCESSING') {
        return NextResponse.json(
          { error: 'Image is already being processed or completed' },
          { status: errorResult.status }
        )
      }
      if (errorResult.error === 'INSUFFICIENT_TOKENS') {
        return NextResponse.json(
          { error: 'Insufficient tokens. Please upgrade your plan.' },
          { status: errorResult.status }
        )
      }
      if (errorResult.error === 'TENANT_NOT_FOUND') {
        return NextResponse.json({ error: 'Tenant not found' }, { status: errorResult.status })
      }
    }

    // Type guard: transactionResult is success object
    const successResult = transactionResult as { image: any; currentTenant: any }
    const { image, currentTenant } = successResult

    // Build prompt: enhancement-only if roomType/style not provided
    let prompt: string
    if (!roomType && !style) {
      const notes = (clientNotes && clientNotes.trim()) ? clientNotes.trim() : 'Improve lighting, clarity, color balance, and overall realism. Reduce noise and enhance details.'
      prompt = `Enhance this interior photo without changing the existing design style or furniture. Do not add or remove furniture. Keep layout, colors, and materials intact. Focus on:
- Lighting improvement (exposure, dynamic range, natural light feel)
- White balance and color accuracy
- Sharpening and detail enhancement
- Reduce noise and artifacts
- Subtle contrast and tonal depth

Specific user requirements (if any): ${notes}

Important: Do not ask for clarification. Make photo-quality improvements only.`
    } else {
      let base = getRoomPrompt(roomType || 'room', style || 'photorealistic')
      if (clientNotes && clientNotes.trim()) {
        base += `\n\nSPECIFIC USER REQUIREMENTS:\n${clientNotes.trim()}\n\nPlease incorporate these specific requirements into the design while maintaining the overall style and quality.`
      }
      prompt = base
    }

    // Log usage (only for authenticated users) - already updated in transaction above
    if (dbUser) {
      await prisma.usageLog.create({
        data: {
          userId: dbUser.id,
          tenantId: dbUser.tenantId,
          action: 'image_processing_started',
          tokensConsumed: tokensNeeded,
          metadata: {
            imageId,
            roomType,
            style,
          },
        },
      })
    }

    // Generate a pre-signed URL for processing
    const imageUrlForProcessing = await generateDownloadUrl(image.originalUrl)
    
    // Process image with Nano Banana (synchronous) - use high quality by default
    const processingResult = await processImageWithNanoBanana({
      image_url: imageUrlForProcessing,
      prompt,
      style: (style || 'photorealistic') as any,
      quality: 'high',
      room_type: roomType || undefined,
    })

    if (processingResult.success && processingResult.result_url) {
      // Update image with result
      await prisma.image.update({
        where: { id: imageId },
        data: {
          status: 'completed',
          processedUrl: processingResult.result_url,
          processingTime: Math.max(1, Math.round((processingResult.processing_time || 0) / 1000)),
        },
      })

      // Usage already recorded in transaction above - no need to record again

      // Log successful processing
      if (dbUser) {
        await prisma.usageLog.create({
          data: {
            userId: dbUser.id,
            tenantId: dbUser.tenantId,
            action: 'image_processing_completed',
            tokensConsumed: 1,
            metadata: {
              imageId,
              processingTime: processingResult.processing_time,
            },
          },
        })
      }
    } else {
      // Get current image metadata before updating
      const currentImage = await prisma.image.findUnique({
        where: { id: imageId },
      })
      
      // Update image with error details
      await prisma.image.update({
        where: { id: imageId },
        data: {
          status: 'failed',
          metadata: {
            ...(currentImage?.metadata as object || {}),
            error: processingResult.error,
            errorCode: processingResult.errorCode,
            processingTime: Math.max(1, Math.round((processingResult.processing_time || 0) / 1000)),
          },
        },
      })

          // Refund tokens since processing failed (only for authenticated users)
          // Use transaction to ensure atomic refund
          if (dbUser && dbUser.tenantId) {
            const tenantId = dbUser.tenantId
            await prisma.$transaction(async (tx) => {
              await tx.tenant.update({
                where: { id: tenantId },
                data: {
                  tokensUsed: {
                    decrement: tokensNeeded,
                  },
                },
              })
            })
          }

      // Log failed processing with detailed error (only for authenticated users)
      if (dbUser) {
        await prisma.usageLog.create({
          data: {
            userId: dbUser.id,
            tenantId: dbUser.tenantId,
            action: 'image_processing_failed',
            tokensConsumed: -tokensNeeded, // Negative to indicate refund
            metadata: {
              imageId,
              error: processingResult.error,
              errorCode: processingResult.errorCode,
              processingTime: Math.max(1, Math.round((processingResult.processing_time || 0) / 1000)),
            },
          },
        })
      }
    }

    // Provide more user-friendly error messages
    let userMessage = processingResult.success ? 'Image processing completed' : 'Image processing failed';
    let userError = processingResult.error;
    
    if (!processingResult.success && processingResult.error) {
      if (processingResult.error.includes('clarification') || processingResult.error.includes('mismatch')) {
        userMessage = 'Room type mismatch detected';
        userError = 'The selected room type doesn\'t match the uploaded image. Please select the correct room type (e.g., "Living Room" for living room images) or upload a different image.';
      } else if (processingResult.error.includes('quota') || processingResult.error.includes('exceeded')) {
        userMessage = 'Usage limit reached';
        userError = 'You\'ve reached your monthly image generation limit. Please upgrade your plan or try again next month.';
      } else if (processingResult.error.includes('NO_IMAGE_GENERATED')) {
        userMessage = 'AI generation failed';
        userError = 'The AI model couldn\'t generate an image. This might be due to content restrictions or technical issues. Please try again with a different image.';
      }
    }

      return NextResponse.json({
        success: processingResult.success,
        message: userMessage,
        imageId,
        result: {
          status: processingResult.success ? 'completed' : 'failed',
          processedUrl: processingResult.result_url,
          processingTime: Math.max(1, Math.round((processingResult.processing_time || 0) / 1000)),
          error: userError,
          errorCode: processingResult.errorCode,
        },
      })
    } finally {
      // Remove from processing queue when done
      processingQueue.dequeue(imageId)
    }
  } catch (error) {
    console.error('Process error:', error)
    
    // Remove from queue on error (only if imageId was set)
    if (imageId) {
      processingQueue.dequeue(imageId)
    }
    
    return NextResponse.json(
      { error: 'Failed to start image processing', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}



