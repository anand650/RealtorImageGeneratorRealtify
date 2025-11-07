import { TOKEN_PLANS, TokenPlan } from './tokens'

// Paddle API configuration
const PADDLE_API_KEY = process.env.PADDLE_API_KEY || ''
const PADDLE_ENVIRONMENT = process.env.PADDLE_ENVIRONMENT || 'sandbox' // 'sandbox' or 'production'
const PADDLE_API_URL = PADDLE_ENVIRONMENT === 'production' 
  ? 'https://api.paddle.com'
  : 'https://sandbox-api.paddle.com'

// Paddle Product/Price IDs from environment variables
const PLAN_PRICE_ENV_KEYS: Record<string, string> = {
  starter: 'PADDLE_PRICE_ID_STARTER',
  professional: 'PADDLE_PRICE_ID_PRO',
  enterprise: 'PADDLE_PRICE_ID_ENTERPRISE',
}

export type PaddlePlanConfig = TokenPlan & { priceId?: string }

export const PADDLE_PLANS: Record<string, PaddlePlanConfig> = TOKEN_PLANS.reduce((acc, plan) => {
  const envKey = PLAN_PRICE_ENV_KEYS[plan.id]
  acc[plan.id] = {
    ...plan,
    priceId: envKey ? process.env[envKey] : undefined,
  }
  return acc
}, {} as Record<string, PaddlePlanConfig>)

export function getPlanById(planId: string): PaddlePlanConfig | undefined {
  return PADDLE_PLANS[planId]
}

export function getPlanByPriceId(priceId: string): PaddlePlanConfig | undefined {
  return Object.values(PADDLE_PLANS).find((plan) => plan.priceId === priceId)
}

export function getPriceIdForPlan(planId: string): string {
  const envKey = PLAN_PRICE_ENV_KEYS[planId]
  const priceId = envKey ? process.env[envKey] : undefined

  if (!priceId) {
    throw new Error(`Missing Paddle price ID for plan "${planId}". Set ${envKey} in your environment.`)
  }

  return priceId
}

// Paddle API client helper
async function paddleRequest(endpoint: string, method: string = 'GET', body?: any) {
  const url = `${PADDLE_API_URL}${endpoint}`
  
  const response = await fetch(url, {
    method,
    headers: {
      'Authorization': `Bearer ${PADDLE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }))
    throw new Error(`Paddle API error: ${error.message || response.statusText}`)
  }

  return response.json()
}

// Create or retrieve a Paddle customer
export async function ensurePaddleCustomer(email: string, name: string | null, tenantId: string, existingCustomerId?: string) {
  if (existingCustomerId) {
    try {
      return await paddleRequest(`/customers/${existingCustomerId}`)
    } catch (error) {
      console.error('Error retrieving Paddle customer:', error)
      // If customer not found, create a new one
    }
  }

  // Create new customer
  return await paddleRequest('/customers', 'POST', {
    email,
    name: name || undefined,
    custom_data: {
      tenantId,
    },
  })
}

// Create a Paddle checkout transaction
export async function createPaddleCheckoutSession(params: {
  customerId: string
  planId: string
  successUrl: string
  cancelUrl: string
  metadata?: Record<string, string>
}) {
  const priceId = getPriceIdForPlan(params.planId)

  // Create a transaction preview to get checkout URL
  const preview = await paddleRequest('/transactions/preview', 'POST', {
    items: [
      {
        price_id: priceId,
        quantity: 1,
      },
    ],
    customer_id: params.customerId,
    currency_code: 'USD',
    custom_data: {
      planId: params.planId,
      tenantId: params.metadata?.tenantId,
    },
  })

  // Get checkout URL from preview
  if (!preview.checkout || !preview.checkout.url) {
    // If preview doesn't have checkout URL, create actual transaction
    const transaction = await paddleRequest('/transactions', 'POST', {
      items: [
        {
          price_id: priceId,
          quantity: 1,
        },
      ],
      customer_id: params.customerId,
      currency_code: 'USD',
      custom_data: {
        planId: params.planId,
        tenantId: params.metadata?.tenantId,
      },
    })

    // Paddle checkout URL is typically in the transaction response
    const checkoutUrl = transaction.checkout?.url || transaction.url
    
    if (!checkoutUrl) {
      throw new Error('Failed to generate checkout URL')
    }

    return {
      id: transaction.id,
      url: checkoutUrl,
      customer_id: params.customerId,
    }
  }

  return {
    id: preview.id || `preview_${Date.now()}`,
    url: preview.checkout.url,
    customer_id: params.customerId,
  }
}

// Create a Paddle billing portal session
export async function createPaddleBillingPortalSession(customerId: string, returnUrl: string) {
  // Paddle's customer portal URL format
  // The portal URL is typically: https://pay.paddle.com/portal/customers/{customerId}/update
  // Or configured in your Paddle dashboard settings
  const portalBaseUrl = PADDLE_ENVIRONMENT === 'production'
    ? 'https://pay.paddle.com'
    : 'https://sandbox-vendors.paddle.com'
  
  try {
    // Try to get customer portal URL from API if available
    const customer = await paddleRequest(`/customers/${customerId}`)
    if (customer.portal_url) {
      return { url: customer.portal_url }
    }
  } catch (error) {
    console.error('Error fetching customer portal URL:', error)
  }

  // Fallback: construct portal URL manually
  // Note: This may need to be configured in your Paddle dashboard
  const portalUrl = `${portalBaseUrl}/portal/customers/${customerId}/update?return_url=${encodeURIComponent(returnUrl)}`
  
  return { url: portalUrl }
}

// Get Paddle subscription
export async function getPaddleSubscription(subscriptionId: string) {
  return await paddleRequest(`/subscriptions/${subscriptionId}`)
}

// Get Paddle customer invoices
export async function getPaddleInvoices(customerId: string, limit: number = 10) {
  return await paddleRequest(`/transactions?customer_id=${customerId}&per_page=${limit}`)
}

// Get Paddle customer
export async function getPaddleCustomer(customerId: string) {
  return await paddleRequest(`/customers/${customerId}`)
}

