'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Sheet,
  SheetContent,
} from '@/components/ui/sheet';
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
import { useItemData } from '@/hooks/useItemData';
import { useEditMode } from '@/hooks/useEditMode';
import ItemDrawerHeader from './ItemDrawerHeader';
import ItemDrawerActionBar from './ItemDrawerActionBar';
import EditModeSection from './EditModeSection';
import ViewModeSection from './ViewModeSection';
import { toggleFavoriteItem, toggleItemPin } from '@/actions/items';

interface ItemDrawerProps {
  itemId: string | null;
  onClose: () => void;
}

function DrawerSkeleton() {
  return (
    <div className="flex flex-col gap-5 p-5 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-md bg-accent" />
        <div className="h-5 w-40 rounded bg-accent" />
        <div className="ml-2 h-5 w-16 rounded bg-accent" />
      </div>
      <div className="flex gap-2 border-y border-border py-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-7 w-16 rounded bg-accent" />
        ))}
      </div>
      <div className="space-y-2">
        <div className="h-3 w-20 rounded bg-accent" />
        <div className="h-4 w-full rounded bg-accent" />
        <div className="h-4 w-3/4 rounded bg-accent" />
      </div>
      <div className="space-y-2">
        <div className="h-3 w-10 rounded bg-accent" />
        <div className="flex gap-1.5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-5 w-12 rounded bg-accent" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ItemDrawer({ itemId, onClose }: ItemDrawerProps) {
  const router = useRouter();
  const { item, loading, setLoadState } = useItemData(itemId);

  async function handleFavorite() {
    if (!item) return;
    const result = await toggleFavoriteItem(item.id);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    setLoadState({ id: item.id, data: { ...item, isFavorite: result.data.isFavorite } });
    router.refresh();
  }

  async function handlePin() {
    if (!item) return;
    const result = await toggleItemPin(item.id);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    setLoadState({ id: item.id, data: { ...item, isPinned: result.data.isPinned } });
    router.refresh();
  }

  const {
    isEditMode,
    editState,
    setEditState,
    saving,
    deleteDialogOpen,
    setDeleteDialogOpen,
    deleting,
    availableCollections,
    enterEditMode,
    cancelEdit,
    handleSave,
    handleDelete,
  } = useEditMode({
    itemId,
    item,
    onItemUpdated: (id, data) => setLoadState({ id, data }),
    onClose,
  });

  return (
    <>
      <Sheet open={!!itemId} onOpenChange={(open) => { if (!open) onClose(); }}>
        <SheetContent side="right" className="w-full !max-w-2xl overflow-y-auto p-0" showCloseButton>
          {loading || (itemId && !item) ? (
            <DrawerSkeleton />
          ) : item ? (
            <div className="flex flex-col gap-0">
              <ItemDrawerHeader
                item={item}
                isEditMode={isEditMode}
                editTitle={editState.title}
                onTitleChange={(v) => setEditState((s) => ({ ...s, title: v }))}
              />
              <ItemDrawerActionBar
                item={item}
                isEditMode={isEditMode}
                saving={saving}
                editTitleEmpty={!editState.title.trim()}
                onSave={handleSave}
                onCancelEdit={cancelEdit}
                onEdit={enterEditMode}
                onDelete={() => setDeleteDialogOpen(true)}
                onFavorite={handleFavorite}
                onPin={handlePin}
              />
              <div className="flex flex-col gap-5 px-5 py-5">
                {isEditMode ? (
                  <EditModeSection
                    typeName={item.itemType.name}
                    editState={editState}
                    availableCollections={availableCollections}
                    onChange={(field, value) => setEditState((s) => ({ ...s, [field]: value }))}
                    onCollectionIdsChange={(ids) => setEditState((s) => ({ ...s, collectionIds: ids }))}
                  />
                ) : (
                  <ViewModeSection item={item} />
                )}
              </div>
            </div>
          ) : null}
        </SheetContent>
      </Sheet>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete &ldquo;{item?.title}&rdquo;?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The item will be permanently deleted and removed from all collections.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? 'Deleting…' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
