'use client';

import { useState } from 'react';
import Starfield from '@/components/Starfield';
import Heart from '@/components/Heart';
import PriorityBoard from '@/components/PriorityBoard';
import { useReducedMotion } from '@/hooks/useReducedMotion';

type View = 'landing' | 'board';

export default function Home() {
  const [currentView, setCurrentView] = useState<View>('landing');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const handleHeartClick = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentView('board');
      setIsTransitioning(false);
    }, prefersReducedMotion ? 100 : 600);
  };

  const handleBack = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentView('landing');
      setIsTransitioning(false);
    }, prefersReducedMotion ? 100 : 300);
  };

  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Starfield background */}
      <Starfield dimmed={currentView === 'board'} />

      {/* Landing View */}
      {currentView === 'landing' && !isTransitioning && (
        <div 
          className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 animate-fade-in-up"
          role="main"
          aria-label="Welcome to Milena's Priority Board"
        >
          {/* Title */}
          <h1 className="text-center mb-8 md:mb-12">
            <span className="block text-3xl md:text-4xl lg:text-5xl font-light text-white/90 mb-2">
              Milena,
            </span>
            <span className="block text-2xl md:text-3xl lg:text-4xl font-semibold bg-gradient-to-r from-pink-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              pick our destiny 💫
            </span>
          </h1>

          {/* Floating Heart */}
          <Heart onClick={handleHeartClick} />

          {/* Hint text */}
          <p className={`mt-8 text-white/50 text-sm md:text-base ${!prefersReducedMotion ? 'animate-pulse' : ''}`}>
            Tap the heart
          </p>
        </div>
      )}

      {/* Board View */}
      {currentView === 'board' && !isTransitioning && (
        <PriorityBoard onBack={handleBack} />
      )}

      {/* Transition overlay */}
      {isTransitioning && (
        <div 
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center"
          aria-hidden="true"
        >
          {!prefersReducedMotion && (
            <div className="w-8 h-8 border-4 border-pink-400 border-t-transparent rounded-full animate-spin" />
          )}
        </div>
      )}
    </main>
  );
}
