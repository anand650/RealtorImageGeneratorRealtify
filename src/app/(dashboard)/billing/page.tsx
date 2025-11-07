"use client"

import { useEffect, useMemo, useState } from 'react'
import { BillingOverview } from '@/components/billing/BillingOverview'
import { UsageCharts } from '@/components/billing/UsageCharts'
import { PlanManagement } from '@/components/billing/PlanManagement'
import { InvoiceHistory } from '@/components/billing/InvoiceHistory'
import { BillingTerms } from '@/components/billing/BillingTerms'
import { PLAN_CATALOG } from '@/constants/planCatalog'

interface BillingResponse {
  currentPlan: {
    name: string
    tokensAllocated: number
    tokensUsed: number
    tokensRemaining: number
    currentPeriodStart?: string
    currentPeriodEnd?: string
    billingStatus?: string
    isActive: boolean
  }
  monthlyUsage: number
  invoices: Array<{
    id: string
    paddleInvoiceId: string
    amount: number
    status: string
    invoiceUrl?: string | null
    createdAt?: string | Date
    paidDate?: string | Date | null
  }>
  role: string
  canManageBilling: boolean
}

interface AnalyticsResponse {
  period: number
  trends: {
    daily: Array<{ date: string; count: number; completed: number; failed: number }>
    roomTypes: Array<{ roomType: string | null; _count: number }>
  }
}

export default function BillingPage() {
  const [billingData, setBillingData] = useState<BillingResponse | null>(null)
  const [analyticsData, setAnalyticsData] = useState<AnalyticsResponse | null>(null)
  const [loadingBilling, setLoadingBilling] = useState(true)
  const [loadingAnalytics, setLoadingAnalytics] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    const loadBilling = async () => {
      setLoadingBilling(true)
      setError(null)
      try {
        // Add cache busting to ensure fresh data
        const response = await fetch('/api/billing', {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
          },
        })
        const data = await response.json()
        if (!active) return
        if (!response.ok) {
          throw new Error(data?.error || 'Unable to load billing information')
        }
        setBillingData(data)
      } catch (err) {
        if (active) {
          console.error('Billing fetch error:', err)
          setError(err instanceof Error ? err.message : 'Failed to load billing data')
        }
      } finally {
        active && setLoadingBilling(false)
      }
    }

    const loadAnalytics = async () => {
      setLoadingAnalytics(true)
      try {
        const response = await fetch('/api/analytics/usage?period=30')
        const data = await response.json()
        if (!active) return
        if (response.ok) {
          setAnalyticsData(data)
        } else {
          console.warn('Analytics fetch warning:', data?.error)
        }
      } catch (err) {
        if (active) {
          console.warn('Analytics fetch error:', err)
        }
      } finally {
        active && setLoadingAnalytics(false)
      }
    }

    loadBilling()
    loadAnalytics()
    
    // Refresh billing data every 30 seconds to keep it fresh
    const billingInterval = setInterval(() => {
      if (active) {
        loadBilling()
      }
    }, 30000)

    return () => {
      active = false
      clearInterval(billingInterval)
    }
  }, [])

  const planDisplayName = useMemo(() => {
    if (!billingData?.currentPlan?.name) return undefined
    // Handle free tier
    if (billingData.currentPlan.name === 'free') {
      return 'Free Tier'
    }
    return PLAN_CATALOG.find((p) => p.id === billingData.currentPlan.name)?.name || billingData.currentPlan.name
  }, [billingData?.currentPlan?.name])

  const usageChartsData = useMemo(() => {
    if (!analyticsData?.trends?.daily) {
      return {
        monthly: [],
        weekly: [],
        roomTypes: [] as Array<{ label: string; count: number; percentage: number }>,
      }
    }

    const dailySorted = [...analyticsData.trends.daily].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    )

    const monthly = dailySorted.slice(-12).map((entry) => ({
      label: new Date(entry.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      total: entry.count,
    }))

    const weekly = dailySorted.slice(-7).map((entry) => ({
      label: new Date(entry.date).toLocaleDateString(undefined, { weekday: 'short' }),
      total: entry.count,
    }))

    const roomTypeStats = analyticsData.trends.roomTypes || []
    const totalRoomImages = roomTypeStats.reduce((sum, item) => sum + (item._count || 0), 0)
    const roomTypes = roomTypeStats.map((item) => ({
      label: item.roomType || 'Other',
      count: item._count || 0,
      percentage: totalRoomImages ? Math.round(((item._count || 0) / totalRoomImages) * 100) : 0,
    }))

    return { monthly, weekly, roomTypes }
  }, [analyticsData])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Billing & Subscription</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your subscription, view usage trends, and download invoices.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <BillingOverview
            planName={planDisplayName}
            tokensAllocated={billingData?.currentPlan.tokensAllocated}
            tokensUsed={billingData?.currentPlan.tokensUsed}
            billingStatus={billingData?.currentPlan.billingStatus}
            currentPeriodStart={billingData?.currentPlan.currentPeriodStart}
            currentPeriodEnd={billingData?.currentPlan.currentPeriodEnd}
            monthlyUsageTotal={billingData?.monthlyUsage}
            isLoading={loadingBilling}
          />

          <UsageCharts
            monthly={usageChartsData.monthly}
            weekly={usageChartsData.weekly}
            roomTypes={usageChartsData.roomTypes}
            isLoading={loadingAnalytics}
          />

          <InvoiceHistory
            invoices={billingData?.invoices}
            isLoading={loadingBilling}
            canManageBilling={billingData?.canManageBilling ?? false}
          />

          <BillingTerms />
        </div>
        <div id="available-plans" className="lg:col-span-1 scroll-mt-6">
          <PlanManagement
            currentPlanId={billingData?.currentPlan.name}
            billingStatus={billingData?.currentPlan.billingStatus}
            tokensUsed={billingData?.currentPlan.tokensUsed}
            tokensAllocated={billingData?.currentPlan.tokensAllocated}
            canManageBilling={billingData?.canManageBilling ?? false}
          />
        </div>
      </div>
    </div>
  )
}



