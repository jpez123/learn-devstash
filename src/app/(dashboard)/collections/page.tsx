import { redirect } from 'next/navigation';
import { FolderOpen } from 'lucide-react';
import { auth } from '@/auth';
import { getAllCollections } from '@/lib/db/collections';
import CollectionCard from '@/components/collections/CollectionCard';

export default async function CollectionsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  const collections = await getAllCollections(session.user.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Collections</h1>
          <p className="text-sm text-muted-foreground">{collections.length} collection{collections.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {collections.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 text-center">
          <FolderOpen size={32} className="mb-3 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">No collections yet.</p>
          <p className="mt-1 text-xs text-muted-foreground/70">Create a collection to organize your items.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((col) => (
            <CollectionCard key={col.id} col={col} />
          ))}
        </div>
      )}
    </div>
  );
}
