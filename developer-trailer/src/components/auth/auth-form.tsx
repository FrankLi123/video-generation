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
import { Mail, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const authSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type AuthFormData = z.infer<typeof authSchema>;

interface AuthFormProps {
  mode?: 'signin' | 'signup';
  onToggleMode?: () => void;
}

export function AuthForm({ mode = 'signin', onToggleMode }: AuthFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [sentEmail, setSentEmail] = useState('');
  const { signIn, signUp } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
  });

  const onSubmit = async (data: AuthFormData) => {
    setIsLoading(true);
    
    try {
      const { error } = mode === 'signin' 
        ? await signIn(data.email)
        : await signUp(data.email);

      if (error) {
        toast.error(error.message || 'An error occurred');
      } else {
        setIsEmailSent(true);
        setSentEmail(data.email);
        reset();
        toast.success('Check your email for the magic link!');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (isEmailSent) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Mail className="w-5 h-5" />
            Check Your Email
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Mail className="w-4 h-4" />
            <AlertDescription>
              We've sent a magic link to <strong>{sentEmail}</strong>. 
              Click the link in your email to sign in.
            </AlertDescription>
          </Alert>
          
          <Button 
            variant="outline" 
            onClick={() => setIsEmailSent(false)}
            className="w-full"
          >
            Use Different Email
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle>
          {mode === 'signin' ? 'Welcome Back' : 'Create Account'}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {mode === 'signin' 
            ? 'Sign in to your account with magic link' 
            : 'Create a new account with magic link'
          }
        </p>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              {...register('email')}
              disabled={isLoading}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {mode === 'signin' ? 'Send Magic Link' : 'Create Account'}
          </Button>
        </form>

        {onToggleMode && (
          <div className="mt-4 text-center">
            <Button
              variant="link"
              onClick={onToggleMode}
              className="text-sm"
            >
              {mode === 'signin' 
                ? "Don't have an account? Sign up" 
                : 'Already have an account? Sign in'
              }
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
