'use client';

import { useEffect, useState } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface ConfettiPiece {
  id: number;
  x: number;
  color: string;
  size: number;
  rotation: number;
  delay: number;
  duration: number;
}

interface ConfettiProps {
  active: boolean;
  onComplete?: () => void;
}

const COLORS = [
  '#ff6b9d', '#c084fc', '#ffd700', '#ff8fab', 
  '#a855f7', '#f472b6', '#fb7185', '#e879f9'
];

function generatePieces(): ConfettiPiece[] {
  const pieces: ConfettiPiece[] = [];
  const pieceCount = 80;
  for (let i = 0; i < pieceCount; i++) {
    pieces.push({
      id: i,
      x: Math.random() * 100,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: Math.random() * 10 + 5,
      rotation: Math.random() * 360,
      delay: Math.random() * 0.5,
      duration: Math.random() * 1 + 1.5,
    });
  }
  return pieces;
}

export default function Confetti({ active, onComplete }: ConfettiProps) {
  // Use lazy init to generate pieces outside of render phase
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);
  const [showPieces, setShowPieces] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (active && !prefersReducedMotion) {
      // Generate pieces in effect to avoid impure function during render
      setPieces(generatePieces());
      setShowPieces(true);
      
      // Stop confetti after 2 seconds
      const timeout = setTimeout(() => {
        setShowPieces(false);
        setPieces([]);
        onComplete?.();
      }, 2000);

      return () => clearTimeout(timeout);
    } else {
      setShowPieces(false);
      setPieces([]);
    }
  }, [active, prefersReducedMotion, onComplete]);

  if (!showPieces || pieces.length === 0 || prefersReducedMotion) return null;

  return (
    <div 
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 100 }}
      aria-hidden="true"
    >
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className="absolute"
          style={{
            left: `${piece.x}%`,
            top: '-20px',
            width: piece.size,
            height: piece.size * 0.6,
            backgroundColor: piece.color,
            transform: `rotate(${piece.rotation}deg)`,
            animation: `confetti-fall ${piece.duration}s ease-out forwards`,
            animationDelay: `${piece.delay}s`,
            borderRadius: piece.id % 3 === 0 ? '50%' : '2px',
          }}
        />
      ))}
    </div>
  );
}
