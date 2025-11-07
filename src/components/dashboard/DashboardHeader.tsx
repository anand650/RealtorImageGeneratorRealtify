'use client'

import { Bell, Search, Sparkles, Building2, Zap } from 'lucide-react'
import { UserButton } from '@clerk/nextjs'
import { useState } from 'react'
import { UsageStatus } from './UsageStatus'
import { Logo } from '@/components/ui/Logo'

export function DashboardHeader() {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-luxury-200/50 shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8">
        {/* Mobile Layout */}
        <div className="flex h-16 lg:h-20 items-center justify-between lg:hidden">
          {/* Mobile Logo */}
          <Logo size="sm" />

          {/* Mobile Right Side */}
          <div className="flex items-center space-x-2">
            {/* Mobile Usage Status */}
            <div className="hidden sm:block">
              <UsageStatus />
            </div>

            {/* Mobile Notifications */}
            <button
              type="button"
              className="relative rounded-xl bg-luxury-50 p-2 text-luxury-400 hover:text-luxury-600 hover:bg-luxury-100 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2 transition-all duration-200"
              suppressHydrationWarning
            >
              <span className="absolute -inset-1" />
              <span className="sr-only">View notifications</span>
              <Bell className="h-5 w-5" />
              <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-gradient-to-r from-gold-400 to-gold-500 text-xs text-white flex items-center justify-center font-bold">
                3
              </span>
            </button>

            {/* Mobile User menu */}
            <UserButton 
              afterSignOutUrl="/" 
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8 rounded-xl",
                  userButtonPopoverCard: "rounded-xl shadow-xl border border-luxury-200",
                  userButtonPopoverActionButton: "rounded-lg hover:bg-luxury-50"
                }
              }}
            />
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:flex h-20 items-center justify-between">
          {/* Desktop Logo */}
          <Logo size="md" />

          {/* Desktop Search */}
          <div className="flex flex-1 items-center justify-center max-w-2xl mx-8">
            <div className="relative w-full">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <Search className="h-5 w-5 text-luxury-400" />
              </div>
              <input
                type="text"
                placeholder="Search images, rooms, or styles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full rounded-2xl border-0 py-4 pl-12 pr-4 text-luxury-900 ring-2 ring-inset ring-luxury-200 placeholder:text-luxury-400 focus:ring-2 focus:ring-inset focus:ring-gold-500 focus:border-transparent bg-luxury-50/50 backdrop-blur-sm text-sm leading-6"
                suppressHydrationWarning
              />
            </div>
          </div>

          {/* Desktop Right side */}
          <div className="flex items-center space-x-6">
            {/* Usage Status */}
            <UsageStatus />

            {/* Quick Stats */}
            <div className="hidden xl:flex items-center space-x-6">
              <div className="text-center">
                <div className="text-lg font-bold text-luxury-900">0</div>
                <div className="text-xs text-luxury-600">Images</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-gold-600">100%</div>
                <div className="text-xs text-luxury-600">Success</div>
              </div>
            </div>

            {/* Notifications */}
            <button
              type="button"
              className="relative rounded-2xl bg-luxury-50 p-3 text-luxury-400 hover:text-luxury-600 hover:bg-luxury-100 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2 transition-all duration-200"
              suppressHydrationWarning
            >
              <span className="absolute -inset-1.5" />
              <span className="sr-only">View notifications</span>
              <Bell className="h-6 w-6" />
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-gradient-to-r from-gold-400 to-gold-500 text-xs text-white flex items-center justify-center font-bold">
                3
              </span>
            </button>

            {/* User menu */}
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <div className="text-sm font-semibold text-luxury-900">Welcome back!</div>
                <div className="text-xs text-luxury-600">Ready to create?</div>
              </div>
              <UserButton 
                afterSignOutUrl="/" 
                appearance={{
                  elements: {
                    avatarBox: "w-12 h-12 rounded-2xl",
                    userButtonPopoverCard: "rounded-2xl shadow-xl border border-luxury-200",
                    userButtonPopoverActionButton: "rounded-xl hover:bg-luxury-50"
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}



