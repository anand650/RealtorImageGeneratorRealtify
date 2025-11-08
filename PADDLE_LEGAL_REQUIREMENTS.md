# Paddle Legal Requirements - Compliance Checklist

This document outlines the legal pages and requirements for Paddle account verification.

## ✅ Required Legal Pages (All Created)

### 1. Terms of Service (`/terms`)
- **Status**: ✅ Complete
- **Location**: `src/app/terms/page.tsx`
- **Includes**:
  - Acceptance of terms
  - Service description
  - User accounts
  - **Subscription plans and billing** (updated with Paddle references)
  - Acceptable use policy
  - Intellectual property
  - Limitation of liability
  - Termination
  - Changes to terms
  - **Contact information** (enhanced with mailing address placeholder)
- **Paddle-Specific Updates**:
  - Mentions Paddle as payment processor
  - References Paddle's terms and conditions
  - Clear billing authorization language

### 2. Privacy Policy (`/privacy`)
- **Status**: ✅ Complete
- **Location**: `src/app/privacy/page.tsx`
- **Includes**:
  - Data collection practices
  - **Payment information (mentions Paddle)**
  - Data usage
  - Data storage and security
  - Data sharing and disclosure
  - Cookies and tracking
  - User rights (GDPR compliance)
  - Children's privacy
  - International data transfers
  - Contact information
- **Paddle-Specific**: Already mentions Paddle for payment processing

### 3. Refund Policy (`/refund`)
- **Status**: ✅ Complete
- **Location**: `src/app/refund/page.tsx`
- **Includes**:
  - Subscription refund terms
  - Refund request process
  - Eligible refund circumstances
  - Non-refundable items
  - Processing times
  - Cancellation policy
  - Free trial terms
  - Chargeback policy
  - **Payment processing (Paddle)**
  - Contact information
- **Paddle-Specific Updates**: Added section on Paddle payment processing

### 4. Cookie Policy (`/cookies`)
- **Status**: ✅ Complete (Recreated)
- **Location**: `src/app/cookies/page.tsx`
- **Includes**:
  - Explanation of cookies
  - Types of cookies used
  - Third-party cookies (including Paddle)
  - Cookie management instructions
  - Do Not Track policy
  - Contact information

## 🔗 Page Links

All legal pages are linked in the footer of the main landing page (`src/app/page.tsx`):
- Terms of Service
- Privacy Policy
- Refund Policy
- Cookie Policy

## 📋 Additional Requirements for Paddle Verification

### Contact Information
- ✅ Email: support@realtify.studio (used throughout)
- ✅ Privacy email: privacy@realtify.com
- ⚠️ **Action Required**: Update mailing address placeholder in Terms of Service
  - Current: `[Your Business Address - Update with actual address]`
  - Replace with actual business/company address

### Pricing Transparency
- ✅ Pricing clearly displayed on landing page
- ✅ Subscription plans with clear pricing
- ✅ Free trial information included

### Required Information for Paddle Account Setup

1. **Business Information**:
   - Company name: Realtify
   - Business address: [Update with actual address]
   - Business type: [SaaS/Software]
   - Tax ID/EIN: [If applicable]

2. **Bank Account**:
   - For receiving payments from Paddle
   - Must match business information

3. **Legal Documents**:
   - ✅ Terms of Service
   - ✅ Privacy Policy
   - ✅ Refund Policy
   - ✅ Cookie Policy (if required in your jurisdiction)

4. **Website Requirements**:
   - ✅ All legal pages accessible
   - ✅ Links in footer
   - ✅ Clear contact information
   - ✅ Pricing information visible

## 🎯 Next Steps for Paddle Verification

1. **Update Business Address**:
   - Edit `src/app/terms/page.tsx`
   - Replace `[Your Business Address - Update with actual address]` with actual address

2. **Verify Contact Information**:
- Ensure support@realtify.studio is active and monitored
   - Ensure privacy@realtify.com is active (if using)
   - Update any placeholder email addresses if needed

3. **Test All Links**:
   - Verify `/terms` page loads correctly
   - Verify `/privacy` page loads correctly
   - Verify `/refund` page loads correctly
   - Verify `/cookies` page loads correctly

4. **Prepare Paddle Application**:
   - Gather business registration documents
   - Prepare bank account information
   - Have business address ready
   - Have tax identification ready (if applicable)

5. **Submit for Verification**:
   - Complete Paddle merchant application
   - Provide links to all legal pages
   - Provide business documentation
   - Wait for Paddle review (typically 1-3 business days)

## 📝 Notes

- All pages use dynamic dates (`new Date().toLocaleDateString()`) - update to static dates for production
- Consider adding a "Last updated" date tracking system for compliance
- All pages are mobile-responsive and accessible
- Legal pages are accessible without authentication (as required)

## 🔍 Verification Checklist

Before submitting to Paddle, verify:

- [ ] All legal pages are accessible at public URLs
- [ ] Terms of Service includes Paddle payment processor mention
- [ ] Privacy Policy includes Paddle in data sharing section
- [ ] Refund Policy includes Paddle payment processing information
- [ ] Cookie Policy mentions Paddle (if using cookies)
- [ ] Contact information is complete and accurate
- [ ] Business address is updated (not placeholder)
- [ ] All links in footer work correctly
- [ ] Pages are mobile-friendly
- [ ] No placeholder text remains in legal pages

## 🚀 Deployment Notes

When deploying to production:

1. Update all email addresses to production addresses
2. Update business address in Terms of Service
3. Update website URLs from `realtify.com` to actual domain
4. Consider adding a legal notice page or disclaimer if required
5. Ensure all pages are indexed (if desired) or add `noindex` meta tags

