# SYNAPSE — Design System v2 (Proposal for review)

> **Status: DRAFT — awaiting Design Lead approval. Nothing implemented yet.**
> This document *proposes* an evolution of the locked `design.md`. On approval it becomes `design.md` v2.
> It respects the existing frozen-token contract (§F-0): names are never renamed/removed; values are retuned and new tokens are added alongside.

---

## A. Selected design authority

### A.1 Honesty note on "skills"
This environment exposes no tool to enumerate a private skills registry, so I cannot literally list "installed skills." Instead I searched for the most authoritative, publicly documented design system whose scope matches the brief — and the best match also exists as a registered skill in public skill marketplaces, which makes it a defensible authority rather than a subjective pick.

### A.2 The chosen authority: **Material Design 3 (Material You)**
Search confirms Material Design 3 is available as a recognized design skill (e.g. the "Material Design 3 (Material You)" skill in public registries [2](https://www.claudepluginhub.com/skills/intense-visions-harness-claude/design-material-design-3), [3](https://www.getclaudeskills.com/skills/material-design-3-hamen)). I am adopting **M3 as the primary authority**, selectively combined with three well-established companions:

| Authority | Used for | Why |
|---|---|---|
| **Material Design 3** (primary) | Color roles, **tonal elevation**, shape tokens, adaptive layout, type scale | Most complete single system; its surface/elevation model maps directly onto Synapse's canvas→card→floating metaphor [1](https://dev.to/mohitrajput987/from-material-2-to-material-you-everything-new-in-material-3-for-android-developers-4of2), [3](https://www.getclaudeskills.com/skills/material-design-3-hamen) |
| **Refactoring UI** (Wathan/Schoger) | Practical hierarchy, contrast, "color as meaning," restraint | The pragmatic translation layer that keeps M3 from becoming decorative |
| **Tailwind / Radix token architecture** | Token naming + scale discipline | De-facto web convention; aligns breakpoints with what most devs expect |
| **WCAG 2.2 + Apple HIG + Material targets** | Accessibility floor (contrast, touch targets) | Cited standards for AA/AAA compliance |

### A.3 Why M3 is the right fit for Synapse
- **Surface metaphor = Synapse's metaphor.** M3 models depth as *canvas → surface → surface-container → elevated surface* using **tonal surface color**, not just shadow [1](https://dev.to/mohitrajput987/from-material-2-to-material-you-everything-new-in-material-3-for-android-developers-4of2). Synapse is literally a canvas with layered cards on it — the match is exact.
- **Color *roles* separate from *values*.** M3's insight: a button isn't "blue," it's "primary" [4](https://medium.com/@hiren6997/mastering-material-3-in-jetpack-compose-the-2025-guide-1c1bd5acc480). This is exactly the semantic architecture you asked for (accent / accent-strong / accent-soft / surface / surface-elevated / border / text-primary…).
- **Adaptive by design.** M3 has canonical window-size classes and an 8dp rhythm — a ready-made responsive spine.
- **Tonal elevation solves "boring" without decoration.** M3 prefers communicating elevation through *surface-color steps* rather than shadows [3](https://www.getclaudeskills.com/skills/material-design-3-hamen). This is the single biggest lever for making Synapse feel dimensional **without** glassmorphism, gradients, or glow — all of which both M3 restraint and your brief forbid.

### A.4 Principles I will apply consistently
1. **Tonal elevation** — depth reads through a calibrated surface-color staircase, reinforced (not replaced) by shadow.
2. **Role-based color** — every color is a *semantic role*, never a raw hex in a rule.
3. **One brand hue, many meaning hues** — indigo stays the *only* brand/interaction accent; other hues exist only as *status/meaning* roles.
4. **Restraint as identity** — distinctiveness comes from hierarchy + tonal depth + confident type, never decoration.
5. **Mobile-first, content-driven breakpoints** — one system, not desktop-shrunk.
6. **Accessibility is non-negotiable** — WCAG 2.2 AA contrast + target sizes, meaning never color-only.

---

## B. New visual direction (look & feel)

**From:** *"clean but boring"* — flat light-grey canvas, near-identical white cards, all-slate text, a single shy indigo used sparingly. Low canvas↔card contrast means nothing pops; the eye sees "white page + white cards."

**To:** *"a confident knowledge board."* Same restraint, far more presence:

- **Depth via tonal staircase.** Canvas → child surface → main elevated → selected highest form a *visible* 4-step tonal ramp, so cards lift off the board without any glass or glow.
- **A signature board atmosphere.** The canvas gains a *very* subtle indigo-tinted radial atmosphere behind the dot grid (≤ ~4% opacity) plus an optional faint secondary coarse grid for depth — a "workspace board," never a decorative backdrop.
- **Indigo as signature.** Indigo is used more intentionally: main-node accent bars, active/selected rings, primary CTAs, focus rings, edge highlights on the active knowledge path. It becomes recognizable as *the* Synapse color.
- **Node families with character.** Five styles read as five *materials* (premium neutral / warm paper / cool document / accent knowledge / ghosted supporting) — but all from one token system.
- **Sharper type.** A real type scale gives titles authority and metadata quietness; currently everything huddles around 13.5px.
- **Alive through response, not motion.** Crisp state transitions (hover lift, selected ring, drag shadow) — all within the existing ≤220ms no-bounce motion stance.

The personality goal: **Linear / Obsidian / Stripe-grade confidence**, not "colorful."

---

## C. Color system (semantic architecture)

All values below are **light theme**. Dark theme mirrors the pattern (existing dark values in `design.md` §6 are retained; new tokens get dark equivalents derived the same way). Frozen names are **kept**; new tokens are marked **(new)**.

### C.1 Brand / accent (single hue family — indigo)
| Role (token) | Value | Use |
|---|---|---|
| `--accent` (frozen) | `#4f46e5` | Primary identity, CTAs, focus ring, active path |
| `--accent-strong` **(new)** | `#4338ca` | Active / pressed / selected-strong (aliases intent of `--accent-hover`) |
| `--accent-soft` (frozen) | `#eef2ff` | Subtle fills, highlight nodes, selected-row bg |
| `--accent-tint` **(new)** | `#f3f4ff` | Ultra-subtle accent washes (canvas atmosphere, hover halos) |

### C.2 Surfaces — the tonal elevation staircase
| Role (token) | Value | Elevation | Use |
|---|---|---|---|
| `--bg` / `--canvas` (frozen, retune) | `#e6eaf2` | E0 | Canvas/workspace (very slightly cooler-richer than current `#e7ebf3`) |
| `--surface-sunken` **(new)** | `#eef1f7` | E0+ | Wells, canvas-adjacent recesses |
| `--surface` (frozen) | `#ffffff` | E1 | Node cards, sidebar, inputs |
| `--surface-2` **(new)** | `#f4f6fb` | E1.5 | Hover, elevated resting |
| `--surface-3` **(new)** | `#ffffff` + ring | E3 | Selected/dragging (depth via ring + shadow, not color alone) |
| `--panel-bg` (frozen) | `rgba(255,255,255,.94)` | E4–E5 | Floating panels, toolbar, popovers |
| `--hover` (frozen) | `#f1f5f9` | — | Generic hover (kept; `--surface-2` for elevated) |

### C.3 Borders
| Role (token) | Value | Use |
|---|---|---|
| `--border` **(new)** → maps `--line` (frozen) | `#d9e0ea` | Primary border |
| `--border-soft` **(new)** | `#e4e9f1` | Secondary/lighter border (between `--line` and `--surface`) |
| `--line` / `--line-2` (frozen) | kept | Retained for back-compat |

### C.4 Text
| Role (token) | Value | Use |
|---|---|---|
| `--text-primary` → `--ink` (frozen) | `#0f172a` | Main text |
| `--text-secondary` → `--ink-2` (frozen) | `#334155` | Supporting text |
| `--text-muted` → `--muted` (frozen) | `#64748b` | Metadata |
| `--text-faint` → `--faint` (frozen) | `#94a3b8` | Disabled/placeholder |

### C.5 Status / meaning hues (semantic, **not** competing brand colors)
> Conflict resolved with `design.md` §11.10 ("one accent hue family") — see §K. Indigo remains the *only* brand/interaction accent. The hues below carry *status and knowledge meaning only* and each pairs a strong + soft variant. They are never used as primary CTAs.

| Role | Strong | Soft | Meaning |
|---|---|---|---|
| `--accent` (indigo) | `#4f46e5` | `#eef2ff` | Primary interaction / active knowledge |
| `--info` **(new)** | `#2563eb` | `#e8f0fe` | Information / reference |
| `--note` **(new)** | `#d97706` | `#fdf3e7` | Reminder / note (formalizes `--amber`) |
| `--success` (frozen) | `#059669` | `#e6f6f0` | Understood / completed |
| `--danger` (frozen) | `#ef4444` | `#fef2f2` | Issue / attention |
| `--concept` **(new)** | `#7c3aed` | `#f3eefe` | Important concept *(repurposes retired `--brand-secondary` as a meaning role, not a brand color)* |

**Accessibility:** every strong/soft pairing is checked for ≥4.5:1 (body) / ≥3:1 (large/UI) in both themes. Meaning is **never** color-only — always paired with an icon, dot, or text label (existing status-dot + chip system is preserved and extended).

### C.6 Node-style families (stronger but one system)
| Style | Surface | Border | Character |
|---|---|---|---|
| **Classic** | `--surface` `#ffffff` | `--line` | Premium neutral default; accent top-bar on Main |
| **Sticky** | `--sticky-bg` `#fff6d6` *(warmer)* | `--sticky-border` `#ecd9a3` *(warmer amber edge)* | Warm paper note |
| **Paper** | `--paper-bg` `#f6f8fc` *(cool)* + indigo left rule | `--line` | Cool document/research tone |
| **Highlight** | `--accent-soft` | `color-mix(in srgb, var(--accent) 30%, var(--line))` | Strong accent knowledge card |
| **Minimal** | `color-mix(--surface 55%, transparent)` over canvas | faint `--border-soft` dashed | Low-contrast supporting node |

They share radius, elevation tokens, type, and spacing — five *materials*, one system.

---

## D. Typography system

Two faces only (frozen): **Sora** (display) + **Inter** (body/UI). Scale is role-based and **scales down on smaller viewports**. Avoid heavy weights except display/selected.

| Role | Face / weight | Desktop | Tablet | Phone | Tracking / LH | Use |
|---|---|---|---|---|---|---|
| `--text-display` | Sora 700 | 20px | 18px | 17px | -0.02em / 1.15 | Empty-state, help H2 |
| `--text-main-title` **(new)** | Sora 600 | 16px | 15px | 14.5px | -0.01em / 1.25 | **Main-node title** |
| `--text-brand` | Sora 700 | 15.5px | 14px | 0 (hidden) | -0.01em / 1.1 | Toolbar brand |
| `--text-node` (frozen) | Inter 500 | 13.5px | 13px | 13px | 0 / 1.5 | Node body, editor |
| `--text-descendant` **(new)** | Inter 500 | 13px | 12.5px | 12.5px | 0 / 1.45 | Descendant body |
| `--text-body` | Inter 400 | 13px | 13px | 13px | 0 / 1.55 | Modal/sidebar/help body |
| `--text-ui` | Inter 600 | 12.5px | 12px | 12px | 0 / 1.4 | Buttons, toolbar labels |
| `--text-sidebar` **(new)** | Inter 600 / 500 | 12.5px | 12.5px | 14px *(touch)* | 0 / 1.4 | Sidebar items |
| `--text-meta` **(new)** | Inter 500 | 11px | 11px | 11px | 0 / 1.4 | Chips, metadata |
| `--text-badge` **(new)** | Inter 700 | 10.5px | 10.5px | 10.5px | +0.06em / 1.2 | Badges (uppercase) |
| `--text-tooltip` **(new)** | Inter 500 | 11px | 11px | 12px | 0 / 1.4 | Tooltips |

Rules (extend `design.md` §2): tabular-nums on all numerics; Roman-only headings; no raw `font-size` outside the token block; only display + selected states use weight ≥700.

---

## E. Spacing + radius + elevation tokens

### E.1 Spacing — formal 4pt scale (formalizes `design.md` §3)
`--space-1` 4 · `--space-2` 8 · `--space-3` 12 · `--space-4` 16 · `--space-5` 20 · `--space-6` 24 · `--space-8` 32 · `--space-10` 40 · `--space-12` 48
Existing role tokens (`--space-node-pad`, `--space-float-pad`, `--space-modal-pad`, `--space-gap-xs/sm/md`, `--space-float-offset`, `--space-separator`) are **kept** and defined in terms of this scale. Ad-hoc values (`padding: 10px 12px` etc.) are migrated to the scale.

### E.2 Radius scale (extends `design.md` §5)
`--radius-none` 0 · `--radius-xs` 4 *(new)* · `--radius-sm` 6 *(retune from 8→6 for inputs)* · `--radius-md` 8 *(new)* · `--radius-lg` 12 *(= current `--radius`)* · `--radius-xl` 16 *(new)* · `--radius-2xl` 20 *(new)* · `--radius-full` 999
Mapping: cards → `--radius-lg` (12); buttons/inputs → `--radius-md` (8); chips/swatches → `--radius-sm`/`xs`; modals → `--radius-xl`; pills → `--radius-full`. The odd `--radius-brand: 9px` is retired to `--radius-md` (8) for scale purity (value retuned, name kept).

### E.3 Elevation — 5 tiers, **tonal + shadow hybrid** (M3)
| Tier | Token | Tonal step | Shadow | Use |
|---|---|---|---|---|
| E0 | `--elev-canvas` | `--bg` | none | Canvas |
| E1 | `--elev-rest` **(= --shadow-xs)** | `--surface` | `--shadow-xs` | Child/resting node |
| E2 | `--elev-main` **(= --shadow-md, tuned)** | `--surface` + accent bar | `--shadow-md` | Main node |
| E3 | `--elev-selected` | `--surface` + ring | `--shadow-lg` + 2px accent ring | Selected/dragging |
| E4 | `--elev-popover` | `--panel-bg` | `--shadow-lg` + 1px `--line-2` ring | Menus, palette, style picker |
| E5 | `--elev-chrome` | `--panel-bg` | `--shadow-lg` | Toolbar cluster, dialogs |

Anti-slop preserved: **no `backdrop-filter` below E5** (blur stays on E3 *overlays* only, per `design.md` §4). Depth comes from tonal steps + shadow, never glass.

---

## F. Responsive system (mobile-first, content-driven)

### F.1 Breakpoints (Tailwind-aligned de-facto standard → maps to your exact widths)
Mobile-first `min-width` queries. Rationale: 2026 consensus is content-driven breakpoints; Tailwind's 640/768/1024/1280/1536 is the most widely shared scale [1](https://www.uxpin.com/studio/blog/best-practices-examples-of-excellent-responsive-design/), [4](https://webhelpagency.com/blog/responsive-breakpoints/).

| Token | min-width | Covers your widths | Layout intent |
|---|---|---|---|
| **base** | 0 | **375 / 390 / 430** (phone) | Canvas-first, overlay nav, bottom actions |
| `sm` | 640 | large-phone landscape | Compact two-up, overflow toolbar |
| `md` | 768 | **768 / 820 / 834** (iPad portrait) | Collapsible/overlay sidebar, compact toolbar |
| `lg` | 1024 | **1024** (iPad landscape / small desktop) | Persistent compact sidebar, richer controls |
| `xl` | 1280 | **1280 / 1440** (desktop) | Spacious canvas, persistent sidebar, full toolbar |
| `2xl` | 1536 | **1920** (large desktop) | Max content width, enhanced breathing room |

### F.2 Behavior by breakpoint
| Concern | base (phone) | md (tablet) | lg (small desktop) | xl+ (desktop) |
|---|---|---|---|---|
| **Sidebar** | Drawer (overlay), hamburger | Collapsible → overlay drawer | Collapsible rail (40px) | Persistent 260px |
| **Toolbar** | Brand + primary action + overflow (⋯) menu | Icon-first compact cluster | Icon+label, full cluster | Icon+label, expanded |
| **Primary actions** | Bottom action bar (New topic, Add note) | Inline compact | Inline | Inline |
| **Style picker** | Bottom sheet (large tiles) | Centered popover | Compact popover | Compact popover |
| **Contextual menus** | Compact bottom sheet | Dropdown | Dropdown | Richer dropdown |
| **Nodes** | ~full-width compact (see F.3) | Moderate | Moderate | Largest |
| **Touch targets** | 44px primary / 40px min | 40px min | 32px min (pointer) | 32px (pointer) |
| **Canvas chrome** | Minimal; floating bars shrink | Floating, avoid blocking content | Floating cluster | Floating cluster |

### F.3 Responsive node sizing (Main > Child > Descendant at every size)
| Breakpoint | Main | Child | Descendant |
|---|---|---|---|
| base (phone) | `min(92vw, 340px)` | `min(88vw, 300px)` | `min(84vw, 272px)` |
| md (tablet) | 296px | 268px | 244px |
| lg | 308px | 274px | 250px |
| xl+ (desktop) | 320px | 280px | 256px *(current)* |

Hierarchy is also carried by **elevation tier + title type-size** (not width alone), so the ladder reads even when widths are close on small screens.

### F.4 Accessibility floor (cited standards)
- **Touch targets:** WCAG 2.2 AA = 24×24 floor (2.5.8); AAA = 44×44 (2.5.5); Material = 48dp; Apple = 44pt [1](https://testparty.ai/blog/wcag-target-size-guide), [2](https://blog.logrocket.com/ux-design/all-accessible-touch-target-sizes/). **Synapse adopts 44px for primary phone actions, 40px min elsewhere, ≥24px with spacing always.**
- Contrast ≥4.5:1 body / ≥3:1 large+UI. Meaning never color-only. `:focus-visible` ring instant (2px accent, offset 2px). `prefers-reduced-motion` disables decorative animation (unchanged).

---

## G. Component system (one shared language)

Every surface obeys the same contract — drawn **only** from tokens in §C–E:

| Rule | Value |
|---|---|
| Radius | from the `--radius-*` scale by component class (see E.2 mapping) |
| Elevation | from the E0–E5 tiers by role (see E.3) |
| Border | `1px solid var(--border)`; subtle dividers `var(--border-soft)` |
| Focus | `:focus-visible` → `outline: 2px solid var(--accent); outline-offset: 2px` (instant) |
| Hover | `background: var(--hover)` / elevated → `--surface-2` |
| Active | `background: var(--accent-strong)` (primary) or scale(0.97) (icon) |
| Selected | `outline: 2px solid var(--accent)` + E3 elevation |
| Disabled | `opacity: .45; pointer-events: none` |
| Motion | existing stance (≤220ms, no bounce, transform/opacity only) |
| Icons | Phosphor, `aria-hidden` decorative / `aria-label` on icon-only |

**Applied uniformly to:** buttons (primary/ghost/danger/icon), node cards, toolbar cluster, sidebar, menus, popovers, the style picker, dialogs, empty states, badges/chips, tooltips — so nothing feels like a second design system.

---

## H. Icon system (one family)

**Recommendation: keep Phosphor — it is already the chosen family** (`design.md` §10; `@phosphor-icons/react@^2.1.10` in deps). Do **not** introduce Lucide/Tabler — mixing families is the inconsistency to avoid, and a migration has no payoff here.

Standardize usage:
- **regular** weight for all UI chrome (zoom, add, connect, sidebar toggles) — 16/18px.
- **bold** for dense/overflow glyphs (e.g. `DotsThree`) — already in use.
- **duotone** for decorative identity icons (sidebar `FolderIcon`/`NoteIcon`) — already in use.
- **fill** for active/toggle states (e.g. pinned `PushPinIcon`) — already in use.
- Sizes normalized to a small set: **13 / 14 / 15 / 16 / 18 / 20**. All decorative icons `aria-hidden="true"`; all icon-only buttons `aria-label`. `currentColor` only — no hardcoded hex on icons (one minor existing deviation to normalize).

---

## I. Example transformations (Current → Proposed)

*(Textual before/after. On your sign-off I can also render visual mockups for the starred items.)*

**★ Main node** — *Current:* white card, faint border, `--shadow-md`, tiny accent top-bar, 13.5px text. *Proposed:* E2 elevation with tuned shadow + **tonal lift**, bolder accent top-bar, Sora-600 16px title with clear body/meta separation, refined accent bar — reads as the anchor of the board.

**★ Child node** — *Current:* plain white card, `--shadow-sm`. *Proposed:* E1 tonal surface, `--border`, quieter title — clearly subordinate to Main via elevation + type, not just width.

**Sticky node** — *Current:* `#fffdf5` (nearly white). *Proposed:* warmer cream `#fff6d6` with amber edge `#ecd9a3` — unmistakably a sticky note, yet same radius/elevation/type as Classic.

**★ Toolbar** — *Current:* single desktop cluster, brand+labels always visible, wraps awkwardly under ~1024px. *Proposed:* adaptive — desktop icon+label; tablet icon-first compact; **phone collapses to brand + primary "New" + overflow ⋯**, with primary actions duplicated in a bottom bar for thumb reach.

**★ Sidebar** — *Current:* persistent 260px below 768px becomes an overlay; collapsed rail is minimal. *Proposed:* desktop persistent; **tablet collapsible rail/overlay drawer; phone a slide-in drawer** with larger 14px touch-sized rows and `--concept`/`--note` tints available per item.

**★ Style picker** — *Current:* compact 3-col popover, fine on mouse. *Proposed:* same compact popover on desktop/tablet; **on phone it becomes a bottom sheet** with larger 50×32 preview tiles (the v2 preview sizing) — same visual language, touch-scaled.

**★ Mobile canvas** — *Current:* desktop layout shrunk vertically; nodes fixed-width; chrome crowds the small screen. *Proposed:* canvas-first; near-full-width compact nodes (F.3); minimal top chrome; **bottom action bar**; overlay drawer sidebar; style picker as bottom sheet; 44px targets.

**Tablet canvas** — *Current:* treated as "big mobile." *Proposed:* canvas primary, **collapsible sidebar rail**, compact floating toolbar, nodes at moderate sizes, controls discoverable without blocking content; portrait & landscape both intentional.

**★ Desktop canvas** — *Current:* spacious but flat. *Proposed:* spacious + **tonal depth**, persistent sidebar, expanded icon+label toolbar, largest nodes with breathing room, accent path highlights — the flagship experience, not a stretched phone.

---

## J. Files likely to change *(after approval only)*

Estimated scope, grouped by risk:

**Token layer (low risk — additive):**
- `src/app/globals.css` — add new tokens (`--accent-strong`, `--accent-tint`, `--surface-2/3`, `--surface-sunken`, `--border-soft`, `--info/--note/--concept` + softs, `--sticky-*` retune, `--paper-bg`, type roles, spacing/radius/elevation scale tokens); retune `--bg`, node-style rules; canvas atmosphere. All frozen names preserved.
- `src/lib/types.ts` — append new token names to `THEME_TOKENS` (frozen list is *extended*, not mutated).

**Responsive layer (medium risk):**
- `globals.css` §5 media queries — rewrite to mobile-first `min-width` breakpoints (F.1); responsive node widths (F.3); adaptive toolbar/sidebar rules.
- `src/components/Canvas/Canvas.tsx` — viewport/zoom math may reference node width; ensure it uses responsive width tokens.
- `src/components/Canvas/Node.tsx` — role/size tokens, type roles, style-preview tiles.
- `src/components/Canvas/Toolbar.tsx` — adaptive label/overflow behavior.
- `src/components/Sidebar/Sidebar.tsx` — drawer/rail states, touch-sized rows.

**New components (medium risk):**
- Mobile **bottom action bar** + **overflow menu** (new).
- **Bottom-sheet** style picker variant (new) — shares tokens with the desktop popover.

**Component consistency pass (low–medium risk):**
- `ui/Button.tsx`, menus, popovers, `StatusBadge`, `DataPortability`, `KnowledgeDialPanel`, `HelpPanel`, `ThemeManager`, empty states — normalize to the §G contract.

**Docs:**
- `design.md` → promoted to **v2** on approval (this proposal folds in); `design-v2-proposal.md` removed or archived.

**Not changing:** data model, store, persistence, edge-routing logic, motion library (none), font CDN imports.

---

## K. Conflicts with the current locked `design.md` (surfaced for your decision)

| # | Existing rule (design.md) | New direction | Proposed resolution |
|---|---|---|---|
| 1 | §11.10 "One accent hue family. No `--brand-secondary` visual use." | Semantic meaning hues incl. `--concept` (violet) | **Keep indigo as the *only* brand/interaction accent.** Meaning hues are *status-only* (never CTAs). `--concept` reuses the retired `--brand-secondary` *as a semantic role*, not a brand color. Net: brand rule intact, meaning vocabulary added. |
| 2 | §1 tone "utilitarian… restraint is the aesthetic" | "distinctive, polished, alive" | Evolve tone to **"modern-minimal + expressive confidence."** Restraint stays (no neon/gradient/glass/glow — which you also forbid); expressiveness comes from tonal depth + type + intentional indigo. |
| 3 | §4 elevation = 3 shadow tiers only | 5 tiers, **tonal + shadow** | Extend to 5 tiers; add tonal surface steps. Anti-slop (no glass <E5) preserved. |
| 4 | §11.3 "no glassmorphism except E3 overlays" | (unchanged intent) | **Kept.** Your brief also forbids glass. |
| 5 | §3 spacing = informal scale | Formal 4pt scale | Formalize; existing role tokens kept & defined against the scale. |
| 6 | §6 frozen-token API | New tokens | **Extend only** — no renames/removals (honors §F-0). |
| 7 | §11.1 "no purple-gradient identity; brand solid" | Indigo signature | **Kept.** Brand stays solid indigo; signature via usage + depth, not gradients. |

---

## L. What I need from you before implementing

1. **Approve / adjust** the authority choice (M3) and the §B direction.
2. **Decide conflict K.1** — accept semantic meaning hues (incl. violet `--concept`) under the "status-only, indigo stays sole brand" rule? (Yes/No/which hues.)
3. **Confirm** the breakpoint set (F.1) and that phone gets a **bottom action bar + drawer sidebar + bottom-sheet style picker**.
4. **Confirm** retuning `--bg` (canvas) and adding the subtle indigo atmosphere are acceptable (some users prefer the exact current canvas).
5. **Want visual mockups first?** I can generate before/after mockups for the ★ items in §I before any code, if you'd rather see it than read it.

On approval, implementation proceeds file-by-file per §J with a diff for review at each step.
