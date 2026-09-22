# Task ID 8 — TipTap Editor Agent

## Task
Build a full-featured WordPress-style blog article editor using TipTap v3 in `/home/z/my-project`.

## File Created
- `/home/z/my-project/src/components/elevate/admin/BlogEditor.tsx` (994 lines)

## Implementation Summary

### Component API
```tsx
interface BlogEditorProps {
  value: string;
  onChange: (html: string) => void;
  onWordCountChange?: (count: number) => void;
  onCharCountChange?: (count: number) => void;
  placeholder?: string;
}
```
Exports `BlogEditor` (named) and `default`.

### TipTap Extensions Configured
- **StarterKit** (with `codeBlock: false`, `link: false` so we can override) — provides Bold, Italic, Strike, Code, Heading, Paragraph, BulletList, OrderedList, ListItem, Blockquote, HardBreak, HorizontalRule, Document, Dropcursor, Gapcursor, Underline, **UndoRedo (=History)**, TrailingNode, ListKeymap
- **Link** — `openOnClick: false, autolink: true, HTMLAttributes: { rel: "nofollow", target: "_blank" }`
- **Image** — `allowBase64: true, inline: false`
- **Underline** (separate from StarterKit's — StarterKit already includes it but config matches the spec list)
- **TextAlign** — `types: ["heading", "paragraph"]`
- **Subscript**, **Superscript**
- **TextStyle**, **Color** (named imports — these packages have no default export)
- **Highlight** — `multicolor: true`
- **Table** (resizable, named import), **TableRow**, **TableCell**, **TableHeader**
- **Youtube** — `controls: false, nocookie: true, HTMLAttributes: { class: "youtube-wrapper" }`
- **Placeholder** — `placeholder: "Start writing your article…"` (overridable via prop)
- **Typography**, **CharacterCount**
- **CodeBlockLowlight** — configured with `lowlight` instance created via `createLowlight(all)` (all highlight.js grammars registered)

### Toolbar (sticky, flex-wrap, glassmorphism dark style)
Grouped with dividers:
1. Undo / Redo (with `editor.can().undo()` disabled state)
2. Bold, Italic, Underline, Strikethrough, Subscript, Superscript
3. Paragraph + H1/H2/H3/H4 (text labels — Font Awesome Free lacks fa-h1..fa-h4)
4. Text color picker (`<input type="color">` overlay on `fa-palette`, double-click = clear)
5. Highlight color picker (`fa-highlighter`, double-click = clear)
6. Align left/center/right/justify
7. Bullet list, Ordered list, Blockquote
8. Inline code, Code block
9. Link (prompt for URL + open-in-new-tab choice; if selection is a link, unsets it), Image (prompt URL + alt), YouTube (prompt URL), Table (prompt rows×cols regex `^(\d+)\s*[xX*]\s*(\d+)$`), Horizontal rule
10. Clear formatting (clearNodes + unsetAllMarks)

Each button: icon-only, `title` attribute for tooltip, `aria-pressed` for active state, highlighted background (`var(--primary)` + `#fff` text) when active.

### Editor Content Area
- `<EditorContent editor={editor} />` wrapped in `.blog-editor-content`
- Min-height 420px, comfortable 24px/28px padding
- Footer bar with word/char count + keyboard shortcut hint

### CSS (injected once via `<style dangerouslySetInnerHTML>`)
Full styling for `.blog-editor-content`:
- `.ProseMirror` — min-height 420px, padding, outline-none, caret-color primary
- `.ProseMirror:focus` — outline none
- `h1–h6` — bold, properly sized (h1 2rem → h6 0.9rem), margin
- `p` — 1em bottom margin, 1.75 line-height
- `ul, ol` — padding-left 1.6em, list-style disc/decimal
- `blockquote` — left border primary, italic, tinted background
- `pre` — dark bg `#0d0d18`, monospace font, padding 16px/18px, border-radius 8px, overflow-x auto
- `code` — violet-tinted bg, monospace, smaller font
- `pre code` — inherits pre styles
- `a` — color primary, underline
- `img` — max-width 100%, height auto, border-radius 8px
- `table` — border-collapse, width 100%, table-layout fixed
- `th, td` — border 1px, padding 8px/12px
- `th` — violet-tinted bg, bold
- `.selectedCell` — violet-tinted bg
- `mark` — yellow background
- `hr` — top border 2px, margin 1.6em 0
- YouTube wrapper: `[data-youtube-video]` AND `.youtube-wrapper` selectors (16:9 responsive, iframe absolute-positioned)
- Placeholder: `p.is-empty:first-child::before, p.is-editor-empty:first-child::before` — content attr(data-placeholder), muted color, float left, height 0, pointer-events none
- Task list: `ul[data-type="taskList"]` flex layout
- **highlight.js token theme** (github-dark inspired): .hljs-comment, .hljs-keyword, .hljs-string, .hljs-number, .hljs-title, .hljs-type, .hljs-variable, .hljs-tag, etc.

### React Patterns
- **Callback refs** for `onChange`, `onWordCountChange`, `onCharCountChange` — prevents editor recreation when parent passes new function identities. Editor created with `useEditor({}, [])` (empty deps).
- **External value sync**: `useEffect` watches `value` prop, calls `editor.commands.setContent(value, { emitUpdate: false })` only when `value !== editor.getHTML()` AND `!editor.isFocused` (prevents cursor jumping mid-edit).
- **`immediatelyRender: false`** — safe for SSR (avoid hydration mismatch).
- **`onUpdate`** calls `onChange(html)` + optional `onWordCountChange`/`onCharCountChange` via `editor.storage.characterCount.words()/characters()`.
- **`useCallback`** for all prompt handlers (promptLink, promptImage, promptYoutube, promptTable, clearFormatting).
- **Local state** for footer word/char count (subscribes to `update` + `selectionUpdate` editor events).
- **Empty-string safe**: `value ?? ""` everywhere; placeholder shows when empty.

### Keyboard Shortcuts (provided by extensions, no extra code)
- Ctrl/⌘+B (Bold), Ctrl/⌘+I (Italic), Ctrl/⌘+U (Underline), Ctrl/⌘+K (Link — StarterKit's Link keymap), Ctrl/⌘+Z (Undo), Ctrl/⌘+Shift+Z (Redo)

## Decisions / Notes
- **History**: TipTap v3 StarterKit already provides `UndoRedo` (the new name for History). The separate `@tiptap/extension-history` package is just a re-export of `UndoRedo` from `@tiptap/extensions`. Importing it alongside StarterKit would cause a duplicate-extension registration error, so History is supplied via StarterKit's `undoRedo` option. Keyboard shortcuts Ctrl+Z / Ctrl+Shift+Z still work.
- **Link**: StarterKit v3 includes a default Link with `openOnClick: true`. Disabled it (`link: false`) and registered our own with `openOnClick: false` per spec.
- **CodeBlock**: StarterKit has plain CodeBlock. Disabled it (`codeBlock: false`) and registered `CodeBlockLowlight` with a lowlight instance containing all grammars.
- **TextStyle & Table**: These packages have NO default export in v3.31.3 (only named exports). Used `import { TextStyle }` and `import { Table }` — the other extensions support both named and default.
- **Headings**: Font Awesome 6 Free lacks `fa-h1..fa-h4` icons (Pro only). Used small bold text labels ("H1", "H2", "H3", "H4") inside the buttons instead.
- **YouTube wrapper class**: The Youtube extension's `HTMLAttributes` option is applied to the iframe, not the outer `<div data-youtube-video>` wrapper. To support both selector patterns, I pass `HTMLAttributes: { class: "youtube-wrapper" }` (applied to iframe) AND also include a `[data-youtube-video]` selector in CSS — both rules produce the 16:9 responsive embed.

## Verification
- `npx eslint src/components/elevate/admin/BlogEditor.tsx` → exit 0 (no errors, no warnings)
- `npx tsc --noEmit --skipLibCheck` → no errors in BlogEditor.tsx
- Fixed TypeScript errors during development:
  1. `import TextStyle from "@tiptap/extension-text-style"` → `import { TextStyle }` (no default export)
  2. `import Table from "@tiptap/extension-table"` → `import { Table }` (no default export)
  3. `editor.commands.setContent(value, false)` → `editor.commands.setContent(value, { emitUpdate: false })` (v3 changed API — `SetContentOptions` is now an object, not a positional boolean)
- Removed unused imports: `useMemo`, `type Editor`
- The single remaining repo-wide lint error is in `src/components/elevate/AdminAuth.tsx:19` (setState-in-effect) — that file belongs to a different agent's task and is not part of BlogEditor.

## Status
- ✅ BlogEditor.tsx created at `/home/z/my-project/src/components/elevate/admin/BlogEditor.tsx`
- ✅ All 19 TipTap extensions + StarterKit configured per spec
- ✅ Full toolbar with all required buttons + active states
- ✅ Editor content CSS with all required selectors (headings, p, ul/ol, blockquote, pre, code, a, img, table, th/td, mark, hr, youtube-wrapper, placeholder, hljs tokens)
- ✅ External value sync with cursor-jump protection
- ✅ Callback refs to avoid editor recreation on parent re-render
- ✅ Optional word/char count callbacks wired in onUpdate
- ✅ Empty string safe (shows placeholder)
- ✅ Lint passes (0 errors) and TypeScript compiles cleanly for BlogEditor.tsx
