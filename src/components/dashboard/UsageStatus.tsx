'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Zap, AlertCircle, CheckCircle } from 'lucide-react'

interface UsageInfo {
  remainingImages: number
  isAnonymous: boolean
  requiresSignup: boolean
  requiresSubscription: boolean
  message?: string
}

export function UsageStatus() {
  const [usageInfo, setUsageInfo] = useState<UsageInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkUsage = async () => {
      try {
        // Add cache busting to ensure fresh data
        const response = await fetch('/api/usage', {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
          },
        })
        if (response.ok) {
          const data = await response.json()
          setUsageInfo(data)
        }
      } catch (error) {
        console.error('Usage check error:', error)
      } finally {
        setLoading(false)
      }
    }

    checkUsage()
    
    // Refresh usage every 30 seconds to keep data fresh
    const interval = setInterval(checkUsage, 30000)
    
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center space-x-2 text-luxury-600">
        <div className="w-4 h-4 border-2 border-luxury-300 border-t-luxury-600 rounded-full animate-spin"></div>
        <span className="text-sm">Loading...</span>
      </div>
    )
  }

  if (!usageInfo) {
    return null
  }

  const getStatusColor = () => {
    if (usageInfo.remainingImages === 0) return 'text-red-600'
    if (usageInfo.remainingImages <= 2) return 'text-orange-600'
    return 'text-green-600'
  }

  const getStatusIcon = () => {
    if (usageInfo.remainingImages === 0) return <AlertCircle className="h-4 w-4" />
    if (usageInfo.remainingImages <= 2) return <AlertCircle className="h-4 w-4" />
    return <CheckCircle className="h-4 w-4" />
  }

  return (
    <div className="flex items-center space-x-3">
      <div className="flex items-center space-x-2">
        <Zap className={`h-4 w-4 ${getStatusColor()}`} />
        <span className={`text-sm font-medium ${getStatusColor()}`}>
          {usageInfo.remainingImages} {usageInfo.remainingImages === 1 ? 'credit' : 'credits'}
        </span>
      </div>
      
      {usageInfo.requiresSignup && (
        <div className="px-2 py-1 bg-blue-50 border border-blue-200 rounded-lg">
          <span className="text-xs text-blue-800 font-medium">Sign up for more</span>
        </div>
      )}
      
      {usageInfo.requiresSubscription && (
        <Link href="/billing" className="px-2 py-1 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors">
          <span className="text-xs text-orange-800 font-medium">Upgrade plan</span>
        </Link>
      )}
    </div>
  )
}


