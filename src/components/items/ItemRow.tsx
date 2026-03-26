import { Star } from 'lucide-react';
import { mockItems, mockItemTypes } from '@/lib/mock-data';
import TypeIcon from '@/components/ui/TypeIcon';

type MockItem = (typeof mockItems)[number];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function ItemRow({ item }: { item: MockItem }) {
  const type = mockItemTypes.find((t) => t.id === item.itemTypeId);

  return (
    <div className="flex cursor-pointer items-center gap-3 bg-card px-4 py-3 transition-colors hover:bg-accent/50">
      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md"
        style={{ backgroundColor: type ? `${type.color}25` : undefined }}
      >
        {type && <TypeIcon iconName={type.icon} color={type.color} size={15} />}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-medium text-foreground">{item.title}</span>
          {item.isFavorite && <Star size={12} className="shrink-0 fill-yellow-400 text-yellow-400" />}
          {type && (
            <span
              className="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium"
              style={{ backgroundColor: `${type.color}25`, color: type.color }}
            >
              {type.name}
            </span>
          )}
        </div>
        {item.description && (
          <p className="mt-0.5 truncate text-xs text-muted-foreground">{item.description}</p>
        )}
        {item.tags.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
            {item.tags.map((tag) => (
              <span key={tag} className="rounded bg-accent px-1.5 py-0.5 text-[10px] text-muted-foreground">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <span className="shrink-0 text-xs text-muted-foreground">{formatDate(item.createdAt)}</span>
    </div>
  );
}
