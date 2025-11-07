/**
 * Integration Tests for Free Credits System
 * 
 * These tests verify that new users automatically receive 4 free credits:
 * - New users get 4 credits on signup
 * - Credits are properly tracked
 * - Usage counts against free credits correctly
 * - UI displays remaining credits
 * - Credits are exhausted correctly
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import { ensureAppUser } from '@/lib/userSync'
import { checkUserUsage, recordUserUsage } from '@/lib/usage-tracking'

// Mock Prisma client
const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  tenant: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    upsert: jest.fn(),
    update: jest.fn(),
  },
  usageLog: {
    create: jest.fn(),
  },
}

jest.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}))

describe('Free Credits System Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('New User Signup', () => {
    /**
     * Test: New users get 4 free credits automatically
     * 
     * Verifies that when a new user signs up, they automatically
     * receive 4 free credits to try the product.
     */
    it('should grant 4 free credits to new users on signup', async () => {
      const mockClerkUser = {
        id: 'clerk-user-123',
        emailAddresses: [{ emailAddress: 'newuser@example.com' }],
        firstName: 'New',
        lastName: 'User',
        imageUrl: 'https://example.com/avatar.jpg',
      }

      // Mock: User doesn't exist yet
      mockPrisma.user.findUnique.mockResolvedValue(null)

      // Mock: User creation
      const mockUser = {
        id: 'user-123',
        clerkId: 'clerk-user-123',
        email: 'newuser@example.com',
        freeImagesLimit: 4,
        freeImagesUsed: 0,
        tenantId: 'tenant-123',
        tenant: null,
        role: 'MEMBER',
      }
      mockPrisma.user.create.mockResolvedValue(mockUser)

      // Mock: Tenant creation with 4 free credits
      const mockTenant = {
        id: 'tenant-123',
        name: 'Personal Account',
        slug: 'user-user-123',
        tokensAllocated: 4, // 4 free credits
        tokensUsed: 0,
        subscriptionPlan: 'free',
        billingStatus: 'inactive',
        currentPeriodStart: null,
        currentPeriodEnd: null,
      }
      mockPrisma.tenant.upsert.mockResolvedValue(mockTenant)

      // Mock: User update with tenant connection
      const updatedUser = {
        ...mockUser,
        tenant: mockTenant,
        role: 'OWNER',
      }
      mockPrisma.user.update.mockResolvedValue(updatedUser)

      const result = await ensureAppUser(mockClerkUser as any)

      expect(result.meta.userCreated).toBe(true)
      expect(result.meta.tenantCreated).toBe(true)
      expect(result.tenant?.tokensAllocated).toBe(4)
      expect(result.tenant?.tokensUsed).toBe(0)
      expect(result.tenant?.subscriptionPlan).toBe('free')
    })

    /**
     * Test: Free credits are tracked correctly
     * 
     * Verifies that free credits are properly tracked in the tenant.
     */
    it('should track free credits in tenant tokens', async () => {
      const mockUser = {
        id: 'user-123',
        freeImagesLimit: 4,
        freeImagesUsed: 0,
        tenant: {
          id: 'tenant-123',
          tokensAllocated: 4,
          tokensUsed: 0,
          subscriptionPlan: 'free',
          subscriptions: [],
        },
      }

      mockPrisma.user.findUnique.mockResolvedValue(mockUser)

      const usage = await checkUserUsage('user-123')

      expect(usage.canGenerate).toBe(true)
      expect(usage.remainingImages).toBe(4)
      expect(usage.requiresSubscription).toBe(false)
    })
  })

  describe('Free Credits Usage', () => {
    /**
     * Test: Using free credits decrements correctly
     * 
     * Verifies that when a user generates an image, their free credits
     * are decremented correctly.
     */
    it('should decrement free credits when image is generated', async () => {
      const mockUser = {
        id: 'user-123',
        tenantId: 'tenant-123',
        tenant: {
          id: 'tenant-123',
          tokensAllocated: 4,
          tokensUsed: 0,
          subscriptionPlan: 'free',
          subscriptions: [],
        },
      }

      mockPrisma.user.findUnique.mockResolvedValue(mockUser)
      mockPrisma.tenant.update.mockResolvedValue({
        ...mockUser.tenant,
        tokensUsed: 1,
      })
      mockPrisma.usageLog.create.mockResolvedValue({})

      await recordUserUsage('user-123')

      expect(mockPrisma.tenant.update).toHaveBeenCalledWith({
        where: { id: 'tenant-123' },
        data: {
          tokensUsed: { increment: 1 },
        },
      })

      // Verify remaining credits
      const updatedUser = {
        ...mockUser,
        tenant: {
          ...mockUser.tenant,
          tokensUsed: 1,
        },
      }
      mockPrisma.user.findUnique.mockResolvedValue(updatedUser)

      const usage = await checkUserUsage('user-123')
      expect(usage.remainingImages).toBe(3) // 4 - 1 = 3
    })

    /**
     * Test: Credits exhausted correctly
     * 
     * Verifies that when all 4 free credits are used, the user
     * cannot generate more images without subscribing.
     */
    it('should prevent image generation when free credits are exhausted', async () => {
      const mockUser = {
        id: 'user-123',
        tenant: {
          id: 'tenant-123',
          tokensAllocated: 4,
          tokensUsed: 4, // All credits used
          subscriptionPlan: 'free',
          subscriptions: [],
        },
      }

      mockPrisma.user.findUnique.mockResolvedValue(mockUser)

      const usage = await checkUserUsage('user-123')

      expect(usage.canGenerate).toBe(false)
      expect(usage.remainingImages).toBe(0)
      expect(usage.requiresSubscription).toBe(true)
      expect(usage.message).toContain('used all 4 free credits')
    })
  })

  describe('Free Credits Display', () => {
    /**
     * Test: Remaining credits calculation
     * 
     * Verifies that the system correctly calculates remaining credits
     * for display in the UI.
     */
    it('should calculate remaining credits correctly', async () => {
      const mockUser = {
        id: 'user-123',
        tenant: {
          id: 'tenant-123',
          tokensAllocated: 4,
          tokensUsed: 2, // 2 credits used
          subscriptionPlan: 'free',
          subscriptions: [],
        },
      }

      mockPrisma.user.findUnique.mockResolvedValue(mockUser)

      const usage = await checkUserUsage('user-123')

      expect(usage.remainingImages).toBe(2) // 4 - 2 = 2
      expect(usage.canGenerate).toBe(true)
    })
  })
})

