'use client';

// ============================================================
// ChatArea.tsx — Main chat message rendering + input area
//
// STREAMING STRATEGY:
//   We call the real backend (GET /graph_health?query=...) which returns
//   the full response at once. Once we receive it, we "type out" the answer
//   character-by-character using a setTimeout tick loop.
//   This gives the user the feel of live streaming with zero backend changes.
//
// WHAT STILL NEEDS TO BE DONE LATER:
// 1. Swap /graph_health for a proper POST /api/chat endpoint that accepts
//    { conversationId, message } and persists the conversation.
// 2. Add auth headers (JWT Bearer token) to the fetch call.
// 3. Extract real citations from state["retrieved_chunks"] in the response.
// 4. Replace the simulated typing with real SSE streaming when ready.
// 5. Add rate-limit UI (HTTP 429) and no-results UI.
// ============================================================

import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { Message, Citation } from '../../lib/types';
import ChatBubble from './ChatBubble';
import ChatInput from './ChatInput';
import { LogoIcon } from '../shared/LogoIcon';
import EmptyState from './EmptyState';
import TypingIndicator from './TypingIndicator';
import { AlertTriangle, RefreshCw, Menu, BookOpen } from 'lucide-react';
import { AuthContext } from '@/lib/auth-context';

// AppState drives all UI state changes:
// 'idle'      → ready for input
// 'loading'   → waiting for backend response (typing indicator shown)
// 'streaming' → animating the response text character by character
// 'error'     → backend returned an error
type AppState = 'idle' | 'loading' | 'streaming' | 'error';

interface Props {
  conversationId: string | null;
  // isPendingConversation: true means this conversationId was pre-generated
  // by ChatLayout but hasn't been committed to the sidebar list yet.
  isPendingConversation?: boolean;
  // Called once, with the first message text, to commit the conversation.
  onFirstSend?: (id: string, firstMessageText: string) => void;
  onCitationsChange: (citations: Citation[]) => void;
  onToggleSidebar?: () => void;
  isSidebarCollapsed?: boolean;
  // Citation panel controls — managed by ChatLayout
  citationCount?: number;
  onToggleCitations?: () => void;
  citationPanelOpen?: boolean;
  darkMode?: boolean;
  resetKey?: number;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://127.0.0.1:8000';

// Controls how fast the simulated typing animation runs.
// Lower = faster. 12ms feels natural; increase to 25ms for slower typing.
const TICK_INTERVAL_MS = 12;
// Number of characters appended per tick. Higher = faster.
// Randomised between MIN and MAX to feel organic.
const CHUNK_MIN = 3;
const CHUNK_MAX = 8;

export default function ChatArea({
  conversationId,
  isPendingConversation,
  onFirstSend,
  onCitationsChange,
  onToggleSidebar,
  isSidebarCollapsed,
  citationCount = 0,
  onToggleCitations,
  citationPanelOpen = false,
  darkMode = false,
  resetKey = 0,
}: Props) {
  const state = useContext(AuthContext)
  const user_id = state.profile.user_id
  const [messages, setMessages] = useState<Message[]>([]);
  const [appState, setAppState] = useState<AppState>('idle');
  const [streamingContent, setStreamingContent] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const tickRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastUserMsgRef = useRef<string>('');
  const lastUserMsgTimeStamp = useRef<Date>(new Date());
  // Tracks whether the first message in a pending conversation has been sent.
  // Reset whenever conversationId changes (new or switched conversation).
  const isFirstMessageRef = useRef<boolean>(true);
  const justCreatedIdRef = useRef<string | null>(null);

  // Reset when switching conversations
  useEffect(() => {
    // If this is the conversation we just created, do NOT reset or fetch history.
    // We are already streaming the response locally.
    if (conversationId && conversationId === justCreatedIdRef.current) {
      justCreatedIdRef.current = null;
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    const currentSignal = abortControllerRef.current.signal;

    // Cancel any ongoing streaming from a previous conversation
    if (tickRef.current) {
      clearTimeout(tickRef.current);
      tickRef.current = null;
    }

    setMessages([]);
    setAppState('idle');
    setStreamingContent('');
    onCitationsChange([]);
    isFirstMessageRef.current = true; // next message will be the "first" for this conversation
    
    // --- NEW: Fetch history if this is an existing conversation ---
    if (conversationId && !isPendingConversation) {
      async function loadHistory() {
        setAppState('loading'); // Show typing indicator or spinner while loading
        try {
          // 1. Fetch the state from the backend
          const res = await fetch(`${BACKEND_URL}/api/state`, {
            "method": "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: 'include',
            body: JSON.stringify({ "conversation_id": conversationId, "user_id": user_id }),
            signal: currentSignal
          });
          if (!res.ok) throw new Error('Failed to fetch history');
          // 2. Extract the messages from the LangGraph state
          const data = await res.json();
          const backendMessages = data.messages || [];
          // 3. Map LangChain message formats to your frontend Message type
          const formattedMessages: Message[] = backendMessages.map((msg: any, index: number) => {
            // LangChain usually uses "HumanMessage" / "AIMessage" classes, which 
            // serialize into objects like { type: 'human', content: '...' } or { id: [... 'HumanMessage'] }
            // Adjust this parsing depending on exactly how LangGraph serializes to your frontend.
            const isUser = msg.type === 'human' || msg.id?.includes('HumanMessage');

            return {
              id: msg.id || `hist-${index}`,
              role: isUser ? 'user' : 'assistant',
              content: msg.content,
              timestamp: msg.additional_kwargs["created_at"], // If backend doesn't store timestamp, use current or mock it
              // Citations could be attached to AIMessages in your specific implementation
            };
          });
          // 4. Update the UI!
          setMessages(formattedMessages);
          setAppState('idle');
          isFirstMessageRef.current = false; // It's an existing chat, so we don't need to POST new IDs

        } catch (error: any) {
          if (error.name === 'AbortError') return;
          console.error("Error loading chat history:", error);
          setAppState('error');
        }
      }
      loadHistory();

    }
  }, [conversationId, isPendingConversation, resetKey]);

  // Auto-scroll to bottom on every content change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent, appState]);

  // ─────────────────────────────────────────────────────────────
  // animateText — takes a full response string and "types" it out
  // character by character using a setTimeout tick loop.
  // ─────────────────────────────────────────────────────────────
  const animateText = useCallback(
    (fullText: string, citations: Citation[]) => {
      setAppState('streaming');
      setStreamingContent('');

      const chars = fullText.split('');
      let i = 0;
      let accumulated = '';

      const tick = () => {
        // Randomised chunk size so it feels organic, not mechanical
        const chunkSize =
          Math.floor(Math.random() * (CHUNK_MAX - CHUNK_MIN + 1)) + CHUNK_MIN;
        for (let j = 0; j < chunkSize && i < chars.length; j++, i++) {
          accumulated += chars[i];
        }
        setStreamingContent(accumulated);

        if (i < chars.length) {
          tickRef.current = setTimeout(tick, TICK_INTERVAL_MS);
        } else {
          // Animation complete — commit the full message
          const assistantMsg: Message = {
            id: `m-${Date.now()}`,
            role: 'assistant',
            content: accumulated,
            timestamp: new Date(),
            citations,
          };
          setMessages((prev) => [...prev, assistantMsg]);
          onCitationsChange(citations);
          setStreamingContent('');
          setAppState('idle');
        }
      };

      // Small initial delay so the TypingIndicator is visible for a moment
      tickRef.current = setTimeout(tick, 200);
    },
    [onCitationsChange]
  );

  // ─────────────────────────────────────────────────────────────
  // callBackend — POSTs to /chat.
  //
  // FIRST MESSAGE (isPendingConversation=true):
  //   - Does NOT send conversation_id (backend creates a new UUID)
  //   - Backend returns the real conversation_id
  //   - Calls onFirstSend(realId, messageText) so ChatLayout can:
  //       a) swap activeConversationId to the real ID
  //       b) commit the conversation to the sidebar list
  //
  // SUBSEQUENT MESSAGES:
  //   - Sends the existing conversationId so the backend checkpointer
  //     reuses the correct thread for multi-turn memory
  // ─────────────────────────────────────────────────────────────
  const callBackend = useCallback(
    async (userMessage: string, date: Date) => {
      setAppState('loading');
      setStreamingContent('');

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      try {
        // Build the request body.
        // On first message: no conversation_id → backend assigns one.
        // On subsequent:   include the real UUID from the previous response.
        const isFirst = !conversationId;
        const body: Record<string, string> = { message: userMessage };
        if (conversationId) {
          body.conversation_id = conversationId;
        }
        body.date = date.toISOString()

        const res = await fetch(`${BACKEND_URL}/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          // TODO: Add auth header when authentication is wired up:
          // headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
          body: JSON.stringify(body),
          signal: abortControllerRef.current.signal
        });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        // Response shape: { conversation_id, answer, citations }
        const data: {
          conversation_id: string;
          answer: string;
          citations: Array<{
            id: string;
            title: string;
            section: string;
            confidence: number;
            summary: string;
            excerpt: string;
            jurisdiction?: string;
          }>;
        } = await res.json();

        // Map backend citations to the frontend Citation type
        const citations: Citation[] = data.citations.map(c => ({
          id: c.id,
          title: c.title,
          section: c.section,
          confidence: c.confidence,
          summary: c.summary,
          excerpt: c.excerpt,
          jurisdiction: c.jurisdiction,
        }));

        // If this was the first message in a pending conversation,
        // notify ChatLayout to commit the conversation with the real backend ID.
        if (isFirst) {
          isFirstMessageRef.current = false;
          justCreatedIdRef.current = data.conversation_id;
          onFirstSend?.(data.conversation_id, userMessage);
        }

        animateText(data.answer, citations);
      } catch (err: any) {
        if (err.name === 'AbortError') {
          return;
        }
        console.error('Backend call failed:', err);
        setAppState('error');
      }
    },
    [animateText, conversationId, isPendingConversation, onFirstSend]
  );

  // ─────────────────────────────────────────────────────────────
  // stopStreaming — cancels the tick animation mid-way
  // ─────────────────────────────────────────────────────────────
  const stopStreaming = () => {
    if (tickRef.current) clearTimeout(tickRef.current);
    if (streamingContent) {
      setMessages((prev) => [
        ...prev,
        {
          id: `m-${Date.now()}`,
          role: 'assistant',
          content: streamingContent + ' *(stopped)*',
          timestamp: new Date(),
        },
      ]);
      setStreamingContent('');
    }
    setAppState('idle');
  };

  // ─────────────────────────────────────────────────────────────
  // handleSend — adds the user message and calls the backend.
  // callBackend handles the onFirstSend callback internally after the
  // backend responds, so we don't call it here.
  // ─────────────────────────────────────────────────────────────
  const handleSend = (content: string) => {
    lastUserMsgRef.current = content;
    const d = new Date()
    lastUserMsgTimeStamp.current = d
    const userMsg: Message = {
      id: `m-${d}`,
      role: 'user',
      content,
      timestamp: d,
    };
    setMessages((prev) => [...prev, userMsg]);
    callBackend(content, d);
  };

  // ─────────────────────────────────────────────────────────────
  // handleRegenerate — removes last assistant message, re-sends query
  // ─────────────────────────────────────────────────────────────
  const handleRegenerate = () => { };

  const isEmpty = messages.length === 0 && appState === 'idle';
  const isCentered = isEmpty && !isTyping;

  return (
    <div className="relative flex flex-col flex-1 min-w-0 min-h-0 bg-transparent">

      {/* Floating sidebar toggle — slides in when sidebar is hidden */}
      <div
        className={`absolute top-4 left-4 z-50 transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${isSidebarCollapsed
          ? 'opacity-100 transform-none pointer-events-auto'
          : 'opacity-0 -translate-x-4 pointer-events-none'
          }`}
      >
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg transition-colors hover:bg-[var(--muted)] border border-[var(--border)] bg-[var(--card)] shadow-sm"
          style={{ color: 'var(--muted-foreground)' }}
          title="Open sidebar"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Sources toggle button — top-right, only shown after a response */}
      <div
        className={`absolute top-4 right-4 z-50 transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${citationCount > 0
          ? 'opacity-100 translate-x-0 pointer-events-auto'
          : 'opacity-0 translate-x-4 pointer-events-none'
          }`}
      >
        <button
          onClick={onToggleCitations}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors hover:opacity-80 border shadow-sm"
          style={{
            backgroundColor: citationPanelOpen
              ? 'color-mix(in srgb, var(--primary) 10%, transparent)'
              : 'var(--card)',
            borderColor: citationPanelOpen ? 'var(--primary)' : 'var(--border)',
            color: citationPanelOpen ? 'var(--primary)' : 'var(--muted-foreground)',
            fontFamily: 'var(--font-display)',
          }}
          title="Toggle legal sources panel"
        >
          <BookOpen size={14} />
          Sources
          <span
            className="px-1.5 py-0.5 rounded-full text-[9px] font-bold"
            style={{
              backgroundColor: 'color-mix(in srgb, var(--primary) 15%, transparent)',
              color: 'var(--primary)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            {citationCount}
          </span>
        </button>
      </div>

      {/* Message list */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[850px] mx-auto px-4 py-6 pb-24">
          {!isEmpty && (
            <>
              {messages.map((msg, i) => (
                <ChatBubble
                  key={msg.id || i}
                  message={msg}
                  darkMode={darkMode}
                  onRegenerate={
                    msg.role === 'assistant' && i === messages.length - 1
                      ? handleRegenerate
                      : undefined
                  }
                />
              ))}

              {/* Loading state — waiting for backend response */}
              {appState === 'loading' && <TypingIndicator />}

              {/* Simulated streaming bubble — types out the response */}
              {appState === 'streaming' && streamingContent && (
                <div className="flex gap-3 py-2 animate-fade-in-up">
                  <div className="flex-shrink-0 mt-0.5">
                    <LogoIcon size={28} darkMode={darkMode} />
                  </div>
                  <div
                    className="flex-1 px-5 py-4 rounded-2xl rounded-tl-sm"
                    style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
                  >
                    {/* Shows raw text during animation, ReactMarkdown renders after commit */}
                    <div className="prose text-sm streaming-cursor" style={{ color: 'var(--foreground)' }}>
                      <pre
                        style={{
                          whiteSpace: 'pre-wrap',
                          fontFamily: 'inherit',
                          margin: 0,
                          background: 'none',
                          border: 'none',
                          padding: 0,
                        }}
                      >
                        {streamingContent}
                      </pre>
                    </div>
                  </div>
                </div>
              )}

              {/* Error state */}
              {appState === 'error' && (
                <div className="flex gap-3 py-2 animate-fade-in-up">
                  <div
                    className="flex-1 px-5 py-4 rounded-2xl"
                    style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca' }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle size={14} style={{ color: '#dc2626' }} />
                      <p
                        className="text-sm font-semibold"
                        style={{ color: '#dc2626', fontFamily: 'var(--font-display)' }}
                      >
                        Something went wrong
                      </p>
                    </div>
                    <p className="text-xs" style={{ color: '#991b1b' }}>
                      Unable to reach the backend. Make sure it is running on{' '}
                      <code className="font-mono">{BACKEND_URL}</code>.
                    </p>
                    <button
                      onClick={() => callBackend(lastUserMsgRef.current, new Date())}
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

      {/* Centered empty state + input — slides to bottom once conversation starts */}
      <div
        className="absolute left-0 right-0 w-full transition-transform duration-[800ms] ease-[cubic-bezier(0.2,1,0.2,1)] pointer-events-none"
        style={{
          bottom: 0,
          transform: isCentered ? 'translateY(calc(-50vh + 50%))' : 'translateY(0)',
        }}
      >
        <div
          className={`transition-[opacity,transform] duration-[800ms] ease-[cubic-bezier(0.2,1,0.2,1)] ${isCentered
            ? 'opacity-100 pointer-events-auto translate-y-0 scale-100 mb-8'
            : 'opacity-0 pointer-events-none translate-y-4 scale-95 mb-8'
            }`}
        >
          <EmptyState darkMode={darkMode} />
        </div>

        <div className="w-full bg-gradient-to-t from-[var(--background)] via-[var(--background)] to-transparent pt-4 pb-2 pointer-events-auto">
          <ChatInput
            onSend={handleSend}
            isStreaming={appState === 'streaming' || appState === 'loading'}
            onStop={stopStreaming}
            disabled={false}
            onTypingChange={setIsTyping}
          />
        </div>
      </div>
    </div>
  );
}
