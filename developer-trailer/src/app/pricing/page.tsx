"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AnimatedSection } from "@/components/animated-section"
import { motion } from "framer-motion"
import { Video, Check, X, Sparkles, Zap, Crown, Building2, ArrowRight, Star, Headphones } from "lucide-react"
import Link from "next/link"

interface PricingPlan {
  id: string
  name: string
  price: number
  period: string
  credits: number
  description: string
  features: string[]
  limitations?: string[]
  popular?: boolean
  enterprise?: boolean
  icon: React.ReactNode
  buttonText: string
  buttonVariant: "default" | "outline" | "secondary"
}

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly")

  const plans: PricingPlan[] = [
    {
      id: "free",
      name: "Free",
      price: 0,
      period: "forever",
      credits: 10,
      description: "Perfect for trying out AI trailer generation",
      icon: <Sparkles className="w-6 h-6" />,
      buttonText: "Get Started Free",
      buttonVariant: "outline",
      features: [
        "10 trailer credits per month",
        "Basic trailer styles",
        "720p video export",
        "Community support",
        "Watermarked exports",
        "Basic asset library",
      ],
      limitations: ["Limited to 60-second trailers", "No priority processing", "Basic templates only"],
    },
    {
      id: "creator",
      name: "Creator",
      price: billingPeriod === "monthly" ? 29 : 290,
      period: billingPeriod === "monthly" ? "month" : "year",
      credits: 100,
      description: "Ideal for content creators and small businesses",
      icon: <Video className="w-6 h-6" />,
      buttonText: "Start Creating",
      buttonVariant: "default",
      popular: true,
      features: [
        "100 trailer credits per month",
        "All trailer styles",
        "1080p HD video export",
        "No watermarks",
        "Priority processing",
        "Advanced asset library",
        "Custom branding",
        "Email support",
      ],
    },
    {
      id: "pro",
      name: "Pro",
      price: billingPeriod === "monthly" ? 79 : 790,
      period: billingPeriod === "monthly" ? "month" : "year",
      credits: 300,
      description: "For agencies and growing businesses",
      icon: <Crown className="w-6 h-6" />,
      buttonText: "Go Pro",
      buttonVariant: "default",
      features: [
        "300 trailer credits per month",
        "All premium features",
        "4K video export",
        "Advanced AI customization",
        "Team collaboration (5 seats)",
        "Analytics dashboard",
        "API access",
        "Priority support",
        "Custom templates",
        "Bulk generation",
      ],
    },
    {
      id: "enterprise",
      name: "Enterprise",
      price: 0,
      period: "custom",
      credits: 0,
      description: "Custom solutions for large organizations",
      icon: <Building2 className="w-6 h-6" />,
      buttonText: "Contact Sales",
      buttonVariant: "secondary",
      enterprise: true,
      features: [
        "Unlimited trailer credits",
        "Custom AI model training",
        "White-label solution",
        "Dedicated account manager",
        "SLA guarantees",
        "Custom integrations",
        "Advanced security",
        "24/7 phone support",
        "On-premise deployment",
        "Custom contract terms",
      ],
    },
  ]

  const faqs = [
    {
      question: "What are trailer credits?",
      answer:
        "Credits are used to generate AI trailers. Each trailer generation consumes 1 credit. Unused credits roll over to the next month for paid plans.",
    },
    {
      question: "Can I upgrade or downgrade my plan?",
      answer:
        "Yes, you can change your plan at any time. Upgrades take effect immediately, while downgrades take effect at the next billing cycle.",
    },
    {
      question: "What video formats do you support?",
      answer:
        "We support MP4, MOV, and AVI for input videos, and export in MP4 format. Pro and Enterprise plans support 4K resolution.",
    },
    {
      question: "Is there a free trial for paid plans?",
      answer:
        "Yes! All paid plans come with a 7-day free trial. You can cancel anytime during the trial period without being charged.",
    },
    {
      question: "Do you offer refunds?",
      answer:
        "We offer a 30-day money-back guarantee for all paid plans. If you're not satisfied, contact our support team for a full refund.",
    },
  ]

  const getDiscountBadge = () => {
    if (billingPeriod === "yearly") {
      return (
        <Badge className="bg-green-500/20 text-green-400 border-green-500/30 ml-2">
          <Star className="w-3 h-3 mr-1" />
          Save 17%
        </Badge>
      )
    }
    return null
  }

  return (
    <div className="min-h-screen bg-background-primary text-text-primary">
      {/* Header */}
      <header className="border-b border-background-secondary/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                <Video className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-heading font-bold">TrailerAI</span>
            </Link>

            <div className="flex items-center space-x-4">
              <Link href="/signin">
                <Button variant="ghost" className="text-text-secondary hover:text-text-primary">
                  Sign In
                </Button>
              </Link>
              <Link href="/generate">
                <Button className="bg-primary hover:bg-primary/90 text-background-primary font-medium shadow-glow">
                  Start Creating
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      </header>

      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <AnimatedSection>
          <div className="text-center mb-16">
            <Badge className="mb-6 bg-secondary/20 text-secondary border-secondary/30">
              <Zap className="w-4 h-4 mr-2" />
              Flexible Pricing
            </Badge>
            <h1 className="text-4xl md:text-6xl font-heading font-bold mb-6">
              Choose your
              <span className="block bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                creative plan
              </span>
            </h1>
            <p className="text-xl text-text-secondary max-w-3xl mx-auto mb-8">
              From individual creators to enterprise teams, we have the perfect plan to power your AI trailer generation
              needs.
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center space-x-4 mb-12">
              <span className={`text-sm ${billingPeriod === "monthly" ? "text-text-primary" : "text-text-muted"}`}>
                Monthly
              </span>
              <button
                onClick={() => setBillingPeriod(billingPeriod === "monthly" ? "yearly" : "monthly")}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  billingPeriod === "yearly" ? "bg-primary" : "bg-background-tertiary"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    billingPeriod === "yearly" ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
              <span className={`text-sm ${billingPeriod === "yearly" ? "text-text-primary" : "text-text-muted"}`}>
                Yearly
              </span>
              {getDiscountBadge()}
            </div>
          </div>
        </AnimatedSection>

        {/* Pricing Cards */}
        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-8 mb-16">
          {plans.map((plan, index) => (
            <AnimatedSection key={plan.id} delay={index * 0.1}>
              <motion.div
                whileHover={{ y: -8 }}
                transition={{ duration: 0.3 }}
                className={`relative ${plan.popular ? "lg:-mt-8" : ""}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-background-primary border-primary shadow-glow">
                      <Star className="w-3 h-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}

                <Card
                  className={`h-full ${
                    plan.popular
                      ? "bg-gradient-to-b from-primary/10 to-background-secondary/50 border-primary/30 shadow-glow"
                      : "bg-background-secondary/50 border-background-tertiary hover:border-primary/30"
                  } transition-all duration-300`}
                >
                  <CardHeader className="text-center pb-4">
                    <div className="flex items-center justify-center mb-4">
                      <div
                        className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          plan.popular ? "bg-gradient-to-br from-primary to-secondary" : "bg-background-tertiary"
                        }`}
                      >
                        {plan.icon}
                      </div>
                    </div>
                    <CardTitle className="text-2xl font-heading font-bold">{plan.name}</CardTitle>
                    <p className="text-text-secondary text-sm">{plan.description}</p>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="text-center mb-6">
                      {plan.enterprise ? (
                        <div className="text-3xl font-heading font-bold">Custom</div>
                      ) : (
                        <>
                          <div className="text-4xl font-heading font-bold">
                            ${plan.price}
                            <span className="text-lg text-text-muted">/{plan.period}</span>
                          </div>
                          {plan.credits > 0 && (
                            <div className="text-sm text-text-secondary mt-1">{plan.credits} credits per month</div>
                          )}
                        </>
                      )}
                    </div>

                    <Link href={`/checkout?plan=${plan.id}&billing=${billingPeriod}`}>
                      <Button
                        className={`w-full mb-6 ${
                          plan.popular
                            ? "bg-primary hover:bg-primary/90 text-background-primary shadow-glow"
                            : plan.buttonVariant === "outline"
                              ? "border-background-tertiary hover:border-primary/50 bg-transparent"
                              : "bg-background-tertiary hover:bg-background-tertiary/80"
                        }`}
                        variant={plan.buttonVariant}
                      >
                        {plan.buttonText}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>

                    <div className="space-y-3">
                      {plan.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-start space-x-3">
                          <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-text-secondary">{feature}</span>
                        </div>
                      ))}

                      {plan.limitations?.map((limitation, limitIndex) => (
                        <div key={limitIndex} className="flex items-start space-x-3">
                          <X className="w-4 h-4 text-text-muted mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-text-muted">{limitation}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatedSection>
          ))}
        </div>

        {/* Features Comparison */}
        {/* <AnimatedSection delay={0.5}>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-heading font-bold mb-4">Compare all features</h2>
            <p className="text-text-secondary">See what's included in each plan</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-background-tertiary">
                  <th className="text-left py-4 px-6 font-heading font-semibold">Features</th>
                  <th className="text-center py-4 px-6 font-heading font-semibold">Free</th>
                  <th className="text-center py-4 px-6 font-heading font-semibold">Creator</th>
                  <th className="text-center py-4 px-6 font-heading font-semibold">Pro</th>
                  <th className="text-center py-4 px-6 font-heading font-semibold">Enterprise</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {[
                  { feature: "Monthly Credits", free: "10", creator: "100", pro: "300", enterprise: "Unlimited" },
                  { feature: "Video Quality", free: "720p", creator: "1080p", pro: "4K", enterprise: "4K+" },
                  { feature: "Watermark", free: "Yes", creator: "No", pro: "No", enterprise: "No" },
                  { feature: "Team Members", free: "1", creator: "1", pro: "5", enterprise: "Unlimited" },
                  { feature: "API Access", free: "No", creator: "No", pro: "Yes", enterprise: "Yes" },
                  { feature: "Priority Support", free: "No", creator: "Email", pro: "Priority", enterprise: "24/7" },
                ].map((row, index) => (
                  <tr key={index} className="border-b border-background-tertiary/50">
                    <td className="py-4 px-6 font-medium">{row.feature}</td>
                    <td className="py-4 px-6 text-center text-text-secondary">{row.free}</td>
                    <td className="py-4 px-6 text-center text-text-secondary">{row.creator}</td>
                    <td className="py-4 px-6 text-center text-text-secondary">{row.pro}</td>
                    <td className="py-4 px-6 text-center text-text-secondary">{row.enterprise}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AnimatedSection> */}

        {/* FAQ Section */}
        <AnimatedSection delay={0.6}>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-heading font-bold mb-4">Frequently asked questions</h2>
            <p className="text-text-secondary">Everything you need to know about our pricing</p>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            {faqs.map((faq, index) => (
              <Card key={index} className="bg-background-secondary/50 border-background-tertiary">
                <CardContent className="p-6">
                  <h3 className="font-heading font-semibold mb-3">{faq.question}</h3>
                  <p className="text-text-secondary">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </AnimatedSection>

        {/* CTA Section */}
        {/* <AnimatedSection delay={0.7}>
          <div className="text-center mt-16 p-12 bg-gradient-to-r from-secondary/20 to-primary/20 rounded-2xl">
            <h2 className="text-3xl font-heading font-bold mb-4">Ready to start creating?</h2>
            <p className="text-text-secondary mb-8 max-w-2xl mx-auto">
              Join thousands of creators who are already using TrailerAI to bring their stories to life with the power
              of AI.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/generate">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-background-primary font-medium px-8 py-4 text-lg shadow-glow"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Start Free Trial
                </Button>
              </Link>
              <Link href="/contact">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-text-secondary text-text-primary hover:bg-background-secondary px-8 py-4 text-lg bg-transparent"
                >
                  <Headphones className="w-5 h-5 mr-2" />
                  Talk to Sales
                </Button>
              </Link>
            </div>
          </div>
        </AnimatedSection> */}
      </div>
    </div>
  )
}
