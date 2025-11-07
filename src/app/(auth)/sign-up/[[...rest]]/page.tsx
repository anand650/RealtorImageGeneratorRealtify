'use client'

import { useEffect, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { SignUp, useAuth } from '@clerk/nextjs'

export default function SignUpPage() {
  const { isSignedIn, isLoaded } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  const redirectTarget = useMemo(() => {
    const param = searchParams.get('redirect_url')

    if (!param) {
      return '/dashboard'
    }

    try {
      if (param.startsWith('/')) {
        return param
      }

      if (typeof window === 'undefined') {
        return '/dashboard'
      }

      const url = new URL(param)
      if (url.origin !== window.location.origin) {
        return '/dashboard'
      }
      return `${url.pathname}${url.search}${url.hash}` || '/dashboard'
    } catch (error) {
      console.warn('Invalid redirect_url provided to sign-up page:', error)
      return '/dashboard'
    }
  }, [searchParams])

  useEffect(() => {
    if (!isLoaded) {
      return
    }

    if (isSignedIn) {
      router.replace(redirectTarget)
    }
  }, [isLoaded, isSignedIn, router, redirectTarget])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Start enhancing your real estate images with AI
          </p>
        </div>
        <div className="flex justify-center">
          <SignUp
            appearance={{ elements: { rootBox: 'w-full' } }}
            forceRedirectUrl={redirectTarget}
            signInFallbackRedirectUrl={redirectTarget}
          />
        </div>
      </div>
    </div>
  )
}

