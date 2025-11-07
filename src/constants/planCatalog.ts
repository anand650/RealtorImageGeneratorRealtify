export interface PlanDefinition {
  id: 'starter' | 'professional' | 'enterprise'
  name: string
  price: number // in cents
  tokens: number
  billingIntervalDays: number
  features: string[]
}

const BASE_FEATURES = [
  'Full access to all enhancement features',
  'Shared quota across invited team members',
  'Standard support response times',
]

export const PLAN_CATALOG: PlanDefinition[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 2500,
    tokens: 50,
    billingIntervalDays: 30,
    features: BASE_FEATURES,
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 5000,
    tokens: 125,
    billingIntervalDays: 30,
    features: BASE_FEATURES,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 10000,
    tokens: 300,
    billingIntervalDays: 30,
    features: BASE_FEATURES,
  },
]

export function formatPrice(amountCents: number) {
  return `$${(amountCents / 100).toFixed(0)}`
}



