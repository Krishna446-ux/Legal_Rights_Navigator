'use client';

import { useState } from 'react';
import type { Citation, View } from '../../lib/types';
import { mockConversations, mockLegalSources } from '../../lib/mockData';
import Sidebar from './Sidebar';
import ChatArea from './ChatArea';
import ContextPanel from './ContextPanel';

interface Props {
  onNavigate: (view: View) => void;
  darkMode: boolean;
  onToggleDark: () => void;
}

export default function ChatLayout({ onNavigate, darkMode, onToggleDark }: Props) {
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [contextCollapsed, setContextCollapsed] = useState(false);
  const [contextVisible, setContextVisible] = useState(true);
  const [citations, setCitations] = useState<Citation[]>([]);
  const [conversations] = useState(mockConversations);

  const handleNew = () => {
    setActiveConversation(null);
    setCitations([]);
  };

  const handleSelectConversation = (id: string) => {
    setActiveConversation(id);
    setCitations([]);
  };

  const handleCitationsChange = (newCitations: Citation[]) => {
    setCitations(newCitations);
    if (newCitations.length > 0 && !contextVisible) {
      setContextVisible(true);
      setContextCollapsed(false);
    }
  };

  return (
    <div className={`flex h-screen overflow-hidden ${darkMode ? 'dark' : ''}`} style={{ backgroundColor: 'var(--background)' }}>
      <Sidebar
        conversations={conversations}
        activeId={activeConversation}
        onSelect={handleSelectConversation}
        onNew={handleNew}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        onNavigate={onNavigate}
        darkMode={darkMode}
        onToggleDark={onToggleDark}
      />
      <ChatArea
        conversationId={activeConversation}
        onCitationsChange={handleCitationsChange}
      />
      {contextVisible && (
        <ContextPanel
          citations={citations}
          sources={mockLegalSources}
          collapsed={contextCollapsed}
          onToggle={() => setContextCollapsed(!contextCollapsed)}
          onClose={() => setContextVisible(false)}
        />
      )}
    </div>
  );
}
