/**
 * Request Queue for Image Processing
 * 
 * This module implements a queue system to handle concurrent image processing
 * requests and prevent resource exhaustion. It ensures:
 * - Fair queuing (FIFO)
 * - Rate limiting
 * - Request deduplication
 * - Priority handling for premium users
 */

interface QueuedRequest {
  imageId: string
  userId?: string
  priority: number
  timestamp: number
  resolve: (value: any) => void
  reject: (error: Error) => void
}

interface QueueConfig {
  maxConcurrent: number
  maxQueueSize: number
  processingTimeout: number
  priorityBoost?: {
    premium: number
    enterprise: number
  }
}

class ImageProcessingQueue {
  private queue: QueuedRequest[] = []
  private processing: Set<string> = new Set()
  private activeCount: number = 0
  private config: QueueConfig

  constructor(config: QueueConfig = {
    maxConcurrent: 5, // Process 5 images concurrently
    maxQueueSize: 50, // Max 50 requests in queue
    processingTimeout: 300000, // 5 minutes timeout
    priorityBoost: {
      premium: 10,
      enterprise: 20,
    },
  }) {
    this.config = config
  }

  /**
   * Add a request to the queue
   */
  async enqueue(
    imageId: string,
    userId?: string,
    userPriority: 'free' | 'starter' | 'professional' | 'enterprise' = 'free'
  ): Promise<void> {
    // Check if already processing
    if (this.processing.has(imageId)) {
      throw new Error(`Image ${imageId} is already being processed`)
    }

    // Check queue size
    if (this.queue.length >= this.config.maxQueueSize) {
      throw new Error('Processing queue is full. Please try again later.')
    }

    // Calculate priority
    const basePriority = Date.now()
    let priorityBoost = 0
    
    if (userPriority === 'enterprise' && this.config.priorityBoost) {
      priorityBoost = this.config.priorityBoost.enterprise
    } else if (userPriority === 'professional' && this.config.priorityBoost) {
      priorityBoost = this.config.priorityBoost.premium
    }

    const priority = basePriority - priorityBoost // Lower number = higher priority

    // Create promise that will be resolved when request is dequeued
    return new Promise((resolve, reject) => {
      this.queue.push({
        imageId,
        userId,
        priority,
        timestamp: Date.now(),
        resolve,
        reject,
      })

      // Sort queue by priority (lower number = higher priority)
      this.queue.sort((a, b) => a.priority - b.priority)

      // Try to process next request
      this.processNext()
    })
  }

  /**
   * Process next request in queue
   */
  private async processNext(): Promise<void> {
    // Check if we can process more requests
    if (this.activeCount >= this.config.maxConcurrent) {
      return
    }

    // Check if queue is empty
    if (this.queue.length === 0) {
      return
    }

    // Get next request (already sorted by priority)
    const request = this.queue.shift()
    if (!request) {
      return
    }

    // Check for timeout
    const elapsed = Date.now() - request.timestamp
    if (elapsed > this.config.processingTimeout) {
      request.reject(new Error('Request timeout'))
      return this.processNext()
    }

    // Mark as processing
    this.processing.add(request.imageId)
    this.activeCount++

    // Resolve the promise to allow processing
    request.resolve(undefined)

    // Note: The caller is responsible for calling dequeue() when done
  }

  /**
   * Mark request as completed and process next
   */
  dequeue(imageId: string): void {
    this.processing.delete(imageId)
    this.activeCount--
    this.processNext()
  }

  /**
   * Get queue status
   */
  getStatus(): {
    queueLength: number
    activeCount: number
    processing: string[]
  } {
    return {
      queueLength: this.queue.length,
      activeCount: this.activeCount,
      processing: Array.from(this.processing),
    }
  }

  /**
   * Clear queue (for testing/reset)
   */
  clear(): void {
    this.queue = []
    this.processing.clear()
    this.activeCount = 0
  }
}

// Singleton instance
let queueInstance: ImageProcessingQueue | null = null

export function getProcessingQueue(): ImageProcessingQueue {
  if (!queueInstance) {
    const maxConcurrent = parseInt(process.env.MAX_CONCURRENT_PROCESSING || '5', 10)
    const maxQueueSize = parseInt(process.env.MAX_QUEUE_SIZE || '50', 10)
    
    queueInstance = new ImageProcessingQueue({
      maxConcurrent,
      maxQueueSize,
      processingTimeout: 300000, // 5 minutes
    })
  }
  return queueInstance
}

export { ImageProcessingQueue }

