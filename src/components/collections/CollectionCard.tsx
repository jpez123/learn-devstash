import Link from 'next/link';
import { Star } from 'lucide-react';
import { mockCollections, mockItemTypes } from '@/lib/mock-data';
import TypeIcon from '@/components/ui/TypeIcon';

type MockCollection = (typeof mockCollections)[number];

export default function CollectionCard({ col }: { col: MockCollection }) {
  const type = mockItemTypes.find((t) => t.id === col.dominantTypeId);
  const dominantColor = type?.color ?? '#6b7280';

  return (
    <Link
      href={`/collections/${col.id}`}
      className="group flex flex-col gap-2 rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent/50"
      style={{ borderLeftColor: dominantColor, borderLeftWidth: '3px' }}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-sm font-medium leading-tight text-foreground">{col.name}</span>
        {col.isFavorite && <Star size={13} className="shrink-0 fill-yellow-400 text-yellow-400" />}
      </div>
      <p className="text-xs text-muted-foreground">{col.itemCount} items</p>
      {col.description && (
        <p className="line-clamp-2 text-xs text-muted-foreground/80">{col.description}</p>
      )}
      {type && (
        <div className="mt-auto pt-1">
          <TypeIcon iconName={type.icon} color={type.color} size={14} />
        </div>
      )}
    </Link>
  );
}
