'use server';

import { z } from 'zod';
import { auth } from '@/auth';
import { createItem as createItemDb, updateItem as updateItemDb, deleteItem as deleteItemDb } from '@/lib/db/items';
import type { ItemDetail } from '@/lib/db/items';

const CREATABLE_TYPES = ['snippet', 'prompt', 'command', 'note', 'link', 'file', 'image'] as const;

const createItemSchema = z.object({
  typeName: z.enum(CREATABLE_TYPES),
  title: z.string().trim().min(1, 'Title is required'),
  description: z.string().trim().nullish().transform((v) => v ?? null),
  content: z.string().nullish().transform((v) => v ?? null),
  url: z.string().nullish().transform((v) => v || null).pipe(
    z.string().url('Invalid URL').nullable()
  ),
  language: z.string().trim().nullish().transform((v) => v ?? null),
  tags: z.array(z.string().trim().min(1)),
  fileUrl: z.string().nullish().transform((v) => v ?? null),
  fileName: z.string().nullish().transform((v) => v ?? null),
  fileSize: z.number().nullish().transform((v) => v ?? null),
});

export async function createItem(formData: {
  typeName: string;
  title: string;
  description?: string | null;
  content?: string | null;
  url?: string | null;
  language?: string | null;
  tags: string[];
  fileUrl?: string | null;
  fileName?: string | null;
  fileSize?: number | null;
}): Promise<ActionResult<ItemDetail>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized' };
  }

  const parsed = createItemSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Validation error' };
  }

  try {
    const item = await createItemDb(session.user.id, parsed.data);
    return { success: true, data: item };
  } catch {
    return { success: false, error: 'Failed to create item' };
  }
}

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

  try {
    const updated = await updateItemDb(itemId, session.user.id, parsed.data);
    if (!updated) {
      return { success: false, error: 'Item not found or access denied' };
    }
    return { success: true, data: updated };
  } catch {
    return { success: false, error: 'Failed to update item' };
  }
}

export async function deleteItem(itemId: string): Promise<ActionResult<null>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const deleted = await deleteItemDb(itemId, session.user.id);
    if (!deleted) {
      return { success: false, error: 'Item not found or access denied' };
    }
    return { success: true, data: null };
  } catch {
    return { success: false, error: 'Failed to delete item' };
  }
}
