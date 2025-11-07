'use client'

import { Clock, CheckCircle, XCircle, Zap } from 'lucide-react'

export function PerformanceMetrics() {
  const metrics = [
    {
      name: 'Processing Speed',
      value: '2.3 min',
      description: 'Average processing time',
      icon: Clock,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      name: 'Success Rate',
      value: '98.5%',
      description: 'Images processed successfully',
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      name: 'Failure Rate',
      value: '1.5%',
      description: 'Images that failed to process',
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
    {
      name: 'Peak Performance',
      value: '45/min',
      description: 'Maximum processing capacity',
      icon: Zap,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
  ]

  const processingTimes = [
    { range: '0-1 min', count: 45, percentage: 15 },
    { range: '1-2 min', count: 120, percentage: 40 },
    { range: '2-3 min', count: 90, percentage: 30 },
    { range: '3-5 min', count: 30, percentage: 10 },
    { range: '5+ min', count: 15, percentage: 5 },
  ]

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Metrics</h3>
        
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric, index) => (
            <div key={index} className="flex items-center">
              <div className={`flex-shrink-0 p-3 rounded-lg ${metric.bgColor}`}>
                <metric.icon className={`h-6 w-6 ${metric.color}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">{metric.name}</p>
                <p className="text-2xl font-semibold text-gray-900">{metric.value}</p>
                <p className="text-xs text-gray-400">{metric.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <h4 className="text-sm font-medium text-gray-900 mb-4">Processing Time Distribution</h4>
          <div className="space-y-3">
            {processingTimes.map((item, index) => (
              <div key={index} className="flex items-center">
                <div className="w-16 text-sm text-gray-500">{item.range}</div>
                <div className="flex-1 mx-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
                <div className="w-12 text-sm text-gray-500 text-right">{item.count}</div>
                <div className="w-8 text-sm text-gray-500 text-right">{item.percentage}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}



