// ============================================================
// types.ts — Shared TypeScript interface definitions
//
// WHAT NEEDS TO BE DONE:
//
// 1. ALIGN WITH BACKEND GRAPH STATE:
//    - The backend returns a graph state object (LangGraph).
//    - Review the actual backend response shape and update these interfaces
//      to match exactly. Fields like `legalAnswer` may not be used yet.
//
// 2. MESSAGE ID:
//    - Currently generated client-side with `m-${Date.now()}`.
//    - After backend integration, IDs should come from the backend database.
//    - The Message interface should accommodate both formats during transition.
//
// 3. CONVERSATION:
//    - `messageCount` is currently unused in the UI (not displayed).
//    - Consider adding: `domain?: string` (employment, housing, etc.)
//      so conversations can be grouped or tagged by legal domain.
//
// 4. CITATION:
//    - Add `url?: string` for linking directly to the statute source.
//    - Add `relevanceScore?: number` distinct from `confidence` (the backend
//      may return both a retrieval relevance score and an LLM confidence score).
//
// 5. LEGALANSWER:
//    - This interface exists but is never populated or rendered.
//    - Either wire it up to the backend response and use it in ChatBubble,
//      or remove it to keep the types clean.
//
// 6. ADD USER TYPE:
//    - Add a `User` interface with: id, email, displayName, subscriptionTier.
//    - Use this in AuthContext instead of loose `profile` object.
//
// 7. ADD API RESPONSE TYPES:
//    - Consider adding typed API response wrappers, e.g.:
//      interface ApiResponse<T> { data: T; error?: string; }
//    - This keeps API call sites consistent and type-safe.
// ============================================================

// Navigation views for the app router
export type View = 'landing' | 'login' | 'register' | 'forgot-password' | 'chat';

export interface Message {
  id: string; // TODO: should come from backend DB after integration
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
  citations?: Citation[]; // TODO: populate from backend graph state["retrieved_chunks"]
  legalAnswer?: LegalAnswer; // TODO: either use this or remove it — currently unused
}

export interface Citation {
  id: string;
  title: string;
  section: string;
  confidence: number; // 0–1 scale
  summary: string;
  excerpt: string;
  act?: string;
  jurisdiction?: string;
  // TODO: Add url?: string — link to the actual statute on a legal reference site
  // TODO: Add relevanceScore?: number — from the vector retrieval step (separate from confidence)
}

export interface LegalAnswer {
  // TODO: This interface is not currently used anywhere in the UI.
  // Either build a structured answer renderer in ChatBubble, or remove this.
  answer: string;
  applicableLaw: string;
  explanation: string;
  nextSteps: string[];
  limitations: string;
}

export interface Conversation {
  id: string;
  title: string;
  preview: string; // First ~80 chars of the first user message
  updatedAt: Date;
  messageCount: number; // TODO: display this in the sidebar conversation item
  // TODO: Add domain?: string — legal domain tag (employment, housing, civil rights, etc.)
}

export interface LegalSource {
  id: string;
  title: string;
  type: 'statute' | 'regulation' | 'case' | 'guidance';
  jurisdiction: string;
  confidence: number;
  relevance: string;
  // TODO: This type is defined but not currently used in any component.
  // It was used by the (now removed) context panel. Keep for future use or remove.
}

// TODO: Add User interface:
// export interface User {
//   id: string;
//   email: string;
//   displayName: string;
//   subscriptionTier: 'free' | 'pro' | 'enterprise';
//   avatarUrl?: string;
// }
