'use client'

import { Download, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface InvoiceHistoryProps {
  invoices?: Array<{
    id: string
    paddleInvoiceId: string
    amount: number
    status: string
    createdAt?: string | Date
    paidDate?: string | Date | null
    invoiceUrl?: string | null
  }>
  isLoading?: boolean
  canManageBilling: boolean
}

const STATUS_STYLES: Record<string, string> = {
  paid: 'bg-green-100 text-green-800',
  open: 'bg-yellow-100 text-yellow-800',
  pending: 'bg-yellow-100 text-yellow-800',
  void: 'bg-gray-200 text-gray-700',
  uncollectible: 'bg-red-100 text-red-800',
}

export function InvoiceHistory({ invoices = [], isLoading, canManageBilling }: InvoiceHistoryProps) {
  const formatAmount = (amountCents: number) => `$${(amountCents / 100).toFixed(2)}`

  if (isLoading) {
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="p-6 space-y-4 animate-pulse">
          <div className="h-5 w-40 rounded bg-gray-200" />
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="h-12 rounded bg-gray-100" />
          ))}
        </div>
      </div>
    )
  }

  const handleViewInvoice = (url?: string | null) => {
    if (!url) return
    window.open(url, '_blank', 'noopener')
  }

  if (!invoices.length) {
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Invoice History</h3>
          <p className="text-sm text-gray-500">Invoices will appear here once a subscription payment succeeds.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Invoice History</h3>

        <div className="overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {invoices.map((invoice) => {
                const createdAt = invoice.paidDate || invoice.createdAt
                const statusStyle = STATUS_STYLES[invoice.status] || 'bg-gray-100 text-gray-700'
                return (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{invoice.id || invoice.paddleInvoiceId}</div>
                        <div className="text-sm text-gray-500">Paddle ID: {invoice.paddleInvoiceId}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {createdAt ? new Date(createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatAmount(invoice.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyle}`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewInvoice(invoice.invoiceUrl)}
                          disabled={!invoice.invoiceUrl}
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={!invoice.invoiceUrl || !canManageBilling}
                          onClick={() => handleViewInvoice(invoice.invoiceUrl)}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <p className="mt-4 text-sm text-gray-500">
          Showing latest {invoices.length} invoice{invoices.length === 1 ? '' : 's'}.
        </p>
      </div>
    </div>
  )
}



