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

  if (error) {
    console.error('OAuth error from provider:', error);
    return NextResponse.redirect(`${requestUrl.origin}/signin?error=${error}`);
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
          // User doesn't exist, create new user record
          console.log('Creating new user record in public.users');
          
          const { error: insertError } = await supabase
            .from('users')
            .insert({
              id: user.id,
              email: user.email!,
              name: user.user_metadata?.full_name || user.user_metadata?.name || null,
              avatar_url: user.user_metadata?.avatar_url || null,
              plan: 'free',
              credits: 1,
              email_verified: user.email_confirmed_at ? new Date(user.email_confirmed_at) : null
            });
          
          if (insertError) {
            console.error('Error creating user record:', insertError);
          } else {
            console.log('User record created successfully');
          }
        } else if (!checkError) {
          console.log('User record already exists');
        } else {
          console.error('Error checking user existence:', checkError);
        }
      } else {
        console.error('Error getting user:', userError);
      }
      
      console.log('Auth callback successful, redirecting to dashboard');
      // Fix: Use ngrok URL instead of localhost
      const baseUrl = process.env.NODE_ENV === 'production' 
        ? process.env.NEXT_PUBLIC_SITE_URL 
        : 'https://a3735310e07c.ngrok-free.app';
      return NextResponse.redirect(`${baseUrl}/dashboard`);
    } else {
      console.error('Auth error during session exchange:', authError);
      return NextResponse.redirect(`${requestUrl.origin}/signin?error=auth_failed`);
    }
  } else {
    console.error('No auth code received in callback');
    return NextResponse.redirect(`${requestUrl.origin}/signin?error=no_code`);
  }

  // Fallback redirect
  return NextResponse.redirect(`${requestUrl.origin}/signin?error=unknown`);
}