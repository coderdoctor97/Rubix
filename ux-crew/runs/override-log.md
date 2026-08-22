# UX Crew Override Log

## OVR-001 · 2026-08-22 · tests/undo.test.ts (frozen zone)

- **Rule:** SYNAPSE_STRICT_RULES.md §9 / crew law — `tests/**` frozen; MUST NOT weaken existing tests.
- **Condition:** Pre-existing TS error at line 138 (`expect(...).toBeGreaterThan(0, 'msg')`). Vitest
  accepts an extra message argument at runtime; TypeScript does not. Because `tsconfig.json`
  includes `**/*.ts`, this blocked `npm run build` entirely — hash-verified unchanged since the
  Guardian's pre-change baseline, i.e. NOT introduced by the crew.
- **Change:** Removed only the assertion-message argument; added a comment. Assertion semantics
  identical; no test weakened or deleted.
- **Approval:** Explicit user approval via interactive question ("Approve minimal fix"), this session.

## GAP-002 · 2026-08-22 · src/app/globals.css (contract gap, not an override)

- **Finding (canvas builder escalation):** the Design Lead's rewrite dropped `--wire-color`,
  which `Edges.tsx` consumes (`var(--wire-color)`) for neutral connectors → strokes unresolved.
- **Resolution (Design Lead's preferred option):** `--wire-color: var(--edge-line);` added to
  both `:root` and `[data-theme="dark"]` token blocks.
- **Applied by:** Master (acting Design Lead, single-line token addition; no other agent's file touched).

