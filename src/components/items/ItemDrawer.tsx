'use client';

import { useEffect, useState } from 'react';
import { Star, Pin, Copy, Pencil, Trash2, FolderOpen, Calendar } from 'lucide-react';
import TypeIcon from '@/components/ui/TypeIcon';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import type { ItemDetail } from '@/lib/db/items';

interface ItemDrawerProps {
  itemId: string | null;
  onClose: () => void;
}

function DrawerSkeleton() {
  return (
    <div className="flex flex-col gap-5 p-5 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-md bg-accent" />
        <div className="h-5 w-40 rounded bg-accent" />
        <div className="ml-2 h-5 w-16 rounded bg-accent" />
      </div>
      <div className="flex gap-2 border-y border-border py-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-7 w-16 rounded bg-accent" />
        ))}
      </div>
      <div className="space-y-2">
        <div className="h-3 w-20 rounded bg-accent" />
        <div className="h-4 w-full rounded bg-accent" />
        <div className="h-4 w-3/4 rounded bg-accent" />
      </div>
      <div className="space-y-2">
        <div className="h-3 w-10 rounded bg-accent" />
        <div className="flex gap-1.5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-5 w-12 rounded bg-accent" />
          ))}
        </div>
      </div>
    </div>
  );
}

function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function ItemDrawer({ itemId, onClose }: ItemDrawerProps) {
  const [item, setItem] = useState<ItemDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!itemId) {
      setItem(null);
      return;
    }
    setLoading(true);
    setItem(null);
    fetch(`/api/items/${itemId}`)
      .then((r) => r.json())
      .then((data) => setItem(data))
      .finally(() => setLoading(false));
  }, [itemId]);

  return (
    <Sheet open={!!itemId} onOpenChange={(open) => { if (!open) onClose(); }}>
      <SheetContent side="right" className="w-full !max-w-2xl overflow-y-auto p-0" showCloseButton>
        {loading || (itemId && !item) ? (
          <DrawerSkeleton />
        ) : item ? (
          <div className="flex flex-col gap-0">
            {/* Header */}
            <SheetHeader className="border-b border-border px-5 pb-4 pt-5">
              <div className="flex items-start gap-3 pr-8">
                <div
                  className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md"
                  style={{ backgroundColor: `${item.itemType.color}25` }}
                >
                  <TypeIcon iconName={item.itemType.icon} color={item.itemType.color} size={17} />
                </div>
                <div className="min-w-0 flex-1">
                  <SheetTitle className="text-base font-semibold leading-tight">
                    {item.title}
                  </SheetTitle>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    <span
                      className="rounded px-2 py-0.5 text-[11px] font-medium"
                      style={{ backgroundColor: `${item.itemType.color}25`, color: item.itemType.color }}
                    >
                      {item.itemType.name}
                    </span>
                    {item.language && (
                      <span className="rounded bg-accent px-2 py-0.5 text-[11px] text-muted-foreground">
                        {item.language}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </SheetHeader>

            {/* Action bar */}
            <div className="flex items-center gap-1 border-b border-border px-4 py-2">
              <ActionButton
                icon={<Star size={14} className={item.isFavorite ? 'fill-yellow-400 text-yellow-400' : ''} />}
                label="Favorite"
                active={item.isFavorite}
                activeColor="text-yellow-400"
              />
              <ActionButton
                icon={<Pin size={14} className={item.isPinned ? 'fill-foreground' : ''} />}
                label="Pin"
                active={item.isPinned}
              />
              <ActionButton icon={<Copy size={14} />} label="Copy" />
              <ActionButton icon={<Pencil size={14} />} label="Edit" />
              <div className="ml-auto">
                <ActionButton icon={<Trash2 size={14} />} label="Delete" danger />
              </div>
            </div>

            {/* Body */}
            <div className="flex flex-col gap-5 px-5 py-5">
              {/* Description */}
              {item.description && (
                <section>
                  <SectionLabel>Description</SectionLabel>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                </section>
              )}

              {/* Content */}
              {item.content && (
                <section>
                  <SectionLabel>Content</SectionLabel>
                  <pre className="overflow-x-auto rounded-md bg-accent/60 p-4 text-xs leading-relaxed text-foreground whitespace-pre-wrap break-words">
                    <code>{item.content}</code>
                  </pre>
                </section>
              )}

              {/* Tags */}
              {item.tags.length > 0 && (
                <section>
                  <SectionLabel>Tags</SectionLabel>
                  <div className="flex flex-wrap gap-1.5">
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-accent px-2.5 py-1 text-xs text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {/* Collections */}
              {item.collections.length > 0 && (
                <section>
                  <SectionLabel>Collections</SectionLabel>
                  <div className="flex flex-col gap-1">
                    {item.collections.map((col) => (
                      <div key={col.id} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <FolderOpen size={13} className="shrink-0" />
                        <span>{col.name}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Details */}
              <section>
                <SectionLabel>Details</SectionLabel>
                <div className="flex flex-col gap-1.5 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar size={13} className="shrink-0" />
                    <span className="text-xs text-muted-foreground/70">Created</span>
                    <span className="ml-auto text-xs">{formatDate(item.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={13} className="shrink-0" />
                    <span className="text-xs text-muted-foreground/70">Updated</span>
                    <span className="ml-auto text-xs">{formatDate(item.updatedAt)}</span>
                  </div>
                </div>
              </section>
            </div>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
      {children}
    </p>
  );
}

function ActionButton({
  icon,
  label,
  active,
  activeColor,
  danger,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  activeColor?: string;
  danger?: boolean;
}) {
  return (
    <button
      className={[
        'flex cursor-pointer items-center gap-1.5 rounded px-2.5 py-1.5 text-xs transition-colors',
        danger
          ? 'text-muted-foreground hover:bg-destructive/10 hover:text-destructive'
          : active
          ? `text-foreground hover:bg-accent ${activeColor ?? ''}`
          : 'text-muted-foreground hover:bg-accent hover:text-foreground',
      ].join(' ')}
    >
      {icon}
      {label}
    </button>
  );
}
