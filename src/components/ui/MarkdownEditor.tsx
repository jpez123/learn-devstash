'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

interface MarkdownEditorProps {
  value: string;
  readOnly?: boolean;
  onChange?: (value: string) => void;
}

export default function MarkdownEditor({ value, readOnly = false, onChange }: MarkdownEditorProps) {
  const [tab, setTab] = useState<'write' | 'preview'>(readOnly ? 'preview' : 'write');
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="overflow-hidden rounded-md border border-border bg-[#1e1e1e]">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-white/10 px-3 py-2 bg-[#2d2d2d]">
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
          <span className="h-3 w-3 rounded-full bg-[#28c840]" />
        </div>

        {/* Tabs */}
        {!readOnly && (
          <div className="ml-2 flex items-center gap-0.5">
            <button
              type="button"
              onClick={() => setTab('write')}
              className={[
                'rounded px-2 py-0.5 text-[11px] transition-colors',
                tab === 'write'
                  ? 'bg-white/15 text-white/80'
                  : 'text-white/40 hover:text-white/60',
              ].join(' ')}
            >
              Write
            </button>
            <button
              type="button"
              onClick={() => setTab('preview')}
              className={[
                'rounded px-2 py-0.5 text-[11px] transition-colors',
                tab === 'preview'
                  ? 'bg-white/15 text-white/80'
                  : 'text-white/40 hover:text-white/60',
              ].join(' ')}
            >
              Preview
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={handleCopy}
          className="ml-auto flex items-center gap-1 rounded px-2 py-0.5 text-[11px] text-white/40 transition-colors hover:bg-white/10 hover:text-white/70"
        >
          {copied ? <Check size={11} /> : <Copy size={11} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>

      {/* Write tab */}
      {tab === 'write' && !readOnly && (
        <textarea
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder="Write markdown..."
          className="markdown-editor-scroll block w-full resize-none bg-[#1e1e1e] p-3 font-mono text-xs leading-relaxed text-white/80 placeholder:text-white/20 focus:outline-none"
          style={{ minHeight: '160px', maxHeight: '400px' }}
        />
      )}

      {/* Preview tab */}
      {(tab === 'preview' || readOnly) && (
        <div
          className="markdown-preview markdown-editor-scroll max-h-[400px] overflow-y-auto p-4"
        >
          {value.trim() ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
          ) : (
            <p className="text-xs text-white/25 italic">Nothing to preview</p>
          )}
        </div>
      )}
    </div>
  );
}
