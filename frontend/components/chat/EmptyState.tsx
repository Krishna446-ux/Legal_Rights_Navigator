'use client';

import { Scale, Search, FileText, Shield } from 'lucide-react';

const suggestions = [
  {
    icon: Scale,
    title: 'Employment Rights',
    prompt: 'I was wrongfully terminated after reporting workplace safety violations. What are my rights?',
  },
  {
    icon: FileText,
    title: 'Tenant Protections',
    prompt: 'My landlord is refusing to return my security deposit without explanation. What can I do?',
  },
  {
    icon: Shield,
    title: 'Discrimination Claims',
    prompt: 'My employer denied my disability accommodation request despite a doctor\'s letter. Is this legal?',
  },
  {
    icon: Search,
    title: 'Wage & Hour',
    prompt: 'I have not been paid overtime for 60+ hour weeks for the past six months. What are my options?',
  },
];

interface Props {
  onPromptSelect: (prompt: string) => void;
}

export default function EmptyState({ onPromptSelect }: Props) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 pb-20 max-w-2xl mx-auto">
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 text-white text-xl font-bold"
        style={{ backgroundColor: 'var(--primary)', fontFamily: 'var(--font-display)' }}
      >
        LN
      </div>
      <h2
        className="text-2xl font-bold mb-2 text-center"
        style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}
      >
        Legal Rights Navigator
      </h2>
      <p className="text-sm text-center mb-10 max-w-md leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
        Ask about your employment rights, tenant protections, civil rights claims, and more.
        All answers cite applicable statutes and case law.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
        {suggestions.map((s) => {
          const Icon = s.icon;
          return (
            <button
              key={s.title}
              onClick={() => onPromptSelect(s.prompt)}
              className="group p-4 rounded-xl text-left transition-all duration-150 hover:scale-[1.01] active:scale-[0.99]"
              style={{
                border: '1px solid var(--border)',
                backgroundColor: 'var(--card)',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon size={15} style={{ color: 'var(--primary)' }} />
                <span className="text-xs font-semibold" style={{ color: 'var(--primary)', fontFamily: 'var(--font-display)' }}>
                  {s.title}
                </span>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                {s.prompt}
              </p>
            </button>
          );
        })}
      </div>
      <p className="mt-8 text-xs text-center" style={{ color: 'var(--muted-foreground)' }}>
        Not legal advice · For informational purposes only · Always consult a licensed attorney
      </p>
    </div>
  );
}
