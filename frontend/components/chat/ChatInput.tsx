'use client';

import { useRef, useState } from 'react';
import { Send, Paperclip, Mic, Square } from 'lucide-react';

interface Props {
  onSend: (message: string) => void;
  isStreaming?: boolean;
  onStop?: () => void;
  disabled?: boolean;
}

const MAX_CHARS = 2000;

export default function ChatInput({ onSend, isStreaming, onStop, disabled }: Props) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled || isStreaming) return;
    onSend(trimmed);
    setValue('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    const ta = e.target;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 200) + 'px';
  };

  const remaining = MAX_CHARS - value.length;
  const nearLimit = remaining < 200;

  return (
    <div className="px-4 py-3">
      <div
        className="max-w-3xl mx-auto rounded-2xl overflow-hidden transition-all"
        style={{
          border: '1.5px solid var(--border)',
          backgroundColor: 'var(--card)',
          boxShadow: '0 2px 12px color-mix(in srgb, var(--foreground) 4%, transparent)',
        }}
        onFocus={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--primary)'; }}
        onBlur={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)'; }}
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="Describe your legal situation in as much detail as possible..."
          maxLength={MAX_CHARS}
          rows={1}
          disabled={disabled}
          className="w-full px-4 pt-3.5 pb-1 text-sm resize-none outline-none bg-transparent leading-relaxed"
          style={{ color: 'var(--foreground)', minHeight: '52px', maxHeight: '200px' }}
        />
        <div className="flex items-center justify-between px-3 pb-2.5 pt-1">
          <div className="flex items-center gap-1">
            <button
              className="p-1.5 rounded-lg transition-colors hover:opacity-80"
              style={{ color: 'var(--muted-foreground)' }}
              title="Attach document"
            >
              <Paperclip size={16} />
            </button>
            <button
              className="p-1.5 rounded-lg transition-colors hover:opacity-80"
              style={{ color: 'var(--muted-foreground)' }}
              title="Voice input"
            >
              <Mic size={16} />
            </button>
          </div>
          <div className="flex items-center gap-2.5">
            {nearLimit && (
              <span
                className="text-[10px] tabular-nums"
                style={{ color: remaining < 50 ? '#dc2626' : 'var(--muted-foreground)', fontFamily: 'var(--font-mono)' }}
              >
                {remaining}
              </span>
            )}
            {isStreaming ? (
              <button
                onClick={onStop}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
                style={{ backgroundColor: '#dc2626', color: 'white', fontFamily: 'var(--font-display)' }}
              >
                <Square size={12} fill="white" />
                Stop
              </button>
            ) : (
              <button
                onClick={handleSend}
                disabled={!value.trim() || disabled}
                className="w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-150 disabled:opacity-40"
                style={{
                  backgroundColor: value.trim() ? 'var(--primary)' : 'var(--muted)',
                  color: value.trim() ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
                }}
              >
                <Send size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
      <p className="text-center text-[10px] mt-2" style={{ color: 'var(--muted-foreground)' }}>
        Not legal advice · Enter to send · Shift+Enter for new line
      </p>
    </div>
  );
}
