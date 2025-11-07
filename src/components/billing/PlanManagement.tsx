'use client'

import { useState } from 'react'
import { Check, ArrowRight, ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PLAN_CATALOG, formatPrice } from '@/constants/planCatalog'

interface PlanManagementProps {
  currentPlanId?: string
  billingStatus?: string
  tokensUsed?: number
  tokensAllocated?: number
  canManageBilling: boolean
}

export function PlanManagement({
  currentPlanId,
  billingStatus,
  tokensUsed = 0,
  tokensAllocated = 0,
  canManageBilling,
}: PlanManagementProps) {
  const [pendingPlanId, setPendingPlanId] = useState<string | null>(null)
  const [portalLoading, setPortalLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const billingDisabled = (process.env.NEXT_PUBLIC_BILLING_PROVIDER === 'none')

  const handleCheckout = async (planId: string) => {
    if (!canManageBilling || billingDisabled) return
    try {
      setPendingPlanId(planId)
      setMessage(null)
      const response = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.error || 'Unable to start checkout'
        const errorDetails = errorData.details ? `: ${errorData.details}` : ''
        const errorHint = errorData.hint ? `\n\n${errorData.hint}` : ''
        throw new Error(`${errorMessage}${errorDetails}${errorHint}`)
      }

      const data = await response.json()
      if (data?.url) {
        window.location.href = data.url
      } else {
        throw new Error('Checkout session missing redirect URL')
      }
    } catch (error) {
      console.error('Checkout error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to start checkout'
      setMessage(errorMessage)
    } finally {
      setPendingPlanId(null)
    }
  }

  const handleOpenPortal = async () => {
    if (!canManageBilling || billingDisabled) return
    try {
      setPortalLoading(true)
      setMessage(null)
      const response = await fetch('/api/billing/portal', { method: 'POST' })
      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.error || 'Unable to open billing portal')
      }
      const data = await response.json()
      if (data?.url) {
        window.location.href = data.url
      } else {
        throw new Error('Billing portal session missing redirect URL')
      }
    } catch (error) {
      console.error('Portal error:', error)
      setMessage(error instanceof Error ? error.message : 'Failed to open billing portal')
    } finally {
      setPortalLoading(false)
    }
  }

  const percentageUsed = tokensAllocated > 0 ? Math.min(100, Math.round((tokensUsed / tokensAllocated) * 100)) : 0

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="p-6 space-y-6">
        <div className="space-y-1">
          <h3 className="text-lg font-medium text-gray-900">Available Plans</h3>
          <p className="text-sm text-gray-500">
            Tokens expire at the end of each billing cycle. Any invited team members will consume from the same quota.
          </p>
          {billingDisabled && (
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-2 py-1 inline-block">
              Billing is temporarily unavailable.
            </p>
          )}
          {billingStatus && (
            <p className="text-xs text-gray-400 uppercase tracking-wide">Status: {billingStatus}</p>
          )}
        </div>

        {message && (
          <div className="flex items-start space-x-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            <ShieldAlert className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <div className="flex-1 whitespace-pre-wrap">{message}</div>
          </div>
        )}

        {tokensAllocated > 0 && (
          <div className="rounded-md border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
            <div className="flex items-center justify-between">
              <span>
                {tokensUsed} of {tokensAllocated} images used this cycle
              </span>
              <span>{percentageUsed}%</span>
            </div>
            <div className="mt-2 h-2 w-full rounded-full bg-gray-200">
              <div
                className="h-2 rounded-full bg-blue-500"
                style={{ width: `${percentageUsed}%` }}
              />
            </div>
          </div>
        )}

        <div className="space-y-4">
          {PLAN_CATALOG.map((plan) => {
            const isCurrent = plan.id === currentPlanId && billingStatus === 'active'
            const isProcessing = pendingPlanId === plan.id
            const buttonDisabled = billingDisabled || !canManageBilling || (isCurrent && billingStatus === 'active') || isProcessing
            const buttonLabel = billingDisabled
              ? 'Billing unavailable'
              : isCurrent && billingStatus === 'active'
              ? 'Current Plan'
              : plan.id === 'starter'
              ? 'Switch to Starter'
              : `Upgrade to ${plan.name}`

            return (
              <div
                key={plan.id}
                className={`relative rounded-lg border-2 p-4 transition-all ${
                  isCurrent && billingStatus === 'active'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                {isCurrent && billingStatus === 'active' && (
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-blue-500 px-3 py-1 text-xs font-medium text-white">
                    Active plan
                  </span>
                )}

                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">{plan.name}</h4>
                    <p className="text-sm text-gray-500">{plan.tokens} images / month</p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-gray-900">{formatPrice(plan.price)}</span>
                    <span className="text-sm text-gray-500"> / month</span>
                  </div>
                </div>

                <ul className="space-y-2 mb-4 text-sm text-gray-600">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center">
                      <Check className="mr-2 h-4 w-4 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button
                  className="w-full"
                  onClick={() => handleCheckout(plan.id)}
                  disabled={buttonDisabled}
                >
                  {isProcessing ? 'Redirecting…' : buttonLabel}
                  {!isCurrent && !isProcessing && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>

                {!canManageBilling && (
                  <p className="mt-2 text-xs text-gray-400">
                    Only workspace owners can update the subscription.
                  </p>
                )}
              </div>
            )
          })}
        </div>

        {!billingDisabled && (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <h4 className="text-sm font-medium text-gray-900">Need to update payment methods?</h4>
            <p className="mt-1 text-sm text-gray-600">
              The billing portal lets you update payment details, download invoices, and manage cancellations through Paddle.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={handleOpenPortal}
              disabled={!canManageBilling || portalLoading}
            >
              {portalLoading ? 'Opening portal…' : 'Manage Billing'}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}



