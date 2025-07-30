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
    
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      console.log('Auth callback successful, redirecting to dashboard');
      // Fix: Use ngrok URL instead of localhost
      const baseUrl = process.env.NODE_ENV === 'production' 
        ? process.env.NEXT_PUBLIC_SITE_URL 
        : 'https://a3735310e07c.ngrok-free.app';
      return NextResponse.redirect(`${baseUrl}/dashboard`);
    }
  } else {
    console.error('No auth code received in callback');
    return NextResponse.redirect(`${requestUrl.origin}/signin?error=no_code`);
  }

  // Redirect to dashboard after successful authentication
  return NextResponse.redirect(`${requestUrl.origin}/dashboard`);
}