import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cookie Policy - Realtify',
  description: 'Cookie Policy for Realtify - How we use cookies and similar technologies',
}

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Cookie Policy</h1>
          
          <div className="prose prose-lg max-w-none space-y-6 text-gray-700">
            <p className="text-sm text-gray-500 mb-6">Last updated: {new Date().toLocaleDateString()}</p>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
              <p>
                This Cookie Policy explains how Realtify ("we," "our," or "us") uses cookies and similar tracking technologies on our website and Service. This policy should be read in conjunction with our <a href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</a>.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. What Are Cookies?</h2>
              <p>
                Cookies are small text files that are placed on your device when you visit a website. They are widely used to make websites work more efficiently and provide information to website owners. Cookies allow a website to recognize your device and store some information about your preferences or past actions.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Types of Cookies We Use</h2>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-4">3.1 Essential Cookies</h3>
              <p>
                These cookies are necessary for the Service to function properly. They enable core functionality such as security, network management, and accessibility.
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>Authentication cookies to keep you logged in</li>
                <li>Session cookies to maintain your session state</li>
                <li>Security cookies to prevent fraud and abuse</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-4">3.2 Functional Cookies</h3>
              <p>
                These cookies enable enhanced functionality and personalization, such as remembering your preferences and settings.
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>Language preferences</li>
                <li>Theme preferences (dark/light mode)</li>
                <li>User interface preferences</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-4">3.3 Analytics Cookies</h3>
              <p>
                These cookies help us understand how visitors interact with our Service by collecting and reporting information anonymously.
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>Page views and navigation patterns</li>
                <li>Feature usage statistics</li>
                <li>Performance metrics</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-4">3.4 Third-Party Cookies</h3>
              <p>
                We may use third-party services that set their own cookies:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li><strong>Payment Processing (Paddle):</strong> Cookies used for secure payment processing and fraud prevention</li>
                <li><strong>Authentication (Clerk):</strong> Cookies used for user authentication and session management</li>
                <li><strong>Analytics:</strong> Cookies used by analytics services to understand usage patterns</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. How We Use Cookies</h2>
              <p>We use cookies for the following purposes:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>To enable essential Service functionality</li>
                <li>To remember your preferences and settings</li>
                <li>To analyze Service usage and improve performance</li>
                <li>To provide secure payment processing</li>
                <li>To prevent fraud and ensure security</li>
                <li>To personalize your experience</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Managing Cookies</h2>
              <p>
                Most web browsers allow you to control cookies through their settings. You can:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Block all cookies</li>
                <li>Block third-party cookies only</li>
                <li>Delete cookies that have already been set</li>
                <li>Set your browser to notify you when cookies are being set</li>
              </ul>
              <p className="mt-4">
                <strong>Note:</strong> Blocking or deleting cookies may impact your ability to use certain features of our Service. Essential cookies are required for the Service to function properly.
              </p>
              <p className="mt-4">
                You can find instructions for managing cookies in popular browsers:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Chrome</a></li>
                <li><a href="https://support.mozilla.org/en-US/kb/enable-and-disable-cookies-website-preferences" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Mozilla Firefox</a></li>
                <li><a href="https://support.apple.com/guide/safari/manage-cookies-and-website-data-sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Safari</a></li>
                <li><a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Microsoft Edge</a></li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Do Not Track Signals</h2>
              <p>
                Some browsers include a "Do Not Track" (DNT) feature that signals to websites you visit that you do not want to have your online activity tracked. Currently, there is no standard for how DNT signals are interpreted. We do not currently respond to DNT signals.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Changes to This Cookie Policy</h2>
              <p>
                We may update this Cookie Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We will notify you of any material changes by posting the new Cookie Policy on this page and updating the "Last updated" date.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Contact Us</h2>
              <p>
                If you have any questions about this Cookie Policy, please contact us at:
              </p>
              <p className="mt-2">
                <strong>Email:</strong> support@realtify.studio<br />
                <strong>Website:</strong> <a href="https://realtify.com/contact" className="text-blue-600 hover:underline">https://realtify.com/contact</a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

