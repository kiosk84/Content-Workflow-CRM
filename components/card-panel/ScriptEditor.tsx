"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect, useRef } from "react";
import { Bold, Italic, List, ListOrdered, Heading2, Quote } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  value: string;
  /** Stable identity (card id). When it changes, editor content is re-synced. */
  docKey: string;
  onChange: (html: string) => void;
  onEditorReady?: (editor: Editor) => void;
  placeholder?: string;
}

export function ScriptEditor({
  value,
  docKey,
  onChange,
  onEditorReady,
  placeholder,
}: Props) {
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2] } }),
      Placeholder.configure({
        placeholder:
          placeholder ??
          "Напиши сценарий или попроси AI-ассистента сгенерировать его…",
      }),
    ],
    content: value || "",
    immediatelyRender: false,
    editorProps: {
      attributes: { class: "tiptap" },
    },
    onUpdate: ({ editor }) => {
      onChangeRef.current(editor.getHTML());
    },
  });

  const lastKey = useRef(docKey);
  useEffect(() => {
    if (!editor) return;
    if (lastKey.current !== docKey) {
      editor.commands.setContent(value || "", { emitUpdate: false });
      lastKey.current = docKey;
    }
  }, [docKey, value, editor]);

  useEffect(() => {
    if (editor && onEditorReady) onEditorReady(editor);
  }, [editor, onEditorReady]);

  if (!editor) return null;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1 rounded-md border border-border bg-muted/30 p-1">
        <ToolbarBtn
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
          label="Bold"
        >
          <Bold size={13} />
        </ToolbarBtn>
        <ToolbarBtn
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          label="Italic"
        >
          <Italic size={13} />
        </ToolbarBtn>
        <ToolbarBtn
          active={editor.isActive("heading", { level: 2 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          label="H2"
        >
          <Heading2 size={13} />
        </ToolbarBtn>
        <ToolbarBtn
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          label="Bullets"
        >
          <List size={13} />
        </ToolbarBtn>
        <ToolbarBtn
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          label="Numbers"
        >
          <ListOrdered size={13} />
        </ToolbarBtn>
        <ToolbarBtn
          active={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          label="Quote"
        >
          <Quote size={13} />
        </ToolbarBtn>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}

function ToolbarBtn({
  active,
  onClick,
  label,
  children,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      title={label}
      onClick={onClick}
      className={cn(
        "flex h-7 w-7 items-center justify-center rounded transition-colors",
        active
          ? "bg-accent/30 text-foreground"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}
