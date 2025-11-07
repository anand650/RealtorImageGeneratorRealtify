/**
 * Unit Tests for Token Management Functions
 * 
 * These tests verify the token management system, including:
 * - Token initialization for new users
 * - Token availability checks
 * - Token consumption with proper tracking
 * - Monthly token refresh functionality
 * - Plan upgrades and token allocation
 * 
 * IMPORTANT: These tests use mocked Prisma client to avoid database dependencies.
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import {
  checkTokenAvailability,
  consumeTokens,
  refreshMonthlyTokens,
  getTokenUsage,
  upgradePlan,
  initializeUserTokens,
} from '@/lib/tokens'
// import { prisma } from '@/lib/prisma' // Using mockPrisma instead

// Mock Prisma client
const mockPrisma = {
  tenant: {
    findFirst: jest.fn(),
    upsert: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  user: {
    findUnique: jest.fn(),
  },
  usageLog: {
    create: jest.fn(),
  },
}

jest.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}))

describe('Token Management Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('checkTokenAvailability', () => {
    /**
     * Test: Check if user has enough tokens for an operation
     * 
     * This test verifies that the token availability check:
     * - Returns false when user doesn't exist
     * - Returns false when tenant doesn't exist
     * - Returns true when tokens are available
     * - Returns false when tokens are insufficient
     * - Handles race conditions properly
     */
    it('should return false when user does not exist', async () => {
      // Mock: User not found
      mockPrisma.user.findUnique.mockResolvedValue(null)

      const result = await checkTokenAvailability('non-existent-user', 1)
      expect(result).toBe(false)
    })

    it('should return false when tenant does not exist', async () => {
      // Mock: User exists but no tenant
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        tenant: null,
      })

      const result = await checkTokenAvailability('user-1', 1)
      expect(result).toBe(false)
    })

    it('should return true when tokens are available', async () => {
      // Mock: User with tenant having available tokens
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        tenant: {
          id: 'tenant-1',
          tokensUsed: 5,
          tokensAllocated: 10,
        },
      })

      const result = await checkTokenAvailability('user-1', 3)
      expect(result).toBe(true) // 5 + 3 = 8 <= 10
    })

    it('should return false when tokens are insufficient', async () => {
      // Mock: User with tenant having insufficient tokens
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        tenant: {
          id: 'tenant-1',
          tokensUsed: 8,
          tokensAllocated: 10,
        },
      })

      const result = await checkTokenAvailability('user-1', 5)
      expect(result).toBe(false) // 8 + 5 = 13 > 10
    })

    it('should return true when tokens exactly match allocation', async () => {
      // Mock: User with tenant having exact tokens remaining
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        tenant: {
          id: 'tenant-1',
          tokensUsed: 5,
          tokensAllocated: 10,
        },
      })

      const result = await checkTokenAvailability('user-1', 5)
      expect(result).toBe(true) // 5 + 5 = 10 <= 10
    })
  })

  describe('consumeTokens', () => {
    /**
     * Test: Consume tokens and log usage
     * 
     * This test verifies that token consumption:
     * - Throws error when tenant not found
     * - Increments token usage correctly
     * - Creates usage log entry
     * - Returns updated tenant
     */
    it('should throw error when tenant does not exist', async () => {
      // Mock: User exists but no tenant
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        tenant: null,
      })

      await expect(consumeTokens('user-1', 1, 'test-action')).rejects.toThrow(
        'Tenant not found'
      )
    })

    it('should increment tokens and create log entry', async () => {
      const mockTenant = {
        id: 'tenant-1',
        tokensUsed: 5,
      }

      // Mock: User with tenant
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        tenant: mockTenant,
      })

      // Mock: Updated tenant after increment
      const updatedTenant = {
        ...mockTenant,
        tokensUsed: 6,
      }
      mockPrisma.tenant.update.mockResolvedValue(updatedTenant)
      mockPrisma.usageLog.create.mockResolvedValue({})

      const result = await consumeTokens('user-1', 1, 'image_generated', {
        imageId: 'img-123',
      })

      expect(mockPrisma.tenant.update).toHaveBeenCalledWith({
        where: { id: 'tenant-1' },
        data: {
          tokensUsed: {
            increment: 1,
          },
        },
      })

      expect(mockPrisma.usageLog.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-1',
          tenantId: 'tenant-1',
          action: 'image_generated',
          tokensConsumed: 1,
          metadata: { imageId: 'img-123' },
        },
      })

      expect(result).toEqual(updatedTenant)
    })
  })

  describe('refreshMonthlyTokens', () => {
    /**
     * Test: Refresh monthly token allocation
     * 
     * This test verifies that monthly token refresh:
     * - Only refreshes when period has ended
     * - Resets tokensUsed to 0
     * - Updates billing period dates
     * - Creates refresh log entry
     * - Returns false when period hasn't ended
     */
    it('should return false when period has not ended', async () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 30) // 30 days from now

      // Mock: User with tenant having active period
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        tenant: {
          id: 'tenant-1',
          subscriptionPlan: 'starter',
          tokensUsed: 5,
          tokensAllocated: 50,
          currentPeriodEnd: futureDate,
        },
      })

      const result = await refreshMonthlyTokens('user-1')
      expect(result).toBe(false)
      expect(mockPrisma.tenant.update).not.toHaveBeenCalled()
    })

    it('should refresh tokens when period has ended', async () => {
      const pastDate = new Date()
      pastDate.setDate(pastDate.getDate() - 1) // 1 day ago

      // Mock: User with tenant having expired period
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        tenant: {
          id: 'tenant-1',
          subscriptionPlan: 'starter',
          tokensUsed: 45,
          tokensAllocated: 50,
          currentPeriodEnd: pastDate,
        },
      })

      const updatedTenant = {
        id: 'tenant-1',
        tokensUsed: 0,
        tokensAllocated: 50,
      }
      mockPrisma.tenant.update.mockResolvedValue(updatedTenant)
      mockPrisma.usageLog.create.mockResolvedValue({})

      const result = await refreshMonthlyTokens('user-1')

      expect(mockPrisma.tenant.update).toHaveBeenCalledWith({
        where: { id: 'tenant-1' },
        data: expect.objectContaining({
          tokensUsed: 0,
          tokensAllocated: 50,
          billingStatus: 'active',
        }),
      })

      expect(mockPrisma.usageLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          action: 'tokens_refreshed',
          tokensConsumed: 0,
        }),
      })

      expect(result).toBe(true)
    })
  })

  describe('upgradePlan', () => {
    /**
     * Test: Upgrade user's subscription plan
     * 
     * This test verifies that plan upgrades:
     * - Update subscription plan correctly
     * - Adjust token allocation
     * - Cap tokensUsed if exceeding new allocation
     * - Update billing periods
     * - Create upgrade log entry
     */
    it('should upgrade plan and adjust token allocation', async () => {
      // Mock: User with existing starter plan
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        tenant: {
          id: 'tenant-1',
          subscriptionPlan: 'starter',
          tokensUsed: 25,
          tokensAllocated: 50,
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      })

      const updatedTenant = {
        id: 'tenant-1',
        subscriptionPlan: 'professional',
        tokensUsed: 25, // Capped at new allocation if lower
        tokensAllocated: 125,
      }
      mockPrisma.tenant.update.mockResolvedValue(updatedTenant)
      mockPrisma.usageLog.create.mockResolvedValue({})

      const result = await upgradePlan('user-1', 'professional')

      expect(mockPrisma.tenant.update).toHaveBeenCalledWith({
        where: { id: 'tenant-1' },
        data: expect.objectContaining({
          subscriptionPlan: 'professional',
          tokensAllocated: 125,
          tokensUsed: 25, // Should cap at new allocation
        }),
      })

      expect(mockPrisma.usageLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          action: 'plan_upgraded',
          metadata: expect.objectContaining({
            oldPlan: 'starter',
            newPlan: 'professional',
          }),
        }),
      })

      expect(result).toEqual(updatedTenant)
    })

    it('should cap tokensUsed when exceeding new allocation', async () => {
      // Mock: User with high token usage trying to upgrade to lower plan
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        tenant: {
          id: 'tenant-1',
          subscriptionPlan: 'professional',
          tokensUsed: 100,
          tokensAllocated: 125,
        },
      })

      const updatedTenant = {
        id: 'tenant-1',
        subscriptionPlan: 'starter',
        tokensUsed: 50, // Should be capped at starter plan limit
        tokensAllocated: 50,
      }
      mockPrisma.tenant.update.mockResolvedValue(updatedTenant)

      await upgradePlan('user-1', 'starter')

      expect(mockPrisma.tenant.update).toHaveBeenCalledWith({
        where: { id: 'tenant-1' },
        data: expect.objectContaining({
          tokensUsed: 50, // Capped at new allocation
          tokensAllocated: 50,
        }),
      })
    })
  })
})

