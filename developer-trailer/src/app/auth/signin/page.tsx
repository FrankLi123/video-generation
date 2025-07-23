'use client';

import { useState } from 'react';
import { AuthForm } from '@/components/auth/auth-form';

export default function SignInPage() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Developer Trailer
          </h1>
          <p className="text-gray-600">
            Create stunning promotional videos for your projects
          </p>
        </div>
        
        <AuthForm 
          mode={mode} 
          onToggleMode={() => setMode(mode === 'signin' ? 'signup' : 'signin')} 
        />
      </div>
    </div>
  );
}
