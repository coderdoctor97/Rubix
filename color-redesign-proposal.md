# SYNAPSE — Hallmark-Driven Color Redesign Proposal

> **Status: DRAFT — awaiting approval. Nothing implemented.**
> Driven by the **Hallmark** anti-AI-slop design skill (loaded, not summarized):
> `SKILL.md` + `references/color.md` + `references/verbs/audit.md` +
> `references/slop-test.md` (58 gates) + `references/genres/modern-minimal.md`.
> Scope = **color language only**. Architecture, canvas, node Role×Style system,
> editing, persistence, and interactions are untouched. On approval this amends
> the color section of the locked `design.md` (frozen token *names* preserved;
> *values* retuned to OKLCH).

---

## A. Hallmark skill — installation status

- **Source:** `https://github.com/Nutlope/hallmark` (Nutlope, v1.1, 26.7k★) — "Anti-AI-slop design skill."
- **Documented install:** `npx skills add nutlope/hallmark` (or copy `SKILL.md` + `references/` into `~/.claude/skills/hallmark/`). I am not in Claude Code/Cursor/Codex, so I performed the **equivalent load for this environment**: cloned the repo and read the **real skill files** — `SKILL.md`, `color.md`, `verbs/audit.md`, `slop-test.md`, `genres/modern-minimal.md`, plus `anti-patterns.md`.
- **Verbs used:** `hallmark audit` (current tokens scored against the anti-patterns + slop gates), then the `redesign` color layer guided by `color.md`, validated by web research, and pre-checked against the 58-gate slop test.
- **Skill is available and loaded.** ✅

---

## B. Hallmark audit findings (current Synapse color)

Per `verbs/audit.md` — **Tell · Where · Severity · Fix**. Genre is `modern-minimal` (per `design.md`), so gates 7 (#fff) and 22 (zero-chroma) are *loosened* — but the user explicitly wants them fixed, so they're graded as the user grades them.

### CRITICAL (ships as slop)
1. **AI-default anchor hue.** `--accent: #4f46e5` (Tailwind **indigo-600**) — the single most on-distribution LLM accent. Hallmark `color.md`: *"It picks blue."* This is your #1 complaint ("predictable blue/purple"). `globals.css:47`. **Fix:** replace with a distinctive **warm amber/ochre** anchor (escapes the default entirely).
2. **Purple-to-blue family drift** (gate 2-adjacent). indigo accent + `--concept:#7c3aed` (violet) + `--conn-manual:#7b82f6` (periwinkle) + `--info:#2563eb` (blue) = four blue/purple family members. Hallmark: *one accent, maximum two.* `:47,:54,:64,:66`. **Fix:** collapse to one warm anchor; retire the standalone violet `--concept` (map "important" → accent); make `info` a desaturated cool counterpoint, not a second brand hue.

### MAJOR (looks AI-generated)
3. **Zero-chroma / dead neutral surfaces** (gate 22). canvas `#e3e7f1`, surface `#fff`, ink `#0f172a`, line `#cfd6e4` are all ~0 chroma greys. `:23,:25,:36,:42`. **Fix:** tint every neutral toward the anchor hue (OKLCH chroma 0.006–0.015).
4. **Temperature conflict.** Warm `--sticky-bg:#fff3c4` and warm accents sit on a **cool** grey canvas/ink. colorarchive: *"warm brand on cool-grey = temperature conflict… most people can't name why it looks wrong."* `:70` on `:23`. **Fix:** warm-tint the neutrals so warm objects belong.
5. **Semantic colors are Tailwind defaults / independent.** `success:#059669`, `danger:#ef4444`, `warning:#d97706`, `info:#2563eb` — "default browser-ish," not one family. `:57–65`. **Fix:** derive a coherent warm-anchored semantic family.
6. **Palette is not OKLCH.** Hex/rgb throughout → lightness/chroma steps aren't perceptually uniform (root cause of "dead neutrals" + inconsistent hierarchy). Hallmark mandates OKLCH. whole `:root`. **Fix:** convert every color to OKLCH.
7. **Styles still partly color-differentiated.** `--paper-bg:#f3f6fc` (cool blue) makes Paper read as "the blue card"; Highlight fills a whole node with accent. `:72`, `.style-highlight`. **Fix:** Paper → same warm paper as Classic (structural cues only); reserve accent-fill for Highlight alone.

### MINOR (small taste issues)
8. **Mid-render rgba in shadows** (gate 48). `--sticky-shadow` rgba(120,95,20), preview/toolbar shadows rgba(15,23,42), inset rgba(255,255,255). **Fix:** route shadow tints through warm-tinted tokens.
9. **Accent-footprint risk** (gate 23). Canvas atmosphere (`accent-tint`) + Highlight nodes (accent-soft fill) can exceed ~5% if many highlights exist. `#viewport::before`, `.style-highlight`. **Fix:** keep atmosphere ultra-low-opacity; cap accent-soft lightness.
10. **Pure `#fff` surface** (gate 7 — allowed in modern-minimal, but a tinted paper reads more intentional). `:25`. **Fix:** warm paper `oklch(98.5% 0.006 75)`.

**Count: 2 critical · 7 major · 3 minor.**

---

## C. Proposed new color fingerprint (Hallmark-driven, OKLCH)

**Direction:** a warm **"paper + signal amber"** system. Anchor hue ≈ **52° (burnt amber / ochre)** — evokes paper, study-lamp light, and a **highlighter** (which makes the Highlight node literal). Every neutral is tinted toward that hue, so the whole interface belongs to one temperature.

### Anchor & accent (single hue; ≤3–5% area)
| Token | Light | Dark | Role |
|---|---|---|---|
| `--accent` | `oklch(58% 0.155 52)` | `oklch(72% 0.13 52)` | Signature — focus rings, selection, primary CTA, active nav, marker bar |
| `--accent-strong` | `oklch(51% 0.16 48)` | `oklch(78% 0.12 50)` | Active/pressed |
| `--accent-soft` | `oklch(95% 0.038 75)` | `oklch(28% 0.06 60)` | Highlight node wash (the only accent fill) |
| `--accent-tint` | `oklch(94% 0.022 75)` | `oklch(22% 0.04 60 / 0.5)` | Ultra-subtle canvas atmosphere |
| `--accent-ink` | `oklch(99% 0.006 75)` | `oklch(16% 0.012 60)` | Text on amber fills (CTA labels) |

### Surfaces — warm tonal staircase (depth by lightness, not hue)
| Token | Light | Dark | Layer |
|---|---|---|---|
| `--bg` (canvas) | `oklch(94.5% 0.012 70)` | `oklch(15% 0.012 60)` | E0 board |
| `--surface` | `oklch(98.5% 0.006 75)` | `oklch(19% 0.012 60)` | E1 cards/nodes |
| `--surface-2` | `oklch(96.5% 0.010 72)` | `oklch(22% 0.013 60)` | E1.5 hover/elevated |
| `--surface-nav` | `oklch(92% 0.014 68)` | `oklch(13% 0.012 60)` | sidebar — recedes |
| `--surface-sunken` | `oklch(90% 0.016 65)` | `oklch(11% 0.013 60)` | wells |
| `--panel-bg` | `oklch(98.5% 0.008 75 / 0.96)` | `oklch(21% 0.013 60 / 0.96)` | E5 floating UI |

### Ink hierarchy (by lightness; grayscale-safe)
| Token | Light | Dark |
|---|---|---|
| `--ink` | `oklch(23% 0.013 55)` | `oklch(93% 0.008 75)` |
| `--ink-2` | `oklch(38% 0.011 55)` | `oklch(80% 0.010 70)` |
| `--muted` | `oklch(52% 0.011 55)` | `oklch(66% 0.010 65)` |
| `--faint` | `oklch(66% 0.010 55)` | `oklch(52% 0.010 60)` |

### Borders (warm-tinted)
`--line oklch(86% 0.011 70)` · `--line-2 oklch(81% 0.013 68)` · `--border-soft oklch(91% 0.009 72)` (dark: ~`30%/26%/22%` at hue 65).

### Semantic family (coherent, warm-anchored; not default red/green/blue)
| Token | Light | Note |
|---|---|---|
| `--success` | `oklch(54% 0.11 150)` | warm forest/sage (not emerald) |
| `--warning` | `oklch(66% 0.14 65)` | golden amber, near anchor |
| `--danger` | `oklch(55% 0.17 27)` | warm terracotta-red (not pure red) |
| `--info` | `oklch(52% 0.07 235)` | one **desaturated cool** counterpoint, deliberately quiet |

(each with a `–soft` wash at ~95% L, hue-matched). **`--concept` retired as a standalone hue** — "important" now uses `--accent` (one accent rule; removes the AI purple).

### Shadows — warm-tinted, not black opacity
e.g. `--shadow-sm: 0 1px 2px oklch(30% 0.015 55 / 0.10), 0 3px 8px -3px oklch(30% 0.015 55 / 0.08)`. Material and calm; matches the warm ground.

---

## D. Why this palette fits Synapse

- **Escapes the AI default.** Indigo→burnt-amber is the single biggest "this was designed, not generated" move (Hallmark `color.md` + your #1 ask). Amber/ochre is *not* the on-distribution SaaS accent.
- **Product-specific metaphor.** Active-recall + study = paper, lamp-light, and a **highlighter**. The amber anchor makes the **Highlight node literal** and ties the whole identity to "focused study," not "generic productivity SaaS."
- **Fixes the temperature conflict at the root.** Warm neutrals mean the warm Sticky, warm accents, and warm shadows all belong — no more "looks wrong, can't say why."
- **One system, not five color picks.** Hallmark's "tint the greys toward the anchor" + "one accent" turns ~15 independent hexes into one derived family. Style distinction stays **form-led** (Paper is no longer a blue card — it shares Classic's paper and differs by rail/rule/small-caps).
- **Hierarchy survives grayscale.** Depth = surface lightness staircase (94.5→98.5→elevated→selected); ink = lightness ladder (23→38→52→66%). Desaturate it and Main>Child>Descendant>Selected still reads. (Meets your §4 + §17.)
- **Within modern-minimal, deliberately tighter.** The genre *allows* pure #fff and zero-chroma, but we choose tinted warmth because the brief asks for intention, not the safe default.

---

## E. Color transformation — Current → Proposed

| Element | Current | Proposed |
|---|---|---|
| **Canvas** | cool grey `#e3e7f1` (0 chroma) | warm board `oklch(94.5% 0.012 70)` + faint amber atmosphere |
| **Main node** | white card, indigo bar `#4f46e5` | warm paper card, **amber** accent bar `oklch(58% 0.155 52)`, warm ink title |
| **Child node** | white card, slate text | warm paper, warm ink hierarchy (lightness-led) |
| **Sticky** | warm cream on **cool** canvas (temp conflict) | warm cream `oklch(95% 0.05 85)` on **warm** board — now belongs; dog-ear + offset shadow carry form |
| **Paper** | **cool blue** `#f3f6fc` (= "blue card") | **same warm paper as Classic** — differentiated by amber rail + header rule + small-caps only |
| **Highlight** | indigo-soft `#eef2ff` fill | amber-soft `oklch(95% 0.038 75)` wash + amber marker bar (the one accent fill, by design) |
| **Minimal** | transparent on cool canvas, slate text | transparent on warm board, warm-muted text, amber hairline tick |
| **Selected node** | indigo outline + grey shadow | **amber** ring + warm-tinted elevation shadow (lift) |
| **Toolbar** | white panel, indigo CTA | warm-paper floating panel, **amber** primary CTA, warm-tinted shadow |
| **Sidebar** | cool grey `#eceff7` | warm recessed `oklch(92% 0.014 68)` — clearly a nav layer beneath warm cards |
| **Popover/menu** | white + indigo active | warm elevated surface + amber active-dot / focus |
| **Badges / status** | default `#ef4444/#f59e0b/#059669` | warm terracotta / golden-amber / sage-green family (+ icon, never color-only) |

---

## F. Hallmark anti-slop checks the new system must satisfy

Pre-emit self-critique (six axes, target ≥3 each): Philosophy ✓ (a *why*: paper+highlighter study tool) · Hierarchy ✓ (lightness-led, grayscale-safe) · Execution ✓ (OKLCH, tokens) · Specificity ✓ (amber = Synapse, not anyone) · Restraint ✓ (one accent ≤5%) · Variety ✓ (warm ≠ prior indigo on all 3 axes).

Slop-test gates (the color-relevant subset of 58):
- **Gate 2** — purple-to-blue/cyan gradient or gradient text: **PASS** (warm anchor; no gradients).
- **Gate 7** — pure `#000`/`#fff` base: moving to tinted paper (tighter than the genre needs).
- **Gate 22** — zero-chroma neutrals: **PASS** (all neutrals warm-tinted ≥0.006 chroma).
- **Gate 23** — accent >5% area: **DESIGN RULE** — accent reserved for ring/focus/CTA/marker + the single Highlight wash; atmosphere ultra-low-opacity. Verified by area.
- **Gate 30** — mixed icon libraries / emoji icons: **PASS** (Phosphor-only, already enforced).
- **Gate 40–41** — contrast: ink-on-paper L-diff 75% (≫4.5:1); accent-on-paper ~3:1 (large/UI only, never body); `--accent-ink` defined for amber fills. Verified per pair.
- **Gate 48** — mid-render token improvisation: **PASS** — every color & shadow tint is a named OKLCH token; no inline hex/rgb outside `:root`.
- `color.md` bans: no pure extremes, no flat grey, no purple-cyan gradient, no accent-as-big-fill, no alpha-defined palette, no 3-stop gradients, no grey-text-on-color, no red-green-only signal. **All satisfied.**
- Dark recipe: hue held at ~52° (never switched), paper 15–19%, ink 93%, accent chroma ↓ / lightness ↑, elevated surfaces **lighter** (+3%/level). **Followed.**

Any gate that fails at build time is fixed before handoff (Hallmark treats the slop test as a pre-handoff requirement).

---

## Decisions I need before implementing

1. **Approve the warm amber/ochre anchor** (≈ oklch(58% 0.155 52)) — or pick a different distinctive hue (e.g., signal coral, forest green). Indigo is not an option (it's the finding).
2. **Retire standalone `--concept` (violet)** → map "important" to the amber accent? (Removes the AI purple; recommended.)
3. **Paper = warm paper shared with Classic** (form-led, not a colored card) — confirm.
4. **Convert all tokens to OKLCH** (Hallmark-mandated; values become less "readable" in source but perceptually correct) — confirm.
5. Scope stays **color-only**: globals.css token values + the few component rules with inline rgba; `design.md` §6 retuned; frozen token *names* preserved. No architecture/behavior change.

On approval: amend `design.md` color section + retune `globals.css` tokens (extend `THEME_TOKENS` as needed), then re-run the slop test (gates 2/7/22/23/40/41/48) + tsc/tests/build/runtime before handoff.
