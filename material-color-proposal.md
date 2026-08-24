# SYNAPSE — Material Color System Proposal (node material + same-family marking)

> **Status: DRAFT — awaiting approval. Nothing implemented.**
> Authority: loaded **Hallmark** skill (`color.md`, `slop-test.md`) + web research
> (FigJam object+highlighter shared palette [2]; muted-material palette theory [4]).
> Scope = **color relationships only**. Object forms, roles, content model, editor,
> persistence, and behavior are untouched. The existing `tint` field (one color
> string) drives the whole system via `color-mix` — **no data-model change.**

---

## The one idea

> **A node is a physical object with a muted material color; its marking is a
> stronger version of that SAME color, applied on top — like a highlighter on card stock.**

Not "node color + unrelated accent." Marking inherits the node's material hue.

---

## A. Proposed material color philosophy

- **Material = muted, low-chroma "card stock."** The node's base surface is a desaturated tint of its family — dusty/parchment/sage, never bright UI accent. Research: muted tones read across large surfaces without fatigue and create built-in hierarchy [4].
- **Marking = the same hue, stronger.** The Highlight style (and any mark) is a more saturated/lighter mix *of the node's own tint* — as if a marker was drawn on the object. FigJam's highlighter palette is literally the same families as its object palette, lightened per surface [2].
- **Default stays neutral.** Untinted nodes are the warm amber-paper default (the anchor family). Color is *intentional* — the canvas is not rainbow; most nodes stay neutral, a few carry a material hue to classify.
- **Tactile, not digital.** Material color composes with the existing warm shadows, surface staircase, role elevation, and object silhouettes — "a blue research sheet sitting on the workspace," "a yellow note placed on the board."

---

## B. Base → marking color relationships (the ladder)

A node's material hue is `var(--tint)` (the stored color). Every state **derives from it via `color-mix`** — one hue, five strengths, no independent colors:

```
var(--tint)  ── the family "ink" (the stored tint color; muted mid-chroma)
   │
   ├─ --mat-soft       color-mix(in srgb, var(--tint) 8%,  var(--surface))   barely-there wash
   ├─ --mat-base       color-mix(in srgb, var(--tint) 16%, var(--surface))   MUTED MATERIAL (card surface)
   ├─ --mat-mark       color-mix(in srgb, var(--tint) 34%, var(--surface))   MARKING fill (stronger same-family)
   ├─ --mat-mark-line  color-mix(in srgb, var(--tint) 50%, var(--line))      MARKING border / marker bar
   └─ --mat-ink        color-mix(in srgb, var(--tint) 70%, var(--ink))       dark same-family (reserved)
```

- `.is-tinted` → `--nc-bg: var(--mat-base)` (the muted material; replaces today's flat 14%).
- `.is-tinted.style-highlight` → `--nc-bg: var(--mat-mark); border-left-color: var(--mat-mark-line)` — **the marking is a stronger version of the node's own tint.**
- `.style-highlight` with **no tint** → falls back to the amber anchor (`--accent-soft` + `--accent` marker) — i.e., the default material *is* amber, so the default mark is amber. The system is continuous: marking always matches material.

---

## C. Material color families (6, muted, OKLCH)

`NODE_TINTS` retuned from today's bright Tailwind defaults (`#3b82f6 / #8b5cf6 / #ec4899 / #06b6d4`) to muted material "inks." The stored tint is the family ink; `color-mix` produces the muted base + stronger mark.

| Family | id | label | Tint ink (stored) | Material base (~16% mix) | Mark (~34% mix) |
|---|---|---|---|---|---|
| **Slate** | `slate` | Slate | `oklch(56% 0.11 245)` | dusty powder blue | stronger blue |
| **Saffron** | `saffron` | Saffron | `oklch(78% 0.13 78)` | warm parchment | richer yellow |
| **Sage** | `sage` | Sage | `oklch(60% 0.10 150)` | muted sage | deeper green |
| **Clay** | `clay` | Clay | `oklch(62% 0.11 28)` | soft terracotta / rose | richer clay |
| **Lilac** | `lilac` | Lilac | `oklch(58% 0.11 300)` | dusty lavender | stronger lilac |
| **Sky** | `sky` | Sky | `oklch(62% 0.09 210)` | muted teal / cyan | stronger sky |
| *(none)* | — | Default | — | warm amber paper (anchor) | amber mark |

All low–mid chroma (0.09–0.13) → mixes read as *material*, not poster paint. The default untinted node is the amber-paper anchor, so the canvas stays calm and color stays intentional.

---

## D. Interaction with Hallmark's existing palette

- **Anchor stays amber.** The warm `oklch(58% 0.155 52)` accent is untouched — it remains the **selection / focus / primary-CTA** language and the **default material** (untinted nodes).
- **Material families are a *second dimension*, not competitors.** They are muted (chroma ≤0.13 vs the anchor's 0.155) so they never out-shout the amber interaction language. A material hue classifies content; the amber anchor acts.
- **Same warm ground.** All neutrals stay warm-tinted (hue ≈70°); material families sit on that warm paper, so a dusty-blue node still belongs to the warm system (no temperature conflict).
- **Token discipline (gate 48).** Nothing is hardcoded — every material/mark color is `color-mix(var(--tint) …, <token>)`. The only new "value" is the `NODE_TINTS` OKLCH inks (the source palette), consistent with how `--accent` is the source of the amber family.

---

## E. How the five object forms use the system

The form (silhouette) is unchanged; material color is layered *on top*. Form still defines the object type; color classifies it. (Grayscale test applies to **forms**, not material hues — see I.)

- **Classic** — muted material surface (`--mat-base`) + same-family marking when highlighted. The neutral default.
- **Sticky** — warm paper base; if tinted (e.g., Saffron) it's a *yellow note*; its mark is a richer yellow. Tactile + material together.
- **Paper** — document sheet; material tint shifts the sheet's paper tone (e.g., a *blue research sheet*); marking = same-family rail/marker, restrained.
- **Highlight** — the marking style. **Marking derives from the node's tint** (`--mat-mark` + `--mat-mark-line`), or amber if untinted. This is the core fix: highlight = stronger version of the object's own color, not an unrelated accent.
- **Minimal** — barely-tinted (`--mat-soft`); understated. Color stays whisper-quiet, structure carries it.

---

## F. Marking vs selection (three distinct states)

| State | What it means | Visual language |
|---|---|---|
| **Material** | What the object *is* (its family) | muted `--mat-base` surface |
| **Marking** | A semantic highlight *applied to* the object | stronger `--mat-mark` (same family) — looks painted on |
| **Selection** | What the user is *interacting with* now | **global amber accent** — outline ring + elevation lift |

Selection **never** uses the material hue. So a muted-sage node, sage-marked, still gets an **amber** ring when selected. Three layers, never conflated — exactly the user's §5 requirement.

---

## G. How status colors fit

Status keeps its **semantic meaning** (success/warning/danger/info) — it is *not* derived from the tint (a blue node's "success" is still green, correctly). But the semantic tokens are **already muted** from the color pass (sage success, terracotta danger, golden-amber warning, desaturated info), so a status dot/chip on a material node reads as a quiet, compatible mark — never neon. Where a node's material hue coincides with a status family (e.g., a Sage node + success), they reinforce instead of clashing. Status stays secondary: **content > title > status > metadata.**

---

## H. Example combinations

| Role + Style + Material | Reads as |
|---|---|
| **Main + Paper + Slate + blue mark** | a dusty-blue research sheet, anchor of the board, with a stronger-blue rail |
| **Main + Sticky + Saffron + yellow mark** | a warm yellow note placed centrally, dog-ear + offset shadow, richer-yellow emphasis |
| **Child + Highlight + Lilac + purple mark** | a dusty-lilac card with a stronger-lilac marker bar — important supporting concept |
| **Descendant + Minimal + Sage + (quiet)** | a whisper-green supporting annotation receding into the board |
| **(any) + Classic + Clay, selected** | soft-terracotta card + **amber** selection ring (material ≠ selection) |

---

## I. Hallmark anti-slop validation plan

- **Grayscale gate (the §9 rule).** Desaturate the canvas: the five *forms* (Classic/Sticky/Paper/Highlight/Minimal) must still differ by silhouette — material hue is removed, form remains. (Reusable `desaturate-test` approach.) ✅ by construction — material is an added layer, forms are untouched.
- **Gate 23 (accent footprint ≤~5%).** The **amber anchor** (selection/focus/CTA) still occupies ≤~5%. Material fills are *muted base tones*, not the accent — they read as surface, not accent flood. ✅
- **Gate 48 (token discipline).** Every material/mark color is `color-mix(var(--tint)…, token)`; the only literals are the `NODE_TINTS` OKLCH inks (the declared palette). ✅
- **Contrast (gates 40–41).** Body text stays `--ink` on `--mat-base` (muted base is high-lightness → passes 4.5:1); title underline/marker keeps ≥3:1. Verified per family.
- **Restraint / "not pastel rainbow" (§11, §15).** Default node is neutral amber-paper; color is opt-in via the palette. Muted (desaturated) not pastel (whitened) — per muted-palette theory [4]. No gradients, no glow, no neon.
- **Material reality (§16).** Pair with existing warm shadows + surface staircase + role elevation + object silhouettes so each combo reads as a physical object + applied mark.

---

## Decisions I need before implementing

1. **Approve the `color-mix` ladder** (B) — marking derives from `var(--tint)`; untinted → amber.
2. **Approve the 6 muted families** (C) — Slate / Saffron / Sage / Clay / Lilac / Sky (rename/swap any)?
3. **Highlight = same-family mark when tinted** (the core fix) — confirm.
4. **Selection stays amber** (never material-colored) — confirm.
5. Note: existing persisted tints (old bright hex) keep their color until re-picked; new picks use the muted OKLCH. Acceptable?

On approval: implement mostly in `globals.css` (the `--mat-*` ladder + tinted-Highlight rule) + retune `NODE_TINTS` in `src/lib/types.ts`. No data-model/TSX-behavior change. Then re-run the grayscale gate + slop gates 23/40/41/48 + tsc/tests/build/runtime.
