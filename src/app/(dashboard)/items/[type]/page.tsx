import { notFound } from 'next/navigation';
import { auth } from '@/auth';
import { getItemsByType } from '@/lib/db/items';
import ItemCard from '@/components/items/ItemCard';
import ItemsTypeHeader from '@/components/items/ItemsTypeHeader';

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
}: {
  params: Promise<{ type: string }>;
}) {
  const { type } = await params;

  if (!VALID_TYPE_SLUGS.includes(type)) notFound();

  const session = await auth();
  if (!session?.user?.id) notFound();

  const typeName = slugToTypeName(type);
  const items = await getItemsByType(session.user.id, typeName);

  return (
    <div className="space-y-6">
      <ItemsTypeHeader typeName={typeName} label={slugToLabel(type)} itemCount={items.length} />

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 text-center">
          <p className="text-sm text-muted-foreground">No {type} yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
