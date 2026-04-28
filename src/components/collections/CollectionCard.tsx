'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import TypeIcon from '@/components/ui/TypeIcon';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import CollectionEditDialog from '@/components/collections/CollectionEditDialog';
import { deleteCollection } from '@/actions/collections';
import type { CollectionWithMeta } from '@/lib/db/collections';

export default function CollectionCard({ col }: { col: CollectionWithMeta }) {
  const router = useRouter();
  const dominantColor = col.dominantType?.color ?? '#6b7280';

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    const result = await deleteCollection(col.id);
    setDeleting(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    setDeleteOpen(false);
    toast.success('Collection deleted');
    router.push('/collections');
    router.refresh();
  }

  return (
    <>
      <div
        className="group relative flex flex-col gap-2 rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent/50 cursor-pointer"
        style={{ borderLeftColor: dominantColor, borderLeftWidth: '3px' }}
        onClick={() => router.push(`/collections/${col.id}`)}
      >
        <div className="flex items-start justify-between gap-2">
          <span className="text-sm font-medium leading-tight text-foreground">{col.name}</span>
          <div className="flex items-center gap-1 shrink-0">
            {col.isFavorite && <Heart size={13} className="fill-pink-400 text-pink-400" />}
            <DropdownMenu>
              <DropdownMenuTrigger
                onClick={(e) => e.stopPropagation()}
                className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground opacity-40 transition-opacity hover:bg-accent hover:text-foreground hover:opacity-100 focus-visible:opacity-100"
              >
                <MoreHorizontal size={14} />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                <DropdownMenuItem
                  className="text-muted-foreground"
                  disabled
                >
                  <Heart size={14} className="mr-2" />
                  Favorite
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setEditOpen(true)}>
                  <Pencil size={14} className="mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => setDeleteOpen(true)}
                >
                  <Trash2 size={14} className="mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">{col.itemCount} items</p>
        {col.description && (
          <p className="line-clamp-2 text-xs text-muted-foreground/80">{col.description}</p>
        )}
        {col.types.length > 0 && (
          <div className="mt-auto flex items-center gap-1.5 pt-1">
            {col.types.map((t) => (
              <TypeIcon key={t.icon} iconName={t.icon} color={t.color} size={14} />
            ))}
          </div>
        )}
      </div>

      <CollectionEditDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        collection={{ id: col.id, name: col.name, description: col.description }}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete &ldquo;{col.name}&rdquo;?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete the collection. Your items will not be deleted — they will just no
              longer belong to this collection.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? 'Deleting…' : 'Delete Collection'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
