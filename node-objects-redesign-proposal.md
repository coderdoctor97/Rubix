# SYNAPSE — Node Object Redesign Proposal (5 distinct knowledge objects)

> **Status: DRAFT — awaiting approval. Nothing implemented.**
> Supersedes the style section of `design-v2-proposal.md`. Keeps the existing
> content model (one string per node) and the Role×Style architecture.

---

## The one rule that governs this entire proposal

> **If all five styles are rendered in the exact same grey, you must still see
> five different kinds of objects.** Color only reinforces — it never creates —
> the distinction.

Every decision below is justified first by **silhouette, structure, border,
shadow, spacing, typography, and accent placement**. Color comes last.

---

## A. Research findings & extracted principles

| Source | What it teaches Synapse |
|---|---|
| **NN/G — Cards component** [5](https://www.nngroup.com/articles/cards-component/) | "Common regions": a border + canvas-contrasting bg groups content. Shadow = clickability signifier. Differentiate object-from-canvas via **border, shadow, OR contrasting bg** — and different object *types* can pick different ones. |
| **Eight Shapes — Cards & Composability** [3](https://medium.com/eightshapes-llp/cards-and-composability-in-design-systems-8845ecbee50e) | A card system's identity is set by **border-radius + shadow + background contrast**. Distinguish *types* via shape/layering, not just hue. |
| **stan.vision — Card UI** [4](https://www.stan.vision/journal/ui-card-design-examples-best-practices-and-common-patterns) | Material's 3 approaches: **elevated (shadow) / filled (contrasting surface) / outlined (border)**. Pick a primary approach per object type. |
| **FigJam stickies** [1](https://help.figma.com/hc/en-us/articles/1500004414322-Sticky-notes-in-FigJam) | Stickies are a *different object*: square/index-card proportions, grow vertically with text. FigJam does **not** rotate them. |
| **Miro sticky refresh** [3](https://community.miro.com/ask-the-community-45/what-happened-to-sticky-notes-is-there-a-way-to-change-them-back-20657) | "Lifted" feel comes from **edge shading near corners + soft, slightly varied offset shadow** — not heavy shadows (users rejected those for a11y). |
| **Heptabase / Capacities** [2](https://storyflow.so/blog/best-obsidian-alternatives-2026) | The **card is the unit of thought**; typed objects carry their own structure. Object *type* should drive internal structure. |
| **Soft-UI a11y trap** [1](https://tailwindthememaker.com/articles/soft-ui-neumorphism-accessibility) | **Never rely on shadow alone** for a boundary — pair with text weight/icon/contrast. (Direct constraint on **Minimal**.) |

**Synthesized principles applied here:**
1. Each style chooses a *different* Material approach (Classic=outlined, Sticky=shadow-lifted, Paper=ruled+rail, Highlight=marker, Minimal=tick/text).
2. **Proportion** differs per type (squarer sticky, taller paper, low minimal).
3. **Shadow behavior** differs per type (symmetric / offset-lifted / page-drop / elevated / none).
4. **Accent placement** differs per type (top bar / tape / left rail / left marker / leading tick).
5. **Internal structure** differs (title+body / single block / header rule+body / bold-underlined / flat text).
6. All cues are **CSS-only on existing DOM** (no content-model change), restrained — no skeuomorphism, fake grain, or heavy shadows.

---

## B. Design authority (skill) used

This sandbox exposes **no skill-registry tool**, so I cannot enumerate installed skills (same caveat as prior phases). I am keeping **Material Design 3 as the system authority** (color roles, elevation, shape tokens) and, for *object-type differentiation specifically*, applying **NNGroup's card principles** + **Eight Shapes' composability** + the **canvas-product research above** (FigJam/Miro/Heptabase/Capacities). These are the strongest, most-cited authorities for "differentiate object types without color." Icon family stays **Phosphor** (already chosen, already a dependency).

---

## C. Five-style redesign (full spec)

Legend for "grayscale cue" = the structural feature that identifies the object *without color*.

### C.1 CLASSIC — structured knowledge card (the default object)
| Property | Value |
|---|---|
| Shape | balanced rectangle (~5:3) |
| Width | `var(--node-width)` (280; Main 320) |
| Radius | **medium** — `--radius` (12) |
| Border | **outlined** — `1px solid var(--line)` |
| Shadow | symmetric soft — `--shadow-sm` resting → `--shadow-md` hover |
| Background | `--surface` (clean) |
| Accent | top accent bar on **Main only** (`.nc-accent-top`); status dot inline |
| Spacing | `--space-node-pad` (12); clear title→body gap |
| Typography | title Inter 600 14.5 (Sora on Main); body Inter 500; meta 11 muted |
| Header | bold title line + body |
| Metadata | chip row (collapsed); status dot top-left |
| Hover / Selected | shadow→md / accent ring + `--shadow-lg` lift |
| **Grayscale cue** | **outlined, medium-radius card, symmetric shadow** — the reference object |

### C.2 STICKY — physical sticky-note object
| Property | Value |
|---|---|
| Shape | **squarer, index-card** (~4:3), grows vertically with content |
| Width | slightly narrower (~260) |
| Radius | **small** (8) — post-it corners |
| Border | **none** — instead a **lifted edge**: subtle darker shading on bottom/right edges (inset/edge gradient) |
| Shadow | **asymmetric offset** (down-right, stronger) = "stuck & lifted" (Miro pattern) |
| Folded corner | subtle **dog-ear** on one corner (CSS triangle overlay) — tasteful, optional |
| Tape/tack | faint **top-center tape strip** (semi-transparent pseudo) — physical cue |
| Background | warm cream `--sticky-bg` (reinforces, not defines) |
| Spacing | tighter (10) |
| Typography | Inter 400/500, closer line-height — informal, quick (no random handwritten font) |
| Header | **no strong title hierarchy** — single note-like text block |
| Metadata | small status dot at **bottom-right** (note placement) |
| Hover / Selected | shadow grows + lift / ring + lift |
| **Grayscale cue** | **squarer shape + asymmetric offset shadow + lifted edge + dog-ear + tape** — unmistakably a note |

### C.3 PAPER — document / research sheet
| Property | Value |
|---|---|
| Shape | **taller, portrait** (~3:4); generous vertical room |
| Width | standard–slightly-wider (~288) |
| Radius | **sharp** (6) — crisper than Classic |
| Border | thin outline + **left rail** (4px) + **header rule** (1px under title) |
| Shadow | **page-drop** (sharp, slightly longer, directional) — sheet on a desk |
| Background | cool off-white `--paper-bg` (reinforces) |
| Accent | full-height **left rail** + small header zone |
| Spacing | generous (14–16), strong vertical rhythm |
| Typography | title **small-caps + tracked** ("RESEARCH NOTE" feel) Inter 600 uppercase; body Inter 400 (document weight) |
| Header | title **separated from body by a 1px rule** (header/content split) |
| Metadata | small muted bottom row (source · status styling on existing status) |
| Hover / Selected | shadow deepens / ring + lift |
| **Grayscale cue** | **taller portrait + sharp corners + left rail + header rule + small-caps title + page shadow** — a sheet/document |

### C.4 HIGHLIGHT — emphasized knowledge object
| Property | Value |
|---|---|
| Shape | compact-bold rectangle (Classic proportion) |
| Width | standard |
| Radius | medium (12) |
| Border | **no full outline** — a thick **left marker bar** (6px, full height) like a highlighter stroke |
| Shadow | **elevated crisp** (stronger than Classic) = importance |
| Background | accent-tinted `--accent-soft` (reinforces) |
| Accent | left **marker bar** + **title underline** |
| Spacing | standard; title given extra weight |
| Typography | title **Inter 700**, slightly larger, **underlined**; body normal |
| Header | bold underlined title — "this matters" |
| Metadata | status **more prominent** (larger dot/chip) |
| Hover / Selected | marker intensifies + lift / ring + lift |
| **Grayscale cue** | **thick left marker bar + underlined bold title + elevated shadow** — emphasized, not just tinted |

### C.5 MINIMAL — lightweight annotation / reference object
| Property | Value |
|---|---|
| Shape | **wide, low, text-first**; almost no container |
| Width | content-driven (can be wider), low height |
| Radius | small/none |
| Border | **no enclosing border** — a single short **left tick** (2px dash) annotation cue (a11y: not shadow-alone) |
| Shadow | **none** — sits *inside* the canvas, not on top |
| Background | transparent over canvas; **faint backing only on hover** (so it stays readable/interactable) |
| Accent | small **leading tick/dash** before the text |
| Spacing | reduced padding; text-first |
| Typography | **lighter weight** (Inter 400), **muted color** — supporting info |
| Header | **no formal title** — flat text block |
| Metadata | minimal/tiny status |
| Hover / Selected | faint backing appears / ring (findable despite low chrome) |
| **Grayscale cue** | **no container + left tick + muted lighter text + no shadow** — a floating annotation |

### Grayscale-test summary
In pure grey they still differ by: **Classic** (outlined card, symmetric shadow) · **Sticky** (squarer, offset shadow, lifted edge, dog-ear, tape) · **Paper** (tall, sharp, rail + header rule, small-caps) · **Highlight** (thick marker bar, underlined bold title) · **Minimal** (no container, tick, no shadow). ✅ Five objects, not five colors.

---

## D. Role × Style matrix

Role sets **scale + elevation + importance**. Style sets **object form**. They compose:

| | Classic | Sticky | Paper | Highlight | Minimal |
|---|---|---|---|---|---|
| **Main** | large authoritative **knowledge card** (Sora title, accent bar, E3) | large central **note** (bigger, still offset-shadow + dog-ear) | central **research document** (largest, most generous, E3) | critical central idea (marker bar + E3) | *(allowed)* quiet central note — low chrome |
| **Child** | standard structured card (E2) | supporting quick note (E2) | reference sheet (E2) | **important supporting concept** (stands out among children) | quiet supporting reference |
| **Descendant** | small structured card (E1, narrower) | tiny note (E1) | small doc excerpt (E1) | emphasized detail (E1) | **quiet supporting reference** (intended pairing) |

Elevation tokens (E0–E5) stay owned by **role**; the per-style **tactile** shadow rides on the existing `--nc-style-shadow` channel so it *adds* to role elevation without overriding it (the hierarchy fix from the polish pass is preserved).

---

## E. Style-picker redesign

Each `.style-preview` becomes a **true miniature** of the object form (not a colored swatch):
- **Classic** preview — outlined medium-radius mini card.
- **Sticky** preview — squarer, dog-ear corner, top tape, offset shadow.
- **Paper** preview — taller, left rail, header rule.
- **Highlight** preview — left marker bar, underlined title line.
- **Minimal** preview — no border, leading tick, flat.

Keeps the labelled "Node style" header and the accent active-dot from v2. Feasible entirely in CSS on the existing `.style-preview.style-*` hooks.

---

## F. Responsive behavior (same identity, all devices)

| Width | Classic | Sticky | Paper | Highlight | Minimal |
|---|---|---|---|---|---|
| **375–430** | `min(86vw,300)` | min readable **≥200**; dog-ear/tape scale down | cap **max-height** (inner scroll if needed) so it never dominates phone | compact marker bar still clear | stays single-line-friendly |
| **768** | 268 | 248 | 268 | 268 | content-driven |
| **820–1024** | 274–280 | 252–260 | 274–288 | 274 | content-driven |
| **1280+** | 280 (Main 320) | 260 | 288 | 280 | content-driven |

Rules: metadata wraps (never overflows); sticky never below ~200px; paper never taller than ~60vh on phone; marker bar / rail widths scale via tokens; touch targets stay ≥40px; style-picker strip stays usable. Main>Child>Descendant scale ladder preserved at every breakpoint.

---

## G. Files that would change (on approval)

| File | Change | Risk |
|---|---|---|
| `src/app/globals.css` | **Primary.** Rewrite the 5 `.style-*` rules (radius/border/shadow/bg/accent/padding), add per-style `::before/::after` structural cues, per-style title/body typography, and matching `.style-preview.style-*` miniatures; add a few style tokens (`--paper-rail`, `--marker-w`, `--sticky-corner`, etc.). | Low–med (CSS only) |
| `src/lib/types.ts` | Append new style tokens to `THEME_TOKENS` (**extend only**, frozen names untouched). | Low |
| `src/components/Canvas/Node.tsx` | **Only if needed** for a decorative presentational element if pseudo-element contention can't be cleanly resolved (see H). Goal: avoid touching this. | Med (only if triggered) |

No data model, store, editing, or edge logic changes.

---

## H. Risks & potential conflicts

1. **Pseudo-element contention** — `.node-card::after` is used by the node-enter glow and `::before` by the magnet-target ring. Per-style decorations need distinct pseudos or inner-element targets (e.g., header rule on `.node-title-line`, rail/marker on `::before` scoped to non-transient states). *Mitigation:* distribute cues across `.node-card::before`, `.node-title-line::after`, etc.; if still contested, add **one** presentational `<span>` in `Node.tsx` (no behavior change).
2. **Sticky rotation vs the node-enter `transform` animation** — a resting `transform: rotate()` fights the entrance keyframes. *Mitigation:* make the **asymmetric offset shadow the primary cue** (research-backed; FigJam doesn't rotate anyway); offer ±0.5° rotation only as an optional enhancement guarded by `:not(.node-enter)`.
3. **Folded corner via `clip-path`** would also clip the shadow. *Mitigation:* use a `::after` **triangle overlay** for the dog-ear, not `clip-path` on the card.
4. **Grayscale verification** — must be tested before color finalize. *Mitigation:* add a temporary "desaturate" debug pass (render all style bgs as the same grey) and eyeball that 5 forms still read; remove before merge.
5. **Accessibility (Minimal)** — must not become invisible (shadow-alone trap). *Mitigation:* keep text contrast + the left tick + a hover backing + a clear selected ring.
6. **Dark-theme parity** — every material cue (rail, marker, dog-ear, tape, tick, lifted-edge) must be re-tuned for dark.
7. **Performance** — extra pseudos/shadows × many nodes. *Mitigation:* keep shadows to the existing restrained tokens; no blur filters on nodes.
8. **Selection on shaped objects** — keeping rotation **off** (shadow-based tilt) means the selection ring stays a clean rectangle. (If rotation is later enabled, the ring rotates too — acceptable.)

---

## I need from you before coding

1. **Approve the 5 object definitions (C)** — especially the chosen Material approach per style (outlined / shadow-lifted / ruled+rail / marker / tick).
2. **Sticky rotation** — ship shadow-only tilt (recommended, safe), or include the optional ±0.5° rotation?
3. **Folded corner + tape** on Sticky — include both, one, or neither? (Both = most "object-like"; neither = cleanest.)
4. **Paper small-caps tracked title** — yes (document feel), or keep normal-case title with just the rail+rule?
5. **Confirm the desaturate-test step** is acceptable as a verification gate before color tuning.

On approval, implementation is CSS-first in `globals.css` (+ token extension), with a desaturate-test screenshot/checklist before finalizing color.
