# CANVAS BUILDER — Build Report

> Session: resume run after interrupted previous builder.
> Previous session already completed `src/app/globals.css`, `Canvas.tsx`, `Node.tsx` (untouched this session).
> Contract implemented against: `design.md` + `ux-crew/runs/design-plan.md`.

---

## Files touched this session

| File | Status |
|---|---|
| `src/components/Canvas/Annotation.tsx` | **EDITED** (2 lines) |
| `src/components/Canvas/Edges.tsx` | **UNTOUCHED** — no planned changes |
| `src/components/Canvas/SelectionHint.tsx` | **UNTOUCHED** — plan C.9 says none |

---

## Per-file changes

### Annotation.tsx — plan item M-21 (placeholder copy)

Design-plan M-21: *Identical "Type something…" placeholder in node and annotation* → Node gets
"What's this about?", **Annotation gets "Add a note…"**. Section D.4 row
`.annotation / .ann-content / .ann-editor` confirms: "Unchanged; placeholder text updated in TSX".

1. `.ann-editor` textarea `placeholder="Type something…"` → `placeholder="Add a note…"` (line 55).
2. Empty-state display text `{ann.content||'Type something…'}` → `{ann.content||'Add a note…'}` (line 56).

Both occurrences updated to match how the previous builder applied M-21 in `Node.tsx`
(both the editor placeholder and the non-editing hint text were switched there).
Copy/presentation only; no handler, prop, or store call changed.

### Edges.tsx — no planned changes

`design-plan.md` contains no Section B/C item for Edges.tsx. Section D.4 lists `#edges`
as "Unchanged". Its inline strokes already use `var()` tokens (`--green`, `--amber`, `--red`),
satisfying the token rule. Left byte-identical. See Contract Gaps below for the one issue found.

### SelectionHint.tsx — no planned changes

Plan C.9 states explicitly: "SelectionHint.tsx already uses semantic `<span>` elements with
text content. The `aria-live="polite"` region is correct. No changes needed in this phase."
Left byte-identical. Classes `.selection-hint/-item/-sep` all still exist in globals.css
(lines 2283–2321).

---

## Contract gaps

**GAP-1 — `var(--wire-color)` referenced by Edges.tsx no longer exists (pre-existing, not introduced by me).**
The Design Lead's globals.css rewrite dropped `--wire-color` (old stylesheet defined it at line 52,
`#6b7280`). It is not part of the frozen `THEME_TOKENS` API (`src/lib/types.ts` line 22), so removing
it was legal — but `Edges.tsx` still resolves neutral wires through `'var(--wire-color)'`
(Edges.tsx lines 17–18). With the variable undefined, the inline `stroke` declaration for
status-neutral / untinted edges computes to nothing → neutral connector wires lose their stroke.
Status-coloured and tint-coloured edges are unaffected (`--green/--amber/--red/--tint` all resolve).

Per role rules I did **not** improvise a fix (no plan item covers Edges.tsx). Escalating to
Design Lead / Master with two resolution options:

- **CSS request (preferred):** add to both token blocks in `globals.css`:
  `:root { --wire-color: var(--edge-line); }` · `[data-theme="dark"] { --wire-color: var(--edge-line); }`
  (keeps Edges.tsx untouched; `--edge-line` is the designated edge token per design.md §9.1), or
- **Authorized TSX swap:** permit Canvas Builder to change Edges.tsx lines 17–18 from
  `'var(--wire-color)'` to `'var(--edge-line)'` (presentation-only token swap, parity-safe).

---

## CSS requests

Only GAP-1 above. No new class names were needed; every class used by my three files
(`annotation`, `ann-heading/text`, `is-hover`, `is-editing`, `ann-content`, `is-empty`,
`ann-editor`, `ann-delete`, `selection-hint`, `selection-hint-item`, `selection-hint-sep`)
exists in the rewritten globals.css.

---

## Self-check results

| Check | Result |
|---|---|
| Raw hex/rgb/oklch in TSX | ✅ Pass — only matches are Edges.tsx *comments* documenting what each `var(--token)` resolves to; no raw color values in code |
| Inline `style={{ }}` | ✅ Pass — 3 pre-existing instances, all positional/data-driven (Annotation left/top; Edges SVG surface + per-path stroke/width); stroke values are `var()` tokens; no color/font literals added |
| aria-label on icon-only controls | ✅ Pass — sole icon-only control `.ann-delete` carries `aria-label="Delete note"` (+ `title`); its `×` glyph is decorative text inside a labelled button |
| Decorative SVG `aria-hidden` | ✅ N/A — my three files render no icon components/SVG glyphs (Edges `<svg>` is the data layer, pointer-events:none, unchanged) |
| Focus-visible rings | ✅ N/A — no new interactive elements added |
| Removed event handlers / behavior lines | ✅ None removed or altered |
| TypeScript strict | ✅ `npx tsc --noEmit` → exit 0, **zero errors** |

## Parity statement

Handlers preserved byte-identical: `onDown/onMove/onUp` (drag + click-to-edit gesture logic),
`save/cancel`, `updateAnnotation/deleteAnnotation/moveAnnotation`, `adjust` auto-resize,
pointer capture, hover state, `useEffect` focus/editing wiring — all untouched in Annotation.tsx.
Edges path geometry (`useMemo` bezier math, tint > status > neutral precedence) and SelectionHint's
store selectors/conditional render untouched. The only diffs in the working tree from this session
are the two copy strings in Annotation.tsx. No props, store calls, persistence, drag math, or
visibility logic changed anywhere.

## Validation

```
npx tsc --noEmit   → exit 0, no output (clean)
```

Note: the anticipated pre-existing `tests/undo.test.ts(138,44) TS2554` did not appear under the
project tsconfig (tests excluded from this compile path); regardless, zero errors ≠ any new error
introduced by this session. Full build/test gates remain the Guardian's phase (per role file §5).
