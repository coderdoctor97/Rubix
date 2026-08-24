# Texture assets — attribution & licenses

## `paper-grain.svg`

- **Source:** Magic UI — `NoiseTexture` component
  - Docs: https://magicui.design/docs/components/noise-texture
  - Repository: https://github.com/magicuidesign/magicui
  - Original source: `apps/www/registry/magicui/noise-texture.tsx`
- **License:** **MIT** — confirmed via GitHub License API
  (`spdx_id: MIT`, https://github.com/magicuidesign/magicui/blob/main/LICENSE.md).
  Copyright (c) Magic UI. MIT permits use, copy, modify, merge, publish,
  distribute, sublicense, and/or sell without restriction, with the notice
  preserved in substantial copies.
- **Adaptation:** This file is a standalone, retuned derivative of Magic UI's
  `feTurbulence` grain technique. Magic UI's React component is **not** bundled;
  only a self-contained SVG turbulence pattern, retuned for fine paper grain
  (anisotropic frequency, low octaves, seamless `stitchTiles` tiling) and used as
  a purely decorative CSS background overlay. All intensity/blend/tint is applied
  via CSS at the consumption site.
- **License of derivative:** Inherits MIT (the underlying technique is MIT-licensed);
  the retuned SVG file is released under MIT consistent with the source.
