'use client';
import { useEffect, useLayoutEffect, useReducer, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import {
  TextB, TextItalic, TextUnderline, TextStrikethrough, Code, Highlighter, Eraser,
  Palette, LinkSimple, ListNumbers, ListBullets, DotsThree,
  TextAlignLeft, TextAlignCenter, TextAlignRight, TextAlignJustify,
} from '@phosphor-icons/react';
import {
  makeExtensions, plainToDoc,
  HIGHLIGHT_COLORS, TEXT_COLORS, FONT_FAMILIES, FONT_SIZES, LINE_HEIGHTS, LETTER_SPACINGS,
} from '@/lib/operations/richtext';
import type { TiptapDoc } from '@/lib/types';

export default function RichEditor({ doc, plain, onCommit }: { doc: TiptapDoc | null | undefined; plain: string; onCommit: (doc: TiptapDoc, plain: string) => void; }) {
  const latest = useRef<{ doc: TiptapDoc | null; plain: string }>({ doc: null, plain: '' });
  const commitRef = useRef<() => void>(() => {});
  const wrapRef = useRef<HTMLDivElement>(null);
  commitRef.current = () => { const c = latest.current; if (c.doc) onCommit(c.doc, c.plain); };

  const editor = useEditor({
    extensions: makeExtensions(),
    content: (doc ?? plainToDoc(plain)) as never,
    autofocus: 'end',
    onUpdate: ({ editor }) => { latest.current = { doc: editor.getJSON() as unknown as TiptapDoc, plain: editor.getText({ blockSeparator: '\n' }) }; },
    onCreate: ({ editor }) => { latest.current = { doc: editor.getJSON() as unknown as TiptapDoc, plain: editor.getText({ blockSeparator: '\n' }) }; },
    editorProps: { handleKeyDown: (_view, event) => { if (event.key === 'Escape') commitRef.current(); return false; } },
  });
  useEffect(() => { if (editor) latest.current = { doc: editor.getJSON() as unknown as TiptapDoc, plain: editor.getText({ blockSeparator: '\n' }) }; }, [editor]);

  const onWrapperBlur = () => {
    setTimeout(() => {
      const active = document.activeElement;
      // Also check the floating toolbar (portaled to body — not inside wrapRef)
      const tb = document.querySelector('.rt-floating-toolbar');
      if (wrapRef.current && active && !wrapRef.current.contains(active) && (!tb || !tb.contains(active))) commitRef.current();
    }, 130);
  };

  return (
    <>
      <div className="node-editor-wrap" ref={wrapRef} onPointerDownCapture={e => e.stopPropagation()} onBlur={onWrapperBlur}>
        <EditorContent editor={editor} className="node-rt-editor" />
      </div>
      {editor && <FloatingToolbar editor={editor} targetRef={wrapRef} />}
    </>
  );
}

/* ---- Floating contextual toolbar (portaled to document.body, tracks node via rAF) ---- */
function FloatingToolbar({ editor, targetRef }: { editor: Editor; targetRef: React.RefObject<HTMLDivElement> }) {
  const tbRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    let raf = 0;
    const update = () => {
      const card = targetRef.current?.closest?.('.node-card') as HTMLElement | null;
      const tb = tbRef.current;
      if (card && tb) {
        const cr = card.getBoundingClientRect();
        const tr = tb.getBoundingClientRect();
        const gap = 10;
        let top = cr.top - tr.height - gap;
        if (top < 8) top = cr.bottom + gap; /* flip below if not enough room */
        let left = cr.left + cr.width / 2 - tr.width / 2;
        left = Math.max(8, Math.min(left, window.innerWidth - tr.width - 8)); /* clamp */
        tb.style.top = `${Math.round(top)}px`;
        tb.style.left = `${Math.round(left)}px`;
      }
      raf = requestAnimationFrame(update);
    };
    update();
    return () => cancelAnimationFrame(raf);
  }, [targetRef]);

  return createPortal(
    <div ref={tbRef} className="rt-floating-toolbar" role="toolbar" aria-label="Text formatting">
      <FormatToolbar editor={editor} />
    </div>,
    document.body
  );
}

type MenuId = 'hl' | 'color' | 'font' | 'size' | 'link' | 'more' | null;

function TBtn({ label, title, active, onClick, children }: { label: string; title: string; active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" className={`rt-btn${active ? ' is-active' : ''}`} title={title} aria-label={label} aria-pressed={active}
      onMouseDown={e => e.preventDefault()} onClick={onClick}>{children}</button>
  );
}
function Pop({ menuId, menu, setMenu, title, label, active, trigger, children, width }: { menuId: Exclude<MenuId, null>; menu: MenuId; setMenu: (m: MenuId) => void; title: string; label: string; active: boolean; trigger: ReactNode; children: ReactNode; width?: number }) {
  const open = menu === menuId;
  return (
    <div className="rt-pop">
      <button type="button" className={`rt-btn${active ? ' is-active' : ''}`} title={title} aria-label={label} aria-haspopup="menu" aria-expanded={open}
        onMouseDown={e => e.preventDefault()} onClick={() => setMenu(open ? null : menuId)}>{trigger}</button>
      {open && <div className="rt-menu" style={width ? { minWidth: width } : undefined}>{children}</div>}
    </div>
  );
}
function Opt({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return <button type="button" className={`rt-opt${active ? ' is-active' : ''}`} onMouseDown={e => e.preventDefault()} onClick={onClick}>{label}</button>;
}

function FormatToolbar({ editor }: { editor: Editor }) {
  const [, force] = useReducer(x => x + 1, 0);
  const [menu, setMenu] = useState<MenuId>(null);
  useEffect(() => {
    const h = () => force();
    editor.on('transaction', h); editor.on('selectionUpdate', h);
    return () => { editor.off('transaction', h); editor.off('selectionUpdate', h); };
  }, [editor]);

  const isH = (lvl: number) => editor.isActive('heading', { level: lvl });
  const hlColor = (editor.getAttributes('highlight').color as string | undefined) ?? '';
  const textColor = (editor.getAttributes('textStyle').color as string | undefined) ?? '';
  const fam = FONT_FAMILIES.find(f => f.value === (editor.getAttributes('fontFamily').family as string | undefined));
  const sz = FONT_SIZES.find(f => f.value === (editor.getAttributes('fontSize').size as string | undefined));
  const lhAttr = (editor.getAttributes('paragraph').lineHeight || editor.getAttributes('heading').lineHeight) as string | undefined;
  const lh = LINE_HEIGHTS.find(l => l.value === lhAttr);
  const ls = LETTER_SPACINGS.find(l => l.value === (editor.getAttributes('letterSpacing').spacing as string | undefined));
  const align = editor.isActive({ textAlign: 'center' }) ? 'center' : editor.isActive({ textAlign: 'right' }) ? 'right' : editor.isActive({ textAlign: 'justify' }) ? 'justify' : 'left';

  return (
    <div className="rt-toolbar" onPointerDownCapture={e => e.stopPropagation()}>
      <TBtn label="Paragraph" title="Paragraph" active={!isH(1) && !isH(2) && !isH(3)} onClick={() => editor.chain().focus().setParagraph().run()}><span className="rt-glyph">¶</span></TBtn>
      <TBtn label="Heading 1" title="Heading 1" active={isH(1)} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}><span className="rt-glyph">H1</span></TBtn>
      <TBtn label="Heading 2" title="Heading 2" active={isH(2)} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}><span className="rt-glyph">H2</span></TBtn>
      <span className="rt-sep" />
      <TBtn label="Bold" title="Bold (⌘B)" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}><TextB size={16} weight="bold" aria-hidden="true" /></TBtn>
      <TBtn label="Italic" title="Italic (⌘I)" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}><TextItalic size={16} weight="bold" aria-hidden="true" /></TBtn>
      <TBtn label="Underline" title="Underline (⌘U)" active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()}><TextUnderline size={16} weight="bold" aria-hidden="true" /></TBtn>
      <TBtn label="Strikethrough" title="Strikethrough" active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()}><TextStrikethrough size={16} weight="bold" aria-hidden="true" /></TBtn>
      <span className="rt-sep" />
      <Pop menuId="hl" menu={menu} setMenu={setMenu} title="Highlight" label="Highlight" active={editor.isActive('highlight')} trigger={<Highlighter size={16} weight="bold" aria-hidden="true" />}>
        <div className="rt-swatches rt-swatches-menu">
          <button type="button" className="rt-swatch rt-swatch-none" title="No highlight" aria-label="No highlight" onMouseDown={e => e.preventDefault()} onClick={() => { editor.chain().focus().unsetHighlight().run(); setMenu(null); }}>×</button>
          {HIGHLIGHT_COLORS.map(h => (
            <button key={h.id} type="button" className={`rt-swatch${hlColor === h.color ? ' is-active' : ''}`} title={h.label} aria-label={h.label} aria-pressed={hlColor === h.color} style={{ background: h.color }}
              onMouseDown={e => e.preventDefault()} onClick={() => { editor.chain().focus().toggleHighlight({ color: h.color }).run(); setMenu(null); }} />
          ))}
        </div>
      </Pop>
      <Pop menuId="color" menu={menu} setMenu={setMenu} title="Text colour" label="Text colour" active={!!textColor} trigger={<Palette size={16} weight="bold" aria-hidden="true" />}>
        <div className="rt-swatches rt-swatches-menu">
          <button type="button" className="rt-swatch rt-swatch-none" title="Default colour" aria-label="Default colour" onMouseDown={e => e.preventDefault()} onClick={() => { editor.chain().focus().unsetColor().run(); setMenu(null); }}>×</button>
          {TEXT_COLORS.map(c => (
            <button key={c.id} type="button" className={`rt-swatch${textColor === c.color ? ' is-active' : ''}`} title={c.label} aria-label={c.label} aria-pressed={textColor === c.color} style={{ background: c.color }}
              onMouseDown={e => e.preventDefault()} onClick={() => { editor.chain().focus().setColor(c.color).run(); setMenu(null); }} />
          ))}
        </div>
      </Pop>
      <Pop menuId="link" menu={menu} setMenu={setMenu} title="Link" label="Link" active={editor.isActive('link')} trigger={<LinkSimple size={16} weight="bold" aria-hidden="true" />} width={190}>
        <LinkMenu editor={editor} onDone={() => setMenu(null)} />
      </Pop>
      <span className="rt-sep" />
      <TBtn label="Numbered list" title="Numbered list" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}><ListNumbers size={16} weight="bold" aria-hidden="true" /></TBtn>
      <TBtn label="Bulleted list" title="Bulleted list" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}><ListBullets size={16} weight="bold" aria-hidden="true" /></TBtn>
      <Pop menuId="more" menu={menu} setMenu={setMenu} title="Alignment & spacing" label="More formatting" active={false} trigger={<DotsThree size={16} weight="bold" aria-hidden="true" />} width={176}>
        <div className="rt-row">
          <TBtn label="Align left" title="Align left" active={align === 'left'} onClick={() => editor.chain().focus().setTextAlign('left').run()}><TextAlignLeft size={16} weight="bold" aria-hidden="true" /></TBtn>
          <TBtn label="Align centre" title="Align centre" active={align === 'center'} onClick={() => editor.chain().focus().setTextAlign('center').run()}><TextAlignCenter size={16} weight="bold" aria-hidden="true" /></TBtn>
          <TBtn label="Align right" title="Align right" active={align === 'right'} onClick={() => editor.chain().focus().setTextAlign('right').run()}><TextAlignRight size={16} weight="bold" aria-hidden="true" /></TBtn>
        </div>
        <div className="rt-label">Line height</div>
        <div className="rt-row rt-row-wrap">
          {LINE_HEIGHTS.map(l => <Opt key={l.id} label={l.label} active={lh?.id === l.id} onClick={() => { editor.chain().focus().setLineHeight(l.value).run(); setMenu(null); }} />)}
        </div>
        <div className="rt-label">Letter spacing</div>
        <div className="rt-row rt-row-wrap">
          {LETTER_SPACINGS.map(l => <Opt key={l.id} label={l.label} active={ls?.id === l.id} onClick={() => { (l.id === 'normal' ? editor.chain().focus().unsetLetterSpacing().run() : editor.chain().focus().setLetterSpacing(l.value).run()); setMenu(null); }} />)}
        </div>
      </Pop>
      <span className="rt-sep" />
      <TBtn label="Clear formatting" title="Clear formatting" active={false} onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}><Eraser size={16} weight="bold" aria-hidden="true" /></TBtn>
    </div>
  );
}

function LinkMenu({ editor, onDone }: { editor: Editor; onDone: () => void }) {
  const [url, setUrl] = useState('');
  useEffect(() => { setUrl((editor.getAttributes('link').href as string | undefined) ?? ''); }, [editor]);
  const apply = () => { const href = url.trim(); if (href) editor.chain().focus().setLink({ href }).run(); onDone(); };
  const remove = () => { editor.chain().focus().unsetLink().run(); onDone(); };
  return (
    <div className="rt-link">
      <input className="rt-link-input" type="url" placeholder="https://" value={url} onChange={e => setUrl(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); apply(); } }} aria-label="Link URL" />
      <div className="rt-link-actions">
        <button type="button" className="rt-opt is-primary" onMouseDown={e => e.preventDefault()} onClick={apply}>Apply</button>
        <button type="button" className="rt-opt" onMouseDown={e => e.preventDefault()} onClick={remove} disabled={!editor.isActive('link')}>Remove</button>
      </div>
    </div>
  );
}
