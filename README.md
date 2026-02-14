# 💫 Milena's Priority Board

A playful Valentine's Day website where Milena can prioritize life goals and gifts. Features a starry universe background and an interactive priority board with drag-and-drop ordering.

## ✨ Features

- **Starry Landing Page**: Beautiful canvas-based starfield with twinkling stars and parallax effect
- **Floating Heart**: Animated heart that opens to reveal the priority board
- **Priority Board**: Drag-and-drop interface to order items by importance
- **Glassmorphism Design**: Modern, elegant visual style
- **Mobile-First**: Fully responsive, works great on all devices
- **Accessible**: Keyboard navigation, ARIA labels, screen reader support
- **Persistent State**: Saves your priorities to localStorage
- **Fun Interactions**: Randomize, share, and lock-in features with confetti celebration

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm (comes with Node.js)

### Installation

```bash
# Navigate to the project directory
cd valentineswebsite

# Install dependencies
npm install
```

### Development

```bash
# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
# Create production build
npm run build

# Start production server
npm run start
```

## 🎮 How to Use

1. **Landing Page**: Click or tap the floating heart to enter the priority board
2. **Add Priorities**: Drag items from "Unprioritized" to "Top Priorities", or click the "Add" button
3. **Reorder**: Drag items within the priority list, or use the ↑/↓ buttons
4. **Remove**: Click ✕ to remove an item from priorities
5. **Randomize**: Click 🎲 to shuffle items randomly
6. **Share**: Click 📋 to copy your top 5 priorities to clipboard
7. **Lock It In**: Click 🔒 when you're happy with your choices (triggers confetti!)
8. **Reset**: Click 🔄 to start over

## 📁 Project Structure

```
src/
├── app/
│   ├── globals.css      # Tailwind + custom styles & animations
│   ├── layout.tsx       # Root layout with metadata
│   └── page.tsx         # Main page component
└── components/
    ├── Starfield.tsx    # Canvas-based starry background
    ├── Heart.tsx        # Animated floating heart
    ├── PriorityBoard.tsx # Main drag-and-drop board
    └── Confetti.tsx     # Confetti celebration effect
```

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State**: React useState + localStorage
- **No External Dependencies**: Stars and confetti are generated procedurally

## 💡 Customization

### Change Items

Edit the `INITIAL_ITEMS` array in `src/components/PriorityBoard.tsx`:

```typescript
const INITIAL_ITEMS = [
  { id: '1', text: 'Your Item', emoji: '✨' },
  // ...add more
];
```

### Change Title/Copy

Edit the text in `src/app/page.tsx` for the landing page, or `src/components/PriorityBoard.tsx` for the board header.

### Change Colors

Edit the CSS variables in `src/app/globals.css`:

```css
:root {
  --accent-pink: #ff6b9d;
  --accent-purple: #c084fc;
  --accent-gold: #ffd700;
}
```

## 📱 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile Safari (iOS 14+)
- Chrome for Android

## 💝 Made with Love

Happy Valentine's Day, Milena! 💕
