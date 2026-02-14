'use client';

import { useState } from 'react';
import { Item } from '@/lib/storage';
import Button from './ui/Button';

interface DecisionCardProps {
  items: Item[];
  onUnlock: () => void;
}

const CLOSING_LINES = [
  "The universe has spoken. 🌌",
  "Destiny: locked and loaded. 💫",
  "No pressure, but this is forever now. 💍",
  "You chose wisely. Probably. 🤔",
  "This list is now legally binding.* (*not really)",
  "The stars approve. ⭐",
];

export default function DecisionCard({ items, onUnlock }: DecisionCardProps) {
  // Use lazy state init to call Math.random outside render phase
  const [closingLine] = useState(() => {
    return CLOSING_LINES[Math.floor(Math.random() * CLOSING_LINES.length)];
  });
  const displayItems = items.slice(0, 10);

  return (
    <div className="glass rounded-2xl p-6 md:p-8 mb-8 animate-bounce-in max-w-lg mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent mb-2">
          ✨ It&apos;s Official! ✨
        </h2>
        <p className="text-white/60 text-sm">
          {closingLine}
        </p>
      </div>

      <div className="space-y-2 mb-6">
        {displayItems.map((item, index) => (
          <div 
            key={item.id}
            className={`
              flex items-center gap-3 p-3 rounded-xl transition-all
              ${index < 3 
                ? 'bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/30' 
                : 'bg-white/5'
              }
            `}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <span 
              className={`
                w-7 h-7 flex items-center justify-center rounded-full text-sm font-bold
                ${index < 3 
                  ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white' 
                  : 'bg-white/20 text-white/70'
                }
              `}
            >
              {index + 1}
            </span>
            <span className="text-lg" aria-hidden="true">{item.emoji}</span>
            <span className={`flex-1 ${index < 3 ? 'text-white font-medium' : 'text-white/80'}`}>
              {item.label}
            </span>
            {index === 0 && <span className="text-xs">🏆</span>}
            {index === 1 && <span className="text-xs">🥈</span>}
            {index === 2 && <span className="text-xs">🥉</span>}
          </div>
        ))}
      </div>

      {items.length > 10 && (
        <p className="text-center text-white/40 text-sm mb-4">
          +{items.length - 10} more priorities
        </p>
      )}

      <div className="text-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={onUnlock}
          aria-label="Unlock to continue editing"
        >
          🔓 Unlock to edit
        </Button>
      </div>
    </div>
  );
}
