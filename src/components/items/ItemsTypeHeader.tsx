'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ItemCreateDialog, { type TypeName, SELECTABLE_TYPES } from './ItemCreateDialog';

interface ItemsTypeHeaderProps {
  typeName: string;
  label: string;
  itemCount: number;
}

export default function ItemsTypeHeader({ typeName, label, itemCount }: ItemsTypeHeaderProps) {
  const [createOpen, setCreateOpen] = useState(false);

  const isSelectable = SELECTABLE_TYPES.some((t) => t.name === typeName);
  const typeConfig = SELECTABLE_TYPES.find((t) => t.name === typeName);

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{label}</h1>
          <p className="text-sm text-muted-foreground">
            {itemCount} {itemCount === 1 ? 'item' : 'items'}
          </p>
        </div>

        {isSelectable && (
          <Button
            size="sm"
            onClick={() => setCreateOpen(true)}
            style={typeConfig ? { backgroundColor: typeConfig.color } : undefined}
          >
            <Plus className="h-4 w-4" />
            Add {label.replace(/s$/, '')}
          </Button>
        )}
      </div>

      {isSelectable && (
        <ItemCreateDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          initialType={typeName as TypeName}
        />
      )}
    </>
  );
}
