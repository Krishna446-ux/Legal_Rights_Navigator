'use client';

import { Scale, Search, Shield, FileText, ChevronRight, CheckCircle, Star, ArrowRight } from 'lucide-react';
import type { View } from '../../lib/types';
import { useRouter } from 'next/navigation';

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
  const isAuthenticated = false; // Mocked for now

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
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-[10px] font-bold"
            style={{ backgroundColor: 'var(--primary)', fontFamily: 'var(--font-display)' }}
          >
            LN
          </div>
          <span className="text-sm font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>
            Legal Navigator
          </span>
        </div>
        <div className="hidden md:flex items-center gap-6 text-sm" style={{ color: 'var(--muted-foreground)' }}>
          <a href="#features" className="hover:opacity-80 transition-opacity">Features</a>
          <a href="#how-it-works" className="hover:opacity-80 transition-opacity">How it Works</a>
          <a href="#faq" className="hover:opacity-80 transition-opacity">FAQ</a>
        </div>
        <div className="flex items-center gap-2">
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
                className="px-4 py-1.5 text-sm font-semibold rounded-lg transition-all hover:opacity-90"
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
              className="px-4 py-1.5 text-sm font-semibold rounded-lg transition-all hover:opacity-90"
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
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-8"
          style={{
            border: '1px solid color-mix(in srgb, var(--primary) 30%, transparent)',
            backgroundColor: 'color-mix(in srgb, var(--primary) 6%, transparent)',
            color: 'var(--primary)',
            fontFamily: 'var(--font-mono)',
          }}
        >
          <Star size={10} fill="currentColor" />
          Statute-grounded · Source-cited · Free to start
        </div>
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
            className="flex items-center gap-2 px-6 py-3 text-sm font-bold rounded-xl transition-all hover:opacity-90 active:scale-95"
            style={{
              backgroundColor: 'var(--primary)',
              color: 'var(--primary-foreground)',
              fontFamily: 'var(--font-display)',
            }}
          >
            Start Your Legal Query
            <ArrowRight size={15} />
          </button>
          <a
            href="#how-it-works"
            className="flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-xl transition-all hover:opacity-80"
            style={{
              border: '1px solid var(--border)',
              color: 'var(--foreground)',
              fontFamily: 'var(--font-display)',
            }}
          >
            Learn More
            <ChevronRight size={15} />
          </a>
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

      {/* Features */}
      <section id="features" className="px-6 py-16 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs font-mono uppercase tracking-widest mb-3" style={{ color: 'var(--primary)', fontFamily: 'var(--font-mono)' }}>
            Why Legal Navigator
          </p>
          <h2 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>
            Built differently from general AI
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {features.map(f => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="p-6 rounded-2xl"
                style={{ border: '1px solid var(--border)', backgroundColor: 'var(--card)' }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: 'color-mix(in srgb, var(--primary) 10%, transparent)' }}
                >
                  <Icon size={17} style={{ color: 'var(--primary)' }} />
                </div>
                <h3 className="text-sm font-bold mb-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>
                  {f.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                  {f.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="px-6 py-16" style={{ backgroundColor: 'var(--muted)' }}>
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-mono uppercase tracking-widest mb-3" style={{ color: 'var(--primary)', fontFamily: 'var(--font-mono)' }}>
              How It Works
            </p>
            <h2 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>
              From question to cited answer
            </h2>
          </div>
          <div className="space-y-6">
            {steps.map((s, i) => (
              <div key={s.n} className="flex gap-5">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-xs"
                  style={{
                    backgroundColor: 'var(--primary)',
                    color: 'var(--primary-foreground)',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  {s.n}
                </div>
                <div className="pt-2">
                  <h3 className="text-sm font-bold mb-1" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>
                    {s.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                    {s.body}
                  </p>
                  {i < steps.length - 1 && (
                    <div className="w-px h-5 mt-4 ml-[-22px]" style={{ backgroundColor: 'var(--border)' }} />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why different */}
      <section className="px-6 py-16 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs font-mono uppercase tracking-widest mb-3" style={{ color: 'var(--primary)', fontFamily: 'var(--font-mono)' }}>
            Why This Is Different
          </p>
          <h2 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>
            Not just AI. Retrieval-augmented legal information.
          </h2>
        </div>
        <div
          className="rounded-2xl p-8"
          style={{ border: '1px solid var(--border)', backgroundColor: 'var(--card)' }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {[
              { stat: '50+', label: 'U.S. jurisdictions covered' },
              { stat: '94%', label: 'Average source confidence score' },
              { stat: '< 10s', label: 'Median response time' },
            ].map(item => (
              <div key={item.stat}>
                <p className="text-4xl font-bold mb-1" style={{ fontFamily: 'var(--font-display)', color: 'var(--primary)' }}>
                  {item.stat}
                </p>
                <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>{item.label}</p>
              </div>
            ))}
          </div>
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

      {/* CTA */}
      <section
        className="px-6 py-20 text-center"
        style={{ backgroundColor: 'var(--primary)' }}
      >
        <h2
          className="text-3xl font-bold mb-4 text-white"
          style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}
        >
          Ready to understand your rights?
        </h2>
        <p className="text-sm mb-8 max-w-md mx-auto" style={{ color: 'rgba(255,255,255,0.75)' }}>
          Start for free. No account required for your first query.
        </p>
        <button
          onClick={() => handleNavigate('chat')}
          className="inline-flex items-center gap-2 px-8 py-3.5 text-sm font-bold rounded-xl transition-all hover:opacity-90 active:scale-95"
          style={{
            backgroundColor: 'white',
            color: 'var(--primary)',
            fontFamily: 'var(--font-display)',
          }}
        >
          Start Your Legal Query
          <ArrowRight size={15} />
        </button>
      </section>

      {/* Footer */}
      <footer
        className="px-6 py-8"
        style={{ borderTop: '1px solid var(--border)', backgroundColor: 'var(--card)' }}
      >
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-md flex items-center justify-center text-white text-[9px] font-bold"
              style={{ backgroundColor: 'var(--primary)', fontFamily: 'var(--font-display)' }}
            >
              LN
            </div>
            <span className="text-sm font-bold" style={{ fontFamily: 'var(--font-display)' }}>
              Legal Navigator
            </span>
          </div>
          <p className="text-xs text-center" style={{ color: 'var(--muted-foreground)' }}>
            For informational purposes only. Not legal advice. Always consult a licensed attorney.
          </p>
          <div className="flex gap-5 text-xs" style={{ color: 'var(--muted-foreground)' }}>
            <a href="#" className="hover:opacity-80">Privacy</a>
            <a href="#" className="hover:opacity-80">Terms</a>
            <a href="#" className="hover:opacity-80">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
