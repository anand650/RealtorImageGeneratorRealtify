'use client'

import { TrendingUp } from 'lucide-react'

export function UsageTrends() {
  const weeklyData = [
    { day: 'Mon', images: 12, tokens: 15 },
    { day: 'Tue', images: 8, tokens: 10 },
    { day: 'Wed', images: 15, tokens: 18 },
    { day: 'Thu', images: 10, tokens: 12 },
    { day: 'Fri', images: 18, tokens: 22 },
    { day: 'Sat', images: 5, tokens: 6 },
    { day: 'Sun', images: 3, tokens: 4 },
  ]

  const maxImages = Math.max(...weeklyData.map(d => d.images))
  const maxTokens = Math.max(...weeklyData.map(d => d.tokens))

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Weekly Usage Trends</h3>
          <TrendingUp className="h-5 w-5 text-gray-400" />
        </div>
        
        <div className="space-y-4">
          {/* Images Chart */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Images Processed</span>
              <span className="text-sm text-gray-500">This week</span>
            </div>
            <div className="flex items-end space-x-1 h-20">
              {weeklyData.map((data, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-blue-500 rounded-t"
                    style={{ height: `${(data.images / maxImages) * 60}px` }}
                  />
                  <span className="text-xs text-gray-500 mt-1">{data.day}</span>
                  <span className="text-xs text-gray-700 font-medium">{data.images}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tokens Chart */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Tokens Used</span>
              <span className="text-sm text-gray-500">This week</span>
            </div>
            <div className="flex items-end space-x-1 h-20">
              {weeklyData.map((data, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-green-500 rounded-t"
                    style={{ height: `${(data.tokens / maxTokens) * 60}px` }}
                  />
                  <span className="text-xs text-gray-500 mt-1">{data.day}</span>
                  <span className="text-xs text-gray-700 font-medium">{data.tokens}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
          <span>Total: {weeklyData.reduce((sum, d) => sum + d.images, 0)} images</span>
          <span>{weeklyData.reduce((sum, d) => sum + d.tokens, 0)} tokens</span>
        </div>
      </div>
    </div>
  )
}



