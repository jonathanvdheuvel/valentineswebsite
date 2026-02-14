'use client';

import { useState, useEffect, useRef } from 'react';
import Confetti from './Confetti';
import DecisionCard from './DecisionCard';
import Toast from './ui/Toast';
import Button from './ui/Button';
import IconButton from './ui/IconButton';
import { 
  Item, 
  BoardState, 
  loadBoardState, 
  saveBoardState, 
  clearBoardState,
  isDuplicateLabel,
  createItem,
  updateItemLabel 
} from '@/lib/storage';

interface PriorityBoardProps {
  onBack: () => void;
}

const INITIAL_ITEMS: Item[] = [
  // Required items
  { id: '1', label: 'Cartier bag', emoji: '👜', createdAt: 1, updatedAt: 1 },
  { id: '2', label: 'Wedding', emoji: '💒', createdAt: 2, updatedAt: 2 },
  { id: '3', label: 'Proposal', emoji: '💍', createdAt: 3, updatedAt: 3 },
  { id: '4', label: 'Buying a house', emoji: '🏠', createdAt: 4, updatedAt: 4 },
  { id: '5', label: 'Buying a car', emoji: '🚗', createdAt: 5, updatedAt: 5 },
  { id: '6', label: 'Getting children', emoji: '👶', createdAt: 6, updatedAt: 6 },
  { id: '7', label: 'Photoshoot', emoji: '📸', createdAt: 7, updatedAt: 7 },
  { id: '8', label: 'Buying makeup', emoji: '💄', createdAt: 8, updatedAt: 8 },
  // Additional funny items
  { id: '9', label: 'Weekend Paris trip', emoji: '🗼', createdAt: 9, updatedAt: 9 },
  { id: '10', label: 'Spa day', emoji: '🧖‍♀️', createdAt: 10, updatedAt: 10 },
  { id: '11', label: 'Matching pajamas', emoji: '👔', createdAt: 11, updatedAt: 11 },
  { id: '12', label: 'Sushi date night', emoji: '🍣', createdAt: 12, updatedAt: 12 },
  { id: '13', label: 'Dyson Airwrap', emoji: '💇‍♀️', createdAt: 13, updatedAt: 13 },
  { id: '14', label: 'Jewelry (mysterious box)', emoji: '💎', createdAt: 14, updatedAt: 14 },
  { id: '15', label: 'Cat/dog adoption "trial"', emoji: '🐱', createdAt: 15, updatedAt: 15 },
  { id: '16', label: 'Fancy dinner with dress code', emoji: '🍷', createdAt: 16, updatedAt: 16 },
  { id: '17', label: 'New handbag "for science"', emoji: '🔬', createdAt: 17, updatedAt: 17 },
  { id: '18', label: 'Couples cooking class', emoji: '👨‍🍳', createdAt: 18, updatedAt: 18 },
  { id: '19', label: 'Netherlands weekend getaway', emoji: '🌷', createdAt: 19, updatedAt: 19 },
  { id: '20', label: 'One (1) irrational purchase', emoji: '🤪', createdAt: 20, updatedAt: 20 },
];

const DEFAULT_STATE: BoardState = {
  unprioritized: INITIAL_ITEMS,
  prioritized: [],
  version: 1,
};

export default function PriorityBoard({ onBack }: PriorityBoardProps) {
  // Use lazy init to avoid setState in useEffect
  const [state, setState] = useState<BoardState>(() => {
    if (typeof window === 'undefined') return DEFAULT_STATE;
    return loadBoardState(DEFAULT_STATE);
  });
  const [draggedItem, setDraggedItem] = useState<Item | null>(null);
  const [dragSource, setDragSource] = useState<'unprioritized' | 'prioritized' | null>(null);
  const [dragOverList, setDragOverList] = useState<'unprioritized' | 'prioritized' | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [isLoaded, setIsLoaded] = useState(typeof window !== 'undefined');
  
  // Toast state
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [toastVariant, setToastVariant] = useState<'success' | 'error' | 'info'>('success');
  
  // Add custom item state
  const [newItemLabel, setNewItemLabel] = useState('');
  const [addItemError, setAddItemError] = useState('');
  
  // Rename state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingLabel, setEditingLabel] = useState('');
  const [renameError, setRenameError] = useState('');

  const announcerRef = useRef<HTMLDivElement>(null);
  const newItemInputRef = useRef<HTMLInputElement>(null);

  // Hydration sync - re-check after mount (setState here is intentional for external storage sync)
  useEffect(() => {
    if (!isLoaded) {
      const loaded = loadBoardState(DEFAULT_STATE);
      setState(loaded);
      setIsLoaded(true);
    }
  }, [isLoaded]);

  // Save to localStorage
  useEffect(() => {
    if (!isLoaded) return;
    saveBoardState(state);
  }, [state, isLoaded]);

  const showToast = (message: string, variant: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage(message);
    setToastVariant(variant);
    setToastVisible(true);
  };

  const announce = (message: string) => {
    if (announcerRef.current) {
      announcerRef.current.textContent = message;
    }
  };

  const getAllItems = () => {
    return [...state.unprioritized, ...state.prioritized];
  };

  // Add custom item
  const handleAddCustomItem = () => {
    const trimmed = newItemLabel.trim();
    
    if (!trimmed) {
      setAddItemError('Please enter a name');
      return;
    }
    
    if (isDuplicateLabel(trimmed, getAllItems())) {
      setAddItemError('This item already exists');
      return;
    }
    
    const newItem = createItem(trimmed);
    setState(prev => ({
      ...prev,
      unprioritized: [newItem, ...prev.unprioritized],
    }));
    
    setNewItemLabel('');
    setAddItemError('');
    announce(`Added "${trimmed}" to unprioritized items`);
    showToast(`Added "${trimmed}"`, 'success');
  };

  const handleAddItemKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddCustomItem();
    }
  };

  // Rename item
  const startEditing = (item: Item) => {
    setEditingId(item.id);
    setEditingLabel(item.label);
    setRenameError('');
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingLabel('');
    setRenameError('');
  };

  const saveEdit = (item: Item) => {
    const trimmed = editingLabel.trim();
    
    if (!trimmed) {
      setRenameError('Name cannot be empty');
      return;
    }
    
    if (trimmed !== item.label && isDuplicateLabel(trimmed, getAllItems(), item.id)) {
      setRenameError('This name already exists');
      return;
    }
    
    const updatedItem = updateItemLabel(item, trimmed);
    
    setState(prev => ({
      ...prev,
      unprioritized: prev.unprioritized.map(i => i.id === item.id ? updatedItem : i),
      prioritized: prev.prioritized.map(i => i.id === item.id ? updatedItem : i),
    }));
    
    cancelEditing();
    announce(`Renamed to "${trimmed}"`);
  };

  const handleEditKeyDown = (e: React.KeyboardEvent, item: Item) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveEdit(item);
    } else if (e.key === 'Escape') {
      cancelEditing();
    }
  };

  // Drag handlers
  const handleDragStart = (item: Item, source: 'unprioritized' | 'prioritized') => {
    setDraggedItem(item);
    setDragSource(source);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragSource(null);
    setDragOverList(null);
    setDragOverIndex(null);
  };

  const handleDragOver = (e: React.DragEvent, list: 'unprioritized' | 'prioritized', index?: number) => {
    e.preventDefault();
    setDragOverList(list);
    if (index !== undefined) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = (e: React.DragEvent, targetList: 'unprioritized' | 'prioritized', dropIndex?: number) => {
    e.preventDefault();
    
    if (!draggedItem || !dragSource) return;

    setState(prev => {
      const newState = { ...prev };
      
      // Remove from source
      if (dragSource === 'unprioritized') {
        newState.unprioritized = prev.unprioritized.filter(item => item.id !== draggedItem.id);
      } else {
        newState.prioritized = prev.prioritized.filter(item => item.id !== draggedItem.id);
      }
      
      // Add to target
      if (targetList === 'unprioritized') {
        newState.unprioritized = [...newState.unprioritized, draggedItem];
        announce(`Moved "${draggedItem.label}" to unprioritized`);
      } else {
        if (dropIndex !== undefined) {
          const newPrioritized = [...newState.prioritized];
          newPrioritized.splice(dropIndex, 0, draggedItem);
          newState.prioritized = newPrioritized;
          announce(`Moved "${draggedItem.label}" to rank ${dropIndex + 1}`);
        } else {
          newState.prioritized = [...newState.prioritized, draggedItem];
          announce(`Moved "${draggedItem.label}" to rank ${newState.prioritized.length}`);
        }
      }
      
      return newState;
    });

    handleDragEnd();
  };

  // Keyboard-accessible controls
  const moveToTop = (item: Item) => {
    setState(prev => ({
      ...prev,
      unprioritized: prev.unprioritized.filter(i => i.id !== item.id),
      prioritized: [...prev.prioritized, item],
    }));
    announce(`Added "${item.label}" to priorities at position ${state.prioritized.length + 1}`);
  };

  const removeFromPrioritized = (item: Item) => {
    setState(prev => ({
      ...prev,
      unprioritized: [...prev.unprioritized, item],
      prioritized: prev.prioritized.filter(i => i.id !== item.id),
    }));
    announce(`Removed "${item.label}" from priorities`);
  };

  const moveUp = (index: number, item: Item) => {
    if (index === 0) return;
    setState(prev => {
      const newPrioritized = [...prev.prioritized];
      [newPrioritized[index - 1], newPrioritized[index]] = [newPrioritized[index], newPrioritized[index - 1]];
      return { ...prev, prioritized: newPrioritized };
    });
    announce(`Moved "${item.label}" to rank ${index}`);
  };

  const moveDown = (index: number, item: Item) => {
    setState(prev => {
      if (index >= prev.prioritized.length - 1) return prev;
      const newPrioritized = [...prev.prioritized];
      [newPrioritized[index], newPrioritized[index + 1]] = [newPrioritized[index + 1], newPrioritized[index]];
      return { ...prev, prioritized: newPrioritized };
    });
    announce(`Moved "${item.label}" to rank ${index + 2}`);
  };

  const randomize = () => {
    const allItems = [...state.unprioritized, ...state.prioritized];
    const shuffled = allItems.sort(() => Math.random() - 0.5);
    const halfIndex = Math.floor(shuffled.length / 2);
    setState(prev => ({
      ...prev,
      unprioritized: shuffled.slice(halfIndex),
      prioritized: shuffled.slice(0, halfIndex),
    }));
    announce('Items have been randomized!');
  };

  const reset = () => {
    setState(DEFAULT_STATE);
    setIsLocked(false);
    setShowConfetti(false);
    clearBoardState();
    announce('Board has been reset');
  };

  const share = async () => {
    if (state.prioritized.length === 0) {
      showToast('Add some priorities first!', 'info');
      return;
    }
    
    const itemsToShare = state.prioritized.length <= 10 
      ? state.prioritized 
      : state.prioritized.slice(0, 10);
    
    const date = new Date().toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
    
    const text = `💫 Milena's Top ${itemsToShare.length} Priorities\n` +
      `📅 ${date}\n\n` +
      itemsToShare.map((item, i) => `${i + 1}. ${item.emoji} ${item.label}`).join('\n') +
      (state.prioritized.length > 10 ? `\n\n...and ${state.prioritized.length - 10} more` : '') +
      `\n\n✨ Made with love`;
    
    try {
      await navigator.clipboard.writeText(text);
      showToast('Copied to clipboard!', 'success');
      announce('Copied to clipboard!');
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      showToast('Copied to clipboard!', 'success');
    }
  };

  const lockItIn = () => {
    if (state.prioritized.length === 0) {
      showToast('Add some priorities first!', 'info');
      return;
    }
    setShowConfetti(true);
    setIsLocked(true);
    announce('Locked in! Your priorities are sealed with love.');
  };

  const unlock = () => {
    setIsLocked(false);
    setShowConfetti(false);
    announce('Unlocked! You can continue editing.');
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white/60">Loading...</div>
      </div>
    );
  }

  return (
    <div className="relative z-10 min-h-screen px-4 py-8 md:py-12">
      <Confetti active={showConfetti} />
      <Toast 
        message={toastMessage} 
        visible={toastVisible} 
        variant={toastVariant}
        onHide={() => setToastVisible(false)} 
      />
      
      {/* Screen reader announcer */}
      <div
        ref={announcerRef}
        role="status"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
      />

      <div className="max-w-5xl mx-auto animate-fade-in-up">
        {/* Header */}
        <header className="text-center mb-8 md:mb-12">
          <Button
            variant="secondary"
            size="md"
            onClick={onBack}
            className="mb-6"
            aria-label="Go back to stars"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to stars
          </Button>
          
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-3">
            Priority Board
          </h1>
          <p className="text-white/60 text-lg md:text-xl">
            Choose wisely. Consequences include romance. 💕
          </p>
        </header>

        {/* Decision Card when locked */}
        {isLocked && (
          <DecisionCard 
            items={state.prioritized} 
            onUnlock={unlock}
          />
        )}

        {/* Action buttons */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          <Button
            variant="secondary"
            onClick={randomize}
            disabled={isLocked}
            aria-label="Randomize items"
          >
            🎲 Randomize
          </Button>
          <Button
            variant="secondary"
            onClick={reset}
            aria-label="Reset board"
          >
            🔄 Reset
          </Button>
          <Button
            variant="secondary"
            onClick={share}
            aria-label="Share priorities"
          >
            📋 Share
          </Button>
          <Button
            variant="primary"
            onClick={lockItIn}
            disabled={isLocked || state.prioritized.length === 0}
            aria-label="Lock in your priorities"
          >
            🔒 Lock it in
          </Button>
        </div>

        {/* Add custom item */}
        {!isLocked && (
          <div className="max-w-md mx-auto mb-8">
            <div className="flex gap-2">
              <div className="flex-1">
                <input
                  ref={newItemInputRef}
                  type="text"
                  value={newItemLabel}
                  onChange={(e) => {
                    setNewItemLabel(e.target.value);
                    setAddItemError('');
                  }}
                  onKeyDown={handleAddItemKeyDown}
                  placeholder="Add your own priority..."
                  className={`input-field ${addItemError ? 'input-error' : ''}`}
                  aria-label="New priority item"
                  aria-invalid={!!addItemError}
                  aria-describedby={addItemError ? 'add-item-error' : undefined}
                />
                {addItemError && (
                  <p id="add-item-error" className="error-message animate-shake">
                    {addItemError}
                  </p>
                )}
              </div>
              <Button
                variant="primary"
                size="md"
                onClick={handleAddCustomItem}
                aria-label="Add new item"
              >
                Add
              </Button>
            </div>
          </div>
        )}

        {/* Board columns */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Unprioritized */}
          <section
            className={`glass rounded-2xl p-4 md:p-6 transition-all duration-200 ${
              dragOverList === 'unprioritized' ? 'ring-2 ring-purple-400/50' : ''
            }`}
            onDragOver={(e) => handleDragOver(e, 'unprioritized')}
            onDrop={(e) => handleDrop(e, 'unprioritized')}
            aria-label="Unprioritized items"
          >
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="text-purple-400">📦</span> Unprioritized
              <span className="text-sm font-normal text-white/40">({state.unprioritized.length})</span>
            </h2>
            
            {state.unprioritized.length === 0 ? (
              <p className="text-white/40 text-center py-8 italic">
                All items prioritized! You know what you want. 👏
              </p>
            ) : (
              <ul className="space-y-2" role="listbox">
                {state.unprioritized.map((item, index) => (
                  <li
                    key={item.id}
                    draggable={!isLocked && editingId !== item.id}
                    onDragStart={() => handleDragStart(item, 'unprioritized')}
                    onDragEnd={handleDragEnd}
                    className={`
                      glass-card p-3 flex items-center gap-3 
                      ${!isLocked && editingId !== item.id ? 'cursor-grab active:cursor-grabbing' : ''}
                      animate-slide-in
                      ${draggedItem?.id === item.id ? 'opacity-50' : ''}
                      ${isLocked ? 'opacity-60' : ''}
                    `}
                    style={{ animationDelay: `${index * 0.03}s` }}
                    role="option"
                    aria-selected={false}
                  >
                    <span className="text-xl flex-shrink-0" aria-hidden="true">{item.emoji}</span>
                    
                    {editingId === item.id ? (
                      <div className="flex-1">
                        <input
                          type="text"
                          value={editingLabel}
                          onChange={(e) => {
                            setEditingLabel(e.target.value);
                            setRenameError('');
                          }}
                          onKeyDown={(e) => handleEditKeyDown(e, item)}
                          onBlur={() => saveEdit(item)}
                          className={`input-field text-sm py-1 ${renameError ? 'input-error' : ''}`}
                          autoFocus
                          aria-label={`Rename ${item.label}`}
                        />
                        {renameError && (
                          <p className="error-message animate-shake">{renameError}</p>
                        )}
                      </div>
                    ) : (
                      <span className="flex-1 text-white/90">{item.label}</span>
                    )}
                    
                    {!isLocked && editingId !== item.id && (
                      <div className="flex gap-1">
                        <IconButton
                          onClick={() => startEditing(item)}
                          aria-label={`Rename ${item.label}`}
                          tooltip="Rename"
                        >
                          ✏️
                        </IconButton>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => moveToTop(item)}
                          aria-label={`Add ${item.label} to priorities`}
                        >
                          Add →
                        </Button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Prioritized */}
          <section
            className={`glass rounded-2xl p-4 md:p-6 transition-all duration-200 ${
              dragOverList === 'prioritized' ? 'ring-2 ring-pink-400/50' : ''
            }`}
            onDragOver={(e) => handleDragOver(e, 'prioritized')}
            onDrop={(e) => handleDrop(e, 'prioritized')}
            aria-label="Top priorities"
          >
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="text-pink-400">⭐</span> Top Priorities
              <span className="text-sm font-normal text-white/40">({state.prioritized.length})</span>
              {state.prioritized.length >= 3 && (
                <span 
                  className="tooltip text-xs text-white/40 cursor-help"
                  data-tooltip="Top 3 are highlighted!"
                >
                  ℹ️
                </span>
              )}
            </h2>
            
            {state.prioritized.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-white/40 italic mb-2">
                  Your priorities list is empty
                </p>
                <p className="text-white/30 text-sm">
                  Drag items here or click &quot;Add →&quot; to start
                </p>
              </div>
            ) : (
              <ol className="space-y-2" role="listbox">
                {state.prioritized.map((item, index) => (
                  <li
                    key={item.id}
                    draggable={!isLocked && editingId !== item.id}
                    onDragStart={() => handleDragStart(item, 'prioritized')}
                    onDragEnd={handleDragEnd}
                    onDragOver={(e) => handleDragOver(e, 'prioritized', index)}
                    onDrop={(e) => handleDrop(e, 'prioritized', index)}
                    className={`
                      glass-card p-3 flex items-center gap-3 
                      ${!isLocked && editingId !== item.id ? 'cursor-grab active:cursor-grabbing' : ''}
                      animate-slide-in
                      ${draggedItem?.id === item.id ? 'opacity-50' : ''}
                      ${dragOverIndex === index && draggedItem?.id !== item.id ? 'ring-2 ring-pink-400/50' : ''}
                      ${isLocked ? 'opacity-60' : ''}
                      ${index < 3 ? 'top-priority-item' : ''}
                    `}
                    style={{ animationDelay: `${index * 0.03}s` }}
                    role="option"
                    aria-selected={true}
                  >
                    <span 
                      className={`priority-number ${index < 3 ? 'ring-2 ring-white/30' : ''}`}
                      aria-label={`Priority ${index + 1}`}
                    >
                      {index + 1}
                    </span>
                    <span className="text-xl flex-shrink-0" aria-hidden="true">{item.emoji}</span>
                    
                    {editingId === item.id ? (
                      <div className="flex-1">
                        <input
                          type="text"
                          value={editingLabel}
                          onChange={(e) => {
                            setEditingLabel(e.target.value);
                            setRenameError('');
                          }}
                          onKeyDown={(e) => handleEditKeyDown(e, item)}
                          onBlur={() => saveEdit(item)}
                          className={`input-field text-sm py-1 ${renameError ? 'input-error' : ''}`}
                          autoFocus
                          aria-label={`Rename ${item.label}`}
                        />
                        {renameError && (
                          <p className="error-message animate-shake">{renameError}</p>
                        )}
                      </div>
                    ) : (
                      <span className={`flex-1 ${index < 3 ? 'text-white font-medium' : 'text-white/90'}`}>
                        {item.label}
                      </span>
                    )}
                    
                    {/* Top 3 badges */}
                    {index === 0 && <span className="text-xs" title="First place">🏆</span>}
                    {index === 1 && <span className="text-xs" title="Second place">🥈</span>}
                    {index === 2 && <span className="text-xs" title="Third place">🥉</span>}
                    
                    {!isLocked && editingId !== item.id && (
                      <div className="flex gap-1">
                        <IconButton
                          onClick={() => startEditing(item)}
                          aria-label={`Rename ${item.label}`}
                          tooltip="Rename"
                        >
                          ✏️
                        </IconButton>
                        <IconButton
                          onClick={() => moveUp(index, item)}
                          disabled={index === 0}
                          aria-label={`Move ${item.label} up`}
                          tooltip="Move up"
                        >
                          ↑
                        </IconButton>
                        <IconButton
                          onClick={() => moveDown(index, item)}
                          disabled={index === state.prioritized.length - 1}
                          aria-label={`Move ${item.label} down`}
                          tooltip="Move down"
                        >
                          ↓
                        </IconButton>
                        <IconButton
                          variant="danger"
                          onClick={() => removeFromPrioritized(item)}
                          aria-label={`Remove ${item.label} from priorities`}
                          tooltip="Remove"
                        >
                          ✕
                        </IconButton>
                      </div>
                    )}
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>

        {/* Footer */}
        <footer className="text-center mt-12 text-white/40 text-sm">
          Made with 💝 for Milena • Valentine&apos;s Day 2026
        </footer>
      </div>
    </div>
  );
}
