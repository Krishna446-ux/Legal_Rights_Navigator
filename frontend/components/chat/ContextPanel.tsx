'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, ChevronRight, X, FileText, Scale, BookOpen, Gauge } from 'lucide-react';
import type { LegalSource, Citation } from '../../lib/types';
import ConfidenceBadge from '../shared/ConfidenceBadge';

interface SectionCardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function SectionCard({ title, icon, children, defaultOpen = true }: SectionCardProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 hover:opacity-80 transition-opacity"
        style={{ backgroundColor: 'var(--card)' }}
      >
        <div className="flex items-center gap-2">
          <span style={{ color: 'var(--primary)' }}>{icon}</span>
          <span className="text-xs font-semibold" style={{ color: 'var(--foreground)', fontFamily: 'var(--font-display)' }}>
            {title}
          </span>
        </div>
        {open ? (
          <ChevronUp size={13} style={{ color: 'var(--muted-foreground)' }} />
        ) : (
          <ChevronDown size={13} style={{ color: 'var(--muted-foreground)' }} />
        )}
      </button>
      {open && (
        <div className="px-4 pb-4 pt-1" style={{ backgroundColor: 'var(--card)', borderTop: '1px solid var(--border)' }}>
          {children}
        </div>
      )}
    </div>
  );
}

interface Props {
  citations: Citation[];
  sources: LegalSource[];
  collapsed: boolean;
  onToggle: () => void;
  onClose: () => void;
}

export default function ContextPanel({ citations, sources, collapsed, onToggle, onClose }: Props) {
  if (collapsed) {
    return (
      <button
        onClick={onToggle}
        className="flex flex-col items-center py-4 px-3 gap-3 hover:opacity-80 transition-opacity"
        style={{
          borderLeft: '1px solid var(--border)',
          backgroundColor: 'var(--card)',
          width: 44,
          flexShrink: 0,
        }}
      >
        <Scale size={14} style={{ color: 'var(--primary)' }} />
        <ChevronRight size={13} style={{ color: 'var(--muted-foreground)', transform: 'rotate(180deg)' }} />
      </button>
    );
  }

  return (
    <div
      className="flex flex-col"
      style={{
        width: 'var(--context-width)',
        borderLeft: '1px solid var(--border)',
        backgroundColor: 'var(--background)',
        flexShrink: 0,
        overflowY: 'auto',
      }}
    >
      <div
        className="px-4 py-3.5 flex items-center justify-between sticky top-0 z-10"
        style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--card)' }}
      >
        <div className="flex items-center gap-2">
          <Scale size={14} style={{ color: 'var(--primary)' }} />
          <span className="text-xs font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>
            Legal Context
          </span>
        </div>
        <button onClick={onClose} className="p-1 rounded-lg hover:opacity-70" style={{ color: 'var(--muted-foreground)' }}>
          <X size={13} />
        </button>
      </div>

      <div className="p-3 space-y-3">
        {/* Confidence indicator */}
        <SectionCard title="Confidence Indicator" icon={<Gauge size={13} />}>
          <div className="mt-2 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Overall Match</span>
              <ConfidenceBadge confidence={0.91} size="md" />
            </div>
            <div
              className="w-full h-1.5 rounded-full overflow-hidden"
              style={{ backgroundColor: 'var(--border)' }}
            >
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: '91%', backgroundColor: '#16a34a' }}
              />
            </div>
            <p className="text-[10px] leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
              3 directly applicable statutes retrieved with high relevance scoring.
            </p>
          </div>
        </SectionCard>

        {/* Retrieved sources */}
        <SectionCard title="Retrieved Legal Sources" icon={<FileText size={13} />}>
          <div className="mt-2 space-y-2.5">
            {sources.map(s => (
              <div key={s.id}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-medium leading-tight" style={{ color: 'var(--foreground)', fontFamily: 'var(--font-display)' }}>
                      {s.title}
                    </p>
                    <span
                      className="inline-block text-[9px] px-1.5 py-0.5 rounded mt-0.5 font-mono uppercase tracking-wide"
                      style={{
                        backgroundColor: 'var(--muted)',
                        color: 'var(--muted-foreground)',
                      }}
                    >
                      {s.type} · {s.jurisdiction}
                    </span>
                  </div>
                  <ConfidenceBadge confidence={s.confidence} />
                </div>
                <p className="text-[10px] leading-relaxed mt-1" style={{ color: 'var(--muted-foreground)' }}>
                  {s.relevance}
                </p>
                {sources.indexOf(s) < sources.length - 1 && (
                  <div className="mt-2.5" style={{ borderTop: '1px solid var(--border)' }} />
                )}
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Applicable acts */}
        {citations.length > 0 && (
          <SectionCard title="Applicable Acts" icon={<BookOpen size={13} />} defaultOpen={false}>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {Array.from(new Set(citations.flatMap(c => c.act ? [c.act] : []))).map(act => (
                <span
                  key={act}
                  className="text-[10px] px-2 py-1 rounded-lg font-mono"
                  style={{ backgroundColor: 'var(--muted)', color: 'var(--foreground)', border: '1px solid var(--border)' }}
                >
                  {act}
                </span>
              ))}
            </div>
          </SectionCard>
        )}

        {/* Relevant sections */}
        {citations.length > 0 && (
          <SectionCard title="Relevant Sections" icon={<Scale size={13} />} defaultOpen={false}>
            <div className="mt-2 space-y-1.5">
              {citations.map(c => (
                <div key={c.id} className="flex items-start gap-1.5">
                  <span className="text-[10px] font-mono flex-shrink-0 mt-0.5" style={{ color: 'var(--primary)' }}>§</span>
                  <span className="text-[10px] leading-relaxed" style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--font-mono)' }}>
                    {c.section}
                  </span>
                </div>
              ))}
            </div>
          </SectionCard>
        )}

        {/* Case metadata */}
        <SectionCard title="Case Metadata" icon={<FileText size={13} />} defaultOpen={false}>
          <div className="mt-2 space-y-2 text-[10px]" style={{ fontFamily: 'var(--font-mono)' }}>
            {[
              ['Area', 'Employment Law'],
              ['Jurisdiction', 'California / Federal'],
              ['Claim Type', 'Retaliation / Wrongful Term.'],
              ['Statute of Limit.', '3 years (CA DFEH)'],
              ['Retrieval Score', '0.912'],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between">
                <span style={{ color: 'var(--muted-foreground)' }}>{k}</span>
                <span className="font-medium text-right" style={{ color: 'var(--foreground)' }}>{v}</span>
              </div>
            ))}
          </div>
        </SectionCard>

        <p className="text-[9px] text-center px-4 pb-2 leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
          Sources retrieved via semantic search over state & federal statutes, regulations, and agency guidance.
        </p>
      </div>
    </div>
  );
}
