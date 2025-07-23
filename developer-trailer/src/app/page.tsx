'use client';

import { useAuth } from '@/lib/auth/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Video, Zap, Shield, Sparkles, ArrowRight, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const { user } = useAuth();

  if (user) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Welcome back!</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Ready to create your next promotional video?
          </p>
          <Button asChild size="lg">
            <Link href="/dashboard">
              Go to Dashboard
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="container mx-auto px-4 text-center">
          <Badge variant="secondary" className="mb-4">
            <Sparkles className="w-4 h-4 mr-1" />
            AI-Powered Video Generation
          </Badge>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Developer Trailer
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Create stunning promotional videos for your projects in minutes. 
            Perfect for developers, makers, and indie hackers.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button asChild size="lg" className="text-lg px-8 py-4">
              <Link href="/auth/signin">
                Get Started Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            
            <Button variant="outline" size="lg" className="text-lg px-8 py-4">
              <Video className="w-5 h-5 mr-2" />
              Watch Demo
            </Button>
          </div>
          
          {/* Feature Pills */}
          <div className="flex flex-wrap justify-center gap-3">
            <Badge variant="outline" className="px-4 py-2">
              <CheckCircle className="w-4 h-4 mr-1 text-green-600" />
              No Video Editing Experience Required
            </Badge>
            <Badge variant="outline" className="px-4 py-2">
              <CheckCircle className="w-4 h-4 mr-1 text-green-600" />
              AI-Generated Scripts
            </Badge>
            <Badge variant="outline" className="px-4 py-2">
              <CheckCircle className="w-4 h-4 mr-1 text-green-600" />
              Professional Quality
            </Badge>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why Developers Love Us</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Built by developers, for developers. We understand what makes a great project showcase.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center p-8 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Zap className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold mb-4">Lightning Fast</h3>
                <p className="text-muted-foreground">
                  Generate professional videos in under 5 minutes. Just upload your project images and let AI do the rest.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center p-8 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Video className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-semibold mb-4">Professional Quality</h3>
                <p className="text-muted-foreground">
                  Cinema-quality videos that make your projects stand out. Perfect for Product Hunt, social media, and more.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center p-8 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Shield className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-2xl font-semibold mb-4">Privacy First</h3>
                <p className="text-muted-foreground">
                  Your data stays secure. We use industry-standard encryption and never share your content.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-muted-foreground">
              Three simple steps to create amazing promotional videos
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold mb-4">Upload Project Images</h3>
              <p className="text-muted-foreground">
                Add screenshots, photos, or graphics that showcase your project's features and benefits.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold mb-4">AI Generates Script</h3>
              <p className="text-muted-foreground">
                Our AI analyzes your images and creates an engaging script that highlights your project's value.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold mb-4">Download Your Video</h3>
              <p className="text-muted-foreground">
                Get a professional promotional video ready to share on social media, websites, or anywhere else.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Showcase Your Work?</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of developers who are already creating amazing promotional videos for their projects.
          </p>
          
          <Button asChild size="lg" variant="secondary" className="text-lg px-8 py-4">
            <Link href="/auth/signin">
              Start Creating Videos
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </Button>
          
          <p className="text-sm mt-4 opacity-80">
            No credit card required • Free to get started
          </p>
        </div>
      </section>
    </div>
  );
}