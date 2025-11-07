'use client'

import { BarChart3, TrendingUp, Clock, CheckCircle } from 'lucide-react'

const stats = [
  {
    name: 'Total Images Processed',
    value: '1,247',
    change: '+12%',
    changeType: 'positive',
    icon: BarChart3,
  },
  {
    name: 'Success Rate',
    value: '98.5%',
    change: '+2.1%',
    changeType: 'positive',
    icon: CheckCircle,
  },
  {
    name: 'Avg. Processing Time',
    value: '2.3 min',
    change: '-15%',
    changeType: 'positive',
    icon: Clock,
  },
  {
    name: 'Monthly Growth',
    value: '+18%',
    change: '+5%',
    changeType: 'positive',
    icon: TrendingUp,
  },
]

export function AnalyticsOverview() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
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
                  <div
                    className={`ml-2 flex items-baseline text-sm font-semibold ${
                      stat.changeType === 'positive'
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {stat.change}
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}



