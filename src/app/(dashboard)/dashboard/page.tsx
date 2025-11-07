import { currentUser } from '@clerk/nextjs/server'
import { UserButton } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Zap, 
  Image, 
  BarChart3, 
  Settings, 
  Camera, 
  TrendingUp, 
  Clock, 
  Award,
  Sparkles,
  ArrowRight,
  Plus,
  Eye,
  Download,
  Folder,
  Share2,
  FolderTree
} from 'lucide-react'
import Link from 'next/link'
import { getTokenUsage } from '@/lib/tokens'
import { prisma } from '@/lib/prisma'
import { ensureAppUser } from '@/lib/userSync'

export default async function DashboardPage() {
  const user = await currentUser()
  
  if (!user) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-32 bg-gray-200 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const tokenUsage = await getTokenUsage(user.id)
  
  // Get real stats for the user
  const ensured = await ensureAppUser(user)
  if (!ensured.user) {
    return <div>Error loading user data</div>
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: ensured.user.id },
    include: { tenant: true }
  })

  if (!dbUser) {
    return <div>User not found</div>
  }

  // Calculate success rate from actual data
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  
  const tenantWhere = dbUser.tenantId ? { tenantId: dbUser.tenantId } : { userId: dbUser.id }
  
  const [totalImages, completedImages, totalImagesAllTime] = await Promise.all([
    prisma.image.count({
      where: { ...tenantWhere, createdAt: { gte: thirtyDaysAgo } }
    }),
    prisma.image.count({
      where: { ...tenantWhere, status: 'completed', createdAt: { gte: thirtyDaysAgo } }
    }),
    prisma.image.count({
      where: tenantWhere
    })
  ])

  const successRate = totalImages > 0 
    ? Math.round((completedImages / totalImages) * 100)
    : 0

  return (
    <div className="min-h-screen bg-luxury-gradient">
      <div className="space-y-6 lg:space-y-8">
        {/* Welcome header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-luxury-900 via-luxury-800 to-luxury-900 rounded-2xl lg:rounded-3xl p-4 sm:p-6 lg:p-8 text-white">
          <div className="absolute inset-0 bg-luxury-pattern opacity-20"></div>
          <div className="relative">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">
                  Welcome back, {user?.firstName || 'User'}! 👋
                </h1>
                <p className="text-base sm:text-lg lg:text-xl text-luxury-200 mb-4 lg:mb-6">
                  Ready to transform your real estate listings with AI-powered image enhancement?
                </p>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                  <Link href="/generate" className="flex-1">
                    <Button className="btn-gold text-base lg:text-lg px-6 lg:px-8 py-3 lg:py-4 w-full sm:w-auto">
                      <Camera className="mr-2 h-4 w-4 lg:h-5 lg:w-5" />
                      Create New Image
                    </Button>
                  </Link>
                  <Link href="/images" className="flex-1">
                    <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 text-base lg:text-lg px-6 lg:px-8 py-3 lg:py-4 w-full sm:w-auto">
                      <Eye className="mr-2 h-4 w-4 lg:h-5 lg:w-5" />
                      View Gallery
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="hidden lg:block lg:ml-8">
                <div className="w-32 h-32 bg-gradient-to-br from-gold-400/20 to-gold-500/20 rounded-full flex items-center justify-center animate-float">
                  <Sparkles className="h-16 w-16 text-gold-400" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="card-luxury-gradient border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-semibold text-luxury-700">Images Generated</CardTitle>
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <Image className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-luxury-900 mb-1">{totalImages}</div>
              <p className="text-xs sm:text-sm text-luxury-600 flex items-center">
                <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 mr-1 text-green-500" />
                Last 30 days ({totalImagesAllTime} total)
              </p>
            </CardContent>
          </Card>
          
          <Card className="card-luxury-gradient border-l-4 border-l-gold-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-semibold text-luxury-700">Tokens Remaining</CardTitle>
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gold-100 flex items-center justify-center">
                <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-gold-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-luxury-900 mb-1">{tokenUsage?.tokensRemaining || 0}</div>
              <p className="text-xs sm:text-sm text-luxury-600">
                Out of {tokenUsage?.tokensAllocated || 0} this month
              </p>
            </CardContent>
          </Card>
          
          <Card className="card-luxury-gradient border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-semibold text-luxury-700">Success Rate</CardTitle>
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-green-100 flex items-center justify-center">
                <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-luxury-900 mb-1">{successRate}%</div>
              <p className="text-xs sm:text-sm text-luxury-600 flex items-center">
                <Award className="h-3 w-3 sm:h-4 sm:w-4 mr-1 text-green-500" />
                Last 30 days ({completedImages}/{totalImages})
              </p>
            </CardContent>
          </Card>
          
          <Card className="card-luxury-gradient border-l-4 border-l-purple-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-semibold text-luxury-700">Current Plan</CardTitle>
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                <Settings className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-luxury-900 mb-1">{tokenUsage?.plan?.name || 'Starter'}</div>
              <p className="text-xs sm:text-sm text-luxury-600">
                ${(tokenUsage?.plan?.price || 2500) / 100}/month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card className="card-luxury-gradient group hover:shadow-2xl transition-all duration-300">
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Camera className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-xl sm:text-2xl font-bold text-luxury-900">Generate New Image</CardTitle>
                  <CardDescription className="text-luxury-600 text-sm sm:text-base">
                    Upload a room image and let AI enhance it with beautiful furniture and styling.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Link href="/generate">
                <Button className="btn-gold w-full text-base sm:text-lg py-4 sm:py-6 group-hover:scale-105 transition-transform duration-300">
                  <Plus className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  Start Creating
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </Link>
            </CardContent>
          </Card>
          
          <Card className="card-luxury-gradient group hover:shadow-2xl transition-all duration-300">
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-gold-500 to-gold-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Eye className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-xl sm:text-2xl font-bold text-luxury-900">View Gallery</CardTitle>
                  <CardDescription className="text-luxury-600 text-sm sm:text-base">
                    Browse through your previously generated images and manage your collection.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Link href="/images">
                <Button variant="outline" className="w-full text-base sm:text-lg py-4 sm:py-6 border-2 border-luxury-300 text-luxury-700 hover:bg-luxury-50 group-hover:scale-105 transition-all duration-300">
                  <Image className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  View Gallery
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* File Organization Feature */}
        <Card className="card-luxury-gradient border-2 border-gold-200 bg-gradient-to-br from-gold-50/50 to-white">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
                <FolderTree className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-xl sm:text-2xl font-bold text-luxury-900 mb-2">
                  Advanced File Organization
                </CardTitle>
                <CardDescription className="text-luxury-600 text-sm sm:text-base">
                  Store, organize, and manage all your images directly on the platform. Create custom folders for each customer or property to keep everything organized and easily accessible.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="flex items-start space-x-3 p-4 rounded-lg bg-white/60 border border-luxury-200">
                <div className="flex-shrink-0 mt-1">
                  <Folder className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-luxury-900 mb-1">Organize by Folders</h4>
                  <p className="text-sm text-luxury-600">
                    Create folders for customers, properties, or projects. Organize images exactly how you need them.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-4 rounded-lg bg-white/60 border border-luxury-200">
                <div className="flex-shrink-0 mt-1">
                  <Download className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-luxury-900 mb-1">Direct Download</h4>
                  <p className="text-sm text-luxury-600">
                    Download images directly from the platform. No need to export or transfer files elsewhere.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-4 rounded-lg bg-white/60 border border-luxury-200">
                <div className="flex-shrink-0 mt-1">
                  <Share2 className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-luxury-900 mb-1">Easy Sharing</h4>
                  <p className="text-sm text-luxury-600">
                    Share images with clients and team members directly from your organized folders.
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-luxury-50 rounded-lg p-4 border border-luxury-200">
              <div className="flex items-start space-x-3">
                <Award className="h-5 w-5 text-gold-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-luxury-900 mb-1">Track Every Photo</h4>
                  <p className="text-sm text-luxury-600">
                    Use our built-in file management system to track photos for each customer or property. Never lose track of your images again.
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <Link href="/images">
                <Button className="w-full sm:w-auto btn-gold text-base sm:text-lg px-8 py-6">
                  <Folder className="mr-2 h-5 w-5" />
                  Manage Your Files
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


