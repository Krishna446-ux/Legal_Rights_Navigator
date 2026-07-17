'use client';

// ============================================================
// Sidebar.tsx — Left-side conversation history panel
//
// WHAT NEEDS TO BE DONE:
//
// 1. LOAD REAL CONVERSATIONS from backend:
//    - Replace `mockConversations` (passed as props from ChatLayout) with a
//      real API call: GET /api/conversations
//    - Apply pagination or infinite scroll — only load the 20 most recent
//      conversations initially, load more as the user scrolls to the bottom.
//    - Show a loading skeleton while conversations are fetching.
//
// 2. NEW CONVERSATION:
//    - The "New Conversation" button currently just clears the active conversation.
//    - After backend integration: call POST /api/conversations to create a new
//      conversation record on the server and receive the new conversationId.
//    - Optimistically add the new conversation to the list.
//
// 3. DELETE / RENAME conversations:
//    - Add a "..." (kebab menu) that appears on hover for each conversation item.
//    - Options: Rename, Delete.
//    - Rename: PATCH /api/conversations/{id} with { title: string }
//    - Delete: DELETE /api/conversations/{id}
//    - After delete, remove from the list and clear activeId if it was selected.
//
// 4. USER PROFILE in the bottom panel:
//    - "Jamie Doe" and "Free Plan" are currently hardcoded.
//    - Replace with real user data from AuthContext (name, email, subscription tier).
//    - The avatar initials "JD" should be derived from the user's actual name.
//    - The avatar background color (#7c3aed) could be randomized per user.
//
// 5. SIGN OUT:
//    - The LogOut button currently just navigates to the landing page.
//    - Call the auth sign-out endpoint: POST /api/auth/signout
//    - Clear the auth token from localStorage/cookies before redirecting.
//
// 6. SETTINGS button is currently non-functional:
//    - Wire to a settings modal or a /settings page.
//    - Settings should include: theme, notification preferences, account info.
//
// 7. SEARCH:
//    - Currently filters the locally loaded conversations client-side.
//    - With pagination, search should call: GET /api/conversations?query={term}
//      to search across all conversations, not just the loaded ones.
//
// 8. CONVERSATION TITLE auto-generation:
//    - When a new conversation is created, the title is blank until the backend
//      generates one (typically from the first user message).
//    - Show a placeholder title like "New Conversation" until the backend sends
//      a generated title via a webhook or follow-up API response.
//
// 9. DARK MODE TOGGLE:
//    - Currently stored in local React state in chat/page.tsx.
//    - Persist preference to localStorage so it survives page refresh.
//    - If user is logged in, sync preference to their backend profile.
// ============================================================

import { useContext, useState } from 'react';
import { Plus, Search, Settings, ChevronLeft, Clock, Scale, LogOut, Trash2, Edit2, Satellite } from 'lucide-react';
import type { Conversation } from '../../lib/types';
import { AuthContext } from '@/lib/auth-context';
import { LogoIcon } from '../shared/LogoIcon';

interface Props {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  onRename: (id: string, newTitle: string) => void;
  collapsed: boolean;
  onToggle: () => void;
  onNavigate: (view: 'landing') => void;
  darkMode: boolean;
  onToggleDark: () => void;
  onOpenSettings?: () => void;
}

function timeAgo(date: Date): string {
  const s = Math.floor((Date.now() - date.getTime()) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export default function Sidebar({
  conversations, activeId, onSelect, onNew, onDelete, onRename, collapsed, onToggle, onNavigate, darkMode, onToggleDark, onOpenSettings
}: Props) {
  const [search, setSearch] = useState('');
  const state = useContext(AuthContext)
  const name = state?.profile.name
  // Renaming state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const startEdit = (id: string, currentTitle: string) => {
    setEditingId(id);
    setEditTitle(currentTitle);
  };

  const commitEdit = (id: string) => {
    if (editTitle.trim()) {
      onRename(id, editTitle.trim());
    }
    setEditingId(null);
  };
  // TODO: Add loading state: const [isLoading, setIsLoading] = useState(false);

  // TODO: Replace client-side filter with API search when pagination is implemented
  const filtered = conversations.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div
      className={`flex flex-1 flex-col transition-all duration-[800ms] ease-[cubic-bezier(0.2,1,0.2,1)] h-full ${collapsed ? 'opacity-0 border-none pointer-events-none' : 'opacity-100'}`}
      style={{
        width: collapsed ? 0 : 'var(--sidebar-width)',
        borderRight: collapsed ? 'none' : '1px solid var(--border)',
        backgroundColor: 'var(--card)',
        flexShrink: 0,
      }}
    >
      {/* Header — logo + collapse button */}
      <div className="px-4 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => onNavigate('landing')}
        >
          {/* Premium Logo */}
          <LogoIcon size={28} darkMode={darkMode} />
          <span className="text-sm font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>
            Legal Navigator
          </span>
        </div>
        <button
          onClick={onToggle}
          className="p-1.5 rounded-lg transition-colors hover:opacity-70"
          style={{ color: 'var(--muted-foreground)' }}
          title="Collapse sidebar"
        >
          <ChevronLeft size={15} />
        </button>
      </div>

      {/* New Conversation button */}
      {/* TODO: After backend integration, call POST /api/conversations here and
          use the returned conversation ID to navigate to the new chat. */}
      <div className="px-3 pt-3 pb-2">
        <button
          onClick={onNew}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold transition-[opacity,transform] hover:opacity-80"
          style={{
            backgroundColor: 'var(--primary)',
            color: 'var(--primary-foreground)',
            fontFamily: 'var(--font-display)',
          }}
        >
          <Plus size={15} />
          New Conversation
        </button>
      </div>

      {/* Search */}
      {/* TODO: Debounce the search input (300ms) before triggering API search */}
      <div className="px-3 pb-2">
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-xl"
          style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)' }}
        >
          <Search size={13} style={{ color: 'var(--muted-foreground)' }} />
          <input
            type="text"
            placeholder="Search conversations..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 text-xs bg-transparent outline-none"
            style={{ color: 'var(--foreground)' }}
          />
        </div>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto px-2 pb-2">
        {/* TODO: Show skeleton loading cards here while fetching from API */}
        {filtered.length === 0 ? (
          <p className="text-xs text-center py-6" style={{ color: 'var(--muted-foreground)' }}>
            No conversations found
          </p>
        ) : (
          <>
            <p className="text-[10px] font-semibold uppercase tracking-wider px-2 py-2"
              style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--font-mono)' }}>
              Recent
            </p>
            {filtered.map(conv => (
              <div key={conv.id} className="relative group/item mb-0.5">
                <button
                  onClick={() => onSelect(conv.id)}
                  className="w-full text-left px-3 py-2.5 rounded-xl transition-colors pr-8"
                  style={{
                    backgroundColor: activeId === conv.id ? 'color-mix(in srgb, var(--primary) 10%, transparent)' : 'transparent',
                    border: activeId === conv.id ? '1px solid color-mix(in srgb, var(--primary) 20%, transparent)' : '1px solid transparent',
                  }}
                  onMouseEnter={e => {
                    if (activeId !== conv.id) e.currentTarget.style.backgroundColor = 'var(--muted)';
                  }}
                  onMouseLeave={e => {
                    if (activeId !== conv.id) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <div className="flex items-start gap-2">
                    <Scale size={12} className="mt-0.5 flex-shrink-0"
                      style={{ color: activeId === conv.id ? 'var(--primary)' : 'var(--muted-foreground)' }} />
                    <div className="flex-1 min-w-0">
                      {editingId === conv.id ? (
                        <input
                          value={editTitle}
                          onChange={e => setEditTitle(e.target.value)}
                          onBlur={() => commitEdit(conv.id)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') commitEdit(conv.id);
                            if (e.key === 'Escape') setEditingId(null);
                          }}
                          onClick={e => e.stopPropagation()}
                          autoFocus
                          className="text-xs font-semibold bg-transparent border-b outline-none w-full mb-0.5"
                          style={{ color: 'var(--foreground)', borderColor: 'var(--primary)', fontFamily: 'var(--font-display)' }}
                        />
                      ) : (
                        <p className="text-xs font-semibold truncate"
                          style={{
                            color: activeId === conv.id ? 'var(--primary)' : 'var(--foreground)',
                            fontFamily: 'var(--font-display)',
                          }}>
                          {conv.title}
                        </p>
                      )}
                      <p className="text-[10px] truncate mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                        {conv.preview}
                      </p>
                      <div className="flex items-center gap-1 mt-1">

                      </div>
                    </div>
                  </div>
                </button>

                {/* Action buttons — appears on row hover */}
                <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-[opacity,transform] duration-200">
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      startEdit(conv.id, conv.title);
                    }}
                    className="p-1.5 rounded-lg transition-[opacity,transform] hover:scale-110"
                    style={{ color: 'var(--primary)', backgroundColor: 'color-mix(in srgb, var(--primary) 10%, transparent)' }}
                    title="Rename conversation"
                  >
                    <Edit2 size={11} />
                  </button>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      onDelete(conv.id);
                    }}
                    className="p-1.5 rounded-lg transition-[opacity,transform] hover:scale-110"
                    style={{ color: '#ef4444', backgroundColor: 'color-mix(in srgb, #ef4444 10%, transparent)' }}
                    title="Delete conversation"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              </div>
            ))}
            {/* TODO: Add "Load more" button or infinite scroll trigger here */}
          </>
        )}
      </div>

      {/* Bottom: User profile + actions */}
      <div className="px-3 py-3" style={{ borderTop: '1px solid var(--border)' }}>
        {/* TODO: Replace hardcoded "Jamie Doe" / "Free Plan" / "JD" with real
            user data from AuthContext: user.displayName, user.plan, initials from name */}
        <div className="flex items-center gap-2 px-2 py-2 rounded-xl mb-2"
          style={{ backgroundColor: 'var(--muted)' }}>
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
            style={{ backgroundColor: '#7c3aed', fontFamily: 'var(--font-display)' }}>
            {name?.at(0)}
            {/* TODO: Replace #7c3aed with a color derived from the user's ID for consistency */}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold truncate" style={{ color: 'var(--foreground)', fontFamily: 'var(--font-display)' }}>
              {/* Jamie Doe TODO: Replace with user.displayName */}
              {name}
            </p>
          </div>
          {/* TODO: Sign-out should call POST /api/auth/signout and clear the auth token */}
          <button
            onClick={() => {
              fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/logout`, {
                "method": "POST",
                "credentials": "include",
              })
              state?.logout?.();
              onNavigate('landing');
            }}
            className="p-1 rounded-lg hover:opacity-70 transition-opacity"
            style={{ color: 'var(--muted-foreground)' }}
            title="Sign out">
            <LogOut size={13} />
          </button>
        </div>
        <div className="flex gap-2">
          {/* TODO: Wire Settings button to a settings modal or /settings route */}
          <button
            onClick={onOpenSettings}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-colors hover:opacity-80"
            style={{ backgroundColor: 'var(--secondary)', color: 'var(--secondary-foreground)', fontFamily: 'var(--font-display)' }}
          >
            <Settings size={12} />
            Settings
          </button>
          {/* TODO: Persist dark mode preference to localStorage and/or user profile */}
          <button
            onClick={onToggleDark}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors hover:opacity-80"
            style={{ backgroundColor: 'var(--secondary)', color: 'var(--secondary-foreground)' }}
            title={darkMode ? 'Light mode' : 'Dark mode'}
          >
            {darkMode ? '☀' : '☾'}
          </button>
        </div>
      </div>
    </div>
  );
}
