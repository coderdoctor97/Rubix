# SYNAPSE — Hallmark Typography Redesign Proposal

> **Status: DRAFT — awaiting approval. Nothing implemented.**
> Authority: loaded **Hallmark** skill — `typography.md` (2+1 rule, banned fonts,
> ratio scales, body/measure rules) + `slop-test.md` gates 1, 37, 38/38a, 48, 49, 55.
> Scope = **typography only** (presentation layer). Content model, editor, persistence,
> node roles/styles, and behavior are untouched. On approval this amends `design.md` §2.

---

## A. Hallmark typography audit (current Synapse)

Per `typography.md` + `anti-patterns.md`. Findings: **Tell · Where · Severity · Fix**.

### MAJOR (looks AI-generated / generic)
1. **Inter is the Hallmark-banned default body face.** `typography.md` bans Inter/Roboto/Open Sans as on-distribution. `globals.css:7–10` (@import), `:300` (`font-family:'Inter'`). This is the #1 type-slop signal — your body reads "generic SaaS." **Fix:** replace with a humanist sans (IBM Plex Sans recommended).
2. **Body text is squeezed below the reading floor.** `--text-node: 13.5px`, `--text-body: 13px` (token block). Hallmark: body ≥16px, "below 14 is a11y-hostile." Notion/readability research: don't squeeze to 13px; long-form wants 16–18px. An *educational* product failing this is the core issue. **Fix:** node body → 15px desktop (deliberate canvas-density compromise with generous leading + narrow measure), 14px phone floor.
3. **No real type scale — scattered ad-hoc sizes.** ~14 distinct font-sizes in rules (10, 10.5, 11, 11.5, 12, 12.5, 13, 13.5, 14.5, 15.5, 16, 19, 20, 22px). Hallmark: ratio-based scale (1.25), ≤5 sizes per page. **Fix:** ratio scale + semantic tokens.
4. **Font-families not tokenized (gate 48).** `'Inter'`/`'Sora'` hardcoded in ~15 rules (`:300,:852,:1444,:1642,:1985,:2136,…`). Hallmark: every `font-family` must be `var(--font-*)`. **Fix:** introduce `--font-body/--font-display/--font-mono` tokens; route all usages through them.
5. **Insufficient weight contrast.** Body Inter 500, titles 600 — "reads as a default setting," not intentional (Hallmark wants ≥300-unit contrast or family/colour contrast). 51 `font-weight` declarations, inconsistent. **Fix:** body 400; titles 600; main title via *serif family + size*, not just weight.
6. **Line-height inconsistent & too tight for reading.** 25 `line-height` decls (1.1–1.55 scattered); node body 1.55. Research: reading wants 1.6+ (Notion ~1.7). **Fix:** leading tokens; body `--leading-body: 1.6`.
7. **Letter-spacing ad-hoc.** 12 decls, no tracking tokens. **Fix:** `--tracking-tight/normal/wide`.

### MINOR
8. **Sora (display) is un-catalogued** — not banned, but not in Hallmark's font catalog and reads "geometric tech," not "educational authority." **Fix:** replace main-title/workspace display with a modern serif (see B).
9. **No measure control / `overflow-wrap`** on titles — long concept names ("Eclampsia — Management Framework") can break poorly when wrapped (gate 51). **Fix:** `overflow-wrap:anywhere; min-width:0` on titles.
10. **A few 10px sizes** (badge floor). Hallmark floor 10px — borderline; keep ≥10.5.

**Count: 0 critical · 7 major · 3 minor.** (No criticals — type is functional; it just reads generic.)

---

## B. Recommended font strategy

**Replace, not keep.** Hallmark bans Inter; the brief asks for educational/knowledge character the current pairing can't deliver. Research validates a **humanist sans body + modern serif display** for this register ([2](https://www.designmd.co/blog/notion-design-language): "humanist type reads welcoming, not technical").

### Recommended (free — Google/Fontsource, matches current @import pattern)
| Role | Family | Why |
|---|---|---|
| **Body / UI** (`--font-body`) | **IBM Plex Sans** (400/500/600/700) | Humanist, warm, highly readable at small sizes, **cohesive super-family** (Serif + Mono), excellent multilingual/script coverage (future-proofing). "Warmth without personality competing with content" — the educational register. Escapes Inter. |
| **Display** (`--font-display`) — main-node titles + workspace/empty/help headings | **Source Serif 4** (600) | Modern transitional serif, calm and smart (not cosplay). Makes a main-node title read as **"the title of a concept being learned,"** not a SaaS card heading. Used **only** on the top concept + app headings → serif-vs-sans *is* the hierarchy, no cosplay. |
| **Outlier** (`--font-mono`) — code, `⌘D`/`Ctrl+B` shortcut hints, numeric readouts | **IBM Plex Mono** (400/500) | Cohesive with Plex Sans; the one outlier register (Hallmark 2+1 ceiling = 3 families; mono used in ≤2 slots). |

This is a **2+1 system** (Plex Sans + Source Serif 4 + Plex Mono) — within Hallmark's three-family ceiling, all free, all `font-display: swap`, none on the banned list.

### Fallback (if you prefer **no serif** — lower identity shift)
Body/UI **IBM Plex Sans** + display **Cabinet Grotesque** (Fontshare, foundry-grade free) for main titles, Plex Mono outlier. Sans-only, still escapes Inter, but less "educational authority."

> I recommend **the serif-display option (A)** — it most directly delivers "intelligent + academic-modern + distinctive" without "university website" cosplay, because the serif appears *only* on main concepts and app headings. Your call.

---

## C. Typography hierarchy (importance without loudness)

Hierarchy carried by **family (serif vs sans) + size + weight + ink** — never loudness.

| Role | Family / weight | Desktop size | Leading | Tracking | Ink |
|---|---|---|---|---|---|
| **Workspace display** (empty/help H2) | Source Serif 4 / 600 | clamp(22→28px) | 1.15 | −0.02em | ink |
| **Main-node title** (concept) | Source Serif 4 / 600 | 17px | 1.25 | −0.01em | ink |
| **Child-node title** | Plex Sans / 600 | 14.5px | 1.3 | −0.005em | ink |
| **Descendant title** | Plex Sans / 500 | 13px | 1.35 | 0 | ink-2 |
| **Node body** (reading) | Plex Sans / 400 | **15px** | **1.6** | 0 | ink |
| **Descendant body** | Plex Sans / 400 | 13px | 1.55 | 0 | ink-2 |
| **Metadata / status** | Plex Sans / 500 | 11.5px | 1.4 | 0.01em | muted |
| **Badge** | Plex Sans / 600 | 10.5px | 1.2 | 0.04em | (semantic) |
| **Toolbar / button label** | Plex Sans / 500–600 | 12.5px | 1.3 | 0 | ink-2 |
| **Sidebar item** | Plex Sans / 500–600 | 13px | 1.35 | 0 | ink / accent(active) |
| **Tooltip / caption** | Plex Sans / 400 | 11px | 1.4 | 0.01em | muted |
| **Code / shortcut** (outlier) | Plex Mono / 500 | 0.9em | 1.4 | 0.02em | ink-2 |

Perceived order the user asked for — **content > title > status > metadata** — is achieved by size + ink + weight, with the serif main-title as the clear apex.

---

## D. Type scale (ratio ≈ 1.2–1.25, semantic tokens)

```css
--text-display:   clamp(1.375rem, 1.1rem + 0.9vw, 1.75rem); /* 22→28 workspace heading */
--text-title-main: 1.0625rem;  /* 17  main title (serif) */
--text-title:      0.906rem;   /* 14.5 child title */
--text-node:       0.9375rem;  /* 15  body — READING (was 13.5) */
--text-body-sm:    0.8125rem;  /* 13  descendant body / dense */
--text-descendant: 0.8125rem;  /* 13  descendant title */
--text-ui:         0.781rem;   /* 12.5 toolbar/buttons */
--text-meta:       0.719rem;   /* 11.5 metadata */
--text-badge:      0.656rem;   /* 10.5 badges */
--text-caption:    0.687rem;   /* 11 tooltips/captions */
```
**Leading:** `--leading-display 1.15` · `--leading-title 1.3` · `--leading-body 1.6` · `--leading-ui 1.4` · `--leading-tight 1.25`.
**Tracking:** `--tracking-tight -0.018em` · `--tracking-normal 0` · `--tracking-wide 0.06em` · `--tracking-mono 0.02em`.

| Breakpoint | Body | Main title | Child title | Toolbar/sidebar | Meta |
|---|---|---|---|---|---|
| **Desktop 1280+** | 15px / 1.6 | serif 17 | 14.5 | 12.5–13 | 11.5 |
| **iPad 768–1024** | 14.5px / 1.55 | 16 | 14 | 12.5 | 11 |
| **Phone 375–430** | 14px / 1.5 (a11y floor) | 15.5 | 13.5 | 12 (icon-first) | 11 |

Display uses `clamp()` (fluid); most body/UI sizes **stay stable** — only leading + spacing + measure change across breakpoints (not proportional scaling of every value).

---

## E. Style-specific typography (form + type together)

- **Classic** — Plex Sans throughout, neutral; body 15/1.6; child title 14.5/600; **main title serif 17/600**. Premium *educational* card (not corporate SaaS).
- **Sticky** — Plex Sans, **lighter** (body 400, title 500), tighter leading (1.5), compact. Informality from composition + spacing + the note object form — **no handwriting font, no gimmick** (per your §11).
- **Paper** — keep small-caps + tracked title, **refined to serif** (`Source Serif 4`, `font-variant-caps: all-small-caps`, tracking 0.08em) → reads as research/reference material. Body Plex Sans 400. Scoped to Paper only (not global).
- **Highlight** — title **700** (strongest sans weight) + accent; deliberate spacing; compact metadata. Importance via weight + accent, not "everything bold."
- **Minimal** — muted ink (ink-2/muted), weight 400, relaxed leading (1.6); structure from **text hierarchy + spacing + a subtle separator** (container framing is reduced, so type carries it). Annotation feel.

---

## F. Responsive typography strategy

- **Phone (375–430):** body floor 14px / leading 1.5; main title 15.5; toolbar → **icon-first** (labels hide/overflow, `white-space:nowrap` so no two-line clickable text — gate 49); metadata 11px; titles get `overflow-wrap:anywhere; min-width:0` so long concept names wrap cleanly (gate 51). Node measure (~30–40ch at this width) stays readable with the bumped leading.
- **iPad (768–1024):** body 14.5/1.55; titles stable; sidebar 13px; balance scanability vs density.
- **Desktop (1280+):** body 15/1.6 (reading-optimized); serif main titles; more breathing room via spacing/measure, **not** by inflating every font. Display fluid via `clamp()`.

---

## G. Hallmark anti-slop checks (validation gates)

Pre-emit self-critique (≥3 each): Philosophy ✓ (educational-reading *why*) · Hierarchy ✓ (serif apex + ink ladder) · Execution ✓ (ratio scale, tokens, measure) · Specificity ✓ (Plex+Source Serif ≠ generic) · Restraint ✓ (≤5 sizes, one serif register) · Variety ✓.

Slop-test gates the new system must satisfy:
- **Gate 1** — display face not Inter/Roboto/Open Sans/etc. → **PASS** (Source Serif 4).
- **Gate 37** — ≤3 font families → **PASS** (Plex Sans + Source Serif 4 + Plex Mono).
- **Gate 38 / 38a** — no italic headers → **PASS** (all roman; emphasis via weight/serif/accent).
- **Gate 48** — every `font-family` is a token → **FIX** (tokenize; currently hardcoded).
- **Gate 49** — no two-line clickable text (toolbar/sidebar) → `white-space:nowrap` + overflow menu.
- **Gate 51** — display/title long-word wrap → `overflow-wrap:anywhere; min-width:0`.
- **Gate 55** — all-caps/small-caps display leading ≥1.0 → Paper small-caps title ≥1.0.
- `typography.md` body rules: ≥14px floor, measure 45–75ch, leading 1.5–1.65, `tabular-nums` on numerics, `font-display:swap`, no all-caps body, no gradient text.

---

## H. Exact files to change (CSS/token-level whenever possible)

| File | Change | Risk |
|---|---|---|
| `src/app/globals.css` | **Primary.** Swap `@import`s (Fontsource: IBM Plex Sans 400/500/600/700, Source Serif 4 600, IBM Plex Mono 400/500); add `--font-body/--font-display/--font-mono` + type-scale/leading/tracking tokens; retune every `font-family`/`font-size`/`font-weight`/`line-height` to tokens (gate 48); node title/body rules (serif main title, 15px/1.6 body); Paper serif small-caps; responsive type. | Med (CSS only) |
| `design.md` §2 | Amend type-scale table to the new system (fonts + sizes + leading). | Low |
| `src/lib/types.ts` | None required (type tokens aren't in `THEME_TOKENS`; font tokens aren't themeable). | — |
| `Node.tsx` / others | **None** — `.node-title-line`/`.node-body-line` already exist; all hierarchy is CSS. Content model intact. | — |

No font is loaded that isn't free (Google/Fontsource). No paid/foundry face named without licence.

---

## Decisions I need before implementing

1. **Font strategy:** (A) IBM Plex Sans + **Source Serif 4** display + Plex Mono [recommended], or (B) sans-only (Plex Sans + Cabinet Grotesque)? Or keep Inter/Sora (against Hallmark — not recommended)?
2. **Node body size bump 13.5 → 15px** (reading-optimized, nodes grow slightly taller) — confirm.
3. **Serif on main-node titles only** (child/descendant stay sans) — confirm the hierarchy-by-family approach.
4. **Paper title → serif small-caps** (research register) — confirm, or keep sans small-caps?
5. Approve the type scale + token names (D).

On approval: implement in `globals.css` (tokenized, gate-48 clean), amend `design.md` §2, then re-run slop-test gates 1/37/38/48/49/51/55 + tsc/tests/build/runtime before handoff.
