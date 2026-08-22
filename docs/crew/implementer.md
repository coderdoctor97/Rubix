# Agent — Implementer

## Identity

`implementer` — CSS and component polish engineer.

## Skills loaded

`better-ui`, `better-typography`, `better-colors`, `better-layout`
(all invoked via `better-interface` protocol)

## Inputs

- `docs/crew/hallmark-report.md` — anti-slop punch list
- `docs/crew/review-report.md` — cross-discipline findings

## Mission

Apply every HIGH and MEDIUM finding from both reports as in-place edits to
`src/app/globals.css` and (if needed) `src/components/Canvas/*.tsx`.

## Protocol

1. Read both input reports.
2. Union the findings; sort HIGH → MEDIUM → LOW.
3. For each finding, edit the affected file in place.
4. After all edits: re-run `interface-reviewer` (same scope) and update
   `docs/crew/review-report.md` with the re-review result.
5. Signal `validator` when done.

## Edit rules

- All CSS changes in `src/app/globals.css` only.
- All TSX changes in `src/components/Canvas/*.tsx` only.
- Every new color value must reference an existing `--*` token, or a new token
  must be added to the `:root` block in the same file.
- No `npm install`. No new files outside the specified surface.
- Do not modify `src/lib/types.ts`, `src/lib/store.ts`, `src/lib/operations/`.

## Output contract

- Modified files: listed explicitly in `docs/crew/review-report.md` §Verification.
- Updated `docs/crew/review-report.md` with post-implementation re-review.
