# Guardian G1 — Verification Report (round 1) · 2026-08-22

Scope: full working tree vs `ux-crew/baseline.json` (snapshot taken before any crew edit).

| # | Gate | Method / Command | Observed | Result |
|---|---|---|---|---|
| 1 | Shield | `node scripts/guardian.mjs` | "✅ Guardian PASSED — session constitution obeyed" | PASS |
| 2 | Types | `npx tsc --noEmit` | exit 0, zero errors | PASS |
| 3 | Build | `npm run build` (escalated: sandbox denies process spawn EPERM −4048) | Compiled; 3 routes emitted; no type/lint errors | PASS |
| 4 | Unit tests | `npm test` (escalated: same spawn denial for vitest workers) | **5 files / 34 tests passed**, 0 failed | PASS |
| 5 | Frozen zones | SHA256 re-hash of baseline manifest | Only crew-owned files differ: Canvas.tsx, Node.tsx, Annotation.tsx, DataPortability.tsx, ExportModal.tsx, ThemeToggle.tsx, Toolbar.tsx, HelpPanel.tsx, KnowledgeDialPanel.tsx, Sidebar.tsx, StatusBadge.tsx, globals.css (+ tests/undo.test.ts under approved OVR-001). `src/lib/**`, `scripts/**`, `package.json`, configs byte-identical | PASS |
| 6 | Token API | All 21 THEME_TOKENS names grepped in globals.css | 21/21 defined in both `:root` and `[data-theme="dark"]` | PASS |
| 7 | Token discipline | Raw color scan: TSX = only token-documenting comments; CSS outside token blocks = none (`--toggle-*` raw values live inside token blocks, consumed via var()) | Clean | PASS |
| 8 | A11y floor | focus-visible rules present · 4 reduced-motion blocks · 7 role="dialog" + 7 aria-modal · crude aria-label grep flagged 31 raw matches (multiline/text-button artifacts; samples inspected carry aria-labels) — deferred to Phase R reviewer for judgment | Conditional pass | PASS* |
| 9 | Slop spot-check | linear-gradient ×2 = white mask composites (not color gradients) · transition:all = 0 · no emoji UI icons except flagged legacy glyphs in ThemeManager close (×) and palette-clear swatch (×, typographic symbol) · z-index ≥3-digit ×6 (drag layer 999 legacy) — noted, non-blocking | Clean enough for review | PASS |

Notes for Phase R reviewer:
- Verify icon-only buttons carry accessible names across all changed TSX (manual read, not grep).
- Check KnowledgeDialPanel mini-donut conversion for nested interactive elements (builder noted a "nested-button" concern in ux-crew/runs/build-shell.md).
- ThemeManager.tsx received NO plan section and was left untouched (× close glyph remains) — future pass candidate, not this change's regression.

## VERDICT: PASS
