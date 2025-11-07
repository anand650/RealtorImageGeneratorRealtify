# Paddle Billing Implementation Summary

This document summarizes the complete migration from Stripe to Paddle as the billing provider.

## ✅ Completed Changes

### 1. Database Schema Updates
- **File**: `prisma/schema.prisma`
- **Changes**:
  - Replaced `stripeCustomerId` → `paddleCustomerId`
  - Replaced `stripeSubscriptionId` → `paddleSubscriptionId`
  - Replaced `stripePriceId` → `paddlePriceId`
  - Replaced `stripeInvoiceId` → `paddleInvoiceId`
- **Action Required**: Run `npx prisma migrate dev --name migrate_to_paddle` to apply changes

### 2. Core Libraries

#### `src/lib/paddle.ts` (NEW)
- Complete Paddle API integration library
- Functions:
  - `ensurePaddleCustomer()` - Create/retrieve Paddle customers
  - `createPaddleCheckoutSession()` - Generate checkout URLs
  - `createPaddleBillingPortalSession()` - Access billing portal
  - `getPaddleSubscription()` - Fetch subscription details
  - `getPaddleInvoices()` - Fetch invoice history
  - `getPlanById()` / `getPlanByPriceId()` - Plan management

#### `src/lib/billing.ts`
- Updated to use Paddle functions instead of Stripe
- All references to `stripeCustomerId` → `paddleCustomerId`

#### `src/lib/subscription-plans.ts`
- Updated `stripePriceId` → `paddlePriceId`
- Updated environment variable references
- Renamed `getPlanByStripePrice()` → `getPlanByPaddlePrice()`

### 3. API Routes

#### `src/app/api/billing/checkout/route.ts`
- Updated error messages to reference Paddle
- Updated environment variable hints

#### `src/app/api/billing/portal/route.ts`
- Updated to use `createPaddleBillingPortalSession()`
- Changed customer ID field references

#### `src/app/api/billing/route.ts`
- Updated to use `getPaddleCustomer()` and `getPaddleInvoices()`
- Removed Stripe payment methods API calls (Paddle handles this differently)

#### `src/app/api/subscriptions/route.ts`
- Updated to use `currentUser()` and `ensureAppUser()` for consistency
- Already uses `createCheckoutSessionForPlan()` which now uses Paddle

#### `src/app/api/webhooks/paddle/route.ts` (NEW)
- Complete Paddle webhook handler
- Handles events:
  - `transaction.completed`
  - `subscription.created`
  - `subscription.updated`
  - `subscription.canceled`
  - `subscription.past_due`
  - `invoice.paid`
  - `invoice.payment_failed`
- Proper signature verification using Paddle's format

### 4. Components

#### `src/components/billing/PlanManagement.tsx`
- Updated billing portal description to mention Paddle
- Already has billing disabled check

#### `src/components/billing/InvoiceHistory.tsx`
- Updated `stripeInvoiceId` → `paddleInvoiceId`
- Updated display text from "Stripe ID" to "Paddle ID"

### 5. Type Definitions

#### `src/types/index.ts`
- Updated all interfaces:
  - `Tenant`: `stripe*` → `paddle*` fields
  - `Subscription`: `stripe*` → `paddle*` fields
  - `Invoice`: `stripeInvoiceId` → `paddleInvoiceId`

### 6. Pages

#### `src/app/(dashboard)/billing/page.tsx`
- Updated invoice interface to use `paddleInvoiceId`

## 📋 Required Environment Variables

Add these to your `.env.local`:

```env
# Paddle API Configuration
PADDLE_API_KEY=your_paddle_api_key_here
PADDLE_ENVIRONMENT=sandbox  # or 'production'
PADDLE_WEBHOOK_SECRET=your_webhook_secret_here

# Paddle Price IDs (from Paddle dashboard)
PADDLE_PRICE_ID_STARTER=pri_xxx
PADDLE_PRICE_ID_PRO=pri_xxx
PADDLE_PRICE_ID_ENTERPRISE=pri_xxx

# Application URL
APP_URL=http://localhost:3000  # or your production URL
```

## 🔄 Migration Steps

1. **Run Database Migration**:
   ```bash
   npx prisma migrate dev --name migrate_to_paddle
   ```

2. **Set Environment Variables**:
   - Get Paddle API key from Paddle dashboard
   - Create products and prices in Paddle
   - Set up webhook endpoint in Paddle dashboard
   - Copy webhook secret

3. **Update Webhook Endpoint**:
   - In Paddle dashboard, configure webhook URL: `https://yourdomain.com/api/webhooks/paddle`
   - Subscribe to all required events (see PADDLE_SETUP.md)

4. **Test in Sandbox**:
   - Set `PADDLE_ENVIRONMENT=sandbox`
   - Test checkout flow
   - Test webhook events using Paddle's webhook simulator

## 🗑️ Files to Remove (Optional)

The following files are no longer needed but kept for reference:
- `src/lib/stripe.ts` - Can be removed after confirming Paddle works
- `src/app/api/webhooks/stripe/route.ts` - Can be removed

## ⚠️ Important Notes

1. **Paddle API Differences**:
   - Paddle doesn't expose payment methods directly like Stripe
   - Payment methods are managed through Paddle's hosted checkout
   - Billing portal URL format may need adjustment based on your Paddle configuration

2. **Checkout Flow**:
   - Uses Paddle's transaction preview API
   - Falls back to direct transaction creation if preview doesn't return checkout URL

3. **Webhook Signature**:
   - Paddle uses format: `ts=timestamp;h1=signature`
   - Signature verification implemented correctly in webhook handler

4. **Database Fields**:
   - Old Stripe fields are completely replaced
   - No migration needed for existing data (new fields are null/optional)

## 🧪 Testing Checklist

- [ ] Database migration completes successfully
- [ ] Checkout flow works (sandbox)
- [ ] Webhook receives events correctly
- [ ] Subscription creation updates tenant
- [ ] Invoice payment resets tokens
- [ ] Billing portal is accessible
- [ ] Error handling works correctly
- [ ] Free tier still works (4 credits)

## 📚 Additional Resources

- See `PADDLE_SETUP.md` for detailed setup instructions
- Paddle API Documentation: https://developer.paddle.com/
- Paddle Webhook Guide: https://developer.paddle.com/webhooks/overview




