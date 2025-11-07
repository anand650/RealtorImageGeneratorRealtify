'use client'

import { useState, useEffect } from 'react'
import { UsageOverview } from '@/components/analytics/UsageOverview'
import { UsageCharts } from '@/components/analytics/UsageCharts'
import { RoomTypeBreakdown } from '@/components/analytics/RoomTypeBreakdown'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RefreshCw } from 'lucide-react'

interface AnalyticsData {
  period: number
  overview: {
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
  trends: {
    daily: Array<{
      date: string
      count: number
      completed: number
      failed: number
    }>
    roomTypes: Array<{
      roomType: string
      _count: number
    }>
    styles: Array<{
      style: string
      _count: number
    }>
  }
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [period, setPeriod] = useState(30)

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/analytics/usage?period=${period}`)
      if (!response.ok) {
        throw new Error('Failed to fetch analytics')
      }
      
      const analyticsData = await response.json()
      setData(analyticsData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [period])

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="mt-1 text-sm text-gray-500">
            Track your image generation usage and performance metrics.
          </p>
        </div>
        
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="mt-1 text-sm text-gray-500">
            Track your image generation usage and performance metrics.
          </p>
        </div>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-red-600 mb-4">Error loading analytics: {error}</p>
              <Button onClick={fetchAnalytics} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="mt-1 text-sm text-gray-500">
            Track your image generation usage and performance metrics.
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <select
            value={period}
            onChange={(e) => setPeriod(parseInt(e.target.value))}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
          
          <Button onClick={fetchAnalytics} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <UsageOverview data={data.overview} usage={data.usage} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <UsageCharts dailyData={data.trends.daily} styleData={data.trends.styles} />
        </div>
        <div>
          <RoomTypeBreakdown data={data.trends.roomTypes} />
        </div>
      </div>
    </div>
  )
}



