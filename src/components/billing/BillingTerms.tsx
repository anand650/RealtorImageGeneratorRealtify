'use client'

import { AlertTriangle, Users, RefreshCw } from 'lucide-react'

export function BillingTerms() {
  return (
    <div className="bg-white shadow rounded-lg">
      <div className="p-6 space-y-4">
        <div className="flex items-center space-x-3">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          <h3 className="text-lg font-medium text-gray-900">Usage Policy & Terms</h3>
        </div>

        <ul className="space-y-3 text-sm text-gray-600">
          <li className="flex items-start space-x-3">
            <RefreshCw className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-500" />
            <span>
              Image tokens refresh every 30 days. Any unused credits expire at the end of the billing cycle and do not roll over.
            </span>
          </li>
          <li className="flex items-start space-x-3">
            <Users className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-500" />
            <span>
              Invited teammates consume from the same quota. Upgrade the subscription if you expect higher shared usage.
            </span>
          </li>
          <li className="flex items-start space-x-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-500" />
            <span>
              Cancel anytime from the billing portal. Access remains active until the current cycle ends, but unused tokens are not refunded.
            </span>
          </li>
        </ul>
      </div>
    </div>
  )
}



