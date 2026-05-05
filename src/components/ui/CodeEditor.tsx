'use client';

import { useState } from 'react';
import Editor, { type BeforeMount } from '@monaco-editor/react';
import { Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useEditorPreferences } from '@/context/EditorPreferencesContext';

interface CodeEditorProps {
  value: string;
  language?: string;
  readOnly?: boolean;
  onChange?: (value: string) => void;
}

const beforeMount: BeforeMount = (monaco) => {
  monaco.editor.defineTheme('monokai', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '75715e', fontStyle: 'italic' },
      { token: 'keyword', foreground: 'f92672' },
      { token: 'string', foreground: 'e6db74' },
      { token: 'number', foreground: 'ae81ff' },
      { token: 'type', foreground: '66d9ef' },
      { token: 'function', foreground: 'a6e22e' },
      { token: 'variable', foreground: 'f8f8f2' },
      { token: 'operator', foreground: 'f92672' },
    ],
    colors: {
      'editor.background': '#272822',
      'editor.foreground': '#f8f8f2',
      'editorCursor.foreground': '#f8f8f0',
      'editor.selectionBackground': '#49483e',
      'editor.lineHighlightBackground': '#3e3d32',
      'editorLineNumber.foreground': '#75715e',
      'editor.inactiveSelectionBackground': '#3e3d3266',
    },
  });

  monaco.editor.defineTheme('github-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '8b949e', fontStyle: 'italic' },
      { token: 'keyword', foreground: 'ff7b72' },
      { token: 'string', foreground: 'a5d6ff' },
      { token: 'number', foreground: '79c0ff' },
      { token: 'type', foreground: 'ffa657' },
      { token: 'function', foreground: 'd2a8ff' },
      { token: 'variable', foreground: 'e6edf3' },
      { token: 'operator', foreground: 'ff7b72' },
    ],
    colors: {
      'editor.background': '#0d1117',
      'editor.foreground': '#e6edf3',
      'editorCursor.foreground': '#e6edf3',
      'editor.selectionBackground': '#264f78',
      'editor.lineHighlightBackground': '#161b22',
      'editorLineNumber.foreground': '#6e7681',
      'editor.inactiveSelectionBackground': '#264f7866',
    },
  });
};

const BACKGROUND_BY_THEME: Record<string, string> = {
  'vs-dark': '#1e1e1e',
  monokai: '#272822',
  'github-dark': '#0d1117',
};

export default function CodeEditor({ value, language, readOnly = false, onChange }: CodeEditorProps) {
  const [copied, setCopied] = useState(false);
  const { preferences } = useEditorPreferences();

  async function handleCopy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  }

  const bg = BACKGROUND_BY_THEME[preferences.theme] ?? '#1e1e1e';

  return (
    <div className="overflow-hidden rounded-md border border-border" style={{ backgroundColor: bg }}>
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
        theme={preferences.theme}
        beforeMount={beforeMount}
        options={{
          readOnly,
          minimap: { enabled: preferences.minimap },
          scrollBeyondLastLine: false,
          fontSize: preferences.fontSize,
          tabSize: preferences.tabSize,
          lineHeight: Math.round(preferences.fontSize * 1.67),
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
          wordWrap: preferences.wordWrap ? 'on' : 'off',
          lineNumbers: 'on',
          glyphMargin: false,
          folding: false,
          lineDecorationsWidth: 8,
          lineNumbersMinChars: 3,
        }}
        onChange={(val) => onChange?.(val ?? '')}
        onMount={(editor) => {
          const lineCount = editor.getModel()?.getLineCount() ?? 1;
          const lineHeight = Math.round(preferences.fontSize * 1.67);
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
