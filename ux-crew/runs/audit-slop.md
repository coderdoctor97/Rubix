# SYNAPSE UX CREW — Auditor Report

**Slice:** slop
**Auditor:** hallmark audit (read-only)
**Scope:** `src/app/globals.css`, `src/app/**/*.{tsx,ts}`, `src/components/Canvas/**/*.tsx`, `src/components/Sidebar/**/*.tsx`, `src/components/ui/**/*.tsx`
**Skills loaded:** hallmark/SKILL.md, references/verbs/audit.md, references/anti-patterns.md, references/slop-test.md, better-interface/SKILL.md

---

## Findings

### CRITICAL

**[CRITICAL] Purple-gradient brand mark — `globals.css:254`**
The `.brand-logo` block ships `background: linear-gradient(135deg, #4f46e5, #7c3aed)` — a purple-to-purple gradient. This is the single most-recognised AI aesthetic tell (`anti-patterns.md § "The purple-gradient hero"`): every LLM emits purple-to-blue/pink gradients as its default "premium" background. The gradient is also a gate 2 failure (purple-to-blue gradient anywhere) and a gate 48 failure (raw hex values outside the token block). The token block already declares `--accent: #4f46e5` and `--brand-secondary: #7c3aed`; the gradient should use those tokens or be replaced with a solid accent fill.

```css
/* globals.css:252-257 */
.brand-logo{
  width: 32px; height: 32px; border-radius: 9px; flex: 0 0 auto;
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  display: grid; place-items: center; color: var(--on-accent);
  box-shadow: 0 3px 8px -2px var(--brand-shadow);
}
```
→ Replace the gradient with `background: var(--accent)` (solid) or, if the two-tone mark is intentional, express it as `background: linear-gradient(135deg, var(--accent), var(--brand-secondary))` so both stops flow through named tokens.

---

**[CRITICAL] Status meaning carried by colour alone — `StatusBadge.tsx:1` + `globals.css:157-168`**
`StatusBadge` renders a `<button>` with no text content, no `aria-label`, no `aria-describedby`, and no screen-reader label — only `title`. The visual meaning (failed = red, review = amber, mastered = green) is carried entirely by `background-color` on `.status-dot`. This is a `better-interface` escalation trigger ("state or meaning carried by color alone") and a WCAG 1.4.1 failure. A colourblind user receives zero information from the dot. The `title` attribute does not substitute for an accessible name — it is not announced by most screen readers and does not appear on focus.

```tsx
/* StatusBadge.tsx:1 (entire file) */
export default function StatusBadge({status,onClick}:{status:Status;onClick:()=>void}){return <button className={`status-dot dot-${status}`} onClick={onClick} title={`${STATUS_META[status].label} — click to change`}/>}
```
```css
/* globals.css:157-168 */
.status-dot{
  flex: 0 0 auto;
  width: 14px; height: 14px; margin-top: 4px;
  border-radius: 50%;
  border: 2px solid var(--line-2);
  background: transparent;
  ...
}
.status-dot.dot-failed  { background: var(--red);   border-color: var(--red); }
.status-dot.dot-review  { background: var(--amber); border-color: var(--amber); }
.status-dot.dot-mastered{ background: var(--green); border-color: var(--green); }
```
→ Add `aria-label={STATUS_META[status].label}` to the button and remove reliance on `title` as the sole accessible name. Optionally add a visually-hidden label span inside the button for sighted users who cannot parse colour.

---

### MAJOR

**[MAJOR] Mid-render token improvisation — hardcoded hex values in the theme-switch widget — `globals.css:614-667`**
The `.theme-switch` block contains nine raw hex values (`#2a2a2a`, `#00a6ff`, `#fff`, `#ffcf48`) and one raw `rgb()` (`rgb(27, 129, 112)`) outside the `:root` token block. These values are invisible to the theme system: switching to a custom theme does not recolour the toggle. This is `anti-patterns.md § "Mid-render token improvisation"` and slop-test gate 48. The toggle also ships its own local `--light` and `--dark` custom properties inside a styled-components wrapper (`ThemeToggle.tsx:11-14`), which creates a second, disconnected colour namespace.

```css
/* globals.css:630-648 */
.theme-switch .slider {
  ...
  background-color: #2a2a2a;
  ...
}
.theme-switch .slider:before {
  ...
  box-shadow: inset 8px -4px 0px 0px #fff;
}
.theme-switch input:checked + .slider { background-color: #00a6ff; }
.theme-switch input:checked + .slider:before {
  transform: translateX(1.8em);
  box-shadow: inset 15px -4px 0px 15px #ffcf48;
}
```
```tsx
/* ThemeToggle.tsx:11-14 (styled-components block) */
  --light: #d8dbe0;
  --dark: #28292c;
  --link: rgb(27, 129, 112);
  --link-hover: rgb(24, 94, 82);
```
→ Lift the six distinct colours into named tokens in `:root` / `[data-theme="dark"]` (e.g. `--toggle-track`, `--toggle-knob`, `--toggle-sun`, `--toggle-moon`) and reference them via `var()`. Remove the local `--light`/`--dark` from the styled-components block.

---

**[MAJOR] Glassmorphism panels without semantic purpose — `globals.css:234-242`, `:327-329`, `:346-349`, `:603`, `:960-961`**
Five separate `.ui-float`-derived panels carry `backdrop-filter: blur(12px)` (toolbar, empty-state card, modal overlay, selection hint, focus-exit pill) over surfaces that are already semi-transparent (`--panel-bg: rgba(255,255,255,.92)`, `--empty-panel-bg: rgba(255,255,255,.85)`). The blur has no content beneath it that benefits from de-focussing — the canvas background is a dot grid on a flat colour. This is `anti-patterns.md § "Glassmorphism without purpose"`: the blur is decoration, not depth communication. Each blurred panel also carries an additional performance cost on low-end devices.

```css
/* globals.css:234-242 */
.ui-float{
  position: absolute; z-index: 20;
  background: var(--panel-bg);
  backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--line);
  border-radius: 14px;
  box-shadow: var(--shadow-md);
}
```
→ Remove `backdrop-filter` from `.ui-float` and from the empty-state card. The border + shadow + solid-ish surface already provides sufficient depth. Keep blur only on modal overlays where it actively separates the dialog from the canvas beneath.

---

**[MAJOR] Mismatched icon libraries — `Toolbar.tsx:4-8`, `Node.tsx:10`, `DataPortability.tsx:6-7`, `Sidebar.tsx:8,262,315,388,436`**
Three icon libraries appear in the same interface: Material UI (`@mui/icons-material` — FitScreenIcon, AutoFixHighIcon, UnfoldMoreIcon, UnfoldLessIcon, UndoIcon, RedoIcon, DownloadIcon, FileUploadIcon`), Phosphor (`@phosphor-icons/react` — MagicWandIcon, PaletteIcon, FolderIcon, NoteIcon, ImageSquare`), and inline hand-built SVGs (`PinIcon`, `JsonIcon`). Each library has a different stroke weight, corner radius, and optical size. The sidebar's `FolderIcon` uses Phosphor duotone at weight 14 while the toolbar's toolbar icons are Material UI filled at 16px — they read as different design systems on the same screen.

```tsx
/* Toolbar.tsx:4-8 */
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import UnfoldLessIcon from '@mui/icons-material/UnfoldLess';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import {MagicWandIcon} from '@phosphor-icons/react';
```
→ Consolidate to a single icon library across all components. Phosphor is already present in Node.tsx and Sidebar.tsx; migrating the toolbar's Material UI icons to Phosphor equivalents is the path of least churn. Replace `JsonIcon` and `PinIcon` inline SVGs with Phosphor icons or a shared custom SVG component.

---

**[MAJOR] Bouncy overshoot easing on theme-switch slider — `globals.css:641`**
`.theme-switch .slider:before` uses `transition-timing-function: cubic-bezier(0.81, -0.04, 0.38, 1.5)` — a bouncy overshoot curve. `anti-patterns.md § "Bounce and elastic easing"` lists this as a major tell: overshoot easings on UI controls read as a decade-old tasteless throwback. The same curve fires on every theme toggle, not just on a physical interaction where overshoot would be justified.

```css
/* globals.css:641 */
  transition-timing-function: cubic-bezier(0.81, -0.04, 0.38, 1.5);
```
→ Replace with `ease-out` (or a project-standard easing token if one exists). Overshoot belongs on drag-release and spring-loaded physical interactions only.

---

**[MAJOR] Hover-only tooltip — `globals.css:714-748` + `HelpPanel.tsx:26`**
The `.tooltip` element on `.faq-button` is revealed exclusively via `:hover` (`opacity: 0` → `opacity: 1` at `top: -40px`). There is no `:focus-visible` rule, no keyboard handler, and no `aria-describedby` linking the button to the tooltip text. Touch users see nothing. Keyboard users navigating to the button see no label beyond the `aria-label="Help and shortcuts"` (which describes the button's action, not the tooltip's content). This is `anti-patterns.md § "Hover-only affordances"`.

```css
/* globals.css:744-748 */
.faq-button:hover .tooltip {
  top: -40px;
  opacity: 1;
  transition-duration: 0.3s;
}
```
```tsx
/* HelpPanel.tsx:24-27 */
<button ref={triggerRef} type="button" className="faq-button" aria-label="Help and shortcuts" ...>
  <svg ...><text ...>?</text></svg>
  <span className="tooltip">Help</span>
</button>
```
→ Either (a) remove the tooltip — the `aria-label` already names the button's purpose; (b) add a `.faq-button:focus-visible .tooltip` rule to match the hover reveal; or (c) replace the tooltip pattern with a persistent label.

---

**[MAJOR] Purple-to-blue gradient on FAQ button and tooltip — `globals.css:669-712` + `globals.css:718-729`**
`.faq-button` ships `background-color: #1900ff` overlaid with `background-image: linear-gradient(147deg, #903bff 0%, #9c00d0 74%)`. Its tooltip repeats the gradient family with `background-image: linear-gradient(147deg, #bf00ff 0%, #1e00ff 74%)`. Both are purple-to-blue/purple-to-magenta — the exact hue combination `anti-patterns.md § "The purple-gradient hero"` names as the single most-recognised AI aesthetic. The `#1900ff` base colour also has no named token. (Gate 2 + gate 48.)

```css
/* globals.css:674-676 */
  background-color: #1900ff;
  background-image: linear-gradient(147deg, #903bff 0%, #9c00d0 74%);
```
```css
/* globals.css:718-720 */
  background-color: #ffe53b;
  background-image: linear-gradient(147deg, #bf00ff 0%, #1e00ff 74%);
```
→ Replace the gradient with a solid `var(--accent)` background. The FAQ trigger is a small floating action button — a single accent colour with a shadow is sufficient and avoids the AI-gradient tell entirely. Remove the tooltip gradient; if a tooltip is kept, use a neutral dark surface (`var(--ink)` at high opacity) with light text.

---

**[MAJOR] Arbitrary hardcoded spacing on `.node-card` — `globals.css:129-137`**
`.node-card` uses `width: 280px`, `min-height: 60px`, and `padding: 10px 10px 10px 11px` — all raw pixel values. The 11 px left padding (1 px off the 10 px used on the other three sides) signals ad-hoc tuning rather than a deliberate spacing scale. The project comment in `globals.css:9-24` maps `NODE_WIDTH` and `NODE_MIN_HEIGHT` to `src/lib/types.ts`, but the CSS holds its own hardcoded copies; the `padding` has no token at all. This is a slop-test gate 24 failure (arbitrary padding value not on the named spacing scale).

```css
/* globals.css:127-138 */
.node-card{
  position: absolute;
  width: 280px;                 /* NODE_WIDTH */
  min-height: 60px;             /* NODE_MIN_HEIGHT */
  height: auto;
  ...
  padding: 10px 10px 10px 11px;
  ...
}
```
→ Move `--node-width: 280px` and `--node-min-height: 60px` into the `:root` token block. Replace `padding: 10px 10px 10px 11px` with a single uniform value drawn from the project's 4-pt spacing scale (e.g. `padding: 10px`), or define a `--space-node` token. The 1 px asymmetry should be removed unless it has a documented optical reason.

---

### MINOR

**[MINOR] Duplicate `--dot-grid` token declarations — `globals.css:50,816-817,983-984`**
`--dot-grid` is declared three times in the same file: once at `:root:50` (`#c3cad8`), once at `globals.css:816` inside a `V2-19` block (`rgba(100, 116, 139, 0.18)`), and again at `globals.css:983` inside another `V2-19 refinement` block (`rgba(71, 85, 105, 0.26)`). The last declaration wins, making the two earlier ones dead code. This is a governance smell — it signals the token was edited in-place multiple times without removing the prior values, and a future maintainer cannot tell which value is canonical.

```css
/* globals.css:50 */
  --dot-grid: #c3cad8;
...
/* globals.css:816-817 (V2-19) */
:root{ --dot-grid: rgba(100, 116, 139, 0.18); }
[data-theme="dark"]{ --dot-grid: rgba(148, 163, 184, 0.10); }
...
/* globals.css:983-984 (V2-19 refinement) */
:root{ --dot-grid: rgba(71, 85, 105, 0.26); }
[data-theme="dark"]{ --dot-grid: rgba(148, 163, 184, 0.16); }
```
→ Delete the first declaration (`globals.css:50`) and the `V2-19` block (`globals.css:816-817`); keep only the final `V2-19 refinement` block at line 983. Document the intended value in a comment.

---

**[MINOR] Semi-thick left border used as status stripe — `globals.css:134,143-145`**
`.node-card` sets `border-left: 3px solid transparent` as its resting state, then swaps the colour via `.status-failed { border-left-color: var(--red) }` etc. A 3 px coloured left border is a thinner variant of the `anti-patterns.md § "The side-stripe card"` pattern (which calls out 4–6 px as the typical width). The border is transparent at rest, which mitigates the issue somewhat — it does not present as a stripe on untagged nodes — but on tagged nodes the 3 px left colour-bar is a status stripe communicated by colour alone (compounding the StatusBadge critical finding above).

```css
/* globals.css:134,143-145 */
.node-card{
  ...
  border-left: 3px solid transparent;
  ...
}
.node-card.status-failed  { border-left-color: var(--red); }
.node-card.status-review  { border-left-color: var(--amber); }
.node-card.status-mastered{ border-left-color: var(--green); }
```
→ Consider replacing the left border with a small coloured square or dot beside the status badge (which already exists), or move the colour signal entirely into the badge and the node's chip row, both of which already carry text labels. If the left border is retained, the 3 px width is below the threshold of the tell — no change needed there.

---

**[MINOR] Hardcoded hex colour in `JsonIcon` SVG fill — `ExportModal.tsx:12-13`**
`JsonIcon` uses `fill="currentColor"` (good — theme-aware), but the SVG paths contain hardcoded `#000`-equivalent stops in the path data. More importantly, `ImageSquare` from Phosphor is rendered with `color="#fff5fb"` — an inline hex colour that bypasses any theme token.

```tsx
/* ExportModal.tsx:132 */
<ImageSquare size={24} weight="duotone" color="#fff5fb" />
```
→ Replace `color="#fff5fb"` with a named token (e.g. `color="var(--on-accent)"` or a new `--export-icon-fill` token) so the icon recolours with the theme.

---

**[MINOR] Jello easing on FAQ button hover — `globals.css:690-712`**
`.faq-button:hover svg` triggers `animation: jello-vertical 0.7s both` — a keyframe sequence using `scale3d` squashing and stretching (`0.75, 1.25`, `1.25, 0.75`). This is the `anti-patterns.md § "Bounce and elastic easing"` pattern applied to an icon. The effect fires on every hover of the help button, including accidental hovers while panning.

```css
/* globals.css:688-712 */
.faq-button:hover svg {
  animation: jello-vertical 0.7s both;
}
@keyframes jello-vertical{
  0%   { transform: scale3d(1, 1, 1); }
  30%  { transform: scale3d(0.75, 1.25, 1); }
  40%  { transform: scale3d(1.25, 0.75, 1); }
  50%  { transform: scale3d(0.85, 1.15, 1); }
  65%  { transform: scale3d(1.05, 0.95, 1); }
  75%  { transform: scale3d(0.95, 1.05, 1); }
  100% { transform: scale3d(1, 1, 1); }
}
```
→ Remove the jello animation entirely, or replace with a single opacity or scale pulse (`scale(1.08)` with `ease-out`). Icon animations should be understated; the current effect is theatrical.

---

## Considered but Rejected

| Location | Candidate | Rejected because |
|---|---|---|
| `globals.css:46-47` | Flag `--panel-bg: rgba(255,255,255,.92)` as pure-white violation | `anti-patterns.md § "Pure black, pure white"` allows near-white surfaces; the alpha is .92 not 1.0; the value is a token, not inline. Not a gate 7 failure. |
| `globals.css:97-98` | Flag `*{ box-sizing: border-box; margin: 0; padding: 0; }` and `html, body{ height: 100%; overflow: hidden; }` as reset slop | Standard universal box-sizing reset; `overflow: hidden` on body is deliberate (canvas owns scrolling). Not a slop tell. |
| `Node.tsx:85` | Flag inline `style` with `STATUS_META[k].color` on chip elements | Already covered under the StatusBadge critical finding (same root cause: status communicated by colour without a parallel text guarantee). Reporting as one finding, not two. |
| `globals.css:100` | Flag `font-family: 'Inter', system-ui, ...` as Inter-everywhere | Two display fonts are used (`Inter` for body, `Sora` for display in `.brand-name`, `.empty-card h2`, `.annotation.ann-heading`). `Inter-everywhere` requires one font across all roles. Not met. |
| `Canvas.tsx:10-11` | Flag `@mui/icons-material` imports as a new dependency concern | Dependency audits are outside this read-only scope; the icon-mismatch finding already covers the visual slop consequence. |
| `ThemeToggle.tsx:3` | Flag `import styled from 'styled-components'` as a framework mismatch | The slop audit is about visual tells and token discipline, not architecture. The styled-components wrapper is a style-isolation choice; its visual output is the hardcoded hex issue, already reported. |

---

## Summary

```
2 critical · 6 major · 5 minor
```

**Verdict — reads as AI-generated**

The surface carries at least six confirmed slop-test gate failures (gates 2, 24, 30, 38a-equiv, 48×3, 49, 53) and four named anti-patterns: the purple-gradient hero (brand logo), mid-render token improvisation (×3 locations), glassmorphism without purpose, and hover-only affordance. The purple gradient on `.brand-logo` and `.faq-button` is the single most-recognisable AI tell in the codebase. The colour-only `StatusBadge` is a critical accessibility failure, not merely a slop tell. Together these reads as a UI that was scaffolded by an LLM with a default purple-gradient + Inter + Material-UI icon set, then partially customised — the customisation added Phosphor icons and Sora display text but left the tell patterns in place.
