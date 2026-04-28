'use server';

import { z } from 'zod';
import { auth } from '@/auth';
import { createCollection as createCollectionDb, getUserCollections } from '@/lib/db/collections';
import type { CollectionDetail, CollectionSummary } from '@/lib/db/collections';

type ActionResult<T> = { success: true; data: T } | { success: false; error: string };

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
  } catch {
    return { success: false, error: 'Failed to create collection' };
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
