'use client';

import { Download, File, FileCode, FileImage, FileText, FileVideo, FileAudio, Archive } from 'lucide-react';
import { useItemDrawer } from '@/components/items/ItemDrawerProvider';
import { ItemWithMeta } from '@/lib/db/items';
import { formatFileSize } from '@/lib/utils';

function getFileIcon(fileName: string | null) {
  if (!fileName) return <File size={20} className="text-muted-foreground" />;
  const ext = fileName.split('.').pop()?.toLowerCase() ?? '';
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'avif'].includes(ext))
    return <FileImage size={20} className="text-pink-400" />;
  if (['mp4', 'mov', 'avi', 'webm', 'mkv'].includes(ext))
    return <FileVideo size={20} className="text-purple-400" />;
  if (['mp3', 'wav', 'ogg', 'flac', 'm4a'].includes(ext))
    return <FileAudio size={20} className="text-blue-400" />;
  if (['js', 'ts', 'tsx', 'jsx', 'py', 'go', 'rs', 'java', 'rb', 'php', 'sh', 'sql'].includes(ext))
    return <FileCode size={20} className="text-emerald-400" />;
  if (['txt', 'md', 'mdx', 'csv', 'json', 'yaml', 'yml', 'xml', 'html', 'css'].includes(ext))
    return <FileText size={20} className="text-yellow-400" />;
  if (['zip', 'tar', 'gz', 'rar', '7z'].includes(ext))
    return <Archive size={20} className="text-orange-400" />;
  return <File size={20} className="text-muted-foreground" />;
}


function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function FileListRow({ item }: { item: ItemWithMeta }) {
  const { openDrawer } = useItemDrawer();
  const downloadKey = item.fileUrl ? encodeURIComponent(item.fileUrl) : null;

  function handleDownload(e: React.MouseEvent) {
    e.stopPropagation();
    if (!downloadKey) return;
    const a = document.createElement('a');
    a.href = `/api/download?key=${downloadKey}`;
    a.download = item.fileName ?? item.title;
    a.click();
  }

  return (
    <div
      onClick={() => openDrawer(item.id)}
      className="flex cursor-pointer items-center gap-4 rounded-lg border border-border bg-card px-4 py-3 transition-colors hover:bg-accent/50"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent/60">
        {getFileIcon(item.fileName)}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{item.fileName ?? item.title}</p>
        <p className="mt-0.5 truncate text-xs text-muted-foreground sm:hidden">
          {formatFileSize(item.fileSize)} · {formatDate(item.createdAt)}
        </p>
      </div>

      <div className="hidden shrink-0 text-right sm:block">
        <p className="text-xs text-muted-foreground">{formatFileSize(item.fileSize)}</p>
      </div>

      <div className="hidden shrink-0 text-right sm:block">
        <p className="text-xs text-muted-foreground">{formatDate(item.createdAt)}</p>
      </div>

      <button
        onClick={handleDownload}
        disabled={!downloadKey}
        title="Download"
        className="ml-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
      >
        <Download size={15} />
      </button>
    </div>
  );
}
