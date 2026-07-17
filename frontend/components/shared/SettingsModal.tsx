'use client';

import { X, Type, Monitor } from 'lucide-react';

export type FontSize = 'small' | 'medium' | 'large';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  darkMode: boolean;
  onToggleDark: () => void;
  fontSize: FontSize;
  onChangeFontSize: (size: FontSize) => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
  darkMode,
  onToggleDark,
  fontSize,
  onChangeFontSize,
}: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div 
        className="relative w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-fade-in-up"
        style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
      >
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <h2 className="text-lg font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>
            Settings
          </h2>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg transition-colors hover:opacity-70"
            style={{ color: 'var(--muted-foreground)' }}
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-6">
          {/* Appearance / Theme */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Monitor size={15} style={{ color: 'var(--primary)' }} />
              <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Appearance</h3>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-xl" style={{ backgroundColor: 'var(--muted)' }}>
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>Dark Mode</p>
                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Adjust the interface theme</p>
              </div>
              <button
                onClick={onToggleDark}
                className="px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors"
                style={{
                  backgroundColor: darkMode ? 'var(--primary)' : 'var(--card)',
                  color: darkMode ? 'var(--primary-foreground)' : 'var(--foreground)',
                  border: '1px solid var(--border)'
                }}
              >
                {darkMode ? 'On' : 'Off'}
              </button>
            </div>
          </section>

          {/* Text Size */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Type size={15} style={{ color: 'var(--primary)' }} />
              <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Text Size</h3>
            </div>
            
            <div className="flex gap-2 p-1.5 rounded-xl" style={{ backgroundColor: 'var(--muted)' }}>
              {(['small', 'medium', 'large'] as FontSize[]).map(size => (
                <button
                  key={size}
                  onClick={() => onChangeFontSize(size)}
                  className="flex-1 py-2 text-sm font-medium rounded-lg transition-colors capitalize"
                  style={{
                    backgroundColor: fontSize === size ? 'var(--card)' : 'transparent',
                    color: fontSize === size ? 'var(--foreground)' : 'var(--muted-foreground)',
                    boxShadow: fontSize === size ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                  }}
                >
                  {size}
                </button>
              ))}
            </div>
          </section>
          
        </div>
      </div>
    </div>
  );
}
