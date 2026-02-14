'use client';

import { useEffect, useState } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface ToastProps {
  message: string;
  visible: boolean;
  duration?: number;
  onHide?: () => void;
  variant?: 'success' | 'error' | 'info';
}

export default function Toast({ 
  message, 
  visible, 
  duration = 1200, 
  onHide,
  variant = 'success' 
}: ToastProps) {
  // Derive showing state from visible prop
  const [isShowing, setIsShowing] = useState(visible);
  const prefersReducedMotion = useReducedMotion();

  // Sync isShowing with visible prop changes
  if (visible && !isShowing) {
    setIsShowing(true);
  }

  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        setIsShowing(false);
        onHide?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [visible, duration, onHide]);

  if (!isShowing) return null;

  const variantClasses = {
    success: 'bg-green-500/90 text-white',
    error: 'bg-red-500/90 text-white',
    info: 'bg-purple-500/90 text-white',
  };

  const animationClass = prefersReducedMotion 
    ? 'opacity-100' 
    : 'animate-toast-in';

  return (
    <div 
      className="fixed bottom-6 left-1/2 z-[200] pointer-events-none"
      role="status"
      aria-live="polite"
    >
      <div 
        className={`
          -translate-x-1/2 px-4 py-2 rounded-full 
          backdrop-blur-sm shadow-lg
          ${variantClasses[variant]}
          ${animationClass}
        `}
      >
        <span className="flex items-center gap-2 text-sm font-medium">
          {variant === 'success' && '✓'}
          {variant === 'error' && '✕'}
          {variant === 'info' && 'ℹ'}
          {message}
        </span>
      </div>
    </div>
  );
}
