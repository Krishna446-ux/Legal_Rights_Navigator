'use client';

// ============================================================
// ChatLayout.tsx — Root layout for the chat page
//
// LAZY CONVERSATION CREATION:
//   Clicking "New Conversation" does NOT create a conversation yet.
//   It just generates a UUID and puts the UI into "pending" mode.
//   The conversation is officially added to the sidebar list only
//   when the user sends their first message (onFirstSend callback).
//   This prevents empty ghost conversations from cluttering the history.
//
// DELETION:
//   onDelete(id) removes the conversation from the list immediately.
//   If the deleted conversation is active, we switch to null (blank state).
//
// WHAT STILL NEEDS TO BE DONE:
//   1. Replace the local conversations state with GET /api/conversations.
//   2. On onFirstSend, call POST /api/conversations to persist server-side.
//   3. On onDelete, call DELETE /api/conversations/{id}.
//   4. Add runtime auth guard using AuthContext.
//   5. Persist darkMode to localStorage.
// ============================================================

import { useCallback, useEffect, useState } from 'react';
import type { Citation, Conversation, View } from '../../lib/types';

import Sidebar from './Sidebar';
import ChatArea from './ChatArea';
import CitationPanel from './CitationPanel';
import logger from '@/lib/pino';
import Toast from '../shared/Toast';

import SettingsModal, { FontSize } from '../shared/SettingsModal';

interface Props {
  onNavigate: (view: View) => void;
  darkMode: boolean;
  onToggleDark: () => void;
}

export default function ChatLayout({ onNavigate, darkMode, onToggleDark }: Props) {
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  
  // Settings & Font Size state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [fontSize, setFontSize] = useState<FontSize>('medium');

  // Load font size from localStorage
  useEffect(() => {
    const savedFontSize = localStorage.getItem('chat-font-size') as FontSize;
    if (savedFontSize) {
      setFontSize(savedFontSize);
    }
  }, []);

  const handleFontSizeChange = (size: FontSize) => {
    setFontSize(size);
    localStorage.setItem('chat-font-size', size);
  };

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  
  // Mobile overlay click handler
  const closeSidebars = useCallback(() => {
    if (window.innerWidth < 768) {
      setSidebarCollapsed(true);
      setCitationPanelOpen(false);
    }
  }, []);

  useEffect(() => {
    async function loadConversation() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/conversation`,
          {
            credentials: "include",
          }
        );

        const data = await res.json();
        if (res.ok && Array.isArray(data)) {
          setConversations(data);
        } else {
          logger.warn(`Failed to load conversations: ${data.detail || 'Unknown error'}`);
          setConversations([]);
        }
      } catch (error) {
        logger.error(`Network error loading conversations: ${error}`);
        setConversations([]);
      }
    }

    loadConversation();
  }, []);


  // Citation panel
  const [citations, setCitations] = useState<Citation[]>([]);
  const [citationPanelOpen, setCitationPanelOpen] = useState(false);

  // Toast notifications state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // ─── New Conversation ────────────────────────────────────────────────────────
  const handleNew = useCallback(() => {
    setActiveConversationId(null);
    setIsPending(true);
    setCitations([]);
    setCitationPanelOpen(false);
    setResetKey(prev => prev + 1);
    if (window.innerWidth < 768) setSidebarCollapsed(true);
  }, []);

  // ─── First Send ──────────────────────────────────────────────────────────────
  const handleFirstSend = useCallback(
    (realId: string, firstMessageText: string) => {
      if (!isPending && activeConversationId !== null) return;

      const newConv: Conversation = {
        id: realId,
        title: 'Untitled Conversation',
        preview: firstMessageText.slice(0, 80),
        updatedAt: new Date(),
        messageCount: 1,
      };

      setActiveConversationId(realId);
      setConversations(prev => [newConv, ...prev]);
      setIsPending(false);
    },
    [isPending]
  );

  // ─── Select Conversation ─────────────────────────────────────────────────────
  const handleSelect = useCallback((id: string) => {
    setActiveConversationId(id);
    setIsPending(false);
    setCitations([]);
    setCitationPanelOpen(false);
    if (window.innerWidth < 768) setSidebarCollapsed(true);
  }, []);


  // ─── Delete Conversation ─────────────────────────────────────────────────────
  const handleDelete = useCallback(
    async (id: string) => {
      const convToDelete = conversations.find(c => c.id === id);
      setConversations(prev => prev.filter(c => c.id !== id));

      let wasActive = false;
      if (activeConversationId === id) {
        wasActive = true;
        setActiveConversationId(null);
        setIsPending(false);
        setCitations([]);
        setCitationPanelOpen(false);
      }

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/conversation/${id}`, { 
          method: "DELETE", 
          credentials: "include", 
        });
        
        if (!res.ok) throw new Error(`Failed to delete conversation: ${res.status}`);
        
        const result = await res.json();
        if (result == 1) {
          logger.info(`Conversation Id ${id} deleted successfully`);
          setToast({ message: `Deleted "${convToDelete?.title || 'conversation'}"`, type: 'info' });
        } else {
          logger.warn(`Conversation Id ${id} did not get deleted`);
          if (convToDelete) setConversations(prev => [convToDelete, ...prev]);
          if (wasActive) setActiveConversationId(id);
          setToast({ message: `Failed to delete conversation`, type: 'error' });
        }
      } catch (err) {
        logger.error(`Error deleting conversation: ${err}`);
        if (convToDelete) setConversations(prev => [convToDelete, ...prev]);
        if (wasActive) setActiveConversationId(id);
        setToast({ message: `Failed to delete: Network error`, type: 'error' });
      }
    },
    [activeConversationId, conversations]
  );

  // ─── Rename Conversation ─────────────────────────────────────────────────────
  const handleRename = useCallback(async (id: string, newTitle: string) => {
    const oldTitle = conversations.find((c) => c.id === id)?.title ?? "";
    setConversations(prev => prev.map((c) => c.id === id ? { ...c, title: newTitle } : c));

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/conversation/${id}/${newTitle}`, { 
        method: "PUT", 
        credentials: "include", 
      });
      
      if (!res.ok) throw new Error(`Failed to rename conversation: ${res.status}`);
      
      const result = await res.json();
      if (result == 1) {
        logger.info(`Conversation Id ${id} renamed successfully`);
        setToast({ message: `Renamed conversation to "${newTitle}"`, type: 'success' });
      } else {
        logger.warn(`Conversation Id ${id} did not get renamed`);
        setConversations(prev => prev.map(c => c.id === id ? { ...c, title: oldTitle } : c));
        setToast({ message: `Failed to rename conversation`, type: 'error' });
      }
    } catch (err) {
      logger.error(`Error renaming conversation: ${err}`);
      setConversations(prev => prev.map(c => c.id === id ? { ...c, title: oldTitle } : c));
      setToast({ message: `Failed to rename: Network error`, type: 'error' });
    }
  }, [conversations]);

  // ─── Citations ───────────────────────────────────────────────────────────────
  const handleCitationsChange = useCallback((newCitations: Citation[]) => {
    setCitations(newCitations);
    if (newCitations.length > 0) {
      setCitationPanelOpen(true);
      if (window.innerWidth < 768) setSidebarCollapsed(true);
    }
  }, []);

  return (
    <div
      className="relative flex flex-1 h-full w-full overflow-hidden"
      style={{ backgroundColor: 'var(--background)' }}
      data-text-size={fontSize}
    >
      {/* Mobile backdrop overlay */}
      {(!sidebarCollapsed || citationPanelOpen) && (
        <div 
          className="md:hidden absolute inset-0 z-30 bg-black/40 backdrop-blur-sm transition-opacity" 
          onClick={closeSidebars}
        />
      )}

      {/* Left sidebar */}
      <div className={`shrink-0 absolute top-0 left-0 md:relative z-40 h-full flex flex-col transition-transform duration-300 ${!sidebarCollapsed ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <Sidebar
          conversations={conversations}
          activeId={activeConversationId}
          onSelect={handleSelect}
          onNew={handleNew}
          onDelete={handleDelete}
          onRename={handleRename}
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(v => !v)}
          onNavigate={onNavigate}
          darkMode={darkMode}
          onToggleDark={onToggleDark}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />
      </div>

      {/* Main chat area */}
      <ChatArea
        conversationId={activeConversationId}
        isPendingConversation={isPending}
        resetKey={resetKey}
        onFirstSend={handleFirstSend}
        onCitationsChange={handleCitationsChange}
        onToggleSidebar={() => setSidebarCollapsed(false)}
        isSidebarCollapsed={sidebarCollapsed}
        citationCount={citations.length}
        onToggleCitations={() => setCitationPanelOpen(v => !v)}
        citationPanelOpen={citationPanelOpen}
        darkMode={darkMode}
      />

      {/* Right citation panel */}
      <div className={`shrink-0 absolute top-0 right-0 md:relative z-40 h-full flex flex-col transition-transform duration-300 ${citationPanelOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}>
        <CitationPanel
          citations={citations}
          isOpen={citationPanelOpen}
          onClose={() => setCitationPanelOpen(false)}
        />
      </div>

      {/* Settings Modal */}
      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        darkMode={darkMode}
        onToggleDark={onToggleDark}
        fontSize={fontSize}
        onChangeFontSize={handleFontSizeChange}
      />

      {/* Dynamic Toast notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
