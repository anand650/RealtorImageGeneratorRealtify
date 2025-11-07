'use client'

import { Image, Zap, Clock, TrendingUp } from 'lucide-react'
import { useEffect, useState } from 'react'

interface Stats {
  imagesProcessed: number
  tokensUsed: number
  avgProcessingTime: string
  successRate: string
}

type ChangeType = 'positive' | 'negative' | 'neutral'

export function DashboardStats() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/analytics/usage?period=30')
        if (response.ok) {
          const data = await response.json()
          
          // Calculate stats from real data
          const totalImages = data.totalImages || 0
          const completedImages = data.completedImages || 0
          const failedImages = data.failedImages || 0
          const successRate = totalImages > 0 
            ? ((completedImages / totalImages) * 100).toFixed(1)
            : '0'
          
          // Estimate tokens used (1 token per image)
          const tokensUsed = totalImages
          
          // Calculate average processing time from recent usage if available
          const avgProcessingTime = '2-3 min' // Default, can be calculated from actual data if available
          
          setStats({
            imagesProcessed: totalImages,
            tokensUsed,
            avgProcessingTime,
            successRate: `${successRate}%`,
          })
        }
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="relative overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:px-6 animate-pulse">
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    )
  }

  const displayStats: Array<{
    name: string
    value: string
    change: string
    changeType: ChangeType
    icon: typeof Image
  }> = [
    {
      name: 'Images Processed',
      value: stats?.imagesProcessed.toString() || '0',
      change: '',
      changeType: 'neutral',
      icon: Image,
    },
    {
      name: 'Tokens Used',
      value: stats?.tokensUsed.toString() || '0',
      change: '',
      changeType: 'neutral',
      icon: Zap,
    },
    {
      name: 'Avg. Processing Time',
      value: stats?.avgProcessingTime || 'N/A',
      change: '',
      changeType: 'neutral',
      icon: Clock,
    },
    {
      name: 'Success Rate',
      value: stats?.successRate || '0%',
      change: '',
      changeType: 'neutral',
      icon: TrendingUp,
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {displayStats.map((stat) => (
        <div
          key={stat.name}
          className="relative overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:px-6"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <stat.icon
                className="h-8 w-8 text-gray-400"
                aria-hidden="true"
              />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  {stat.name}
                </dt>
                <dd className="flex items-baseline">
                  <div className="text-2xl font-semibold text-gray-900">
                    {stat.value}
                  </div>
                  {stat.change && (
                    <div
                      className={`ml-2 flex items-baseline text-sm font-semibold ${
                        stat.changeType === 'positive'
                          ? 'text-green-600'
                          : stat.changeType === 'negative'
                          ? 'text-red-600'
                          : 'text-gray-500'
                      }`}
                    >
                      {stat.change}
                    </div>
                  )}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}



