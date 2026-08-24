# SYNAPSE — Paper / Material Texture Proposal

> **Status: DRAFT — awaiting approval. Asset is fetched & licensed; CSS NOT wired yet.**
> Authority: loaded **Hallmark** skill (material surfaces, restraint, anti-slop).
> The chosen asset is already downloaded into the project with its license recorded
> (see `public/textures/`). This document proposes **how** it will be applied.
> STOP before implementation per your instruction.

---

## A. Search results (real, licensed candidates)

| # | Source | Asset | License | Type | Fits Synapse? |
|---|---|---|---|---|---|
| 1 | **Magic UI** — `NoiseTexture` ([docs](https://magicui.design/docs/components/noise-texture), [repo](https://github.com/magicuidesign/magicui)) | SVG `feTurbulence` (fractalNoise → desaturate → linear slope, `stitchTiles`) | **MIT** (GitHub License API `spdx_id: MIT`) | tiny seamless SVG grain | ✅ **Chosen** — organic Perlin = paper-fiber character (not a mechanical pattern), sub-1 KB, seamless tile, theme-able via CSS |
| 2 | [CC0 Textures — Paper 001](https://cc0-textures.com/t/cc0t-paper-001) | photographic paper PBR | Public Domain (CC0) | 4K raster | ❌ heavy (MBs), raster tiling seams, white-speckle problem in dark (your §12) |
| 3 | [transparenttextures.com](https://www.transparenttextures.com) | tileable PNGs | CC0 | ~small raster PNG | ◻ viable but raster + dark-theme speckling; less crisp than SVG |
| 4 | [Deckle](https://github.com/YellowFoxH4XOR/deckle) | macOS paper overlay (256px tiles) | MIT | raster (app) | ❌ not a web asset |
| 5 | alexmwalker gist (SVG paper filters) | FEBlend+turbulence | unclear (gist) | SVG | ❌ license unclear → rejected |

---

## B. Recommended asset — **Magic UI NoiseTexture (MIT)**, adapted

**Why:** it's the only candidate that is (a) from a reputable named UI source you cited, (b) clearly **MIT**, (c) a **tiny seamless SVG** (organic Perlin grain, not a flat noise pattern), and (d) fully **theme-able via CSS** — so a single asset serves light + dark without the white-speckle raster problem.

**What I fetched & verified:**
- Source component: `apps/www/registry/magicui/noise-texture.tsx` (retrieved).
- License: GitHub License API → `LICENSE.md`, **`spdx_id: MIT`**, "Copyright (c) Magic UI."
- Local derivative created: **`public/textures/paper-grain.svg`** (retuned: fine anisotropic grain `baseFrequency="0.82 0.6"`, `numOctaves="2"`, `seed="7"`, `stitchTiles="stitch"` → fiber-like, restrained, seamless).
- Attribution recorded: **`public/textures/ATTRIBUTION.md`** (Magic UI source + MIT + adaptation note).

The actual bundled SVG:
```svg
<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">
  <filter id="paper-grain">
    <feTurbulence type="fractalNoise" baseFrequency="0.82 0.6" numOctaves="2" seed="7" stitchTiles="stitch" result="n"/>
    <feColorMatrix type="saturate" in="n" values="0"/>
  </filter>
  <rect width="100%" height="100%" filter="url(#paper-grain)"/>
</svg>
```

---

## C. Canvas treatment

Layer order (your §5): **canvas colour → paper grain → dot grid → accent atmosphere → knowledge objects.**

- The dot grid currently lives on `#viewport`'s own background (JS-controlled size/position), so a pseudo can't cleanly sit *beneath* it. To honor "texture **behind** the grid," the implementation will move the dot grid onto a dedicated `#grid` layer, with the grain on a `#paper` layer below it:
  - `#paper`: `paper-grain.svg` tiled, `mix-blend-mode: multiply`, **~4% opacity** (light) — a faint archival-board feel.
  - `#grid` (existing dots) sits above the grain → grid stays readable.
- Dark theme: lower opacity (~2.5%) + `mix-blend-mode: soft-light` so it reads as fibre, not white speckle.
- The grid, atmosphere, and nodes are otherwise unchanged.

---

## D. Node treatment — texture hierarchy (intensity, never the main hierarchy)

A presentational grain layer per node (`.node-grain`, `pointer-events:none`, behind text), with `--grain` opacity tuned per style. Rationale for CSS-only control without pseudo conflicts (the card's `::before`/`::after` are used by the magnet ring, sticky dog-ear, and entrance glow).

| Surface | Grain opacity (light) | Notes |
|---|---|---|
| **Canvas** | ~4% | warm board |
| **Minimal** | ~0–2% | almost invisible — structure carries it |
| **Classic** | ~5% | fine paper grain |
| **Child (Classic)** | ~5% | same as Classic |
| **Main** | ~7% | slightly richer than child — primary card |
| **Sticky** | ~8% + warm multiply | most tactile, on the cream |
| **Paper** | ~10% | most visible — document/research sheet |
| **Highlight** | ~3% | kept low so the highlight mark stays readable |

Blend: `multiply` in light (ink-on-paper speckle), `soft-light` in dark (fibre catches light), at lower dark opacity. Hierarchy **Main > Child > Descendant** is unchanged (elevation/type/ink still lead; grain only reinforces).

---

## E. Light / dark behavior

**One neutral-grey asset**, adapted purely in CSS (no second file needed):
- **Light:** `mix-blend-mode: multiply`, warm-board opacity (3–10% by surface). The grey noise darkens the warm paper subtly = fine grain.
- **Dark:** `mix-blend-mode: soft-light`, **~60% of light opacity**. soft-light avoids hard white speckles; fibres read as gentle light catch-up. Reduced contrast preserves readability (your §12).
- `prefers-reduced-motion`: grain is static (no change needed); nothing animates.

---

## F. Performance

- **Asset size:** `paper-grain.svg` ≈ 400 bytes; one file, served from `/textures/paper-grain.svg` (local — no runtime hotlink).
- **Render cost:** `feTurbulence` is rasterised once per element and cached by the browser; tiled via `background-repeat`. Static (no per-frame work). A 200 px seamless tile keeps GPU cost negligible.
- **Implementation:** background-image + `mix-blend-mode` on thin layers; `pointer-events:none`; `aria-hidden`. No large raster, no animated texture layers (your §13).

---

## G. Hallmark validation plan

- **Material, not decoration (§17/§18):** first impression must be *"tactile/physical,"* not *"there's a texture overlay."* Gate: if grain is noticed before content → reduce opacity. Tunable per-surface so I can dial it down post-review.
- **Restraint / anti-slop:** no skeuomorphic simulator, no heavy photo, no gradient faking; warm system reinforced (cream + brown + muted materials); **no blue/neon/purple reintroduced.**
- **Hierarchy preserved:** grayscale/desaturate test still passes — the five object forms remain distinguishable; grain never becomes the hierarchy.
- **Accessibility (§15):** purely decorative — `pointer-events:none`, `aria-hidden`, behind/beside text; does **not** reduce text contrast (kept well under the threshold that affects WCAG ratios), never the sole state indicator.
- **Consistency:** one grain source, one warm treatment family across canvas + all node materials.

---

## Decisions I need before wiring the CSS

1. **Approve Magic UI (MIT) → `paper-grain.svg`** as the texture source (asset + attribution already in `public/textures/`)?
2. **Approve the layer plan:** dedicated `#paper` + `#grid` layers so grain sits *behind* the dots; per-node `.node-grain` presentational element (small TSX addition, presentational only) for per-style intensity?
3. **Approve the intensity table (D)** — I can tune any value after you see it live.
4. Confirm: one neutral asset + CSS blend per theme (no separate dark file) — acceptable?

On approval: wire the CSS (canvas layers + node grain + theme blend) keeping everything else intact, then run the Hallmark restraint check + the desaturate/hierarchy test + tsc/tests/build/runtime.
