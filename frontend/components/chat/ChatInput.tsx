'use client';

// ============================================================
// ChatInput.tsx — The message composition area
//
// WHAT NEEDS TO BE DONE:
//
// 1. FILE ATTACHMENT (Paperclip icon is present but non-functional):
//    - Add an <input type="file"> hidden element triggered by the Paperclip button.
//    - Accepted file types: PDF, DOCX, TXT (legal documents).
//    - On file select: upload to POST /api/upload and receive a file reference ID.
//    - Include the file reference ID in the chat API payload.
//    - Show a preview chip of the attached file name in the input area.
//    - Allow removing the attachment before sending.
//
// 2. VOICE INPUT (Mic icon is present but non-functional):
//    - Use the browser's Web Speech API (SpeechRecognition) for live transcription.
//    - Alternatively, record audio and send to backend Whisper endpoint.
//    - Show a "recording" animation/indicator while mic is active.
//    - Transcription result should auto-fill the textarea.
//
// 3. KEYBOARD SHORTCUTS:
//    - Enter to send is already implemented.
//    - Consider adding Ctrl+/ to focus the input from anywhere in the app.
//    - Consider Escape to cancel the current streaming response.
//
// 4. INPUT PERSISTENCE:
//    - If the user starts typing and accidentally navigates away (e.g. clicks a
//      conversation in the sidebar), their draft should be saved per conversation.
//    - Use localStorage with the key `draft-{conversationId}` to store/restore drafts.
//
// 5. CHARACTER LIMIT:
//    - MAX_CHARS is set to 2000. Confirm the backend accepts this limit.
//    - The backend may enforce its own token limit — surface that error gracefully.
//
// 6. DISABLED STATE:
//    - The `disabled` prop is wired but currently always `false`.
//    - Set disabled=true in ChatArea when the app is in 'rate-limit' or 'error' states.
//
// 7. PLACEHOLDER TEXT:
//    - Consider varying placeholder text based on conversation context or first query.
// ============================================================

import { useRef, useState } from 'react';
import { Send, Square } from 'lucide-react';

interface Props {
  onSend: (message: string) => void;
  isStreaming?: boolean;
  onStop?: () => void;
  disabled?: boolean;
  onTypingChange?: (isTyping: boolean) => void;
}

// TODO: Confirm this limit against the backend's max token/char limit
const MAX_CHARS = 2000;

export default function ChatInput({ onSend, isStreaming, onStop, disabled, onTypingChange }: Props) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  // TODO: Add state for attached file: const [attachedFile, setAttachedFile] = useState<File | null>(null);
  // TODO: Add state for voice recording: const [isRecording, setIsRecording] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    // TODO: Handle Escape key to stop streaming: if (e.key === 'Escape' && isStreaming) onStop?.()
  };

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled || isStreaming) return;
    // TODO: Include attachedFile reference ID in the payload passed to onSend
    onSend(trimmed);
    setValue('');
    onTypingChange?.(false);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    // TODO: Clear any attached file after sending: setAttachedFile(null);
    // TODO: Clear saved draft from localStorage after sending
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    onTypingChange?.(e.target.value.length > 0);
    const ta = e.target;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 200) + 'px';
    // TODO: Save draft to localStorage here: localStorage.setItem(`draft-${conversationId}`, e.target.value);
  };

  const remaining = MAX_CHARS - value.length;
  const nearLimit = remaining < 200;

  return (
    <div className="px-4 py-3">
      <div
        className="max-w-4xl mx-auto rounded-3xl overflow-hidden bg-[var(--card)]"
        style={{
          border: '1px solid var(--border)',
          boxShadow: '0 4px 24px color-mix(in srgb, var(--foreground) 6%, transparent)',
        }}
        onFocus={e => { 
          (e.currentTarget as HTMLDivElement).style.borderColor = 'color-mix(in srgb, var(--primary) 50%, var(--border))'; 
          (e.currentTarget as HTMLDivElement).style.boxShadow = '0 6px 32px color-mix(in srgb, var(--foreground) 8%, transparent)';
        }}
        onBlur={e => { 
          (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)'; 
          (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 24px color-mix(in srgb, var(--foreground) 6%, transparent)';
        }}
      >
        {/* TODO: Add an attachment preview chip row here when a file is attached.
            Show: filename, file size, and an X button to remove the attachment.
            Should appear between the textarea and the action bar. */}

        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="Describe your legal situation in as much detail as possible..."
          maxLength={MAX_CHARS}
          rows={1}
          disabled={disabled}
          className="w-full px-4 py-3.5 text-sm resize-none outline-none bg-transparent leading-relaxed"
          style={{ color: 'var(--foreground)', maxHeight: '200px' }}
        />
        <div className="flex items-center justify-between px-3 pb-2.5 pt-0">
          <div className="flex items-center gap-1"></div>
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
              // Stop button — shown while AI is generating
              <button
                onClick={onStop}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-[opacity,transform]"
                style={{ backgroundColor: '#dc2626', color: 'white', fontFamily: 'var(--font-display)' }}
              >
                <Square size={12} fill="white" />
                Stop
              </button>
            ) : (
              // Send button — activates once the user types something
              <button
                onClick={handleSend}
                disabled={!value.trim() || disabled}
                className="w-8 h-8 rounded-xl flex items-center justify-center transition-[opacity,transform] duration-150 disabled:opacity-40"
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
