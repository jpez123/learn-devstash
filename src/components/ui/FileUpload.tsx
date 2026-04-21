'use client';

import { useCallback, useRef, useState } from 'react';
import { Upload, X, File as FileIcon, Image as ImageIcon } from 'lucide-react';

export type UploadResult = {
  key: string;
  fileName: string;
  fileSize: number;
};

interface FileUploadProps {
  accept: 'image' | 'file';
  onUpload: (result: UploadResult) => void;
  onClear: () => void;
  uploadedFile?: UploadResult | null;
}

const IMAGE_ACCEPT = '.png,.jpg,.jpeg,.gif,.webp,.svg';
const FILE_ACCEPT = '.pdf,.txt,.md,.json,.yaml,.yml,.xml,.csv,.toml,.ini';

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function FileUpload({ accept, onUpload, onClear, uploadedFile }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(
    (file: File) => {
      setError(null);
      setProgress(0);

      const formData = new FormData();
      formData.append('file', file);

      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/upload');

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          setProgress(Math.round((e.loaded / e.total) * 100));
        }
      };

      xhr.onload = () => {
        setProgress(null);
        if (xhr.status === 200) {
          const data = JSON.parse(xhr.responseText) as UploadResult;
          onUpload(data);
        } else {
          const data = JSON.parse(xhr.responseText);
          setError(data.error ?? 'Upload failed');
        }
      };

      xhr.onerror = () => {
        setProgress(null);
        setError('Upload failed');
      };

      xhr.send(formData);
    },
    [onUpload]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) upload(file);
    },
    [upload]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) upload(file);
      e.target.value = '';
    },
    [upload]
  );

  if (uploadedFile) {
    const Icon = accept === 'image' ? ImageIcon : FileIcon;
    return (
      <div className="flex items-center gap-3 rounded-md border border-border bg-accent/40 px-3 py-2.5">
        <Icon size={16} className="shrink-0 text-muted-foreground" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{uploadedFile.fileName}</p>
          <p className="text-xs text-muted-foreground">{formatBytes(uploadedFile.fileSize)}</p>
        </div>
        <button
          type="button"
          onClick={onClear}
          className="shrink-0 rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <X size={14} />
        </button>
      </div>
    );
  }

  return (
    <div>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={[
          'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed px-4 py-8 text-center transition-colors',
          dragging
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-border/80 hover:bg-accent/30',
        ].join(' ')}
      >
        <Upload size={20} className="text-muted-foreground" />
        <div>
          <p className="text-sm text-muted-foreground">
            Drag & drop or <span className="text-foreground underline-offset-2 hover:underline">browse</span>
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground/60">
            {accept === 'image' ? 'PNG, JPG, GIF, WebP, SVG — max 5 MB' : 'PDF, TXT, MD, JSON, YAML, XML, CSV — max 10 MB'}
          </p>
        </div>
      </div>

      {progress !== null && (
        <div className="mt-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>Uploading…</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1 w-full overflow-hidden rounded-full bg-accent">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {error && (
        <p className="mt-1.5 text-xs text-destructive">{error}</p>
      )}

      <input
        ref={inputRef}
        type="file"
        className="sr-only"
        accept={accept === 'image' ? IMAGE_ACCEPT : FILE_ACCEPT}
        onChange={handleChange}
      />
    </div>
  );
}
