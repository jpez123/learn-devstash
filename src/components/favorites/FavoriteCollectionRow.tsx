'use client';

import Link from 'next/link';
import { Folder } from 'lucide-react';
import type { FavoriteCollection } from '@/lib/db/collections';

export default function FavoriteCollectionRow({ col }: { col: FavoriteCollection }) {
  const date = new Date(col.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <Link
      href={`/collections/${col.id}`}
      className="flex items-center gap-3 border-b border-border/40 px-3 py-2 last:border-b-0 hover:bg-muted/40 transition-colors"
    >
      <Folder size={14} className="shrink-0 text-muted-foreground" />
      <span className="flex-1 truncate font-mono text-sm text-foreground">{col.name}</span>
      <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
        {col.itemCount} item{col.itemCount !== 1 ? 's' : ''}
      </span>
      <span className="shrink-0 font-mono text-[11px] text-muted-foreground/70 tabular-nums">
        {date}
      </span>
    </Link>
  );
}
