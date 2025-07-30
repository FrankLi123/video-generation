import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  console.log('=== AUTH CALLBACK ROUTE HIT ===');
  const requestUrl = new URL(request.url);
  console.log('Request URL:', requestUrl.toString());
  const code = requestUrl.searchParams.get('code');
  const error = requestUrl.searchParams.get('error');
  
  console.log('Auth code:', code ? 'present' : 'missing');
  console.log('Auth error:', error);

  // Helper function to get the correct base URL
  const getBaseUrl = () => {
    if (process.env.NODE_ENV === 'production') {
      return process.env.NEXT_PUBLIC_SITE_URL || requestUrl.origin;
    }
    // For development, use the ngrok URL from env or fallback to localhost
    return process.env.NEXT_PUBLIC_DEV_URL || 'http://localhost:3000';
  };

  const baseUrl = getBaseUrl();

  if (error) {
    console.error('OAuth error from provider:', error);
    return NextResponse.redirect(`${baseUrl}/signin?error=${error}`);
  }

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          },
        },
      }
    );
    
    const { error: authError } = await supabase.auth.exchangeCodeForSession(code);
    if (!authError) {
      console.log('Auth session created successfully');
      
      // Get the authenticated user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (user && !userError) {
        console.log('User authenticated:', user.email);
        
        // Check if user exists in public.users table
        const { data: existingUser, error: checkError } = await supabase
          .from('users')
          .select('id')
          .eq('id', user.id)
          .single();
        
        if (checkError && checkError.code === 'PGRST116') {
          // User doesn't exist in database - create them since they successfully authenticated
          console.log('User not found in database, creating user record');
          
          const { error: insertError } = await supabase
            .from('users')
            .insert({
              id: user.id,
              email: user.email!,
              name: user.user_metadata?.name || user.user_metadata?.full_name || null,
              avatar_url: user.user_metadata?.avatar_url || null,
              plan: 'free',
              credits: 10,
            });
          
          if (insertError) {
            console.error('Error creating user record:', insertError);
            await supabase.auth.signOut();
            return NextResponse.redirect(`${baseUrl}/signin?error=user_creation_failed`);
          }
          
          console.log('User record created successfully');
          return NextResponse.redirect(`${baseUrl}/dashboard`);
        } else if (!checkError) {
          console.log('User record exists, allowing login');
          
          // User exists, proceed to dashboard
          return NextResponse.redirect(`${baseUrl}/dashboard`);
        } else {
          console.error('Error checking user existence:', checkError);
          await supabase.auth.signOut();
          return NextResponse.redirect(`${baseUrl}/signin?error=database_error`);
        }
      } else {
        console.error('Error getting user:', userError);
        return NextResponse.redirect(`${baseUrl}/signin?error=user_fetch_failed`);
      }
    } else {
      console.error('Error exchanging code for session:', authError);
      return NextResponse.redirect(`${baseUrl}/signin?error=auth_failed`);
    }
  }

  // No code parameter, redirect to signin
  return NextResponse.redirect(`${baseUrl}/signin`);
}