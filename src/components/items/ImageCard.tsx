'use client';

import { Star, Image as ImageIcon } from 'lucide-react';
import { useItemDrawer } from '@/components/items/ItemDrawerProvider';
import { ItemWithMeta } from '@/lib/db/items';

export default function ImageCard({ item }: { item: ItemWithMeta }) {
  const { openDrawer } = useItemDrawer();
  const src = item.fileUrl ? `/api/download?key=${encodeURIComponent(item.fileUrl)}` : null;

  return (
    <div
      onClick={() => openDrawer(item.id)}
      className="group cursor-pointer overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-border/80"
    >
      <div className="relative aspect-video overflow-hidden bg-accent/30">
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={item.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <ImageIcon size={32} className="text-muted-foreground/40" />
          </div>
        )}
        {item.isFavorite && (
          <div className="absolute right-2 top-2">
            <Star size={13} className="fill-yellow-400 text-yellow-400 drop-shadow" />
          </div>
        )}
      </div>

      <div className="px-3 py-2.5">
        <p className="truncate text-sm font-medium text-foreground">{item.title}</p>
        {item.description && (
          <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{item.description}</p>
        )}
      </div>
    </div>
  );
}
