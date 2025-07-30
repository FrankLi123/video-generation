import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import { TRPCProvider } from '@/components/providers/trpc-provider';
import { AuthProvider } from '@/lib/auth/auth-context';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: 'TrailerAI - AI-Powered Video Generation',
  description: 'Create stunning AI-generated trailers in minutes with advanced artificial intelligence',
  generator: 'TrailerAI',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body className={`${GeistSans.variable} ${GeistMono.variable} font-sans`}>
        <AuthProvider>
          <TRPCProvider>
            {children}
            <Toaster />
          </TRPCProvider>
        </AuthProvider>
      </body>
    </html>
  );
}