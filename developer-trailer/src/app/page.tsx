"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AnimatedSection } from "@/components/animated-section"
import { HeroBackground } from "@/components/hero-background"
import { ClientOnly } from "@/components/client-only"
import { motion } from "framer-motion"
import { Play, Sparkles, Zap, Clock, Star, ArrowRight, CheckCircle, Video, Wand2, Target, User, LogOut } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useAuth } from "@/lib/auth/auth-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function HomePage() {
  const { user, signOut, loading } = useAuth()
  const features = [
    {
      icon: <Wand2 className="w-6 h-6" />,
      title: "AI-Powered Generation",
      description: "Transform your ideas into compelling trailers with advanced AI technology",
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Lightning Fast",
      description: "Generate professional trailers in minutes, not hours or days",
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "Precision Targeting",
      description: "Tailored content that resonates with your specific audience",
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "Studio Quality",
      description: "Professional-grade output that rivals traditional production",
    },
  ]

  const stats = [
    { number: "50K+", label: "Trailers Generated" },
    { number: "98%", label: "User Satisfaction" },
    { number: "5x", label: "Faster Than Traditional" },
    { number: "24/7", label: "AI Availability" },
  ]

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Marketing Director",
      company: "StreamFlix",
      content:
        "TrailerAI transformed our content marketing. We now create trailers 10x faster with incredible quality.",
      rating: 5,
    },
    {
      name: "Marcus Rodriguez",
      role: "Content Creator",
      company: "Independent",
      content: "As a solo creator, this tool is a game-changer. Professional trailers without the professional budget.",
      rating: 5,
    },
    {
      name: "Emily Watson",
      role: "Brand Manager",
      company: "TechCorp",
      content: "The AI understands our brand voice perfectly. Every trailer feels authentic and engaging.",
      rating: 5,
    },
  ]

  return (
    <ClientOnly fallback={<div className="min-h-screen bg-background-primary text-text-primary font-body">Loading...</div>}>
      <div className="min-h-screen bg-background-primary text-text-primary font-body">
      {/* Header */}
      <header className="relative z-50 border-b border-background-secondary/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-center space-x-2"
            >
              <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                  <Video className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-heading font-bold">TrailerAI</span>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="hidden md:flex items-center space-x-8"
            >
              <Link href="#features" className="text-text-secondary hover:text-text-primary transition-colors">
                Features
              </Link>
              <Link href="/pricing" className="text-text-secondary hover:text-text-primary transition-colors">
                Pricing
              </Link>
              <Link href="#examples" className="text-text-secondary hover:text-text-primary transition-colors">
                Examples
              </Link>
              <Link href="#about" className="text-text-secondary hover:text-text-primary transition-colors">
                About
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex items-center space-x-4"
            >
              {loading ? (
                <div className="w-20 h-9 bg-gray-200 animate-pulse rounded"></div>
              ) : user ? (
                <>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="flex items-center space-x-2 text-text-secondary hover:text-text-primary">
                        <User className="w-4 h-4" />
                        <span className="hidden sm:inline">{user.email}</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard" className="flex items-center">
                          <User className="w-4 h-4 mr-2" />
                          Dashboard
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/pricing" className="flex items-center">
                          <Star className="w-4 h-4 mr-2" />
                          Pricing
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => signOut()} className="flex items-center text-red-600">
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Link href="/generate">
                    <Button className="bg-primary hover:bg-primary/90 text-background-primary font-medium shadow-glow">
                      Start Creating
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Button variant="ghost" className="text-text-secondary hover:text-text-primary">
                    <Link href="/signin">Sign In</Link>
                  </Button>
                  <Link href="/generate">
                    <Button className="bg-primary hover:bg-primary/90 text-background-primary font-medium shadow-glow">
                      Start Creating
                    </Button>
                  </Link>
                </>
              )}
            </motion.div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <HeroBackground />

        <div className="relative z-10 container mx-auto px-4 text-center">
          <AnimatedSection delay={0.2}>
            <Badge className="mb-6 bg-secondary/20 text-secondary border-secondary/30 hover:bg-secondary/30">
              <Sparkles className="w-4 h-4 mr-2" />
              Powered by Advanced AI
            </Badge>
          </AnimatedSection>

          <AnimatedSection delay={0.4}>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-heading font-bold mb-6 leading-tight">
              AI Trailers that
              <span className="block bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                captivate audiences
              </span>
            </h1>
          </AnimatedSection>

          <AnimatedSection delay={0.6}>
            <p className="text-xl md:text-2xl text-text-secondary mb-8 max-w-3xl mx-auto leading-relaxed">
              Transform your content into compelling trailers with AI that understands storytelling, emotion, and audience
              engagement.
            </p>
          </AnimatedSection>

          <AnimatedSection delay={0.8}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Link href="/generate">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-background-primary font-medium px-8 py-4 text-lg shadow-glow animate-glow-pulse"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Generate Your First Trailer
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="border-text-secondary text-text-primary hover:bg-background-secondary px-8 py-4 text-lg bg-transparent"
              >
                Watch Demo
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={1.0}>
            <div className="flex items-center justify-center gap-8 text-text-muted text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-primary" />
                No credit card required
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-primary" />
                Ready in 60 seconds
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-background-secondary/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <AnimatedSection key={index} delay={index * 0.1}>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-heading font-bold text-primary mb-2">{stat.number}</div>
                  <div className="text-text-secondary">{stat.label}</div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24">
        <div className="container mx-auto px-4">
          <AnimatedSection className="text-center mb-16">
            <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">Features</Badge>
            <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6">The future of trailer creation</h2>
            <p className="text-xl text-text-secondary max-w-3xl mx-auto">
              Harness the power of AI to create trailers that tell your story with precision, emotion, and professional
              quality.
            </p>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <AnimatedSection key={index} delay={index * 0.1}>
                <Card className="bg-background-secondary/50 border-background-tertiary hover:border-primary/30 transition-all duration-300 h-full">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center mb-4">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-heading font-semibold mb-3">{feature.title}</h3>
                    <p className="text-text-secondary">{feature.description}</p>
                  </CardContent>
                </Card>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Examples Section */}
      <section id="examples" className="py-24 bg-background-secondary/30">
        <div className="container mx-auto px-4">
          <AnimatedSection className="text-center mb-16">
            <Badge className="mb-4 bg-secondary/20 text-secondary border-secondary/30">Examples</Badge>
            <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6">See TrailerAI in action</h2>
            <p className="text-xl text-text-secondary max-w-3xl mx-auto">
              From indie films to corporate content, see how creators are using AI to craft compelling trailers that
              drive engagement.
            </p>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((item, index) => (
              <AnimatedSection key={item} delay={index * 0.1}>
                <Card className="bg-background-secondary border-background-tertiary overflow-hidden group hover:border-primary/30 transition-all duration-300">
                  <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 relative overflow-hidden flex items-center justify-center">
                    <div className="text-text-muted text-lg font-semibold">AI Trailer {item}</div>
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Button size="sm" className="bg-primary hover:bg-primary/90">
                        <Play className="w-4 h-4 mr-2" />
                        Watch
                      </Button>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-heading font-semibold mb-2">Sci-Fi Thriller Trailer</h3>
                    <p className="text-sm text-text-secondary">Generated in 45 seconds • 2.3M views</p>
                  </CardContent>
                </Card>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <AnimatedSection className="text-center mb-16">
            <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">Testimonials</Badge>
            <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6">Loved by creators worldwide</h2>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <AnimatedSection key={index} delay={index * 0.1}>
                <Card className="bg-background-secondary/50 border-background-tertiary h-full">
                  <CardContent className="p-6">
                    <div className="flex mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-primary fill-current" />
                      ))}
                    </div>
                    <p className="text-text-secondary mb-6 italic">&ldquo;{testimonial.content}&rdquo;</p>
                    <div>
                      <div className="font-heading font-semibold">{testimonial.name}</div>
                      <div className="text-sm text-text-muted">
                        {testimonial.role} • {testimonial.company}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-secondary/20 to-primary/20">
        <div className="container mx-auto px-4 text-center">
          <AnimatedSection>
            <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6">Ready to create your first AI trailer?</h2>
            <p className="text-xl text-text-secondary mb-8 max-w-2xl mx-auto">
              Join thousands of creators who are already using TrailerAI to bring their stories to life.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-background-primary font-medium px-8 py-4 text-lg shadow-glow"
              >
                <Zap className="w-5 h-5 mr-2" />
                Start Creating Now
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-text-secondary text-text-primary hover:bg-background-secondary px-8 py-4 text-lg bg-transparent"
              >
                Schedule Demo
              </Button>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 bg-background-secondary border-t border-background-tertiary">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                  <Video className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-heading font-bold">TrailerAI</span>
              </div>
              <p className="text-text-secondary">The future of trailer creation, powered by artificial intelligence.</p>
            </div>

            <div>
              <h3 className="font-heading font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-text-secondary">
                <li>
                  <Link href="#" className="hover:text-text-primary transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-text-primary transition-colors">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-text-primary transition-colors">
                    API
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-text-primary transition-colors">
                    Integrations
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-heading font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-text-secondary">
                <li>
                  <Link href="#" className="hover:text-text-primary transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-text-primary transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-text-primary transition-colors">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-text-primary transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-heading font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-text-secondary">
                <li>
                  <Link href="#" className="hover:text-text-primary transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-text-primary transition-colors">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-text-primary transition-colors">
                    Community
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-text-primary transition-colors">
                    Status
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-background-tertiary pt-8 flex flex-col md:flex-row items-center justify-between">
            <p className="text-text-muted text-sm">© 2024 TrailerAI. All rights reserved.</p>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <Link href="#" className="text-text-muted hover:text-text-primary transition-colors text-sm">
                Privacy Policy
              </Link>
              <Link href="#" className="text-text-muted hover:text-text-primary transition-colors text-sm">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>
      </div>
    </ClientOnly>
  )
}
