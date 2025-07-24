'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/lib/auth/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, Loader2, Key } from 'lucide-react';
import { toast } from 'sonner';

const emailSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

const devSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type EmailFormData = z.infer<typeof emailSchema>;
type DevFormData = z.infer<typeof devSchema>;

interface AuthFormProps {
  mode?: 'signin' | 'signup';
  onToggleMode?: () => void;
}

export function AuthForm({ mode = 'signin', onToggleMode }: AuthFormProps) {
  const { signIn, signUp } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [sentEmail, setSentEmail] = useState('');
  const [isDevMode, setIsDevMode] = useState(false);

  const emailForm = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
  });

  const devForm = useForm<DevFormData>({
    resolver: zodResolver(devSchema),
  });

  const onEmailSubmit = async (data: EmailFormData) => {
    setIsLoading(true);
    try {
      const { error } = mode === 'signin'
        ? await signIn(data.email)
        : await signUp(data.email);

      if (error) {
        toast.error(error.message || 'An error occurred');
        setIsLoading(false);
        return;
      }

      setSentEmail(data.email);
      toast.success('Check your email for the magic link!');
    } catch (error) {
      toast.error('An unexpected error occurred');
      setIsLoading(false);
    }
  };

  const onDevSubmit = async (data: DevFormData) => {
    setIsLoading(true);
    try {
      // Create dev user account directly in Supabase
      const { createClientComponentClient } = await import('@supabase/auth-helpers-nextjs');
      const supabase = createClientComponentClient();
      
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: undefined, // Skip email verification
        }
      });

      if (error && error.message.includes('already registered')) {
        // Try to sign in instead
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });
        
        if (signInError) {
          toast.error(signInError.message || 'Failed to sign in');
          setIsLoading(false);
          return;
        }
      } else if (error) {
        toast.error(error.message || 'Failed to create account');
        setIsLoading(false);
        return;
      }

      toast.success('Signed in successfully!');
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Dev auth error:', error);
      toast.error('An unexpected error occurred');
      setIsLoading(false);
    }
  };

  if (sentEmail) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="p-6">
          <Alert>
            <Mail className="w-4 h-4" />
            <AlertDescription>
              We&apos;ve sent a magic link to <strong>{sentEmail}</strong>. 
              Click the link in your email to sign in.
            </AlertDescription>
          </Alert>
          <Button
            variant="outline"
            className="w-full mt-4"
            onClick={() => setSentEmail('')}
          >
            Back to Sign In
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">
          {mode === 'signin' ? 'Welcome Back' : 'Create Account'}
        </CardTitle>
        <p className="text-center text-muted-foreground">
          {mode === 'signin'
            ? 'Sign in to your account'
            : 'Create a new account'
          }
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Dev Mode Toggle */}
        <div className="flex items-center justify-center space-x-2">
          <Button
            type="button"
            variant={!isDevMode ? "default" : "outline"}
            size="sm"
            onClick={() => setIsDevMode(false)}
          >
            <Mail className="w-4 h-4 mr-1" />
            Magic Link
          </Button>
          <Button
            type="button"
            variant={isDevMode ? "default" : "outline"}
            size="sm"
            onClick={() => setIsDevMode(true)}
          >
            <Key className="w-4 h-4 mr-1" />
            Dev Mode
          </Button>
        </div>

        {!isDevMode ? (
          /* Magic Link Form */
          <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                {...emailForm.register('email')}
                disabled={isLoading}
              />
              {emailForm.formState.errors.email && (
                <p className="text-sm text-destructive">
                  {emailForm.formState.errors.email.message}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {mode === 'signin' ? 'Send Magic Link' : 'Create Account'}
            </Button>
          </form>
        ) : (
          /* Dev Mode Form */
          <form onSubmit={devForm.handleSubmit(onDevSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="dev-email">Email</Label>
              <Input
                id="dev-email"
                type="email"
                placeholder="test@example.com"
                {...devForm.register('email')}
                disabled={isLoading}
              />
              {devForm.formState.errors.email && (
                <p className="text-sm text-destructive">
                  {devForm.formState.errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dev-password">Password</Label>
              <Input
                id="dev-password"
                type="password"
                placeholder="password123"
                {...devForm.register('password')}
                disabled={isLoading}
              />
              {devForm.formState.errors.password && (
                <p className="text-sm text-destructive">
                  {devForm.formState.errors.password.message}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Dev Sign In / Sign Up
            </Button>
            
            <p className="text-xs text-muted-foreground text-center">
              Dev mode: Creates account if doesn&apos;t exist, signs in if it does
            </p>
          </form>
        )}

        {onToggleMode && (
          <Button variant="link" className="w-full" onClick={onToggleMode}>
            {mode === 'signin'
              ? "Don't have an account? Sign up"
              : 'Already have an account? Sign in'
            }
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
