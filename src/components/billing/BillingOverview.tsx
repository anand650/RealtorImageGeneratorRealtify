'use client'

import { CreditCard, Calendar, Zap, TrendingUp, ArrowRight } from 'lucide-react'

interface BillingOverviewProps {
  planName?: string
  tokensAllocated?: number
  tokensUsed?: number
  billingStatus?: string
  currentPeriodStart?: string | Date | null
  currentPeriodEnd?: string | Date | null
  monthlyUsageTotal?: number
  isLoading?: boolean
}

export function BillingOverview({
  planName,
  tokensAllocated = 0,
  tokensUsed = 0,
  billingStatus,
  currentPeriodStart,
  currentPeriodEnd,
  monthlyUsageTotal = 0,
  isLoading,
}: BillingOverviewProps) {
  const tokensRemaining = Math.max(tokensAllocated - tokensUsed, 0)
  const usagePercentage = tokensAllocated > 0 ? Math.min(100, Math.round((tokensUsed / tokensAllocated) * 100)) : 0

  const formattedStart = currentPeriodStart ? new Date(currentPeriodStart).toLocaleDateString() : '—'
  const formattedEnd = currentPeriodEnd ? new Date(currentPeriodEnd).toLocaleDateString() : '—'

  if (isLoading) {
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="p-6 space-y-4 animate-pulse">
          <div className="h-5 w-32 rounded bg-gray-200" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="flex items-center space-x-4">
                <div className="h-8 w-8 rounded-lg bg-gray-200" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 rounded bg-gray-200" />
                  <div className="h-4 w-24 rounded bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
          <div className="h-2 w-full rounded-full bg-gray-200" />
        </div>
      </div>
    )
  }

  const isFreeTier = planName === 'Free Tier' || billingStatus === 'inactive'

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="p-6">
        {isFreeTier && (
          <div className="mb-6 rounded-lg border border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <Zap className="h-6 w-6 text-amber-600" />
                </div>
              </div>
              <div className="ml-4 flex-1">
                <h4 className="text-base font-semibold text-gray-900 mb-1">
                  You have {tokensRemaining} of {tokensAllocated} free credits remaining
                </h4>
                <p className="text-sm text-gray-600 mb-3">
                  Try our product with {tokensAllocated} free credits! Upgrade to a paid plan for unlimited image generation, priority processing, and advanced features.
                </p>
                <a
                  href="#available-plans"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                >
                  View Plans & Upgrade
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        )}

        <h3 className="text-lg font-medium text-gray-900 mb-4">Current Plan</h3>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Plan</p>
              <p className="text-lg font-semibold text-gray-900">{planName || 'No plan'}</p>
              {billingStatus && (
                <p className="text-xs uppercase text-gray-400">Status: {billingStatus}</p>
              )}
            </div>
          </div>

          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center">
                <Zap className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Tokens Used</p>
              <p className="text-lg font-semibold text-gray-900">
                {tokensUsed} / {tokensAllocated}
              </p>
            </div>
          </div>

          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-lg bg-yellow-100 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Usage</p>
              <p className="text-lg font-semibold text-gray-900">{usagePercentage}%</p>
              <p className="text-xs text-gray-500">{monthlyUsageTotal} images this month</p>
            </div>
          </div>

          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-lg bg-purple-100 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Current Cycle</p>
              <p className="text-sm font-semibold text-gray-900">
                {formattedStart} – {formattedEnd}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Token Usage</span>
            <span className="text-sm text-gray-500">{tokensRemaining} remaining</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${
                usagePercentage >= 90 ? 'bg-red-500' : usagePercentage >= 80 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${usagePercentage}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}



