'use client';

import { useEffect, useRef, useState } from 'react';
import type { Message, Citation } from '../../lib/types';
import { mockCitations, mockClarificationQuestions } from '../../lib/mockData';
import ChatBubble from './ChatBubble';
import ChatInput from './ChatInput';
import EmptyState from './EmptyState';
import TypingIndicator from './TypingIndicator';
import { AlertTriangle, RefreshCw } from 'lucide-react';

const MOCK_RESPONSE = `Based on your situation, here is a comprehensive analysis of your legal rights under both state and federal law.

## Summary

You appear to have a viable claim. The facts you've described establish a plausible causal connection between protected activity and adverse employment action — the core elements of a retaliation claim.

## Applicable Law

Your situation is governed by multiple overlapping frameworks:

- **California Labor Code § 1102.5** — California's broadest whistleblower statute, covering reports to government agencies
- **FLSA § 207** — Federal overtime protections for non-exempt employees
- **Title VII, § 703(a)** — Federal anti-discrimination provisions

## Explanation

Courts evaluate retaliation claims using a three-part burden-shifting framework:

1. **Prima facie case**: Employee must show protected activity, adverse action, and causal link
2. **Employer's burden**: Articulate a legitimate, non-retaliatory reason
3. **Pretext**: Employee demonstrates the stated reason is pretextual

The short time between your protected activity and termination is significant evidence of causation.

## Practical Next Steps

1. Preserve all communications, performance reviews, and records related to your safety complaint
2. File with the California Department of Fair Employment and Housing (DFEH) within **3 years**
3. Request your personnel file in writing — employers must provide it within 30 days
4. Consult an employment attorney; most take retaliation cases on contingency

## Limitations

This analysis is based on general legal principles and the facts you've provided. Individual outcomes vary significantly based on specific facts, employer documentation, and jurisdiction. This does not constitute legal advice.`;

type AppState = 'idle' | 'streaming' | 'error' | 'rate-limit' | 'no-results';

interface Props {
  conversationId: string | null;
  onCitationsChange: (citations: Citation[]) => void;
}

export default function ChatArea({ conversationId, onCitationsChange }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [appState, setAppState] = useState<AppState>('idle');
  const [streamingContent, setStreamingContent] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const streamRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setMessages([]);
    setAppState('idle');
    setStreamingContent('');
    onCitationsChange([]);
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent, appState]);

  const stopStreaming = () => {
    if (streamRef.current) clearTimeout(streamRef.current);
    setAppState('idle');
    if (streamingContent) {
      const msg: Message = {
        id: `m-${Date.now()}`,
        role: 'assistant',
        content: streamingContent + ' *(generation stopped)*',
        timestamp: new Date(),
        citations: mockCitations,
      };
      setMessages(prev => [...prev, msg]);
      onCitationsChange(mockCitations);
      setStreamingContent('');
    }
  };

  const simulateStream = (userMsg: string) => {
    setAppState('streaming');
    setStreamingContent('');

    const chars = MOCK_RESPONSE.split('');
    let i = 0;
    let accumulated = '';

    const tick = () => {
      const chunkSize = Math.floor(Math.random() * 6) + 3;
      for (let j = 0; j < chunkSize && i < chars.length; j++, i++) {
        accumulated += chars[i];
      }
      setStreamingContent(accumulated);
      if (i < chars.length) {
        streamRef.current = setTimeout(tick, 18);
      } else {
        const showClarification = userMsg.toLowerCase().includes('fired') || userMsg.toLowerCase().includes('terminated');
        const assistantMsg: Message = {
          id: `m-${Date.now()}`,
          role: 'assistant',
          content: accumulated,
          timestamp: new Date(),
          citations: mockCitations,
        };
        setMessages(prev => [...prev, assistantMsg]);
        onCitationsChange(mockCitations);
        setStreamingContent('');
        setAppState('idle');

        if (showClarification) {
          setTimeout(() => {
            const clarMsg: Message = {
              id: `m-clar-${Date.now()}`,
              role: 'assistant',
              content: '',
              timestamp: new Date(),
              clarificationQuestions: mockClarificationQuestions,
            };
            setMessages(prev => [...prev, clarMsg]);
          }, 600);
        }
      }
    };
    streamRef.current = setTimeout(tick, 300);
  };

  const handleSend = (content: string) => {
    const userMsg: Message = {
      id: `m-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    simulateStream(content);
  };

  const handleClarificationSubmit = (msgId: string, _answers: Record<string, string>) => {
    setMessages(prev => prev.filter(m => m.id !== msgId));
    simulateStream('(clarification answers submitted)');
  };

  const handleRegenerate = () => {
    setMessages(prev => {
      const withoutLast = prev.slice(0, -1);
      return withoutLast;
    });
    setTimeout(() => simulateStream(''), 100);
  };

  const isEmpty = messages.length === 0 && appState === 'idle';

  return (
    <div className="flex flex-col flex-1 min-w-0 min-h-0">
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-6">
          {isEmpty ? (
            <EmptyState onPromptSelect={handleSend} />
          ) : (
            <>
              {messages.map((msg, i) => (
                <ChatBubble
                  key={msg.id}
                  message={msg}
                  onRegenerate={
                    msg.role === 'assistant' && i === messages.length - 1 && !msg.clarificationQuestions
                      ? handleRegenerate
                      : undefined
                  }
                  onClarificationSubmit={
                    msg.clarificationQuestions
                      ? (answers) => handleClarificationSubmit(msg.id, answers)
                      : undefined
                  }
                />
              ))}
              {appState === 'streaming' && streamingContent ? (
                <div className="flex gap-3 py-2">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-1 text-white text-[10px] font-bold"
                    style={{ backgroundColor: 'var(--primary)', fontFamily: 'var(--font-display)' }}
                  >
                    LN
                  </div>
                  <div
                    className="flex-1 px-5 py-4 rounded-2xl rounded-tl-sm"
                    style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
                  >
                    <div className="prose text-sm streaming-cursor" style={{ color: 'var(--foreground)' }}>
                      <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: 0, background: 'none', border: 'none', padding: 0 }}>
                        {streamingContent}
                      </pre>
                    </div>
                  </div>
                </div>
              ) : appState === 'streaming' ? (
                <TypingIndicator />
              ) : null}
              {appState === 'error' && (
                <div className="flex gap-3 py-2">
                  <div className="flex-1 px-5 py-4 rounded-2xl" style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca' }}>
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle size={14} style={{ color: '#dc2626' }} />
                      <p className="text-sm font-semibold" style={{ color: '#dc2626', fontFamily: 'var(--font-display)' }}>
                        Something went wrong
                      </p>
                    </div>
                    <p className="text-xs" style={{ color: '#991b1b' }}>
                      Unable to retrieve legal information. Please try again.
                    </p>
                    <button
                      onClick={() => setAppState('idle')}
                      className="mt-3 flex items-center gap-1.5 text-xs font-medium"
                      style={{ color: '#dc2626' }}
                    >
                      <RefreshCw size={11} /> Retry
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={bottomRef} />
        </div>
      </div>
      <ChatInput
        onSend={handleSend}
        isStreaming={appState === 'streaming'}
        onStop={stopStreaming}
        disabled={false}
      />
    </div>
  );
}
