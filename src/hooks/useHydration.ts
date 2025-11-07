'use client'

import { useEffect, useState } from 'react'

/**
 * Hook to handle hydration mismatches caused by browser extensions
 * Returns true only after the component has hydrated on the client
 */
export function useHydration() {
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  return isHydrated
}

/**
 * Hook to get a stable ID that won't cause hydration mismatches
 * Useful for form elements that might get modified by browser extensions
 */
export function useStableId(prefix: string = 'id') {
  const [id, setId] = useState('')
  
  useEffect(() => {
    setId(`${prefix}-${Math.random().toString(36).substr(2, 9)}`)
  }, [prefix])

  return id
}
