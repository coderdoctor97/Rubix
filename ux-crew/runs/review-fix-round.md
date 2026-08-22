# Review Fix Round — round 1 findings resolved · 2026-08-22

Trigger: Phase R round 1 Block verdict (ux-crew/runs/review-final.md).
Owner: Master acting as design-lead (globals.css) + shell-builder (TSX fixes).
Pipeline: Block → routed fix cycle → Guardian re-run → re-review round 2.

## Fixes applied

| # | Severity | Owner | File | Change |
|---|---|---|---|---|
| 1 | HIGH | design-lead | src/app/globals.css | Added `.dial-mini` and `.palette-palette` `animation:none` to the global `@media (prefers-reduced-motion: reduce)` guard block (now at line 2702-2708). Closes design.md §12 floor gap. |
| 2 | MEDIUM | design-lead | src/app/globals.css | Renamed `.node-palette` → `.palette-palette` across all selectors including `:has()` and responsive `@480` override. CSS now matches Node.tsx:87 class exactly. |
| 3 | MEDIUM | shell-builder | src/components/Canvas/KnowledgeDialPanel.tsx | Converted nested-button structure: outer wrapper is now `<div class="dial-mini">` containing `.dial-mini-expand` button (svg + aria-labels) and `.dial-mini-hide` as sibling buttons. Two tab stops preserved. stopPropagation intact. |
| 4 | MEDIUM | shell-builder | src/components/Canvas/ThemeToggle.tsx | Moved `aria-label={label}` from `<label>` onto the `<input type="checkbox">`. Label retains `title={label}` only. |
| 5 | MEDIUM | design-lead | src/app/globals.css | Added `--beam-highlight: var(--on-accent);` token in both `:root` and `[data-theme="dark"]`. Replaced three literal `#ffffff` occurrences (gradient stop + two mask-line pairs) with `var(--beam-highlight)`. |
| 6 | LOW | shell-builder | src/components/Canvas/HelpPanel.tsx | Updated stale copy: "Drag the ⣿ handle" → "Drag the six-dot grip handle"; "frame icon fits everything" → "magnifier icon fits everything". |
| 7a | LOW | design-lead | src/app/globals.css | Deduped `.zb-btn`: single block `color: var(--muted)` at rest; hover sets `color: var(--ink-2)`. Removed duplicate override block. |
| 7b | LOW | design-lead | src/app/globals.css | Removed dead `.canvas-layout.focus-mode .help-trigger` rule (markup no longer exists). |
| 7c | LOW | design-lead | src/app/globals.css | Removed `transition: left` from `.dial-card` and `.dial-mini`. |
| 7d | LOW | design-lead | src/app/globals.css | Changed `.empty-card` animation from `nodeIn 0.4s ease` → `nodeIn 0.22s var(--ease-out)`. |
| 7e | LOW | design-lead | src/app/globals.css | Added `font-variant-numeric: tabular-nums;` to `.chip` and `.sidebar-count`. |

Deferred from #7 (not blockers per round 1): off-scale gaps (7px/5px/9px) — acknowledged, documented as future pass candidate.

## Validation

| Gate | Command | Result |
|---|---|---|
| tsc | `npx tsc --noEmit` | exit 0 |
| build | `npm run build` | 3 routes compiled, no errors |
| tests | `npm test` | 5 files / 34 tests passed |
| formatting | `npx vitest run tests/formatting.test.ts` | 7/7 passed (batch run had collection quirk; isolated run clean) |

## Next step

Phase R round 2 re-review launched (subagent 162b020a) — focused verification of all 7 findings.
