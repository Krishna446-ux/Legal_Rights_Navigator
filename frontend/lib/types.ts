// Shared type definitions for the Legal Rights Navigator frontend.
// These mirror the backend graph state where applicable.

export type View = 'landing' | 'login' | 'register' | 'forgot-password' | 'chat';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
  citations?: Citation[];
  legalAnswer?: LegalAnswer;
  clarificationQuestions?: ClarificationQuestion[];
}

export interface Citation {
  id: string;
  title: string;
  section: string;
  confidence: number;
  summary: string;
  excerpt: string;
  act?: string;
  jurisdiction?: string;
}

export interface LegalAnswer {
  answer: string;
  applicableLaw: string;
  explanation: string;
  nextSteps: string[];
  limitations: string;
}

export interface ClarificationQuestion {
  id: string;
  question: string;
  type: 'text' | 'dropdown' | 'date' | 'multiple-choice';
  options?: string[];
  answer?: string;
}

export interface Conversation {
  id: string;
  title: string;
  preview: string;
  updatedAt: Date;
  messageCount: number;
}

export interface LegalSource {
  id: string;
  title: string;
  type: 'statute' | 'regulation' | 'case' | 'guidance';
  jurisdiction: string;
  confidence: number;
  relevance: string;
}
