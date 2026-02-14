// Item model with full types
export interface Item {
  id: string;
  label: string;
  emoji: string;
  createdAt: number;
  updatedAt: number;
}

export interface BoardState {
  unprioritized: Item[];
  prioritized: Item[];
  version: number;
}

export const STORAGE_KEY = 'milena-priority-board-v2';

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Check if localStorage is available
function isLocalStorageAvailable(): boolean {
  if (!isBrowser) return false;
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

export function loadBoardState(defaultState: BoardState): BoardState {
  if (!isLocalStorageAvailable()) {
    return defaultState;
  }
  
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return defaultState;
    
    const parsed = JSON.parse(saved) as BoardState;
    
    // Validate structure
    if (!Array.isArray(parsed.unprioritized) || !Array.isArray(parsed.prioritized)) {
      return defaultState;
    }
    
    // Migrate old items if needed (add timestamps if missing)
    const migrateItem = (item: Partial<Item> & { text?: string }): Item => ({
      id: item.id || crypto.randomUUID(),
      label: item.label || item.text || 'Unknown',
      emoji: item.emoji || '✨',
      createdAt: item.createdAt || Date.now(),
      updatedAt: item.updatedAt || Date.now(),
    });
    
    return {
      unprioritized: parsed.unprioritized.map(migrateItem),
      prioritized: parsed.prioritized.map(migrateItem),
      version: parsed.version || 1,
    };
  } catch {
    return defaultState;
  }
}

export function saveBoardState(state: BoardState): boolean {
  if (!isLocalStorageAvailable()) {
    return false;
  }
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

export function clearBoardState(): boolean {
  if (!isLocalStorageAvailable()) {
    return false;
  }
  
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}

// Check for duplicate labels
export function isDuplicateLabel(label: string, items: Item[], excludeId?: string): boolean {
  const normalizedLabel = label.trim().toLowerCase();
  return items.some(
    item => item.id !== excludeId && item.label.trim().toLowerCase() === normalizedLabel
  );
}

// Create a new item
export function createItem(label: string, emoji: string = '✨'): Item {
  const now = Date.now();
  return {
    id: crypto.randomUUID(),
    label: label.trim(),
    emoji,
    createdAt: now,
    updatedAt: now,
  };
}

// Update an item's label
export function updateItemLabel(item: Item, newLabel: string): Item {
  return {
    ...item,
    label: newLabel.trim(),
    updatedAt: Date.now(),
  };
}
