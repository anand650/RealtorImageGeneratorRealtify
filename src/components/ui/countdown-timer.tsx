'use client'

import { useEffect, useState } from 'react'
import { Clock } from 'lucide-react'

interface CountdownTimerProps {
  hours: number
  minutes: number
  seconds: number
}

function CountdownTimer({ hours, minutes, seconds }: CountdownTimerProps) {
  return (
    <div className="flex items-center gap-2 text-white font-bold">
      <Clock className="h-4 w-4" />
      <div className="flex items-center gap-1">
        <span className="bg-white/20 backdrop-blur-sm px-2 py-1 rounded text-sm">
          {String(hours).padStart(2, '0')}
        </span>
        <span>:</span>
        <span className="bg-white/20 backdrop-blur-sm px-2 py-1 rounded text-sm">
          {String(minutes).padStart(2, '0')}
        </span>
        <span>:</span>
        <span className="bg-white/20 backdrop-blur-sm px-2 py-1 rounded text-sm">
          {String(seconds).padStart(2, '0')}
        </span>
      </div>
    </div>
  )
}

export function LaunchOfferTimer() {
  const [timeLeft, setTimeLeft] = useState({ hours: 24, minutes: 0, seconds: 0 })
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    
    const getTimeUntilNextReset = () => {
      // Get the last reset time from localStorage, or use current time
      const lastResetKey = 'launchOfferLastReset'
      const lastReset = localStorage.getItem(lastResetKey)
      const now = Date.now()
      
      let resetTime: number
      
      if (lastReset) {
        const lastResetTime = parseInt(lastReset)
        const timeSinceReset = now - lastResetTime
        const hoursSinceReset = timeSinceReset / (1000 * 60 * 60)
        
        // If 24 hours have passed, reset the timer
        if (hoursSinceReset >= 24) {
          resetTime = now + (24 * 60 * 60 * 1000) // 24 hours from now
          localStorage.setItem(lastResetKey, now.toString())
        } else {
          // Continue from where we left off
          resetTime = lastResetTime + (24 * 60 * 60 * 1000)
        }
      } else {
        // First time - set reset time to 24 hours from now
        resetTime = now + (24 * 60 * 60 * 1000)
        localStorage.setItem(lastResetKey, now.toString())
      }
      
      return resetTime
    }

    const updateTimer = () => {
      const resetTime = getTimeUntilNextReset()
      const now = Date.now()
      const difference = resetTime - now

      if (difference > 0) {
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((difference % (1000 * 60)) / 1000)

        setTimeLeft({ hours, minutes, seconds })
      } else {
        // Timer expired, reset it
        localStorage.removeItem('launchOfferLastReset')
        setTimeLeft({ hours: 24, minutes: 0, seconds: 0 })
      }
    }

    // Update immediately
    updateTimer()

    // Update every second
    const interval = setInterval(updateTimer, 1000)

    return () => clearInterval(interval)
  }, [])

  if (!isClient) {
    return (
      <div className="flex items-center gap-2 text-white font-bold">
        <Clock className="h-4 w-4" />
        <div className="flex items-center gap-1">
          <span className="bg-white/20 backdrop-blur-sm px-2 py-1 rounded text-sm">24</span>
          <span>:</span>
          <span className="bg-white/20 backdrop-blur-sm px-2 py-1 rounded text-sm">00</span>
          <span>:</span>
          <span className="bg-white/20 backdrop-blur-sm px-2 py-1 rounded text-sm">00</span>
        </div>
      </div>
    )
  }

  return <CountdownTimer {...timeLeft} />
}

