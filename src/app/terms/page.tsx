import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service - Realtify',
  description: 'Terms of Service for Realtify - Professional Image Enhancement for Real Estate',
}

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Service</h1>
          
          <div className="prose prose-lg max-w-none space-y-6 text-gray-700">
            <p className="text-sm text-gray-500 mb-6">Last updated: {new Date().toLocaleDateString()}</p>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p>
                By accessing and using Realtify ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these Terms of Service, please do not use the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Description of Service</h2>
              <p>
                Realtify provides AI-powered image enhancement services for real estate professionals. The Service allows users to upload property images and receive AI-enhanced versions suitable for real estate listings.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Accounts</h2>
              <p>
                You are responsible for maintaining the confidentiality of your account credentials. You agree to accept responsibility for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Subscription Plans and Billing</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Subscription fees are billed monthly in advance</li>
                <li>All fees are non-refundable except as required by law or as stated in our <a href="/refund" className="text-blue-600 hover:underline">Refund Policy</a></li>
                <li>Unused image credits do not roll over to the next billing cycle</li>
                <li>You may cancel your subscription at any time, with access continuing until the end of the current billing period</li>
                <li>We reserve the right to change our pricing with 30 days notice</li>
                <li>All payments are processed securely through Paddle, our authorized payment processor</li>
                <li>By subscribing, you agree to Paddle's terms and conditions for payment processing</li>
                <li>You authorize us to charge your payment method for subscription fees</li>
                <li>If payment fails, we may suspend or terminate your subscription access</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Acceptable Use</h2>
              <p>You agree not to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Use the Service for any illegal purpose or in violation of any laws</li>
                <li>Upload content that infringes on intellectual property rights</li>
                <li>Upload content that is offensive, harmful, or violates others' rights</li>
                <li>Attempt to reverse engineer or compromise the Service's security</li>
                <li>Use automated systems to access the Service without permission</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Intellectual Property</h2>
              <p>
                The Service and its original content, features, and functionality are owned by Realtify and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
              </p>
              <p className="mt-4">
                You retain ownership of images you upload. By using the Service, you grant Realtify a license to process and store your images solely for the purpose of providing the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Limitation of Liability</h2>
              <p>
                Realtify shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use or inability to use the Service. Our total liability shall not exceed the amount you paid for the Service in the 12 months preceding the claim.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Termination</h2>
              <p>
                We may terminate or suspend your account immediately, without prior notice, for conduct that we believe violates these Terms of Service or is harmful to other users, us, or third parties.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Changes to Terms</h2>
              <p>
                We reserve the right to modify these terms at any time. We will notify users of any material changes via email or through the Service. Your continued use of the Service after such changes constitutes acceptance of the new terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Contact Information</h2>
              <p>
                If you have any questions about these Terms of Service, please contact us at:
              </p>
              <p className="mt-2">
                <strong>Email:</strong> support@realtify.studio<br />
                <strong>Website:</strong> <a href="https://realtify.com/contact" className="text-blue-600 hover:underline">https://realtify.com/contact</a><br />
                <strong>Mailing Address:</strong> [Your Business Address - Update with actual address]
              </p>
              <p className="mt-4">
                For billing inquiries or payment-related issues, please contact us at support@realtify.studio or through your account billing portal.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}




