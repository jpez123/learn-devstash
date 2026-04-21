'use client';

import { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

interface CodeEditorProps {
  value: string;
  language?: string;
  readOnly?: boolean;
  onChange?: (value: string) => void;
}

export default function CodeEditor({ value, language, readOnly = false, onChange }: CodeEditorProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="overflow-hidden rounded-md border border-border bg-[#1e1e1e]">
      {/* macOS window header */}
      <div className="flex items-center gap-2 border-b border-white/10 px-3 py-2">
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
          <span className="h-3 w-3 rounded-full bg-[#28c840]" />
        </div>
        <span className="ml-2 text-[11px] text-white/40">{language || 'plaintext'}</span>
        <button
          onClick={handleCopy}
          className="ml-auto flex items-center gap-1 rounded px-2 py-0.5 text-[11px] text-white/40 transition-colors hover:bg-white/10 hover:text-white/70"
        >
          {copied ? <Check size={11} /> : <Copy size={11} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>

      {/* Editor */}
      <Editor
        value={value}
        language={language || 'plaintext'}
        theme="vs-dark"
        options={{
          readOnly,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          fontSize: 12,
          lineHeight: 20,
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
          padding: { top: 12, bottom: 12 },
          scrollbar: {
            vertical: 'auto',
            horizontal: 'auto',
            verticalScrollbarSize: 6,
            horizontalScrollbarSize: 6,
          },
          overviewRulerLanes: 0,
          hideCursorInOverviewRuler: true,
          overviewRulerBorder: false,
          renderLineHighlight: readOnly ? 'none' : 'line',
          wordWrap: 'on',
          lineNumbers: 'on',
          glyphMargin: false,
          folding: false,
          lineDecorationsWidth: 8,
          lineNumbersMinChars: 3,
        }}
        onChange={(val) => onChange?.(val ?? '')}
        onMount={(editor) => {
          const lineCount = editor.getModel()?.getLineCount() ?? 1;
          const lineHeight = 20;
          const padding = 24;
          const maxHeight = 400;
          const naturalHeight = lineCount * lineHeight + padding;
          editor.layout({ width: editor.getLayoutInfo().width, height: Math.min(naturalHeight, maxHeight) });

          editor.onDidChangeModelContent(() => {
            const newLineCount = editor.getModel()?.getLineCount() ?? 1;
            const newNaturalHeight = newLineCount * lineHeight + padding;
            editor.layout({ width: editor.getLayoutInfo().width, height: Math.min(newNaturalHeight, maxHeight) });
          });
        }}
      />
    </div>
  );
}
