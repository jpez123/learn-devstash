import { notFound } from 'next/navigation';
import { auth } from '@/auth';
import { getItemsByType } from '@/lib/db/items';
import { ITEMS_PER_PAGE } from '@/lib/constants';
import ItemCard from '@/components/items/ItemCard';
import ImageCard from '@/components/items/ImageCard';
import FileListRow from '@/components/items/FileListRow';
import ItemsTypeHeader from '@/components/items/ItemsTypeHeader';
import Pagination from '@/components/ui/Pagination';

const VALID_TYPE_SLUGS = ['snippets', 'prompts', 'commands', 'notes', 'files', 'images', 'links'];

function slugToTypeName(slug: string): string {
  // e.g. "snippets" → "snippet", "links" → "link"
  return slug.replace(/s$/, '');
}

function slugToLabel(slug: string): string {
  return slug.charAt(0).toUpperCase() + slug.slice(1);
}

export default async function ItemsTypePage({
  params,
  searchParams,
}: {
  params: Promise<{ type: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const [{ type }, { page: pageParam }] = await Promise.all([params, searchParams]);

  if (!VALID_TYPE_SLUGS.includes(type)) notFound();

  const session = await auth();
  if (!session?.user?.id) notFound();

  const page = Math.max(1, parseInt(pageParam ?? '1', 10) || 1);
  const typeName = slugToTypeName(type);
  const { items, total } = await getItemsByType(session.user.id, typeName, page, ITEMS_PER_PAGE);
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">
      <ItemsTypeHeader typeName={typeName} label={slugToLabel(type)} itemCount={total} />

      {total === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 text-center">
          <p className="text-sm text-muted-foreground">No {type} yet.</p>
        </div>
      ) : typeName === 'image' ? (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <ImageCard key={item.id} item={item} />
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} />
        </>
      ) : typeName === 'file' ? (
        <>
          <div className="flex flex-col gap-2">
            {items.map((item) => (
              <FileListRow key={item.id} item={item} />
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} />
        </>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} />
        </>
      )}
    </div>
  );
}
