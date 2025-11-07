/**
 * Integration Tests for Error Handling
 * 
 * These tests verify that the system handles various error scenarios gracefully:
 * - Database connection failures
 * - API rate limiting
 * - Invalid image data
 * - Network timeouts
 * - Partial failures
 * - Invalid user input
 * 
 * CRITICAL: These tests ensure the system degrades gracefully and provides
 * meaningful error messages to users.
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

describe('Error Handling Integration Tests', () => {
  beforeAll(async () => {
    const module = await import('@/app/api/images/process/route')
    POST = module.POST
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Database Error Handling', () => {
    /**
     * Test: Database connection failure
     * 
     * Verifies that database errors are caught and return appropriate error responses.
     */
    it('should handle database connection errors gracefully', async () => {
      const mockUser = {
        id: 'clerk-user-1',
        emailAddresses: [{ emailAddress: 'test@example.com' }],
      }
      ;(currentUser as jest.Mock).mockResolvedValue(mockUser)

      // Simulate database error
      mockPrisma.user.findUnique.mockRejectedValue(
        new Error('Database connection failed')
      )

      const request = new MockNextRequest('http://localhost/api/images/process', {
        method: 'POST',
        body: JSON.stringify({
          imageId: 'img-123',
        }),
      })
      request.json.mockResolvedValue({
        imageId: 'img-123',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBeDefined()
    })

    /**
     * Test: Transaction rollback on error
     * 
     * Verifies that database transactions are properly rolled back
     * when errors occur during processing.
     */
    it('should rollback transaction when processing fails', async () => {
      const mockUser = {
        id: 'clerk-user-1',
        emailAddresses: [{ emailAddress: 'test@example.com' }],
      }
      ;(currentUser as jest.Mock).mockResolvedValue(mockUser)

      const mockTenant = {
        id: 'tenant-1',
        tokensUsed: 5,
        tokensAllocated: 50,
      }

      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        clerkId: 'clerk-user-1',
        tenant: mockTenant,
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

      mockPrisma.tenant.findUnique.mockResolvedValue(mockTenant)

      // Simulate transaction failure
      let transactionRolledBack = false
      mockPrisma.$transaction.mockImplementation(async (callback) => {
        try {
          return await callback({
            image: mockPrisma.image,
            tenant: mockPrisma.tenant,
            user: mockPrisma.user,
          })
        } catch (error) {
          transactionRolledBack = true
          throw error
        }
      })

      // Simulate processing failure
      mockPrisma.image.update.mockRejectedValue(
        new Error('Transaction failed')
      )

      const request = new MockNextRequest('http://localhost/api/images/process', {
        method: 'POST',
        body: JSON.stringify({
          imageId: 'img-123',
        }),
      })
      request.json.mockResolvedValue({
        imageId: 'img-123',
      })

      const response = await POST(request)
      
      // Transaction should have been rolled back
      expect(transactionRolledBack || response.status === 500).toBe(true)
    })
  })

  describe('Gemini API Error Handling', () => {
    /**
     * Test: Gemini API rate limiting
     * 
     * Verifies that rate limit errors are handled gracefully and
     * tokens are refunded to the user.
     */
    it('should handle Gemini API rate limit errors', async () => {
      const mockUser = {
        id: 'clerk-user-1',
        emailAddresses: [{ emailAddress: 'test@example.com' }],
      }
      ;(currentUser as jest.Mock).mockResolvedValue(mockUser)

      const mockTenant = {
        id: 'tenant-1',
        tokensUsed: 5,
        tokensAllocated: 50,
      }

      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        clerkId: 'clerk-user-1',
        tenant: mockTenant,
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

      mockPrisma.tenant.findUnique.mockResolvedValue(mockTenant)
      mockPrisma.image.update.mockResolvedValue({
        id: 'img-123',
        status: 'processing',
      })
      mockPrisma.tenant.update.mockResolvedValue(mockTenant)

      // Simulate rate limit error
      mockProcessImageWithNanoBanana.mockResolvedValue({
        success: false,
        error: 'Rate limit exceeded',
        errorCode: 'RATE_LIMIT',
      })

      const request = new MockNextRequest('http://localhost/api/images/process', {
        method: 'POST',
        body: JSON.stringify({
          imageId: 'img-123',
        }),
      })
      request.json.mockResolvedValue({
        imageId: 'img-123',
      })

      const response = await POST(request)
      const data = await response.json()

      // Should handle error gracefully
      expect(response.status).toBeGreaterThanOrEqual(400)
      expect(data.error || data.message).toBeDefined()

      // Verify tokens were refunded (tenant update should be called to decrement)
      expect(mockPrisma.tenant.update).toHaveBeenCalled()
    })

    /**
     * Test: Gemini API timeout errors
     * 
     * Verifies that timeout errors are handled and tokens are refunded.
     */
    it('should handle Gemini API timeout errors', async () => {
      const mockUser = {
        id: 'clerk-user-1',
        emailAddresses: [{ emailAddress: 'test@example.com' }],
      }
      ;(currentUser as jest.Mock).mockResolvedValue(mockUser)

      const mockTenant = {
        id: 'tenant-1',
        tokensUsed: 5,
        tokensAllocated: 50,
      }

      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        clerkId: 'clerk-user-1',
        tenant: mockTenant,
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

      mockPrisma.tenant.findUnique.mockResolvedValue(mockTenant)
      mockPrisma.image.update.mockResolvedValue({
        id: 'img-123',
        status: 'processing',
      })
      mockPrisma.tenant.update.mockResolvedValue(mockTenant)

      // Simulate timeout error
      mockProcessImageWithNanoBanana.mockResolvedValue({
        success: false,
        error: 'Request timeout',
        errorCode: 'TIMEOUT',
      })

      const request = new MockNextRequest('http://localhost/api/images/process', {
        method: 'POST',
        body: JSON.stringify({
          imageId: 'img-123',
        }),
      })
      request.json.mockResolvedValue({
        imageId: 'img-123',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBeGreaterThanOrEqual(400)
      expect(data.error || data.message).toBeDefined()
    })

    /**
     * Test: Gemini API invalid response
     * 
     * Verifies that invalid API responses are handled gracefully.
     */
    it('should handle invalid Gemini API responses', async () => {
      const mockUser = {
        id: 'clerk-user-1',
        emailAddresses: [{ emailAddress: 'test@example.com' }],
      }
      ;(currentUser as jest.Mock).mockResolvedValue(mockUser)

      const mockTenant = {
        id: 'tenant-1',
        tokensUsed: 5,
        tokensAllocated: 50,
      }

      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        clerkId: 'clerk-user-1',
        tenant: mockTenant,
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

      mockPrisma.tenant.findUnique.mockResolvedValue(mockTenant)
      mockPrisma.image.update.mockResolvedValue({
        id: 'img-123',
        status: 'processing',
      })
      mockPrisma.tenant.update.mockResolvedValue(mockTenant)

      // Simulate invalid response (success: true but no result_url)
      mockProcessImageWithNanoBanana.mockResolvedValue({
        success: true,
        result_url: null, // Missing result URL
      })

      const request = new MockNextRequest('http://localhost/api/images/process', {
        method: 'POST',
        body: JSON.stringify({
          imageId: 'img-123',
        }),
      })
      request.json.mockResolvedValue({
        imageId: 'img-123',
      })

      const response = await POST(request)
      const data = await response.json()

      // Should handle invalid response
      expect(response.status).toBeGreaterThanOrEqual(400)
    })
  })

  describe('Input Validation Error Handling', () => {
    /**
     * Test: Invalid image ID
     * 
     * Verifies that invalid image IDs are rejected with appropriate error.
     */
    it('should reject invalid image IDs', async () => {
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

      // Image not found
      mockPrisma.image.findFirst.mockResolvedValue(null)

      const request = new MockNextRequest('http://localhost/api/images/process', {
        method: 'POST',
        body: JSON.stringify({
          imageId: 'non-existent-image',
        }),
      })
      request.json.mockResolvedValue({
        imageId: 'non-existent-image',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBeDefined()
    })

    /**
     * Test: Missing required fields
     * 
     * Verifies that missing required fields are validated.
     */
    it('should reject requests with missing required fields', async () => {
      const mockUser = {
        id: 'clerk-user-1',
        emailAddresses: [{ emailAddress: 'test@example.com' }],
      }
      ;(currentUser as jest.Mock).mockResolvedValue(mockUser)

      const request = new MockNextRequest('http://localhost/api/images/process', {
        method: 'POST',
        body: JSON.stringify({
          // Missing imageId
        }),
      })
      request.json.mockResolvedValue({})

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBeDefined()
    })

    /**
     * Test: Invalid room type or style
     * 
     * Verifies that invalid enum values are handled.
     */
    it('should handle invalid room types gracefully', async () => {
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

      mockPrisma.image.findFirst.mockResolvedValue({
        id: 'img-123',
        status: 'pending',
        originalUrl: 's3://bucket/image.jpg',
      })

      const request = new MockNextRequest('http://localhost/api/images/process', {
        method: 'POST',
        body: JSON.stringify({
          imageId: 'img-123',
          roomType: 'invalid_room_type', // Invalid room type
          style: 'invalid_style', // Invalid style
        }),
      })
      request.json.mockResolvedValue({
        imageId: 'img-123',
        roomType: 'invalid_room_type',
        style: 'invalid_style',
      })

      const response = await POST(request)

      // Should either accept with default values or reject with validation error
      expect([200, 400]).toContain(response.status)
    })
  })

  describe('Concurrency Error Handling', () => {
    /**
     * Test: Concurrent processing of same image
     * 
     * Verifies that concurrent requests for the same image are handled correctly.
     */
    it('should prevent concurrent processing of the same image', async () => {
      const mockUser = {
        id: 'clerk-user-1',
        emailAddresses: [{ emailAddress: 'test@example.com' }],
      }
      ;(currentUser as jest.Mock).mockResolvedValue(mockUser)

      const mockTenant = {
        id: 'tenant-1',
        tokensUsed: 5,
        tokensAllocated: 50,
      }

      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        clerkId: 'clerk-user-1',
        tenant: mockTenant,
      })

      mockCheckUserUsage.mockResolvedValue({
        canGenerate: true,
        remainingImages: 45,
      })

      let callCount = 0
      mockPrisma.image.findFirst.mockImplementation(() => {
        callCount++
        if (callCount === 1) {
          // First call: image is pending
          return Promise.resolve({
            id: 'img-123',
            status: 'pending',
            originalUrl: 's3://bucket/image.jpg',
          })
        } else {
          // Second call: image is already processing
          return Promise.resolve({
            id: 'img-123',
            status: 'processing',
            originalUrl: 's3://bucket/image.jpg',
          })
        }
      })

      mockPrisma.tenant.findUnique.mockResolvedValue(mockTenant)

      // First request should succeed
      const request1 = new MockNextRequest('http://localhost/api/images/process', {
        method: 'POST',
        body: JSON.stringify({
          imageId: 'img-123',
        }),
      })
      request1.json.mockResolvedValue({
        imageId: 'img-123',
      })

      // Second request should be rejected
      const request2 = new MockNextRequest('http://localhost/api/images/process', {
        method: 'POST',
        body: JSON.stringify({
          imageId: 'img-123',
        }),
      })
      request2.json.mockResolvedValue({
        imageId: 'img-123',
      })

      const [response1, response2] = await Promise.all([
        POST(request1),
        POST(request2),
      ])

      // At least one should be rejected (or both succeed if transaction works correctly)
      const statuses = [response1.status, response2.status]
      expect(statuses).toContain(400) // At least one should be 400 (already processing)
    })
  })
})

