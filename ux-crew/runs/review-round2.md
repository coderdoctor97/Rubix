# Phase R2 — Focused re-verification report · review-round2.md

> Re-review subagent (same orchestrator, fix-scoped). Mode `re-verification`:
> each round-1 finding in `review-final.md` was re-checked against a fresh
> manual read of the exact regions touched by the fix cycle. No finding is
> accepted as closed on the fix report's word alone.

---

## Scope and Coverage

**Mode:** `re-verification` (fix-cycle). Scope limited to the four files the
fix cycle touched; every region read directly with offset/limit (no grep-only
judgments for verdict-bearing evidence).

### Exact scope (4 files)

| File | Regions read this pass |
|---|---|
| `src/app/globals.css` | :root token block (1–80), dark block (124–151), zb-btn (920–960), dial-card (1060–1080), dial-mini (1130–1190), palette rename (1730–1750), responsive @480 palette (1790–1805), reduce guard (2680–2725 incl. tail) |
| `src/components/Canvas/KnowledgeDialPanel.tsx` | lines 90–122 (mini-donut block) + button inventory grep across full file (hits at 98, 117, 168, 173; expanded block 160–181 read to confirm siblings) |
| `src/components/Canvas/ThemeToggle.tsx` | lines 1–23 (full component) |
| `src/components/Canvas/HelpPanel.tsx` | lines 38–45 and 88–96 + glyph sweep (`⣿`, `frame-icon`) across full file |

**Stack recon (unchanged from round 1):** Next.js 14 App Router · TS strict ·
Zustand · plain CSS custom properties only · `@phosphor-icons/react` ·
Inter + Sora via fontsource CDN · frozen THEME_TOKENS name API.

### Per-domain coverage

| Domain | Evidence inspected this pass | Result |
|---|---|---|
| Accessibility | `aria-label` placement on ThemeToggle checkbox (:16); interactive nesting audit of all four `<button>` elements in KnowledgeDialPanel (two sibling pairs inside non-interactive wrappers); reduce-guard coverage of `.dial-mini` and `.palette-palette` (2702–2708) | Clear |
| Writing | HelpPanel grip copy ("six-dot grip handle", :41) and viewbar copy ("magnifier icon", :93); zero stale `⣿`/frame-icon references | Clear |
| UI | CSS ↔ markup class contract: `node-palette` grep → **0 hits**; `.palette-palette` live at :1733 (`:has()`) and :1744 (rule), responsive @480 override uses `.palette-palette` (:1796); dead `.help-trigger` grep across all of src → **0 hits**; duplicate-selector check: single `.zb-btn` block (:932) + state variants only | Clear |
| Colors | `--beam-highlight: var(--on-accent)` defined in both theme blocks (:58 :root, :142 dark) and consumed at all three beam sites (:374 gradient stop, :375/:377 mask composites) | Clear |
| Layout | `.dial-card` transition now opacity-only (:1071, no `left`); `.dial-mini` carries entrance animation only, no layout-property transition | Clear |
| Typography | `tabular-nums` present on `.chip` (:628) and `.sidebar-count` (:2078) | Clear |
| Motion discipline | `.empty-card` enters at `nodeIn 0.22s var(--ease-out)` (:686) — within the ≤220 ms table, on-token easing; reduce guard closes with `.empty-card { animation: none }` (:2722–2724) | Clear |

---

## Findings

None — all seven round-1 findings are verified closed.

Per-finding closure evidence:

| # | R1 sev | Closure evidence (this pass) |
|---|---|---|
| 1 | HIGH | `@media (prefers-reduced-motion: reduce)` contains `.dial-mini { animation: none }` (:2702–2704) **and** `.palette-palette { animation: none }` (:2706–2708); guard block spans :2684–2725 |
| 2 | MEDIUM | `node-palette` → zero hits in globals.css; `.palette-palette` styled at :1744 (+ `:has()` at :1733); @480 responsive rule targets `.palette-palette` (:1796) |
| 3 | MEDIUM | Mini-dial outer element is `<div className="dial-mini ui-float">` (:96) wrapping two sibling buttons (expand :98–116, hide :117–121); expanded card's two action buttons are siblings in `.dial-header-actions` (:167–178). No `<button>` inside `<button>` anywhere in the file |
| 4 | MEDIUM | `aria-label={label}` sits directly on `<input type="checkbox">` (ThemeToggle.tsx:16); `title` retained on the label (:12) exactly per the prescribed fix |
| 5 | MEDIUM | Beam rule consumes `var(--beam-highlight)` at :374/:375/:377; token defined as `var(--on-accent)` in both theme blocks (:58 light, :142 dark) |
| 6 | LOW | HelpPanel.tsx:41 reads "six-dot grip handle"; :93 reads "magnifier icon fits everything on screen"; grep for `⣿|frame-icon` across the file → 0 hits |
| 7 | LOW | Single deduped `.zb-btn` (:932–956); dead `.help-trigger` gone from CSS **and** markup (0 hits in src); `tabular-nums` on `.chip` (:628) and `.sidebar-count` (:2078); `.dial-card` animates opacity only (:1071), `.dial-mini` has no transition; `.empty-card` at 0.22s ease-out (:686) |

---

## Considered but Rejected

| Location | Candidate | Rejected because |
|---|---|---|
| `globals.css:377` | Flag `var(--beam-highlight)` resolving through two indirections (`--beam-highlight → --on-accent → #ffffff`) as fragile | The indirection is deliberate semantic naming; both theme blocks define identical values, so rendering matches the pre-fix literals exactly. Token provenance, not pixel behavior — not a defect |
| `KnowledgeDialPanel.tsx:106` | Ask for `role="img"`/label on the mini donut `<svg>` | SVG already carries `aria-hidden="true"` and its data is fully duplicated by the legend rows (labels + values) when expanded; decorative duplication in the a11y tree would be noise, not signal |
| `ThemeToggle.tsx:12+16` | Remove the `title` on the label now that the input has an accessible name | Title serves sighted-pointer users as a tooltip; accname comes from the input's own aria-label, so there is no double-announcement conflict. Spec-conformant pattern |
| `globals.css:1169` | Question whether `.dial-mini`'s un-transitioned entrance (`animation: heatmap-fade-in 0.18s ease`) needs a transition too | Animation and transition would double-drive the same property; the entrance is guarded under reduced motion (:2702) and the exit path relies on React unmount. Current structure is correct |
| `globals.css:1795–1805` | Verify the @480 swatch resize against design.md spacing scale | Swatch 24px at mobile is a hit-area floor improvement consistent with the ≥24px convention noted in round 1; no off-scale gap introduced in the read region |

---

## Verification

**Passed**

1. **Guardian gates (cited, not rerun — `ux-crew/runs/guardian-G1-1.md`):**
   shield PASS · `tsc --noEmit` exit 0 · build compiled 3 routes ·
   **5 files / 34 tests passed** · frozen-zone hash PASS · token API 21/21 in
   both blocks · slop spot-check PASS.
2. **Manual reads (this pass):** every region listed under Exact scope was read
   directly via offset/limit; verdict evidence above cites observed lines, not
   the fix report's claims.
3. **Targeted greps:** `node-palette` in globals.css → 0;
   `help-trigger` across all of src → 0; `⣿|frame-icon` in HelpPanel.tsx → 0;
   `<button` inventory in KnowledgeDialPanel.tsx → 4 hits, all inspected, none nested;
   single `.zb-btn` definition block confirmed.
4. **Round-1 regression watch:** none of the fixes disturbed neighbors —
   `.zb-btn.is-active:hover` still resolves to `var(--accent-hover)` (:954–956),
   `.palette-swatch` rules intact around the renamed container, dark-block
   token parity preserved (both blocks carry the new beam token).

**Not verified (runtime-only, unchanged scope limitation from round 1):**

- Rendered reduce-motion behavior of the mini-dial/palette entrances in a real browser session.
- AT conformance of the moved checkbox name across engine combinations (spec-conformant per accname computation; not AT-tested).
- Visual result of the @480 palette sizing at 320px width (CSS-read inference only).

---

## Verdict

**Approve**

All 7 round-1 findings (1 HIGH · 4 MEDIUM · 2 LOW) are closed with direct
evidence; no new findings introduced by the fix cycle; locked floors
(design.md §7 motion, §11 typography, §12 reduced-motion, §9 token discipline)
are satisfied for the scoped change set. Pre-existing items deferred in
round 1 (modal focus trap cluster, Annotation hover-only delete, light-mode
`--faint` contrast, ThemeManager × glyph) remain out of scope and unchanged.
