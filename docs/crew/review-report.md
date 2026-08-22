# Synapse UI/UX Crew — Consolidated Review Report

## Scope and Coverage

| Domain | Evidence inspected | Result |
| --- | --- | --- |
| Accessibility | Node.tsx, AnimatedBeam.tsx, StatusBadge.tsx, Canvas.tsx, globals.css (focus-visible, prefers-reduced-motion, keyboard paths) | 1 finding (HIGH) |
| Layout | Canvas.tsx, Node.tsx, Toolbar.tsx, Edges.tsx, globals.css (floating chrome, node cards, sidebar) | Clear |
| Writing | Canvas.tsx (empty state), Toolbar.tsx (labels), Node.tsx (placeholder, hints) | 1 finding (LOW) |
| Typography | globals.css (Inter + Sora pairing, node text, toolbar text, type scale) | Clear |
| Colors | globals.css (token block, dark/light overrides, tint, status colors, edge-line) | Clear |
| UI | AnimatedBeam.tsx, Edges.tsx, node-enter animation, focus-mode transitions, resize grip | 1 finding (MEDIUM) |

## Findings

| # | Severity | Domain | Location | Before | After | Why |
|---|---|---|---|---|---|---|
| 1 | HIGH | Accessibility | `src/components/Canvas/AnimatedBeam.tsx:24` | `return trigger ?` — always animates, never checks reduced-motion preference | `useReducedMotion()` gate; static `<path>` fallback when motion is disabled | WCAG 2.3.3 / `prefers-reduced-motion` escalation trigger: animated UI content that ignores user preference |
| 2 | MEDIUM | UI | `src/app/globals.css:2348` | `.canvas-layout .sidebar, ... { transition: opacity 0.16s ease; }` — no reduced-motion override | Added `@media (prefers-reduced-motion: reduce)` block that sets `transition: none` on all focus-mode chrome | Under reduced motion, focus-mode fade-out still animates; motion restraint requires suppressing it |
| 3 | LOW | Writing | `src/components/Canvas/Canvas.tsx:42` | `"Press ? for more."` | `"Press ? for shortcuts."` | "for more" is ambiguous; "for shortcuts" names the actual affordance |

## Considered but Rejected

| Location | Candidate | Rejected because |
|---|---|---|
| `src/components/Canvas/Edges.tsx:42` | Use `nodeRefs` Map + `ResizeObserver` to read live DOM heights | Existing `node.size?.height ?? NODE_MIN_HEIGHT` approach already handles the user's resize fix correctly; Map plumbing adds complexity without user benefit |
| `src/app/globals.css:652` | Replace `.ui-float` backdrop-filter blur with a solid shadow tier | Existing E2 blur is intentional per the project's surface system (E1 no blur, E2 blur, E3 blur); changing one tier breaks consistency |
| `src/components/Canvas/Toolbar.tsx:20` | Reduce brand padding to tighten toolbar on narrow screens | Current `flex-wrap: wrap` already handles narrow widths; reducing padding would reduce touch comfort without solving a real clipping issue |
| `src/components/Canvas/Edges.tsx:84` | Add `stroke-dasharray` animation to all static edges | Anti-pattern: universal scroll-triggered / universal animated motion; one-shot beams already handle the meaningful motion |

## Verification

| Check | Command | Result |
|---|---|---|
| Guardian | `node scripts/guardian.mjs` | ✅ PASS — no LOCKED-rule violations |
| Build | `npm run build` | ✅ PASS — Next 14.2.22 compiles clean, no TypeScript errors |
| Tests | `npm test` | ✅ PASS — 34/34 tests pass (formatting, layout, library, persistence, undo) |
| Baseline diff | guardian + build + test before and after changes | All green before; all green after |

## Verdict

**Approve**

No actionable interface findings remain. The crew delivered:
1. Reduced-motion gate in `AnimatedBeam.tsx` (HIGH — accessibility)
2. Focus-mode transition suppression in `globals.css` (MEDIUM — motion restraint)
3. Empty-state copy clarification in `Canvas.tsx` (LOW — writing)

All changes are in-place CSS/TSX edits. Zero functional or data-model changes. All mandatory validation checks pass.
