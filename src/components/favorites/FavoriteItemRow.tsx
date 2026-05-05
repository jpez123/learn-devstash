'use client';

import { useItemDrawer } from '@/components/items/ItemDrawerProvider';
import TypeIcon from '@/components/ui/TypeIcon';
import type { ItemWithMeta } from '@/lib/db/items';

export default function FavoriteItemRow({ item }: { item: ItemWithMeta }) {
  const { openDrawer } = useItemDrawer();

  const date = new Date(item.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <button
      onClick={() => openDrawer(item.id)}
      className="flex w-full items-center gap-3 border-b border-border/40 px-3 py-2 text-left last:border-b-0 hover:bg-muted/40 transition-colors"
    >
      <TypeIcon iconName={item.itemType.icon} color={item.itemType.color} size={14} />
      <span className="flex-1 truncate font-mono text-sm text-foreground">{item.title}</span>
      <span
        className="shrink-0 rounded px-1.5 py-0.5 font-mono text-[10px]"
        style={{ color: item.itemType.color, backgroundColor: `${item.itemType.color}1a` }}
      >
        {item.itemType.name}
      </span>
      <span className="shrink-0 font-mono text-[11px] text-muted-foreground/70 tabular-nums">
        {date}
      </span>
    </button>
  );
}
