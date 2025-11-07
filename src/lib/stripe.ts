import Stripe from 'stripe'
import { TOKEN_PLANS, TokenPlan } from './tokens'

const STRIPE_API_VERSION = '2025-09-30.clover' as Stripe.StripeConfig['apiVersion']

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: STRIPE_API_VERSION,
})

const PLAN_PRICE_ENV_KEYS: Record<string, string> = {
  starter: 'STRIPE_PRICE_STARTER',
  professional: 'STRIPE_PRICE_PRO',
  enterprise: 'STRIPE_PRICE_ENTERPRISE',
}

export type StripePlanConfig = TokenPlan & { priceId?: string }

export const STRIPE_PLANS: Record<string, StripePlanConfig> = TOKEN_PLANS.reduce((acc, plan) => {
  const envKey = PLAN_PRICE_ENV_KEYS[plan.id]
  acc[plan.id] = {
    ...plan,
    priceId: envKey ? process.env[envKey] : undefined,
  }
  return acc
}, {} as Record<string, StripePlanConfig>)

export function getPlanById(planId: string): StripePlanConfig | undefined {
  return STRIPE_PLANS[planId]
}

export function getPlanByPriceId(priceId: string): StripePlanConfig | undefined {
  return Object.values(STRIPE_PLANS).find((plan) => plan.priceId === priceId)
}

export function getPriceIdForPlan(planId: string): string {
  const envKey = PLAN_PRICE_ENV_KEYS[planId]
  const priceId = envKey ? process.env[envKey] : undefined

  if (!priceId) {
    throw new Error(`Missing Stripe price ID for plan "${planId}". Set ${envKey} in your environment.`)
  }

  return priceId
}

export async function ensureStripeCustomer(email: string, name: string | null, tenantId: string, existingCustomerId?: string) {
  if (existingCustomerId) {
    return await stripe.customers.retrieve(existingCustomerId)
  }

  return await stripe.customers.create({
    email,
    name: name || undefined,
    metadata: {
      tenantId,
    },
  })
}

export async function createStripeCheckoutSession(params: {
  customerId: string
  planId: string
  successUrl: string
  cancelUrl: string
  metadata?: Record<string, string>
}) {
  const priceId = getPriceIdForPlan(params.planId)

  return await stripe.checkout.sessions.create({
    customer: params.customerId,
    mode: 'subscription',
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    allow_promotion_codes: true,
    subscription_data: {
      metadata: {
        planId: params.planId,
        ...params.metadata,
      },
    },
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    metadata: {
      planId: params.planId,
      ...params.metadata,
    },
  })
}

export async function createBillingPortalSession(customerId: string, returnUrl: string) {
  return await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  })
}

export async function getStripeSubscription(subscriptionId: string) {
  return await stripe.subscriptions.retrieve(subscriptionId, {
    expand: ['latest_invoice', 'customer'],
  })
}

export async function getStripeInvoices(customerId: string, limit = 10) {
  return await stripe.invoices.list({
    customer: customerId,
    limit,
  })
}

