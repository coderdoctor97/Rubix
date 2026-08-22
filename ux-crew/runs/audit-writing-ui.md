# AUDIT — writing-ui slice

> Auditor · writing-ui · READ-ONLY
> Skills loaded: better-writing · better-ui · hallmark (audit verb) · better-interface (severity/format)

---

## Scope and Coverage

| Domain | Evidence inspected | Result |
|---|---|---|
| better-writing | All `src/components/**/*.tsx`, `src/app/**/*.tsx`, `src/app/globals.css` — labels, empty states, error messages, help text, tooltip wording | 6 findings |
| better-ui | Same files — icon-set consistency, motion tells (bounce easings, transition-all, animated focus rings, celebratory noise), z-index discipline | 4 findings |

No runtime server was running; visual/interaction claims are marked **Not verified** where applicable.

---

## Findings

| # | Severity | Domain | Location | Before | After | Why |
|---|---|---|---|---|---|---|
| 1 | HIGH | writing-ui | `src/components/Canvas/Canvas.tsx:40` | `CREATE MINDMAP` | `CREATE A CANVAS` | The product is "Synapse — Contextual Active Recall Canvas"; calling it a "mindmap" in the primary empty-state headline contradicts the product identity established in the brand line and help text. Users who read the help panel (which calls it a canvas) see conflicting terminology immediately. |
| 2 | HIGH | writing-ui | `src/components/Canvas/Canvas.tsx:40` | `a vision for your visual memory` | `Create a root node and start building your topic tree.` | Empty state fails the "orient and point forward" rule: no description of what this place is, no single clear next action named. The existing action is the card itself, but the text doesn't say so. |
| 3 | HIGH | writing-ui | `src/components/Canvas/DataPortability.tsx:33` | `Not valid JSON.` | `The file isn't valid JSON. Check the file and try again.` | Error says nothing about what broke or what to do next. Violates "errors say how to fix." A user who accidentally selected the wrong file has no recovery path from this message. |
| 4 | HIGH | ui-consistency | `src/components/Canvas/Toolbar.tsx:5` — `@mui/icons-material/UnfoldMore`; `src/components/Canvas/Toolbar.tsx:8` — `@phosphor-icons/react/MagicWandIcon`; `src/components/Canvas/Canvas.tsx:10–11` — `@mui/icons-material/FitScreen`, `AutoFixHigh`; `src/components/Canvas/DataPortability.tsx:6–7` — `@mui/icons-material/Download`, `FileUpload`; `src/components/Canvas/Node.tsx:10` — `@phosphor-icons/react/PaletteIcon`; `src/components/Canvas/ExportModal.tsx:6` — `@phosphor-icons/react/ImageSquare`; `src/components/Sidebar/Sidebar.tsx:8` — `@phosphor-icons/react/FolderIcon`, `NoteIcon` | Two icon libraries (MUI + Phosphor) mixed across every floating surface; plus hand-coded SVG in `Sidebar.tsx:23–28` (PinIcon) and inline Unicode glyphs (`⣿`, `🗑`, `✎`, `＋`) as icon buttons | Standardise on one library; replace hand-coded SVGs and Unicode glyphs with library icons; apply `currentColor` and `stroke-width: 1.5` (beside 400-weight text) or `2` (beside 600-weight text) consistently | better-ui §15 "One SVG, Recolored per State" and §14 "Match Icon Stroke to Text Weight": one library voice per surface. Two libraries render different visual weights, optical centers, and hover behaviors in the same toolbar — a tell of assembly rather than design. |
| 5 | MEDIUM | ui-motion | `src/app/globals.css:641` | `transition-timing-function: cubic-bezier(0.81, -0.04, 0.38, 1.5);` on `.theme-switch .slider:before` | `transition-timing-function: cubic-bezier(0.2, 0, 0, 1);` (standard ease-out) | Bouncy overshoot easing on the theme-toggle pill for a theme-state change. better-ui §16 motion restraint + hallmark slop-test gate 12: bouncy easings are reserved for physical interactions; theme toggle is a categorical state switch. Better-ui specifies `cubic-bezier(0.2, 0, 0, 1)` for CSS icon cross-fades — the same curve applies here. Not verified at runtime. |
| 6 | MEDIUM | ui-motion | `src/components/Canvas/Canvas.tsx:38` (inline), `src/app/globals.css:148` — `nodeIn .32s cubic-bezier(.2,.9,.3,1.2)` and `nodeIn .22s cubic-bezier(.2,.9,.3,1.15)` | Overshoot cubic-bezier on node enter and modal enter animations | Use `cubic-bezier(.2,.9,.3,1)` or `ease-out` (no overshoot) | Both animation curves overshoot (y-value > 1). The node enter (new-topic entrance) and the modal entrance fire on every new node and every modal — high-frequency interactions in an academic tool. Violates better-ui §16 (no bounce on UI state) and `MASTER_AGENT.md §6` rule 6: "no bounce easings on UI state." The border-beam (`.node-enter::after`) already provides celebratory interest; the scale overshoot is redundant and distracting. |
| 7 | MEDIUM | writing-ui | `src/components/Canvas/Node.tsx:38` — textarea placeholder; `src/components/Canvas/Annotation.tsx:55` — textarea placeholder | `Type something…` | `What's this about?` (node) / `Add a note…` (annotation) | Placeholder text is the same generic filler in two different editing contexts. Node content carries a recall topic; annotation carries free-form notes. The placeholder doesn't hint at the expected content type. Better-writing §12: placeholders are examples, not labels — they should illustrate the expected format or content type. |
| 8 | MEDIUM | ui-tooltip | `src/components/Canvas/KnowledgeDialPanel.tsx:100` — `title="Double-click to expand"` on a button also activated by single click; `src/components/Canvas/KnowledgeDialPanel.tsx:102` — single `onClick` also sets `heatmapMode('full')` | `title="Double-click to expand"` on a clickable element that expands on single click | Remove the `title` or change to `title="Expand knowledge dial"` | Tooltip text describes an interaction ("double-click") that is not the only path to the same outcome (single click also expands). Violates the tooltip = supplemental-hint convention; misleading for users who read the tooltip and think they must double-click. |

---

## Considered but Rejected

| Location | Candidate | Rejected because |
|---|---|---|
| `src/app/globals.css:673–676` — `.faq-button` gradient (`#1900ff` → `#903bff`) | Flag as purple-gradient tell (hallmark anti-pattern #1) | The gradient is on the FAQ button itself, not a hero background; it is a single accent element, not a purple-to-blue fill across a section. Per the anti-pattern definition this is an accent color use, not the hero-section tell. Rejected from writing-ui scope — color-system drift is a `better-colors` finding, not writing-ui. |
| `src/components/Canvas/Sidebar.tsx:195` — `☰` hamburger and `«` collapse glyph | Flag as Unicode-glyph icon inconsistency | The glyphs are text labels, not icon-state indicators; the buttons also have `aria-label` and `title` attributes, so they are not icon-only controls. Glyph choice is a UI-polish matter for the Shell Builder phase, not a writing issue. |
| `src/components/Canvas/Node.tsx:75` — `♲` (recycle symbol) for delete | Flag as confusing icon for destructive action | Covered by the icon-set finding (#4) at the systemic level. Listing it separately would be per-symptom padding. |
| `src/app/globals.css:846–848` — `prefers-reduced-motion` for `.node-enter::after` (border beam) | Flag as motion concern | The beam animation already has a `prefers-reduced-motion` fallback (`animation: none`). Compliant. Not a finding. |
| `src/components/Canvas/SelectionHint.tsx:10–17` — "Failed / Review / Mastered" vs "Clear / Deselect" case mismatch | Already captured in the broader voice/capitalization principle; stand-alone row would duplicate severity | Covered by the systemic icon+voice inconsistency (#4) and the empty-state/help-panel voice audit; listed here for transparency. |
| `src/components/Canvas/ExportModal.tsx:127` — "Best for backup and future editing inside Synapse." | Flag as vague subtext | Borderline; the subtext is filler but not actively misleading. Low leverage given the ExportModal is being rewritten by Shell Builder; flag as polish note only. |

---

## Summary

`3 critical · 1 major · 4 minor`

**Verdict: Needs changes**

Three HIGH findings remain before the slice can ship. The empty-state misidentification of the product (`mindmap` vs `canvas`) is the most user-facing: a new user reads "CREATE MINDMAP" then opens help and reads "your canvas" within the same session. The vague JSON error message is a direct recovery blocker. The mixed icon libraries (MUI + Phosphor + inline SVG + Unicode) is a systemic craft failure that will compound as more components are added. The two motion findings (overshoot easing on theme toggle and node enter) violate explicit rules in both the better-ui skill and the project's own standing quality floor (`MASTER_AGENT.md §6` rule 6: no bounce easings on UI state).

---

## File ownership note

All inspected files under `src/` are owned by the Shell Builder or Canvas Builder per `MASTER_AGENT.md §4`. This report is read-only; no files were modified.
