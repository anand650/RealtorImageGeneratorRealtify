'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'

export function UserInitializer() {
  const { user, isLoaded } = useUser()
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    if (isLoaded && user && !initialized) {
      // Initialize user in our database
      fetch('/api/users/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            setInitialized(true)
          }
        })
        .catch(error => {
          console.error('User initialization error:', error)
        })
    }
  }, [isLoaded, user, initialized])

  return null // This component doesn't render anything
}
