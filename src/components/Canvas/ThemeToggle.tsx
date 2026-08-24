'use client';

import { useEffect, useState } from 'react';
import { useCanvasStore } from '@/lib/store';

export default function ThemeToggle() {
  const theme = useCanvasStore((s) => s.theme);
  const setTheme = useCanvasStore((s) => s.setTheme);
  const specialMode = useCanvasStore((s) => s.specialMode);
  const [mounted, setMounted] = useState(false);
  const isLight = theme === 'light';
  const label = isLight ? 'Switch to dark theme' : 'Switch to light theme';

  // `specialMode` is read from localStorage on the client only, so gate the
  // locked/disabled state behind hydration to avoid an SSR mismatch.
  useEffect(() => setMounted(true), []);

  const locked = specialMode && mounted;

  return (
    <div className={`toggle-switch${locked ? ' is-locked' : ''}`} onPointerDown={(e) => e.stopPropagation()}>
      <label className="switch-label" title={locked ? 'Theme is locked in Special mode' : label}>
        <input
          type="checkbox"
          className="checkbox"
          aria-label={label}
          disabled={locked}
          checked={isLight}
          onChange={(e) => setTheme(e.target.checked ? 'light' : 'dark')}
        />
        <span className="slider" />
      </label>
    </div>
  );
}
