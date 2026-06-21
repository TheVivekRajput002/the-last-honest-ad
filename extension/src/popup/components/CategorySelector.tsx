import React from 'react';
import { useExtensionStore } from '../../store/useExtensionStore';

const CATEGORIES = [
  { id: 'fast-fashion', label: 'Fast Fashion' },
  { id: 'electronics', label: 'Electronics' },
  { id: 'flights', label: 'Flights' },
  { id: 'fast-food', label: 'Fast Food' },
  { id: 'delivery', label: 'Delivery' },
  { id: 'home-goods', label: 'Home Goods' },
];

export default function CategorySelector() {
  const { suggestedCategory, selectedCategory, setSelectedCategory } = useExtensionStore();

  return (
    <div className="grid grid-cols-2 gap-2">
      {CATEGORIES.map((cat) => {
        const isSelected = selectedCategory === cat.id;
        const isSuggested = suggestedCategory === cat.id;
        
        return (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`
              relative py-2 px-3 text-sm rounded transition-all text-left font-medium
              ${isSelected 
                ? 'bg-ink text-paper shadow-sm' 
                : 'bg-white border border-ink/10 hover:border-ink/30 hover:bg-white/50 text-ink'}
            `}
          >
            {cat.label}
            {isSuggested && !isSelected && (
              <span className="absolute -top-2 -right-2 w-3 h-3 bg-ad-coral rounded-full animate-pulse" />
            )}
          </button>
        );
      })}
    </div>
  );
}
