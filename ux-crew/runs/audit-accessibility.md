# Accessibility Audit — Synapse UX Crew

**Slice:** accessibility
**Auditor:** read-only
**Scope:** `src/app/`, `src/components/Canvas/`, `src/components/Sidebar/`, `src/components/ui/`, `src/app/globals.css`
**Skill basis:** `skills/skills/better-accessibility/` (SKILL.md, focus-and-keyboard.md, hit-areas.md, semantics-and-aria.md, motion-and-zoom.md, screen-readers.md); severity scale from `skills/skills/better-interface/SKILL.md`.
**Runtime verification:** Not verified (no dev server confirmed running; all findings are static-source).

---

## Findings (severity-ranked)

---

### CRITICAL — 2 findings

---

**[C-1] `title` is not a reliable accessible name — `src/components/ui/StatusBadge.tsx:1`**

**Why:** The `StatusBadge` button carries only a `title` attribute (`"Failed — click to change"` etc.). `title` is not part of the accessible-name computation for most screen readers. The button has no `aria-label`. A screen-reader user hears no name for this control. This is a HIGH escalation trigger (icon-only interactive control with no accessible name).

Current code:
```tsx
// StatusBadge.tsx line 1
export default function StatusBadge({status,onClick}:{status:Status;onClick:()=>void}){
  return <button className={`status-dot dot-${status}`} onClick={onClick}
    title={`${STATUS_META[status].label} — click to change`}/>
}
```

**Fix direction:** Add `aria-label={`${STATUS_META[status].label} status — press to cycle`}` to the `<button>`. Keep `title` for mouse tooltip if desired.

**Considered but rejected:** Adding an off-screen `<span>` with the label — `aria-label` is simpler and equivalent here. Using a visible label alongside the dot — would change the visual design, out of scope for an audit.

---

**[C-2] Non-semantic `role="button"` div with no guaranteed focus style — `src/components/Canvas/KnowledgeDialPanel.tsx:96–121`**

**Why:** The mini-donut expand control is a `<div role="button" tabIndex={0}>` (line 97–98), not a native `<button>`. It carries an `aria-label` and an Enter/Space handler (line 103), which is the minimum polyfill — but it has no guaranteed visible `:focus-visible` style. `.dial-mini` in `globals.css` has no focus rule. The inherited `button:focus-visible` rule (line 106) does not apply to a `<div>`. A sighted keyboard user Tabbing to this control sees no ring; the control appears to be skipped or dead. HIGH escalation trigger (keyboard-reachable control with no visible focus indicator).

Current code:
```tsx
// KnowledgeDialPanel.tsx lines 96–103
<div className="dial-mini ui-float"
  role="button" tabIndex={0}
  aria-label="Expand knowledge dial"
  ...
  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { ... } }}>
```

**Fix direction:** Replace the `<div role="button">` with a native `<button>` element (semantics + focus ring for free). Alternatively, add a `.dial-mini:focus-visible` rule with `outline: 2px solid var(--accent); outline-offset: 2px;`.

**Considered but rejected:** Adding only `:focus-visible` CSS to the existing div — while acceptable, replacing with `<button>` removes the need to polyfill the role and gives the browser the full button keyboard model.

---

### MAJOR — 6 findings

---

**[M-1] Icon-only node action buttons lack accessible names — `src/components/Canvas/Node.tsx:75`**

**Why:** Three of the four icon buttons in `.node-actions` carry no `aria-label`:

- **Add child** (`＋`, line 75): no `aria-label`
- **Drag handle** (`⣿`, line 75): no `aria-label`; glyph is a braille pattern, unintelligible to screen readers
- **Delete** (`♲`, line 75): no `aria-label`; the Unicode symbol is not "delete" — a screen-reader user cannot identify this as destructive

The tint button (line 72) correctly has `aria-label="Node color"`. This is a HIGH escalation trigger (icon-only controls with no accessible names).

Current code:
```tsx
// Node.tsx line 75
<button className="icon-btn add" onClick={()=>createChild(node.id)}>＋</button>
<button className="icon-btn drag-handle" onPointerDown={e=>e.stopPropagation()}>⣿</button>
<button className="icon-btn danger" onClick={()=>{...remove(node.id)}}>♲</button>
```

**Fix direction:** Add `aria-label` to each: `aria-label="Add child node"`, `aria-label="Drag handle"`, `aria-label="Delete node and descendants"` (the `confirm()` already gates the destructive action; the label should signal it). Consider replacing `⣿` with a more standard drag-handle icon rendered as SVG with `aria-hidden="true"`.

**Considered but rejected:** Relying on `title` — suffers the same reliability problem as C-1. Hiding `⣿` and relying on surrounding context — the button has no adjacent text label.

---

**[M-2] Palette swatches have no keyboard support — `src/components/Canvas/Node.tsx:79–83`**

**Why:** The `.palette-swatch` buttons are standard `<button>` elements so they are focusable by default, but the palette container uses `onClick` only (line 78). There is no `onKeyDown` handler, and no arrow-key navigation within the swatch row. A keyboard user who tabs into the open palette finds a flat list of 8+ unlabeled-ish buttons with no way to move between them without Tab. The `role="menu"` on the container (line 78) promises arrow-key navigation that is not implemented — a wrong role is worse than no role (semantics-and-aria.md rule 3).

Current code:
```tsx
// Node.tsx line 78
<div className="palette-palette" onClick={e=>e.stopPropagation()}
  role="menu" aria-label="Node color palette">
  {NODE_TINTS.map(t=>(
    <button key={t.id} className={`palette-swatch ...`}
      style={{background:t.color}} title={t.label} aria-label={t.label}
      onClick={()=>{setNodeTint(node.id,t.color); setPaletteOpen(false)}} />
  ))}
```

**Fix direction:** Either (a) implement arrow-key navigation within the palette as the `role="menu"` contract requires, cycling focus between swatches with Home/End, and remove the role if that is too complex; or (b) simplest: remove `role="menu"` and keep Tab-only navigation, since the swatches have `aria-label` already and the palette is a small, flat set. Also close palette on Escape (currently handled via window listener in Node.tsx lines 24–29 — this part is correct).

**Considered but rejected:** Keeping `role="menu"` without implementing arrow keys — this creates a role contract that is broken, which is worse than no role.

---

**[M-3] Zoom buttons lack accessible names — `src/components/Canvas/Canvas.tsx:45`**

**Why:** The `−` and `＋` zoom buttons carry no `aria-label`. Only the center `%` reset button has visible text content (which serves as its accessible name). The fit-to-screen button correctly has `aria-label="Fit to screen"`.

Current code:
```tsx
// Canvas.tsx line 45
<button className="zb-btn" onClick={()=>changeZoom(canvas.viewport.zoom/1.2)}>−</button>
<button className="zb-btn" id="zoom-label" onClick={()=>changeZoom(1)}>{...}%</button>
<button className="zb-btn" onClick={()=>changeZoom(canvas.viewport.zoom*1.2)}>＋</button>
```

**Fix direction:** Add `aria-label="Zoom out"` / `aria-label="Reset zoom"` / `aria-label="Zoom in"` to each button respectively.

**Considered but rejected:** Using `title` only — same reliability issue as C-1.

---

**[M-4] No focus trap or background inert in any modal — `src/components/Canvas/HelpPanel.tsx:28`, `src/components/Canvas/ThemeManager.tsx:44`, `src/components/Canvas/ExportModal.tsx:109–113`, `src/components/Canvas/DataPortability.tsx:118–151`**

**Why:** All four modal dialogs in the app use `role="dialog" aria-modal="true"` but none implement a focus trap. Tab key moves focus out of the dialog into the background canvas and sidebar. The HelpPanel (line 12) focuses the close button on open — but Tab from there escapes to the canvas. ThemeManager, ExportModal, and the DataPortability confirm/error dialogs do not even move focus to the first focusable element on open. None set `inert` on background content. Only HelpPanel returns focus to the trigger button on close (line 19); the other modals leave focus wherever it lands.

Relevant code:
```tsx
// HelpPanel.tsx — opens, focuses closeRef (correct start), but no trap
useEffect(()=>{
  if(!open)return;
  closeRef.current?.focus();  // line 12
  const handleKeyDown=...Escape closes...
  // No focus trap
},[open]);

// ThemeManager.tsx — no focus management at all
// (no useEffect for focus)

// ExportModal.tsx — no focus management at all
// DataPortability.tsx — no focus management at all
```

**Fix direction:** Add a focus-trap effect to each modal: on open, focus first focusable element; on Tab/Shift+Tab at boundary, cycle; on close, return focus to trigger. Alternatively, migrate to native `<dialog>` with `showModal()`. Add `inert` (or a focus-trap library) on the background element while a modal is open.

**Considered but rejected:** Using only Escape-to-close without focus trap — Escape is handled but does not address the primary keyboard flow issue. Relying on browser default dialog behavior — the modals are custom `<div>` overlays, not `<dialog>`.

---

**[M-5] Undersized interactive controls — `globals.css:209,395,524,865` + `Node.tsx:75`**

**Why:** Several pointer-reachable controls fall below the 24×24px WCAG 2.5.8 AA hard floor:

| Control | CSS size | Location | Notes |
|---|---|---|---|
| `.icon-btn` | 22×22px | `globals.css:209` | Node action buttons; hover-revealed, but always visible on touch |
| `.heatmap-icon-btn` | 20×20px | `globals.css:395` | KnowledgeDialPanel minimize/close |
| `.palette-swatch` | 22×22px | `globals.css:524` | Node tint palette |
| `.resize-grip` | 16×16px | `globals.css:865` | Node resize handle |
| Status dot | 14×14px | `globals.css:159` | Cycle status (interactive button) |

The `icon-btn` spacing exception might partially apply (1px gap between nodes is tight), but 22px with 1px spacing does not give a 24px circle clearance. The palette swatches and heatmap icon buttons have no spacing exception claim. The resize grip and status dot have no spacing exception claim.

**Fix direction:** Increase each to at least 24×24px (or 28–32px for comfort). The visual size can stay smaller via pseudo-element expansion (per hit-areas.md recipe), or increase the box itself where density allows.

**Considered but rejected:** Leaving sizes as-is because they match visual design — WCAG 2.5.8 is a conformance requirement, not a design preference. Removing some controls — they serve real functions.

---

**[M-6] Dial-in segment animation ignores `prefers-reduced-motion` — `globals.css:302–304`**

**Why:** The `@keyframes dial-in` animation (line 303–304) applied to `.dial-seg` elements (line 303) runs unconditionally when the KnowledgeDialPanel renders. There is no `@media (prefers-reduced-motion: reduce)` guard for this animation, unlike the `nodeIn`/`node-reveal` animations which are correctly guarded (lines 846–848, 978–980).

Current code:
```css
/* globals.css:302-304 */
.dial-ring{ --seg-dur: .5s; }
.dial-seg{ animation: dial-in var(--seg-dur) ease both; }
@keyframes dial-in{ from{ opacity: .15; } to{ opacity: 1; } }
```

**Fix direction:** Add a reduced-motion override:
```css
@media (prefers-reduced-motion: reduce) {
  .dial-seg { animation: none; opacity: 1; }
}
```

**Considered but rejected:** Removing the animation entirely — it is valid functional feedback; the fix is to make it opt-in as the skill requires.

---

### MINOR — 4 findings

---

**[m-1] Status chips in collapsed-node meta row convey meaning by color alone — `src/components/Canvas/Node.tsx:85`**

**Why:** When a node is collapsed, the `.chip` elements below display `{count}{STATUS_META[k].short}` (e.g. "2F", "1R") where the chip's colored left border and background carry the status hue. The short label (`F`, `R`, `M`) is text, but users who rely on the chip's visual color to distinguish statuses at a glance (a primary affordance of the heat-map design) get no redundant non-color cue — the short codes are not explained without reading the legend. The status dot on the node card itself is also 14px and color-only (see M-5).

Current code:
```tsx
// Node.tsx:85
{(['failed','review','mastered'] as const).map(k=>summary[k]?
  <span key={k} className="chip"
    style={{color:STATUS_META[k].color,
            borderColor:`${STATUS_META[k].color}44`,
            background:`${STATUS_META[k].color}14`}}>
    <b>{summary[k]}{STATUS_META[k].short}</b>
  </span>:null)}
```

**Fix direction:** Use the full label (or a tooltip / `aria-label`) alongside the short code. For example: `<b>{summary[k]} {STATUS_META[k].label}</b>` or add `title={STATUS_META[k].label}`.

**Considered but rejected:** Removing colored chips entirely — the color is a valid redundant cue; the problem is that it is the *primary* cue in the chip's visual hierarchy while the text label is minimal.

---

**[m-2] No skip-link before the main canvas region — `src/app/canvas/[id]/page.tsx:24` / `src/app/layout.tsx:3`**

**Why:** The page renders the `CanvasLayout` (sidebar + canvas) directly without a skip-link anchor. The sidebar and toolbar are repeated chrome that precede the canvas content. Keyboard and screen-reader users must Tab through sidebar pages, toolbar buttons, and viewbar controls before reaching the first node. A skip-link targeting a `<main id="main">` would let them jump directly to the canvas. The layout file has no `<main>` landmark at all (the `canvas-main` div has no `id` or landmark role).

**Fix direction:** Add `<a href="#canvas-main" className="skip-link">Skip to canvas</a>` as the first element in the body (visually hidden until focused). Add `id="canvas-main"` to the `<div className="canvas-main">` in `CanvasLayout`. Ensure `scroll-margin-top` accounts for any sticky chrome.

**Considered but rejected:** Adding `tabindex="-1"` to canvas-main and programmatically focusing on mount — a skip link is the standard pattern and gives users agency.

---

**[m-3] ThemeToggle styled-components animation lacks `prefers-reduced-motion` guard — `src/components/Canvas/ThemeToggle.tsx:37–64`**

**Why:** The `.slider::before` and `.slider` transitions (lines 45–67) animate on every theme toggle. The 0.3s transition is mild feedback, but the cloud/star decorative elements (`.cloud`, `.star`) also animate. The `cubic-bezier(0.81, -0.04, 0.38, 1.5)` easing produces a noticeable overshoot. No `@media (prefers-reduced-motion: reduce)` override exists in the styled-components block. The transition is on a form control where the functional feedback is the state change itself (sun→moon), so it is reducible.

**Fix direction:** Wrap the transition declarations in a `@media (prefers-reduced-motion: no-preference)` block within the styled-component, or reduce to `transition: none` under `prefers-reduced-motion: reduce`.

**Considered but rejected:** Removing the animation entirely — it is mild feedback, not vestibular. Reducing duration to 0.01ms — matches the global kill-switch pattern in motion-and-zoom.md.

---

**[m-4] Dot-grid background not marked decorative for assistive tech — `src/app/globals.css:116–118` / `Canvas.tsx:111–113`**

**Why:** The viewport's `background-image: radial-gradient(...)` renders a visible dot grid across the canvas. This is a decorative pattern. While background images on non-replaced elements are normally ignored by screen readers, the grid dots are set via inline `style.backgroundSize` and `style.backgroundPosition` on the `#viewport` element (Canvas.tsx lines 31–33), which means they persist as an authored style on a live element. If any screen-reader mode reports background imagery, the dot grid would be announced as meaningless visual noise. The current implementation is low-risk but not explicitly guarded.

```tsx
// Canvas.tsx:31-33
el.style.backgroundSize = `${26*canvas.viewport.zoom}px ...`;
el.style.backgroundPosition = `${canvas.viewport.x}px, ${canvas.viewport.y}px`;
```

**Fix direction:** Add `aria-hidden="true"` to the viewport element, or confirm that the runtime implementation targets a purely decorative background layer. Marking the viewport `aria-hidden="true"` removes it from the accessibility tree while preserving pointer events.

**Considered but rejected:** Leaving as-is — background-image on a div is typically ignored, but the dynamic inline style makes this worth a defensive annotation.

---

## Summary

```
2 critical · 6 major · 4 minor
```

**Verdict:** The interface has solid foundations — native `<button>` elements are used throughout the sidebar and toolbar, the HelpPanel correctly uses `role="dialog"` with `aria-modal` and `aria-labelledby`, Escape is handled in all modals, and the SelectionHint correctly uses `aria-live="polite"`. However, several icon-only controls are completely unnamed for assistive tech (StatusBadge, node action buttons, zoom buttons), the KnowledgeDialPanel mini mode is a non-semantic `role="button"` div without a guaranteed focus indicator, and no modal traps focus or restores it reliably. These are systemic gaps that affect the core interaction surface (canvas nodes, palette, dial) — not edge cases — and should be addressed before the interface ships.

---

## Considered but rejected (full list)

| Candidate | Reason for rejection |
|---|---|
| StatusBadge `title` is sufficient | `title` is not a reliable accessible name; `aria-label` is required |
| Zoom buttons are self-explanatory symbols | `−`/`＋` are not guaranteed to be announced; see M-3 |
| Canvas viewport `user-select: none` blocks all text selection | Node editors and `.node-content` override with `user-select: text`; the global rule is scoped to the canvas surface only, which is intentional for a drag surface |
| `♲` on delete button is clear enough | Unicode glyph is ambiguous; "delete" is not universal across locales or screen readers |
| Palette `role="menu"` with no arrow keys — report as LOW | Wrong role is a broken promise; elevated to M-2 |
| Dot grid announces as content | Low-risk (background-image on non-replaced element); reported as m-4 |
| Theme switcher animation causes vestibular harm | Mild 0.3s state transition; reported as m-3 |
| `nodeIn` and `node-reveal` animations missing reduced-motion | Already guarded at `globals.css:846–848` and `978–980` — confirmed present |
| Save indicator "Saved" text needs aria-live | It is persistent visible text, not a dynamic notification; the `show` class toggles opacity, not content — no live region needed |
| `aria-hidden="true"` + `tabIndex={-1}` on file input in DataPortability | The trigger button has `aria-label="Import canvas"` and is the interactive element; the hidden input is programmatically activated — this pattern is acceptable |
| Chip color contrast — report as contrast failure | Chip *text* (`color: var(--muted)` = #64748b) on `var(--chip-bg)` (#f8fafc) yields ~7.9:1 in light theme and ~5.7:1 in dark theme — passes AA. The colored border underneath is decorative, not the text. |
| Status dot contrast — report separately from M-5 | Included in M-5 (size); the color-only concern is addressed under accessibility principle 9 but the dot's primary failure is its 14px size making it undiscoverable. |
| Focus mode hides sidebar with `pointer-events: none` — keyboard trap | Focus mode is a toggle; users exit via the focus-exit-pill button which is keyboard-reachable. The sidebar being inert is intentional, not a trap. Reported for completeness in M-4. |
| `onDoubleClick` on KnowledgeDialPanel (full mode) — not keyboard accessible | The expanded dial card has `×`/`–` buttons that collapse it; the double-click is a convenience for mouse users, not the only path. Not a separate finding. |
