import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { UserInitializer } from '@/components/dashboard/UserInitializer'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Check if authentication is disabled for development
  const isAuthDisabled = process.env.DISABLE_AUTH === 'true'
  
  let user = null
  
  if (!isAuthDisabled) {
    try {
      user = await currentUser()
    } catch (error) {
      console.error('Clerk authentication error:', error)
      // For development, show an error page instead of crashing
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Authentication Error</h1>
            <p className="text-gray-600 mb-4">
              There was an issue with the authentication service.
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Error: {error instanceof Error ? error.message : 'Unknown error'}
            </p>
            <div className="space-y-2">
              <a 
                href="/sign-in" 
                className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mr-2"
              >
                Try Sign In
              </a>
              <p className="text-xs text-gray-400">
                Or set DISABLE_AUTH=true in .env.local for development
              </p>
            </div>
          </div>
        </div>
      )
    }

    if (!user) {
      redirect('/sign-in')
    }
  } else {
    // Development mode - create a mock user
    user = {
      id: 'dev-user',
      firstName: 'Developer',
      lastName: 'User',
      emailAddresses: [{ emailAddress: 'dev@example.com' }]
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <UserInitializer />
      <div className="flex">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
          <DashboardHeader />
          <main className="flex-1 py-4 lg:py-6">
            <div className="px-3 sm:px-4 lg:px-8 max-w-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}



