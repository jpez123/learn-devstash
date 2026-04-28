'use client';

import { FolderOpen } from 'lucide-react';
import type { CollectionSummary } from '@/lib/db/collections';

interface CollectionPickerProps {
  collections: CollectionSummary[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

export default function CollectionPicker({ collections, selectedIds, onChange }: CollectionPickerProps) {
  if (collections.length === 0) {
    return (
      <p className="text-[12px] text-muted-foreground/60 italic">No collections yet.</p>
    );
  }

  function toggle(id: string) {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((s) => s !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  }

  return (
    <div className="flex max-h-36 flex-col gap-1 overflow-y-auto pr-1">
      {collections.map((col) => {
        const checked = selectedIds.includes(col.id);
        return (
          <label
            key={col.id}
            className="flex cursor-pointer items-center gap-2.5 rounded px-2 py-1.5 text-sm transition-colors hover:bg-accent"
          >
            <input
              type="checkbox"
              checked={checked}
              onChange={() => toggle(col.id)}
              className="h-3.5 w-3.5 accent-primary"
            />
            <FolderOpen size={13} className="shrink-0 text-muted-foreground/70" />
            <span className="truncate">{col.name}</span>
          </label>
        );
      })}
    </div>
  );
}
