/**
 * Unit Tests for Usage Tracking Functions
 * 
 * These tests verify the usage tracking system for both authenticated
 * and anonymous users. This is critical for preventing abuse and ensuring
 * fair usage limits.
 * 
 * Key scenarios tested:
 * - Anonymous user limits (2 free images total, 2 per day)
 * - Authenticated user free tier limits (4 free images)
 * - Subscription-based limits
 * - Daily usage tracking
 * - Usage recording and logging
 */

import { describe, it, expect, beforeEach, jest, beforeAll } from '@jest/globals'
// Import after mocks are set up
import {
  checkAnonymousUsage,
  checkUserUsage,
  recordAnonymousUsage,
  recordUserUsage,
  getClientIp,
} from '@/lib/usage-tracking'
import { headers } from 'next/headers'

// Mock next/headers
const mockHeaders = jest.fn()
jest.mock('next/headers', () => ({
  headers: () => mockHeaders(),
}))

// Mock Prisma client - must be defined before any imports
const mockPrisma = {
  ipUsageTracking: {
    findUnique: jest.fn(),
    create: jest.fn(),
    upsert: jest.fn(),
  },
  user: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  tenant: {
    update: jest.fn(),
  },
  usageLog: {
    create: jest.fn(),
  },
}

// Mock must be hoisted before the module imports prisma
jest.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}), { virtual: false })

describe('Usage Tracking Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getClientIp', () => {
    /**
     * Test: Extract client IP address from request headers
     * 
     * This test verifies that IP extraction:
     * - Prioritizes x-forwarded-for header
     * - Falls back to x-real-ip header
     * - Returns localhost for development
     * - Handles multiple IPs in x-forwarded-for
     */
    it('should extract IP from x-forwarded-for header', async () => {
      mockHeaders.mockResolvedValue({
        get: (key: string) => {
          if (key === 'x-forwarded-for') return '192.168.1.1, 10.0.0.1'
          if (key === 'x-real-ip') return '172.16.0.1'
          return null
        },
      })

      const ip = await getClientIp()
      expect(ip).toBe('192.168.1.1') // Should take first IP
    })

    it('should fall back to x-real-ip header', async () => {
      mockHeaders.mockResolvedValue({
        get: (key: string) => {
          if (key === 'x-real-ip') return '172.16.0.1'
          return null
        },
      })

      const ip = await getClientIp()
      expect(ip).toBe('172.16.0.1')
    })

    it('should return localhost for development', async () => {
      mockHeaders.mockResolvedValue({
        get: () => null,
      })

      const ip = await getClientIp()
      expect(ip).toBe('127.0.0.1')
    })
  })

  describe('checkAnonymousUsage', () => {
    /**
     * Test: Check anonymous user usage limits
     * 
     * Anonymous users get:
     * - 2 free images total (lifetime)
     * - 2 images per day (rate limiting)
     * 
     * This test verifies:
     * - Users can generate 2 images total
     * - Daily limit prevents abuse
     * - Proper error messages for limit exceeded
     * - New IP addresses get fresh limits
     */
    it('should allow generation when within limits', async () => {
      const today = new Date().toISOString().split('T')[0]
      mockPrisma.ipUsageTracking.findUnique.mockResolvedValue({
        ipAddress: '192.168.1.1',
        imagesGenerated: 1,
        dailyUsage: { [today]: 1 },
      })

      const result = await checkAnonymousUsage('192.168.1.1')

      expect(result.canGenerate).toBe(true)
      expect(result.remainingImages).toBe(1) // 2 total - 1 used = 1 remaining
      expect(result.isAnonymous).toBe(true)
      expect(result.requiresSignup).toBe(false)
    })

    it('should block when total limit reached', async () => {
      const today = new Date().toISOString().split('T')[0]
      mockPrisma.ipUsageTracking.findUnique.mockResolvedValue({
        ipAddress: '192.168.1.1',
        imagesGenerated: 2, // Reached total limit
        dailyUsage: { [today]: 2 },
      })

      const result = await checkAnonymousUsage('192.168.1.1')

      expect(result.canGenerate).toBe(false)
      expect(result.remainingImages).toBe(0)
      expect(result.requiresSignup).toBe(true) // Should prompt signup
      expect(result.message).toContain('2 free images')
    })

    it('should block when daily limit reached', async () => {
      const today = new Date().toISOString().split('T')[0]
      mockPrisma.ipUsageTracking.findUnique.mockResolvedValue({
        ipAddress: '192.168.1.1',
        imagesGenerated: 1,
        dailyUsage: { [today]: 2 }, // Daily limit reached
      })

      const result = await checkAnonymousUsage('192.168.1.1')

      expect(result.canGenerate).toBe(false)
      expect(result.message).toContain('Daily limit reached')
    })

    it('should create new record for new IP', async () => {
      mockPrisma.ipUsageTracking.findUnique.mockResolvedValue(null)
      mockPrisma.ipUsageTracking.create.mockResolvedValue({
        ipAddress: '192.168.1.2',
        imagesGenerated: 0,
        dailyUsage: {},
      })

      const result = await checkAnonymousUsage('192.168.1.2')

      expect(mockPrisma.ipUsageTracking.create).toHaveBeenCalled()
      expect(result.canGenerate).toBe(true)
      expect(result.remainingImages).toBe(2)
    })

    it('should handle errors gracefully', async () => {
      mockPrisma.ipUsageTracking.findUnique.mockRejectedValue(
        new Error('Database error')
      )

      const result = await checkAnonymousUsage('192.168.1.1')

      expect(result.canGenerate).toBe(false)
      expect(result.message).toContain('Unable to verify')
    })
  })

  describe('checkUserUsage', () => {
    /**
     * Test: Check authenticated user usage limits
     * 
     * Authenticated users get:
     * - 4 free images (free tier)
     * - Unlimited images with subscription (based on plan)
     * 
     * This test verifies:
     * - Free tier limits are enforced
     * - Subscription limits are checked correctly
     * - Users with active subscriptions bypass free tier
     * - Proper error messages for each scenario
     */
    it('should allow generation for free tier user within limit', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        freeImagesLimit: 4,
        freeImagesUsed: 2,
        tenant: {
          id: 'tenant-1',
          subscriptions: [], // No active subscription
        },
      })

      const result = await checkUserUsage('user-1')

      expect(result.canGenerate).toBe(true)
      expect(result.remainingImages).toBe(2) // 4 - 2 = 2
      expect(result.requiresSubscription).toBe(false)
    })

    it('should block free tier user when limit reached', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        freeImagesLimit: 4,
        freeImagesUsed: 4, // All used
        tenant: {
          id: 'tenant-1',
          subscriptions: [],
        },
      })

      const result = await checkUserUsage('user-1')

      expect(result.canGenerate).toBe(false)
      expect(result.remainingImages).toBe(0)
      expect(result.requiresSubscription).toBe(true)
      expect(result.message).toContain('Subscribe to continue')
    })

    it('should check subscription limits when user has active subscription', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        freeImagesLimit: 4,
        freeImagesUsed: 4,
        tenant: {
          id: 'tenant-1',
          tokensUsed: 25,
          tokensAllocated: 50,
          subscriptions: [
            {
              id: 'sub-1',
              status: 'active',
            },
          ],
        },
      })

      const result = await checkUserUsage('user-1')

      // Should use subscription limits, not free tier
      expect(result.canGenerate).toBe(true)
      expect(result.remainingImages).toBe(25) // 50 - 25 = 25
      expect(result.requiresSubscription).toBe(false)
    })

    it('should block subscription user when tokens exhausted', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        freeImagesLimit: 4,
        freeImagesUsed: 4,
        tenant: {
          id: 'tenant-1',
          tokensUsed: 50,
          tokensAllocated: 50, // All tokens used
          subscriptions: [
            {
              id: 'sub-1',
              status: 'active',
            },
          ],
        },
      })

      const result = await checkUserUsage('user-1')

      expect(result.canGenerate).toBe(false)
      expect(result.remainingImages).toBe(0)
      expect(result.message).toContain('limit reached')
    })

    it('should return error when user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null)

      const result = await checkUserUsage('non-existent-user')

      expect(result.canGenerate).toBe(false)
      expect(result.message).toContain('User not found')
    })

    it('should handle database errors gracefully', async () => {
      mockPrisma.user.findUnique.mockRejectedValue(
        new Error('Database error')
      )

      const result = await checkUserUsage('user-1')

      expect(result.canGenerate).toBe(false)
      expect(result.message).toContain('Unable to verify')
    })
  })

  describe('recordAnonymousUsage', () => {
    /**
     * Test: Record anonymous user usage
     * 
     * This test verifies that usage recording:
     * - Increments total images generated
     * - Updates daily usage count
     * - Creates new record if doesn't exist
     * - Updates existing record if exists
     * - Handles errors gracefully
     */
    it('should create new record for new IP', async () => {
      const today = new Date().toISOString().split('T')[0]
      mockPrisma.ipUsageTracking.findUnique.mockResolvedValue(null)
      mockPrisma.ipUsageTracking.upsert.mockResolvedValue({})

      await recordAnonymousUsage('192.168.1.1')

      expect(mockPrisma.ipUsageTracking.upsert).toHaveBeenCalledWith({
        where: { ipAddress: '192.168.1.1' },
        create: {
          ipAddress: '192.168.1.1',
          imagesGenerated: 1,
          dailyUsage: { [today]: 1 },
        },
        update: expect.any(Object),
      })
    })

    it('should update existing record with increment', async () => {
      const today = new Date().toISOString().split('T')[0]
      const existingUsage = {
        ipAddress: '192.168.1.1',
        imagesGenerated: 1,
        dailyUsage: { [today]: 1 },
      }
      mockPrisma.ipUsageTracking.findUnique.mockResolvedValue(
        existingUsage
      )
      mockPrisma.ipUsageTracking.upsert.mockResolvedValue({})

      await recordAnonymousUsage('192.168.1.1')

      expect(mockPrisma.ipUsageTracking.upsert).toHaveBeenCalledWith({
        where: { ipAddress: '192.168.1.1' },
        update: {
          imagesGenerated: { increment: 1 },
          lastUsedAt: expect.any(Date),
          dailyUsage: {
            ...existingUsage.dailyUsage,
            [today]: 2, // Incremented
          },
        },
        create: expect.any(Object),
      })
    })

    it('should handle errors gracefully', async () => {
      mockPrisma.ipUsageTracking.findUnique.mockRejectedValue(
        new Error('Database error')
      )

      // Should not throw
      await expect(recordAnonymousUsage('192.168.1.1')).resolves.not.toThrow()
    })
  })

  describe('recordUserUsage', () => {
    /**
     * Test: Record authenticated user usage
     * 
     * This test verifies that user usage recording:
     * - Uses subscription tokens if user has active subscription
     * - Uses free tier count if no subscription
     * - Creates usage log entry
     * - Handles errors gracefully
     */
    it('should increment tenant tokens when user has subscription', async () => {
      // Mock the findUnique with proper structure including subscriptions
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        tenantId: 'tenant-1',
        tenant: {
          id: 'tenant-1',
          subscriptions: [
            {
              id: 'sub-1',
              status: 'active',
              createdAt: new Date(),
            },
          ],
        },
      } as any)
      mockPrisma.tenant.update.mockResolvedValue({ id: 'tenant-1', tokensUsed: 1 } as any)
      mockPrisma.usageLog.create.mockResolvedValue({} as any)

      await recordUserUsage('user-1')

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        include: {
          tenant: {
            include: {
              subscriptions: {
                where: { status: 'active' },
                orderBy: { createdAt: 'desc' },
                take: 1,
              },
            },
          },
        },
      })

      expect(mockPrisma.tenant.update).toHaveBeenCalledWith({
        where: { id: 'tenant-1' },
        data: {
          tokensUsed: { increment: 1 },
        },
      })

      expect(mockPrisma.usageLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: 'user-1',
          tenantId: 'tenant-1',
          action: 'image_generated',
          tokensConsumed: 1,
        }),
      })
    })

    it('should increment free images when user has no subscription', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        tenantId: 'tenant-1',
        tenant: {
          id: 'tenant-1',
          subscriptions: [], // No subscription
        },
      } as any)
      mockPrisma.user.update.mockResolvedValue({ id: 'user-1', freeImagesUsed: 1 } as any)
      mockPrisma.usageLog.create.mockResolvedValue({} as any)

      await recordUserUsage('user-1')

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        include: {
          tenant: {
            include: {
              subscriptions: {
                where: { status: 'active' },
                orderBy: { createdAt: 'desc' },
                take: 1,
              },
            },
          },
        },
      })

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: {
          freeImagesUsed: { increment: 1 },
        },
      })
    })

    it('should handle errors gracefully', async () => {
      mockPrisma.user.findUnique.mockRejectedValue(
        new Error('Database error')
      )

      await expect(recordUserUsage('user-1')).resolves.not.toThrow()
    })
  })
})

