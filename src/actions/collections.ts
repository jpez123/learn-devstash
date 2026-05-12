'use server';

import { z } from 'zod';
import { auth } from '@/auth';
import {
  createCollection as createCollectionDb,
  updateCollection as updateCollectionDb,
  deleteCollection as deleteCollectionDb,
  toggleFavoriteCollection as toggleFavoriteCollectionDb,
  getUserCollections,
} from '@/lib/db/collections';
import type { CollectionDetail, CollectionSummary } from '@/lib/db/collections';

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; code?: string };

const createCollectionSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  description: z.string().trim().nullish().transform((v) => v ?? null),
});

export async function createCollection(formData: {
  name: string;
  description?: string | null;
}): Promise<ActionResult<CollectionDetail>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized' };
  }

  const parsed = createCollectionSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Validation error' };
  }

  try {
    const collection = await createCollectionDb(session.user.id, parsed.data);
    return { success: true, data: collection };
  } catch (e) {
    if (e instanceof Error && e.message.startsWith('Free tier limit reached')) {
      return { success: false, error: e.message, code: 'FREE_TIER_LIMIT' };
    }
    return { success: false, error: 'Failed to create collection' };
  }
}

const updateCollectionSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  description: z.string().trim().nullish().transform((v) => v ?? null),
});

export async function updateCollection(
  id: string,
  formData: { name: string; description?: string | null }
): Promise<ActionResult<CollectionDetail>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized' };
  }

  const parsed = updateCollectionSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Validation error' };
  }

  try {
    const collection = await updateCollectionDb(id, session.user.id, parsed.data);
    if (!collection) return { success: false, error: 'Collection not found' };
    return { success: true, data: collection };
  } catch {
    return { success: false, error: 'Failed to update collection' };
  }
}

export async function deleteCollection(id: string): Promise<ActionResult<null>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const deleted = await deleteCollectionDb(id, session.user.id);
    if (!deleted) return { success: false, error: 'Collection not found' };
    return { success: true, data: null };
  } catch {
    return { success: false, error: 'Failed to delete collection' };
  }
}

export async function toggleFavoriteCollection(id: string): Promise<ActionResult<{ isFavorite: boolean }>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const isFavorite = await toggleFavoriteCollectionDb(id, session.user.id);
    if (isFavorite === null) {
      return { success: false, error: 'Collection not found or access denied' };
    }
    return { success: true, data: { isFavorite } };
  } catch {
    return { success: false, error: 'Failed to update favorite' };
  }
}

export async function getCollections(): Promise<ActionResult<CollectionSummary[]>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const collections = await getUserCollections(session.user.id);
    return { success: true, data: collections };
  } catch {
    return { success: false, error: 'Failed to fetch collections' };
  }
}
