import { notFound, redirect } from 'next/navigation';
import { Heart } from 'lucide-react';
import { auth } from '@/auth';
import { getCollectionWithItems } from '@/lib/db/collections';
import { COLLECTIONS_PER_PAGE } from '@/lib/constants';
import TypeIcon from '@/components/ui/TypeIcon';
import ItemCard from '@/components/items/ItemCard';
import ImageCard from '@/components/items/ImageCard';
import FileListRow from '@/components/items/FileListRow';
import CollectionActions from '@/components/collections/CollectionActions';
import Pagination from '@/components/ui/Pagination';

export default async function CollectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const [{ id }, { page: pageParam }] = await Promise.all([params, searchParams]);
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  const page = Math.max(1, parseInt(pageParam ?? '1', 10) || 1);
  const collection = await getCollectionWithItems(id, session.user.id, page, COLLECTIONS_PER_PAGE);
  if (!collection) notFound();

  const totalPages = Math.ceil(collection.itemCount / COLLECTIONS_PER_PAGE);

  const imageItems = collection.items.filter((i) => i.itemType.name === 'image');
  const fileItems = collection.items.filter((i) => i.itemType.name === 'file');
  const otherItems = collection.items.filter(
    (i) => i.itemType.name !== 'image' && i.itemType.name !== 'file'
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="truncate text-2xl font-bold text-foreground">{collection.name}</h1>
            {collection.isFavorite && (
              <Heart size={16} className="shrink-0 fill-pink-400 text-pink-400" />
            )}
          </div>
          {collection.description && (
            <p className="mt-1 text-sm text-muted-foreground">{collection.description}</p>
          )}
          <div className="mt-2 flex items-center gap-3">
            <span className="text-xs text-muted-foreground">
              {collection.itemCount} item{collection.itemCount !== 1 ? 's' : ''}
            </span>
            {collection.types.length > 0 && (
              <div className="flex items-center gap-1.5">
                {collection.types.map((t) => (
                  <TypeIcon key={t.icon} iconName={t.icon} color={t.color} size={14} />
                ))}
              </div>
            )}
          </div>
        </div>
        <CollectionActions
          collection={{
            id: collection.id,
            name: collection.name,
            description: collection.description,
            isFavorite: collection.isFavorite,
          }}
        />
      </div>

      {collection.itemCount === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 text-center">
          <p className="text-sm text-muted-foreground">No items in this collection yet.</p>
        </div>
      ) : (
        <>
          <div className="space-y-6">
            {imageItems.length > 0 && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {imageItems.map((item) => (
                  <ImageCard key={item.id} item={item} />
                ))}
              </div>
            )}

            {fileItems.length > 0 && (
              <div className="flex flex-col gap-2">
                {fileItems.map((item) => (
                  <FileListRow key={item.id} item={item} />
                ))}
              </div>
            )}

            {otherItems.length > 0 && (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                {otherItems.map((item) => (
                  <ItemCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </div>
          <Pagination page={page} totalPages={totalPages} />
        </>
      )}
    </div>
  );
}
