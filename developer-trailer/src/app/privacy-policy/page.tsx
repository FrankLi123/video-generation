"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background-primary">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <h1 className="text-4xl font-heading font-bold mb-4">Privacy Policy</h1>
          <p className="text-text-secondary">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <Card>
          <CardContent className="p-8 space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
              <p className="text-text-secondary leading-relaxed">
                This Privacy Policy describes how YourCompany collects, uses and shares personal information when you use TrailerAI. "Personal information" means any information that identifies or relates to an individual.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
              <p className="text-text-secondary leading-relaxed mb-4">
                We collect the following types of information:
              </p>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">Account information:</h3>
                  <p className="text-text-secondary leading-relaxed">name, email address, billing and payment details.</p>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">User content:</h3>
                  <p className="text-text-secondary leading-relaxed">text prompts, images and other data you submit, as well as generated videos.</p>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">Usage data:</h3>
                  <p className="text-text-secondary leading-relaxed">device information, log data (IP address, browser type, pages visited), timestamps and analytics data.</p>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">Cookies and tracking technologies:</h3>
                  <p className="text-text-secondary leading-relaxed">we use cookies and similar technologies to recognise you and analyse how the Service is used.</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
              <p className="text-text-secondary leading-relaxed mb-4">
                We use the information we collect to:
              </p>
              <ul className="list-disc list-inside text-text-secondary space-y-2 ml-4">
                <li>Provide, operate and improve the Service</li>
                <li>Process payments and manage your subscriptions or credits</li>
                <li>Communicate with you about your account, updates and promotional offers</li>
                <li>Understand usage trends and develop new features</li>
                <li>Comply with legal obligations and enforce our policies</li>
              </ul>
              <p className="text-text-secondary leading-relaxed mt-4">
                We rely on lawful bases for processing your data, including performance of a contract, legitimate interests and your consent where required.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Sharing and Disclosure</h2>
              <p className="text-text-secondary leading-relaxed mb-4">
                We do not sell your personal information. We may share information with:
              </p>
              <ul className="list-disc list-inside text-text-secondary space-y-2 ml-4">
                <li>Service providers who help us operate the Service (e.g. payment processors, cloud hosting, customer support tools), under confidentiality obligations</li>
                <li>AI providers used to generate scripts or videos, to the extent necessary to provide the Service</li>
                <li>Legal authorities if required by law or to protect our rights</li>
                <li>Business transferees in the event of a merger, acquisition or sale of assets</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Cookies and Analytics</h2>
              <p className="text-text-secondary leading-relaxed">
                We use first‑party and third‑party cookies to remember your preferences and gather usage statistics. You can control cookies through your browser settings. Disabling cookies may affect the functionality of the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. International Data Transfers</h2>
              <p className="text-text-secondary leading-relaxed">
                If you access the Service from outside the country where our servers are located, your information may be transferred to, stored and processed in another country. We implement safeguards (such as standard contractual clauses) to ensure your data is protected when transferred internationally.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Data Retention</h2>
              <p className="text-text-secondary leading-relaxed">
                We retain personal information for as long as necessary to provide the Service and for legitimate business or legal purposes. When we no longer need your information, we will securely delete or anonymize it.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Security</h2>
              <p className="text-text-secondary leading-relaxed">
                We use administrative, technical and physical measures to protect your information. However, no data transmission or storage system can be guaranteed to be 100% secure. We encourage you to use unique, strong passwords and to log out when finished using the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Your Rights</h2>
              <p className="text-text-secondary leading-relaxed">
                Depending on your location, you may have the right to access, correct, delete or export your personal information, object to or restrict certain processing, or withdraw consent. To exercise these rights, please contact privacy@yourdomain.com. We will respond in accordance with applicable laws.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">10. Children's Privacy</h2>
              <p className="text-text-secondary leading-relaxed">
                The Service is not directed to children under 13 (or the minimum legal age in your jurisdiction), and we do not knowingly collect personal information from children. If we learn that we have collected personal information from a child, we will delete it.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">11. Changes to This Policy</h2>
              <p className="text-text-secondary leading-relaxed">
                We may update this Privacy Policy from time to time. When we make material changes, we will notify you by email or through the Service. Your continued use of the Service after any changes indicates your acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">12. Contact</h2>
              <p className="text-text-secondary leading-relaxed">
                For privacy‑related questions, contact our Data Protection Officer at privacy@yourdomain.com.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}