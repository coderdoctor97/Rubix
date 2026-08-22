# Synapse UI/UX Crew — Coordinator

> Self-sustaining multi-agent crew for visual quality. No functional or data-model changes.

## Mission

Deliver a complete visual glow-up of Synapse (the active-recall canvas) by applying the
installed `skills/` collection strictly inside the existing styling system
(`src/app/globals.css` plain CSS + `src/components/Canvas/*.tsx`). Zero functional or
data-model changes.

## Crew roster

| Agent | Role | Skills invoked |
|---|---|---|
| `hallmark-scout` | Anti-AI-slop audit against the `hallmark` reference corpus | `hallmark` |
| `interface-reviewer` | Full cross-discipline interface review, findings consolidated | `better-interface` → routes to every `better-*` skill |
| `implementer` | CSS / component polish pass; fixes only | `better-ui`, `better-typography`, `better-colors`, `better-layout` |
| `validator` | Runs the mandatory three checks; reports pass/fail per check | guardian, build, test |

## Execution protocol

### Phase 0 — Load the anti-slop baseline

1. `hallmark-scout` reads `skills/skills/hallmark/SKILL.md` and
   `skills/skills/hallmark/references/anti-patterns.md`.
2. Scores the current interface against every gate.
3. Emits `docs/crew/hallmark-report.md` — ranked punch list only, no edits.

### Phase 1 — Cross-discipline review

1. `interface-reviewer` loads `skills/skills/better-interface/SKILL.md`.
2. Routes to each domain skill in order:
   `better-accessibility` → `better-layout` → `better-writing` →
   `better-typography` → `better-colors` → `better-ui`.
3. Each domain skill produces findings against `src/app/globals.css` and the
   `src/components/Canvas/*.tsx` surface.
4. Consolidates into `docs/crew/review-report.md` using the `better-interface`
   findings table format (severity, domain, location, before, after, why).

### Phase 2 — Implement

`implementer` takes the union of Phase 0 + Phase 1 findings, ordered HIGH → MEDIUM → LOW.

Rules:
- Changes are **plain CSS edits** in `src/app/globals.css` and **in-place TSX edits**
  in `src/components/Canvas/*.tsx`.
- No new dependencies. No `src/app/api/`. No data-model changes.
- Every color / font value must reference a **named CSS token** (existing `--*` token or
  a new token added to `:root`).
- Every fix must cite the exact file and line.

After implementation: re-runs Phase 1 (same command, same scope) and records the
updated `docs/crew/review-report.md`.

### Phase 3 — Validate

`validator` runs all three mandatory checks:

```
node scripts/guardian.mjs
npm run build
npm test
```

Reports per-check status. If any check fails, returns findings to `implementer`
with the failure detail. Repeats until all three are green.

## Decision rights

| Decision | Owner |
|---|---|
| Scope expansion (outside Canvas chrome + globals.css) | Requires explicit user `OVERRIDE:` |
| Token rename / removal | Blocked — see `globals.css` §1 frozen names |
| Component rewrite | Blocked — in-place edits only |
| New dependency | Blocked — no `npm install` unless override |

## Artifacts

All crew artifacts live under `docs/crew/`:

```
docs/crew/
  README.md              ← this file
  hallmark-report.md     ← Phase 0 output
  review-report.md       ← Phase 1 + Phase 2 re-review output
  validator-log.txt      ← Phase 3 raw output
```
