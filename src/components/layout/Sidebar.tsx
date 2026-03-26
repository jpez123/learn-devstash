'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  Link as LinkIcon,
  File,
  Image,
  Star,
  Settings,
  X,
  PanelLeft,
  ChevronDown,
  type LucideProps,
} from 'lucide-react';
import { mockItemTypes, mockCollections, mockItemTypeCounts, mockUser } from '@/lib/mock-data';
import { useSidebar } from './SidebarProvider';

type IconComponent = React.ComponentType<LucideProps>;

const ICON_MAP: Record<string, IconComponent> = {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  Link: LinkIcon,
  File,
  Image,
};

function TypeIcon({ iconName, color }: { iconName: string; color: string }) {
  const Icon = ICON_MAP[iconName] ?? File;
  return <Icon size={15} style={{ color }} />;
}

function UserAvatar({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('');
  return (
    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
      {initials}
    </div>
  );
}

function SidebarInner({ collapsed }: { collapsed: boolean }) {
  const [typesOpen, setTypesOpen] = useState(true);
  const [collectionsOpen, setCollectionsOpen] = useState(true);

  const favoriteCollections = mockCollections.filter((c) => c.isFavorite);
  const recentCollections = mockCollections.filter((c) => !c.isFavorite).slice(0, 3);

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
          {mockItemTypes.map((type) => {
            const count = mockItemTypeCounts[type.id] ?? 0;
            const slug = type.name.toLowerCase() + 's';
            return (
              <Link
                key={type.id}
                href={`/items/${slug}`}
                className="flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                title={collapsed ? `${type.name}s` : undefined}
              >
                <TypeIcon iconName={type.icon} color={type.color} />
                {!collapsed && (
                  <>
                    <span className="flex-1">{type.name}s</span>
                    <span className="text-xs text-muted-foreground">{count}</span>
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
            {/* Collapsible Collections heading */}
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
                <p className="mb-1 mt-2 px-2 text-[11px] text-muted-foreground">Favorites</p>
                <nav className="space-y-0.5">
                  {favoriteCollections.map((col) => (
                    <Link
                      key={col.id}
                      href={`/collections/${col.id}`}
                      className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    >
                      <span className="flex-1 truncate">{col.name}</span>
                      <Star size={11} className="shrink-0 fill-yellow-400 text-yellow-400" />
                    </Link>
                  ))}
                </nav>

                {/* All Collections */}
                <p className="mb-1 mt-3 px-2 text-[11px] text-muted-foreground">All Collections</p>
                <nav className="space-y-0.5">
                  {recentCollections.map((col) => (
                    <Link
                      key={col.id}
                      href={`/collections/${col.id}`}
                      className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    >
                      <span className="flex-1 truncate">{col.name}</span>
                      <span className="text-xs text-muted-foreground">{col.itemCount}</span>
                    </Link>
                  ))}
                </nav>
              </>
            )}
          </div>
        </>
      )}

      {/* User area */}
      <div className="mt-auto border-t border-border p-3">
        {collapsed ? (
          <div className="flex justify-center">
            <UserAvatar name={mockUser.name} />
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <UserAvatar name={mockUser.name} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{mockUser.name}</p>
              <p className="truncate text-xs text-muted-foreground">{mockUser.email}</p>
            </div>
            <button className="shrink-0 text-muted-foreground hover:text-foreground">
              <Settings size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Sidebar() {
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
        <SidebarInner collapsed={isCollapsed} />
      </aside>

      {/* Mobile drawer */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 md:hidden transition-opacity duration-300 ${
          isMobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeMobile}
      />
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
          <SidebarInner collapsed={false} />
        </div>
      </aside>
    </>
  );
}
