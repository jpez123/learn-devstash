'use server';

import { z } from 'zod';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import type { EditorPreferences } from '@/types/editor';

const editorPreferencesSchema = z.object({
  fontSize: z.number().int().min(8).max(32),
  tabSize: z.number().int().min(1).max(8),
  wordWrap: z.boolean(),
  minimap: z.boolean(),
  theme: z.enum(['vs-dark', 'monokai', 'github-dark']),
});

export async function updateEditorPreferences(prefs: EditorPreferences) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: 'Not authenticated' };

  const parsed = editorPreferencesSchema.safeParse(prefs);
  if (!parsed.success) return { success: false, error: 'Invalid preferences' };

  await prisma.user.update({
    where: { id: session.user.id },
    data: { editorPreferences: parsed.data },
  });

  return { success: true };
}
