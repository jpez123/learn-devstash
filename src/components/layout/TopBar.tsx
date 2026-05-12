'use client';

import { useState } from 'react';
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Plus, Package, Menu, Star, FolderPlus, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSidebar } from "./SidebarProvider";
import { useSearch } from "@/context/SearchContext";
import ItemCreateDialog from "@/components/items/ItemCreateDialog";
import CollectionCreateDialog from "@/components/collections/CollectionCreateDialog";

export default function TopBar({ isPro }: { isPro: boolean }) {
  const { toggleMobile } = useSidebar();
  const { setOpen: openSearch } = useSearch();
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const [createCollectionOpen, setCreateCollectionOpen] = useState(false);

  return (
    <>
      <header className="flex h-14 shrink-0 items-center border-b border-border px-4 gap-4">
        {/* Left: hamburger (mobile only) + Logo */}
        <div className="flex items-center gap-2 shrink-0">
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
            className="flex h-8 w-full max-w-lg items-center gap-2 rounded-md border-0 bg-muted/50 px-3 text-sm text-muted-foreground hover:bg-muted/80 transition-colors"
          >
            <Search className="h-4 w-4 shrink-0" />
            <span className="flex-1 text-left">Search items...</span>
            <kbd className="hidden lg:inline-flex h-5 items-center gap-0.5 rounded border border-border bg-background px-1.5 text-[10px] font-medium">
              <span>⌘</span>K
            </kbd>
          </button>
        </div>

        {/* Right: Actions — full on desktop, collapsed on mobile */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Desktop actions */}
          {!isPro && (
            <Link href="/upgrade">
              <Button size="sm" variant="ghost" className="hidden sm:flex text-muted-foreground hover:text-foreground gap-1">
                <Zap className="h-3.5 w-3.5" />
                Upgrade
              </Button>
            </Link>
          )}
          <Link
            href="/favorites"
            className="hidden sm:flex items-center justify-center h-8 w-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            aria-label="Favorites"
          >
            <Star className="h-4 w-4" />
          </Link>
          <Button size="sm" variant="outline" className="hidden sm:flex" onClick={() => setCreateCollectionOpen(true)}>
            New Collection
          </Button>
          <Button size="sm" className="hidden sm:flex" onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            New Item
          </Button>

          {/* Mobile actions dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="sm:hidden inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
              <Plus className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setCreateOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Item
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setCreateCollectionOpen(true)}>
                <FolderPlus className="h-4 w-4 mr-2" />
                New Collection
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/favorites')}>
                <Star className="h-4 w-4 mr-2" />
                Favorites
              </DropdownMenuItem>
              {!isPro && (
                <DropdownMenuItem onClick={() => router.push('/upgrade')}>
                  <Zap className="h-4 w-4 mr-2" />
                  Upgrade
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <ItemCreateDialog open={createOpen} onOpenChange={setCreateOpen} />
      <CollectionCreateDialog open={createCollectionOpen} onOpenChange={setCreateCollectionOpen} />
    </>
  );
}
