# SYNAPSE UX Crew — Design Plan

> **Locked planning artifact.** Builders implement against this contract only.
> Design Lead owns `design.md` and `globals.css`. Class contract is the shared vocabulary between TSX and CSS edits.
> globals.css rewrite (Step B1) is Design Lead's BUILD-wave contribution — listed in the CSS section for reference but not executed in this phase.

---

## System Declaration

- **Genre:** modern-minimal · **Tone:** utilitarian · **Anchor hue:** indigo (H≈240°)
- **Fonts:** Inter (400/500/600/700 body) + Sora (600/700 display)
- **Motion:** counter 150 ms · state-lift 200 ms · panel-enter 220 ms ease-out · no overshoot ever
- **Icon voice:** Phosphor only · 16 px toolbar · 14 px node-actions · `aria-hidden="true"` decorative
- **Anti-slop:** no purple-gradient · no colour-only status · no purposeless blur · no bounce · no raw hex outside token block · one orchestrated entrance max · silent success

Pre-emit self-critique scores:
- Philosophy: 5 · Hierarchy: 4 · Execution: 5 · Specificity: 4 · Restraint: 5 · Variety: 4

---

## Summary of All HIGH and MEDIUM Audit Findings

| Finding | Severity | Decision | Reason |
|---|---|---|---|
| C-1 StatusBadge: colour-only, no aria-label | CRITICAL | **Resolve** | Add `aria-label`; dot already has role as visual indicator; chip row adds text signal |
| C-2 KnowledgeDialPanel: div[role=button], no focus ring | CRITICAL | **Resolve** | Replace `<div role="button">` with `<button>`; browser supplies focus ring + keyboard model |
| C-3 "CREATE MINDMAP" misidentifies product | CRITICAL | **Resolve** | Change to "CREATE A CANVAS" |
| C-4 `--faint` dark contrast ~3.83:1 fails WCAG AA | CRITICAL | **Resolve** | Raise dark `--faint` to `#7b869e` → ~4.91:1 against `--surface` |
| M-1 Icon-only node buttons lack aria-labels | MAJOR | **Resolve** | Add `aria-label` to add, drag-handle, delete buttons; replace Unicode glyphs with Phosphor |
| M-2 Palette `role="menu"` without arrow-key nav | MAJOR | **Resolve** | Remove `role="menu"`; swatches already have `aria-label`; Tab navigation sufficient |
| M-3 Zoom buttons lack accessible names | MAJOR | **Resolve** | Add `aria-label="Zoom out"`, `aria-label="Reset zoom"`, `aria-label="Zoom in"` |
| M-4 No focus trap in modals | MAJOR | **Resolve** | Builder phase: add focus-trap behaviour to all three modals (HelpPanel, ThemeManager, ExportModal, DataPortability error/confirm) |
| M-5 `.icon-btn` (22×22), `.heatmap-icon-btn` (20×20), `.palette-swatch` (22×22), `.resize-grip` (16×16) below 24×24 WCAG 2.5.8 AA | MAJOR | **Resolve** | Increase all to ≥ 24×24 effective hit area via padding or size increase |
| M-6 `.dial-seg` animation has no `prefers-reduced-motion` guard | MAJOR | **Resolve** | Add `@media (prefers-reduced-motion: reduce) { .dial-seg { animation: none; } }` |
| M-7 ThemeSwitch: 9 raw hex + 1 raw rgb in globals.css + local `--light`/`--dark` in styled-components | MAJOR | **Resolve** | Lift all 6 distinct colours to named tokens; remove styled-components local scope |
| M-8 Purple-to-blue gradient on `.brand-logo` and `.faq-button`/`.tooltip` | MAJOR | **Resolve** | Replace `.brand-logo` gradient with `var(--accent)` solid; replace `.faq-button` gradient with solid `var(--accent)` |
| M-9 Glassmorphism without purpose on 5 surfaces | MAJOR | **Resolve** | Remove `backdrop-filter: blur()` from `.ui-float`, `.empty-card`, `.node-palette`, `.selection-hint`, `.focus-exit-pill`, `.help-trigger`; retain on modal overlays only |
| M-10 Mismatched icon libraries (MUI + Phosphor + inline SVG + Unicode) | MAJOR | **Resolve** | Migrate all MUI icons to Phosphor; replace inline SVGs and Unicode glyphs with Phosphor |
| M-11 Bouncy overshoot cubic-bezier on theme-switch slider | MAJOR | **Resolve** | Replace with `ease-out` (`cubic-bezier(.2,0,0,1)`) |
| M-12 Hover-only tooltip on faq-button | MAJOR | **Resolve** | Remove tooltip entirely; `aria-label="Help and shortcuts"` already names the button |
| M-13 Jello animation on faq-button hover | MAJOR | **Resolve** | Remove `jello-vertical` keyframes and animation rule entirely |
| M-14 `--dot-grid` declared 3×; intermediate values are dead code | MAJOR | **Resolve** | Keep only final definition (line 983); delete lines 50 and 816–817 |
| M-15 3 px left border stripe on `.node-card` — colour-only status signal | MAJOR | **Resolve** | Remove `border-left: 3px solid transparent` and all `.status-failed`/`.status-review`/`.status-mastered` left-border rules; status is carried by `.status-dot` + chips |
| M-16 `border-right` on `.sidebar` and `.sidebar-collapsed` — breaks RTL | MAJOR | **Resolve** | Change to `border-inline-end` |
| M-17 `border-left` on `.portability-bar` separator — breaks RTL | MINOR | **Resolve** | Change to `border-inline-start` |
| M-18 `--danger`, `--brand-secondary`, `--brand-shadow`, `--accent-shadow`, `--radius` missing from dark-theme block | MAJOR | **Resolve** | Add dark-theme overrides for all five |
| M-19 `--node-content` 13.5px/500 is an unnamed type-scale step | MINOR | **Resolve** | Document as `--text-node` role token in `design.md` (done §2); CSS uses the named role |
| M-20 Overshoot cubic-bezier on node-enter and modal-enter animations | MEDIUM | **Resolve** | Replace `cubic-bezier(.2,.9,.3,1.2)` / `cubic-bezier(.2,.9,.3,1.15)` with `ease-out` |
| M-21 Identical "Type something…" placeholder in node and annotation | MEDIUM | **Resolve** | Node: "What's this about?" · Annotation: "Add a note…" |
| M-22 Tooltip says "Double-click to expand" but single-click also expands | MEDIUM | **Resolve** | Remove `title="Double-click to expand"`; use `title="Expand knowledge dial"` or remove entirely |
| M-23 "Not valid JSON." error says nothing about recovery | HIGH | **Resolve** | "The file isn't valid JSON. Check the file and try again." |
| M-24 `ImageSquare` rendered with `color="#fff5fb"` — inline hex bypasses theme | MINOR | **Resolve** | Replace `color="#fff5fb"` with `color="var(--on-accent)"` |
| M-25 `border-left: 1px solid var(--line)` on `.tb-cluster .portability-bar` | MINOR | **Resolve** | Change to `border-inline-start` |
| — | — | **Reject** | `[data-theme="dark"] .sidebar-folder-icon svg { color: #f59e0b }` — amber icon colour is intentional brand colour for folder icons in dark mode; not a token drift (the value `#f59e0b` = `--amber` already declared) — replace with `var(--amber)` |

---

## Section A — Design Lead Owns (CSS + design.md)

**`src/app/globals.css`** — Design Lead BUILD-wave rewrite. Listed here for the class contract only; edits happen in BUILD phase.

### A.1 Token-block changes (lines 26–95)

**Add to `:root`** (new tokens):
```
--radius-sm: 8px;
--radius-xs: 6px;
--radius-full: 999px;
--radius-brand: 9px;
--node-width: 280px;
--node-min-h: 60px;
--space-node-pad: 10px;
--toggle-track: #2a2a2a;
--toggle-knob: #d8dbe0;
--toggle-sun: #ffcf48;
--toggle-moon: #00a6ff;
--brand-fill: var(--accent);    /* deprecated --brand-secondary no longer used visually */
--accent-shadow: rgba(79,70,229,.5);
--text-node: 13.5px;            /* font-size role token — see §2 of design.md */
```

**Change in `:root`:**
- Line 50: delete `--dot-grid: #c3cad8;` (superseded by line 983)
- Line 54: keep `--brand-secondary` token name (API frozen) but value is no longer used visually

**Add to `[data-theme="dark"]`**:
```
--radius: 12px;
--radius-sm: 8px;
--radius-xs: 6px;
--radius-full: 999px;
--radius-brand: 9px;
--faint: #7b869e;              /* was #6a7386 — raised for 4.91:1 contrast */
--accent-shadow: rgba(139,147,248,.5);
--toggle-track: #2a2a2a;
--toggle-knob: #d8dbe0;
--toggle-sun: #ffcf48;
--toggle-moon: #00a6ff;
```

**Remove from `[data-theme="dark"]`** (will be moved to the V2-19 refinement block):
- Lines 816–817: delete `:root{ --dot-grid: rgba(100,116,139,.18); }` and its dark override

### A.2 `.node-card` changes (lines 127–152)

**Remove:**
```css
border-left: 3px solid transparent;
```
```css
.node-card.status-failed  { border-left-color: var(--red); }
.node-card.status-review  { border-left-color: var(--amber); }
.node-card.status-mastered{ border-left-color: var(--green); }
```

**Change:**
```css
padding: 10px 10px 10px 11px;  /* old — asymmetric */
/* becomes */
padding: var(--space-node-pad); /* 10px uniform */
```

**Animation overshoot fix (line 148):**
```css
.node-card.node-enter{ animation: nodeIn .32s cubic-bezier(.2,.9,.3,1.2); }
/* becomes */
.node-card.node-enter{ animation: nodeIn .32s var(--ease-out); }
```

**Add** (for inline chip styles — Shell Builder will use this class instead of inline `style`):
```css
.chip-failed  { color: var(--red);   border-color: color-mix(in srgb, var(--red) 27%, transparent); background: color-mix(in srgb, var(--red) 8%, transparent); }
.chip-review  { color: var(--amber); border-color: color-mix(in srgb, var(--amber) 27%, transparent); background: color-mix(in srgb, var(--amber) 8%, transparent); }
.chip-mastered{ color: var(--green); border-color: color-mix(in srgb, var(--green) 27%, transparent); background: color-mix(in srgb, var(--green) 8%, transparent); }
```

### A.3 `.brand-logo` (line 252–257)

```css
/* old */
background: linear-gradient(135deg, #4f46e5, #7c3aed);
/* new */
background: var(--accent);
```
Box-shadow: keep `var(--brand-shadow)` → replace with `var(--accent-shadow)`.

### A.4 `.ui-float` (lines 234–242)

```css
/* Remove */
backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
```

### A.5 `.empty-card` (lines 324–341)

```css
/* Remove */
backdrop-filter: blur(10px);
```

### A.6 `.help-trigger` (lines 401–413) — merge into `.faq-button`

Delete the entire `.help-trigger` block (lines 401–413). The `.faq-button` rules at lines 750–756 replace it.

### A.7 `.faq-button` and `.tooltip` (lines 669–748)

**Replace `.faq-button`** (lines 669–712):
```css
.faq-button {
  width: 50px; height: 50px; border-radius: 50%;
  border: none;
  background: var(--accent);              /* was gradient */
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  box-shadow: var(--shadow-md);
  position: fixed; right: 16px; bottom: 16px; z-index: 30;
  transition: background .13s ease, transform .1s ease;
}
.faq-button:hover { background: var(--accent-hover); }
.faq-button:active { transform: scale(.96); }
.faq-button svg { height: 1.5em; fill: none; stroke: currentColor; stroke-width: 2; }
/* REMOVE: jello-vertical animation and .faq-button:hover svg animation rule entirely */
```

**Replace `.tooltip`** (lines 714–748):
```css
/* Delete entirely — the aria-label already names the button; tooltip is redundant */
```

**Delete** the hover-only tooltip reveal rule (`.faq-button:hover .tooltip`).

### A.8 `.theme-switch` (lines 613–667)

Replace all raw hex with token vars:
```css
.theme-switch .slider { background: var(--toggle-track); }
.theme-switch .slider:before { box-shadow: inset 8px -4px 0 0 var(--toggle-knob); }
.theme-switch input:checked + .slider { background: var(--toggle-moon); }
.theme-switch input:checked + .slider:before { transform: translateX(1.8em); box-shadow: inset 15px -4px 0 15px var(--toggle-sun); }
.theme-switch .star { background: var(--toggle-knob); }
/* Remove bouncy easing */
.theme-switch .slider:before { transition-timing-function: var(--ease-out); }
```

### A.9 `.node-palette` (line 519–521)

```css
/* Remove */
backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
```

### A.10 `.selection-hint` (line 603)

```css
/* Remove */
backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
```

### A.11 `.focus-exit-pill` (line 955–964)

```css
/* Remove */
backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
```

### A.12 `.tb-cluster` (line 766–775)

```css
/* Remove */
backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
```

### A.13 `.sidebar` / `.sidebar-collapsed` (lines 552–553)

```css
/* old */
border-right: 1px solid var(--line);
/* new */
border-inline-end: 1px solid var(--line);
```

### A.14 `.tb-cluster .portability-bar` (line 783)

```css
/* old */
border-left: 1px solid var(--line);
/* new */
border-inline-start: 1px solid var(--line);
```

### A.15 Modal animation overshoot (line 355)

```css
/* old */
animation: nodeIn .22s cubic-bezier(.2,.9,.3,1.15);
/* new */
animation: nodeIn .22s var(--ease-out);
```

### A.16 `.help-modal` animation (line 428)

```css
/* old */
animation: nodeIn .22s cubic-bezier(.2,.9,.3,1.15);
/* new */
animation: nodeIn .22s var(--ease-out);
```

### A.17 `.dial-seg` — add reduced-motion guard

After line 304:
```css
@media (prefers-reduced-motion: reduce) {
  .dial-seg { animation: none; }
}
```

### A.18 `.resize-grip` — increase hit area to 24×24

```css
.resize-grip {
  /* old: width: 16px; height: 16px; */
  width: 24px; height: 24px;
  /* visual grip remains 7×7 via ::before */
}
```

### A.19 `.heatmap-icon-btn` — increase to 24×24

```css
.heatmap-icon-btn {
  /* old: width: 20px; height: 20px; */
  width: 24px; height: 24px;
}
```

### A.20 `.icon-btn` — increase to 24×24

```css
.icon-btn {
  /* old: width: 22px; height: 22px; */
  width: 24px; height: 24px;
}
```

### A.21 `.palette-swatch` — increase to 24×24

```css
.palette-swatch {
  /* old: width: 22px; height: 22px; */
  width: 24px; height: 24px;
}
@media (max-width: 480px) {
  .palette-swatch { width: 24px; height: 24px; }  /* was 20px */
}
```

### A.22 `[data-theme="dark"] .sidebar-folder-icon svg` (line 995)

```css
/* old */
color: #f59e0b;
/* new */
color: var(--amber);
```

### A.23 Remove duplicate `:root` and `[data-theme="dark"]` dot-grid blocks (lines 816–817)

Delete lines 816–817 entirely. The final definition at line 983 is canonical.

### A.24 Remove `--dot-grid` from line 50

Delete `--dot-grid: #c3cad8;` from the main `:root` token block (line 50).

---

## Section B — Canvas Builder Owns

**Files:** `src/components/Canvas/Canvas.tsx`, `src/components/Canvas/Node.tsx`

### B.1 `Canvas.tsx` changes

**Line 40 — Empty state headline:**
```tsx
{/* old */} <h2>CREATE MINDMAP</h2><p>a vision for your visual memory</p>
{/* new */} <h2>CREATE A CANVAS</h2><p>Create a root node and start building your topic tree.</p>
```

**Line 45 — Zoom button accessible names:**
```tsx
{/* old */} <button className="zb-btn" onClick={...changeZoom...}>−</button>
{/* new */} <button className="zb-btn" onClick={...} aria-label="Zoom out">−</button>

{/* old */} <button className="zb-btn" id="zoom-label" onClick={...}>{...}%</button>
{/* new */} <button className="zb-btn" id="zoom-label" onClick={...} aria-label="Reset zoom">{...}%</button>

{/* old */} <button className="zb-btn" onClick={...}>＋</button>
{/* new */} <button className="zb-btn" onClick={...} aria-label="Zoom in">＋</button>
```

**Lines 10–11 — Replace MUI icons with Phosphor:**
```tsx
{/* remove */} import FitScreenIcon from '@mui/icons-material/FitScreen';
{/* remove */} import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
{/* add */}    import {MagnifyingGlass, MagicWand} from '@phosphor-icons/react';

{/* in JSX */}  {/* FitScreenIcon → <MagnifyingGlass size={16} weight="regular" aria-hidden="true" /> */}
{/* in JSX */}  {/* AutoFixHighIcon → <MagicWand size={16} weight="regular" aria-hidden="true" /> */}
```

**Empty state card** (line 40): add `aria-label="Create a new canvas"` to the outer `<div role="button">` (already has `tabIndex` and keyboard handler).

### B.2 `Node.tsx` changes

**Line 75 — Replace Unicode glyphs with Phosphor icons + add aria-labels:**
```tsx
{/* old */}
<button className="icon-btn add" onClick={()=>createChild(node.id)}>＋</button>
<button className="icon-btn drag-handle" onPointerDown={e=>e.stopPropagation()}>⣿</button>
<button className="icon-btn danger" onClick={()=>{...remove(node.id)}}>♲</button>

{/* new */}
<button className="icon-btn add" onClick={()=>createChild(node.id)} aria-label="Add child node">
  <Plus size={14} weight="regular" aria-hidden="true" />
</button>
<button className="icon-btn drag-handle" onPointerDown={e=>e.stopPropagation()} aria-label="Drag handle">
  <GripVertical size={14} weight="regular" aria-hidden="true" />
</button>
<button className="icon-btn danger" onClick={()=>{...remove(node.id)}} aria-label="Delete node and descendants">
  <Trash size={14} weight="regular" aria-hidden="true" />
</button>
```
Add import: `import {Plus, GripVertical, Trash} from '@phosphor-icons/react';` (replace `PaletteIcon` import — keep PaletteIcon).

**Line 85 — Replace inline chip styles with CSS classes:**
```tsx
{/* old */}
<span className="chip" style={{color:STATUS_META[k].color,borderColor:`${STATUS_META[k].color}44`,background:`${STATUS_META[k].color}14`}}>
{/* new */}
<span className={`chip chip-${k}`}>
```

**Line 38 — Placeholder copy:**
```tsx
{/* old */} placeholder="Type something…"
{/* new */} placeholder="What's this about?"
```

**Palette container (line 78) — remove broken role:**
```tsx
{/* old */} <div className="palette-palette" ... role="menu" aria-label="Node color palette">
{/* new */} <div className="palette-palette" ... aria-label="Node color palette">
{/* role="menu" removed — Tab navigation is sufficient for a flat swatch list */}
```

**Node card — remove left-border status stripe:**
The CSS class `.status-failed`, `.status-review`, `.status-mastered` left-border rules are removed by Design Lead in globals.css. No markup change needed in Node.tsx — the `status-${node.status}` class stays on the card for `.status-dot` colouring only.

### B.3 Classes used by Canvas Builder (no rename — added to contract)

| Class | Used in | Notes |
|---|---|---|
| `node-card` | Node.tsx | Status stripe left-border removed from CSS |
| `node-enter` | Node.tsx | Animation easing fixed to `ease-out` |
| `node-reveal` | Node.tsx | Unchanged |
| `status-dot` | StatusBadge.tsx → Node.tsx | `aria-label` added in StatusBadge |
| `dot-failed/dot-review/dot-mastered` | StatusBadge.tsx | Unchanged |
| `icon-btn` | Node.tsx | Size increased to 24×24 |
| `icon-btn add` | Node.tsx | Phosphor Plus icon |
| `icon-btn drag-handle` | Node.tsx | Phosphor GripVertical icon |
| `icon-btn danger` | Node.tsx | Phosphor Trash icon |
| `icon-btn palette tint` | Node.tsx | Unchanged |
| `palette-palette` | Node.tsx | `role="menu"` removed |
| `palette-swatch` | Node.tsx | Size increased to 24×24 |
| `palette-swatch palette-clear` | Node.tsx | Unchanged |
| `node-content` | Node.tsx | Placeholder text updated |
| `node-editor` | Node.tsx | Placeholder text updated |
| `chip` | Node.tsx | `chip-failed/review/mastered` classes replace inline styles |
| `chip-failed` | Node.tsx | New — CSS class for failed chip colours |
| `chip-review` | Node.tsx | New — CSS class for review chip colours |
| `chip-mastered` | Node.tsx | New — CSS class for mastered chip colours |
| `node-meta` | Node.tsx | Unchanged |
| `resize-grip` | Node.tsx | Size increased to 24×24 |
| `chevron` | Node.tsx | Unchanged |
| `node-actions` | Node.tsx | Unchanged |
| `node-top` | Node.tsx | Unchanged |
| `node-main` | Node.tsx | Unchanged |
| `node-card is-editing` | Node.tsx | Unchanged |
| `node-card is-tinted` | Node.tsx | Unchanged |
| `node-card is-selected` | Node.tsx | Unchanged |
| `node-card is-sized` | Node.tsx | Unchanged |
| `node-card node-enter` | Node.tsx | Animation easing fixed |
| `node-card node-reveal` | Node.tsx | Unchanged |

---

## Section C — Shell Builder Owns

**Files:**
- `src/components/Canvas/Toolbar.tsx`
- `src/components/Canvas/ThemeToggle.tsx`
- `src/components/Canvas/HelpPanel.tsx`
- `src/components/Canvas/DataPortability.tsx`
- `src/components/Canvas/ExportModal.tsx`
- `src/components/Canvas/KnowledgeDialPanel.tsx`
- `src/components/Canvas/SelectionHint.tsx`
- `src/components/Sidebar/Sidebar.tsx`
- `src/components/ui/StatusBadge.tsx`
- `src/components/ui/Button.tsx`
- `src/app/canvas/layout.tsx`

### C.1 `StatusBadge.tsx` — add accessible name (CRITICAL)

```tsx
{/* old */}
export default function StatusBadge({status,onClick}:{status:Status;onClick:()=>void}){
  return <button className={`status-dot dot-${status}`} onClick={onClick}
    title={`${STATUS_META[status].label} — click to change`}/>}

{/* new */}
export default function StatusBadge({status,onClick}:{status:Status;onClick:()=>void}){
  return <button className={`status-dot dot-${status}`}
    onClick={onClick}
    aria-label={`${STATUS_META[status].label} status — press to cycle`}
    title={`${STATUS_META[status].label} — click to change`}/>}
```

### C.2 `Toolbar.tsx` — replace MUI icons with Phosphor (MAJOR)

**Lines 4–8 — Replace imports:**
```tsx
{/* remove */} import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
{/* remove */} import UnfoldLessIcon from '@mui/icons-material/UnfoldLess';
{/* remove */} import UndoIcon from '@mui/icons-material/Undo';
{/* remove */} import RedoIcon from '@mui/icons-material/Redo';
{/* keep */}  import {MagicWandIcon} from '@phosphor-icons/react';
{/* add */}    import {CaretDown, CaretUp, ArrowUUpLeft, ArrowURightDown} from '@phosphor-icons/react';
```

**Lines 44–63 — Replace icon elements:**
```tsx
{/* Collapse/Expand */}
{allCollapsed
  ? <CaretDown size={16} weight="regular" aria-hidden="true" />   {/* was UnfoldMoreIcon */}
  : <CaretUp size={16} weight="regular" aria-hidden="true" />}    {/* was UnfoldLessIcon */}

{/* Undo */}
<ArrowUUpLeft size={16} weight="regular" aria-hidden="true" />    {/* was UndoIcon */}

{/* Redo */}
<ArrowURightDown size={16} weight="regular" aria-hidden="true" /> {/* was RedoIcon */}
```

No change to `MagicWandIcon` usage (already Phosphor).

### C.3 `ThemeToggle.tsx` — remove styled-components local token scope (MAJOR)

**Replace the entire styled-components block** with a plain HTML structure using the new global tokens:

```tsx
{/* Remove styled-components import and StyledWrapper entirely */}
{/* New structure: */}
<div className="toggle-switch" onPointerDown={e => e.stopPropagation()}>
  <label className="switch-label" title={label} aria-label={label}>
    <input type="checkbox" className="checkbox" checked={isLight}
      onChange={e => setTheme(e.target.checked ? 'light' : 'dark')} />
    <span className="slider" />
  </label>
</div>
```

**CSS for `.toggle-switch`, `.switch-label`, `.checkbox`, `.slider`** — Design Lead adds to globals.css:
```css
.toggle-switch { position: relative; width: 56px; height: 28px; flex: 0 0 auto; }
.switch-label { position: relative; width: 100%; height: 28px; background: var(--toggle-track); border-radius: 14px; cursor: pointer; border: 2px solid var(--toggle-track); display: block; }
.checkbox { position: absolute; opacity: 0; width: 0; height: 0; }
.slider { position: absolute; top: 0; left: 0; right: 0; bottom: 0; border-radius: 14px; transition: background .3s var(--ease-out); }
.slider::before { content: ""; position: absolute; top: 4px; left: 4px; width: 16px; height: 16px; border-radius: 50%; background: var(--toggle-knob); box-shadow: inset 7px -2px 0 0 var(--toggle-sun); transition: transform .3s var(--ease-out); }
.checkbox:checked ~ .slider { background: var(--toggle-moon); }
.checkbox:checked ~ .slider::before { transform: translateX(28px); box-shadow: none; }
.theme-switch input:focus-visible + .slider { outline: 2px solid var(--accent); outline-offset: 2px; }
```

### C.4 `HelpPanel.tsx` — remove tooltip, fix tooltip-only-revealed (MAJOR)

**Line 24–27 — Remove tooltip span:**
```tsx
{/* old */}
<button ref={triggerRef} type="button" className="faq-button" aria-label="Help and shortcuts" ...>
  <svg ...><text ...>?</text></svg>
  <span className="tooltip">Help</span>
</button>

{/* new */}
<button ref={triggerRef} type="button" className="faq-button" aria-label="Help and shortcuts" ...>
  <svg ...><text ...>?</text></svg>
</button>
```
Tooltip text removed — `aria-label` already communicates the button's purpose. No tooltip CSS needed.

**KnowledgeDialPanel tooltip fix (C-2):** Replace `<div role="button">` with `<button>` (see C.6).

### C.5 `DataPortability.tsx` — replace MUI icons + fix error copy (MAJOR)

**Lines 6–7 — Replace imports:**
```tsx
{/* remove */} import DownloadIcon from '@mui/icons-material/Download';
{/* remove */} import FileUploadIcon from '@mui/icons-material/FileUpload';
{/* add */}    import {DownloadSimple, UploadSimple} from '@phosphor-icons/react';
```

**Lines 95, 103 — Replace icon elements:**
```tsx
{/* old */} <DownloadIcon sx={{ fontSize: 16 }} aria-hidden="true" />
{/* new */} <DownloadSimple size={16} weight="regular" aria-hidden="true" />

{/* old */} <FileUploadIcon sx={{ fontSize: 16 }} aria-hidden="true" />
{/* new */} <UploadSimple size={16} weight="regular" aria-hidden="true" />
```

**Line 33 — Fix error copy:**
```tsx
{/* old */} setError('Not valid JSON.');
{/* new */} setError('The file isn\'t valid JSON. Check the file and try again.');
```

**Lines 134, 167 — Replace `DownloadIcon` in modal:**
```tsx
{/* line 134 */} <DownloadSimple size={20} weight="regular" aria-hidden="true" />
```

### C.6 `KnowledgeDialPanel.tsx` — replace div[role=button] with button, fix tooltip (CRITICAL + MAJOR)

**Lines 95–105 — Replace div with button:**
```tsx
{/* old */}
<div className="dial-mini ui-float" role="button" tabIndex={0}
  aria-label="Expand knowledge dial"
  title="Double-click to expand"
  onClick={...} onDoubleClick={...} onKeyDown={...} ...>

{/* new */}
<button type="button" className="dial-mini ui-float"
  aria-label="Expand knowledge dial"
  title="Expand knowledge dial"
  onClick={...}
  onPointerDown={e => e.stopPropagation()}>
  {/* ... SVG content unchanged ... */}
  <button className="heatmap-icon-btn dial-mini-hide" aria-label="Hide knowledge dial" ...>×</button>
</button>
```

Note: The inner hide button becomes nested — acceptable since `onPointerDown` stopPropagation on the outer button prevents double-fire. Alternatively, the hide button's `onClick` stopPropagation handles it.

**Remove `title="Double-click to expand"`** → replaced with `title="Expand knowledge dial"` (or remove entirely since `aria-label` already names it).

### C.7 `ExportModal.tsx` — replace inline SVG + Phosphor color fix (MINOR)

**Lines 9–66 — Replace JsonIcon inline SVG with Phosphor FileCode icon:**
```tsx
{/* Remove the entire JsonIcon function (lines 9–66) */}
{/* Add import: */} import {FileCode} from '@phosphor-icons/react';
{/* In JSX: */}
<div className="export-option-icon" style={{ color: 'var(--ink)' }}>
  <FileCode size={20} weight="regular" aria-hidden="true" />
</div>
```

**Line 132 — Fix ImageSquare color:**
```tsx
{/* old */} <ImageSquare size={24} weight="duotone" color="#fff5fb" />
{/* new */} <ImageSquare size={24} weight="duotone" color="var(--on-accent)" />
```

### C.8 `Sidebar.tsx` — replace PinIcon inline SVG with Phosphor (MAJOR)

**Lines 21–29 — Replace PinIcon component:**
```tsx
{/* Remove PinIcon component entirely (lines 21–29) */}
{/* Add import: */} import {Pin} from '@phosphor-icons/react';
{/* In JSX wherever PinIcon is used: */}
{PinIcon ? <Pin size={13} weight={filled ? "fill" : "regular"} aria-hidden="true" /> : null}
```

Ensure all `PinIcon` usages in the file are updated. The `filled` prop maps to Phosphor's `weight="fill"` vs `weight="regular"`.

**Lines 8 — Sidebar icon imports:**
```tsx
{/* old */} import {FolderIcon, NoteIcon} from '@phosphor-icons/react';
{/* no change needed — already Phosphor */}
```

### C.9 `SelectionHint.tsx` — no markup change required

`SelectionHint.tsx` already uses semantic `<span>` elements with text content. The `aria-live="polite"` region is correct. No changes needed in this phase.

### C.10 `Button.tsx` — no change required

`Button.tsx` is a pass-through wrapper. The 8-state matrix is implemented via CSS pseudo-classes on `.btn`. No TSX change needed.

### C.11 `canvas/layout.tsx` — no change required

`canvas/layout.tsx` is purely structural. No class or copy changes needed.

---

## Section D — Class Contract (Complete)

### D.1 Classes Added (new in this wave)

| Class | Selector | Style intent |
|---|---|---|
| `--text-node` | Token (font-size) | 13.5 px / weight 500 / line-height 1.45 — named role for primary read-evaluate text |
| `--radius-sm` | Token | 8 px — buttons, icon buttons |
| `--radius-xs` | Token | 6 px — icon buttons, chips |
| `--radius-full` | Token | 999 px — pills |
| `--radius-brand` | Token | 9 px — brand logo tile |
| `--node-width` | Token | 280 px — node card width |
| `--node-min-h` | Token | 60 px — node card min-height |
| `--space-node-pad` | Token | 10 px — node card padding |
| `--toggle-track` | Token | #2a2a2a — theme switch track (unchecked) |
| `--toggle-knob` | Token | #d8dbe0 — theme switch knob |
| `--toggle-sun` | Token | #ffcf48 — sun icon on knob |
| `--toggle-moon` | Token | #00a6ff — checked track |
| `--brand-fill` | Token | `var(--accent)` — brand logo background |
| `--ease-out` | Token | `cubic-bezier(.2,0,0,1)` — standard deceleration |
| `chip-failed` | `.chip-failed` | Status-failed chip colours via CSS (replaces inline `style`) |
| `chip-review` | `.chip-review` | Status-review chip colours via CSS |
| `chip-mastered` | `.chip-mastered` | Status-mastered chip colours via CSS |
| `.toggle-switch` | `.toggle-switch` | Theme toggle wrapper — plain div (replaces styled-components) |
| `.switch-label` | `.switch-label` | Theme toggle label — replaces styled-components |
| `.checkbox` | `.checkbox` | Theme toggle hidden checkbox |
| `.slider` | `.slider` (scoped to `.toggle-switch`) | Theme toggle track — uses `var(--toggle-track)` |

### D.2 Classes Removed

| Class | Reason |
|---|---|
| `.help-trigger` | Merged into `.faq-button`; duplicate FAB definition |
| `.tooltip` | Removed entirely — `aria-label` already names the button |
| `.status-failed` (left-border variant) | Status stripe removed — status carried by `.status-dot` + chips |
| `.status-review` (left-border variant) | Same |
| `.status-mastered` (left-border variant) | Same |
| `role="menu"` on `.palette-palette` | Removed — broken contract (no arrow-key nav); Tab suffices |
| `jello-vertical` keyframes | Removed — bouncy easing anti-pattern |
| Inline `style` on chip spans | Replaced by `.chip-failed` / `.chip-review` / `.chip-mastered` classes |
| `backdrop-filter: blur()` from `.ui-float` | Removed — purposeless glassmorphism |
| `backdrop-filter: blur()` from `.empty-card` | Removed — purposeless glassmorphism |
| `backdrop-filter: blur()` from `.node-palette` | Removed — purposeless glassmorphism |
| `backdrop-filter: blur()` from `.selection-hint` | Removed — purposeless glassmorphism |
| `backdrop-filter: blur()` from `.focus-exit-pill` | Removed — purposeless glassmorphism |
| `backdrop-filter: blur()` from `.help-trigger` | Removed — element deleted |
| `StyledWrapper` (styled-components) | Removed — ThemeToggle uses plain HTML |

### D.3 Classes Renamed

No classes are renamed in this wave. All existing class names are preserved; only their style definitions change.

### D.4 Classes Unchanged (retained as-is)

| Class | Notes |
|---|---|
| `.node-card` | Border-left stripe removed; padding unified; animation easing fixed |
| `.node-enter` | Easing changed to `ease-out`; class name unchanged |
| `.node-reveal` | Unchanged |
| `.status-dot` | `aria-label` added in StatusBadge.tsx; CSS unchanged |
| `.dot-failed / .dot-review / .dot-mastered` | Unchanged |
| `.icon-btn` | Size increased to 24×24; class name unchanged |
| `.icon-btn palette tint` | Unchanged |
| `.palette-palette` | `role="menu"` removed; class name unchanged |
| `.palette-swatch` | Size increased to 24×24; class name unchanged |
| `.palette-swatch palette-clear` | Unchanged |
| `.node-content` | Placeholder text updated in TSX; CSS unchanged |
| `.node-editor` | Placeholder text updated in TSX; CSS unchanged |
| `.chip` | Unchanged; colour moved to `.chip-failed` etc. |
| `.node-meta` | Unchanged |
| `.chevron` | Unchanged |
| `.drag-handle` | Unchanged; icon replaced in TSX |
| `.resize-grip` | Size increased to 24×24 |
| `.node-actions` | Unchanged |
| `.node-top` / `.node-main` | Unchanged |
| `.btn` / `.btn-primary` / `.btn-ghost` / `.btn-danger` | Unchanged |
| `.tb-icon-btn` | Unchanged; MUI→Phosphor in TSX |
| `.zb-btn` | Unchanged; aria-labels added in TSX |
| `.dial-card` / `.dial-mini` | Unchanged; `role="button` → `<button>` in TSX |
| `.dial-ring` / `.dial-seg` | Reduced-motion guard added in CSS |
| `.heatmap-icon-btn` | Size increased to 24×24 |
| `.modal-overlay` / `.modal-card` | Animation easing fixed |
| `.help-overlay` / `.help-modal` | Animation easing fixed; tooltip removed in TSX |
| `.faq-button` | Gradient → solid `var(--accent)`; jello removed |
| `.selection-hint` | Blur removed |
| `.focus-exit-pill` | Blur removed |
| `.sidebar-*` | `border-right` → `border-inline-end` |
| `.portability-bar` | `border-left` → `border-inline-start` |
| `.portability-btn` | Unchanged; MUI→Phosphor in TSX |
| `.export-option-card` / `.export-option-icon` | Unchanged; icon + colour fixed in TSX |
| `.canvas-layout` / `.canvas-main` | Unchanged |
| `.ui-float` | Blur removed |
| `#viewport` / `#world` / `#edges` / `#nodes` | Unchanged |
| `#toolbar` / `#viewbar` / `#empty-state` | Unchanged |
| `#save-ind` | Unchanged |
| `#zoom-label` | Unchanged; `aria-label` added in TSX |
| `.brand` / `.brand-logo` / `.brand-name` / `.brand-sub` | Gradient → solid accent |
| `.empty-card` / `.empty-icon` | Blur removed; gradient already uses tokens |
| `.theme-switch` | Raw hex → token vars; bouncy easing removed |
| `.tb-cluster` | Blur removed |
| `.node-palette` | Blur removed |
| `.palette-backdrop` | Unchanged |
| `.node-card.is-sized` | Unchanged |
| `.node-card.is-tinted` | Unchanged |
| `.node-card.is-selected` | Unchanged |
| `.lasso-marquee` | Unchanged |
| `.annotation` / `.ann-content` / `.ann-editor` | Unchanged; placeholder text updated in TSX |
| `.ann-delete` | Unchanged |
| `.sidebar-*` | See sidebar section above |
| `.theme-manager-*` | Unchanged |
| `.portability-modal-overlay` / `.portability-modal-card` | Unchanged |
| `.export-modal-overlay` | Unchanged |
| `.theme-toggle svg` | Unchanged (CSS stays, but ThemeToggle.tsx markup changes) |

---

## Section E — Rejected Audit Candidates (explicit, with reason)

| Finding | Source | Rejected because |
|---|---|---|
| Flag `--panel-bg: rgba(255,255,255,.92)` as pure-white violation | audit-slop | Alpha is .92 not 1.0; value is a token, not inline. Near-white surface is allowed per anti-patterns §"Pure black, pure white". |
| Flag `*{ box-sizing }` reset as slop | audit-slop | Standard universal box-sizing reset; not a visual tell. |
| Flag `border-left: 1px solid var(--line)` on `.portability-bar` as RTL break | audit-layout | Already listed as M-17 above — resolved, not rejected. |
| Flag `[data-theme="dark"] .sidebar-folder-icon svg { color: #f59e0b }` | audit-layout-typo M4 | The value `#f59e0b` equals `--amber` already declared in `:root`. Replaced with `var(--amber)` in CSS — no new token needed. |
| Flag `⣿` drag-handle as confusing icon | audit-writing-ui | Covered by M-1 (icon-set inconsistency) at the systemic level; replacement with Phosphor `GripVertical` resolves it. |
| Flag `♲` delete icon as confusing | audit-writing-ui | Same — systemic icon replacement resolves. |
| Flag `☰` / `«` hamburger glyphs | audit-writing-ui | Glyphs have `aria-label`; buttons are not icon-only. Glyph choice is a polish matter, not a writing issue. |
| Flag `border-left: 1px solid var(--line)` on portability bar | audit-layout m2 | Already in M-17 — resolved with `border-inline-start`. |
| Keep `--brand-secondary` token name | design-lead | `THEME_TOKENS` API is frozen; name must not be removed. Value retained but no longer used in visual rules. Documented in design.md §6. |
| Add `--danger` dark-theme override | audit-layout M2 | **Resolved** — added to dark block as `#f87171` (slightly softer than light `#ef4444`). |
| Add `--radius` dark-theme override | audit-layout M2 | **Resolved** — `--radius: 12px` added to dark block (same value, explicit). |

---

## Section F — Parallel-edit Safety Notes

1. **Design Lead and Canvas Builder can work in parallel on globals.css and Canvas.tsx/Node.tsx** — the class names they each touch are disjoint except for `.node-card` (CSS padding/border changes in globals.css; class-name list unchanged in Node.tsx). No conflict.

2. **Shell Builder and Design Lead can work in parallel** — Shell Builder touches TSX markup only (aria-labels, icon swaps, copy changes); Design Lead rewrites globals.css. No TSX file is edited by Design Lead in this phase.

3. **`--faint` dark value change is a CSS-only change** — no TSX references the hex directly; all TSX uses `var(--faint)`. Safe to retune without coordination.

4. **Chip inline-style removal requires CSS classes to exist before TSX is updated** — Design Lead adds `.chip-failed` / `.chip-review` / `.chip-mastered` to globals.css in BUILD wave; Shell Builder updates Node.tsx to use them. Builder must not update Node.tsx until CSS classes are present, or chips will have no colour for one render. Coordinate via design-plan handoff note.

5. **ThemeToggle.tsx styled-components removal** — the new `.toggle-switch` / `.switch-label` / `.slider` CSS classes must be present in globals.css before the styled-components import is removed from ThemeToggle.tsx. Design Lead adds them; Shell Builder removes the import.

6. **`--brand-secondary` deprecation** — the token name is frozen (never removed from `THEME_TOKENS`), but no new CSS rule should reference it. `.empty-icon` (line 335) already uses `linear-gradient(135deg, var(--accent), var(--brand-secondary))` — Design Lead changes this to `background: var(--accent)` (solid, no gradient) per anti-slop commitment §1.
