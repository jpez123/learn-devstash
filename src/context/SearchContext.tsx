'use client';

import { createContext, useContext, useState } from 'react';
import type { SearchData } from '@/lib/db/search';

interface SearchContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
  data: SearchData;
}

const SearchContext = createContext<SearchContextType | null>(null);

export function SearchProvider({
  data,
  children,
}: {
  data: SearchData;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <SearchContext.Provider value={{ open, setOpen, data }}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const ctx = useContext(SearchContext);
  if (!ctx) throw new Error('useSearch must be used within SearchProvider');
  return ctx;
}
