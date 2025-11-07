'use client'

import { Zap, AlertTriangle } from 'lucide-react'

export function TokenUsageWidget() {
  const tokensUsed = 89
  const tokensAllocated = 150
  const tokensRemaining = tokensAllocated - tokensUsed
  const usagePercentage = (tokensUsed / tokensAllocated) * 100

  const getUsageColor = () => {
    if (usagePercentage >= 90) return 'text-red-600'
    if (usagePercentage >= 80) return 'text-yellow-600'
    return 'text-green-600'
  }

  const getProgressColor = () => {
    if (usagePercentage >= 90) return 'bg-red-500'
    if (usagePercentage >= 80) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Zap className="h-6 w-6 text-gray-400" />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">
                Token Usage
              </dt>
              <dd className="flex items-baseline">
                <div className="text-2xl font-semibold text-gray-900">
                  {tokensUsed} / {tokensAllocated}
                </div>
                <div className={`ml-2 text-sm font-semibold ${getUsageColor()}`}>
                  {tokensRemaining} remaining
                </div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
      <div className="bg-gray-50 px-5 py-3">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Usage this month</span>
              <span className={`font-medium ${getUsageColor()}`}>
                {Math.round(usagePercentage)}%
              </span>
            </div>
            <div className="mt-2">
              <div className="flex h-2 overflow-hidden rounded-full bg-gray-200">
                <div
                  className={`flex flex-col justify-center rounded-full ${getProgressColor()}`}
                  style={{ width: `${usagePercentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>
        {usagePercentage >= 80 && (
          <div className="mt-3 flex items-center text-sm text-yellow-600">
            <AlertTriangle className="h-4 w-4 mr-1" />
            <span>
              {usagePercentage >= 90
                ? 'You\'re running low on tokens!'
                : 'Consider upgrading your plan soon.'}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}



