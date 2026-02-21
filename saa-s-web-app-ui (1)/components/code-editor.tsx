"use client"

import { useRef, useCallback } from "react"
import Editor, { OnMount, BeforeMount } from "@monaco-editor/react"
import { useTheme } from "next-themes"
import { Loader2 } from "lucide-react"

interface CodeEditorProps {
  value: string
  onChange: (value: string) => void
  language?: string
  disabled?: boolean
  placeholder?: string
}

const LANGUAGE_MAP: Record<string, string> = {
  python: "python",
  cpp: "cpp",
  java: "java",
  javascript: "javascript",
  c: "c",
}

export function CodeEditor({
  value,
  onChange,
  language = "python",
  disabled = false,
  placeholder,
}: CodeEditorProps) {
  const { resolvedTheme } = useTheme()
  const editorRef = useRef<any>(null)

  const monacoLanguage = LANGUAGE_MAP[language] || language

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor
    editor.focus()
  }

  const handleBeforeMount: BeforeMount = (monaco) => {
    // Configure editor defaults
    monaco.editor.defineTheme("sudotask-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [],
      colors: {
        "editor.background": "#09090b",
        "editor.lineHighlightBackground": "#1a1a2e",
      },
    })
    monaco.editor.defineTheme("sudotask-light", {
      base: "vs",
      inherit: true,
      rules: [],
      colors: {
        "editor.background": "#ffffff",
      },
    })
  }

  const handleChange = useCallback(
    (val: string | undefined) => {
      if (!disabled) {
        onChange(val ?? "")
      }
    },
    [onChange, disabled]
  )

  const editorTheme =
    resolvedTheme === "dark" ? "sudotask-dark" : "sudotask-light"

  return (
    <div className="h-full w-full overflow-hidden rounded-md border border-border">
      <Editor
        height="100%"
        language={monacoLanguage}
        value={value}
        onChange={handleChange}
        theme={editorTheme}
        beforeMount={handleBeforeMount}
        onMount={handleEditorDidMount}
        loading={
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        }
        options={{
          readOnly: disabled,
          minimap: { enabled: false },
          fontSize: 14,
          fontFamily: "'Fira Code', 'Cascadia Code', 'JetBrains Mono', Consolas, 'Courier New', monospace",
          lineNumbers: "on",
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 4,
          insertSpaces: true,
          wordWrap: "on",
          padding: { top: 12, bottom: 12 },
          suggestOnTriggerCharacters: true,
          quickSuggestions: true,
          autoIndent: "full",
          formatOnPaste: true,
          formatOnType: true,
          bracketPairColorization: { enabled: true },
          autoClosingBrackets: "always",
          autoClosingQuotes: "always",
          renderLineHighlight: "line",
          smoothScrolling: true,
          cursorBlinking: "smooth",
          cursorSmoothCaretAnimation: "on",
          folding: true,
          glyphMargin: false,
          lineDecorationsWidth: 8,
          overviewRulerBorder: false,
          scrollbar: {
            verticalScrollbarSize: 8,
            horizontalScrollbarSize: 8,
          },
        }}
      />
    </div>
  )
}
