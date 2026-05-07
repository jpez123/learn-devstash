'use client';

import { useState } from 'react';
import { Star, Copy, Check } from 'lucide-react';
import TypeIcon from '@/components/ui/TypeIcon';
import { useItemDrawer } from '@/components/items/ItemDrawerProvider';
import { ItemWithMeta } from '@/lib/db/items';

function formatDate(date: Date) {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const TEXT_TYPES = ['snippet', 'prompt', 'command', 'note'];

export default function ItemRow({ item }: { item: ItemWithMeta }) {
  const { itemType } = item;
  const { openDrawer } = useItemDrawer();
  const [copied, setCopied] = useState(false);

  const copyValue = itemType.name === 'link' ? item.url : TEXT_TYPES.includes(itemType.name) ? item.content : null;

  async function handleCopy(e: React.MouseEvent) {
    e.stopPropagation();
    if (!copyValue) return;
    await navigator.clipboard.writeText(copyValue);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => openDrawer(item.id)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openDrawer(item.id); } }}
      className="group flex cursor-pointer items-center gap-3 bg-card px-4 py-3 transition-colors hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      style={{ borderLeftColor: itemType.color, borderLeftWidth: '3px', borderLeftStyle: 'solid' }}
    >
      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md"
        style={{ backgroundColor: `${itemType.color}25` }}
      >
        <TypeIcon iconName={itemType.icon} color={itemType.color} size={15} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-medium text-foreground">{item.title}</span>
          {item.isFavorite && <Star size={12} className="shrink-0 fill-yellow-400 text-yellow-400" />}
          <span
            className="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium"
            style={{ backgroundColor: `${itemType.color}25`, color: itemType.color }}
          >
            {itemType.name}
          </span>
        </div>
        {item.description && (
          <p className="mt-0.5 truncate text-xs text-muted-foreground">{item.description}</p>
        )}
        {item.tags.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
            {item.tags.map((tag) => (
              <span key={tag} className="rounded bg-accent px-1.5 py-0.5 text-[10px] text-muted-foreground">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {copyValue && (
          <button
            onClick={handleCopy}
            className="hidden group-hover:flex items-center justify-center rounded p-0.5 text-muted-foreground hover:text-foreground transition-colors"
            title="Copy"
          >
            {copied ? <Check size={13} className="text-green-400" /> : <Copy size={13} />}
          </button>
        )}
        <span className="text-xs text-muted-foreground">{formatDate(item.createdAt)}</span>
      </div>
    </div>
  );
}
