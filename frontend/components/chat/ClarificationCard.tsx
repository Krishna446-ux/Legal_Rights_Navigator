'use client';

import { useState } from 'react';
import { HelpCircle, Send } from 'lucide-react';
import type { ClarificationQuestion } from '../../lib/types';

interface Props {
  questions: ClarificationQuestion[];
  onSubmit: (answers: Record<string, string>) => void;
}

export default function ClarificationCard({ questions, onSubmit }: Props) {
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const setAnswer = (id: string, value: string) => {
    setAnswers(prev => ({ ...prev, [id]: value }));
  };

  const allAnswered = questions.every(q => answers[q.id]);

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ border: '1px solid var(--border)', backgroundColor: 'var(--card)' }}
    >
      <div
        className="px-5 py-4 flex items-center gap-2.5"
        style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--muted)' }}
      >
        <HelpCircle size={16} style={{ color: 'var(--primary)' }} />
        <p className="text-sm font-semibold" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>
          A few more details needed
        </p>
      </div>
      <div className="px-5 py-4 space-y-5">
        <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
          To provide the most accurate legal analysis, please answer the following:
        </p>
        {questions.map((q, i) => (
          <div key={q.id} className="space-y-2">
            <label className="text-sm font-medium" style={{ color: 'var(--foreground)', fontFamily: 'var(--font-display)' }}>
              <span className="text-xs font-mono mr-1.5" style={{ color: 'var(--muted-foreground)' }}>{i + 1}.</span>
              {q.question}
            </label>
            {q.type === 'text' && (
              <input
                type="text"
                placeholder="Your answer..."
                value={answers[q.id] || ''}
                onChange={e => setAnswer(q.id, e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg outline-none transition-all"
                style={{
                  border: '1px solid var(--border)',
                  backgroundColor: 'var(--background)',
                  color: 'var(--foreground)',
                }}
                onFocus={e => { e.currentTarget.style.borderColor = 'var(--primary)'; }}
                onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
              />
            )}
            {q.type === 'dropdown' && (
              <select
                value={answers[q.id] || ''}
                onChange={e => setAnswer(q.id, e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg outline-none cursor-pointer"
                style={{
                  border: '1px solid var(--border)',
                  backgroundColor: 'var(--background)',
                  color: answers[q.id] ? 'var(--foreground)' : 'var(--muted-foreground)',
                }}
              >
                <option value="">Select an option...</option>
                {q.options?.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            )}
            {q.type === 'date' && (
              <input
                type="date"
                value={answers[q.id] || ''}
                onChange={e => setAnswer(q.id, e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg outline-none"
                style={{
                  border: '1px solid var(--border)',
                  backgroundColor: 'var(--background)',
                  color: 'var(--foreground)',
                }}
              />
            )}
            {q.type === 'multiple-choice' && (
              <div className="grid grid-cols-2 gap-2">
                {q.options?.map(opt => (
                  <button
                    key={opt}
                    onClick={() => setAnswer(q.id, opt)}
                    className="px-3 py-2 text-sm rounded-lg text-left transition-all duration-150 font-medium"
                    style={{
                      border: answers[q.id] === opt ? '1.5px solid var(--primary)' : '1px solid var(--border)',
                      backgroundColor: answers[q.id] === opt ? 'color-mix(in srgb, var(--primary) 8%, transparent)' : 'var(--background)',
                      color: answers[q.id] === opt ? 'var(--primary)' : 'var(--foreground)',
                    }}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
        <button
          onClick={() => onSubmit(answers)}
          disabled={!allAnswered}
          className="w-full py-2.5 text-sm font-semibold rounded-lg transition-all duration-150 flex items-center justify-center gap-2"
          style={{
            backgroundColor: allAnswered ? 'var(--primary)' : 'var(--muted)',
            color: allAnswered ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
            cursor: allAnswered ? 'pointer' : 'not-allowed',
            fontFamily: 'var(--font-display)',
          }}
        >
          <Send size={14} />
          Continue with Analysis
        </button>
      </div>
    </div>
  );
}
