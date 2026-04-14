'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import ItemDrawer from './ItemDrawer';

interface ItemDrawerContextType {
  openDrawer: (itemId: string) => void;
}

const ItemDrawerContext = createContext<ItemDrawerContextType | null>(null);

export function ItemDrawerProvider({ children }: { children: React.ReactNode }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const openDrawer = useCallback((itemId: string) => setSelectedId(itemId), []);
  const closeDrawer = useCallback(() => setSelectedId(null), []);

  return (
    <ItemDrawerContext.Provider value={{ openDrawer }}>
      {children}
      <ItemDrawer itemId={selectedId} onClose={closeDrawer} />
    </ItemDrawerContext.Provider>
  );
}

export function useItemDrawer() {
  const ctx = useContext(ItemDrawerContext);
  if (!ctx) throw new Error('useItemDrawer must be used within ItemDrawerProvider');
  return ctx;
}
