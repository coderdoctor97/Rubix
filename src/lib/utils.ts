// Minimal `cn` helper — joins truthy class names with a space.
// The project styles via plain CSS in `src/app/globals.css`, so a light
// dependency-free merge is all we need (no clsx / tailwind-merge required).
export type ClassValue = string | number | null | false | undefined;

export function cn(...inputs: ClassValue[]): string {
  return inputs.filter(Boolean).join(' ');
}
