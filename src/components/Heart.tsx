'use client';

import { useState, useRef } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface HeartProps {
  onClick: () => void;
}

interface Sparkle {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
  color: string;
}

const SPARKLE_COLORS = ['#ff6b9d', '#c084fc', '#ffd700', '#ff8fab', '#a855f7'];

export default function Heart({ onClick }: HeartProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);
  const prefersReducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);

  // Use lazy state init to generate random values outside render phase
  const [ambientParticleDurations] = useState(() => {
    return [...Array(8)].map(() => 1.2 + Math.random() * 0.6);
  });

  const createSparkles = () => {
    if (prefersReducedMotion) return;
    
    const newSparkles: Sparkle[] = [];
    const count = 12;
    
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const distance = 80 + Math.random() * 40;
      newSparkles.push({
        id: i,
        x: 50 + Math.cos(angle) * distance,
        y: 50 + Math.sin(angle) * distance,
        size: 4 + Math.random() * 6,
        delay: Math.random() * 0.2,
        duration: 0.4 + Math.random() * 0.3,
        color: SPARKLE_COLORS[Math.floor(Math.random() * SPARKLE_COLORS.length)],
      });
    }
    
    setSparkles(newSparkles);
    
    // Clear sparkles after animation
    setTimeout(() => setSparkles([]), 700);
  };

  const handleClick = () => {
    if (isOpening) return;
    
    createSparkles();
    setIsOpening(true);
    
    setTimeout(() => {
      onClick();
    }, 600);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <div 
      ref={containerRef}
      className="relative"
      style={{ width: '200px', height: '200px' }}
    >
      {/* Sparkle burst on click */}
      {sparkles.length > 0 && (
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          {sparkles.map((sparkle) => (
            <span
              key={sparkle.id}
              className="absolute rounded-full animate-sparkle-burst"
              style={{
                left: `${sparkle.x}%`,
                top: `${sparkle.y}%`,
                width: sparkle.size,
                height: sparkle.size,
                backgroundColor: sparkle.color,
                animationDelay: `${sparkle.delay}s`,
                animationDuration: `${sparkle.duration}s`,
                boxShadow: `0 0 ${sparkle.size * 2}px ${sparkle.color}`,
              }}
            />
          ))}
        </div>
      )}

      {/* Glow burst on click */}
      {isOpening && !prefersReducedMotion && (
        <div 
          className="absolute inset-0 rounded-full animate-glow-burst"
          style={{
            background: 'radial-gradient(circle, rgba(255,107,157,0.6) 0%, transparent 70%)',
          }}
          aria-hidden="true"
        />
      )}

      <button
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onFocus={() => setIsHovered(true)}
        onBlur={() => setIsHovered(false)}
        className={`
          relative cursor-pointer transition-all duration-300 focus-ring rounded-full p-4
          w-full h-full flex items-center justify-center
          ${isOpening ? 'animate-heart-open pointer-events-none' : ''}
          ${!prefersReducedMotion && !isOpening ? 'animate-float' : ''}
          ${isHovered && !isOpening ? 'scale-110' : ''}
        `}
        aria-label="Open Milena's Priority Board - Tap or press Enter to begin"
        disabled={isOpening}
      >
        <svg
          viewBox="0 0 100 100"
          className={`
            w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48
            transition-all duration-300
            ${isHovered && !prefersReducedMotion ? 'animate-pulse-glow' : ''}
          `}
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="heartGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ff6b9d" />
              <stop offset="50%" stopColor="#ff8fab" />
              <stop offset="100%" stopColor="#c084fc" />
            </linearGradient>
            <filter id="heartGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <path
            d="M50 88 C20 60 5 40 5 25 C5 10 20 0 35 0 C45 0 50 10 50 10 C50 10 55 0 65 0 C80 0 95 10 95 25 C95 40 80 60 50 88 Z"
            fill="url(#heartGradient)"
            filter={isHovered || isOpening ? 'url(#heartGlow)' : undefined}
            className="transition-all duration-300"
          />
          {/* Inner highlight */}
          <ellipse
            cx="35"
            cy="25"
            rx="10"
            ry="8"
            fill="rgba(255, 255, 255, 0.3)"
            className="transition-opacity duration-300"
            style={{ opacity: isHovered ? 0.5 : 0.3 }}
          />
        </svg>
      </button>
      
      {/* Ambient particles on hover */}
      {isHovered && !prefersReducedMotion && !isOpening && (
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          {ambientParticleDurations.map((duration, i) => (
            <span
              key={i}
              className="absolute w-2 h-2 bg-pink-400 rounded-full"
              style={{
                left: `${50 + Math.cos((i / 8) * Math.PI * 2) * 55}%`,
                top: `${50 + Math.sin((i / 8) * Math.PI * 2) * 55}%`,
                animation: `twinkle ${duration}s ease-in-out infinite`,
                animationDelay: `${i * 0.1}s`,
                opacity: 0.6,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
