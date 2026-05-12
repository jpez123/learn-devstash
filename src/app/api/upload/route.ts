import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { auth } from '@/auth';
import { uploadToR2 } from '@/lib/r2';
import { prisma } from '@/lib/prisma';

const IMAGE_TYPES = new Set([
  'image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml',
]);
const FILE_TYPES = new Set([
  'application/pdf', 'text/plain', 'text/markdown', 'application/json',
  'application/x-yaml', 'text/yaml', 'application/xml', 'text/xml',
  'text/csv', 'application/toml',
]);

const IMAGE_MAX = 5 * 1024 * 1024;
const FILE_MAX = 10 * 1024 * 1024;

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isPro: true },
  });
  if (!dbUser?.isPro) {
    return NextResponse.json(
      { error: 'File uploads require a Pro subscription' },
      { status: 403 }
    );
  }

  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  const isImage = IMAGE_TYPES.has(file.type);
  const isFile = FILE_TYPES.has(file.type);

  if (!isImage && !isFile) {
    return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 });
  }

  const max = isImage ? IMAGE_MAX : FILE_MAX;
  if (file.size > max) {
    const limit = isImage ? '5 MB' : '10 MB';
    return NextResponse.json({ error: `File too large (max ${limit})` }, { status: 400 });
  }

  const ext = file.name.split('.').pop() ?? '';
  const key = `${session.user.id}/${randomUUID()}${ext ? `.${ext}` : ''}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  await uploadToR2(key, buffer, file.type);

  return NextResponse.json({ key, fileName: file.name, fileSize: file.size });
}
