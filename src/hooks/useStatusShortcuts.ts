'use client';
import { useEffect } from 'react';
import { useCanvasStore } from '@/lib/store';

// Status shortcuts 1/2/3/0 have been disabled per cleanup task.
// This hook now only handles Esc to deselect — no longer registers 1/2/3/0.
// No global listener reacts to 1/2/3/0 in any context (typing, dialogs, menus, presentation mode).
export default function useStatusShortcuts() {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const { selectedNodeIds, editingId, clearSelection } = useCanvasStore.getState();
      if (editingId !== null) return;
      const active = document.activeElement as HTMLElement | null;
      if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable)) return;
      if (document.querySelector('[role="dialog"], .modal-overlay, .help-overlay, .theme-manager-overlay, .export-modal-overlay, .portability-modal-overlay')) return;
      if (e.key === 'Escape') {
        if (selectedNodeIds.length > 0) {
          e.preventDefault();
          clearSelection();
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);
}

