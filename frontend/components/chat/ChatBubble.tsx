'use client';

import { useState } from 'react';
import { Copy, ThumbsUp, ThumbsDown, RefreshCw, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Message } from '../../lib/types';
import CitationCard from './CitationCard';
import ClarificationCard from './ClarificationCard';
import TypingIndicator from './TypingIndicator';

interface Props {
  message: Message;
  isStreaming?: boolean;
  onRegenerate?: () => void;
  onClarificationSubmit?: (answers: Record<string, string>) => void;
}

export default function ChatBubble({ message, isStreaming, onRegenerate, onClarificationSubmit }: Props) {
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (d: Date) =>
    d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

  if (message.role === 'user') {
    return (
      <div className="flex justify-end gap-3 py-2">
        <div className="max-w-[75%]">
          <div
            className="px-4 py-3 rounded-2xl rounded-tr-sm text-sm leading-relaxed"
            style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
          >
            {message.content}
          </div>
          <p className="text-right text-[10px] mt-1" style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--font-mono)' }}>
            {formatTime(message.timestamp)}
          </p>
        </div>
      </div>
    );
  }

  if (isStreaming && !message.content) {
    return <TypingIndicator />;
  }

  return (
    <div className="flex gap-3 py-2 group">
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-1 text-white text-[10px] font-bold"
        style={{ backgroundColor: 'var(--primary)', fontFamily: 'var(--font-display)' }}
      >
        LN
      </div>
      <div className="flex-1 min-w-0">
        <div
          className="px-5 py-4 rounded-2xl rounded-tl-sm"
          style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
        >
          {message.clarificationQuestions ? (
            <ClarificationCard
              questions={message.clarificationQuestions}
              onSubmit={onClarificationSubmit || (() => {})}
            />
          ) : (
            <div className={`prose text-sm ${isStreaming ? 'streaming-cursor' : ''}`}
              style={{ color: 'var(--foreground)' }}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {message.citations && message.citations.length > 0 && (
          <div className="mt-3 space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-wider px-1"
              style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--font-mono)' }}>
              Legal Sources · {message.citations.length} retrieved
            </p>
            {message.citations.map((c, i) => (
              <CitationCard key={c.id} citation={c} index={i} />
            ))}
          </div>
        )}

        <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <p className="text-[10px] mr-2" style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--font-mono)' }}>
            {formatTime(message.timestamp)}
          </p>
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg transition-colors hover:opacity-80"
            style={{ color: 'var(--muted-foreground)' }}
            title="Copy response"
          >
            {copied ? <Check size={13} /> : <Copy size={13} />}
          </button>
          {onRegenerate && (
            <button
              onClick={onRegenerate}
              className="p-1.5 rounded-lg transition-colors hover:opacity-80"
              style={{ color: 'var(--muted-foreground)' }}
              title="Regenerate"
            >
              <RefreshCw size={13} />
            </button>
          )}
          <button
            onClick={() => setFeedback('up')}
            className="p-1.5 rounded-lg transition-colors hover:opacity-80"
            style={{ color: feedback === 'up' ? 'var(--primary)' : 'var(--muted-foreground)' }}
            title="Helpful"
          >
            <ThumbsUp size={13} />
          </button>
          <button
            onClick={() => setFeedback('down')}
            className="p-1.5 rounded-lg transition-colors hover:opacity-80"
            style={{ color: feedback === 'down' ? '#dc2626' : 'var(--muted-foreground)' }}
            title="Not helpful"
          >
            <ThumbsDown size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
