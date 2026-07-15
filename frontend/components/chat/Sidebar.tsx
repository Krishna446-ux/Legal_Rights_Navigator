'use client';

import { useState } from 'react';
import { Plus, Search, Settings, ChevronLeft, ChevronRight, Clock, Scale, LogOut } from 'lucide-react';
import type { Conversation } from '../../lib/types';

interface Props {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  collapsed: boolean;
  onToggle: () => void;
  onNavigate: (view: 'landing') => void;
  darkMode: boolean;
  onToggleDark: () => void;
}

function timeAgo(date: Date): string {
  const s = Math.floor((Date.now() - date.getTime()) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export default function Sidebar({
  conversations, activeId, onSelect, onNew, collapsed, onToggle, onNavigate, darkMode, onToggleDark
}: Props) {
  const [search, setSearch] = useState('');

  const filtered = conversations.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  if (collapsed) {
    return (
      <div
        className="flex flex-col items-center py-4 gap-3"
        style={{
          width: 60,
          borderRight: '1px solid var(--border)',
          backgroundColor: 'var(--card)',
          flexShrink: 0,
        }}
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold cursor-pointer"
          style={{ backgroundColor: 'var(--primary)', fontFamily: 'var(--font-display)' }}
          onClick={() => onNavigate('landing')}
        >
          LN
        </div>
        <button
          onClick={onNew}
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:opacity-80"
          style={{ backgroundColor: 'var(--muted)', color: 'var(--foreground)' }}
          title="New conversation"
        >
          <Plus size={15} />
        </button>
        <div className="flex-1" />
        <button
          onClick={onToggle}
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:opacity-70"
          style={{ color: 'var(--muted-foreground)' }}
        >
          <ChevronRight size={15} />
        </button>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col"
      style={{
        width: 'var(--sidebar-width)',
        borderRight: '1px solid var(--border)',
        backgroundColor: 'var(--card)',
        flexShrink: 0,
      }}
    >
      {/* Header */}
      <div className="px-4 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => onNavigate('landing')}
        >
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-[10px] font-bold"
            style={{ backgroundColor: 'var(--primary)', fontFamily: 'var(--font-display)' }}
          >
            LN
          </div>
          <span className="text-sm font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>
            Legal Navigator
          </span>
        </div>
        <button
          onClick={onToggle}
          className="p-1.5 rounded-lg transition-colors hover:opacity-70"
          style={{ color: 'var(--muted-foreground)' }}
        >
          <ChevronLeft size={15} />
        </button>
      </div>

      {/* New conversation */}
      <div className="px-3 pt-3 pb-2">
        <button
          onClick={onNew}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
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

      {/* Conversations */}
      <div className="flex-1 overflow-y-auto px-2 pb-2">
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
              <button
                key={conv.id}
                onClick={() => onSelect(conv.id)}
                className="w-full text-left px-3 py-2.5 rounded-xl mb-0.5 group transition-colors"
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
                    <p className="text-xs font-semibold truncate"
                      style={{
                        color: activeId === conv.id ? 'var(--primary)' : 'var(--foreground)',
                        fontFamily: 'var(--font-display)',
                      }}>
                      {conv.title}
                    </p>
                    <p className="text-[10px] truncate mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                      {conv.preview}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <Clock size={9} style={{ color: 'var(--muted-foreground)' }} />
                      <span className="text-[9px]" style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--font-mono)' }}>
                        {timeAgo(conv.updatedAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </>
        )}
      </div>

      {/* Bottom */}
      <div className="px-3 py-3" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2 px-2 py-2 rounded-xl mb-2"
          style={{ backgroundColor: 'var(--muted)' }}>
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
            style={{ backgroundColor: '#7c3aed', fontFamily: 'var(--font-display)' }}>
            JD
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold truncate" style={{ color: 'var(--foreground)', fontFamily: 'var(--font-display)' }}>
              Jamie Doe
            </p>
            <p className="text-[10px] truncate" style={{ color: 'var(--muted-foreground)' }}>
              Free Plan
            </p>
          </div>
          <button 
            onClick={() => {
              onNavigate('landing');
            }}
            className="p-1 rounded-lg hover:opacity-70 transition-opacity"
            style={{ color: 'var(--muted-foreground)' }}
            title="Sign out">
            <LogOut size={13} />
          </button>
        </div>
        <div className="flex gap-2">
          <button
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-colors hover:opacity-80"
            style={{ backgroundColor: 'var(--secondary)', color: 'var(--secondary-foreground)', fontFamily: 'var(--font-display)' }}
          >
            <Settings size={12} />
            Settings
          </button>
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
