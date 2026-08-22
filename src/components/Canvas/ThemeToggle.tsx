'use client';

import { useCanvasStore } from '@/lib/store';

export default function ThemeToggle() {
  const theme = useCanvasStore((s) => s.theme);
  const setTheme = useCanvasStore((s) => s.setTheme);
  const isLight = theme === 'light';
  const label = isLight ? 'Switch to dark theme' : 'Switch to light theme';
  return (
    <div className="toggle-switch" onPointerDown={(e) => e.stopPropagation()}>
      <label className="switch-label" title={label}>
        <input
          type="checkbox"
          className="checkbox"
          aria-label={label}
          checked={isLight}
          onChange={(e) => setTheme(e.target.checked ? 'light' : 'dark')}
        />
        <span className="slider" />
      </label>
    </div>
  );
}
