'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, BookOpen, Globe } from 'lucide-react';
import type { Citation } from '../../lib/types';
import ConfidenceBadge from '../shared/ConfidenceBadge';

interface Props {
  citation: Citation;
  index: number;
}

export default function CitationCard({ citation, index }: Props) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="rounded-xl overflow-hidden transition-all duration-200"
      style={{ border: '1px solid var(--border)', backgroundColor: 'var(--card)' }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left px-4 py-3 flex items-start gap-3 hover:opacity-80 transition-opacity"
      >
        <span
          className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold mt-0.5"
          style={{ backgroundColor: 'var(--primary)', color: 'white', fontFamily: 'var(--font-mono)' }}
        >
          {index + 1}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-semibold leading-tight" style={{ color: 'var(--foreground)', fontFamily: 'var(--font-display)' }}>
                {citation.title}
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--primary)', fontFamily: 'var(--font-mono)' }}>
                {citation.section}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <ConfidenceBadge confidence={citation.confidence} />
              {expanded ? (
                <ChevronUp size={14} style={{ color: 'var(--muted-foreground)' }} />
              ) : (
                <ChevronDown size={14} style={{ color: 'var(--muted-foreground)' }} />
              )}
            </div>
          </div>
          <p className="text-xs mt-1.5 leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
            {citation.summary}
          </p>
        </div>
      </button>

      {expanded && (
        <div
          className="px-4 pb-4 pt-1"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <div className="flex items-center gap-3 mb-3">
            {citation.act && (
              <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
                style={{ backgroundColor: 'var(--muted)', color: 'var(--muted-foreground)', fontFamily: 'var(--font-mono)' }}>
                <BookOpen size={10} />
                {citation.act}
              </span>
            )}
            {citation.jurisdiction && (
              <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
                style={{ backgroundColor: 'var(--muted)', color: 'var(--muted-foreground)', fontFamily: 'var(--font-mono)' }}>
                <Globe size={10} />
                {citation.jurisdiction}
              </span>
            )}
          </div>
          <blockquote
            className="text-xs leading-relaxed italic pl-3"
            style={{ borderLeft: '2px solid var(--primary)', color: 'var(--muted-foreground)' }}
          >
            "{citation.excerpt}"
          </blockquote>
        </div>
      )}
    </div>
  );
}
