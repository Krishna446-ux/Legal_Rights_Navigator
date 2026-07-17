'use client';

// ============================================================
// chat/page.tsx — Entry point for the protected /chat route
//
// WHAT NEEDS TO BE DONE:
//
// 1. DARK MODE PERSISTENCE:
//    - Currently defaults to `true` (dark mode) but resets on every page refresh.
//    - On mount, read from localStorage: const saved = localStorage.getItem('theme');
//    - Initialize state with: useState(saved === 'light' ? false : true)
//    - On toggle, persist: localStorage.setItem('theme', newMode ? 'dark' : 'light')
//    - Consider moving this logic into a ThemeProvider context wrapping the whole app
//      so the theme applies globally (including landing page and login).
//
// 2. AUTHENTICATION CHECK:
//    - This route is under (protected)/ which may have middleware guarding it.
//    - Add an explicit runtime check using AuthContext here.
//    - If the user is not authenticated or their session is expired, redirect to /login.
//    - Example:
//        const { user, loading } = useContext(AuthContext);
//        useEffect(() => { if (!loading && !user) router.replace('/login'); }, [user, loading]);
//
// 3. ROUTE-LEVEL METADATA:
//    - This is a 'use client' component so it cannot export `metadata`.
//    - If SEO is needed for the chat page, consider wrapping in a server component
//      parent that exports metadata, and keep this as a client child.
//    - For authenticated routes, SEO is typically not critical.
//
// 4. CONVERSATION ID FROM URL:
//    - Currently activeConversation is managed in ChatLayout state.
//    - Consider using URL params: /chat?id={conversationId}
//    - This allows users to share/bookmark specific conversations.
//    - Use useSearchParams() to read the ID and pass to ChatLayout.
// ============================================================

import { useTheme } from '../../../lib/theme-context';
import ChatLayout from '../../../components/chat/ChatLayout';
import { useRouter } from 'next/navigation';
import type { View } from '../../../lib/types';

export default function ChatPage() {
  const router = useRouter();
  const { darkMode, toggleTheme } = useTheme();

  const handleNavigate = (view: View) => {
    if (view === 'landing') router.push('/');
    // TODO: Handle other view navigations if needed (e.g., 'settings')
  };

  // TODO: Add auth check here — redirect to /login if not authenticated (see note #2)

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden">
      <ChatLayout
        onNavigate={handleNavigate}
        darkMode={darkMode}
        onToggleDark={toggleTheme}
      />
    </div>
  );
}
