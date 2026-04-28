'use client';

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Folder } from 'lucide-react';
import {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from '@/components/ui/command';
import TypeIcon from '@/components/ui/TypeIcon';
import { useSearch } from '@/context/SearchContext';
import { useItemDrawer } from '@/components/items/ItemDrawerProvider';

export default function CommandPalette() {
  const { open, setOpen, data } = useSearch();
  const { openDrawer } = useItemDrawer();
  const router = useRouter();

  const handleOpenChange = useCallback(
    (value: boolean) => setOpen(value),
    [setOpen]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(true);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [setOpen]);

  function handleSelectItem(itemId: string) {
    setOpen(false);
    openDrawer(itemId);
  }

  function handleSelectCollection(collectionId: string) {
    setOpen(false);
    router.push(`/collections/${collectionId}`);
  }

  return (
    <CommandDialog open={open} onOpenChange={handleOpenChange}>
      <Command filter={(value, search) =>
        value.toLowerCase().includes(search.toLowerCase()) ? 1 : 0
      }>
      <CommandInput placeholder="Search items and collections..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        {data.items.length > 0 && (
          <CommandGroup heading="Items">
            {data.items.map((item) => (
              <CommandItem
                key={item.id}
                value={`${item.title} ${item.itemType.name}`}
                onSelect={() => handleSelectItem(item.id)}
              >
                <TypeIcon
                  iconName={item.itemType.icon}
                  color={item.itemType.color}
                  size={14}
                />
                <span className="truncate">{item.title}</span>
                {item.contentPreview && (
                  <span className="ml-1 truncate text-xs text-muted-foreground">
                    — {item.contentPreview}
                  </span>
                )}
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {data.items.length > 0 && data.collections.length > 0 && (
          <CommandSeparator />
        )}

        {data.collections.length > 0 && (
          <CommandGroup heading="Collections">
            {data.collections.map((col) => (
              <CommandItem
                key={col.id}
                value={col.name}
                onSelect={() => handleSelectCollection(col.id)}
              >
                <Folder className="text-muted-foreground" size={14} />
                <span className="truncate">{col.name}</span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {col.itemCount} {col.itemCount === 1 ? 'item' : 'items'}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
      </Command>
    </CommandDialog>
  );
}
