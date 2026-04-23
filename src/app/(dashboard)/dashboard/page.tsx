import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Package, FolderOpen, Star, Heart, Pin } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { getRecentCollections } from '@/lib/db/collections';
import { getPinnedItems, getRecentItems } from '@/lib/db/items';
import StatsCard from '@/components/dashboard/StatsCard';
import CollectionCard from '@/components/collections/CollectionCard';
import ItemRow from '@/components/items/ItemRow';

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const userId = session.user.id;

  const [collections, totalItems, favoriteItems, totalCollections, pinnedItems, recentItems] =
    await Promise.all([
      getRecentCollections(userId),
      prisma.item.count({ where: { userId } }),
      prisma.item.count({ where: { userId, isFavorite: true } }),
      prisma.collection.count({ where: { userId } }),
      getPinnedItems(userId),
      getRecentItems(userId),
    ]);

  const favoriteCollections = collections.filter((c) => c.isFavorite).length;

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
