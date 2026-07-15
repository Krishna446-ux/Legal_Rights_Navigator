'use client';

import { useState } from 'react';
import ChatLayout from '../../../components/chat/ChatLayout';
import { useRouter } from 'next/navigation';
import type { View } from '../../../lib/types';

export default function ChatPage() {
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false);

  const handleNavigate = (view: View) => {
    if (view === 'landing') router.push('/');
  };

  return (
    <div className={darkMode ? 'dark' : ''}>
      <ChatLayout 
        onNavigate={handleNavigate}
        darkMode={darkMode}
        onToggleDark={() => setDarkMode(!darkMode)}
      />
    </div>
  );
}
