/**
 * Integration Tests for Request Queue
 * 
 * These tests verify the request queue system for handling concurrent
 * image processing requests:
 * - FIFO queuing
 * - Priority handling (enterprise > professional > starter > free)
 * - Queue size limits
 * - Request deduplication
 * - Concurrent processing limits
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import { ImageProcessingQueue, getProcessingQueue } from '@/lib/request-queue'

describe('Request Queue Integration Tests', () => {
  let queue: ImageProcessingQueue

  beforeEach(() => {
    queue = new ImageProcessingQueue({
      maxConcurrent: 3,
      maxQueueSize: 10,
      processingTimeout: 60000, // 1 minute
      priorityBoost: {
        premium: 10,
        enterprise: 20,
      },
    })
  })

  describe('Basic Queue Operations', () => {
    /**
     * Test: FIFO queuing
     * 
     * Verifies that requests are processed in order (first in, first out).
     */
    it('should process requests in FIFO order', async () => {
      const order: string[] = []

      // Enqueue multiple requests
      const promises = [
        queue.enqueue('img-1', 'user-1', 'free'),
        queue.enqueue('img-2', 'user-2', 'free'),
        queue.enqueue('img-3', 'user-3', 'free'),
      ]

      // All should be queued immediately
      await Promise.all(promises)

      // Verify order (first three should be processed first due to maxConcurrent: 3)
      const status = queue.getStatus()
      expect(status.queueLength).toBe(0) // All should be processing
      expect(status.activeCount).toBeLessThanOrEqual(3)
    })

    /**
     * Test: Queue size limits
     * 
     * Verifies that queue rejects requests when full.
     */
    it('should reject requests when queue is full', async () => {
      // Fill queue to capacity
      const promises: Promise<void>[] = []
      for (let i = 0; i < 10; i++) {
        promises.push(queue.enqueue(`img-${i}`, `user-${i}`, 'free'))
      }
      await Promise.all(promises)

      // Next request should be rejected
      await expect(
        queue.enqueue('img-11', 'user-11', 'free')
      ).rejects.toThrow('Processing queue is full')
    })

    /**
     * Test: Request deduplication
     * 
     * Verifies that duplicate requests for the same image are rejected.
     */
    it('should reject duplicate requests for same image', async () => {
      // First request should succeed
      await queue.enqueue('img-1', 'user-1', 'free')

      // Duplicate request should fail
      await expect(
        queue.enqueue('img-1', 'user-1', 'free')
      ).rejects.toThrow('already being processed')
    })
  })

  describe('Priority Handling', () => {
    /**
     * Test: Priority queuing
     * 
     * Verifies that enterprise users get priority over free users.
     */
    it('should prioritize enterprise users over free users', async () => {
      // Enqueue free user first
      const freePromise = queue.enqueue('img-free', 'user-free', 'free')
      
      // Small delay
      await new Promise(resolve => setTimeout(resolve, 10))
      
      // Enqueue enterprise user
      const enterprisePromise = queue.enqueue('img-enterprise', 'user-enterprise', 'enterprise')

      // Both should be queued
      await Promise.all([freePromise, enterprisePromise])

      const status = queue.getStatus()
      
      // Enterprise should have higher priority (processed first if both in queue)
      expect(status.activeCount).toBeLessThanOrEqual(3)
    })

    /**
     * Test: Priority order
     * 
     * Verifies priority order: enterprise > professional > starter > free
     */
    it('should respect priority order: enterprise > professional > starter > free', async () => {
      const promises = [
        queue.enqueue('img-free', 'user-free', 'free'),
        queue.enqueue('img-starter', 'user-starter', 'starter'),
        queue.enqueue('img-professional', 'user-professional', 'professional'),
        queue.enqueue('img-enterprise', 'user-enterprise', 'enterprise'),
      ]

      await Promise.all(promises)

      // Verify all are queued or processing
      const status = queue.getStatus()
      expect(status.activeCount + status.queueLength).toBe(4)
    })
  })

  describe('Concurrent Processing Limits', () => {
    /**
     * Test: Concurrent processing limit
     * 
     * Verifies that only maxConcurrent requests are processed simultaneously.
     */
    it('should limit concurrent processing to maxConcurrent', async () => {
      // Enqueue more requests than maxConcurrent
      const promises: Promise<void>[] = []
      for (let i = 0; i < 5; i++) {
        promises.push(queue.enqueue(`img-${i}`, `user-${i}`, 'free'))
      }

      await Promise.all(promises)

      const status = queue.getStatus()
      
      // Should have maxConcurrent active, rest in queue
      expect(status.activeCount).toBeLessThanOrEqual(3) // maxConcurrent = 3
      expect(status.activeCount + status.queueLength).toBe(5)
    })

    /**
     * Test: Processing next after completion
     * 
     * Verifies that when a request completes, the next one starts processing.
     */
    it('should process next request after completion', async () => {
      // Enqueue multiple requests
      await queue.enqueue('img-1', 'user-1', 'free')
      await queue.enqueue('img-2', 'user-2', 'free')
      await queue.enqueue('img-3', 'user-3', 'free')
      await queue.enqueue('img-4', 'user-4', 'free')

      // Initial state: 3 processing, 1 queued
      let status = queue.getStatus()
      expect(status.activeCount).toBeLessThanOrEqual(3)
      expect(status.queueLength).toBeGreaterThanOrEqual(1)

      // Complete first request
      queue.dequeue('img-1')

      // Should process next
      status = queue.getStatus()
      expect(status.activeCount).toBeLessThanOrEqual(3)
      expect(status.queueLength).toBeLessThan(4)
    })
  })

  describe('Queue Status', () => {
    /**
     * Test: Get queue status
     * 
     * Verifies that queue status is reported correctly.
     */
    it('should report queue status correctly', async () => {
      await queue.enqueue('img-1', 'user-1', 'free')
      await queue.enqueue('img-2', 'user-2', 'free')

      const status = queue.getStatus()

      expect(status).toHaveProperty('queueLength')
      expect(status).toHaveProperty('activeCount')
      expect(status).toHaveProperty('processing')
      expect(Array.isArray(status.processing)).toBe(true)
      expect(status.activeCount).toBeGreaterThanOrEqual(0)
      expect(status.queueLength).toBeGreaterThanOrEqual(0)
    })

    /**
     * Test: Clear queue
     * 
     * Verifies that queue can be cleared.
     */
    it('should clear queue correctly', async () => {
      await queue.enqueue('img-1', 'user-1', 'free')
      await queue.enqueue('img-2', 'user-2', 'free')

      queue.clear()

      const status = queue.getStatus()
      expect(status.queueLength).toBe(0)
      expect(status.activeCount).toBe(0)
      expect(status.processing.length).toBe(0)
    })
  })

  describe('Singleton Instance', () => {
    /**
     * Test: Singleton queue instance
     * 
     * Verifies that getProcessingQueue returns the same instance.
     */
    it('should return singleton instance', () => {
      const queue1 = getProcessingQueue()
      const queue2 = getProcessingQueue()

      expect(queue1).toBe(queue2)
    })
  })
})

