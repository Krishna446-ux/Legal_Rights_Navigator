'use client';

export default function TypingIndicator() {
  return (
    <div className="flex items-center gap-3 py-2">
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold"
        style={{ backgroundColor: 'var(--primary)', fontFamily: 'var(--font-display)' }}
      >
        LN
      </div>
      <div
        className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl rounded-tl-sm"
        style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
      >
        <span className="typing-dot w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--muted-foreground)' }} />
        <span className="typing-dot w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--muted-foreground)' }} />
        <span className="typing-dot w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--muted-foreground)' }} />
      </div>
    </div>
  );
}
