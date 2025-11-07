'use client'

import Link from 'next/link'
import { Zap, Image, BarChart3, CreditCard } from 'lucide-react'

const quickActions = [
  {
    name: 'Generate New Image',
    description: 'Upload and enhance a property image',
    href: '/generate',
    icon: Zap,
    color: 'bg-blue-500',
  },
  {
    name: 'View Gallery',
    description: 'Browse your processed images',
    href: '/images',
    icon: Image,
    color: 'bg-green-500',
  },
  {
    name: 'View Analytics',
    description: 'Check your usage statistics',
    href: '/analytics',
    icon: BarChart3,
    color: 'bg-purple-500',
  },
  {
    name: 'Manage Billing',
    description: 'Update subscription and payment',
    href: '/billing',
    icon: CreditCard,
    color: 'bg-orange-500',
  },
]

export function QuickActions() {
  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => (
            <Link
              key={action.name}
              href={action.href}
              className="group relative rounded-lg border border-gray-200 bg-white p-6 hover:border-gray-300 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center">
                <div className={`flex-shrink-0 rounded-lg p-3 ${action.color}`}>
                  <action.icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <h4 className="text-sm font-medium text-gray-900 group-hover:text-blue-600">
                    {action.name}
                  </h4>
                  <p className="text-sm text-gray-500">{action.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}



