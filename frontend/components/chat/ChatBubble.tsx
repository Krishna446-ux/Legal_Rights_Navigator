'use client';

// ============================================================
// ChatBubble.tsx — Renders a single message (user or assistant)
//
// WHAT NEEDS TO BE DONE:
//
// 1. FIX THE USER BUBBLE — The user branch is currently missing a `return`
//    statement, so it silently falls through to the assistant branch.
//    This is a bug — add `return (...)` before the user bubble JSX.
//
// 2. FEEDBACK (thumbs up/down) — Currently only updates local state.
//    - Wire up to: POST /api/messages/{message.id}/feedback
//    - Payload: { rating: 'up' | 'down', messageId: string }
//    - Disable re-clicking once feedback is submitted.
//    - Show a subtle "Thanks for your feedback" toast/notification.
//
// 3. REGENERATE button — Currently visible only on the last assistant message.
//    - After backend integration, re-send the user's last message to the API.
//    - Optionally add an "Edit" button on user messages to let them modify before retrying.
//
// 4. [Implemented] Citations are now rendered in the right sidebar (CitationPanel)
//    rather than inside each chat bubble to keep the UI clean.
//
// 5. COPY — Currently copies raw markdown. Consider copying rendered plain text
//    for a better paste experience.
//
// 6. MARKDOWN rendering during streaming — The streaming bubble in ChatArea uses
//    a <pre> tag for raw text. Once streaming is done, ChatBubble renders with
//    ReactMarkdown. Consider using incremental markdown rendering during the stream.
//
// 7. MESSAGE TIMESTAMPS — Currently uses local time. Consider showing relative
//    time ("2 minutes ago") with absolute time on hover, matching the sidebar format.
//
// 8. ASSISTANT AVATAR — Currently shows "LN" text. Replace with the app logo/icon
//    once a proper brand asset is finalized.
// ============================================================

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Message } from '../../lib/types';
import TypingIndicator from './TypingIndicator';
import { LogoIcon } from '../shared/LogoIcon';

interface Props {
  message: Message;
  isStreaming?: boolean;
  onRegenerate?: () => void;
  darkMode?: boolean;
}

// export interface Message {
//   id: string; // TODO: should come from backend DB after integration
//   role: 'user' | 'assistant';
//   content: string;
//   timestamp: Date;
//   isStreaming?: boolean;
//   citations?: Citation[]; // TODO: populate from backend graph state["retrieved_chunks"]
//   legalAnswer?: LegalAnswer; // TODO: either use this or remove it — currently unused
// }

export default function ChatBubble({ message, isStreaming, onRegenerate, darkMode = false }: Props) {
  const [copied, setCopied] = useState(false);
  // TODO: After backend feedback API is connected, replace local state with a
  // mutation. The state should also be initialized from the message object if
  // the backend persists user feedback per message.


  const handleCopy = () => {
    // TODO: Consider copying rendered plain text instead of raw markdown.
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (isoString: string) => new Date(isoString).toLocaleTimeString("en-US", {
    hour: "numeric", minute: "2-digit", hour12: true,
  });

  // TODO: BUG — missing `return` before the JSX below.
  // The user bubble currently renders nothing because there's no return statement.
  // Fix: add `return (` before `<div className="flex justify-end ...">`.
  if (message.role === 'user') {
    return (
      <div className="flex justify-end gap-3 py-2 animate-fade-in-up">
        <div className="max-w-[75%]">
          <div
            className="px-4 py-3 rounded-2xl rounded-tr-sm text-sm leading-relaxed"
            style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
          >
            {message.content}
          </div>

        </div>
      </div>
    );
  }

  if (isStreaming && !message.content) {
    return <TypingIndicator />;
  }

  return (
    <div className="flex gap-4 py-4 group animate-fade-in-up">
      {/* Premium Logo */}
      <div className="flex-shrink-0 mt-0.5">
        <LogoIcon size={28} darkMode={darkMode} />
      </div>
      <div className="flex-1 min-w-0">
        <div>
          {/* Markdown rendered response from the assistant */}
          <div className={`prose prose-sm max-w-none leading-relaxed ${isStreaming ? 'streaming-cursor' : ''}`}
            style={{ color: 'var(--foreground)' }}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content}
            </ReactMarkdown>
          </div>
        </div>

        {/* Action bar — shown on hover */}
        <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">

          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg transition-colors hover:opacity-80"
            style={{ color: 'var(--muted-foreground)' }}
            title="Copy response"
          >
            {copied ? <Check size={13} /> : <Copy size={13} />}
          </button>

        </div>
      </div>
    </div>
  );
}
