'use client';

import { useTheme } from '../../lib/theme-context';
import { LogoIcon } from '../shared/LogoIcon';

export default function TypingIndicator() {
  const { darkMode } = useTheme();
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="flex-shrink-0 mt-0.5">
        <LogoIcon size={28} darkMode={darkMode} />
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
