import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Refund Policy - Realtify',
  description: 'Refund Policy for Realtify - Information about refunds and cancellations',
}

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Refund Policy</h1>
          
          <div className="prose prose-lg max-w-none space-y-6 text-gray-700">
            <p className="text-sm text-gray-500 mb-6">Last updated: {new Date().toLocaleDateString()}</p>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Overview</h2>
              <p>
                At Realtify, we strive to provide excellent service. This Refund Policy outlines the circumstances under which refunds may be issued for our subscription services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Subscription Refunds</h2>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-4">2.1 Monthly Subscriptions</h3>
              <p>
                Monthly subscriptions are billed in advance. If you cancel your subscription, you will continue to have access to the Service until the end of your current billing period. Refunds for unused portions of monthly subscriptions are generally not provided, except in exceptional circumstances at our discretion.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-4">2.2 Refund Requests</h3>
              <p>
                Refund requests must be submitted within 14 days of the original purchase date. To request a refund, please contact us at support@realtify.studio with:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>Your account email address</li>
                <li>Date of purchase</li>
                <li>Reason for refund request</li>
                <li>Transaction ID or invoice number</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Eligible Refund Circumstances</h2>
              <p>Refunds may be considered in the following situations:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Duplicate charges due to technical errors</li>
                <li>Service unavailability for extended periods</li>
                <li>Billing errors on our part</li>
                <li>Failure to deliver promised features</li>
                <li>Technical issues preventing Service use that cannot be resolved</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Non-Refundable Items</h2>
              <p>The following are not eligible for refunds:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Unused image credits that expire at the end of a billing cycle</li>
                <li>Subscriptions canceled after 14 days from purchase</li>
                <li>Refunds requested due to change of mind after using the Service</li>
                <li>Refunds for services already consumed</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Processing Refunds</h2>
              <p>
                Approved refunds will be processed within 5-10 business days to the original payment method. Refund processing times may vary depending on your payment provider.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Cancellation Policy</h2>
              <p>
                You may cancel your subscription at any time through your account settings or by contacting support. Cancellation will take effect at the end of your current billing period. You will retain access to the Service until that time.
              </p>
              <p className="mt-4">
                No refunds are provided for the remaining portion of a billing period after cancellation.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Free Trial Period</h2>
              <p>
                If you cancel during a free trial period, you will not be charged. If you cancel after the trial period has ended, standard refund policies apply.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Chargebacks</h2>
              <p>
                If you initiate a chargeback through your payment provider instead of contacting us for a refund, your account may be suspended pending investigation. We encourage you to contact us first to resolve any billing issues.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Changes to This Policy</h2>
              <p>
                We reserve the right to modify this Refund Policy at any time. Material changes will be communicated to users via email or through the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Payment Processing</h2>
              <p>
                All payments are processed securely through Paddle, our authorized payment processor. Refunds will be processed through the same payment method used for the original transaction. Processing times may vary depending on your payment provider and Paddle's processing times.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Contact Information</h2>
              <p>
                For refund requests or questions about this policy, please contact us at:
              </p>
              <p className="mt-2">
                <strong>Email:</strong> support@realtify.studio<br />
                <strong>Subject:</strong> Refund Request<br />
                <strong>Website:</strong> <a href="https://realtify.com/contact" className="text-blue-600 hover:underline">https://realtify.com/contact</a>
              </p>
              <p className="mt-4">
                You can also access your billing portal through your account settings to view invoices and manage your subscription.
              </p>
            </section>

            <section className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-8">
              <h2 className="text-xl font-semibold text-blue-900 mb-2">Customer Rights</h2>
              <p className="text-blue-800">
                Depending on your location, you may have additional rights under local consumer protection laws. This policy does not limit any statutory rights you may have as a consumer.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}




