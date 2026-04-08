'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { Heart, Settings, X, PanelLeft, ChevronDown, LogOut, User } from 'lucide-react';
import { useSidebar } from './SidebarProvider';
import TypeIcon from '@/components/ui/TypeIcon';
import UserAvatar from '@/components/ui/UserAvatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { ItemTypeWithCount } from '@/lib/db/items';
import type { SidebarCollection } from '@/lib/db/collections';

type SidebarProps = {
  itemTypes: ItemTypeWithCount[];
  sidebarCollections: { favorites: SidebarCollection[]; recents: SidebarCollection[] };
  user: { name: string; email: string; image: string | null };
};

function SidebarInner({
  collapsed,
  itemTypes,
  sidebarCollections,
  user,
}: { collapsed: boolean } & SidebarProps) {
  const router = useRouter();
  const [typesOpen, setTypesOpen] = useState(true);
  const [collectionsOpen, setCollectionsOpen] = useState(true);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Types */}
      <div className="px-2 py-3">
        {!collapsed && (
          <button
            onClick={() => setTypesOpen((prev) => !prev)}
            className="mb-1 flex w-full items-center gap-1 px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground"
          >
            <span className="flex-1 text-left">Types</span>
            <ChevronDown
              size={11}
              className={`transition-transform duration-150 ${typesOpen ? '' : '-rotate-90'}`}
            />
          </button>
        )}
        {(collapsed || typesOpen) && (
          <nav className="space-y-0.5">
            {itemTypes.map((type) => {
              const slug = type.name.toLowerCase() + 's';
              return (
                <Link
                  key={type.id}
                  href={`/items/${slug}`}
                  className="flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  title={collapsed ? `${type.name.charAt(0).toUpperCase() + type.name.slice(1)}s` : undefined}
                >
                  <TypeIcon iconName={type.icon} color={type.color} size={15} />
                  {!collapsed && (
                    <>
                      <span>{type.name.charAt(0).toUpperCase() + type.name.slice(1)}s</span>
                      {(type.name === 'file' || type.name === 'image') && (
                        <Badge variant="outline" className="h-4 rounded px-1 text-[9px] font-semibold leading-none text-muted-foreground">
                          PRO
                        </Badge>
                      )}
                      <span className="ml-auto text-xs text-muted-foreground">{type.count}</span>
                    </>
                  )}
                </Link>
              );
            })}
          </nav>
        )}
      </div>

      {/* Collections — only shown when sidebar is expanded */}
      {!collapsed && (
        <>
          <div className="mx-3 border-t border-border" />
          <div className="flex-1 overflow-y-auto px-2 py-3">
            <button
              onClick={() => setCollectionsOpen((prev) => !prev)}
              className="mb-1 flex w-full items-center gap-1 px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground"
            >
              <span className="flex-1 text-left">Collections</span>
              <ChevronDown
                size={11}
                className={`transition-transform duration-150 ${collectionsOpen ? '' : '-rotate-90'}`}
              />
            </button>

            {collectionsOpen && (
              <>
                {/* Favorites */}
                {sidebarCollections.favorites.length > 0 && (
                  <>
                    <p className="mb-1 mt-2 px-2 text-[11px] text-muted-foreground">Favorites</p>
                    <nav className="space-y-0.5">
                      {sidebarCollections.favorites.map((col) => (
                        <Link
                          key={col.id}
                          href={`/collections/${col.id}`}
                          className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                        >
                          <span className="flex-1 truncate">{col.name}</span>
                          <Heart size={11} className="shrink-0 fill-pink-400 text-pink-400" />
                        </Link>
                      ))}
                    </nav>
                  </>
                )}

                {/* Recent Collections */}
                {sidebarCollections.recents.length > 0 && (
                  <>
                    <p className="mb-1 mt-3 px-2 text-[11px] text-muted-foreground">Recent</p>
                    <nav className="space-y-0.5">
                      {sidebarCollections.recents.map((col) => (
                        <Link
                          key={col.id}
                          href={`/collections/${col.id}`}
                          className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                        >
                          {col.dominantType && (
                            <span
                              className="h-2 w-2 shrink-0 rounded-full"
                              style={{ backgroundColor: col.dominantType.color }}
                            />
                          )}
                          <span className="flex-1 truncate">{col.name}</span>
                        </Link>
                      ))}
                    </nav>
                  </>
                )}

                {/* View all collections */}
                <Link
                  href="/collections"
                  className="mt-2 flex w-full items-center rounded-md px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
                >
                  View all collections →
                </Link>
              </>
            )}
          </div>
        </>
      )}

      {/* User area */}
      <div className="mt-auto border-t border-border p-3">
        <DropdownMenu>
          <DropdownMenuTrigger
            className={`flex w-full rounded-md p-1 hover:bg-accent ${collapsed ? 'justify-center' : 'items-center gap-2'}`}
          >
            <UserAvatar name={user.name} image={user.image} size={28} />
            {!collapsed && (
              <>
                <div className="min-w-0 flex-1 text-left">
                  <p className="truncate text-sm font-medium">{user.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                </div>
                <Settings size={14} className="shrink-0 text-muted-foreground" />
              </>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" className="w-48">
            <DropdownMenuItem
              className="flex items-center gap-2"
              onClick={() => router.push('/profile')}
            >
              <User size={14} />
              Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              className="flex items-center gap-2"
              onClick={() => signOut({ redirectTo: '/sign-in' })}
            >
              <LogOut size={14} />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

export default function Sidebar({ itemTypes, sidebarCollections, user }: SidebarProps) {
  const { isCollapsed, isMobileOpen, closeMobile, toggleCollapsed } = useSidebar();

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={`hidden shrink-0 flex-col border-r border-border transition-all duration-200 md:flex ${
          isCollapsed ? 'w-12' : 'w-56'
        }`}
      >
        {/* Collapse toggle — desktop only */}
        <div
          className={`flex shrink-0 border-b border-border px-2 py-2 ${
            isCollapsed ? 'justify-center' : 'justify-end'
          }`}
        >
          <button
            onClick={toggleCollapsed}
            className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <PanelLeft size={15} className={`transition-transform duration-200 ${isCollapsed ? 'rotate-180' : ''}`} />
          </button>
        </div>
        <SidebarInner
          collapsed={isCollapsed}
          itemTypes={itemTypes}
          sidebarCollections={sidebarCollections}
          user={user}
        />
      </aside>

      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 md:hidden transition-opacity duration-300 ${
          isMobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeMobile}
      />
      {/* Mobile drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-background md:hidden transition-transform duration-300 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-border px-3 py-2">
          <span className="text-sm font-semibold">Navigation</span>
          <button onClick={closeMobile} className="text-muted-foreground hover:text-foreground">
            <X size={16} />
          </button>
        </div>
        <div className="flex-1 overflow-hidden">
          <SidebarInner
            collapsed={false}
            itemTypes={itemTypes}
            sidebarCollections={sidebarCollections}
            user={user}
          />
        </div>
      </aside>
    </>
  );
}
