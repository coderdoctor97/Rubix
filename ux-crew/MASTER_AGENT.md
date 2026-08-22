# SYNAPSE UX CREW — Master Agent Contract

> **Read this file first, every session, before any UX work.**
> This is the coordination contract for the multi-agent UI/UX crew of the Synapse project.
> It tells every agent who exists, who owns what, in what order work flows, and what gates
> block progress. Role details live in each agent's own file under `ux-crew/agents/`.

---

## 0. Authority chain (who wins on conflict)

```
1. SYNAPSE_STRICT_RULES.md      ← binding project law (LOCKED rules, placement map, validation)
2. AGENTS.md (root shield)       ← auto-loaded summary of the same law
3. ux-crew/MASTER_AGENT.md       ← this file (coordination law)
4. ux-crew/agents/<role>.AGENT.md ← role law
5. skills/skills/*/SKILL.md      ← design craft law (how to do good UI)
```

A lower file never overrides a higher one. If a human request conflicts with a LOCKED rule,
**STOP** and ask for `OVERRIDE: <reason>` per `SYNAPSE_STRICT_RULES.md §11`. Never improvise.

## 1. Mission

Keep Synapse's UI **made, not generated**: a distinctive, accessible, polished interface with a
real design statement — zero functional change, zero data-model change, zero backend. The crew
exists to make UI improvements continuously and safely: agents audit, one locked design system
is maintained, parallel builders implement against it, an independent guardian verifies, and a
consolidated review decides ship/no-ship.

**Hard scope rule:** UI/UX only. New *features* are out of scope unless the human explicitly
requests them. "Functionality wise no change" is the default standing order.

## 2. Crew roster

| Agent | File | One-line job | Writes |
|---|---|---|---|
| **Master** (orchestrator) | this file | Sequences phases, enforces gates, resolves conflicts | nothing (or `ux-crew/runs/` notes) |
| **Skill Scout** | `agents/skill-scout.AGENT.md` | Fetches/installs external skills, routes them to the right agents | `skills/skills/<name>/`, `ux-crew/skill-registry.json` |
| **Auditor** | `agents/auditor.AGENT.md` | Read-only slop + craft audit; produces the ranked punch list | `ux-crew/runs/audit-*.md` |
| **Design Lead** | `agents/design-lead.AGENT.md` | Owns the locked design system (`design.md`) and `globals.css` | `design.md`, `src/app/globals.css`, `ux-crew/runs/design-*.md` |
| **Canvas Builder** | `agents/impl-canvas.AGENT.md` | Implements the glow-up for canvas core components | `src/components/Canvas/{Canvas,Node,Edges,Annotation,SelectionHint}.tsx` |
| **Shell Builder** | `agents/impl-shell.AGENT.md` | Implements the glow-up for chrome: toolbar, sidebar, panels, modals, ui primitives | rest of `src/components/**`, `src/app/**` (markup/classes only) |
| **Guardian** | `agents/guardian.AGENT.md` | Independent verification: LOCKED rules, parity baseline, build/test/shield gates | `ux-crew/baseline.json`, `ux-crew/runs/guardian-*.md` |

Nobody else writes code. Nobody edits a file they do not own. Ownership conflicts go to the Master.

## 3. Pipeline (the only legal work order)

```
Phase S  SCOUT     Skill Scout installs/updates skills → skill-registry.json        [rare]
Phase A  AUDIT     Auditor(s) produce ranked punch lists (READ-ONLY)                [parallel ok]
Phase D  DESIGN    Design Lead writes/amends design.md + class contract             [single]
Phase G0 GUARDIAN  Guardian snapshots the parity baseline (before any edit)         [single]
Phase B  BUILD     Canvas Builder ∥ Shell Builder implement against design.md       [parallel]
Phase G1 VERIFY    Guardian runs all gates; failures → targeted fix round           [loop ≤3]
Phase R  REVIEW    Consolidated better-interface review → verdict                   [single]
                   Block → back to B/D with the findings. Approve → done.
```

Rules between phases:

- **A never edits.** Audit output is evidence with `path:line` citations, not patches.
- **D before B, always.** Builders refuse to start without `design.md` at the repo root.
- **G0 before B, always.** No protected file may be modified before the baseline snapshot exists.
- **B agents run in parallel but on disjoint file sets** (§4). Cross-cutting needs go through the
  class contract in `design.md`; if something is missing from the contract, the builder adds it to
  its report's "CSS requests" section instead of editing `globals.css` itself.
- **G1 is the only phase allowed to declare a task done**, and only when every gate in
  `agents/guardian.AGENT.md` passes.
- **R uses the consolidated format of `better-interface`** (skills/skills/better-interface/SKILL.md).
  `interface-review` is user-invoked only — the crew MUST NOT auto-invoke it
  (SYNAPSE_STRICT_RULES.md §7).

## 4. File ownership matrix (hard walls)

| Zone | Owner | Everyone else |
|---|---|---|
| `design.md`, `src/app/globals.css` | Design Lead | read-only |
| `src/components/Canvas/Canvas.tsx`, `Node.tsx`, `Edges.tsx`, `Annotation.tsx`, `SelectionHint.tsx` | Canvas Builder | read-only |
| `src/components/Canvas/{Toolbar,ThemeToggle,ThemeManager,HelpPanel,ExportModal,DataPortability,KnowledgeDialPanel}.tsx`, `src/components/Sidebar/**`, `src/components/ui/**`, `src/app/**/*.tsx` | Shell Builder | read-only |
| `src/lib/**`, `tests/**`, `package.json`, lockfiles, `tsconfig.json`, `next.config.*`, `scripts/**` | **NOBODY** | frozen |
| `skills/**` | Skill Scout (install) / skill authors | read-only |
| `ux-crew/**` | Master + the agent's own reports | read-only |

Frozen means: no create, no edit, no delete, no reorder. If a change seems to require a frozen
file, the task is out of scope — escalate to the human with the LOCKED rule that proves it.

**Frozen token-name API.** The CSS custom properties listed in `src/lib/types.ts`
(`THEME_TOKENS`: `--bg`, `--surface`, `--ink`, `--accent`, …) are written by name by the
custom-theme engine and persistence layer. Their **names must never be renamed or removed**;
values may be retuned and new tokens may be added alongside.

## 5. Handoff contracts

| From → To | Artifact | Must contain |
|---|---|---|
| Scout → all | `ux-crew/skill-registry.json` | installed skills, paths, what each is for, which roles must load them |
| Auditor → Design Lead | `ux-crew/runs/audit-<domain>.md` | ranked findings, severity, `path:line`, current code excerpt, proposed direction |
| Design Lead → Builders | `design.md` + `ux-crew/runs/design-plan.md` | locked tokens/type/motion/voice + **per-file change plan + class contract** (every new/changed class name) |
| Builders → Guardian | `ux-crew/runs/build-<area>.md` | files touched, what changed, CSS requests, self-check results |
| Guardian → Master | `ux-crew/runs/guardian-<n>.md` | gate-by-gate pass/fail with exact commands + observed output |
| Reviewer → Master | `ux-crew/runs/review-final.md` | better-interface consolidated report + verdict (`Block` / `Needs changes` / `Approve`) |

## 6. Standing quality floor (every phase, every agent)

1. Load your role file AND the skill files it names before working. A UI change made without the
   skills collection is a violation (SYNAPSE_STRICT_RULES.md §7).
2. Plain CSS in `src/app/globals.css` only. No Tailwind, no CSS-in-JS, no styling libraries.
3. Every color/font value flows through a named token. No inline hex/oklch/rgb in TSX, no raw
   values outside token blocks in CSS (hallmark gate 48 discipline).
4. Accessibility is not optional: visible `:focus-visible` rings, keyboard reachability, aria-labels
   on icon-only controls, contrast ≥ 4.5:1 for body text, `prefers-reduced-motion` respected,
   usable at 320 px width and 200 % zoom.
5. Both themes (`light`, `dark`) must stay coherent after every change.
6. Animate `transform`/`opacity` only; focus rings appear instantly; no bounce easings on UI state.
7. When you finish, leave the working tree uncommitted. Git is human-only (STRICT_RULES §0).

## 7. Re-running / resuming this system

Any future session (human or agent) can rerun the crew:

1. Read this file. Check `ux-crew/skill-registry.json` for available skills.
2. Start at Phase A if the UI drifted; at Phase D if `design.md` needs amending; at Phase B only if
   `design.md` is current and `ux-crew/baseline.json` was snapshotted after the last code change.
3. Orchestration can be executed by the harness workflow tool, plain subagents, or by humans
   following the phases manually — the contracts above are orchestration-independent.
4. After any code change by non-guardian hands, G0 must re-snapshot before the next BUILD.
