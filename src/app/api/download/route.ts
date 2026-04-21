import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getFromR2 } from '@/lib/r2';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const key = req.nextUrl.searchParams.get('key');
  if (!key) {
    return NextResponse.json({ error: 'Missing key' }, { status: 400 });
  }

  if (!key.startsWith(`${session.user.id}/`)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const r2Response = await getFromR2(key);
  if (!r2Response.Body) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const bytes = await r2Response.Body.transformToByteArray();
  const fileName = key.split('/').pop() ?? 'download';

  return new NextResponse(Buffer.from(bytes), {
    headers: {
      'Content-Type': r2Response.ContentType ?? 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Cache-Control': 'private, max-age=3600',
    },
  });
}
