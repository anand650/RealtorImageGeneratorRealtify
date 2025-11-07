import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy - Realtify',
  description: 'Privacy Policy for Realtify - How we collect, use, and protect your data',
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
          
          <div className="prose prose-lg max-w-none space-y-6 text-gray-700">
            <p className="text-sm text-gray-500 mb-6">Last updated: {new Date().toLocaleDateString()}</p>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
              <p>
                Realtify ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Information We Collect</h2>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-4">2.1 Information You Provide</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Account information (name, email address)</li>
                <li>Payment information (processed securely through Paddle)</li>
                <li>Images you upload for processing</li>
                <li>Communication preferences</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-4">2.2 Automatically Collected Information</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Usage data (how you interact with the Service)</li>
                <li>Device information (browser type, operating system)</li>
                <li>IP address and location data</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. How We Use Your Information</h2>
              <p>We use the collected information for:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Providing and maintaining the Service</li>
                <li>Processing payments and managing subscriptions</li>
                <li>Improving and personalizing your experience</li>
                <li>Communicating with you about the Service</li>
                <li>Detecting and preventing fraud or abuse</li>
                <li>Complying with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Data Storage and Security</h2>
              <p>
                We implement appropriate technical and organizational security measures to protect your personal information. Your images are stored securely using industry-standard encryption and access controls.
              </p>
              <p className="mt-4">
                However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your information, we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Data Sharing and Disclosure</h2>
              <p>We do not sell your personal information. We may share your information only in the following circumstances:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>With service providers who assist us in operating the Service (e.g., payment processors, cloud storage)</li>
                <li>When required by law or to respond to legal process</li>
                <li>To protect our rights, property, or safety</li>
                <li>In connection with a business transfer (merger, acquisition, etc.)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Cookies and Tracking Technologies</h2>
              <p>
                We use cookies and similar tracking technologies to track activity on our Service and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
              </p>
              <p className="mt-4">
                For more information, please see our <a href="/cookies" className="text-blue-600 hover:underline">Cookie Policy</a>.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Your Rights</h2>
              <p>Depending on your location, you may have the following rights:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Access to your personal data</li>
                <li>Correction of inaccurate data</li>
                <li>Deletion of your data</li>
                <li>Objection to processing of your data</li>
                <li>Data portability</li>
                <li>Withdrawal of consent</li>
              </ul>
              <p className="mt-4">
                To exercise these rights, please contact us at support@realtify.studio.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Children's Privacy</h2>
              <p>
                Our Service is not intended for individuals under the age of 18. We do not knowingly collect personal information from children. If you become aware that a child has provided us with personal information, please contact us.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. International Data Transfers</h2>
              <p>
                Your information may be transferred to and maintained on computers located outside of your state, province, country, or other governmental jurisdiction where data protection laws may differ.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Changes to This Privacy Policy</h2>
              <p>
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy, please contact us at:
              </p>
              <p className="mt-2">
                Email: support@realtify.studio<br />
                Website: https://realtify.com/contact
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}




