// Custom Tiptap v3 extensions: font-family, font-size, letter-spacing (inline marks)
// and line-height (block attribute). Self-contained — no extra packages.
import { Mark, Extension, mergeAttributes } from '@tiptap/core';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    fontFamily: { setFontFamily: (family: string) => ReturnType; unsetFontFamily: () => ReturnType };
    fontSize: { setFontSize: (size: string) => ReturnType; unsetFontSize: () => ReturnType };
    letterSpacing: { setLetterSpacing: (spacing: string) => ReturnType; unsetLetterSpacing: () => ReturnType };
    lineHeight: { setLineHeight: (lh: string) => ReturnType; unsetLineHeight: () => ReturnType };
  }
}

export const FontFamily = Mark.create({
  name: 'fontFamily',
  inclusive: false,
  addAttributes() {
    return {
      family: {
        default: null,
        parseHTML: (el: HTMLElement) => (el.style.fontFamily as string) || null,
        renderHTML: (a: Record<string, unknown>) => (a.family ? { style: `font-family: ${a.family}` } : {}),
      },
    };
  },
  renderHTML({ HTMLAttributes }) { return ['span', mergeAttributes(HTMLAttributes), 0]; },
  addCommands() {
    return {
      setFontFamily: (family: string) => ({ chain }: { chain: () => any }) => chain().setMark(this.name, { family }).run(),
      unsetFontFamily: () => ({ chain }: { chain: () => any }) => chain().unsetMark(this.name).run(),
    };
  },
});

export const FontSize = Mark.create({
  name: 'fontSize',
  inclusive: false,
  addAttributes() {
    return {
      size: {
        default: null,
        parseHTML: (el: HTMLElement) => (el.style.fontSize as string) || null,
        renderHTML: (a: Record<string, unknown>) => (a.size ? { style: `font-size: ${a.size}` } : {}),
      },
    };
  },
  renderHTML({ HTMLAttributes }) { return ['span', mergeAttributes(HTMLAttributes), 0]; },
  addCommands() {
    return {
      setFontSize: (size: string) => ({ chain }: { chain: () => any }) => chain().setMark(this.name, { size }).run(),
      unsetFontSize: () => ({ chain }: { chain: () => any }) => chain().unsetMark(this.name).run(),
    };
  },
});

export const LetterSpacing = Mark.create({
  name: 'letterSpacing',
  inclusive: false,
  addAttributes() {
    return {
      spacing: {
        default: null,
        parseHTML: (el: HTMLElement) => (el.style.letterSpacing as string) || null,
        renderHTML: (a: Record<string, unknown>) => (a.spacing ? { style: `letter-spacing: ${a.spacing}` } : {}),
      },
    };
  },
  renderHTML({ HTMLAttributes }) { return ['span', mergeAttributes(HTMLAttributes), 0]; },
  addCommands() {
    return {
      setLetterSpacing: (spacing: string) => ({ chain }: { chain: () => any }) => chain().setMark(this.name, { spacing }).run(),
      unsetLetterSpacing: () => ({ chain }: { chain: () => any }) => chain().unsetMark(this.name).run(),
    };
  },
});

// Line-height is a block-level attribute applied to paragraphs + headings.
export const LineHeight = Extension.create({
  name: 'lineHeight',
  addGlobalAttributes() {
    return [{
      types: ['paragraph', 'heading'],
      attributes: {
        lineHeight: {
          default: null,
          parseHTML: (el: HTMLElement) => (el.style.lineHeight as string) || null,
          renderHTML: (a: Record<string, unknown>) => (a.lineHeight ? { style: `line-height: ${a.lineHeight}` } : {}),
        },
      },
    }];
  },
  addCommands() {
    return {
      setLineHeight: (lh: string) => ({ chain }: { chain: () => any }) =>
        chain().updateAttributes('paragraph', { lineHeight: lh }).updateAttributes('heading', { lineHeight: lh }).run(),
      unsetLineHeight: () => ({ chain }: { chain: () => any }) =>
        chain().updateAttributes('paragraph', { lineHeight: null }).updateAttributes('heading', { lineHeight: null }).run(),
    };
  },
});
