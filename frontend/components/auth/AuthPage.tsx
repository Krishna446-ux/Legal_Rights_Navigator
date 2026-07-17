'use client';

import { useContext, useEffect, useState } from 'react';
import { Eye, EyeOff, ArrowLeft, Scale } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { AuthContext } from '@/lib/auth-context';
import { useTheme } from '../../lib/theme-context';
import { LogoIcon } from '../shared/LogoIcon';
import { BACKEND_URL } from '@/lib/config';

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

// initalView is login default
export default function AuthPage() {
  const router = useRouter();
  const state = useContext(AuthContext)
  const isAuthenticated = !!state && state.loading == false && Object.keys(state.profile).length > 0
  const { darkMode } = useTheme();

  // useEffect(() => {
  //   if (isAuthenticated) {
  //     router.push("/chat")
  //   }
  // }, [isAuthenticated, router])
  function handleLogin() {
    if (isAuthenticated) {
      router.push("/chat")
      return
    }
    window.location.href = `${BACKEND_URL}/auth`
  }
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: 'var(--background)' }}
    >
      <div className="w-full max-w-sm">
        {/* Back to landing */}
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-1.5 text-xs mb-8 hover:opacity-70 transition-opacity"
          style={{ color: 'var(--muted-foreground)' }}
        >
          <ArrowLeft size={12} />
          Back to home
        </button>

        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <LogoIcon size={40} darkMode={darkMode} />
        </div>

        <div
          className="rounded-2xl px-6 py-8"
          style={{ border: '1px solid var(--border)', backgroundColor: 'var(--card)' }}
        >
          <>
            <h1 className="text-xl font-bold mb-1 text-center" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>
              Welcome
            </h1>
            <p className="text-sm text-center mb-7" style={{ color: 'var(--muted-foreground)' }}>
              Sign in to your Legal Navigator account
            </p>
            <button onClick={handleLogin}
              className="w-full flex items-center justify-center gap-2.5 py-2.5 text-sm font-medium rounded-xl mb-5 transition-[opacity,transform] hover:opacity-80"
              style={{ border: '1.5px solid var(--border)', backgroundColor: 'var(--background)', color: 'var(--foreground)' }}
            >
              <GoogleIcon />
              Continue with Google
            </button>
          </>

        </div>
      </div>
    </div>
  );
}
