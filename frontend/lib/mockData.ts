// ============================================================
// mockData.ts — Placeholder data for UI development
//
// ⚠️  THIS FILE IS TEMPORARY — ALL EXPORTS MUST BE REPLACED WITH REAL API CALLS
//
// WHAT NEEDS TO BE DONE:
//
// 1. mockConversations → GET /api/conversations
//    - Used by: ChatLayout.tsx (passed to Sidebar as props)
//    - Replace useState(mockConversations) with a useEffect API fetch.
//    - The API should return paginated conversations sorted by updatedAt DESC.
//
// 2. mockCitations → Backend graph state["retrieved_chunks"]
//    - Used by: ChatArea.tsx (attached to assistant messages after streaming ends)
//    - Real citations come from the backend LangGraph state after retrieval.
//    - Parse the citations from the final SSE event payload.
//    - Map the backend's chunk format to the `Citation` interface in types.ts.
//
// 3. mockLegalSources → Backend graph state (not currently used in any component)
//    - This was used by the (now removed) right-side context panel.
//    - Either wire to the backend or delete this export.
//
// 4. mockInitialMessages → GET /api/conversations/{id}/messages
//    - Not currently used in ChatArea (the area starts empty on mount).
//    - When conversation history loading is implemented, fetch real messages here.
//    - The backend stores message history with role, content, citations, and timestamps.
//
// DELETION CHECKLIST — remove each import one by one as you wire up the real API:
//   [ ] mockConversations  — removed from ChatLayout.tsx
//   [ ] mockCitations      — removed from ChatArea.tsx
//   [ ] mockLegalSources   — already unused, safe to delete
//   [ ] mockInitialMessages — not yet used, safe to delete
// ============================================================

import type {
  Conversation,
  Message,
  Citation,
  LegalSource,
} from './types';

// TODO: Remove — replace with GET /api/conversations
export const mockConversations: Conversation[] = [
  {
    id: '1',
    title: 'Wrongful Termination – California',
    preview: 'My employer terminated me without cause after 4 years...',
    updatedAt: new Date(Date.now() - 1000 * 60 * 12),
    messageCount: 8,
  },
  {
    id: '2',
    title: 'Unpaid Overtime Wages',
    preview: 'I have not received overtime pay for the past 6 months...',
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
    messageCount: 5,
  },
  {
    id: '3',
    title: 'Landlord Habitability Dispute',
    preview: 'My apartment has had no heat for three weeks...',
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    messageCount: 11,
  },
  {
    id: '4',
    title: 'Disability Accommodation Request',
    preview: 'My employer refused to provide reasonable accommodation...',
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    messageCount: 6,
  },
  {
    id: '5',
    title: 'FMLA Leave Denial',
    preview: "HR denied my FMLA leave request despite my doctor's note...",
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
    messageCount: 4,
  },
  {
    id: '6',
    title: 'Security Deposit Refund',
    preview: 'Landlord is withholding my $2,400 security deposit...',
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 9),
    messageCount: 7,
  },
];

// TODO: Remove — replace with real citations from backend graph state["retrieved_chunks"]
// Backend chunk format needs to be mapped to the Citation interface.
export const mockCitations: Citation[] = [
  {
    id: 'c1',
    title: 'California Labor Code',
    section: '§ 1102.5 – Whistleblower Protections',
    confidence: 0.94,
    summary:
      'Prohibits employers from retaliating against employees who report violations of state or federal law.',
    excerpt:
      'An employer, or any person acting on behalf of the employer, shall not retaliate against an employee for disclosing information to a government or law enforcement agency, where the employee has reasonable cause to believe that the information discloses a violation of state or federal statute...',
    act: 'California Labor Code',
    jurisdiction: 'California',
  },
  {
    id: 'c2',
    title: 'Fair Labor Standards Act',
    section: '§ 207 – Maximum Hours',
    confidence: 0.88,
    summary:
      'Establishes overtime pay requirements for hours worked beyond 40 in a workweek.',
    excerpt:
      'No employer shall employ any of his employees who in any workweek is engaged in commerce or in the production of goods for commerce, for a workweek longer than forty hours unless such employee receives compensation...',
    act: 'FLSA 29 U.S.C.',
    jurisdiction: 'Federal',
  },
  {
    id: 'c3',
    title: 'Title VII – Civil Rights Act of 1964',
    section: '§ 703(a) – Unlawful Employment Practices',
    confidence: 0.82,
    summary:
      'Makes it unlawful to discriminate in employment based on race, color, religion, sex, or national origin.',
    excerpt:
      'It shall be an unlawful employment practice for an employer to fail or refuse to hire or to discharge any individual, or otherwise to discriminate against any individual with respect to his compensation, terms, conditions, or privileges of employment...',
    act: '42 U.S.C. § 2000e',
    jurisdiction: 'Federal',
  },
];

// TODO: This export is currently not used in any component — safe to delete
// or wire up when a legal sources panel is re-added to the UI.
export const mockLegalSources: LegalSource[] = [
  {
    id: 's1',
    title: 'California Labor Code § 1102.5',
    type: 'statute',
    jurisdiction: 'California',
    confidence: 0.94,
    relevance: 'Direct match – whistleblower protections apply to your situation.',
  },
  {
    id: 's2',
    title: 'FLSA 29 U.S.C. § 207',
    type: 'statute',
    jurisdiction: 'Federal',
    confidence: 0.88,
    relevance: 'Overtime requirements for non-exempt employees.',
  },
  {
    id: 's3',
    title: 'EEOC Guidance on Retaliation',
    type: 'guidance',
    jurisdiction: 'Federal',
    confidence: 0.76,
    relevance: 'Enforcement guidance on employer retaliation claims.',
  },
];

// TODO: Remove — replace with GET /api/conversations/{id}/messages
// Not currently loaded anywhere (ChatArea starts with an empty messages array).
// When conversation history loading is implemented:
//   - ChatArea useEffect should call this endpoint when conversationId changes.
//   - The response shape should match the Message interface.
export const mockInitialMessages: Message[] = [
  {
    id: 'm1',
    role: 'user',
    content:
      'I was terminated from my job last month after I reported safety violations to the state labor board. I had been employed for 4 years and was given no written reason for termination. Do I have a wrongful termination claim?',
    timestamp: new Date(Date.now() - 1000 * 60 * 11),
  },
  {
    id: 'm2',
    role: 'assistant',
    content: `Based on the facts you've described, you may have a strong **wrongful termination claim** based on retaliation for protected whistleblower activity.

## Applicable Law

Your situation implicates both California state law and federal protections. California Labor Code § 1102.5 is among the broadest whistleblower statutes in the country.

## Explanation

The sequence of events — reporting safety violations followed by termination without stated cause — establishes a plausible causal link. Courts look at:

- **Temporal proximity** between the protected activity and adverse action
- **Absence of legitimate, documented cause** for termination
- **Prior employment record** and absence of performance issues

## Practical Next Steps

1. **Preserve all records** — Save all communications and documentation
2. **File a DFEH complaint** within 3 years (California)
3. **Consult an employment attorney** — many take retaliation cases on contingency

## Limitations

This analysis does not constitute legal advice. Always consult a licensed attorney.`,
    timestamp: new Date(Date.now() - 1000 * 60 * 10),
    citations: mockCitations,
  },
];
