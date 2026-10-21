"use client";

import { useEffect, useRef, useState } from "react";
import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react";
import { CharacterCount, Placeholder } from "@tiptap/extensions";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Heading2,
  Heading3,
  ImagePlus,
  Italic,
  Link2,
  Link2Off,
  List,
  ListOrdered,
  Loader2,
  Minus,
  Quote,
  Redo2,
  Strikethrough,
  Type,
  Underline as UnderlineIcon,
  Undo2,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { BLOG_EXTENSIONS } from "@/lib/blog-extensions";
import { uploadImage } from "@/lib/upload-image";

function ToolbarButton({
  onClick,
  active,
  disabled,
  label,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      // Keeps focus (and the text selection) in the editor. Without this the
      // button takes focus first and formatting applies to nothing.
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-pressed={active}
      title={label}
      className={cn(
        "flex size-8 items-center justify-center rounded-md text-navy-700 transition-colors hover:bg-navy-50 disabled:pointer-events-none disabled:opacity-40",
        active && "bg-gold-100 text-gold-800"
      )}
    >
      {children}
    </button>
  );
}

const Divider = () => <span className="mx-1 h-5 w-px bg-navy-100" aria-hidden="true" />;

function Toolbar({
  editor,
  password,
  onError,
}: {
  editor: Editor;
  password?: string;
  onError: (message: string) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  // Re-render the toolbar when the selection or formatting changes.
  const state = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      bold: e.isActive("bold"),
      italic: e.isActive("italic"),
      underline: e.isActive("underline"),
      strike: e.isActive("strike"),
      h2: e.isActive("heading", { level: 2 }),
      h3: e.isActive("heading", { level: 3 }),
      bullet: e.isActive("bulletList"),
      ordered: e.isActive("orderedList"),
      quote: e.isActive("blockquote"),
      link: e.isActive("link"),
      image: e.isActive("image"),
      left: e.isActive({ textAlign: "left" }),
      center: e.isActive({ textAlign: "center" }),
      right: e.isActive({ textAlign: "right" }),
      canUndo: e.can().undo(),
      canRedo: e.can().redo(),
    }),
  });

  async function insertImage(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    try {
      const src = await uploadImage(file, 1600, password);
      const alt = window.prompt("Describe the image (alt text, for search engines and screen readers)", "") ?? "";
      editor.chain().focus().setImage({ src, alt: alt.trim() }).run();
    } catch (e) {
      onError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  function setLink() {
    const previous = editor.getAttributes("link").href as string | undefined;
    const input = window.prompt("Link URL (https://… or a page on this site like /services)", previous ?? "");
    if (input === null) return;
    const url = input.trim();
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    const href = /^(https?:|mailto:|tel:|\/|#)/i.test(url) ? url : `https://${url}`;
    editor.chain().focus().extendMarkRange("link").setLink({ href }).run();
  }

  function setAlt() {
    const current = (editor.getAttributes("image").alt as string | undefined) ?? "";
    const alt = window.prompt("Alt text for this image", current);
    if (alt === null) return;
    editor.chain().focus().updateAttributes("image", { alt: alt.trim() }).run();
  }

  const c = () => editor.chain().focus();

  return (
    <div className="sticky top-0 z-10 flex flex-wrap items-center gap-0.5 border-b border-navy-100 bg-white p-1.5">
      <ToolbarButton label="Bold" active={state.bold} onClick={() => c().toggleBold().run()}>
        <Bold className="size-4" />
      </ToolbarButton>
      <ToolbarButton label="Italic" active={state.italic} onClick={() => c().toggleItalic().run()}>
        <Italic className="size-4" />
      </ToolbarButton>
      <ToolbarButton label="Underline" active={state.underline} onClick={() => c().toggleUnderline().run()}>
        <UnderlineIcon className="size-4" />
      </ToolbarButton>
      <ToolbarButton label="Strikethrough" active={state.strike} onClick={() => c().toggleStrike().run()}>
        <Strikethrough className="size-4" />
      </ToolbarButton>
      <Divider />
      <ToolbarButton label="Heading 2" active={state.h2} onClick={() => c().toggleHeading({ level: 2 }).run()}>
        <Heading2 className="size-4" />
      </ToolbarButton>
      <ToolbarButton label="Heading 3" active={state.h3} onClick={() => c().toggleHeading({ level: 3 }).run()}>
        <Heading3 className="size-4" />
      </ToolbarButton>
      <Divider />
      <ToolbarButton label="Bullet list" active={state.bullet} onClick={() => c().toggleBulletList().run()}>
        <List className="size-4" />
      </ToolbarButton>
      <ToolbarButton label="Numbered list" active={state.ordered} onClick={() => c().toggleOrderedList().run()}>
        <ListOrdered className="size-4" />
      </ToolbarButton>
      <ToolbarButton label="Quote" active={state.quote} onClick={() => c().toggleBlockquote().run()}>
        <Quote className="size-4" />
      </ToolbarButton>
      <ToolbarButton label="Divider line" onClick={() => c().setHorizontalRule().run()}>
        <Minus className="size-4" />
      </ToolbarButton>
      <Divider />
      <ToolbarButton label="Align left" active={state.left} onClick={() => c().setTextAlign("left").run()}>
        <AlignLeft className="size-4" />
      </ToolbarButton>
      <ToolbarButton label="Align center" active={state.center} onClick={() => c().setTextAlign("center").run()}>
        <AlignCenter className="size-4" />
      </ToolbarButton>
      <ToolbarButton label="Align right" active={state.right} onClick={() => c().setTextAlign("right").run()}>
        <AlignRight className="size-4" />
      </ToolbarButton>
      <Divider />
      <ToolbarButton label="Add link" active={state.link} onClick={setLink}>
        <Link2 className="size-4" />
      </ToolbarButton>
      <ToolbarButton label="Remove link" disabled={!state.link} onClick={() => c().extendMarkRange("link").unsetLink().run()}>
        <Link2Off className="size-4" />
      </ToolbarButton>
      <ToolbarButton label="Insert image" disabled={uploading} onClick={() => fileRef.current?.click()}>
        {uploading ? <Loader2 className="size-4 animate-spin" /> : <ImagePlus className="size-4" />}
      </ToolbarButton>
      <ToolbarButton label="Image alt text" disabled={!state.image} onClick={setAlt}>
        <Type className="size-4" />
      </ToolbarButton>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="sr-only"
        tabIndex={-1}
        onChange={(e) => {
          insertImage(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      <Divider />
      <ToolbarButton label="Undo" disabled={!state.canUndo} onClick={() => c().undo().run()}>
        <Undo2 className="size-4" />
      </ToolbarButton>
      <ToolbarButton label="Redo" disabled={!state.canRedo} onClick={() => c().redo().run()}>
        <Redo2 className="size-4" />
      </ToolbarButton>
    </div>
  );
}

export function RichTextEditor({
  content,
  onChange,
  password,
  onError,
}: {
  /** Tiptap JSON (or null for an empty post). Read once, on mount. */
  content: unknown;
  onChange: (html: string, json: unknown) => void;
  password?: string;
  onError: (message: string) => void;
}) {
  const editor = useEditor({
    // Required with SSR: otherwise the server and client renders differ.
    immediatelyRender: false,
    extensions: [
      ...BLOG_EXTENSIONS,
      Placeholder.configure({ placeholder: "Start with a short paragraph that answers the title's question…" }),
      CharacterCount,
    ],
    content: (content as object) ?? "",
    editorProps: {
      attributes: {
        class: "prose prose-bluvig max-w-none min-h-[420px] px-5 py-4 focus:outline-none",
      },
    },
    onUpdate: ({ editor: e }) => onChange(e.getHTML(), e.getJSON()),
  });

  // Report the initial content once, so the analysis has HTML to work on.
  const reported = useRef(false);
  useEffect(() => {
    if (!editor || reported.current) return;
    reported.current = true;
    onChange(editor.getHTML(), editor.getJSON());
  }, [editor, onChange]);

  const words = useEditorState({
    editor,
    selector: ({ editor: e }) => e?.storage.characterCount.words() ?? 0,
  });

  if (!editor) {
    return <div className="min-h-[480px] animate-pulse rounded-xl border border-navy-100 bg-white" />;
  }

  return (
    <div className="rounded-xl border border-navy-200 bg-white focus-within:border-gold-400">
      <Toolbar editor={editor} password={password} onError={onError} />
      <EditorContent editor={editor} />
      <div className="border-t border-navy-100 px-5 py-2 text-xs text-navy-500">
        {words} words
      </div>
    </div>
  );
}
