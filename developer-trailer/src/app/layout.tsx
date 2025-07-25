import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { TRPCProvider } from '@/components/providers/trpc-provider';
import { AuthProvider } from '@/lib/auth/auth-context';
import { Navbar } from '@/components/layout/navbar';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Developer Trailer - AI Video Generation for Developers',
  description: 'Create stunning promotional videos for your projects with AI',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <TRPCProvider>
          <AuthProvider>
            <div className="min-h-screen bg-background">
              <Navbar />
              <main>
                {children}
              </main>
            </div>
            <Toaster position="top-right" />
          </AuthProvider>
        </TRPCProvider>
      </body>
    </html>
  );
} 