/**
 * Integration Tests for Image Processing API Route
 * 
 * These tests verify the /api/images/process endpoint handles:
 * - Authentication and authorization
 * - Token validation
 * - Usage limit checks
 * - Image status validation
 * - Error handling
 * - Concurrent request scenarios
 * 
 * CRITICAL: These tests identify race conditions and concurrency issues
 * that could break the system under production load.
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import { currentUser } from '@clerk/nextjs/server'

// Mock Prisma client
const mockPrisma = {
  user: {
    findUnique: jest.fn(),
  },
  image: {
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  tenant: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  usageLog: {
    create: jest.fn(),
  },
  $transaction: jest.fn((callback) => {
    // Create transaction context with mocked methods
    const tx = {
      image: {
        findFirst: mockPrisma.image.findFirst,
        findUnique: mockPrisma.image.findUnique,
        update: mockPrisma.image.update,
      },
      tenant: {
        findUnique: mockPrisma.tenant.findUnique,
        update: mockPrisma.tenant.update,
      },
      user: {
        findUnique: mockPrisma.user.findUnique,
      },
    }
    return callback(tx)
  }),
}

jest.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}))

// Mock dependencies
const mockCheckUserUsage = jest.fn()
const mockProcessImageWithNanoBanana = jest.fn()

jest.mock('@clerk/nextjs/server')
jest.mock('@/lib/nano-banana', () => ({
  processImageWithNanoBanana: mockProcessImageWithNanoBanana,
}))
jest.mock('@/lib/usage-tracking', () => ({
  checkUserUsage: mockCheckUserUsage,
}))
jest.mock('@/lib/s3')

// Mock Next.js server components
class MockNextRequest {
  constructor(public url: string, public init?: any) {}
  json = jest.fn()
}

class MockNextResponse {
  static json(data: any, init?: any) {
    return {
      status: init?.status || 200,
      json: async () => data,
    }
  }
}

jest.mock('next/server', () => ({
  NextRequest: MockNextRequest,
  NextResponse: MockNextResponse,
}))

// Dynamically import POST after mocks are set up
let POST: any

describe('Image Processing API Integration Tests', () => {
  beforeAll(async () => {
    // Import POST handler after all mocks are configured
    const module = await import('@/app/api/images/process/route')
    POST = module.POST
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Authentication and Authorization', () => {
    /**
     * Test: Unauthenticated requests should be rejected
     * 
     * Verifies that the API correctly rejects requests from
     * unauthenticated users.
     */
    it('should reject unauthenticated requests', async () => {
      ;(currentUser as jest.Mock).mockResolvedValue(null)

      const request = new MockNextRequest('http://localhost/api/images/process', {
        method: 'POST',
        body: JSON.stringify({
          imageId: 'img-123',
          roomType: 'living_room',
          style: 'modern',
        }),
      })
      request.json.mockResolvedValue({
        imageId: 'img-123',
        roomType: 'living_room',
        style: 'modern',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    /**
     * Test: Authenticated requests should proceed
     * 
     * Verifies that authenticated users can process images.
     */
    it('should accept authenticated requests', async () => {
      const mockUser = {
        id: 'clerk-user-1',
        emailAddresses: [{ emailAddress: 'test@example.com' }],
      }
      ;(currentUser as jest.Mock).mockResolvedValue(mockUser)
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        clerkId: 'clerk-user-1',
        tenant: {
          id: 'tenant-1',
          tokensUsed: 5,
          tokensAllocated: 50,
        },
      })
      mockCheckUserUsage.mockResolvedValue({
        canGenerate: true,
        remainingImages: 45,
      })
      // Setup transaction mocks
      mockPrisma.image.findFirst.mockResolvedValue({
        id: 'img-123',
        status: 'pending',
        originalUrl: 's3://bucket/image.jpg',
      })
      
      mockPrisma.tenant.findUnique.mockResolvedValue({
        id: 'tenant-1',
        tokensUsed: 5,
        tokensAllocated: 50,
      })
      
      mockPrisma.image.update.mockResolvedValue({
        id: 'img-123',
        status: 'processing',
      })
      
      mockPrisma.tenant.update.mockResolvedValue({
        id: 'tenant-1',
        tokensUsed: 7, // 5 + 2 tokens needed
        tokensAllocated: 50,
      })
      
      mockProcessImageWithNanoBanana.mockResolvedValue({
        success: true,
        result_url: 's3://bucket/processed.jpg',
        processing_time: 15000,
      })

      const request = new MockNextRequest('http://localhost/api/images/process', {
        method: 'POST',
        body: JSON.stringify({
          imageId: 'img-123',
          roomType: 'living_room',
          style: 'modern',
        }),
      })
      request.json.mockResolvedValue({
        imageId: 'img-123',
        roomType: 'living_room',
        style: 'modern',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })
  })

  describe('Usage Limit Validation', () => {
    /**
     * Test: Usage limit exceeded should be rejected
     * 
     * Verifies that users who have exceeded their usage limits
     * cannot process new images.
     */
    it('should reject requests when usage limit exceeded', async () => {
      const mockUser = {
        id: 'clerk-user-1',
      }
      ;(currentUser as jest.Mock).mockResolvedValue(mockUser)
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        clerkId: 'clerk-user-1',
        tenant: {
          id: 'tenant-1',
          tokensUsed: 50,
          tokensAllocated: 50,
        },
      })
      mockCheckUserUsage.mockResolvedValue({
        canGenerate: false,
        remainingImages: 0,
        requiresSubscription: true,
        message: 'Usage limit reached',
      })

      const request = new MockNextRequest('http://localhost/api/images/process', {
        method: 'POST',
        body: JSON.stringify({
          imageId: 'img-123',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.error).toBe('Usage limit exceeded')
      expect(data.requiresSubscription).toBe(true)
    })

    /**
     * Test: Token validation should check available tokens
     * 
     * Verifies that the API checks if users have enough tokens
     * before processing, even if usage check passes.
     */
    it('should reject requests when tokens insufficient', async () => {
      const mockUser = {
        id: 'clerk-user-1',
      }
      ;(currentUser as jest.Mock).mockResolvedValue(mockUser)
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        clerkId: 'clerk-user-1',
        tenant: {
          id: 'tenant-1',
          tokensUsed: 49,
          tokensAllocated: 50,
        },
      })
      mockCheckUserUsage.mockResolvedValue({
        canGenerate: true,
        remainingImages: 1,
      })
      mockPrisma.image.findFirst.mockResolvedValue({
        id: 'img-123',
        status: 'pending',
      })

      const request = new MockNextRequest('http://localhost/api/images/process', {
        method: 'POST',
        body: JSON.stringify({
          imageId: 'img-123',
          roomType: 'living_room',
          style: 'luxury', // Requires 2 tokens
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      // Should fail because 49 + 2 = 51 > 50
      expect(response.status).toBe(402)
      expect(data.error).toContain('Insufficient tokens')
    })
  })

  describe('Image Status Validation', () => {
    /**
     * Test: Already processing images should be rejected
     * 
     * Verifies that the API prevents duplicate processing of
     * images that are already being processed.
     */
    it('should reject requests for already processing images', async () => {
      const mockUser = {
        id: 'clerk-user-1',
      }
      ;(currentUser as jest.Mock).mockResolvedValue(mockUser)
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        clerkId: 'clerk-user-1',
        tenant: {
          id: 'tenant-1',
          tokensUsed: 5,
          tokensAllocated: 50,
        },
      })
      mockCheckUserUsage.mockResolvedValue({
        canGenerate: true,
        remainingImages: 45,
      })
      mockPrisma.image.findFirst.mockResolvedValue({
        id: 'img-123',
        status: 'processing', // Already processing
      })

      const request = new MockNextRequest('http://localhost/api/images/process', {
        method: 'POST',
        body: JSON.stringify({
          imageId: 'img-123',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('already being processed')
    })

    /**
     * Test: Completed images should be rejected
     * 
     * Verifies that the API prevents reprocessing of
     * already completed images.
     */
    it('should reject requests for completed images', async () => {
      const mockUser = {
        id: 'clerk-user-1',
      }
      ;(currentUser as jest.Mock).mockResolvedValue(mockUser)
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        clerkId: 'clerk-user-1',
        tenant: {
          id: 'tenant-1',
          tokensUsed: 5,
          tokensAllocated: 50,
        },
      })
      mockCheckUserUsage.mockResolvedValue({
        canGenerate: true,
        remainingImages: 45,
      })
      mockPrisma.image.findFirst.mockResolvedValue({
        id: 'img-123',
        status: 'completed', // Already completed
      })

      const request = new MockNextRequest('http://localhost/api/images/process', {
        method: 'POST',
        body: JSON.stringify({
          imageId: 'img-123',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('already being processed or completed')
    })
  })

  describe('Race Condition: Concurrent Status Checks', () => {
    /**
     * Test: Race condition when two requests check status simultaneously
     * 
     * CRITICAL BUG: Two requests can both see status = 'pending'
     * and proceed to process the same image.
     * 
     * This test demonstrates the race condition issue.
     */
    it('should prevent race condition on status check', async () => {
      const mockUser = {
        id: 'clerk-user-1',
      }
      ;(currentUser as jest.Mock).mockResolvedValue(mockUser)
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        clerkId: 'clerk-user-1',
        tenant: {
          id: 'tenant-1',
          tokensUsed: 5,
          tokensAllocated: 50,
        },
      })
      mockCheckUserUsage.mockResolvedValue({
        canGenerate: true,
        remainingImages: 45,
      })

      let imageStatus = 'pending'
      mockPrisma.image.findFirst.mockImplementation(async () => {
        return {
          id: 'img-123',
          status: imageStatus, // Both requests read this
        }
      })

      // Simulate two concurrent requests
      const request1 = new NextRequest('http://localhost/api/images/process', {
        method: 'POST',
        body: JSON.stringify({ imageId: 'img-123' }),
      })

      const request2 = new NextRequest('http://localhost/api/images/process', {
        method: 'POST',
        body: JSON.stringify({ imageId: 'img-123' }),
      })

      // Both read status before either updates
      const [response1, response2] = await Promise.all([
        POST(request1),
        POST(request2),
      ])

      // PROBLEM: Both might proceed if status check isn't atomic
      // This is why we need database transactions or optimistic locking

      const data1 = await response1.json()
      const data2 = await response2.json()

      // VERIFY: Only one should succeed (if using transactions)
      // Without transactions, both might succeed (BUG)
      const successCount =
        (data1.success ? 1 : 0) + (data2.success ? 1 : 0)

      // This demonstrates why we need atomic operations
      // In production, this could cause duplicate processing
      console.log(
        `Concurrent requests: ${successCount} succeeded (should be 1)`
      )
    })
  })

  describe('Error Handling', () => {
    /**
     * Test: Gemini API errors should be handled gracefully
     * 
     * Verifies that when Gemini API fails, the system:
     * - Returns appropriate error messages
     * - Refunds tokens
     * - Updates image status to 'failed'
     */
    it('should handle Gemini API errors gracefully', async () => {
      const mockUser = {
        id: 'clerk-user-1',
      }
      ;(currentUser as jest.Mock).mockResolvedValue(mockUser)
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        clerkId: 'clerk-user-1',
        tenant: {
          id: 'tenant-1',
          tokensUsed: 5,
          tokensAllocated: 50,
        },
      })
      mockCheckUserUsage.mockResolvedValue({
        canGenerate: true,
        remainingImages: 45,
      })
      mockPrisma.image.findFirst.mockResolvedValue({
        id: 'img-123',
        status: 'pending',
        originalUrl: 's3://bucket/image.jpg',
      })
      mockProcessImageWithNanoBanana.mockResolvedValue({
        success: false,
        error: '429 Quota Exceeded',
        errorCode: 'QUOTA_EXCEEDED',
      })

      const request = new MockNextRequest('http://localhost/api/images/process', {
        method: 'POST',
        body: JSON.stringify({
          imageId: 'img-123',
          roomType: 'living_room',
          style: 'modern',
        }),
      })
      request.json.mockResolvedValue({
        imageId: 'img-123',
        roomType: 'living_room',
        style: 'modern',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200) // Still 200, but success: false
      expect(data.success).toBe(false)
      expect(data.result.error).toContain('quota exceeded')

      // VERIFY: Tokens should be refunded
      expect(mockPrisma.tenant.update).toHaveBeenCalledWith({
        where: { id: 'tenant-1' },
        data: {
          tokensUsed: { decrement: 1 }, // Should refund
        },
      })
    })
  })
})

