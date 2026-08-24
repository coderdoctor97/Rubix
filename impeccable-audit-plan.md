# SYNAPSE — Impeccable Whole-Product Audit & Command Plan

> `⚠️ DEGRADED: single-context (no sub-agent/Task tool exposed in this session).`
> Authority: official **Impeccable** skill (github.com/pbakaus/impeccable, Apache-2.0), loaded and read —
> `audit` (5 technical dims /20), `critique` (Nielsen 10 /40 + design-specificity + personas), and the
> command references (colorize/typeset/layout/bolder/quieter/distill/clarify/adapt/polish).
> Evidence: Impeccable bundled `detect.mjs` run on `src/` + shipped `globals.css` metrics + full codebase review.
> **Status: PLAN ONLY — nothing implemented until you approve the command sequence.**

---

## Audit Health Score (technical) — **15/20 · Good**

| # | Dimension | Score | Key finding |
|---|-----------|-------|-------------|
| 1 | Accessibility | 3 | focus rings + aria-labels solid; canvas is pointer-heavy (limited keyboard node manipulation); `--faint` on some surfaces borderline for 4.5:1 |
| 2 | Performance | 3 | transform/opacity motion, reduced-motion honored; **6 backdrop-filters**, **42 box-shadow decls**, feTurbulence per-node grain (cached) — fine now, cost risk on very large canvases |
| 3 | Responsive | 2 | breakpoints + 40px touch targets exist, but **phone = compacted desktop**, not an intentional touch version |
| 4 | Theming | 4 | full OKLCH token system, dark mode, **0 inline color literals** — excellent |
| 5 | Implementation Integrity | 3 | coherent Hallmark system, role+style+material architecture; **19 distinct border-radius values** = component-assembly drift |

## Design Critique Score (Nielsen, Operate mode) — **29/40 · Good**

| Heuristic | Sc | Note |
|---|---|---|
| 1 Visibility of status | 3 | save indicator, selection hint, just-created animation |
| 2 Match real world | 3 | sticky/paper/"knowledge object" metaphors land |
| 3 User control | 3 | undo/redo, Esc, delete confirmations |
| 4 Consistency | 3 | one token system, but radius/icon-size/shadow rhythm wanders |
| 5 Error prevention | 3 | confirms on destructive, autosave |
| 6 Recognition over recall | 3 | icons + labels; a few icon-only affordances rely on title |
| 7 Flexibility/efficiency | 3 | status 1/2/3, ⌘Z/⌘B/I/U, rich shortcuts |
| 8 Aesthetic/minimalist | 2 | **floating-chrome clutter** competes with the canvas |
| 9 Error recovery | 3 | undo + confirmations |
| 10 Help/docs | 3 | help FAB + panel, contextual |

**Design-specificity verdict:** Partly authored. The node objects + warm amber material + Excalifont-in-nodes are genuinely Synapse. But the **chrome around them — the floating toolbar cluster, the file-tree sidebar, the radius/shadow rhythm, the phone layout — is category-interchangeable**; you could drop it onto any canvas SaaS unchanged. That gap is where the "AI-generated" feeling lives.

---

## A. Current design score: **7 / 10**
A strong, distinctive *core* (objects, material, dual typography) wrapped in *generic product chrome*. A focused Impeccable pass targets 8.5–9.

## B. Strongest existing elements — DO NOT BREAK
- The **5 object-form node styles** (distinct silhouettes; grayscale-distinguishable).
- **Warm amber OKLCH system + material tint ladder** (marking = same family as material).
- **Excalifont-in-nodes vs premium UI typography** — the dual-world concept.
- **Role hierarchy** (Main>Child>Descendant via elevation + size).
- **Token discipline** (0 inline literals), **persistence/undo/redo**, **rich-text editing**, **connections/selection/shortcuts**.

## C. AI-SLOP register

| # | Issue | Sev | Evidence | Why it reads AI-generated | → Command |
|---|---|---|---|---|---|
| 1 | **Radius rhythm drift** | P1 | 19 distinct `border-radius` values (6/8/9/10/12/14/16/18/20/999…) | "Assembled from a component library," not one disciplined scale | `layout` |
| 2 | **Floating-chrome clutter** | P1 | toolbar cluster + viewbar + KnowledgeDial + FAB + selection-hint + focus-pill all float at ~E5 | "Floating cards everywhere," canvas competes with chrome | `distill` |
| 3 | **Generic toolbar** | P1 | `tb-cluster`: brand square + New topic + Text/Heading + collapse + tidy + undo/redo in one pill | "Generic SaaS floating toolbar"; no Synapse signature | `bolder` + `clarify` |
| 4 | **Phone = compacted desktop** | P1 | no bottom action bar / drawer; toolbar just shrinks | "Desktop shrunk for mobile," not touch-first | `adapt` |
| 5 | **Shadow noise** | P2 | 42 box-shadow declarations across xs/sm/md/lg/xl + warm + accent variants | too many competing elevations; inconsistent depth | `layout`/`polish` |
| 6 | **Color fingerprint could be stronger** | P2 | amber is distinctive vs indigo but reads "warm-productivity-generic" (Notion-adjacent) | not unmistakably Synapse yet | `colorize` (restrained) |
| 7 | **Sidebar = file tree** | P2 | Library/Folders/Quick Notes, standard rows | "Generic dashboard sidebar" | `bolder` (signature) or accept |
| 8 | **Icon-size sprawl** | P2 | sizes 13/14/15/16/18/20/22/24 | inconsistent stroke rhythm | `polish` |
| 9 | **Status understated** | P2 | tiny dots + only-collapsed chips | weak status communication | `clarify`/`bolder` |
| 10 | **Excalifont sizing** | P2 | hand-drawn at 15px/1.6 may read slightly tight | concept strong, readability needs a nudge | `typeset` |
| 11 | **Generic copy** | P3 | "ACTIVE RECALL CANVAS" sub-brand, "CREATE A CANVAS" empty state | marketing-template voice | `clarify` |

*(Detector also flagged 2 minor `layout-transition` warnings — animating `width` on `.tb-sep` hover + edges — P3 perf.)*

No **P0** (nothing blocks core tasks; data/persistence/a11y baseline all hold). The work is quality/identity, not breakage.

## D. Command mapping (evidence → command → target → improvement)

| Command | Target | Improvement |
|---|---|---|
| `/impeccable layout` | globals.css radius + spacing + shadow scale | collapse 19 radius values to a **4-step scale** (sm/md/lg/full); consolidate shadows to the E0–E5 tiers; tighten spacing rhythm |
| `/impeccable distill` | floating chrome (KnowledgeDial, redundant panels, badges) | remove/merge floating surfaces so the canvas leads; cut decorative stats |
| `/impeccable bolder` | toolbar, sidebar, main-node, selection | give chrome a **Synapse signature** (not louder — more distinctive); stronger main-node authority |
| `/impeccable colorize` | canvas/anchor/material | refine the fingerprint (e.g., deepen canvas, sharpen anchor) — **no rainbow**, warm system preserved |
| `/impeccable typeset` | node text (Excalifont) + metadata | nudge Excalifont size/leading for readability; confirm UI/node contrast is intentional |
| `/impeccable clarify` | toolbar labels, empty state, status names, sub-brand | concise, non-marketing copy; clearer status |
| `/impeccable adapt` | 375/430/768/820/1024/1280/1440 | make **phone touch-first** (bottom bar + drawer), tablet canvas-first |
| `/impeccable polish` | icon sizes, alignment, shadow tuning, micro-states | final consistency pass — last, no redesign |

## E. Proposed execution order (evidence-driven, not a command dump)

1. **`layout`** — fix the radius/spacing/shadow rhythm first (it's the structural "assembly" tell; everything else reads cleaner after).
2. **`distill`** — cut floating clutter + redundant chrome so the canvas leads.
3. **`bolder`** — give toolbar/sidebar/main-node a distinctive Synapse signature (now that noise is gone).
4. **`colorize`** — refine the warm fingerprint (subtle, restrained).
5. **`typeset`** — Excalifont readability nudge + metadata rhythm.
6. **`clarify`** — copy/labels/empty-state/status.
7. **`adapt`** — phone touch-first + tablet/desktop intentional.
8. **`polish`** — final: icon-size scale, alignment, shadow tuning, micro-states.
9. **re-`audit` + re-`critique`** — confirm scores climb (target audit ≥17/20, critique ≥33/40).

## F. Files likely to change
- `src/app/globals.css` (primary — radius scale, shadow tiers, spacing, toolbar/sidebar/main-node rules, copy styling).
- `src/components/Canvas/Toolbar.tsx` (signature/grouping), `Sidebar.tsx` (signature), `Canvas.tsx` (floating-chrome composition, phone layers).
- `KnowledgeDialPanel.tsx` (distill), `SelectionHint.tsx`/`FocusExit` (distill).
- `Node.tsx` (main-node authority, status clarity), `Empty state` copy.
- A new **mobile bottom action bar / overflow** (adapt) — presentational only.
- `design.md` amended to match. **No data model / persistence / behavior changes.**

## G. Risk assessment — must not disturb
Role system, style system, material surfaces, amber identity, Excalifont node text, persistence, node editing (Tiptap), movement, connections, selection, keyboard shortcuts, import/export, responsive architecture, the paper texture. Each command runs **CSS/presentational-first**, gated by tsc/tests/build/runtime after every step. Anything already strong (§B) is preserved.

## H. Final visual direction
Synapse becomes **a tactile knowledge workshop with an unmistakable signature**: one disciplined radius/shadow/spacing scale; chrome that **recedes** so the hand-drawn knowledge objects lead; a toolbar/sidebar that feel *tooled for Synapse*, not borrowed; a warm amber fingerprint deep enough to be recognizable in a screenshot; phone that is genuinely touch-first; and metadata/copy that sound like a calm product, not a template. Distinctive, not louder. Material, not decorated.

---

## I need from you before implementing
1. **Approve the command sequence (E)** — or reorder (e.g., `bolder` before `distill`?).
2. **Scope:** all 8 commands, or a subset first (e.g., layout + distill + polish as a "tighten" pass)?
3. **`colorize` appetite:** keep the current amber (just deepen/sharpen) or open to a refined warm hue shift?
4. **Phone `adapt`:** green-light a real **bottom action bar + drawer** (presentational TSX), or keep phone compacted?
5. Anything in §B you want explicitly fenced off beyond what's listed?

On approval I execute the sequence one command at a time, validate (tsc/tests/build/runtime) after each, and re-audit at the end.
