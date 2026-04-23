'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { updateItem, deleteItem } from '@/actions/items';
import type { ItemDetail } from '@/lib/db/items';

export type EditState = {
  title: string;
  description: string;
  content: string;
  url: string;
  language: string;
  tags: string;
};

const EMPTY_EDIT_STATE: EditState = {
  title: '',
  description: '',
  content: '',
  url: '',
  language: '',
  tags: '',
};

export function useEditMode({
  itemId,
  item,
  onItemUpdated,
  onClose,
}: {
  itemId: string | null;
  item: ItemDetail | null;
  onItemUpdated: (id: string, data: ItemDetail) => void;
  onClose: () => void;
}) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editState, setEditState] = useState<EditState>(EMPTY_EDIT_STATE);
  const [saving, setSaving] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isEditMode = editingId === itemId;

  function enterEditMode() {
    if (!item || !itemId) return;
    setEditState({
      title: item.title,
      description: item.description ?? '',
      content: item.content ?? '',
      url: item.url ?? '',
      language: item.language ?? '',
      tags: item.tags.join(', '),
    });
    setEditingId(itemId);
  }

  function cancelEdit() {
    setEditingId(null);
  }

  async function handleSave() {
    if (!item || !itemId) return;
    setSaving(true);

    const tags = editState.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const result = await updateItem(itemId, {
      title: editState.title,
      description: editState.description || null,
      content: editState.content || null,
      url: editState.url || null,
      language: editState.language || null,
      tags,
    });

    setSaving(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    onItemUpdated(itemId, result.data);
    setEditingId(null);
    toast.success('Item updated');
    router.refresh();
  }

  async function handleDelete() {
    if (!itemId) return;
    setDeleting(true);
    const result = await deleteItem(itemId);
    setDeleting(false);
    setDeleteDialogOpen(false);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success('Item deleted');
    onClose();
    router.refresh();
  }

  return {
    isEditMode,
    editState,
    setEditState,
    saving,
    deleteDialogOpen,
    setDeleteDialogOpen,
    deleting,
    enterEditMode,
    cancelEdit,
    handleSave,
    handleDelete,
  };
}
