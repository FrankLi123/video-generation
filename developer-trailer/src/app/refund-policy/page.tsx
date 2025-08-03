"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function RefundPolicyPage() {
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
          <h1 className="text-4xl font-heading font-bold mb-4">Refund Policy</h1>
          <p className="text-text-secondary">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <Card>
          <CardContent className="p-8 space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-4">Non‑Refundable Services</h2>
              <p className="text-text-secondary leading-relaxed">
                Due to the on‑demand nature of AI video generation, all purchases (subscriptions, credit packs and one‑time orders) are final and non‑refundable once processing has begun. We cannot provide refunds for unused credits or partial subscription periods.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Billing Errors and Duplicate Charges</h2>
              <p className="text-text-secondary leading-relaxed">
                If you believe you have been incorrectly charged or have experienced a duplicate transaction, contact us within seven (7) days at billing@yourdomain.com. We will investigate and, if a billing error is confirmed, issue a credit or refund to your payment method.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Subscription Cancellations</h2>
              <p className="text-text-secondary leading-relaxed">
                You may cancel your subscription at any time through your account settings. Cancellation will stop future renewals, but no refunds will be issued for the current billing period. Any unused credits remaining in your account at the time of cancellation will expire at the end of their validity period.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Service Interruptions</h2>
              <p className="text-text-secondary leading-relaxed">
                If the Service becomes unavailable due to a fault on our part and you are unable to use purchased credits during the outage, we may, at our discretion, extend your subscription term or credit validity by the duration of the interruption.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Chargebacks</h2>
              <p className="text-text-secondary leading-relaxed">
                Initiating a credit‑card chargeback without first contacting us may result in immediate suspension or termination of your account. We are committed to resolving legitimate billing disputes promptly.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Contact</h2>
              <p className="text-text-secondary leading-relaxed">
                For questions regarding this Refund Policy, please contact us at billing@yourdomain.com.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}