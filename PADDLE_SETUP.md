# Paddle Billing Integration Setup Guide

This guide explains how to set up Paddle as your billing provider for Realtify.

## Required Environment Variables

Add the following environment variables to your `.env.local` file:

```env
# Paddle API Configuration
PADDLE_API_KEY=your_paddle_api_key_here
PADDLE_ENVIRONMENT=sandbox  # or 'production' when ready
PADDLE_WEBHOOK_SECRET=your_webhook_secret_here

# Paddle Price IDs (get these from your Paddle dashboard)
PADDLE_PRICE_ID_STARTER=pri_xxx
PADDLE_PRICE_ID_PRO=pri_xxx
PADDLE_PRICE_ID_ENTERPRISE=pri_xxx

# Application URL (for redirects)
APP_URL=http://localhost:3000  # or your production URL
```

## Setting Up Paddle

1. **Create a Paddle Account**
   - Go to [Paddle.com](https://www.paddle.com) and create a vendor account
   - Complete the verification process

2. **Create Products and Prices**
   - In your Paddle dashboard, create products for:
     - Starter Plan ($25/month, 50 images)
     - Professional Plan ($50/month, 125 images)
     - Enterprise Plan ($100/month, 300 images)
   - Create subscription prices for each product (recurring monthly)
   - Copy the Price IDs (they start with `pri_`) and add them to your `.env.local`

3. **Get API Keys**
   - Go to Developer Tools > Authentication in your Paddle dashboard
   - Generate API keys for sandbox and production
   - Add `PADDLE_API_KEY` to your `.env.local`

4. **Set Up Webhooks**
   - Go to Developer Tools > Notifications in your Paddle dashboard
   - Add a webhook endpoint: `https://yourdomain.com/api/webhooks/paddle`
   - Subscribe to the following events:
     - `transaction.completed`
     - `subscription.created`
     - `subscription.updated`
     - `subscription.canceled`
     - `subscription.past_due`
     - `invoice.paid`
     - `invoice.payment_failed`
   - Copy the webhook secret and add it as `PADDLE_WEBHOOK_SECRET` in `.env.local`

5. **Configure Customer Portal**
   - In Paddle dashboard, go to Settings > Customer Portal
   - Enable the customer portal for subscription management
   - Configure the portal URL (this will be used for billing management)

## Database Migration

After updating the Prisma schema, run:

```bash
npx prisma migrate dev --name add_paddle_fields
```

This will add the Paddle fields to your database:
- `paddleCustomerId` (replaces `stripeCustomerId`)
- `paddleSubscriptionId` (replaces `stripeSubscriptionId`)
- `paddlePriceId` (replaces `stripePriceId`)
- `paddleInvoiceId` (replaces `stripeInvoiceId`)

## Testing

1. **Sandbox Testing**
   - Set `PADDLE_ENVIRONMENT=sandbox`
   - Use Paddle's test cards: https://developer.paddle.com/concepts/payment-methods/test-cards
   - Test the complete checkout flow
   - Verify webhooks are received correctly

2. **Webhook Testing**
   - Use Paddle's webhook simulator: https://sandbox-vendors.paddle.com/webhook-simulator
   - Send test events and verify your handler responds correctly

## Important Notes

- **Payment Methods**: Paddle manages payment methods through their hosted checkout, unlike Stripe
- **Billing Portal**: The billing portal URL format may vary based on your Paddle configuration
- **Subscriptions**: Paddle handles subscription lifecycle automatically via webhooks
- **Invoices**: Invoice data comes from Paddle webhooks, not direct API calls

## Troubleshooting

### Checkout URL Not Generated
- Verify your Paddle Price IDs are correct
- Check that products are active in Paddle dashboard
- Ensure API key has correct permissions

### Webhooks Not Received
- Verify webhook URL is publicly accessible
- Check webhook secret matches in both Paddle dashboard and `.env.local`
- Ensure webhook endpoint returns 200 status

### Customer Portal Not Working
- Check customer portal is enabled in Paddle dashboard
- Verify portal URL format matches your Paddle configuration
- Ensure customer ID exists in Paddle

For more information, see [Paddle's Developer Documentation](https://developer.paddle.com/)

