'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

export default function AcceptInvitePage() {
  const params = useParams<{ token: string }>()
  const router = useRouter()
  const [status, setStatus] = useState<'loading'|'success'|'error'>('loading')
  const [message, setMessage] = useState('Accepting your invitation...')

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch(`/api/teams/invites/${params.token}`, { method: 'POST' })
        const data = await res.json().catch(() => ({}))
        if (res.status === 401) {
          // Redirect to sign-in and come back after auth
          const redirect = encodeURIComponent(`/invite/${params.token}`)
          setMessage('Redirecting to sign in...')
          setStatus('error')
          setTimeout(() => {
            window.location.href = `/sign-in?redirect_url=${redirect}`
          }, 300)
          return
        }
        if (!res.ok) {
          setMessage(data.error || 'Invitation is invalid or expired.')
          setStatus('error')
          return
        }
        setStatus('success')
        setMessage('Invitation accepted! Redirecting...')
        setTimeout(() => router.replace('/team'), 1000)
      } catch (e) {
        setStatus('error')
        setMessage('Network error while accepting the invitation.')
      }
    }
    run()
  }, [params.token, router])

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className={`px-6 py-4 rounded-md border ${status === 'error' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-700'}`}>
        {message}
      </div>
    </div>
  )
}


