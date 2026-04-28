'use client';

import { useState } from 'react';
import Link from "next/link";
import { Search, Plus, Package, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSidebar } from "./SidebarProvider";
import ItemCreateDialog from "@/components/items/ItemCreateDialog";
import CollectionCreateDialog from "@/components/collections/CollectionCreateDialog";

export default function TopBar() {
  const { toggleMobile } = useSidebar();
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

        {/* Center: Search */}
        <div className="flex flex-1 items-center justify-center">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search items..."
              className="h-8 w-full bg-muted/50 border-0 pl-8 focus-visible:ring-1"
            />
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 w-48 justify-end shrink-0">
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
