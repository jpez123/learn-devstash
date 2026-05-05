import { redirect } from 'next/navigation';
import { FolderOpen } from 'lucide-react';
import { auth } from '@/auth';
import { getAllCollections } from '@/lib/db/collections';
import { COLLECTIONS_PER_PAGE } from '@/lib/constants';
import CollectionCard from '@/components/collections/CollectionCard';
import Pagination from '@/components/ui/Pagination';

export default async function CollectionsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? '1', 10) || 1);

  const { collections, total } = await getAllCollections(session.user.id, page, COLLECTIONS_PER_PAGE);
  const totalPages = Math.ceil(total / COLLECTIONS_PER_PAGE);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Collections</h1>
          <p className="text-sm text-muted-foreground">{total} collection{total !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {total === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 text-center">
          <FolderOpen size={32} className="mb-3 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">No collections yet.</p>
          <p className="mt-1 text-xs text-muted-foreground/70">Create a collection to organize your items.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {collections.map((col) => (
              <CollectionCard key={col.id} col={col} />
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} />
        </>
      )}
    </div>
  );
}
