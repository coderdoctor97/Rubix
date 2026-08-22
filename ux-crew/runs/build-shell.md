# BUILD — Shell Builder Report

> Session: resumed mid-run after previous builder interruption.
> Previous run already completed: `globals.css`, `Toolbar.tsx`, `ThemeToggle.tsx`,
> `DataPortability.tsx`, `ExportModal.tsx`, `Canvas.tsx`, `Node.tsx` — untouched this session
> (read-only reference).

## Files touched this session (4)

1. `src/components/ui/StatusBadge.tsx`
2. `src/components/Sidebar/Sidebar.tsx`
3. `src/components/Canvas/HelpPanel.tsx`
4. `src/components/Canvas/KnowledgeDialPanel.tsx`

## Per-file changes

### StatusBadge.tsx (plan C.1)
- Added `aria-label={`${STATUS_META[status].label} status — press to cycle`}` to the status-dot
  button; kept `title` and `onClick` unchanged. Reformatted the minified one-liner into readable
  JSX only.

### Sidebar.tsx (plan C.8 + role duties)
- Deleted the inline `PinIcon` SVG component (lines 21–29) per plan. **Contract gap:** plan says
  Phosphor `Pin`, but `Pin` does not exist in @phosphor-icons/react 2.1.10 (`index.d.ts` verified);
  used canonical `PushPinIcon` instead. All 3 pin buttons now render
  `<PushPinIcon size={13} weight={pinned ? 'fill' : 'regular'} aria-hidden="true" />` — the old
  `filled` prop maps to Phosphor's `weight` exactly as the plan prescribed.
- Pin button `aria-label`s made dynamic (`Pin folder` ⇄ `Unpin folder`) so the accessible name
  matches the visible `title` and actual action; previously it always said "Pin".
- Replaced raw hex `color="#f59e0b"` on both folder icons with `color="var(--amber)"` (hard rule:
  token colors only; plan Section E confirms `#f59e0b` ≡ `--amber`).
- De-emoji / de-glyph icon-only buttons (role duty: no emoji UI icons): `🗑` → `TrashIcon` ×3,
  `✎` → `PencilSimpleIcon` ×3, all `size={13} weight="regular" aria-hidden="true"`.
- Left as-is by design: `☰` / `«` toggles (plan §E explicitly keeps them), `＋ Folder` /
  `＋ Quick Note` text-label prefixes (Toolbar precedent), confirm-modal inline SVGs (unflagged,
  DataPortability precedent).

### HelpPanel.tsx (plan C.4)
- Removed `<span className="tooltip">Help</span>` from the `.faq-button` trigger (M-12).
- Trigger `<text fill="white">` → `style={{ fill: 'var(--on-accent)' }}` (token discipline;
  same rendered color; presentation attributes cannot carry `var()`, hence inline style).
- Close button glyph `×` → `<X size={16} weight="regular" aria-hidden="true" />` (design.md §10:
  `×` close → Phosphor `X`).
- Behavior untouched byte-for-byte: `helpOpen`/`setHelpOpen` store wiring, Escape window listener,
  focus-to-close-on-open + focus-restore-to-trigger cleanup, overlay click-outside,
  `role="dialog"` + `aria-modal` + `aria-labelledby="help-title"`, all stopPropagation calls.

### KnowledgeDialPanel.tsx (plan C.6)
- Mini donut: `<div className="dial-mini ui-float" role="button" tabIndex={0} …>` → real
  `<button type="button">`. Removed `role`, `tabIndex`, and the custom `onKeyDown` (native button
  supplies focus ring + Enter/Space keyboard model — the point of C-2). Kept both `onClick` and
  `onDoubleClick` → `setHeatmapMode('full')` and `onPointerDown` stopPropagation for parity.
- `title="Double-click to expand"` → `title="Expand knowledge dial"` (matches aria-label, M-22).
- Inner hide button stays nested per the plan's explicit note; its `onClick`/`onPointerDown`
  stopPropagation prevents double-fire. Glyphs `×` → `X`, `–` → `Minus` (design.md §10),
  size 14, regular weight, aria-hidden.
- Expanded panel handlers (`aside#legend`, dblclick→mini, minimize/hide buttons, legend markup)
  otherwise unchanged; `dial-legend-val` numeric readout relies on CSS-side tabular-nums per
  contract D (no markup change needed).

## Files with NO planned changes — left untouched

- `src/components/ui/Button.tsx` — plan C.10: "no change required". Untouched.
- `src/app/canvas/layout.tsx` — plan C.11: "no change required". Untouched.
- `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/canvas/[id]/page.tsx` — no plan items
  assigned. Untouched (theme boot script in layout.tsx never approached).
- `src/components/Canvas/ThemeManager.tsx` — design-plan.md assigns it no per-file section (it
  appears only in the file list and in M-4's shared focus-trap note). Per instructions ("if a
  file has no planned changes, leave it untouched"), untouched. Its `×` close glyph is a
  candidate for the same `X`-icon treatment in a follow-up pass.
- `SelectionHint.tsx` — plan C.9 no change (and not in this session's assignment).

## CSS requests / contract gaps

1. **`Pin` icon does not exist** in @phosphor-icons/react 2.1.10 — resolved locally with
   `PushPinIcon`; design-plan C.8 should be annotated accordingly.
2. Nested-button markup in `.dial-mini` (outer expand button contains inner hide button) is
   invalid HTML nesting; plan explicitly blesses it. A cleaner future structure would wrap both
   in a positioned container. No CSS change required now.
3. `.help-close` font-size 22 px was tuned for a text glyph; an icon at 16 px renders slightly
   smaller. Visual-only, no CSS request filed; flagging for Guardian/review eyes.
4. ThemeManager `×` close glyph still text (file out of scope this session) — future pass.

## Self-check results

- Raw-color scan (`#hex`/`rgb(`/`rgba(`) across all 4 edited files: **0 hits**.
- Emoji/off-voice glyph scan: remaining hits are sanctioned only (`☰` kept per plan §E; `→`
  arrows in help body copy; box-drawing in code comments). Zero emoji UI icons remain.
- `aria-hidden="true"` present on all 19 Phosphor icon usages in edited files; all icon-only
  buttons retain `aria-label`.
- Focus handling: global instant `button:focus-visible` ring confirmed in globals.css (lines
  211–224); HelpPanel focus restore + Escape logic untouched; native button keyboard model
  replaces removed div keydown handler.

## Parity statement

Store calls & handlers preserved exactly: `setHelpOpen(true/false)` (open, Escape, overlay,
close), trigger/close refs and focus restore; `setHeatmapMode('full')` via click+dblclick on
mini, `setHeatmapMode('mini')` via hide/minimize (all stopPropagation semantics intact);
Sidebar's `loadIndex`, `addFolder`, `addPage`, `renameFolder`, `renamePage`, `deletePage`,
`deleteFolder`, `toggleFolderPin`, `togglePagePin`, `movePageToFolder`, `setSidebarOpen`,
`router.push/replace`, drag-and-drop data flow, backup-before-delete flow — all untouched.
No persistence, lib, or store files modified.

## Validation

- `npx tsc --noEmit` → **exit 0, zero errors** (strict mode; tsconfig includes all `**/*.tsx`).
  Note: the expected pre-existing `tests/undo.test.ts(138,44)` TS2554 did **not** reproduce in
  this run — the tree type-checks fully clean. Nothing was fixed or touched in `tests/**`.
- Full build/test/shield gates belong to the Guardian per pipeline (not run here).
