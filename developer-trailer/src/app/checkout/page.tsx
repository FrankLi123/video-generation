"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AnimatedSection } from "@/components/animated-section"
import { Video, CreditCard, Lock, ArrowLeft, Check, Shield, Calendar, User, Mail, Building, MapPin } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

interface PlanDetails {
  id: string
  name: string
  price: number
  period: string
  credits: number
  description: string
  features: string[]
}

export default function CheckoutPage() {
  const searchParams = useSearchParams()
  const planId = searchParams.get("plan") || "creator"
  const billing = searchParams.get("billing") || "monthly"

  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    company: "",
    address: "",
    city: "",
    country: "",
    zipCode: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    nameOnCard: "",
  })

  const [isProcessing, setIsProcessing] = useState(false)

  const planDetails: Record<string, PlanDetails> = {
    free: {
      id: "free",
      name: "Free",
      price: 0,
      period: "forever",
      credits: 10,
      description: "Perfect for trying out AI trailer generation",
      features: ["10 trailer credits per month", "Basic trailer styles", "720p video export"],
    },
    creator: {
      id: "creator",
      name: "Creator",
      price: billing === "monthly" ? 29 : 290,
      period: billing === "monthly" ? "month" : "year",
      credits: 100,
      description: "Ideal for content creators and small businesses",
      features: ["100 trailer credits per month", "All trailer styles", "1080p HD video export", "No watermarks"],
    },
    pro: {
      id: "pro",
      name: "Pro",
      price: billing === "monthly" ? 79 : 790,
      period: billing === "monthly" ? "month" : "year",
      credits: 300,
      description: "For agencies and growing businesses",
      features: [
        "300 trailer credits per month",
        "4K video export",
        "Team collaboration",
        "Analytics dashboard",
        "API access",
      ],
    },
  }

  const currentPlan = planDetails[planId] || planDetails.creator

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 3000))

    // Redirect to success page or dashboard
    window.location.href = "/dashboard?welcome=true"
  }

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
    const matches = v.match(/\d{4,16}/g)
    const match = (matches && matches[0]) || ""
    const parts = []
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    if (parts.length) {
      return parts.join(" ")
    } else {
      return v
    }
  }

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
    if (v.length >= 2) {
      return v.substring(0, 2) + "/" + v.substring(2, 4)
    }
    return v
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

            <div className="flex items-center space-x-2 text-sm text-text-secondary">
              <Shield className="w-4 h-4 text-primary" />
              <span>Secure Checkout</span>
            </div>
          </nav>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Order Summary */}
          <div className="order-2 lg:order-1">
            <AnimatedSection>
              <div className="mb-8">
                <Link
                  href="/pricing"
                  className="inline-flex items-center text-text-secondary hover:text-text-primary transition-colors mb-4"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to pricing
                </Link>
                <h1 className="text-3xl font-heading font-bold mb-2">Complete your order</h1>
                <p className="text-text-secondary">Secure checkout powered by industry-leading encryption</p>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.1}>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Contact Information */}
                <Card className="bg-background-secondary/50 border-background-tertiary">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <User className="w-5 h-5 mr-2 text-primary" />
                      Contact Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted" />
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="your@email.com"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="pl-10 bg-background-tertiary border-background-tertiary focus:border-primary"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name *</Label>
                        <Input
                          id="firstName"
                          name="firstName"
                          placeholder="John"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          className="bg-background-tertiary border-background-tertiary focus:border-primary"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name *</Label>
                        <Input
                          id="lastName"
                          name="lastName"
                          placeholder="Doe"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          className="bg-background-tertiary border-background-tertiary focus:border-primary"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="company">Company (Optional)</Label>
                      <div className="relative">
                        <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted" />
                        <Input
                          id="company"
                          name="company"
                          placeholder="Your Company"
                          value={formData.company}
                          onChange={handleInputChange}
                          className="pl-10 bg-background-tertiary border-background-tertiary focus:border-primary"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Billing Address */}
                <Card className="bg-background-secondary/50 border-background-tertiary">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <MapPin className="w-5 h-5 mr-2 text-primary" />
                      Billing Address
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="address">Address *</Label>
                      <Input
                        id="address"
                        name="address"
                        placeholder="123 Main Street"
                        value={formData.address}
                        onChange={handleInputChange}
                        className="bg-background-tertiary border-background-tertiary focus:border-primary"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="city">City *</Label>
                        <Input
                          id="city"
                          name="city"
                          placeholder="New York"
                          value={formData.city}
                          onChange={handleInputChange}
                          className="bg-background-tertiary border-background-tertiary focus:border-primary"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="zipCode">ZIP Code *</Label>
                        <Input
                          id="zipCode"
                          name="zipCode"
                          placeholder="10001"
                          value={formData.zipCode}
                          onChange={handleInputChange}
                          className="bg-background-tertiary border-background-tertiary focus:border-primary"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="country">Country *</Label>
                      <select
                        id="country"
                        name="country"
                        value={formData.country}
                        onChange={(e) => setFormData((prev) => ({ ...prev, country: e.target.value }))}
                        className="w-full px-3 py-2 bg-background-tertiary border border-background-tertiary rounded-md focus:border-primary focus:outline-none"
                        required
                      >
                        <option value="">Select Country</option>
                        <option value="US">United States</option>
                        <option value="CA">Canada</option>
                        <option value="GB">United Kingdom</option>
                        <option value="AU">Australia</option>
                        <option value="DE">Germany</option>
                        <option value="FR">France</option>
                        <option value="JP">Japan</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Information */}
                <Card className="bg-background-secondary/50 border-background-tertiary">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <CreditCard className="w-5 h-5 mr-2 text-primary" />
                      Payment Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="cardNumber">Card Number *</Label>
                      <Input
                        id="cardNumber"
                        name="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        value={formData.cardNumber}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, cardNumber: formatCardNumber(e.target.value) }))
                        }
                        className="bg-background-tertiary border-background-tertiary focus:border-primary"
                        maxLength={19}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="expiryDate">Expiry Date *</Label>
                        <Input
                          id="expiryDate"
                          name="expiryDate"
                          placeholder="MM/YY"
                          value={formData.expiryDate}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, expiryDate: formatExpiryDate(e.target.value) }))
                          }
                          className="bg-background-tertiary border-background-tertiary focus:border-primary"
                          maxLength={5}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="cvv">CVV *</Label>
                        <Input
                          id="cvv"
                          name="cvv"
                          placeholder="123"
                          value={formData.cvv}
                          onChange={handleInputChange}
                          className="bg-background-tertiary border-background-tertiary focus:border-primary"
                          maxLength={4}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="nameOnCard">Name on Card *</Label>
                      <Input
                        id="nameOnCard"
                        name="nameOnCard"
                        placeholder="John Doe"
                        value={formData.nameOnCard}
                        onChange={handleInputChange}
                        className="bg-background-tertiary border-background-tertiary focus:border-primary"
                        required
                      />
                    </div>
                  </CardContent>
                </Card>

                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 text-background-primary font-medium py-4 text-lg shadow-glow"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-background-primary/30 border-t-background-primary rounded-full animate-spin" />
                      <span>Processing Payment...</span>
                    </div>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 mr-2" />
                      Complete Purchase - ${currentPlan.price}
                    </>
                  )}
                </Button>

                <div className="text-center text-sm text-text-muted">
                  <p>
                    By completing this purchase, you agree to our{" "}
                    <Link href="/terms" className="text-primary hover:text-primary/80">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="text-primary hover:text-primary/80">
                      Privacy Policy
                    </Link>
                  </p>
                </div>
              </form>
            </AnimatedSection>
          </div>

          {/* Order Summary Sidebar */}
          <div className="order-1 lg:order-2">
            <AnimatedSection delay={0.2}>
              <div className="sticky top-8">
                <Card className="bg-background-secondary/50 border-background-tertiary">
                  <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                        <Video className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-heading font-semibold">{currentPlan.name} Plan</h3>
                        <p className="text-sm text-text-secondary">{currentPlan.description}</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {currentPlan.features.slice(0, 4).map((feature, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <Check className="w-4 h-4 text-primary flex-shrink-0" />
                          <span className="text-sm text-text-secondary">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-background-tertiary pt-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Subtotal</span>
                        <span>${currentPlan.price}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Tax</span>
                        <span>$0.00</span>
                      </div>
                      {billing === "yearly" && currentPlan.price > 0 && (
                        <div className="flex justify-between text-green-400">
                          <span>Yearly Discount (17%)</span>
                          <span>-${Math.round(currentPlan.price * 0.17)}</span>
                        </div>
                      )}
                      <div className="border-t border-background-tertiary pt-2 flex justify-between font-heading font-bold text-lg">
                        <span>Total</span>
                        <span>${currentPlan.price}</span>
                      </div>
                    </div>

                    {billing === "yearly" && (
                      <Badge className="w-full justify-center bg-green-500/20 text-green-400 border-green-500/30">
                        <Calendar className="w-3 h-3 mr-1" />
                        Save 17% with yearly billing
                      </Badge>
                    )}

                    <div className="text-center text-xs text-text-muted">
                      <p>🔒 Your payment information is secure and encrypted</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </div>
    </div>
  )
}
