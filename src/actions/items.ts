'use server';

import { z } from 'zod';
import { auth } from '@/auth';
import { updateItem as updateItemDb, deleteItem as deleteItemDb } from '@/lib/db/items';
import type { ItemDetail } from '@/lib/db/items';

const updateItemSchema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  description: z.string().trim().nullish().transform((v) => v ?? null),
  content: z.string().nullish().transform((v) => v ?? null),
  url: z.string().nullish().transform((v) => v || null).pipe(
    z.string().url('Invalid URL').nullable()
  ),
  language: z.string().trim().nullish().transform((v) => v ?? null),
  tags: z.array(z.string().trim().min(1)),
});

type ActionResult<T> = { success: true; data: T } | { success: false; error: string };

export async function updateItem(
  itemId: string,
  formData: {
    title: string;
    description?: string | null;
    content?: string | null;
    url?: string | null;
    language?: string | null;
    tags: string[];
  }
): Promise<ActionResult<ItemDetail>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized' };
  }

  const parsed = updateItemSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Validation error' };
  }

  const updated = await updateItemDb(itemId, session.user.id, parsed.data);
  if (!updated) {
    return { success: false, error: 'Item not found or access denied' };
  }

  return { success: true, data: updated };
}

export async function deleteItem(itemId: string): Promise<ActionResult<null>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized' };
  }

  const deleted = await deleteItemDb(itemId, session.user.id);
  if (!deleted) {
    return { success: false, error: 'Item not found or access denied' };
  }

  return { success: true, data: null };
}
