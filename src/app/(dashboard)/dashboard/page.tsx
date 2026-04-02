import Link from 'next/link';
import { Package, FolderOpen, Star, Heart, Pin } from 'lucide-react';
import { mockItems, mockItemTypeCounts } from '@/lib/mock-data';
import { prisma } from '@/lib/prisma';
import { getRecentCollections } from '@/lib/db/collections';
import StatsCard from '@/components/dashboard/StatsCard';
import CollectionCard from '@/components/collections/CollectionCard';
import ItemRow from '@/components/items/ItemRow';

const DEMO_EMAIL = 'demo@devstash.io';

export default async function DashboardPage() {
  const demoUser = await prisma.user.findUnique({ where: { email: DEMO_EMAIL } });

  const [collections, totalItems, favoriteItems] = demoUser
    ? await Promise.all([
        getRecentCollections(demoUser.id),
        prisma.item.count({ where: { userId: demoUser.id } }),
        prisma.item.count({ where: { userId: demoUser.id, isFavorite: true } }),
      ])
    : [[], Object.values(mockItemTypeCounts).reduce((a, b) => a + b, 0), 0];

  const totalCollections = demoUser
    ? await prisma.collection.count({ where: { userId: demoUser.id } })
    : 0;

  const favoriteCollections = collections.filter((c) => c.isFavorite).length;

  const pinnedItems = mockItems.filter((i) => i.isPinned);
  const recentItems = [...mockItems]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Your developer knowledge hub</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatsCard label="Items" value={totalItems} icon={<Package size={16} className="text-blue-400" />} />
        <StatsCard label="Collections" value={totalCollections} icon={<FolderOpen size={16} className="text-purple-400" />} />
        <StatsCard label="Favorite Items" value={favoriteItems} icon={<Star size={16} className="text-yellow-400" />} />
        <StatsCard label="Favorite Collections" value={favoriteCollections} icon={<Heart size={16} className="text-pink-400" />} />
      </div>

      {/* Collections */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">Collections</h2>
          <Link href="/collections" className="text-xs text-muted-foreground transition-colors hover:text-foreground">
            View all
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((col) => (
            <CollectionCard key={col.id} col={col} />
          ))}
        </div>
      </section>

      {/* Pinned Items */}
      {pinnedItems.length > 0 && (
        <section>
          <div className="mb-3 flex items-center gap-2">
            <Pin size={14} className="text-muted-foreground" />
            <h2 className="text-base font-semibold text-foreground">Pinned</h2>
          </div>
          <div className="divide-y divide-border overflow-hidden rounded-lg border border-border">
            {pinnedItems.map((item) => (
              <ItemRow key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}

      {/* Recent Items */}
      <section>
        <div className="mb-3">
          <h2 className="text-base font-semibold text-foreground">Recent Items</h2>
        </div>
        <div className="divide-y divide-border overflow-hidden rounded-lg border border-border">
          {recentItems.map((item) => (
            <ItemRow key={item.id} item={item} />
          ))}
        </div>
      </section>
    </div>
  );
}
