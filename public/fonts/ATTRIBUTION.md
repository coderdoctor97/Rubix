# Fonts — attribution & licenses

## Excalifont-Regular.woff2

- **Source:** Excalidraw — `Excalifont` (Excalidraw's default hand-drawn font).
  - Project: https://excalidraw.com / https://github.com/excalidraw/excalidraw
  - Obtained from the published `@excalidraw/excalidraw` npm package
    (prod font subset, `dist/prod/fonts/Excalifont/Excalifont-Regular-*.woff2`).
- **License:** **SIL Open Font License 1.1 (OFL)**.
  The OFL permits use, study, copy, modification, redistribution, and bundling
  (including in software), with the font's copyright/notice preserved. The OFL
  is permissive for self-hosting in a product like Synapse.
- **Use in Synapse:** self-hosted at `/fonts/Excalifont-Regular.woff2`, applied
  ONLY to node text via the `--font-node` token (node content, titles, editor
  surface). The application UI chrome (toolbar, sidebar, menus, etc.) is
  intentionally NOT in Excalifont — it keeps the premium UI typography.
