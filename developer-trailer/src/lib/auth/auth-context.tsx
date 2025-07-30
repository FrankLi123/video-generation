'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { type User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
        
        if (event === 'SIGNED_IN') {
          // Use router.push instead of window.location.href to maintain session state
          router.push('/dashboard');
        }
        
        if (event === 'SIGNED_OUT') {
          router.push('/');
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, router]);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    // If login successful, check if user exists in database
    if (!error && data.user) {
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('id')
        .eq('id', data.user.id)
        .single();
      
      if (checkError && checkError.code === 'PGRST116') {
        // User doesn't exist in database - sign them out
        await supabase.auth.signOut();
        return { error: { message: 'Account not found. Please sign up first.' } };
      } else if (checkError) {
        // Database error
        await supabase.auth.signOut();
        return { error: { message: 'Database error. Please try again.' } };
      }
    }
    
    return { error };
  };

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    
    // If signup successful, create user record in database
    if (!error && data.user) {
      try {
        // Insert user into public.users table
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: data.user.email!,
            name: data.user.user_metadata?.name || null,
            avatar_url: data.user.user_metadata?.avatar_url || null,
            plan: 'free',
            credits: 10, // Give new users 10 free credits
          });
        
        if (insertError) {
          console.error('Error creating user record:', insertError);
          // Don't return error here as auth user was created successfully
        }
      } catch (err) {
        console.error('Error inserting user:', err);
      }
    }
    
    return { error };
  };

  const signInWithGoogle = async () => {
    // Get the correct base URL based on environment
    const getBaseUrl = () => {
      if (typeof window !== 'undefined') {
        // In browser, check if we have the dev URL env var
        const devUrl = process.env.NEXT_PUBLIC_DEV_URL;
        if (devUrl && process.env.NODE_ENV === 'development') {
          return devUrl;
        }
        // Fallback to current origin
        return window.location.origin;
      }
      // Server-side fallback
      return process.env.NEXT_PUBLIC_DEV_URL || 'http://localhost:3000';
    };
    
    const baseUrl = getBaseUrl();
    const redirectUrl = `${baseUrl}/auth/callback`;
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
      },
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    user,
    loading,
    signIn,
    signOut,
    signUp,
    signInWithGoogle,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}