"use client";

/**
 * BlogEditor — a full-featured WordPress-style blog article editor built on TipTap v3.
 *
 * Rendered inside AdminBlog. Receives HTML `value` and emits `onChange(html)` on every edit.
 * Provides a sticky toolbar with all common formatting controls (text styles, headings,
 * colors, highlights, alignment, lists, blockquote, code, links, images, youtube, tables,
 * horizontal rule, clear formatting, undo/redo) and a styled content area.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import Youtube from "@tiptap/extension-youtube";
import Placeholder from "@tiptap/extension-placeholder";
import Typography from "@tiptap/extension-typography";
import CharacterCount from "@tiptap/extension-character-count";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { all, createLowlight } from "lowlight";

export interface BlogEditorProps {
  /** HTML content to render inside the editor. */
  value: string;
  /** Called with the latest HTML whenever the editor content changes. */
  onChange: (html: string) => void;
  /** Optional — emits the current word count whenever content changes. */
  onWordCountChange?: (count: number) => void;
  /** Optional — emits the current character count whenever content changes. */
  onCharCountChange?: (count: number) => void;
  /** Optional — placeholder text shown in the first empty paragraph. */
  placeholder?: string;
}

/* ------------------------------------------------------------------ */
/* Lowlight instance (registers all highlight.js grammars once).      */
/* ------------------------------------------------------------------ */
const lowlight = createLowlight(all);

/* ------------------------------------------------------------------ */
/* Style tokens                                                        */
/* ------------------------------------------------------------------ */
const PRIMARY = "var(--primary, #a855f7)";
const PRIMARY_DARK = "var(--primary-dark, #7c3aed)";
const BG = "var(--bg-card, #12121f)";
const BORDER = "rgba(255, 255, 255, 0.08)";
const MUTED_TEXT = "rgba(255, 255, 255, 0.65)";

const toolbarContainerStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: "2px",
  alignItems: "center",
  position: "sticky",
  top: 0,
  zIndex: 10,
  background: "rgba(18, 18, 31, 0.96)",
  backdropFilter: "blur(10px)",
  WebkitBackdropFilter: "blur(10px)",
  padding: "8px 10px",
  borderBottom: `1px solid ${BORDER}`,
  borderRadius: "10px 10px 0 0",
  boxShadow: "0 4px 14px rgba(0, 0, 0, 0.18)",
};

const buttonBaseStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minWidth: 32,
  height: 32,
  padding: "0 8px",
  border: "none",
  background: "transparent",
  color: "rgba(255, 255, 255, 0.78)",
  cursor: "pointer",
  borderRadius: 6,
  fontSize: 14,
  transition: "background 0.15s, color 0.15s",
};

const buttonActiveStyle: React.CSSProperties = {
  background: PRIMARY,
  color: "#fff",
  boxShadow: `0 0 0 1px ${PRIMARY_DARK}`,
};

const dividerStyle: React.CSSProperties = {
  width: 1,
  height: 22,
  background: BORDER,
  margin: "0 4px",
  flexShrink: 0,
};

const colorInputWrapStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: 32,
  height: 32,
  borderRadius: 6,
  cursor: "pointer",
  position: "relative",
  color: "rgba(255, 255, 255, 0.78)",
  transition: "background 0.15s",
};

const colorInputStyle: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
  opacity: 0,
  cursor: "pointer",
  border: "none",
  padding: 0,
};

/* ------------------------------------------------------------------ */
/* Editor content CSS — injected once via a <style> tag.               */
/* ------------------------------------------------------------------ */
const editorContentCSS = `
.blog-editor-content {
  position: relative;
  background: var(--bg-card, #12121f);
  border-radius: 0 0 10px 10px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-top: none;
  overflow: hidden;
}

.blog-editor-content .ProseMirror {
  min-height: 420px;
  padding: 24px 28px;
  outline: none;
  caret-color: var(--primary, #a855f7);
  color: rgba(255, 255, 255, 0.92);
  font-family: inherit;
  font-size: 1rem;
  line-height: 1.75;
  word-break: break-word;
}

.blog-editor-content .ProseMirror:focus {
  outline: none;
}

.blog-editor-content h1,
.blog-editor-content h2,
.blog-editor-content h3,
.blog-editor-content h4,
.blog-editor-content h5,
.blog-editor-content h6 {
  font-weight: 700;
  line-height: 1.3;
  margin: 1.4em 0 0.6em;
  color: #fff;
  letter-spacing: -0.01em;
}

.blog-editor-content h1 { font-size: 2rem; }
.blog-editor-content h2 { font-size: 1.65rem; }
.blog-editor-content h3 { font-size: 1.35rem; }
.blog-editor-content h4 { font-size: 1.15rem; }
.blog-editor-content h5 { font-size: 1rem; }
.blog-editor-content h6 { font-size: 0.9rem; }

.blog-editor-content h1:first-child,
.blog-editor-content h2:first-child,
.blog-editor-content h3:first-child,
.blog-editor-content h4:first-child,
.blog-editor-content p:first-child,
.blog-editor-content ul:first-child,
.blog-editor-content ol:first-child,
.blog-editor-content blockquote:first-child,
.blog-editor-content pre:first-child {
  margin-top: 0;
}

.blog-editor-content p {
  margin: 0 0 1em;
  line-height: 1.75;
}

.blog-editor-content ul,
.blog-editor-content ol {
  padding-left: 1.6em;
  margin: 0 0 1em;
}

.blog-editor-content ul { list-style: disc; }
.blog-editor-content ol { list-style: decimal; }

.blog-editor-content li {
  margin: 0.25em 0;
}

.blog-editor-content li > p {
  margin: 0;
}

.blog-editor-content blockquote {
  border-left: 4px solid var(--primary, #a855f7);
  padding: 0.4em 0 0.4em 1.2em;
  margin: 0 0 1em;
  color: rgba(255, 255, 255, 0.75);
  font-style: italic;
  background: rgba(168, 85, 247, 0.06);
  border-radius: 0 6px 6px 0;
}

.blog-editor-content blockquote p {
  margin: 0;
}

.blog-editor-content pre {
  background: #0d0d18;
  color: #f1f1f1;
  padding: 16px 18px;
  border-radius: 8px;
  overflow-x: auto;
  font-family: "SFMono-Regular", Menlo, Monaco, Consolas, "Liberation Mono", monospace;
  font-size: 0.9rem;
  line-height: 1.55;
  margin: 0 0 1em;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.blog-editor-content pre code {
  background: transparent;
  padding: 0;
  border-radius: 0;
  color: inherit;
  font-size: inherit;
}

.blog-editor-content code {
  background: rgba(168, 85, 247, 0.16);
  color: #f1d5ff;
  padding: 0.12em 0.4em;
  border-radius: 4px;
  font-family: "SFMono-Regular", Menlo, Monaco, Consolas, "Liberation Mono", monospace;
  font-size: 0.88em;
}

.blog-editor-content a {
  color: var(--primary, #a855f7);
  text-decoration: underline;
  text-underline-offset: 2px;
  cursor: pointer;
  transition: color 0.15s;
}

.blog-editor-content a:hover {
  color: var(--primary-light, #c084fc);
}

.blog-editor-content img {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  display: block;
  margin: 1em auto;
}

.blog-editor-content img.ProseMirror-selectednode {
  outline: 2px solid var(--primary, #a855f7);
  outline-offset: 2px;
}

.blog-editor-content table {
  border-collapse: collapse;
  width: 100%;
  margin: 0 0 1em;
  table-layout: fixed;
  overflow: hidden;
}

.blog-editor-content th,
.blog-editor-content td {
  border: 1px solid rgba(255, 255, 255, 0.12);
  padding: 8px 12px;
  vertical-align: top;
  word-break: break-word;
}

.blog-editor-content th {
  background: rgba(168, 85, 247, 0.16);
  font-weight: 700;
  color: #fff;
  text-align: left;
}

.blog-editor-content td {
  background: rgba(255, 255, 255, 0.02);
}

.blog-editor-content .selectedCell {
  background: rgba(168, 85, 247, 0.22) !important;
}

.blog-editor-content .tableWrapper {
  overflow-x: auto;
}

.blog-editor-content mark {
  background: #fde68a;
  color: inherit;
  padding: 0.05em 0.2em;
  border-radius: 3px;
}

.blog-editor-content hr {
  border: none;
  border-top: 2px solid rgba(255, 255, 255, 0.16);
  margin: 1.6em 0;
  height: 0;
}

.blog-editor-content hr.ProseMirror-selectednode {
  border-top-color: var(--primary, #a855f7);
}

/* YouTube responsive iframe wrapper (rendered by the extension as a div[data-youtube-video]) */
.blog-editor-content [data-youtube-video],
.blog-editor-content .youtube-wrapper {
  position: relative;
  padding-bottom: 56.25%;
  height: 0;
  overflow: hidden;
  max-width: 100%;
  margin: 1em 0;
  border-radius: 8px;
  background: #000;
}

.blog-editor-content [data-youtube-video] iframe,
.blog-editor-content .youtube-wrapper iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: none;
}

/* Placeholder for empty editor (TipTap v3 Placeholder extension decorates empty nodes). */
.blog-editor-content .ProseMirror p.is-empty:first-child::before,
.blog-editor-content .ProseMirror p.is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  color: rgba(255, 255, 255, 0.32);
  float: left;
  height: 0;
  pointer-events: none;
  font-style: italic;
}

/* Optional task list styling (StarterKit v3 supports taskList via ListItem). */
.blog-editor-content ul[data-type="taskList"] {
  list-style: none;
  padding-left: 0;
}

.blog-editor-content ul[data-type="taskList"] li {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.blog-editor-content ul[data-type="taskList"] li > label {
  flex-shrink: 0;
  margin-top: 4px;
}

.blog-editor-content ul[data-type="taskList"] li > div {
  flex: 1;
}

/* highlight.js (lowlight) token colors — a compact github-dark inspired theme. */
.blog-editor-content .hljs-comment,
.blog-editor-content .hljs-quote { color: #8b949e; font-style: italic; }
.blog-editor-content .hljs-keyword,
.blog-editor-content .hljs-selector-tag,
.blog-editor-content .hljs-deletion,
.blog-editor-content .hljs-doctag,
.blog-editor-content .hljs-section,
.blog-editor-content .hljs-name,
.blog-editor-content .hljs-selector-id,
.blog-editor-content .hljs-selector-class { color: #ff7b72; }
.blog-editor-content .hljs-string,
.blog-editor-content .hljs-regexp,
.blog-editor-content .hljs-addition,
.blog-editor-content .hljs-attribute,
.blog-editor-content .hljs-meta-string { color: #a5d6ff; }
.blog-editor-content .hljs-number,
.blog-editor-content .hljs-literal,
.blog-editor-content .hljs-boolean,
.blog-editor-content .hljs-template-variable { color: #79c0ff; }
.blog-editor-content .hljs-title,
.blog-editor-content .hljs-section,
.blog-editor-content .hljs-title.function_,
.blog-editor-content .hljs-title.class_ { color: #d2a8ff; font-weight: 600; }
.blog-editor-content .hljs-type,
.blog-editor-content .hljs-built_in,
.blog-editor-content .hljs-class,
.blog-editor-content .hljs-params { color: #ffa657; }
.blog-editor-content .hljs-variable,
.blog-editor-content .hljs-attr,
.blog-editor-content .hljs-property,
.blog-editor-content .hljs-meta { color: #79c0ff; }
.blog-editor-content .hljs-tag,
.blog-editor-content .hljs-symbol,
.blog-editor-content .hljs-bullet,
.blog-editor-content .hljs-link { color: #7ee787; }
.blog-editor-content .hljs-emphasis { font-style: italic; }
.blog-editor-content .hljs-strong { font-weight: 700; }
`;

/* ------------------------------------------------------------------ */
/* Toolbar button component                                            */
/* ------------------------------------------------------------------ */
interface ToolbarButtonProps {
  icon?: string;
  label?: string;
  title: string;
  disabled?: boolean;
  active?: boolean;
  onClick: () => void;
}

const ToolbarButton = ({ icon, label, title, disabled, active, onClick }: ToolbarButtonProps) => {
  const [hover, setHover] = useState(false);
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      aria-pressed={active ? "true" : "false"}
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        ...buttonBaseStyle,
        ...(active ? buttonActiveStyle : {}),
        ...(hover && !active && !disabled ? { background: "rgba(255,255,255,0.08)", color: "#fff" } : {}),
        ...(disabled ? { opacity: 0.4, cursor: "not-allowed" } : {}),
      }}
    >
      {icon ? <i className={icon} aria-hidden="true" /> : null}
      {label ? <span style={{ fontWeight: 700, fontSize: 12 }}>{label}</span> : null}
    </button>
  );
};

/* ------------------------------------------------------------------ */
/* Color swatch wrapper                                                */
/* ------------------------------------------------------------------ */
interface ColorSwatchProps {
  icon: string;
  title: string;
  activeColor?: string;
  onPick: (color: string) => void;
  onClear?: () => void;
}

const ColorSwatch = ({ icon, title, activeColor, onPick, onClear }: ColorSwatchProps) => {
  const [hover, setHover] = useState(false);
  return (
    <span
      style={{
        ...colorInputWrapStyle,
        background: hover ? "rgba(255,255,255,0.08)" : "transparent",
        position: "relative",
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      title={title}
    >
      <i className={icon} aria-hidden="true" style={{ pointerEvents: "none" }} />
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          bottom: 4,
          left: 6,
          right: 6,
          height: 3,
          borderRadius: 2,
          background: activeColor || "transparent",
          border: `1px solid ${activeColor ? "transparent" : "rgba(255,255,255,0.25)"}`,
          pointerEvents: "none",
        }}
      />
      <input
        type="color"
        title={title}
        aria-label={title}
        style={colorInputStyle}
        onChange={(e) => onPick(e.target.value)}
        onDoubleClick={(e) => {
          // double click = clear
          e.preventDefault();
          onClear?.();
        }}
      />
    </span>
  );
};

const Divider = () => <span style={dividerStyle} aria-hidden="true" />;

/* ------------------------------------------------------------------ */
/* Main BlogEditor component                                            */
/* ------------------------------------------------------------------ */
export function BlogEditor({
  value,
  onChange,
  onWordCountChange,
  onCharCountChange,
  placeholder,
}: BlogEditorProps) {
  // Use refs for callbacks so the editor instance is NOT recreated when
  // the parent re-renders with a new function identity for onChange etc.
  const onChangeRef = useRef(onChange);
  const onWordRef = useRef(onWordCountChange);
  const onCharRef = useRef(onCharCountChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);
  useEffect(() => {
    onWordRef.current = onWordCountChange;
  }, [onWordCountChange]);
  useEffect(() => {
    onCharRef.current = onCharCountChange;
  }, [onCharCountChange]);

  const placeholderText = placeholder ?? "Start writing your article…";

  const editor = useEditor({
    extensions: [
      // StarterKit provides: Bold, Italic, Strike, Code, Heading, Paragraph,
      // BulletList, OrderedList, ListItem, Blockquote, HardBreak, HorizontalRule,
      // CodeBlock (disabled here — we use CodeBlockLowlight), Document, Dropcursor,
      // Gapcursor, Link (disabled here — we configure our own), Underline, UndoRedo (History),
      // TrailingNode, ListKeymap.
      StarterKit.configure({
        codeBlock: false,
        link: false,
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: { rel: "nofollow", target: "_blank" },
      }),
      Image.configure({
        allowBase64: true,
        inline: false,
        HTMLAttributes: {},
      }),
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Subscript,
      Superscript,
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {},
      }),
      TableRow,
      TableCell,
      TableHeader,
      Youtube.configure({
        controls: false,
        nocookie: true,
        HTMLAttributes: { class: "youtube-wrapper" },
      }),
      Placeholder.configure({
      placeholder: placeholderText,
      }),
      Typography,
      CharacterCount,
      CodeBlockLowlight.configure({
        lowlight,
      }),
    ],
    content: value ?? "",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "prose-elevate",
        spellcheck: "true",
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChangeRef.current?.(html);
      const cc = editor.storage.characterCount;
      if (cc) {
        onWordRef.current?.(cc.words() ?? 0);
        onCharRef.current?.(cc.characters() ?? 0);
      }
    },
  }, []);

  // Sync external value changes into the editor — but only when:
  //   (a) the incoming value differs from the editor's current HTML (avoids redundant writes),
  //   (b) the editor is NOT currently focused (prevents cursor jumping mid-edit).
  useEffect(() => {
    if (!editor) return;
    if (editor.isFocused) return;
    const current = editor.getHTML();
    if (value !== current) {
      editor.commands.setContent(value ?? "", { emitUpdate: false });
    }
  }, [value, editor]);

  // Track local counts for the footer display.
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  useEffect(() => {
    if (!editor) return;
    const update = () => {
      const cc = editor.storage.characterCount;
      if (cc) {
        setWordCount(cc.words() ?? 0);
        setCharCount(cc.characters() ?? 0);
      }
    };
    update();
    editor.on("update", update);
    editor.on("selectionUpdate", update);
    return () => {
      editor.off("update", update);
      editor.off("selectionUpdate", update);
    };
  }, [editor]);

  /* ---------------------------------------------------------------- */
  /* Action handlers                                                    */
  /* ---------------------------------------------------------------- */
  const promptLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href as string | undefined;
    if (editor.isActive("link")) {
      // If selection is already a link, clicking the button unsets it.
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    const url = window.prompt("Enter URL (https://…)", previousUrl ?? "https://");
    if (url === null) return; // user cancelled
    if (url.trim() === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    const targetChoice = window.prompt(
      "Open in new tab? (yes/no)",
      "yes"
    );
    const wantsNewTab = (targetChoice ?? "yes").toLowerCase().startsWith("y");
    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({
        href: url,
        target: wantsNewTab ? "_blank" : null,
        rel: "nofollow",
      })
      .run();
  }, [editor]);

  const promptImage = useCallback(() => {
    if (!editor) return;
    const src = window.prompt("Image URL (https://… or paste a data URI)", "https://");
    if (!src) return;
    const alt = window.prompt("Alt text (describe the image for accessibility):", "") ?? "";
    editor.chain().focus().setImage({ src, alt }).run();
  }, [editor]);

  const promptYoutube = useCallback(() => {
    if (!editor) return;
    const src = window.prompt("YouTube video URL", "https://www.youtube.com/watch?v=");
    if (!src) return;
    editor.chain().focus().setYoutubeVideo({ src }).run();
  }, [editor]);

  const promptTable = useCallback(() => {
    if (!editor) return;
    const dims = window.prompt("Rows x Columns (e.g. 3x3)", "3x3");
    if (!dims) return;
    const match = dims.match(/^(\d+)\s*[xX*]\s*(\d+)$/);
    if (!match) {
      window.alert("Please use the format rows x columns, e.g. 3x3");
      return;
    }
    const rows = Math.max(1, Math.min(50, parseInt(match[1], 10)));
    const cols = Math.max(1, Math.min(20, parseInt(match[2], 10)));
    editor.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run();
  }, [editor]);

  const clearFormatting = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().clearNodes().unsetAllMarks().run();
  }, [editor]);

  // Avoid SSR crash when editor isn't ready yet.
  if (!editor) {
    return (
      <div
        style={{
          padding: 40,
          textAlign: "center",
          color: MUTED_TEXT,
          background: BG,
          borderRadius: 10,
          border: `1px solid ${BORDER}`,
        }}
      >
        <i className="fas fa-circle-notch fa-spin" style={{ marginRight: 8 }} aria-hidden="true" />
        Loading editor…
      </div>
    );
  }

  const chain = () => editor.chain().focus();

  /* ---------------------------------------------------------------- */
  /* Render                                                            */
  /* ---------------------------------------------------------------- */
  return (
    <div className="blog-editor">
      <div className="blog-editor-toolbar" style={toolbarContainerStyle}>
        {/* Undo / Redo */}
        <ToolbarButton
          icon="fas fa-undo"
          title="Undo (Ctrl+Z)"
          disabled={!editor.can().undo()}
          onClick={() => chain().undo().run()}
        />
        <ToolbarButton
          icon="fas fa-redo"
          title="Redo (Ctrl+Shift+Z)"
          disabled={!editor.can().redo()}
          onClick={() => chain().redo().run()}
        />
        <Divider />

        {/* Text style */}
        <ToolbarButton
          icon="fas fa-bold"
          title="Bold (Ctrl+B)"
          active={editor.isActive("bold")}
          onClick={() => chain().toggleBold().run()}
        />
        <ToolbarButton
          icon="fas fa-italic"
          title="Italic (Ctrl+I)"
          active={editor.isActive("italic")}
          onClick={() => chain().toggleItalic().run()}
        />
        <ToolbarButton
          icon="fas fa-underline"
          title="Underline (Ctrl+U)"
          active={editor.isActive("underline")}
          onClick={() => chain().toggleUnderline().run()}
        />
        <ToolbarButton
          icon="fas fa-strikethrough"
          title="Strikethrough"
          active={editor.isActive("strike")}
          onClick={() => chain().toggleStrike().run()}
        />
        <ToolbarButton
          icon="fas fa-subscript"
          title="Subscript"
          active={editor.isActive("subscript")}
          onClick={() => chain().toggleSubscript().run()}
        />
        <ToolbarButton
          icon="fas fa-superscript"
          title="Superscript"
          active={editor.isActive("superscript")}
          onClick={() => chain().toggleSuperscript().run()}
        />
        <Divider />

        {/* Headings / Paragraph */}
        <ToolbarButton
          icon="fas fa-paragraph"
          title="Paragraph"
          active={editor.isActive("paragraph")}
          onClick={() => chain().setParagraph().run()}
        />
        <ToolbarButton
          label="H1"
          title="Heading 1"
          active={editor.isActive("heading", { level: 1 })}
          onClick={() => chain().toggleHeading({ level: 1 }).run()}
        />
        <ToolbarButton
          label="H2"
          title="Heading 2"
          active={editor.isActive("heading", { level: 2 })}
          onClick={() => chain().toggleHeading({ level: 2 }).run()}
        />
        <ToolbarButton
          label="H3"
          title="Heading 3"
          active={editor.isActive("heading", { level: 3 })}
          onClick={() => chain().toggleHeading({ level: 3 }).run()}
        />
        <ToolbarButton
          label="H4"
          title="Heading 4"
          active={editor.isActive("heading", { level: 4 })}
          onClick={() => chain().toggleHeading({ level: 4 }).run()}
        />
        <Divider />

        {/* Color / Highlight */}
        <ColorSwatch
          icon="fas fa-palette"
          title="Text color (double-click to clear)"
          activeColor={editor.getAttributes("textStyle").color as string | undefined}
          onPick={(color) => chain().setColor(color).run()}
          onClear={() => chain().unsetColor().run()}
        />
        <ColorSwatch
          icon="fas fa-highlighter"
          title="Highlight color (double-click to clear)"
          activeColor={editor.getAttributes("highlight").color as string | undefined}
          onPick={(color) => chain().toggleHighlight({ color }).run()}
          onClear={() => chain().unsetHighlight().run()}
        />
        <Divider />

        {/* Alignment */}
        <ToolbarButton
          icon="fas fa-align-left"
          title="Align left"
          active={editor.isActive({ textAlign: "left" })}
          onClick={() => chain().setTextAlign("left").run()}
        />
        <ToolbarButton
          icon="fas fa-align-center"
          title="Align center"
          active={editor.isActive({ textAlign: "center" })}
          onClick={() => chain().setTextAlign("center").run()}
        />
        <ToolbarButton
          icon="fas fa-align-right"
          title="Align right"
          active={editor.isActive({ textAlign: "right" })}
          onClick={() => chain().setTextAlign("right").run()}
        />
        <ToolbarButton
          icon="fas fa-align-justify"
          title="Justify"
          active={editor.isActive({ textAlign: "justify" })}
          onClick={() => chain().setTextAlign("justify").run()}
        />
        <Divider />

        {/* Lists / Blockquote */}
        <ToolbarButton
          icon="fas fa-list-ul"
          title="Bullet list"
          active={editor.isActive("bulletList")}
          onClick={() => chain().toggleBulletList().run()}
        />
        <ToolbarButton
          icon="fas fa-list-ol"
          title="Ordered list"
          active={editor.isActive("orderedList")}
          onClick={() => chain().toggleOrderedList().run()}
        />
        <ToolbarButton
          icon="fas fa-quote-right"
          title="Blockquote"
          active={editor.isActive("blockquote")}
          onClick={() => chain().toggleBlockquote().run()}
        />
        <Divider />

        {/* Code */}
        <ToolbarButton
          icon="fas fa-code"
          title="Inline code"
          active={editor.isActive("code")}
          onClick={() => chain().toggleCode().run()}
        />
        <ToolbarButton
          icon="fas fa-file-code"
          title="Code block"
          active={editor.isActive("codeBlock")}
          onClick={() => chain().toggleCodeBlock().run()}
        />
        <Divider />

        {/* Insert: Link / Image / YouTube / Table / HR */}
        <ToolbarButton
          icon="fas fa-link"
          title={editor.isActive("link") ? "Remove link" : "Insert link (Ctrl+K)"}
          active={editor.isActive("link")}
          onClick={promptLink}
        />
        <ToolbarButton
          icon="fas fa-image"
          title="Insert image"
          onClick={promptImage}
        />
        <ToolbarButton
          icon="fab fa-youtube"
          title="Insert YouTube video"
          onClick={promptYoutube}
        />
        <ToolbarButton
          icon="fas fa-table"
          title="Insert table"
          onClick={promptTable}
        />
        <ToolbarButton
          icon="fas fa-minus"
          title="Horizontal divider"
          onClick={() => chain().setHorizontalRule().run()}
        />
        <Divider />

        {/* Clear formatting */}
        <ToolbarButton
          icon="fas fa-eraser"
          title="Clear formatting"
          onClick={clearFormatting}
        />
      </div>

      {/* Editable area */}
      <div className="blog-editor-content">
        <EditorContent editor={editor} />
        {/* Word/char count footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "8px 14px",
            borderTop: `1px solid ${BORDER}`,
            background: "rgba(0, 0, 0, 0.18)",
            color: MUTED_TEXT,
            fontSize: 12,
            borderRadius: "0 0 10px 10px",
          }}
        >
          <span>
            <i className="fas fa-keyboard" style={{ marginRight: 6 }} aria-hidden="true" />
            Tip: <strong>Ctrl/⌘+B</strong> bold · <strong>Ctrl/⌘+I</strong> italic ·{" "}
            <strong>Ctrl/⌘+K</strong> link · <strong>Ctrl/⌘+Z</strong> undo
          </span>
          <span>
            <strong style={{ color: "#fff" }}>{wordCount.toLocaleString()}</strong> words ·{" "}
            <strong style={{ color: "#fff" }}>{charCount.toLocaleString()}</strong> chars
          </span>
        </div>
      </div>

      {/* Editor content CSS — injected once. */}
      <style dangerouslySetInnerHTML={{ __html: editorContentCSS }} />
    </div>
  );
}

export default BlogEditor;
