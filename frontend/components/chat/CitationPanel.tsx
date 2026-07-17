'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, X, FileText, Scale, BookOpen, Gauge } from 'lucide-react';
import type { Citation } from '../../lib/types';
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
        className="w-full flex items-center justify-between px-3 py-2 hover:opacity-80 transition-opacity"
        style={{ backgroundColor: 'var(--card)' }}
      >
        <div className="flex items-center gap-2">
          <span style={{ color: 'var(--primary)' }}>{icon}</span>
          <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--foreground)', fontFamily: 'var(--font-display)' }}>
            {title}
          </span>
        </div>
        <ChevronDown 
          size={13} 
          className="transition-transform duration-300"
          style={{ color: 'var(--muted-foreground)', transform: open ? 'rotate(180deg)' : 'none' }} 
        />
      </button>
      <div 
        className="grid transition-[opacity,transform,grid-template-rows] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{ gridTemplateRows: open ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">
          <div className="px-3 pb-3 pt-1" style={{ backgroundColor: 'var(--card)', borderTop: open ? '1px solid var(--border)' : 'none' }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

interface Props {
  citations: Citation[];
  isOpen: boolean;
  onClose: () => void;
}

export default function CitationPanel({ citations, isOpen, onClose }: Props) {
  // Calculate overall confidence based on the highest scoring chunk
  const overallConfidence = citations.length > 0 
    ? Math.max(...citations.map(c => c.confidence))
    : 0;

  // Get unique acts/titles
  const applicableActs = Array.from(new Set(citations.map(c => c.title).filter(Boolean)));
  
  // Get unique sections
  const relevantSections = Array.from(new Set(citations.map(c => c.section).filter(Boolean)));

  return (
    <div
      className="flex flex-col flex-shrink-0 h-full transition-[opacity,transform,width] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden"
      style={{
        width: isOpen ? 'var(--context-width, 320px)' : 0,
        borderLeft: isOpen ? '1px solid var(--border)' : 'none',
        backgroundColor: 'var(--background)',
        opacity: isOpen ? 1 : 0,
        pointerEvents: isOpen ? 'auto' : 'none',
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

      <div className="p-2 space-y-2 overflow-y-auto">
        {citations.length === 0 ? (
           <div className="flex flex-col items-center justify-center h-full px-6 text-center py-16">
             <div
               className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
               style={{
                 backgroundColor: 'color-mix(in srgb, var(--primary) 8%, transparent)',
               }}
             >
               <BookOpen size={20} style={{ color: 'var(--primary)' }} />
             </div>
             <p
               className="text-sm font-semibold mb-1"
               style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}
             >
               No context yet
             </p>
             <p className="text-xs leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
               Ask a legal question and the retrieved statutes and case law will appear here.
             </p>
           </div>
        ) : (
          <>
            {/* Confidence indicator */}
            <SectionCard title="Confidence Indicator" icon={<Gauge size={13} />}>
              <div className="mt-2 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>Overall Match</span>
                  <ConfidenceBadge confidence={overallConfidence} size="sm" />
                </div>
                <div
                  className="w-full h-1.5 rounded-full overflow-hidden"
                  style={{ backgroundColor: 'var(--border)' }}
                >
                  <div
                    className="h-full rounded-full transition-[width,background-color] duration-700"
                    style={{ 
                      width: `${Math.round(overallConfidence * 100)}%`, 
                      backgroundColor: overallConfidence >= 0.85 ? '#22c55e' : overallConfidence >= 0.65 ? '#f59e0b' : '#ef4444' 
                    }}
                  />
                </div>
                <p className="text-[10px] leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                  {citations.length} directly applicable text chunks retrieved based on semantic similarity.
                </p>
              </div>
            </SectionCard>

            {/* Retrieved sources */}
            <SectionCard title="Retrieved Legal Sources" icon={<FileText size={13} />}>
              <div className="mt-2 space-y-2.5">
                {citations.map((c, i) => (
                  <div key={c.id}>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-[10px] font-medium leading-tight" style={{ color: 'var(--foreground)', fontFamily: 'var(--font-display)' }}>
                          {c.title || 'Unknown Source'}
                        </p>
                        <span
                          className="inline-block text-[9px] px-1.5 py-0.5 rounded mt-0.5 font-mono uppercase tracking-wide truncate max-w-[150px]"
                          style={{
                            backgroundColor: 'var(--muted)',
                            color: 'var(--muted-foreground)',
                          }}
                        >
                          {c.section ? `§ ${c.section}` : 'N/A'} {c.jurisdiction ? `· ${c.jurisdiction}` : ''}
                        </span>
                      </div>
                      <ConfidenceBadge confidence={c.confidence} />
                    </div>
                    {c.summary && (
                      <p className="text-[10px] leading-relaxed mt-1 line-clamp-2" style={{ color: 'var(--muted-foreground)' }}>
                        {c.summary}
                      </p>
                    )}
                    {i < citations.length - 1 && (
                      <div className="mt-2.5" style={{ borderTop: '1px solid var(--border)' }} />
                    )}
                  </div>
                ))}
              </div>
            </SectionCard>

            {/* Applicable acts */}
            {applicableActs.length > 0 && (
              <SectionCard title="Applicable Acts" icon={<BookOpen size={13} />} defaultOpen={false}>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {applicableActs.map(act => (
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



            <p className="text-[9px] text-center px-4 pb-2 leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
              Sources retrieved via semantic search over statutes and regulations.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
