'use client';

import TypeIcon from '@/components/ui/TypeIcon';
import { SheetHeader, SheetTitle } from '@/components/ui/sheet';
import type { ItemDetail } from '@/lib/db/items';

interface ItemDrawerHeaderProps {
  item: ItemDetail;
  isEditMode: boolean;
  editTitle: string;
  onTitleChange: (value: string) => void;
}

export default function ItemDrawerHeader({ item, isEditMode, editTitle, onTitleChange }: ItemDrawerHeaderProps) {
  return (
    <SheetHeader className="border-b border-border px-5 pb-4 pt-5">
      <div className="flex items-start gap-3 pr-8">
        <div
          className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md"
          style={{ backgroundColor: `${item.itemType.color}25` }}
        >
          <TypeIcon iconName={item.itemType.icon} color={item.itemType.color} size={17} />
        </div>
        <div className="min-w-0 flex-1">
          {isEditMode ? (
            <input
              className="w-full rounded border border-border bg-background px-2 py-1 text-base font-semibold leading-tight focus:outline-none focus:ring-1 focus:ring-ring"
              value={editTitle}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder="Title"
            />
          ) : (
            <SheetTitle className="text-base font-semibold leading-tight">
              {item.title}
            </SheetTitle>
          )}
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            <span
              className="rounded px-2 py-0.5 text-[11px] font-medium"
              style={{ backgroundColor: `${item.itemType.color}25`, color: item.itemType.color }}
            >
              {item.itemType.name}
            </span>
            {!isEditMode && item.language && (
              <span className="rounded bg-accent px-2 py-0.5 text-[11px] text-muted-foreground">
                {item.language}
              </span>
            )}
          </div>
        </div>
      </div>
    </SheetHeader>
  );
}
