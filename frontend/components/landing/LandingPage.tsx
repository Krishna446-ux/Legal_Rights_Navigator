'use client';

import { Scale, Search, Shield, FileText, ChevronRight, CheckCircle, Star, ArrowRight, Moon, Sun } from 'lucide-react';
import type { View } from '../../lib/types';
import { useRouter } from 'next/navigation';
import { AuthContext } from '@/lib/auth-context';
import { useContext, useState } from 'react';
import { authState } from '@/types/authState';
import { useTheme } from '../../lib/theme-context';
import { LogoIcon } from '../shared/LogoIcon';

const features = [
  {
    icon: Search,
    title: 'Statute-Grounded Answers',
    description: 'Every response is grounded in retrieved statutory text, regulations, and agency guidance — not just model weights.',
  },
  {
    icon: Scale,
    title: 'Multi-Jurisdiction Coverage',
    description: 'Covers employment, housing, civil rights, consumer protection, and family law across all 50 states plus federal law.',
  },
  {
    icon: Shield,
    title: 'Source Citations',
    description: 'Every answer includes expandable citations with confidence scores, direct statutory quotes, and jurisdictional scope.',
  },
  {
    icon: FileText,
    title: 'Structured Legal Analysis',
    description: 'Responses are structured into Applicable Law, Explanation, Next Steps, and Limitations — not just a paragraph of text.',
  },
];

const steps = [
  { n: '01', title: 'Describe Your Situation', body: 'Tell us what happened in plain language. No legal jargon required.' },
  { n: '02', title: 'Clarify Key Facts', body: 'Our system identifies the most relevant facts and may ask targeted follow-up questions.' },
  { n: '03', title: 'Receive Legal Analysis', body: 'Get a structured analysis citing applicable statutes, with confidence indicators and next steps.' },
];

const faqs = [
  {
    q: 'Is this legal advice?',
    a: 'No. Legal Navigator provides legal information — statutes, regulations, and general guidance — not advice tailored to your specific circumstances by a licensed attorney. Always consult a lawyer before acting on any information provided here.',
  },
  {
    q: 'Which areas of law does it cover?',
    a: 'Employment law, housing and tenant rights, civil rights and discrimination, wage and hour claims, FMLA and disability accommodations, and consumer protection. Coverage expands regularly.',
  },
  {
    q: 'How are sources selected?',
    a: 'We use semantic retrieval over a database of state and federal statutes, EEOC and agency guidance, and selected case law. Each retrieved source is ranked by relevance and presented with a confidence score.',
  },
  {
    q: 'Is my data private?',
    a: 'Conversations are stored securely and are not used to train models. You can delete your conversation history at any time from the settings panel.',
  },
];

export default function LandingPage() {
  const router = useRouter();
  const { darkMode, toggleTheme } = useTheme();
  const state: authState | null = useContext(AuthContext)
  const isAuthenticated = !(!state) && state.loading === false &&
    Object.keys(state.profile).length > 0

  const handleNavigate = (view: View) => {
    if (view === 'login') router.push('/login');
    if (view === 'chat') {
      if (isAuthenticated) {
        router.push('/chat');
      } else {
        router.push('/login');
      }
    }
  };

  return (
    <div>
      <div style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)', fontFamily: 'var(--font-sans)', minHeight: '100vh' }}>
        {/* Nav */}
      <nav
        className="sticky top-0 z-50 px-6 py-3.5 flex items-center justify-between"
        style={{
          borderBottom: '1px solid var(--border)',
          backgroundColor: 'color-mix(in srgb, var(--background) 95%, transparent)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div className="flex items-center gap-2">
          <LogoIcon size={28} darkMode={darkMode} />
          <span className="text-sm font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>
            Legal Navigator
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 mr-2 rounded-lg transition-colors hover:opacity-80"
            style={{ color: 'var(--muted-foreground)' }}
            title="Toggle theme"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          {!isAuthenticated ? (
            <>
              <button
                onClick={() => handleNavigate('login')}
                className="px-4 py-1.5 text-sm font-medium rounded-lg transition-colors hover:opacity-80"
                style={{ color: 'var(--foreground)' }}
              >
                Sign in
              </button>
              <button
                onClick={() => handleNavigate('chat')}
                className="px-4 py-1.5 text-sm font-semibold rounded-lg transition-[opacity,transform] hover:opacity-90"
                style={{
                  backgroundColor: 'var(--primary)',
                  color: 'var(--primary-foreground)',
                  fontFamily: 'var(--font-display)',
                }}
              >
                Get Started
              </button>
            </>
          ) : (
            <button
              onClick={() => handleNavigate('chat')}
              className="px-4 py-1.5 text-sm font-semibold rounded-lg transition-[opacity,transform] hover:opacity-90"
              style={{
                backgroundColor: 'var(--primary)',
                color: 'var(--primary-foreground)',
                fontFamily: 'var(--font-display)',
              }}
            >
              Go to App
            </button>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 pt-20 pb-16 max-w-4xl mx-auto text-center">
        <h1
          className="text-5xl md:text-6xl font-bold leading-tight mb-6"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)', letterSpacing: '-0.02em' }}
        >
          Know Your Legal Rights.{' '}
          <span style={{ color: 'var(--primary)' }}>Precisely.</span>
        </h1>
        <p
          className="text-lg leading-relaxed mb-10 max-w-2xl mx-auto"
          style={{ color: 'var(--muted-foreground)' }}
        >
          An AI legal assistant that cites actual statutes. Ask about employment, housing,
          civil rights, and more — get structured answers with source citations, not generic advice.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => handleNavigate('chat')}
            className="flex items-center gap-2 px-6 py-3 text-sm font-bold rounded-xl transition-[opacity,transform] hover:opacity-90 active:scale-95"
            style={{
              backgroundColor: 'var(--primary)',
              color: 'var(--primary-foreground)',
              fontFamily: 'var(--font-display)',
            }}
          >
            Start Your Legal Query
            <ArrowRight size={15} />
          </button>

        </div>

        {/* Trust signals */}
        <div className="flex flex-wrap items-center justify-center gap-5 mt-12">
          {[
            'Employment Law',
            'Tenant Rights',
            'Civil Rights',
            'Wage & Hour',
            'FMLA & ADA',
          ].map(label => (
            <div key={label} className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--muted-foreground)' }}>
              <CheckCircle size={12} style={{ color: 'var(--primary)' }} />
              {label}
            </div>
          ))}
        </div>
      </section>



      {/* FAQ */}
      <section id="faq" className="px-6 py-16 max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs font-mono uppercase tracking-widest mb-3" style={{ color: 'var(--primary)', fontFamily: 'var(--font-mono)' }}>
            FAQ
          </p>
          <h2 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>
            Common questions
          </h2>
        </div>
        <div className="space-y-4">
          {faqs.map(f => (
            <div
              key={f.q}
              className="p-5 rounded-xl"
              style={{ border: '1px solid var(--border)', backgroundColor: 'var(--card)' }}
            >
              <h3 className="text-sm font-bold mb-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>
                {f.q}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                {f.a}
              </p>
            </div>
          ))}
        </div>
      </section>


      {/* Footer */}
      <footer
        className="px-6 py-8"
        style={{ borderTop: '1px solid var(--border)', backgroundColor: 'var(--card)' }}
      >
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <LogoIcon size={24} darkMode={darkMode} />
            <span className="text-sm font-bold" style={{ fontFamily: 'var(--font-display)' }}>
              Legal Navigator
            </span>
          </div>
          <p className="text-xs text-center" style={{ color: 'var(--muted-foreground)' }}>
            For informational purposes only. Not legal advice. Always consult a licensed attorney.
          </p>

        </div>
      </footer>
      </div>
    </div>
  );
}
