'use client';

import { useState } from 'react';
import { Eye, EyeOff, ArrowLeft, Scale } from 'lucide-react';
import type { View } from '../../lib/types';
import { useRouter } from 'next/navigation';

type AuthView = 'login' | 'register' | 'forgot-password';

interface Props {
  initialView: AuthView;
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

function InputField({
  label, type = 'text', placeholder, value, onChange, rightEl,
}: {
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  rightEl?: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--foreground)', fontFamily: 'var(--font-display)' }}>
        {label}
      </label>
      <div className="relative">
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full px-3 py-2.5 text-sm rounded-xl outline-none transition-all"
          style={{
            border: '1.5px solid var(--border)',
            backgroundColor: 'var(--background)',
            color: 'var(--foreground)',
            paddingRight: rightEl ? 40 : undefined,
          }}
          onFocus={e => { e.currentTarget.style.borderColor = 'var(--primary)'; }}
          onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
        />
        {rightEl && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {rightEl}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AuthPage({ initialView }: Props) {
  const router = useRouter();
  
  const [view, setView] = useState<AuthView>(initialView);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (view === 'forgot-password') {
      setSubmitted(true);
      return;
    }
    
    // Simulate auth
    router.push('/chat');
  };

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
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold text-sm"
            style={{ backgroundColor: 'var(--primary)', fontFamily: 'var(--font-display)' }}
          >
            LN
          </div>
        </div>

        <div
          className="rounded-2xl px-6 py-8"
          style={{ border: '1px solid var(--border)', backgroundColor: 'var(--card)' }}
        >
          {view === 'login' && (
            <>
              <h1 className="text-xl font-bold mb-1 text-center" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>
                Welcome back
              </h1>
              <p className="text-sm text-center mb-7" style={{ color: 'var(--muted-foreground)' }}>
                Sign in to your Legal Navigator account
              </p>
              <button
                className="w-full flex items-center justify-center gap-2.5 py-2.5 text-sm font-medium rounded-xl mb-5 transition-all hover:opacity-80"
                style={{ border: '1.5px solid var(--border)', backgroundColor: 'var(--background)', color: 'var(--foreground)' }}
              >
                <GoogleIcon />
                Continue with Google
              </button>
              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-px" style={{ backgroundColor: 'var(--border)' }} />
                <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>or</span>
                <div className="flex-1 h-px" style={{ backgroundColor: 'var(--border)' }} />
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <InputField label="Email address" type="email" placeholder="you@example.com" value={email} onChange={setEmail} />
                <InputField
                  label="Password"
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={setPassword}
                  rightEl={
                    <button type="button" onClick={() => setShowPass(!showPass)} className="hover:opacity-70 transition-opacity"
                      style={{ color: 'var(--muted-foreground)' }}>
                      {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  }
                />
                <div className="text-right">
                  <button type="button" onClick={() => setView('forgot-password')}
                    className="text-xs hover:opacity-70 transition-opacity"
                    style={{ color: 'var(--primary)' }}>
                    Forgot password?
                  </button>
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 text-sm font-bold rounded-xl transition-all hover:opacity-90 mt-2"
                  style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)', fontFamily: 'var(--font-display)' }}
                >
                  Sign In
                </button>
              </form>
              <p className="text-center text-xs mt-5" style={{ color: 'var(--muted-foreground)' }}>
                Don't have an account?{' '}
                <button onClick={() => setView('register')} className="font-semibold hover:opacity-70"
                  style={{ color: 'var(--primary)' }}>
                  Sign up
                </button>
              </p>
            </>
          )}

          {view === 'register' && (
            <>
              <h1 className="text-xl font-bold mb-1 text-center" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>
                Create your account
              </h1>
              <p className="text-sm text-center mb-7" style={{ color: 'var(--muted-foreground)' }}>
                Free to start. No credit card required.
              </p>
              <button
                className="w-full flex items-center justify-center gap-2.5 py-2.5 text-sm font-medium rounded-xl mb-5 transition-all hover:opacity-80"
                style={{ border: '1.5px solid var(--border)', backgroundColor: 'var(--background)', color: 'var(--foreground)' }}
              >
                <GoogleIcon />
                Continue with Google
              </button>
              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-px" style={{ backgroundColor: 'var(--border)' }} />
                <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>or</span>
                <div className="flex-1 h-px" style={{ backgroundColor: 'var(--border)' }} />
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <InputField label="Full name" placeholder="Jamie Doe" value={name} onChange={setName} />
                <InputField label="Email address" type="email" placeholder="you@example.com" value={email} onChange={setEmail} />
                <InputField
                  label="Password"
                  type={showPass ? 'text' : 'password'}
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={setPassword}
                  rightEl={
                    <button type="button" onClick={() => setShowPass(!showPass)} className="hover:opacity-70 transition-opacity"
                      style={{ color: 'var(--muted-foreground)' }}>
                      {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  }
                />
                <button
                  type="submit"
                  className="w-full py-2.5 text-sm font-bold rounded-xl transition-all hover:opacity-90 mt-2"
                  style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)', fontFamily: 'var(--font-display)' }}
                >
                  Create Account
                </button>
              </form>
              <p className="text-center text-[10px] mt-4 leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                By creating an account you agree to our Terms of Service and Privacy Policy.
              </p>
              <p className="text-center text-xs mt-4" style={{ color: 'var(--muted-foreground)' }}>
                Already have an account?{' '}
                <button onClick={() => setView('login')} className="font-semibold hover:opacity-70"
                  style={{ color: 'var(--primary)' }}>
                  Sign in
                </button>
              </p>
            </>
          )}

          {view === 'forgot-password' && (
            <>
              <h1 className="text-xl font-bold mb-1 text-center" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>
                Reset your password
              </h1>
              {submitted ? (
                <div className="text-center mt-6">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
                    style={{ backgroundColor: 'color-mix(in srgb, var(--primary) 10%, transparent)' }}
                  >
                    <Scale size={22} style={{ color: 'var(--primary)' }} />
                  </div>
                  <p className="text-sm font-semibold mb-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>
                    Check your email
                  </p>
                  <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                    If an account exists for <strong>{email}</strong>, a reset link has been sent.
                  </p>
                  <button
                    onClick={() => setView('login')}
                    className="mt-6 text-xs font-medium hover:opacity-70"
                    style={{ color: 'var(--primary)' }}
                  >
                    Back to sign in
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-sm text-center mb-7" style={{ color: 'var(--muted-foreground)' }}>
                    Enter your email and we'll send a reset link.
                  </p>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <InputField label="Email address" type="email" placeholder="you@example.com" value={email} onChange={setEmail} />
                    <button
                      type="submit"
                      className="w-full py-2.5 text-sm font-bold rounded-xl transition-all hover:opacity-90 mt-2"
                      style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)', fontFamily: 'var(--font-display)' }}
                    >
                      Send Reset Link
                    </button>
                  </form>
                  <p className="text-center text-xs mt-5" style={{ color: 'var(--muted-foreground)' }}>
                    <button onClick={() => setView('login')} className="font-semibold hover:opacity-70"
                      style={{ color: 'var(--primary)' }}>
                      Back to sign in
                    </button>
                  </p>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
