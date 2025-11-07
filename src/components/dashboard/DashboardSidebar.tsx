'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Logo } from '@/components/ui/Logo'
import {
  Home,
  Image,
  CreditCard,
  BarChart3,
  Users,
  Settings,
  Zap,
  Menu,
  X,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { UsageStatus } from './UsageStatus'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Generate', href: '/generate', icon: Zap },
  { name: 'My Images', href: '/images', icon: Image },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Billing', href: '/billing', icon: CreditCard },
  { name: 'Team', href: '/team', icon: Users },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden">
        <button
          suppressHydrationWarning
          type="button"
          className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-lg border border-gray-200"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X className="h-5 w-5 text-gray-600" />
          ) : (
            <Menu className="h-5 w-5 text-gray-600" />
          )}
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-40 bg-white shadow-lg transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen lg:flex-shrink-0',
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full',
          sidebarCollapsed ? 'w-16' : 'w-64'
        )}
      >
        <div className="flex h-full flex-col overflow-y-auto">
          {/* Logo and Collapse Button */}
          <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4">
            <Link href="/dashboard" className="flex items-center">
              <Logo size="sm" />
            </Link>
            
            {/* Collapse Button - Desktop only */}
            <button
              suppressHydrationWarning
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden lg:block p-1 rounded-md hover:bg-gray-100 transition-colors"
            >
              <Menu className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-4 py-6">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                    isActive
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900',
                    sidebarCollapsed ? 'justify-center' : ''
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                  title={sidebarCollapsed ? item.name : undefined}
                >
                  <item.icon
                    className={cn(
                      'h-5 w-5 flex-shrink-0',
                      isActive ? 'text-blue-700' : 'text-gray-400 group-hover:text-gray-500',
                      sidebarCollapsed ? '' : 'mr-3'
                    )}
                  />
                  {!sidebarCollapsed && item.name}
                </Link>
              )
            })}
          </nav>

          {/* Token/Credits Display - Not sticky, scrolls with content */}
          {!sidebarCollapsed && (
            <div className="border-t border-gray-200 p-4 mt-auto">
              <div className="rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 p-3 border border-blue-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-600">Free Credits</span>
                  <Zap className="h-4 w-4 text-blue-600" />
                </div>
                <UsageStatus />
              </div>
            </div>
          )}

          {/* User info */}
          <div className="border-t border-gray-200 p-4">
            <div className={cn(
              "flex items-center",
              sidebarCollapsed ? "justify-center" : "space-x-3"
            )}>
              <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                <span className="text-sm font-medium text-gray-700">U</span>
              </div>
              {!sidebarCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    User Name
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    user@example.com
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </>
  )
}



