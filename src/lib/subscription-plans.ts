export interface SubscriptionPlan {
  id: string
  name: string
  description: string
  price: number // in cents
  tokensIncluded: number
  features: string[]
  paddlePriceId?: string
  popular?: boolean
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Perfect for individual realtors getting started',
    price: 2500, // $25.00
    tokensIncluded: 50,
    features: [
      '50 AI-enhanced images per month',
      'Basic room types and styles',
      'Standard image quality',
      'Email support',
      'Image history and downloads'
    ],
    paddlePriceId: process.env.PADDLE_PRICE_ID_STARTER
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'Ideal for active real estate professionals',
    price: 5000, // $50.00
    tokensIncluded: 125,
    features: [
      '125 AI-enhanced images per month',
      'All room types and styles',
      'High-quality image generation',
      'Priority email support',
      'Advanced image organization',
      'Bulk image processing',
      'Custom style preferences'
    ],
    popular: true,
    paddlePriceId: process.env.PADDLE_PRICE_ID_PRO
  },
  {
    id: 'business',
    name: 'Business',
    description: 'For real estate teams and agencies',
    price: 10000, // $100.00
    tokensIncluded: 300,
    features: [
      '300 AI-enhanced images per month',
      'All room types and styles',
      'Ultra-high quality generation',
      'Team collaboration tools',
      'Priority email support',
      'Advanced analytics dashboard',
      'Bulk image processing'
    ],
    paddlePriceId: process.env.PADDLE_PRICE_ID_ENTERPRISE
  }
]

export function getPlanById(planId: string): SubscriptionPlan | undefined {
  return SUBSCRIPTION_PLANS.find(plan => plan.id === planId)
}

export function getPlanByPaddlePrice(paddlePriceId: string): SubscriptionPlan | undefined {
  return SUBSCRIPTION_PLANS.find(plan => plan.paddlePriceId === paddlePriceId)
}

export function formatPrice(priceInCents: number): string {
  return `$${(priceInCents / 100).toFixed(2)}`
}

export function getRecommendedPlan(): SubscriptionPlan {
  return SUBSCRIPTION_PLANS.find(plan => plan.popular) || SUBSCRIPTION_PLANS[1]
}

export function comparePlans(currentPlanId: string, targetPlanId: string): {
  isUpgrade: boolean
  isDowngrade: boolean
  priceDifference: number
  tokenDifference: number
} {
  const currentPlan = getPlanById(currentPlanId)
  const targetPlan = getPlanById(targetPlanId)
  
  if (!currentPlan || !targetPlan) {
    throw new Error('Invalid plan comparison')
  }
  
  const priceDifference = targetPlan.price - currentPlan.price
  const tokenDifference = targetPlan.tokensIncluded - currentPlan.tokensIncluded
  
  return {
    isUpgrade: priceDifference > 0,
    isDowngrade: priceDifference < 0,
    priceDifference,
    tokenDifference
  }
}
