'use client';

import { Scale, Search, FileText, Shield } from 'lucide-react';
import { LogoIcon } from '../shared/LogoIcon';


export default function EmptyState({ darkMode = false }: { darkMode?: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <LogoIcon size={56} darkMode={darkMode} />
      </div>
      <h2
        className="text-2xl font-bold mb-2 text-center"
        style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}
      >
        Legal Rights Navigator
      </h2>
      <p className="text-sm text-center max-w-md leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
        Ask about your employment rights, tenant protections, civil rights claims, and more.
        All answers cite applicable statutes and case law.
      </p>
    </div>
  );
}
