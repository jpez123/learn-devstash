import { redirect } from 'next/navigation';
import { Star } from 'lucide-react';
import { auth } from '@/auth';
import { getFavoriteItems } from '@/lib/db/items';
import { getFavoriteCollections } from '@/lib/db/collections';
import FavoriteItemRow from '@/components/favorites/FavoriteItemRow';
import FavoriteCollectionRow from '@/components/favorites/FavoriteCollectionRow';

export default async function FavoritesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  const [items, collections] = await Promise.all([
    getFavoriteItems(session.user.id),
    getFavoriteCollections(session.user.id),
  ]);

  const isEmpty = items.length === 0 && collections.length === 0;
  const total = items.length + collections.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Favorites</h1>
        <p className="text-sm text-muted-foreground">
          {total} favorited
        </p>
      </div>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 text-center">
          <Star size={32} className="mb-3 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">No favorites yet.</p>
          <p className="mt-1 text-xs text-muted-foreground/70">
            Star items or collections to save them here.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {items.length > 0 && (
            <div>
              <h2 className="mb-2 font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Items ({items.length})
              </h2>
              <div className="overflow-hidden rounded-md border border-border/60">
                {items.map((item) => (
                  <FavoriteItemRow key={item.id} item={item} />
                ))}
              </div>
            </div>
          )}

          {collections.length > 0 && (
            <div>
              <h2 className="mb-2 font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Collections ({collections.length})
              </h2>
              <div className="overflow-hidden rounded-md border border-border/60">
                {collections.map((col) => (
                  <FavoriteCollectionRow key={col.id} col={col} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
