# Phase R — Consolidated better-interface Review · review-final.md

> Consolidated reviewer (better-interface orchestrator). Read-only except this report.
> Scope resolved by SHA256 recomputation against `ux-crew/baseline-files.json`.
> `interface-review` was NOT auto-invoked (crew law, MASTER_AGENT §3); scope and
> Introduced/Regression classification were produced inside this review from the hash manifest.

---

## Scope and Coverage

**Mode:** `full` (change-scoped). Finding cap 15; escalation triggers rank first.

**Exact scope (recomputed, not assumed):** SHA256 of every manifest entry re-hashed against current tree → **exactly 13 files differ**, matching the expected change set:

| # | Changed file | Owner zone | Claimed by |
|---|---|---|---|
| 1 | `src/components/Canvas/Canvas.tsx` | canvas-builder | build-canvas (prior session) |
| 2 | `src/components/Canvas/Node.tsx` | canvas-builder | build-canvas (prior session) |
| 3 | `src/components/Canvas/Annotation.tsx` | canvas-builder | build-canvas (2-line copy edit) |
| 4 | `src/components/Canvas/DataPortability.tsx` | shell-builder | build-shell (prior session) |
| 5 | `src/components/Canvas/ExportModal.tsx` | shell-builder | build-shell (prior session) |
| 6 | `src/components/Canvas/ThemeToggle.tsx` | shell-builder | build-shell (prior session) |
| 7 | `src/components/Canvas/Toolbar.tsx` | shell-builder | build-shell (prior session) |
| 8 | `src/components/Canvas/HelpPanel.tsx` | shell-builder | build-shell |
| 9 | `src/components/Canvas/KnowledgeDialPanel.tsx` | shell-builder | build-shell |
| 10 | `src/components/Sidebar/Sidebar.tsx` | shell-builder | build-shell |
| 11 | `src/components/ui/StatusBadge.tsx` | shell-builder | build-shell |
| 12 | `src/app/globals.css` | design-lead | design-plan A / build reports |
| 13 | `tests/undo.test.ts` | human-approved override OVR-001 | override-log.md |

Byte-identical to baseline: all of `src/lib/**`, `scripts/**`, `package.json`, lockfile, `tsconfig.json`, `next.config.mjs`, plus `Edges.tsx`, `SelectionHint.tsx`, `ThemeManager.tsx`, `Button.tsx`, `ThemeToggle`-adjacent app routes incl. `src/app/canvas/[id]/page.tsx` (verified with `-LiteralPath`; bracket path had been skipped as a wildcard by the first pass). **No unlisted file differs — frozen zones intact.**

New untracked artifacts noted, not reviewed as UI: `design.md`, `ux-crew/**` (contract + run logs), skills collection additions under `skills/skills/**`.

**Stack recon (conventions found):** Next.js 14 App Router · TypeScript strict · Zustand · plain CSS custom properties in `src/app/globals.css` only (no Tailwind; styled-components removed from ThemeToggle this wave) · `@phosphor-icons/react` as sole icon library · Inter (400–700) + Sora (600/700) via fontsource CDN · tokens in `:root` / `[data-theme="dark"]` with frozen `THEME_TOKENS` name API.

**Project convention documents read:** root `AGENTS.md` (shield), `SYNAPSE_STRICT_RULES.md` referenced thereby, `ux-crew/MASTER_AGENT.md`, `ux-crew/runs/design-plan.md` (class contract), `design.md` (locked system), guardian/build run logs. No CONTRIBUTING/CODING_STANDALS/Storybook docs exist. Per skill principle 2 these informed *where* findings are reported (e.g. locked floors in `design.md` §7/§11/§12), not whether they were raised.

**Review boundary:** full manual reads of all 11 changed TSX files and all 2,723 lines of `globals.css`; static source evidence only. No dev server or browser session was run in this phase; runtime-only judgments are marked **Not verified** below. Pre-existing issues in touched files capped at three per the format.

### Per-domain coverage

| Domain | Evidence inspected | Result |
|---|---|---|
| Accessibility | All icon-only controls' accessible names across the 11 TSX; dialog semantics on all 7 dialogs; status colour-independence chain (dot → aria-label → lettered chips); keyboard models (mini-dial conversion, theme switch checkbox, empty-state role=button); focus-visible rules incl. `.toggle-switch .checkbox:focus-visible~.slider`; reduced-motion inventory of all 13 `animation:` declarations vs 4 guard blocks; hit areas (.icon-btn/.heatmap-icon-btn/.sidebar-icon-btn/.resize-grip now ≥24px); interactive-nesting audit | 3 findings (#1 HIGH, #3, #4) |
| Layout | Toolbar wrap/max-width, sidebar breakpoints (760/480), float-offset tokens, logical border properties (M-16/M-17/M-25 resolved: `border-inline-end/start` present at lines 1063/1879/1889), popover structure, z-index ladder | Clear (no exclusive finding; popover surface loss reported under UI) |
| Writing | Button labels vs verbs, M-23 error copy ("The file isn't valid JSON. Check the file and try again." DataPortability.tsx:32), placeholders M-21 ("What's this about?" / "Add a note…"), confirm-dialog consequence copy ("Import canvas?", "Delete page?"), help body vs shipped controls | 1 finding (#6) |
| Typography | Type roles (`--text-node`, Sora display on h2/brand, roman headings — no italic headings), tabular-nums (`#zoom-label`:963 ✓, `.dial-legend-val`:1142 ✓), truncation ellipsis in sidebar names | Clear (chip tabular-nums omission folded into #7) |
| Colors | Both token blocks complete (21/21 frozen names each, gate 6 concurred), raw-value scan (only hits outside token blocks: beam trio), chip `color-mix` fills, dark `--faint` raise (#7b869e), one-accent discipline (no `--brand-secondary` visual use) | 1 finding (#5) |
| UI | Blur audit (E2 floats clean; blur only on E3 overlays), motion inventory & easings (no overshoot anywhere; jello gone), icon consistency (single Phosphor voice, aria-hidden coverage), duplicate/dead selectors, elevation tokens, de-sloped widgets (.faq-button solid accent, theme-switch tokens) | Findings #2, #7 |

---

## Findings

Ordered by severity, then reach/leverage. Status column per change-scoped format.

| # | Severity | Domain | Status | Location | Before | After | Why |
|---|---|---|---|---|---|---|---|
| 1 | HIGH | Accessibility | Introduced | `src/app/globals.css:1175` (live), `globals.css:1758` (dormant twin) | n/a — rewritten stylesheet is the delivered artifact | `.dial-mini { animation: heatmap-fade-in .18s ease }` runs a translateY(4px) slide with **no `prefers-reduced-motion: reduce` override**; same for `.node-palette { animation: nodeIn .18s }` (scale+translate; selector currently unmatched — see #2) | Escalation trigger: decorative motion that ignores `prefers-reduced-motion` — HIGH on sight. The rewrite ships a comprehensive guard block (lines 2690–2723 covers node-enter/reveal/beam/dial-seg/modals/empty-card) yet omits the mini-dial entrance, which renders on a routine state (dial minimized; default mode is 'full'/'mini' from persisted settings). Breaches the project's own locked floor, design.md §12 "reduced-motion disables **all** decorative animation". Fix: add both selectors to the §5 reduce block. Opacity-only `fadeIn` overlays correctly remain unguarded. |
| 2 | MEDIUM | UI | Introduced | `src/app/globals.css:1745` styles `.node-palette`; markup uses `.palette-palette` (`src/components/Canvas/Node.tsx:87`) | design-plan D.4 lists `.palette-palette` as a live class ("role=\"menu\" removed; class name unchanged") with styling | Rewritten CSS defines `.node-palette` (+ `.node-card:has(.node-palette)` :1734) which matches **no markup**; the rendered palette container matches **no rule** | The node color popover loses its entire designed presentation: no absolute placement (top/right), no `--panel-bg` surface, no border/shadow/elevation, no z-index — swatch buttons fall into the card's flow instead of floating as an E2 panel. Control remains operable (swatches keep `.palette-swatch` styles, backdrop click-catcher works), so comprehension/consistency harm, not task blockage. Caveat stated honestly: without git history I cannot prove the pre-rewrite stylesheet styled `.palette-palette`; either way the delivered stylesheet fails its own class contract. Fix (one line): rename the selector to `.palette-palette` (and the `:has()` rule), then add it to the reduce guard per #1. |
| 3 | MEDIUM | Accessibility | Introduced | `src/components/Canvas/KnowledgeDialPanel.tsx:96–121` | Outer element was `<div role="button">` containing the hide `<button>` — div permits interactive descendants (valid) | Outer is now a real `<button>` still containing `<button class="heatmap-icon-btn dial-mini-hide">` | **Nested-button concern RESOLVED as confirmed.** `<button>` forbids interactive descendants (HTML content model); the C.6 plan note blesses nesting for event-propagation reasons, but `stopPropagation` already handles double-fire and does not require nesting. Consequences: invalid HTML (validator failure), non-conforming accessibility-tree exposure risk (some AT flatten nested controls), and the exact concern build-shell.md item 2 deferred to this review. Keyboard path survives today (two real tab stops; both named). Fix: make `.dial-mini` a positioned wrapper (span/div) containing the expand button and the hide button as siblings; requires design-plan C.6 amendment by design-lead. |
| 4 | MEDIUM | Accessibility | Introduced | `src/components/Canvas/ThemeToggle.tsx:12` | styled-components toggle (removed this wave) | `aria-label`/`title` sit on the wrapping `<label>`; the labeled `<input type="checkbox">` itself has none | Per the accname spec, a wrapped input takes its name from the label's *subtree text*; an `aria-label` **on the label element** is not subtree text, so conformance-level name computation yields an unnamed switch. Several engines propagate the label's own aria-label as an interop extension, so behavior is browser-dependent rather than absent everywhere — hence MEDIUM here, honestly short of the on-sight HIGH trigger which I could not confirm without AT (**Not verified**, see Verification). The focus ring is fine (`.checkbox:focus-visible~.slider`, instant accent outline). Fix: move `aria-label={label}` onto the `<input>`; keep `title` on the label. |
| 5 | MEDIUM | Colors | Introduced | `src/app/globals.css:372` (`#ffffff` visible gradient stop), `:373`, `:375` (`#fff` mask composites) | n/a — rewritten stylesheet | Border-beam rule uses raw white values outside the token blocks | Violates anti-slop commitment §9 / hallmark "mid-render token improvisation" tell: exactly the "theme token set plus one extra hex tucked into a decoration" pattern. The line-372 stop is a *rendered* highlight (not merely mask alpha, which Guardian gate 9's mask-composite note covered). Single root cause, one rule. Fix: add e.g. `--beam-highlight: var(--on-accent)` (or a literal token entry) to both theme blocks and reference it in all three spots. |
| 6 | LOW | Writing | Introduced | `src/components/Canvas/HelpPanel.tsx:41` (“Drag the <code>⣿</code> handle”), `:93` (“frame icon fits everything on screen”) | Copy matched the old glyphs/icons | This wave replaced ⣿ → `DotsSixVertical` grip and FitScreenIcon → `MagnifyingGlass` (Canvas.tsx:45), leaving stale references | Help copy now describes controls that no longer exist; users scan for a braille glyph / frame icon and find a six-dot grip / magnifier. Recoverable by elimination, so LOW — but it undercuts the very legibility upgrade the wave performed. Also `:85` “– and × buttons” and `:94` “sun/moon button” still read acceptably for Minus/X icons and the switch art. Fix: two wording tweaks while touching the file anyway. |
| 7 | LOW | UI | Introduced | `src/app/globals.css:929+946` (duplicate conflicting `.zb-btn` color: `--ink-2` then overridden `--muted`), `:2559` (dead `.focus-mode .help-trigger` — class deleted from markup; live twin at :2335), `:1075,:1174` (`transition: left` on dial card/mini — violates design.md §7 “animate transform/opacity only”), `:683` (`.empty-card` enters at .4s plain `ease` — over the ≤220ms table and off-token easing), `:316,:439,:880` etc. (off-scale gaps 7px/5px/9px vs §3 scale), `.chip`:614 / `.sidebar-count`:2072 (missing promised `tabular-nums` on numeric chips, design.md §11.6) | Rewrite residue | Multiple small deviations survive the final pass | No single user-visible defect; collectively they erode the locked system's discipline (dead code, self-overriding rules, layout-property animation, off-system durations/spacing, missing tabular figures on count chips). One root cause — incomplete rewrite cleanup — consolidated into one row per the format. |

**Summary: 1 HIGH · 4 MEDIUM · 2 LOW** (cap 15; nothing withheld).

---

## Considered but Rejected

| Location | Candidate | Rejected because |
|---|---|---|
| `src/components/Canvas/DataPortability.tsx:94,:102` | Swap Import→upload-style / Export→download-style icons to match platform convention | The Download-on-import / Upload-on-export mapping predates the change and was prescribed verbatim by plan C.5 and design.md §10 as parity preservation; both directions are defensible for a canvas tool ("into the canvas" vs "out of it"). Swapping would be a fresh design decision outside review scope. |
| `src/components/Canvas/HelpPanel.tsx:32` + `globals.css:1249` | Bump close X to ~20px and delete the now-dead `font-size: 22px` | Hit target is 32×32 (≥24 AA), the 16px icon reads fine at modal scale, and shell-builder already logged the size delta as a follow-up visual note; changing one close button ad hoc would drift from the shared 16px toolbar icon voice. |
| `src/components/Canvas/Node.tsx:91` | Replace the `×` glyph in `.palette-clear` with Phosphor `X` | Plan D.4 explicitly marks `palette-clear` unchanged; it is a typographic symbol inside a labelled control (aria-label wins), consistent with the sanctioned ☰/« exceptions in design-plan §E. Guardian flagged it as legacy, non-blocking. |
| `src/app/globals.css` (multiple) | Mass-convert remaining physical `padding-left/right`, `margin-left:auto` to logical properties | design.md §5 scopes the logical-property commitment to directional **borders** (all now logical); the app ships LTR-only with `lang` unset for RTL, so conversion is churn without user benefit this round. `border-right` on `.resize-grip::before`:2434 is genuinely physical geometry. |
| `src/app/globals.css:1969` | De-italicize `.sidebar-empty` microcopy | Roman-heading rule targets headings/display text; italic muted empty-state hints are a deliberate de-emphasis convention, not an editorial-header tell. |

---

## Pre-existing (not this change's responsibility)

| Severity | Domain | Location | Issue |
|---|---|---|---|
| MEDIUM | Accessibility | `ExportModal.tsx:43–50`, `DataPortability.tsx:116–181`, `Sidebar.tsx:609–677`, `HelpPanel.tsx:11–22` | Modal cluster lacks focus trap/inert background and initial-focus management; the DataPortability confirm/error dialogs have no Escape handler (overlay click only); ExportModal has Escape but neither traps nor restores focus, despite design.md §12 claiming restore for it. M-4 was deferred, never implemented, and no build report declares the drop. Predates this wave (behavior byte-preserved). |
| MEDIUM | Accessibility | `Annotation.tsx:52–53` | Annotation delete affordance is hover-revealed only (`.annotation:hover .ann-delete`) and annotations are pointer-only surfaces — no keyboard path at all; hover-only-affordance anti-pattern. Untouched by this change beyond placeholder copy. |
| MEDIUM | Colors | `globals.css:34` consumed at `:716,:1961,:2074` | Light-mode `--faint` #94a3b8 carries real text (empty-state hint 12px, sidebar section headers 10.5px, page counts) at ≈2.7–2.9:1 against near-white surfaces — fails the 4.5:1 floor. Only the dark value was raised this wave (C-4). Light value and usages predate the change. |

Also carried forward from Guardian G1 notes, outside cap: ThemeManager `×` close glyph remains text (file untouched; future pass candidate).

---

## Verification

**Passed**

1. **Scope integrity (this review):** SHA256 recomputation of all 43 manifest entries vs current tree → 13 changed (table above), 28 unchanged + `[id]` route confirmed unchanged via `-LiteralPath`. No unexpected diff; frozen zones clean.
2. **Guardian gates (cited, not rerun):** shield PASS · `npx tsc --noEmit` exit 0 · `npm run build` compiled 3 routes · `npm test` 5 files / 34 tests passed · frozen-zone hash check PASS · THEME_TOKENS 21/21 in both blocks · slop spot-check PASS (`ux-crew/runs/guardian-G1-1.md`). Gate 8 was conditional and explicitly deferred icon-name judgment to this review — discharged above.
3. **Full manual read (task 1):** every changed TSX read end-to-end. Icon-only buttons carry accessible names: Toolbar (Collapse/Expand dynamic label, Tidy, Undo, Redo), viewbar zoom trio + fit + themes trigger (Canvas.tsx:45), portability pair, faq-button, help-close, dial minimize/hide ×4, mini-dial, StatusBadge (dynamic `${label} status — press to cycle`), Node action quartet + resize grip, Sidebar pin/pencil/trash ×6 with state-matched dynamic pin labels, sidebar toggles ☰/«. Dialog semantics survived: 7 × `role="dialog"` + `aria-modal` + `aria-labelledby` (help, export, import-confirm, import-error, sidebar page/folder confirms, theme manager).
4. **Status ≠ color alone (task 1):** dot + per-status `aria-label` (StatusBadge.tsx:8) + collapsed-summary chips with letter+count text (`chip-${k}` classes replacing inline hex styles, Node.tsx:94) + legend rows with labels/values (KnowledgeDialPanel.tsx:151–160) + save indicator dot+"Saved".
5. **Parity claims (task 1):** store selectors/handlers in every changed file match the builders' parity statements — Canvas gesture/zoom/fit wiring, Node save/cancel/cycle/drag/resize/palette, Annotation drag/save/delete, HelpPanel open/Escape/overlay/focus-restore refs, ExportModal serialize/download/Escape, DataPortability backup-before-replace flow, Sidebar full library action set + DnD types, dial click/dblclick/minimize/hide with stopPropagation intact. OVR-001 verified at tests/undo.test.ts:138–140: message argument removed, assertion semantics identical. GAP/OVR-002 verified: `--wire-color: var(--edge-line)` present in both token blocks (:41,:124); Edges.tsx byte-identical.
6. **Nested-button resolution (task 2):** confirmed invalid nesting exists (Finding #3) — the builder's flagged concern stands; the plan's blessing conflated propagation with validity.
7. **globals.css anti-pattern sweep (task 3):** zero `transition: all`; zero bounce/overshoot easings (`--ease-out` max energy; jello keyframes gone); blur restricted to E3 overlays; `.tooltip`/`.help-trigger` markup gone; purple gradients banished (`.faq-button`/`.brand-logo` solid `var(--accent)`); theme-switch fully tokenized (`--toggle-*`, no local scope); dark-theme parity complete incl. `--danger/--accent-shadow/--radius` overrides (M-18); side-stripe removed (M-15); `--dot-grid` single definition (M-14). Residuals reported as #5/#7.
8. **De-slop read (task 4):** the de-sloped widgets read as intentional design, not leftover AI-slop — solid-accent FAB with instant focus ring and scale(.96) press, token-driven sun/moon switch, lettered chips, silent green save dot, single orchestrated entrances. The remaining tells are the ones itemized in #1/#5/#7, not atmosphere.

**Not verified**

- Runtime/visual inspection (no dev server or browser session in this phase): rendered exposure of the theme-switch accessible name across browser/AT combinations (#4), the visual result of the unstyled palette container (#2), the mini-dial entrance animation as seen by users with reduce-motion enabled (#1), 320px-width and 200%-zoom behavior (inferred from breakpoint CSS only), and rendered contrast pairs (measured from token values, not screenshots).

---

## Verdict

**Block**

One HIGH finding remains (escalation trigger: decorative motion ignoring `prefers-reduced-motion`, breaching the locked design.md §12 floor). Per pipeline, this returns to BUILD (Design Lead, targeted fix): add the two missing selectors to the reduce guard — ideally together with the one-line class-contract repair (#2), the beam token (#5), and the small builder items (#3, #4, #6), after which a focused re-verification suffices; #7 can ride along.
