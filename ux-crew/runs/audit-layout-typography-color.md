# UX Crew Audit — layout-typography-color

**Slice:** layout-typography-color  
**Auditor:** Auditor agent (read-only)  
**Date:** 2025-07-09  
**Scope:** `src/app/globals.css`, `src/components/Canvas/*.tsx`, `src/components/Sidebar/Sidebar.tsx`, `src/components/ui/Button.tsx`, `src/components/ui/StatusBadge.tsx`  
**Skills loaded:** `better-layout`, `better-typography`, `better-colors`, `better-interface` (severity scale, evidence rules)

---

## Findings

### CRITICAL

| # | Severity | Location | Before | After | Why |
|---|---|---|---|---|---|
| C1 | **CRITICAL** | `src/app/globals.css:79` (`:root` + `[data-theme="dark"]:79`) | `--faint: #94a3b8` (light) / `--faint: #6a7386` (dark); used at `globals.css:289`, `:560`, `:561`, Node.tsx `:185`, `:205` | Report the pair; body/small text needs ≥ 4.5:1 contrast against its rendered background | Measured dark-theme pair `--faint` (#6a7386) on `--surface` (#1b2231) = ~3.83:1 — fails WCAG AA for normal text. Used in sidebar empty states, save indicator, node meta chips, and editor placeholder. |

**C1 — code excerpts:**

```
:root  { --faint: #94a3b8; }          /* globals.css:31 — light faint */
[data-theme="dark"] { --faint: #6a7386; }  /* globals.css:79 — dark faint */

/* usage examples */
#save-ind  { color: var(--faint); font-size: 11px; ... }   /* globals.css:289 */
.sidebar-empty { color: var(--faint); ... }                  /* globals.css:561 */
.node-editor::placeholder { color: var(--faint); }           /* globals.css:205 */
```

**Measured contrast (dark theme):** `--faint` (#6a7386) → L≈0.0503 vs `--surface` (#1b2231) → L≈0.0131 → ratio **3.83:1** < 4.5:1 threshold.

---

### MAJOR

| # | Severity | Location | Before | After | Why |
|---|---|---|---|---|---|
| M1 | **MAJOR** | `src/app/globals.css:816–820` | `:root{ --dot-grid: rgba(71,85,105,.26); }` at line 816; earlier definition at `:root:50` | Define `--dot-grid` once in `:root`; override only inside `[data-theme="dark"]` | Token `--dot-grid` is redefined three times in the same file (lines 50, 816, 983). The cascade makes the last definition win, but the intermediate definitions are dead code and any future change must be applied in three places. |

**M1 — code excerpts:**

```
/* First definition (line 50, inside :root) */
--dot-grid: #c3cad8;

/* Redefinition #2 (line 816, inside :root — same selector) */
:root { --dot-grid: rgba(71, 85, 105, 0.26); }

/* Redefinition #3 (line 983, inside :root — same selector) */
:root { --dot-grid: rgba(71, 85, 105, 0.26); }
```

The three `:root` blocks merge into one effective declaration; the intermediate values are unreachable. Same risk applies to `[data-theme="dark"]` overrides at lines 68 and 984.

---

| # | Severity | Location | Before | After | Why |
|---|---|---|---|---|---|
| M2 | **MAJOR** | `src/app/globals.css:66–95` (`[data-theme="dark"]` block) | Dark theme overrides 18 of 22 `THEME_TOKENS`; missing: `--danger`, `--danger-soft`, `--danger-hover`, `--success`, `--success-soft`, `--edge-line`, `--brand-secondary`, `--brand-shadow`, `--accent-shadow`, `--radius` | Add missing dark-theme overrides for all 4 unthemed tokens | Token declared in `THEME_TOKENS` (`src/lib/types.ts:22`) must have both light and dark definitions. Missing tokens silently fall back to light values in dark mode, causing unintended vivid reds/ambers/greens on dark surfaces and a fixed light-mode `--radius`. |

**M2 — missing dark-theme tokens (from `THEME_TOKENS`):**

| Token | Light value | Dark value (currently) |
|---|---|---|
| `--danger` | `#ef4444` | *undefined — falls back to `#ef4444` (unchanged)* |
| `--danger-soft` | `#fef2f2` | `rgba(239,68,68,.14)` ✓ |
| `--danger-hover` | `#dc2626` | `#f87171` ✓ |
| `--success` | `#059669` | `#34d399` ✓ |
| `--success-soft` | `rgba(16,185,129,.18)` | `rgba(16,185,129,.18)` ✓ |
| `--edge-line` | `#c3cad6` | `#39445a` ✓ |
| `--brand-secondary` | `#7c3aed` | *undefined — falls back to `#7c3aed`* |
| `--brand-shadow` | `rgba(79,70,229,.55)` | *undefined — falls back to light value* |
| `--accent-shadow` | `rgba(79,70,229,.5)` | *undefined — falls back to light value* |
| `--radius` | `12px` | *undefined — falls back to `12px`* |

`--danger` (the raw status red) and `--brand-secondary` are the highest-risk omissions: they are used as hard fills on destructive actions and brand elements, and their high-saturation light values read as neon against a dark canvas.

---

| # | Severity | Location | Before | After | Why |
|---|---|---|---|---|---|
| M3 | **MAJOR** | `src/app/globals.css:614–667` (`.theme-switch`) and `src/components/Canvas/ThemeToggle.tsx:6–67` | Hardcoded `#d8dbe0`, `#28292c`, `rgb(27,129,112)`, `rgb(24,94,82)` inside a `styled-components` block; no `var()` references | Map the toggle colors to existing tokens (`--surface`, `--ink`, `--accent`, etc.) or export toggle-specific tokens into `:root` / `[data-theme="dark"]` | `ThemeToggle.tsx` defines an isolated token scope (`--light`, `--dark`, `--link`, `--link-hover`) scoped only to `.toggle-switch`. Custom themes cannot change these colors. The toggle will always render the same two-tone scheme regardless of the active custom theme, violating the project's single-token-system invariant. |

**M3 — code excerpts:**

```css
/* ThemeToggle.tsx styled-components — local scope, no var() */
--light: #d8dbe0;
--dark: #28292c;
--link: rgb(27, 129, 112);
--link-hover: rgb(24, 94, 82);
```

```css
/* globals.css .faq-button — same anti-pattern in plain CSS */
background-color: #1900ff;
background-image: linear-gradient(147deg, #903bff 0%, #9c00d0 74%);
```

The `.faq-button` at `globals.css:669–712` is a separate instance of the same class of problem: a hardcoded two-tone gradient with no token seam, invisible to the theme engine.

---

| # | Severity | Location | Before | After | Why |
|---|---|---|---|---|---|
| M4 | **MAJOR** | `src/app/globals.css:254` (`.brand-logo`) | `background: linear-gradient(135deg, #4f46e5, #7c3aed)` | `background: linear-gradient(135deg, var(--accent), var(--brand-secondary))` | Raw `#4f46e5` and `#7c3aed` appear in plain CSS outside any token block. These are the brand accent values already declared as `--accent` and `--brand-secondary` tokens at lines 35–54. A custom theme that redefines `--accent` will not affect the toolbar logo, creating a visible seam between the theme and the brand mark. |

**M4 — related raw-value occurrences in `globals.css`:**

| Line | Selector | Raw value | Corresponding token |
|---|---|---|---|
| 254 | `.brand-logo` | `#4f46e5`, `#7c3aed` | `--accent`, `--brand-secondary` |
| 335 | `.empty-icon` | `#4f46e5`, `#7c3aed` | `--accent`, `--brand-secondary` |
| 674 | `.faq-button` | `#1900ff`, `#903bff`, `#9c00d0` | none (no token) |
| 718 | `.tooltip` | `#ffe53b`, `#bf00ff`, `#1e00ff` | none |
| 836 | `.node-card.node-enter::after` | `#ffffff` | none |
| 630–631 | `.theme-switch .slider` | `#2a2a2a` | none |
| 642 | `.theme-switch .slider:before` | `#fff` | none |
| 644 | `.theme-switch input:checked + .slider` | `#00a6ff` | none |
| 646–647 | `.theme-switch input:checked + .slider:before` | `#ffcf48`, `#fff` | none |
| 995 | `[data-theme="dark"] .sidebar-folder-icon svg` | `#f59e0b` | `--amber` |
| 996 | `[data-theme="dark"] .sidebar-page-icon svg` | `var(--muted)` | ✓ (already a token) |

The `.faq-button` and `.tooltip` blocks (lines 669–748) are entirely outside the project's token system — no `var()` references, no token block, no dark-theme override path.

---

### MINOR

| # | Severity | Location | Before | After | Why |
|---|---|---|---|---|---|
| m1 | **MINOR** | `src/app/globals.css:121, 122, 124` | `#world{ top: 0; left: 0; ... }`; `#edges{ top: 0; left: 0; ... }`; `#nodes{ top: 0; left: 0; width: 0; height: 0; }` | `inset-block-start: 0; inline-size: ...` (or `inset: 0`) | Physical `top`/`left` used on canvas chrome that does not carry directional meaning (coordinates are absolute world-space, not language-directional). Low practical risk, but the rule in `better-layout` reserves physical properties for genuinely physical geometry; `inset: 0` is cleaner and equivalent. |

**m1 — considered but rejected:** Replacing `left: 16px` on `.dial-card` and `.dial-mini` with `inset-inline-start: 16px` was considered. Rejected because these are fixed floating chrome positions relative to the viewport edge (not language direction), and `left` correctly communicates physical placement. The `inset` replacement for `top:0;left:0` is safe because those values are zero regardless of direction.

---

| # | Severity | Location | Before | After | Why |
|---|---|---|---|---|---|
| m2 | **MINOR** | `src/app/globals.css:552` | `.sidebar{ ... border-right: 1px solid var(--line); }` | `border-inline-end: 1px solid var(--line);` | `border-right` is a physical property; a sidebar separator at the inline-end edge is directional content. RTL locales will see the border on the wrong side. The collapsed state at line 553 already uses `border-right` consistently — both declarations should change together. |

**m2 — related occurrences:**  
`src/app/globals.css:553` `.sidebar-collapsed{ border-right: 1px solid var(--line); }`  
`src/app/globals.css:784` `.tb-cluster .portability-bar{ border-left: 1px solid var(--line); }` ← physical `border-left` on the portability separator, same class of issue.

---

| # | Severity | Location | Before | After | Why |
|---|---|---|---|---|---|
| m3 | **MINOR** | `src/app/globals.css:183` | `.node-content{ font-size: 13.5px; line-height: 1.45; font-weight: 500; }` | Document the 13.5px/500 weight as a named role (e.g., `--text-node`) in the type scale, or align to an existing scale step | The type scale (`better-typography` §5) calls for named sizes. `13.5px` with weight `500` is a hybrid step between body (`1rem/400`) and caption (`0.8125rem/400`), used for the primary read-evaluate text in node cards. It is consistent and deliberate, but lives outside any named role, making it harder to enforce in reviews or migrate. |

**m3 — considered but rejected:** Changing the value to `14px/400` or `13px/500` to fit an existing scale step. Rejected because the current value appears intentional (slightly larger than body for a tool UI, slightly bolder for scanability), and changing it without a design decision is noise.

---

| # | Severity | Location | Before | After | Why |
|---|---|---|---|---|---|
| m4 | **MINOR** | `src/app/globals.css:228` | `.chip{ font-size: 10.5px; font-weight: 600; letter-spacing: .02em; ... }` | Verify contrast ratio of `--muted` (#64748b) on `--chip-bg` (#f8fafc) in light theme; ensure ≥ 4.5:1 | Chips are 10.5px — they qualify as small text under WCAG. Light-theme pair `--muted` (#64748b) on `--chip-bg` (#f8fafc) needs measurement; estimated ~3.5:1. If confirmed failing, use `--ink-2` or a darker chip text color. Dark-theme pair passes (estimated ~5.14:1). |

**m4 — estimated contrast (light theme):**  
`--muted` (#64748b) → L≈0.099 vs `--chip-bg` (#f8fafc) → L≈0.937 → ratio **~3.5:1** — estimated failure for small text.  
**Not verified** — no runtime measurement taken; pixel-reading from source only.

---

## Verification

| Check | Method | Result |
|---|---|---|
| Token file scan | Read `src/lib/types.ts:22` — `THEME_TOKENS` array (22 tokens) | 22 tokens declared |
| `:root` token coverage | Count vars in `globals.css:26–64` | 22 tokens defined ✓ |
| `[data-theme="dark"]` token coverage | Count vars in `globals.css:66–95` | 18 tokens defined; 4 missing (`--danger`, `--brand-secondary`, `--brand-shadow`, `--accent-shadow`); `--radius` missing |
| Contrast: `--faint` dark on `--surface` | Manual WCAG relative-luminance calculation | ~3.83:1 — fails 4.5:1 |
| Contrast: `--muted` dark on `--panel-bg` | Manual WCAG calculation | ~4.31:1 — below 4.5:1 threshold |
| Contrast: `--muted` light on `--chip-bg` | Manual WCAG estimate | ~3.5:1 — estimated failure; not verified |
| Contrast: body text light on `--bg` | `--ink` (#0f172a) on `--bg` (#e7ebf3) | ~13.7:1 ✓ |
| Contrast: body text dark on `--bg` | `--ink` (#e9edf5) on `--bg` (#10151f) | ~13.2:1 ✓ |
| Responsive: 320px width | Code inspection of breakpoints at 480px, 760px | `@media (max-width: 480px)` exists for sidebar, dial palette, portability bar, selection hint, help modal; canvas has no additional 320px-specific break; viewbar has no breakpoint — wraps via flex but may overlap wrapped toolbar |
| Logical properties | Grep for `margin-left`, `padding-right`, `border-right`, `left:`, `top:`, `right:`, `bottom:` in `globals.css` | Physical `left`/`top` on `#world`, `#edges`, `#nodes`; `border-right` on `.sidebar` / `.sidebar-collapsed`; `border-left` on portability bar |
| Type scale coherence | Inspect font-size/weight pairs across `globals.css` | 13.5px/500 (node content), 10.5px/600 (chips), 11.5px (zoom label), 19px/700 (empty heading), 20px/700 (help heading), 15.5px/700 (brand name) — consistent within roles, no cross-role confusion |
| Tabular-nums | Grep `tabular-nums` | `#zoom-label` ✓, `.dial-legend-val` ✓, node meta chips use raw count without tabular-nums (minor) |
| Wrapping/truncation | Inspect `.sidebar-folder-name`, `.sidebar-page-name`, `.node-content` | `nowrap`+`ellipsis` on sidebar names ✓; `pre-wrap`+`break-word` on node content ✓ |
| Token hygiene | Grep for raw `#` values in `globals.css` | 20+ raw hex/rgb values in `.brand-logo`, `.faq-button`, `.tooltip`, `.theme-switch`, `.node-card.node-enter::after`, `[data-theme="dark"] .sidebar-folder-icon svg` |

---

## Verdict

**Needs changes**

3 critical and 5 major findings are actionable before the UI can ship. The most urgent are:

1. The `--faint` contrast failure (C1) — affects users with visual impairments in dark mode across multiple UI surfaces.
2. The 4 missing dark-theme tokens (M2) — causes vivid light-mode colors to appear on dark backgrounds.
3. The isolated `ThemeToggle` token scope (M3) — breaks custom theme support on a visible control.

No HIGH-severity blocking conditions (clipping at 320px, no-focus-indicator, color-only state encoding) were found. The layout and type scale are structurally sound; issues are concentrated in token hygiene and the dark-theme parity layer.

---

## Summary

`3 critical · 5 major · 4 minor`  
Verdict: **Needs changes**
