'use client'

import { useState } from 'react'
import { UserPlus, Mail, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function InviteMember() {
  const [formData, setFormData] = useState({
    email: '',
    role: 'MEMBER',
    message: '',
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [sendEmail, setSendEmail] = useState(true)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      setErrorMsg(null)
      setSuccessMsg(null)
      const res = await fetch('/api/teams/invites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, role: formData.role, sendEmail, message: formData.message }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to create invite')
        return
      }
      setSuccessMsg('Invitation created. Copy and share the link below:')
      console.log('Invite link:', data.link)
      ;(window as any).__lastInviteLink = data.link
      
      // Reset form
      setFormData({
        email: '',
        role: 'MEMBER',
        message: '',
      })
      setSendEmail(true)
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : 'Invite failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const roles = [
    { value: 'VIEWER', label: 'Viewer', description: 'Can view and download images' },
    { value: 'MEMBER', label: 'Member', description: 'Can upload, generate, manage images' },
    { value: 'OWNER', label: 'Owner', description: 'Manage billing, members, and settings' },
  ]

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="p-6">
        <div className="flex items-center mb-4">
          <UserPlus className="h-5 w-5 text-gray-400 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Invite Team Member</h3>
        </div>
        {errorMsg && (
          <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200 text-sm text-red-700">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="mb-4 p-3 rounded-md bg-green-50 border border-green-200 text-sm text-green-700">
            {successMsg}
            <div className="mt-2">
              <input
                readOnly
                value={(window as any).__lastInviteLink || ''}
                className="w-full px-2 py-1 border rounded text-xs"
                onFocus={(e) => e.currentTarget.select()}
              />
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="colleague@example.com"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <div className="space-y-2">
              {roles.map((role) => (
                <label key={role.value} className="flex items-start">
                  <input
                    type="radio"
                    name="role"
                    value={role.value}
                    checked={formData.role === role.value}
                    onChange={(e) => handleChange('role', e.target.value)}
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <div className="ml-3">
                    <div className="flex items-center">
                      <Shield className="h-4 w-4 text-gray-400 mr-1" />
                      <span className="text-sm font-medium text-gray-900">{role.label}</span>
                    </div>
                    <p className="text-xs text-gray-500">{role.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={sendEmail}
              onChange={(e) => setSendEmail(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">Send invitation via email</span>
          </label>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Personal Message (Optional)
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => handleChange('message', e.target.value)}
              placeholder="Add a personal message to the invitation..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {isSubmitting ? 'Sending Invitation...' : 'Send Invitation'}
          </Button>
        </form>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Invitation Details</h4>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• Invitations expire after 7 days</li>
            <li>• New members start with 0 tokens</li>
            <li>• You can change roles after invitation</li>
            <li>• Team members share your plan's token allocation</li>
          </ul>
        </div>
      </div>
    </div>
  )
}



