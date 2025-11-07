'use client'

import { TrendingUp, Calendar, Zap } from 'lucide-react'

interface DailyUsagePoint {
  label: string
  total: number
}

interface RoomTypeUsagePoint {
  label: string
  count: number
  percentage: number
}

interface UsageChartsProps {
  monthly?: DailyUsagePoint[]
  weekly?: DailyUsagePoint[]
  roomTypes?: RoomTypeUsagePoint[]
  isLoading?: boolean
}

export function UsageCharts({ monthly = [], weekly = [], roomTypes = [], isLoading }: UsageChartsProps) {
  if (isLoading) {
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="p-6 space-y-6 animate-pulse">
          <div className="h-5 w-32 rounded bg-gray-200" />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div key={idx} className="h-4 rounded bg-gray-200" />
              ))}
            </div>
            <div className="space-y-3">
              {Array.from({ length: 7 }).map((_, idx) => (
                <div key={idx} className="h-4 rounded bg-gray-200" />
              ))}
            </div>
          </div>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, idx) => (
              <div key={idx} className="h-4 rounded bg-gray-200" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  const maxMonthly = monthly.length > 0 ? Math.max(...monthly.map((d) => d.total)) : 0
  const maxWeekly = weekly.length > 0 ? Math.max(...weekly.map((d) => d.total)) : 0

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Usage Analytics</h3>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-medium text-gray-900">Monthly Usage</h4>
              <TrendingUp className="h-4 w-4 text-gray-400" />
            </div>
            <div className="space-y-3">
              {monthly.length === 0 && <p className="text-sm text-gray-500">No activity this period.</p>}
              {monthly.map((data, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-14 text-xs text-gray-500">{data.label}</div>
                  <div className="flex-1 mx-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${maxMonthly > 0 ? (data.total / maxMonthly) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                  <div className="w-10 text-xs text-gray-500 text-right">{data.total}</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-medium text-gray-900">This Week</h4>
              <Calendar className="h-4 w-4 text-gray-400" />
            </div>
            <div className="space-y-3">
              {weekly.length === 0 && <p className="text-sm text-gray-500">No images generated this week.</p>}
              {weekly.map((data, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-10 text-xs text-gray-500">{data.label}</div>
                  <div className="flex-1 mx-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${maxWeekly > 0 ? (data.total / maxWeekly) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                  <div className="w-8 text-xs text-gray-500 text-right">{data.total}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium text-gray-900">Room Type Usage</h4>
            <Zap className="h-4 w-4 text-gray-400" />
          </div>
          <div className="space-y-3">
            {roomTypes.length === 0 && <p className="text-sm text-gray-500">No completed images to report.</p>}
            {roomTypes.map((data, index) => (
              <div key={index} className="flex items-center">
                <div className="w-24 text-xs text-gray-500 truncate">{data.label}</div>
                <div className="flex-1 mx-3">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-500 h-2 rounded-full"
                      style={{ width: `${Math.min(100, data.percentage)}%` }}
                    />
                  </div>
                </div>
                <div className="w-10 text-xs text-gray-500 text-right">{data.count}</div>
                <div className="w-10 text-xs text-gray-500 text-right">{data.percentage}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}



