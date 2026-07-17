'use client';

import { useEffect, useState } from 'react';
import { X, CheckCircle, Info, AlertCircle } from 'lucide-react';

interface ToastProps {
  message: string;
  type?: 'success' | 'info' | 'error';
  duration?: number;
  onClose: () => void;
}

export default function Toast({ message, type = 'success', duration = 3000, onClose }: ToastProps) {
  const [animationClass, setAnimationClass] = useState('translate-y-4 opacity-0 scale-95');

  useEffect(() => {
    // Trigger slide-up and fade-in
    const enterTimeout = setTimeout(() => {
      setAnimationClass('translate-y-0 opacity-100 scale-100');
    }, 50);

    // Trigger fade-out slightly before duration ends
    const exitTimeout = setTimeout(() => {
      setAnimationClass('translate-y-4 opacity-0 scale-95');
      // Wait for animation to finish before calling onClose
      setTimeout(onClose, 300);
    }, duration - 300);

    return () => {
      clearTimeout(enterTimeout);
      clearTimeout(exitTimeout);
    };
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircle size={15} style={{ color: '#10b981' }} />,
    info: <Info size={15} style={{ color: '#3b82f6' }} />,
    error: <AlertCircle size={15} style={{ color: '#f43f5e' }} />,
  };

  const borderColors = {
    success: 'color-mix(in srgb, #10b981 30%, transparent)',
    info: 'color-mix(in srgb, #3b82f6 30%, transparent)',
    error: 'color-mix(in srgb, #f43f5e 30%, transparent)',
  };

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-xl backdrop-blur-md transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${animationClass}`}
      style={{
        backgroundColor: 'var(--card)',
        borderColor: borderColors[type],
        color: 'var(--foreground)',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
      }}
    >
      <div className="flex-shrink-0 flex items-center">{icons[type]}</div>
      <p className="text-xs font-semibold" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>
        {message}
      </p>
      <button
        onClick={() => {
          setAnimationClass('translate-y-4 opacity-0 scale-95');
          setTimeout(onClose, 300);
        }}
        className="p-1 rounded-lg opacity-70 hover:opacity-100 transition-[opacity,transform] ml-2"
        style={{ color: 'var(--muted-foreground)' }}
      >
        <X size={12} />
      </button>
    </div>
  );
}
