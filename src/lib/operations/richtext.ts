// Rich-text helpers: shared Tiptap extensions, plain<->doc migration, HTML render,
// and the controlled option lists for the formatting toolbar.
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import { generateHTML } from '@tiptap/react';
import { parseFormatting } from './formatting';
import { FontFamily, FontSize, LetterSpacing, LineHeight } from './tiptapExtras';
import type { TiptapDoc } from '@/lib/types';

// Warm material highlight palette — a marker on paper, never neon.
export const HIGHLIGHT_COLORS: { id: string; label: string; color: string }[] = [
  { id: 'cream',      label: 'Cream',           color: 'oklch(93% 0.05 90)' },
  { id: 'yellow',     label: 'Soft yellow',     color: 'oklch(89% 0.11 85)' },
  { id: 'ochre',      label: 'Muted ochre',     color: 'oklch(86% 0.11 70)' },
  { id: 'sage',       label: 'Muted sage',      color: 'oklch(88% 0.07 150)' },
  { id: 'terracotta', label: 'Dusty terracotta',color: 'oklch(85% 0.09 40)' },
  { id: 'brown',      label: 'Soft brown',      color: 'oklch(82% 0.06 50)' },
  { id: 'gray',       label: 'Neutral gray',    color: 'oklch(85% 0.01 70)' },
];

// Text colors — restrained, material-system members.
export const TEXT_COLORS: { id: string; label: string; color: string }[] = [
  { id: 'ink',        label: 'Ink',        color: 'var(--ink)' },
  { id: 'muted',      label: 'Muted',      color: 'var(--ink-2)' },
  { id: 'faint',      label: 'Faint',      color: 'var(--muted)' },
  { id: 'accent',     label: 'Amber',      color: 'var(--accent)' },
  { id: 'terracotta', label: 'Terracotta', color: 'oklch(45% 0.11 28)' },
  { id: 'sage',       label: 'Sage',       color: 'oklch(42% 0.09 150)' },
  { id: 'slate',      label: 'Slate',      color: 'oklch(42% 0.10 245)' },
  { id: 'plum',       label: 'Plum',       color: 'oklch(42% 0.10 300)' },
];

// Controlled font list — the app's loaded families only.
export const FONT_FAMILIES: { id: string; label: string; value: string }[] = [
  { id: 'sans',  label: 'Sans',  value: "var(--font-body)" },
  { id: 'serif', label: 'Serif', value: "var(--font-display)" },
  { id: 'mono',  label: 'Mono',  value: "var(--font-mono)" },
];

// Restrained size presets (manual; separate from heading styles).
export const FONT_SIZES: { id: string; label: string; value: string }[] = [
  { id: 'sm',   label: 'Small',    value: '13px' },
  { id: 'body', label: 'Body',     value: '15px' },
  { id: 'md',   label: 'Medium',   value: '17px' },
  { id: 'lg',   label: 'Large',    value: '20px' },
  { id: 'xl',   label: 'X-Large',  value: '24px' },
];

export const LINE_HEIGHTS: { id: string; label: string; value: string }[] = [
  { id: 'tight',   label: 'Tight',   value: '1.3' },
  { id: 'normal',  label: 'Normal',  value: '1.6' },
  { id: 'relaxed', label: 'Relaxed', value: '1.85' },
];

export const LETTER_SPACINGS: { id: string; label: string; value: string }[] = [
  { id: 'tight',  label: 'Tight',  value: '-0.01em' },
  { id: 'normal', label: 'Normal', value: '0' },
  { id: 'wide',   label: 'Wide',   value: '0.04em' },
  { id: 'wider',  label: 'Wider',  value: '0.09em' },
];

export function makeExtensions() {
  return [
    StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
    Underline,
    TextStyle,
    Color,
    FontFamily,
    FontSize,
    LetterSpacing,
    Highlight.configure({ multicolor: true }),
    Link.configure({ openOnClick: false, autolink: true, HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' } }),
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
    LineHeight,
    Placeholder.configure({ placeholder: "What's this about?" }),
  ];
}

/** Convert legacy plain text (with **bold** *italic* __underline__ marks) into a Tiptap doc. */
export function plainToDoc(text: string): TiptapDoc {
  const lines = (text ?? '').split('\n');
  const content = (lines.length ? lines : ['']).map(lineToParagraph);
  return { type: 'doc', content };
}
function lineToParagraph(line: string): TiptapDoc {
  if (!line) return { type: 'paragraph' };
  const spans = parseFormatting(line);
  const nodes: TiptapDoc[] = spans.map(s => {
    const marks: { type: string }[] = [];
    if ((s as { bold?: boolean }).bold) marks.push({ type: 'bold' });
    if ((s as { italic?: boolean }).italic) marks.push({ type: 'italic' });
    if ((s as { underline?: boolean }).underline) marks.push({ type: 'underline' });
    return { type: 'text', text: s.text, ...(marks.length ? { marks } : {}) };
  });
  return { type: 'paragraph', content: nodes };
}

/** Extract plain text from a doc (blocks joined by \n) — for the content mirror + title split. */
export function docToPlain(doc: TiptapDoc | null | undefined): string {
  if (!doc || !Array.isArray(doc.content)) return '';
  return doc.content.map(blockText).join('\n');
}
function blockText(n: TiptapDoc): string {
  if (n.text != null) return n.text;
  if (Array.isArray(n.content)) return n.content.map(blockText).join('');
  return '';
}

/** Render a doc to HTML (read-only view). Tiptap's schema is strict, so this is XSS-safe. */
export function docToHTML(doc: TiptapDoc | null | undefined): string {
  if (!doc) return '';
  try {
    return generateHTML(doc as never, makeExtensions());
  } catch {
    return '';
  }
}

/**
 * Outcome of committing a rich-text edit. There is deliberately NO "delete"
 * outcome: an empty node is a fully valid, persistent node and must never be
 * removed merely because `content === ''`.
 */
export type RichCommitPlan =
  | { kind: 'noop' }                                  // stay empty as-is (no store write, no history churn)
  | { kind: 'save'; doc: TiptapDoc; content: string }; // persist doc + plain mirror

/**
 * Decide what to do when a rich-text edit is committed.
 *
 * INVARIANT: empty content is valid. This never returns a deletion.
 *
 * `content` is the canonical plain-text mirror of a node, so a node "has no
 * text" exactly when its content is blank — whether or not an (empty) doc
 * object also exists. Committing blank text to a node that already has no text
 * is a true no-op, so a freshly-created empty node (or one cleared back to
 * empty) can be undone in a single step, with no spurious history entry from a
 * `updatedAt` bump. Every other case saves the doc + plain mirror normally.
 */
export function planRichCommit(
  prevContent: string,
  prevDoc: TiptapDoc | null | undefined,
  nextDoc: TiptapDoc,
  nextPlain: string,
): RichCommitPlan {
  void prevDoc; // content is the canonical mirror; doc presence alone says nothing about emptiness
  const wasBlank = !prevContent.trim();
  if (!nextPlain.trim() && wasBlank) return { kind: 'noop' };
  return { kind: 'save', doc: nextDoc, content: nextPlain };
}
