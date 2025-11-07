'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Image, CheckCircle, XCircle, Clock, Zap } from 'lucide-react'

interface UsageOverviewProps {
  data: {
    totalImages: number
    completedImages: number
    failedImages: number
    processingImages: number
    successRate: number
    avgProcessingTime: number
  }
  usage: {
    freeImagesUsed: number
    freeImagesLimit: number
    subscriptionImages?: {
      used: number
      limit: number
    } | null
  }
}

export function UsageOverview({ data, usage }: UsageOverviewProps) {
  const { totalImages, completedImages, failedImages, processingImages, successRate, avgProcessingTime } = data
  
  // Calculate remaining images
  const freeRemaining = usage.freeImagesLimit - usage.freeImagesUsed
  const subscriptionRemaining = usage.subscriptionImages 
    ? usage.subscriptionImages.limit - usage.subscriptionImages.used 
    : 0

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Images */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Images</CardTitle>
          <Image className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalImages}</div>
          <p className="text-xs text-muted-foreground">
            This period
          </p>
        </CardContent>
      </Card>

      {/* Success Rate */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{successRate}%</div>
          <p className="text-xs text-muted-foreground">
            {completedImages} completed, {failedImages} failed
          </p>
        </CardContent>
      </Card>

      {/* Processing Time */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Processing</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{avgProcessingTime}s</div>
          <p className="text-xs text-muted-foreground">
            Average time per image
          </p>
        </CardContent>
      </Card>

      {/* Current Usage */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Usage Remaining</CardTitle>
          <Zap className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {usage.subscriptionImages ? (
            <>
              <div className="text-2xl font-bold">{subscriptionRemaining}</div>
              <p className="text-xs text-muted-foreground">
                of {usage.subscriptionImages.limit} subscription images
              </p>
              <Progress 
                value={(usage.subscriptionImages.used / usage.subscriptionImages.limit) * 100} 
                className="mt-2"
              />
            </>
          ) : (
            <>
              <div className="text-2xl font-bold">{freeRemaining}</div>
              <p className="text-xs text-muted-foreground">
                of {usage.freeImagesLimit} free images
              </p>
              <Progress 
                value={(usage.freeImagesUsed / usage.freeImagesLimit) * 100} 
                className="mt-2"
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* Processing Status */}
      {processingImages > 0 && (
        <Card className="md:col-span-2 lg:col-span-4">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Currently Processing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm">{processingImages} images being processed</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
