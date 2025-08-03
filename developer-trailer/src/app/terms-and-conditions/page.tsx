"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function TermsAndConditionsPage() {
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
          <h1 className="text-4xl font-heading font-bold mb-4">Terms of Service</h1>
          <p className="text-text-secondary">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <Card>
          <CardContent className="p-8 space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Definitions and Scope</h2>
              <p className="text-text-secondary leading-relaxed">
                "Service" means the TrailerAI platform and any associated websites, software applications or APIs provided by YourCompany, a [jurisdiction] entity. "User," "you" or "your" means the individual or legal entity accessing or using the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Acceptance of Terms</h2>
              <p className="text-text-secondary leading-relaxed">
                By accessing or using the Service, you acknowledge that you have read, understood and agree to be bound by these Terms. If you are entering into these Terms on behalf of a company or other legal entity, you represent that you have authority to bind such entity.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. Modifications</h2>
              <p className="text-text-secondary leading-relaxed">
                We may update these Terms periodically. When we make material changes, we will notify you via the Service or by email. Continued use of the Service after the changes become effective constitutes acceptance of the updated Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Account Registration and Responsibilities</h2>
              <p className="text-text-secondary leading-relaxed">
                You must provide accurate and complete information when creating an account. You are responsible for keeping your password secure and for all activities that occur under your account. You must notify us immediately if you suspect unauthorised use.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Licence and Permitted Use</h2>
              <p className="text-text-secondary leading-relaxed mb-4">
                We grant you a limited, non‑exclusive, non‑transferable licence to access and use the Service solely for lawful purposes in accordance with these Terms. You may not:
              </p>
              <ul className="list-disc list-inside text-text-secondary space-y-2 ml-4">
                <li>reverse engineer, decompile or disassemble the Service</li>
                <li>use the Service to create competing products</li>
                <li>circumvent any usage or access limits</li>
                <li>upload or transmit malicious code</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. User‑Generated Content and AI Outputs</h2>
              <p className="text-text-secondary leading-relaxed">
                You retain ownership of the text prompts, images and other data you submit ("User Content"), as well as the resulting videos ("Outputs"). By submitting User Content, you grant us a worldwide, royalty‑free licence to host, reproduce, display and modify the User Content solely for the purpose of operating and improving the Service. We do not claim ownership of Outputs, but note that Outputs may be generated using third‑party AI models and may be similar to content generated for other users. You are responsible for ensuring your User Content and Outputs comply with applicable law and do not infringe third‑party rights.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Copyright and DMCA Policy</h2>
              <p className="text-text-secondary leading-relaxed">
                We respect intellectual property rights and expect users to do the same. If you believe that content on the Service infringes your copyright, please send a notice to our designated agent containing the information required under the Digital Millennium Copyright Act (or equivalent legislation). We will respond to such notices appropriately.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Intellectual Property</h2>
              <p className="text-text-secondary leading-relaxed">
                All rights, title and interest in and to the Service (excluding User Content and Outputs) are owned by YourCompany or its licensors. The Service is protected by copyright, trademark and other laws. Except for the limited licence granted herein, you acquire no rights to the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Pricing, Payment and Credits</h2>
              <p className="text-text-secondary leading-relaxed">
                Your use of the Service may require payment. Pricing for subscriptions and credit packages is described on our pricing page. All fees are due in advance and are non‑refundable except as required by law. You authorise us to charge your payment method for all amounts due. You are responsible for any taxes, duties or similar charges. Credits may have an expiration date; unused credits will expire and are forfeited upon account termination.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">10. Refunds and Cancellations</h2>
              <p className="text-text-secondary leading-relaxed">
                Purchases of subscriptions or credit packages are final. If you have been incorrectly charged or have duplicate transactions, please contact us within 7 days. We will investigate and, if appropriate, credit your account. We may terminate or suspend the Service if payment is past due.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">11. Prohibited Content and Conduct</h2>
              <p className="text-text-secondary leading-relaxed">
                You agree not to upload, generate or distribute content that is illegal, obscene, pornographic, defamatory, harassing, discriminatory, hateful, violent or otherwise objectionable. You will not use the Service to infringe intellectual‑property rights or privacy rights, or to spam or harm others. We reserve the right to remove or refuse to publish any content and to terminate accounts that violate these Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">12. Termination and Suspension</h2>
              <p className="text-text-secondary leading-relaxed">
                You may terminate your account at any time through your account settings. We may suspend or terminate your access immediately, without notice, if you violate these Terms, if required by law, or for inactivity. Upon termination, your right to use the Service will cease, and any credits or files stored on the Service may be deleted.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">13. Disclaimers</h2>
              <p className="text-text-secondary leading-relaxed">
                The Service and Outputs are provided "as is" and "as available" without warranties of any kind. We make no representations or warranties that the Service will be uninterrupted, error‑free or that the Outputs will meet your expectations. Use the Service at your own risk.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">14. Limitation of Liability</h2>
              <p className="text-text-secondary leading-relaxed">
                To the maximum extent permitted by law, YourCompany and its suppliers will not be liable for any indirect, incidental, special, consequential or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill or other intangible losses. Our total liability under these Terms will not exceed the amount you paid to us in the twelve months preceding the claim.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">15. Indemnification</h2>
              <p className="text-text-secondary leading-relaxed">
                You agree to indemnify and hold harmless YourCompany and its affiliates, officers and employees from any claims, damages and expenses (including attorneys' fees) arising from your use of the Service, your User Content or your violation of these Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">16. Governing Law and Dispute Resolution</h2>
              <p className="text-text-secondary leading-relaxed">
                These Terms are governed by the laws of [your jurisdiction]. Any disputes arising from these Terms or the Service will be resolved through binding arbitration in [jurisdiction] or the courts located in [jurisdiction], unless otherwise required by law.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">17. Miscellaneous</h2>
              <p className="text-text-secondary leading-relaxed">
               These Terms constitute the entire agreement between you and YourCompany regarding the Service and supersede all prior agreements. If any provision of these Terms is held unenforceable, the remaining provisions will remain in full force. Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Contact Information</h2>
              <p className="text-text-secondary leading-relaxed">
               If you have questions about these Terms, please contact us at support@yourdomain.com.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}