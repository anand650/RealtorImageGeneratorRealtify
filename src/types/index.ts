export interface User {
  id: string
  email: string
  firstName?: string
  lastName?: string
  profileImageUrl?: string
  createdAt: Date
  updatedAt: Date
  lastLoginAt?: Date
  clerkId: string
  clerkOrganizationId?: string
  tenantId?: string
  tenant?: Tenant
  preferences?: UserPreferences
}

export interface Tenant {
  id: string
  name: string
  slug: string
  subscriptionPlan: string
  tokensAllocated: number
  tokensUsed: number
  billingStatus: string
  paddleCustomerId?: string
  paddleSubscriptionId?: string
  paddlePriceId?: string
  currentPeriodStart?: Date
  currentPeriodEnd?: Date
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  clerkOrganizationId?: string
}

export interface UserPreferences {
  id: string
  userId: string
  defaultRoomStyle: string
  notificationSettings: Record<string, any>
  dashboardLayout: Record<string, any>
  themePreference: string
  createdAt: Date
  updatedAt: Date
}

export interface Image {
  id: string
  userId: string
  user: User
  tenantId?: string
  tenant?: Tenant
  collectionId?: string
  collection?: ImageCollection
  originalUrl: string
  processedUrl?: string
  thumbnailUrl?: string
  roomType: string
  style: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  tokensUsed: number
  processingTime?: number
  qualityRating?: number
  isFavorite: boolean
  clientNotes?: string
  metadata: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

export interface ImageCollection {
  id: string
  name: string
  description?: string
  userId: string
  user: User
  images: Image[]
  createdAt: Date
  updatedAt: Date
}

export interface RoomPrompt {
  id: string
  roomType: string
  style: string
  promptTemplate: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Subscription {
  id: string
  tenantId: string
  tenant: Tenant
  paddleCustomerId: string
  paddleSubscriptionId?: string
  paddlePriceId?: string
  planName: string
  price: number
  tokensIncluded: number
  status: 'active' | 'canceled' | 'past_due' | 'incomplete'
  currentPeriodStart?: Date
  currentPeriodEnd?: Date
  cancelAtPeriodEnd: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Invoice {
  id: string
  tenantId: string
  tenant: Tenant
  paddleInvoiceId: string
  amount: number
  status: 'paid' | 'open' | 'void' | 'uncollectible'
  dueDate?: Date
  paidDate?: Date
  invoiceUrl?: string
  createdAt: Date
  updatedAt: Date
}

export interface UsageLog {
  id: string
  userId: string
  user: User
  tenantId?: string
  tenant?: Tenant
  action: string
  tokensConsumed: number
  metadata: Record<string, any>
  createdAt: Date
}

export interface TeamMember {
  id: string
  tenantId: string
  tenant: Tenant
  userId: string
  user: User
  role: 'admin' | 'manager' | 'user'
  permissions: Record<string, any>
  invitedBy?: string
  inviter?: User
  joinedAt: Date
  isActive: boolean
}

export interface Notification {
  id: string
  userId: string
  user: User
  type: 'info' | 'warning' | 'error' | 'success'
  title: string
  message: string
  isRead: boolean
  actionUrl?: string
  metadata: Record<string, any>
  createdAt: Date
}

export interface DashboardStats {
  tokensRemaining: number
  tokensUsed: number
  imagesProcessed: number
  subscriptionRenewalDate?: Date
  recentImages: Image[]
  usageThisMonth: number
  usageLastMonth: number
  processingSuccessRate: number
  averageProcessingTime: number
}

export interface BillingInfo {
  currentPlan: string
  nextBillingDate?: Date
  monthlyUsage: number
  totalSpent: number
  invoices: Invoice[]
  paymentMethods: any[]
}

export interface AnalyticsData {
  monthlyUsage: {
    current: number
    previous: number
    trend: string
  }
  popularRoomTypes: Array<{
    type: string
    count: number
    percentage: number
  }>
  processingStats: {
    averageTime: string
    successRate: string
    totalProcessed: number
  }
  tokenUsage: Array<{
    date: string
    tokens: number
  }>
}

export interface ImageGenerationRequest {
  imageUrl: string
  roomType: string
  style: string
  clientNotes?: string
}

export interface ImageGenerationResponse {
  success: boolean
  imageId?: string
  processedUrl?: string
  error?: string
  processingTime?: number
}

export interface RateLimitInfo {
  allowed: boolean
  count: number
  limit: number
  resetTime: number
}



