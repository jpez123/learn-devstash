'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
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
import { deleteCollection, toggleFavoriteCollection } from '@/actions/collections';

interface CollectionActionsProps {
  collection: { id: string; name: string; description: string | null; isFavorite: boolean };
}

export default function CollectionActions({ collection }: CollectionActionsProps) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isFavorite, setIsFavorite] = useState(collection.isFavorite);
  const [togglingFavorite, setTogglingFavorite] = useState(false);

  async function handleFavorite() {
    setTogglingFavorite(true);
    const result = await toggleFavoriteCollection(collection.id);
    setTogglingFavorite(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    setIsFavorite(result.data.isFavorite);
    router.refresh();
  }

  async function handleDelete() {
    setDeleting(true);
    const result = await deleteCollection(collection.id);
    setDeleting(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    setDeleteOpen(false);
    toast.success('Collection deleted');
    router.push('/collections');
  }

  return (
    <>
      <div className="flex items-center gap-1.5 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-pink-400"
          aria-label="Favorite"
          onClick={handleFavorite}
          disabled={togglingFavorite}
        >
          <Heart
            size={16}
            className={isFavorite ? 'fill-pink-400 text-pink-400' : ''}
          />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          aria-label="Edit"
          onClick={() => setEditOpen(true)}
        >
          <Pencil size={16} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
          aria-label="Delete"
          onClick={() => setDeleteOpen(true)}
        >
          <Trash2 size={16} />
        </Button>
      </div>

      <CollectionEditDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        collection={collection}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete &ldquo;{collection.name}&rdquo;?</AlertDialogTitle>
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
