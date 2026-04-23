'use client';

import { useEffect, useState } from 'react';
import type { ItemDetail } from '@/lib/db/items';

export function useItemData(itemId: string | null) {
  const [loadState, setLoadState] = useState<{ id: string; data: ItemDetail | null } | null>(null);

  useEffect(() => {
    if (!itemId) return;
    let active = true;
    fetch(`/api/items/${itemId}`)
      .then((r) => r.json())
      .then((data) => { if (active) setLoadState({ id: itemId, data }); })
      .catch(() => { if (active) setLoadState({ id: itemId, data: null }); });
    return () => { active = false; };
  }, [itemId]);

  const item = loadState?.id === itemId ? loadState.data : null;
  const loading = !!itemId && loadState?.id !== itemId;

  return { item, loading, setLoadState };
}
