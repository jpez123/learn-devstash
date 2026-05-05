'use client';

import { useState, useMemo } from 'react';
import type { ItemWithMeta } from '@/lib/db/items';
import type { FavoriteCollection } from '@/lib/db/collections';
import FavoriteItemRow from './FavoriteItemRow';
import FavoriteCollectionRow from './FavoriteCollectionRow';

type SortDir = 'asc' | 'desc';
type ItemSortKey = 'date' | 'name' | 'type';
type CollectionSortKey = 'date' | 'name';

interface SortState<T extends string> {
  key: T;
  dir: SortDir;
}

function SortButton<T extends string>({
  label,
  value,
  state,
  onSort,
}: {
  label: string;
  value: T;
  state: SortState<T>;
  onSort: (key: T, dir: SortDir) => void;
}) {
  const active = state.key === value;
  const arrow = state.dir === 'asc' ? '↑' : '↓';

  function handleClick() {
    if (active) {
      onSort(value, state.dir === 'asc' ? 'desc' : 'asc');
    } else {
      onSort(value, 'asc');
    }
  }

  return (
    <button
      onClick={handleClick}
      className={`font-mono text-[11px] px-2 py-0.5 rounded transition-colors ${
        active
          ? 'bg-muted text-foreground'
          : 'text-muted-foreground hover:text-foreground'
      }`}
    >
      {label}{active ? ` ${arrow}` : ''}
    </button>
  );
}

interface Props {
  items: ItemWithMeta[];
  collections: FavoriteCollection[];
}

export default function FavoritesSortedList({ items, collections }: Props) {
  const [itemSort, setItemSort] = useState<SortState<ItemSortKey>>({ key: 'date', dir: 'desc' });
  const [collectionSort, setCollectionSort] = useState<SortState<CollectionSortKey>>({ key: 'date', dir: 'desc' });

  const sortedItems = useMemo(() => {
    const mul = itemSort.dir === 'asc' ? 1 : -1;
    return [...items].sort((a, b) => {
      if (itemSort.key === 'name') return mul * a.title.localeCompare(b.title);
      if (itemSort.key === 'type') return mul * a.itemType.name.localeCompare(b.itemType.name);
      return mul * (new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime());
    });
  }, [items, itemSort]);

  const sortedCollections = useMemo(() => {
    const mul = collectionSort.dir === 'asc' ? 1 : -1;
    return [...collections].sort((a, b) => {
      if (collectionSort.key === 'name') return mul * a.name.localeCompare(b.name);
      return mul * (new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime());
    });
  }, [collections, collectionSort]);

  return (
    <div className="space-y-6">
      {items.length > 0 && (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Items ({items.length})
            </h2>
            <div className="flex items-center gap-1">
              <SortButton label="Date" value="date" state={itemSort} onSort={(key, dir) => setItemSort({ key, dir })} />
              <SortButton label="Name" value="name" state={itemSort} onSort={(key, dir) => setItemSort({ key, dir })} />
              <SortButton label="Type" value="type" state={itemSort} onSort={(key, dir) => setItemSort({ key, dir })} />
            </div>
          </div>
          <div className="overflow-hidden rounded-md border border-border/60">
            {sortedItems.map((item) => (
              <FavoriteItemRow key={item.id} item={item} />
            ))}
          </div>
        </div>
      )}

      {collections.length > 0 && (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Collections ({collections.length})
            </h2>
            <div className="flex items-center gap-1">
              <SortButton label="Date" value="date" state={collectionSort} onSort={(key, dir) => setCollectionSort({ key, dir })} />
              <SortButton label="Name" value="name" state={collectionSort} onSort={(key, dir) => setCollectionSort({ key, dir })} />
            </div>
          </div>
          <div className="overflow-hidden rounded-md border border-border/60">
            {sortedCollections.map((col) => (
              <FavoriteCollectionRow key={col.id} col={col} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
