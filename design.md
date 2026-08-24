# SYNAPSE — Locked Design System

> **Read-only for builders.** Every visual decision flows from this file.
> Edits go through the Design Lead only. Builders implement against it.

---

## Hallmark Stamp

```
/* Hallmark · genre: modern-minimal · tone: utilitarian · anchor hue: amber oklch(58% 0.155 52) · paper: warm oklch(94.5% 0.012 70) · design-system: design.md · designed-as-app · pre-emit critique: P5 H5 E5 S5 R5 V5 · contrast: pass (40–41) · tokens: pass (48) */
```

---

## 0. Pre-flight Findings

| Signal | Value | Source |
|---|---|---|
| Font stack | IBM Plex Sans (400/500/600/700) + Source Serif 4 (400/600) + IBM Plex Mono (400/500) | `src/app/globals.css` `@import` (Google Fonts css2) |
| Palette | CSS custom-property tokens in `:root` + `[data-theme="dark"]` | `globals.css` lines 26–95 |
| Motion | CSS transitions + keyframe animations; no motion library | globals.css; no `framer-motion`/`motion`/`gsps` in deps |
| Spacing | Informal pixel values; no formal 4-pt scale yet (design system introduces it) | — |
| Framework | Next.js 14 App Router | `package.json` |
| Existing design doc | None — this file is created now | — |

Hallmark will preserve: font stack (IBM Plex Sans body, Source Serif 4 display, IBM Plex Mono outlier), Next.js, plain CSS only.
Hallmark will introduce: named spacing scale, motion discipline (named easings, reduced-motion), 8-state control matrix, frozen-token mapping, anti-slop commitments.

---

## 1. Genre · Tone Extreme · Theme Axes

| Axis | Pick | Stated reason |
|---|---|---|
| **Genre** | **modern-minimal** | Synapse is a precision tool for active recall — structured, disciplined, no decoration for its own sake. Stripe / Linear / Obsidian school. |
| **Tone extreme** | **utilitarian** | Every pixel serves the study task. Restraint is the aesthetic. Decorative motion is a distraction, not a feature. "Clean and modern" is not a tone — this is. |
| **Paper band** | Light: oklch(94.5% 0.012 70) (warm paper) · Dark: oklch(15% 0.012 60) (deep warm) | Warm-tinted toward the anchor hue. Never zero-chroma grey (v2). |
| **Display style** | Modern transitional serif (Source Serif 4 600, -0.018em tracking) | Calm, scholarly authority. Main-node concept titles + workspace/empty/help headings only — serif-vs-sans is the hierarchy. |
| **Accent hue family** | **Amber / ochre** (oklch ≈ 58% 0.155 52) — single warm anchor, no second brand hue | `--accent: oklch(58% 0.155 52)` (light) / `oklch(72% 0.13 55)` (dark). Chosen to escape the AI-default indigo and to literalise the Highlight object (a highlighter). `--brand-secondary` is aliased to `--accent`. |
| **Accent role** | Action / selection / focus ring only. Never decorative. | CTA buttons, selected nodes, focus rings, active palette swatch. |
| **Motion stance** | Counter (150 ms) · state-lift (200 ms) · panel-enter (220 ms ease-out, no overshoot) | All durations ≤ 220 ms. Overshoot (bounce, jello) is forbidden on any UI state transition. `prefers-reduced-motion: reduce` disables all decorative animation. |
| **Icon voice** | **Phosphor** (regular weight, 16 px for toolbar, 14 px for node actions) | `@phosphor-icons/react` only. One library, one weight, one stroke style. `aria-hidden="true"` on all decorative icons. |
| **Control/CTA voice** | Labels are verbs: "New topic", "Import canvas", "Export canvas", "Collapse all", "Expand all", "Undo", "Redo". CTAs use filled primary (`--accent` / `--on-accent`); secondary uses ghost with `--line` border. |
| **Copy voice** | Direct, minimal, present tense. No celebration. No manufactured urgency. | Errors say how to fix. Empty states say what to do next. |

---

## 2. Type Scale

> **v3 — Hallmark typography redesign:** fonts → IBM Plex Sans (body/UI) + Source Serif 4 (display) + IBM Plex Mono (outlier); body raised to 15px / leading 1.6 (reading-optimized); **serif main-node titles**; ratio scale + `--leading-*` / `--tracking-*` tokens. The px/font values in the table below are **superseded** — `src/app/globals.css` `:root` is the canonical source. Inter/Sora removed (Inter is the Hallmark-banned default).

| Role | Face | Weight | Size | Line-height | Use |
|---|---|---|---|---|---|
| `--text-display` | Sora | 700 | 19–20 px | 1.1 | Empty-state heading, help heading |
| `--text-brand` | Sora | 700 | 15.5 px | 1.1 | Toolbar brand name |
| `--text-node` | Inter | 500 | 13.5 px | 1.45 | **Primary read-evaluate text.** Node content and editor. Named role — not an ad-hoc value. |
| `--text-body` | Inter | 400 | 13–13.5 px | 1.55 | Modal body, sidebar text, help body |
| `--text-ui` | Inter | 600 | 10.5–12.5 px | 1.4 | Chips, toolbar buttons, section headers, labels |
| `--text-caption` | Inter | 500 | 10.5 px | 1.4 | Chips, meta |
| `--text-muted` | Inter | 500 | 11–11.5 px | 1.4 | Save indicator, dial legend values |

Rules:
- Roman headings only — no italic on any heading or display text. Italic survives only as body-copy emphasis.
- `font-variant-numeric: tabular-nums` on every numeric readout (zoom label, dial legend values, node count chips).
- All sizes flow through the named role; no raw `font-size` values outside the token block.

---

## 3. Spacing Scale

All spacing values in CSS rules outside the token block are drawn from this scale. Values are in px.

```
4   = xs
6   = sm
8   = md
10  = md-plus
12  = lg
14  = lg-plus
16  = xl
20  = 2xl
24  = 3xl
30  = 4xl
```

| Role | Value | Use |
|---|---|---|
| `--space-node-pad` | 10 px | Node card padding |
| `--space-float-pad` | 14 px | Panel padding (dial card, help modal) |
| `--space-modal-pad` | 24 px | Modal card padding |
| `--space-gap-xs` | 4 px | Tight inline gaps (chips, icon clusters) |
| `--space-gap-sm` | 6 px | Standard inline gap (toolbar, node-actions) |
| `--space-gap-md` | 8–12 px | Section-level gaps |
| `--space-float-offset` | 16 px | Floating chrome offset from viewport edge |
| `--space-separator` | 1 px | Rule / separator |

No arbitrary pixel values (e.g. `padding: 10px 10px 10px 11px`) are permitted. The 1 px asymmetry in `.node-card` is removed.

---

## 4. Elevation Language

Three elevation tiers. Shadow values live in the `:root` token block only.

| Tier | Token | Radius | Use |
|---|---|---|---|
| E1 — card | `--shadow-sm` | `var(--radius)` (12 px) | Node cards |
| E2 — float | `--shadow-md` | 14 px | Floating panels (toolbar, dial, palette, selection hint, focus-exit pill) |
| E3 — modal | `--shadow-lg` | 16 px | Modal overlays, help modal, theme manager |

No surface at E2 or below carries `backdrop-filter: blur()`. Blur is permitted on modal overlays (E3) only, where it separates the dialog from the canvas beneath. `backdrop-filter` on `.ui-float`, `.empty-card`, `.node-palette`, `.selection-hint`, `.focus-exit-pill` is **removed** (anti-slop commitment §3).

---

## 5. Border / Radius Scale

| Radius | Value | Use |
|---|---|---|
| `--radius` | 12 px | Node cards, panels |
| `--radius-sm` | 8 px | Buttons, icon buttons, inputs |
| `--radius-xs` | 6 px | Icon buttons, chips, swatches |
| `--radius-full` | 999 px | Pills, FAQ button, selection hint |
| `--radius-brand` | 9 px | Brand logo tile |

Border language:
- Status colour is carried by `.status-dot` + chip row, **not** by the node left border (anti-slop commitment §2).
- `.node-card` resting state: `border: 1px solid var(--line)` with transparent left border removed.
- All directional border properties on non-physical elements use logical properties (`border-inline-end`, `border-inline-start`).

---

## 6. Frozen-Token Mapping Table

Tokens listed in `THEME_TOKENS` (`src/lib/types.ts` line 22) are a frozen API. Names must never be renamed or removed. Values may be retuned; new tokens may be added alongside.

> **v2 — Hallmark color redesign:** every value has been retuned to a warm OKLCH system (anchor amber `oklch(58% 0.155 52)`; all neutrals warm-tinted; shadows warm-tinted). The legacy hex values in this table are **superseded** — `src/app/globals.css` `:root` / `[data-theme="dark"]` are the canonical OKLCH source of truth. `--concept` / `--concept-soft` retired; `--brand-secondary` aliased to `--accent`.

| Token name | Role | Light value | Dark value |
|---|---|---|---|
| `--bg` | Canvas background | #e7ebf3 | #10151f |
| `--dot-grid` | Canvas dot grid | rgba(71,85,105,.26) | rgba(148,163,184,.16) |
| `--surface` | Card / panel fill | #ffffff | #1b2231 |
| `--panel-bg` | Floating panel fill | rgba(255,255,255,.92) | rgba(27,34,49,.92) |
| `--overlay` | Modal overlay | rgba(15,23,42,.42) | rgba(0,0,0,.6) |
| `--help-overlay` | Help overlay | rgba(15,23,42,.48) | rgba(0,0,0,.6) |
| `--hover` | Hover fill | #f1f5f9 | #242c3c |
| `--chip-bg` | Chip fill | #f8fafc | #202939 |
| `--ink` | Primary text | #0f172a | #e9edf5 |
| `--ink-2` | Secondary text | #334155 | #c6cddb |
| `--muted` | Tertiary text | #64748b | #97a0b3 |
| `--faint` | Quaternary text | #94a3b8 | #7b869e **(raised from #6a7386 — see §9)** |
| `--line` | Border / rule | #d9e0ea | #2c3547 |
| `--line-2` | Border subtle | #cbd5e1 | #3a4459 |
| `--accent` | Primary accent | #4f46e5 | #8b93f8 |
| `--accent-hover` | Accent hover | #4338ca | #a5acff |
| `--accent-soft` | Accent fill (10–18%) | #eef2ff | rgba(139,147,248,.16) |
| `--edge-line` | Edge connector | #c3cad6 | #39445a |
| `--danger` | Semantic red (status / destructive) | #ef4444 | #f87171 |
| `--danger-soft` | Danger fill | #fef2f2 | rgba(239,68,68,.14) |
| `--danger-hover` | Danger hover | #dc2626 | #f87171 |
| `--success` | Semantic green | #059669 | #34d399 |
| `--success-soft` | Success fill | rgba(16,185,129,.18) | rgba(16,185,129,.18) |
| **New: `--radius`** | Card/panel radius | 12 px | 12 px |
| **New: `--radius-sm`** | Button radius | 8 px | 8 px |
| **New: `--node-width`** | Node card width | 280 px | 280 px |
| **New: `--node-min-h`** | Node card min-height | 60 px | 60 px |
| **New: `--toggle-track`** | Theme switch track (dark) | #2a2a2a | #2a2a2a |
| **New: `--toggle-knob`** | Theme switch knob (light) | #d8dbe0 | #d8dbe0 |
| **New: `--toggle-sun`** | Sun icon (knob inset) | #ffcf48 | #ffcf48 |
| **New: `--toggle-moon`** | Moon track (checked) | #00a6ff | #00a6ff |
| **New: `--brand-fill`** | Brand logo background | var(--accent) | var(--accent) |
| **New: `--on-accent`** | Text on accent | #ffffff | #ffffff |
| **New: `--accent-shadow`** | Accent shadow | rgba(79,70,229,.5) | rgba(139,147,248,.5) |

**Deprecated but retained (not removed):** `--brand-secondary` (#7c3aed light / same dark) — frozen name kept for backward compatibility; visual use is **retired**. The brand logo uses `--accent` solid only (anti-slop commitment §1). Any custom theme that still sets `--brand-secondary` will not cause a break; the value is simply ignored visually.

---

## 7. Motion Stance

### Named Easings

| Name | Value | Use |
|---|---|---|
| `--ease-out` | `cubic-bezier(.2,0,0,1)` | All state transitions (panel enter, modal enter, node enter) |
| `--ease-in-out` | `cubic-bezier(.4,0,.2,1)` | Crossfades, colour transitions |
| `--ease-spring` | *(removed — overshoot forbidden)* | — |

### Durations

| Duration | Use |
|---|---|
| 80 ms | Hover feedback (colour, background) |
| 120–150 ms | Micro-movements (chevron rotate, icon opacity) |
| 180–220 ms | Panel / modal enter |
| 250–300 ms | Layout transitions (focus mode fade) |

### Rules

1. **Overshoot is forbidden on all UI state transitions.** No `cubic-bezier` with y-value > 1.0. No jello, no bounce, no elastic.
2. **Animate `transform` and `opacity` only.** No layout-triggering properties.
3. **`prefers-reduced-motion: reduce`** disables every decorative animation:
   - `.node-card.node-enter` → `animation: none`
   - `.node-card.node-reveal` → `animation: none`
   - `.node-card.node-enter::after` (border beam) → `animation: none; opacity: 0`
   - `.dial-seg` → `animation: none`
   - `.faq-button:hover svg` → `animation: none` (jello removed entirely)
4. **One orchestrated entrance max per surface.** Node card enters with `nodeIn`; modal enters with `fadeIn + nodeIn`. No stacked entrance choreography.
5. **Focus rings appear instantly** (`transition: none` on `outline` changes). Focus rings are not animated.

---

## 8. 8-State Matrix (Interactive Controls)

Every interactive control (button, icon button, swatch, toggle, chevron, dialog close) must render all eight states where applicable. States are implemented via real pseudo-classes; `.is-hover` / `.is-focus` / `.is-active` / `.is-disabled` class hooks exist for the parallel builder edit pass.

| # | State | Pseudo-class | Visual treatment |
|---|---|---|---|
| 1 | **Default** | — | `color: var(--ink-2)` (icon buttons: `var(--muted)`); no background |
| 2 | **Hover** | `:hover` | `background: var(--hover)`; icon colour → `var(--ink-2)` |
| 3 | **Focus-visible** | `:focus-visible` | `outline: 2px solid var(--accent); outline-offset: 2px; border-radius: var(--radius-sm)` |
| 4 | **Active** | `:active` | `transform: scale(.97)` on buttons; no colour change |
| 5 | **Disabled** | `:disabled` / `.is-disabled` | `opacity: .45; cursor: not-allowed; pointer-events: none` |
| 6 | **Selected** | `.is-selected` | `outline: 2px solid var(--accent); outline-offset: 2px` |
| 7 | **Loading** | `[data-loading]` | `cursor: wait; pointer-events: none` (not yet used; reserved) |
| 8 | **Success** | `.is-success` | Border / ring → `var(--success)` (reserved for save confirmations) |

Focus ring rule: `outline` appears instantly with zero transition duration. Focus rings are never animated.

---

## 9. Surface Families

### 9.1 Canvas

| Property | Value |
|---|---|
| Background | `var(--bg)` |
| Dot grid | `radial-gradient(circle, var(--dot-grid) 1px, transparent 1px)` — background-size follows zoom/pan via JS |
| Edges | `var(--edge-line)` stroke, 3 px, opacity .9 |
| Node card | `var(--surface)` fill, `var(--line)` border, `var(--shadow-sm)` |

### 9.2 Floating Chrome (E2)

| Element | Token | Blur |
|---|---|---|
| `.ui-float` (toolbar, dial, palette, selection hint, focus-exit pill) | `var(--panel-bg)` + `var(--shadow-md)` + `var(--line)` border + 14 px radius | **None** — removed |
| `.empty-card` | `var(--empty-panel-bg)` + `var(--shadow-md)` + dashed `var(--line-2)` border + 20 px radius | **None** — removed |

### 9.3 Overlays (E3 — blur permitted)

| Element | Token | Blur |
|---|---|---|
| `.modal-overlay` | `var(--overlay)` + `backdrop-filter: blur(3px)` | Yes — separates dialog from canvas |
| `.help-overlay` | `var(--help-overlay)` + `backdrop-filter: blur(3px)` | Yes |
| `.theme-manager-overlay` | `var(--help-overlay)` + `backdrop-filter: blur(3px)` | Yes |

### 9.4 Sidebar — library navigation (expanded panel + compact rail + mobile drawer)

| Property | Value |
|---|---|
| Surface | `var(--surface-nav)` — deliberately quieter/darker than the canvas board (`--bg`) so the layering reads Sidebar → Canvas → Nodes |
| Expanded width | 264px desktop (220px ≤1024; `min(86vw,320px)` ≤480 overlay drawer) |
| Collapsed width | 56px compact visual-index rail (not a hidden sidebar) |
| Border | `border-inline-end: 1px solid var(--line)` |
| Active page | Marked-notebook treatment: `background: var(--accent-soft)` + inset 3px `var(--accent)` rail + `--ink` weight 600 + accent icon (never a bright pill) |
| Context folder | quiet warm wash `color-mix(--accent-soft 55%, transparent)` |
| Hover row | `background: var(--hover)` (transparent at rest — never bordered cards) |
| Collapse transition | width + flex-basis 200ms `--ease-out`; rail stays stable; `prefers-reduced-motion` → snap |
| Collapsed rail mark active | accent rail + accent icon (orientation preserved); hover/focus peek tooltip (800ms hover / 0ms focus) |
| Sections | Pinned (surfaces existing `pinned` flags) · Recent (top by `updatedAt`) · Folders · Quick Notes |
| Create | single primary "Quick note" at footer + ghost "New folder"; removed the dual top toolbar |
| Mobile (≤768) | expanded = overlay drawer + scrim (tap-outside / Escape dismiss); collapsed rail stays in-flow |

---

## 10. Icon Voice

**One library: Phosphor** (`@phosphor-icons/react`).

All Material UI (`@mui/icons-material`) imports are replaced with Phosphor equivalents:

| MUI icon | Phosphor replacement | Used in |
|---|---|---|
| `FitScreenIcon` | `MagnifyingGlass` (or `ArrowsOutSimple`) | Canvas.tsx viewbar |
| `AutoFixHighIcon` | `MagicWand` | Canvas.tsx viewbar |
| `UnfoldMoreIcon` | `CaretDown` (or `ChevronsDown`) | Toolbar.tsx |
| `UnfoldLessIcon` | `CaretUp` (or `ChevronsUp`) | Toolbar.tsx |
| `UndoIcon` | `ArrowUUpLeft` | Toolbar.tsx |
| `RedoIcon` | `ArrowURightDown` (or `ArrowUUpRight`) | Toolbar.tsx |
| `DownloadIcon` | `DownloadSimple` | DataPortability.tsx |
| `FileUploadIcon` | `UploadSimple` | DataPortability.tsx |

Inline SVGs (`PinIcon` in Sidebar.tsx, `JsonIcon` in ExportModal.tsx) are replaced with Phosphor equivalents:
- `PinIcon` → `Pin` (Phosphor)
- `JsonIcon` → `FileCode` (Phosphor)

Unicode glyphs as icon buttons (`⣿`, `♲`, `＋`, `–`, `×`) are replaced with Phosphor icons:
- `⣿` (drag handle) → `GripVertical` (Phosphor)
- `♲` (delete) → `Trash` (Phosphor)
- `＋` (add child) → `Plus` (Phosphor)
- `–` (minimise dial) → `Minus` (Phosphor)
- `×` (close) → `X` (Phosphor)

Icon size: 16 px for toolbar and viewbar; 14 px for node actions; 20 px for export modal icons.
All decorative icons carry `aria-hidden="true"`. All icon-only buttons carry `aria-label`.
`currentColor` is the only fill mechanism. No `color="#hex"` on Phosphor icons.

---

## 11. Anti-Slop Commitments

1. **No purple-gradient identity.** The brand mark is `background: var(--accent)` (solid). No gradient on `.brand-logo`, `.empty-icon`, `.faq-button`, or `.tooltip`. The AI-gradient tell (purple → blue/pink) is banished.

2. **No side-stripe cards as sole status carrier.** Node status is communicated by `.status-dot` (the badge) + chip row with text labels. The 3 px `border-left` colour stripe on `.node-card` is **removed**. Status dots carry `aria-label` so meaning is not colour-only.

3. **No glassmorphism without purpose.** `backdrop-filter: blur()` exists on modal overllays (E3) only. It is removed from `.ui-float`, `.empty-card`, `.node-palette`, `.selection-hint`, `.focus-exit-pill`. The dot-grid canvas has no content beneath that benefits from de-focussing.

4. **Tinted near-black/near-white, not pure.** Surfaces use `#10151f` (dark bg) and `#e7ebf3` (light bg) — both are tinted. `#000` and `#fff` appear only as `--on-accent` text fill where required for contrast.

5. **Roman headings only.** No italic on any heading, brand name, or display text. `Source Serif 4` at weight 600, `font-style: normal`. Italic survives only as `<em>` inside body-copy paragraphs.

6. **Tabular-nums on numeric readouts.** `#zoom-label`, `.dial-legend-val`, and node count chips all use `font-variant-numeric: tabular-nums`.

7. **One orchestrated entrance max.** Node card enters once with `nodeIn` animation. Border-beam runs concurrently for ≤ 5 s then stops. No stacked entrance choreography.

8. **Silent success over celebratory toasts.** The save indicator (`#save-ind`) fades in with a green dot — no animation, no pop, no checkmark.

9. **No raw hex/rgb outside token blocks.** Every colour in every CSS rule outside `:root` / `[data-theme="dark"]` references a named `var()`. Exception: `transparent`, `currentColor`.

10. **One accent hue family.** Indigo only. No `--brand-secondary` visual use (token retained for API compat). No warm accent competing with cool indigo.

11. **No bounce easings.** Overshoot (`cubic-bezier` y > 1), jello, elastic — all removed. `--ease-out` (`cubic-bezier(.2,0,0,1)`) is the maximum energy easing.

12. **No mid-render token improvisation.** Every new colour required by a component is declared in the `:root` / `[data-theme="dark"]` token block before it is used. ThemeToggle's local `--light` / `--dark` namespace is removed; its colours are lifted to `--toggle-track`, `--toggle-knob`, `--toggle-sun`, `--toggle-moon`.

---

## 12. Accessibility Floor

- `:focus-visible` ring: `2px solid var(--accent); outline-offset: 2px; border-radius: var(--radius-sm)` — instant appearance, zero transition.
- Every icon-only button carries `aria-label` (not `title`).
- Status meaning is never colour-only: dot + aria-label + chip text label.
- `prefers-reduced-motion: reduce` disables all decorative animation.
- Contrast floor: 4.5:1 for body text (≥ 13 px), 3:1 for large text (≥ 18 px).
- `--faint` dark value raised to `#7b869e` (L≈0.091) against `--surface` #1b2231 (L≈0.013) = ~4.91:1 ✓.
- All modals have `role="dialog"`, `aria-modal="true"`, `aria-labelledby`. HelpPanel and ExportModal restore focus on close. (Focus trap is a Builder-phase addition.)
