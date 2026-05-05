'use client';

import { useState } from 'react';
import Link from "next/link";
import { Search, Plus, Package, Menu, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "./SidebarProvider";
import { useSearch } from "@/context/SearchContext";
import ItemCreateDialog from "@/components/items/ItemCreateDialog";
import CollectionCreateDialog from "@/components/collections/CollectionCreateDialog";

export default function TopBar() {
  const { toggleMobile } = useSidebar();
  const { setOpen: openSearch } = useSearch();
  const [createOpen, setCreateOpen] = useState(false);
  const [createCollectionOpen, setCreateCollectionOpen] = useState(false);

  return (
    <>
      <header className="flex h-14 shrink-0 items-center border-b border-border px-4 gap-4">
        {/* Left: hamburger (mobile only) + Logo + name */}
        <div className="flex items-center gap-2 w-48 shrink-0">
          <button
            onClick={toggleMobile}
            className="md:hidden text-muted-foreground hover:text-foreground p-1"
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
              <Package className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="hidden font-semibold text-foreground sm:block">DevStash</span>
          </Link>
        </div>

        {/* Center: Search trigger */}
        <div className="flex flex-1 items-center justify-center">
          <button
            onClick={() => openSearch(true)}
            className="flex h-8 w-full max-w-sm items-center gap-2 rounded-md border-0 bg-muted/50 px-3 text-sm text-muted-foreground hover:bg-muted/80 transition-colors"
          >
            <Search className="h-4 w-4 shrink-0" />
            <span className="flex-1 text-left">Search items...</span>
            <kbd className="hidden sm:inline-flex h-5 items-center gap-0.5 rounded border border-border bg-background px-1.5 text-[10px] font-medium">
              <span>⌘</span>K
            </kbd>
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 w-48 justify-end shrink-0">
          <Link href="/favorites" className="hidden sm:flex items-center justify-center h-8 w-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors" aria-label="Favorites">
            <Star className="h-4 w-4" />
          </Link>
          <Button size="sm" variant="outline" className="hidden sm:flex" onClick={() => setCreateCollectionOpen(true)}>
            New Collection
          </Button>
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New Item</span>
          </Button>
        </div>
      </header>

      <ItemCreateDialog open={createOpen} onOpenChange={setCreateOpen} />
      <CollectionCreateDialog open={createCollectionOpen} onOpenChange={setCreateCollectionOpen} />
    </>
  );
}
