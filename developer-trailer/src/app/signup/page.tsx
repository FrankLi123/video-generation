"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AnimatedSection } from "@/components/animated-section"
import { Video, Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles, Building, Check, X, Shield, Zap } from "lucide-react"
import Link from "next/link"

interface PasswordRequirement {
  text: string
  met: boolean
}

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    company: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
    subscribeToUpdates: true,
  })

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)

  // Password validation
  const passwordRequirements: PasswordRequirement[] = [
    { text: "At least 8 characters", met: formData.password.length >= 8 },
    { text: "Contains uppercase letter", met: /[A-Z]/.test(formData.password) },
    { text: "Contains lowercase letter", met: /[a-z]/.test(formData.password) },
    { text: "Contains number", met: /\d/.test(formData.password) },
    { text: "Contains special character", met: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password) },
  ]

  const passwordsMatch = formData.password === formData.confirmPassword && formData.confirmPassword.length > 0
  const allRequirementsMet = passwordRequirements.every((req) => req.met)
  const isFormValid =
    formData.firstName &&
    formData.lastName &&
    formData.email &&
    allRequirementsMet &&
    passwordsMatch &&
    formData.agreeToTerms

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isFormValid) return

    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Redirect to welcome/onboarding
    window.location.href = "/welcome"
  }

  const handleSocialSignup = (provider: string) => {
    console.log(`Signing up with ${provider}`)
    // Implement social signup logic
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
              <span className="text-text-secondary text-sm">Already have an account?</span>
              <Link href="/signin">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-primary/30 text-primary hover:bg-primary/10 bg-transparent"
                >
                  Sign In
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Benefits */}
            <div className="order-2 lg:order-1">
              <AnimatedSection>
                <div className="mb-8">
                  <Badge className="mb-4 bg-secondary/20 text-secondary border-secondary/30">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Join TrailerAI
                  </Badge>
                  <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">
                    Start creating
                    <span className="block bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                      amazing trailers
                    </span>
                  </h1>
                  <p className="text-xl text-text-secondary mb-8">
                    Join thousands of creators who are already using AI to bring their stories to life.
                  </p>
                </div>
              </AnimatedSection>

              <AnimatedSection delay={0.1}>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Zap className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-heading font-semibold mb-2">Lightning Fast Generation</h3>
                      <p className="text-text-secondary">
                        Create professional trailers in minutes, not hours. Our AI understands your content and crafts
                        compelling narratives automatically.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-secondary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Shield className="w-5 h-5 text-secondary" />
                    </div>
                    <div>
                      <h3 className="font-heading font-semibold mb-2">Studio-Quality Output</h3>
                      <p className="text-text-secondary">
                        Get professional-grade trailers with cinematic effects, perfect timing, and engaging
                        storytelling that rivals traditional production.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-heading font-semibold mb-2">Free to Start</h3>
                      <p className="text-text-secondary">
                        Begin with 10 free credits every month. No credit card required. Upgrade only when you're ready
                        to scale.
                      </p>
                    </div>
                  </div>
                </div>
              </AnimatedSection>

              <AnimatedSection delay={0.2}>
                <div className="mt-8 p-6 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg border border-primary/20">
                  <div className="flex items-center space-x-2 mb-3">
                    <Check className="w-5 h-5 text-primary" />
                    <span className="font-heading font-semibold">What you get for free:</span>
                  </div>
                  <ul className="space-y-2 text-sm text-text-secondary">
                    <li className="flex items-center space-x-2">
                      <Check className="w-3 h-3 text-primary flex-shrink-0" />
                      <span>10 trailer generation credits per month</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Check className="w-3 h-3 text-primary flex-shrink-0" />
                      <span>Access to all basic trailer styles</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Check className="w-3 h-3 text-primary flex-shrink-0" />
                      <span>720p HD video exports</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Check className="w-3 h-3 text-primary flex-shrink-0" />
                      <span>Community support and tutorials</span>
                    </li>
                  </ul>
                </div>
              </AnimatedSection>
            </div>

            {/* Right Side - Sign Up Form */}
            <div className="order-1 lg:order-2">
              <AnimatedSection delay={0.3}>
                <Card className="bg-background-secondary/50 border-background-tertiary">
                  <CardHeader>
                    <CardTitle className="text-center text-2xl">Create your account</CardTitle>
                    <p className="text-center text-text-secondary">Start your AI trailer journey today</p>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Personal Information */}
                      <div className="space-y-4">
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
                      </div>

                      {/* Password Section */}
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="password">Password *</Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted" />
                            <Input
                              id="password"
                              name="password"
                              type={showPassword ? "text" : "password"}
                              placeholder="Create a strong password"
                              value={formData.password}
                              onChange={handleInputChange}
                              className="pl-10 pr-10 bg-background-tertiary border-background-tertiary focus:border-primary"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-muted hover:text-text-primary"
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        {/* Password Requirements */}
                        {formData.password && (
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-text-secondary">Password requirements:</p>
                            <div className="grid grid-cols-1 gap-1">
                              {passwordRequirements.map((requirement, index) => (
                                <div key={index} className="flex items-center space-x-2">
                                  {requirement.met ? (
                                    <Check className="w-3 h-3 text-green-400" />
                                  ) : (
                                    <X className="w-3 h-3 text-text-muted" />
                                  )}
                                  <span className={`text-xs ${requirement.met ? "text-green-400" : "text-text-muted"}`}>
                                    {requirement.text}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div>
                          <Label htmlFor="confirmPassword">Confirm Password *</Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted" />
                            <Input
                              id="confirmPassword"
                              name="confirmPassword"
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder="Confirm your password"
                              value={formData.confirmPassword}
                              onChange={handleInputChange}
                              className="pl-10 pr-10 bg-background-tertiary border-background-tertiary focus:border-primary"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-muted hover:text-text-primary"
                            >
                              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                          {formData.confirmPassword && !passwordsMatch && (
                            <p className="text-xs text-red-400 mt-1">Passwords do not match</p>
                          )}
                          {passwordsMatch && formData.confirmPassword && (
                            <p className="text-xs text-green-400 mt-1">Passwords match</p>
                          )}
                        </div>
                      </div>

                      {/* Terms and Updates */}
                      <div className="space-y-3">
                        <label className="flex items-start space-x-3 cursor-pointer">
                          <input
                            type="checkbox"
                            name="agreeToTerms"
                            checked={formData.agreeToTerms}
                            onChange={handleInputChange}
                            className="mt-1 rounded border-background-tertiary"
                            required
                          />
                          <span className="text-sm text-text-secondary">
                            I agree to the{" "}
                            <Link href="/terms" className="text-primary hover:text-primary/80">
                              Terms of Service
                            </Link>{" "}
                            and{" "}
                            <Link href="/privacy" className="text-primary hover:text-primary/80">
                              Privacy Policy
                            </Link>
                          </span>
                        </label>

                        <label className="flex items-start space-x-3 cursor-pointer">
                          <input
                            type="checkbox"
                            name="subscribeToUpdates"
                            checked={formData.subscribeToUpdates}
                            onChange={handleInputChange}
                            className="mt-1 rounded border-background-tertiary"
                          />
                          <span className="text-sm text-text-secondary">
                            Send me product updates, tips, and special offers
                          </span>
                        </label>
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-primary hover:bg-primary/90 text-background-primary font-medium shadow-glow"
                        disabled={!isFormValid || isLoading}
                      >
                        {isLoading ? (
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 border-2 border-background-primary/30 border-t-background-primary rounded-full animate-spin" />
                            <span>Creating Account...</span>
                          </div>
                        ) : (
                          <>
                            Create Account
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </>
                        )}
                      </Button>
                    </form>

                    <div className="mt-6">
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-background-tertiary" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                          <span className="px-2 bg-background-secondary text-text-muted">Or sign up with</span>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleSocialSignup("google")}
                          className="bg-transparent border-background-tertiary hover:border-primary/50"
                        >
                          <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                            <path
                              fill="currentColor"
                              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                              fill="currentColor"
                              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                              fill="currentColor"
                              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                              fill="currentColor"
                              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                          </svg>
                          Google
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleSocialSignup("facebook")}
                          className="bg-transparent border-background-tertiary hover:border-primary/50"
                        >
                          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                          </svg>
                          Facebook
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </AnimatedSection>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
