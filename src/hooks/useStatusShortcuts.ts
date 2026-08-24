'use client';
import { useEffect } from 'react';
import { useCanvasStore } from '@/lib/store';
import type { Status } from '@/lib/types';

// Original Synapse marking system — restored, not redesigned:
//   1 → failed (red) · 2 → review (amber) · 3 → mastered (green) · 0 → clear (none)
// These are direct status assignments, NOT presentation order.
// Guards ensure typing 1230 inside editor remains text input.
export default function useStatusShortcuts() {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Never interfere with browser/system chords
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      const { selectedNodeIds, editingId, setNodeStatus, clearSelection } = useCanvasStore.getState();

      // Guard: editing a node → keys are text
      if (editingId !== null) return;

      // Guard: typing in any input/textarea/contentEditable (including Tiptap ProseMirror)
      const active = document.activeElement as HTMLElement | null;
      if (active) {
        const tag = active.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || active.isContentEditable) return;
        // Tiptap ProseMirror may not be activeElement itself but contains selection
        if (active.closest?.('.ProseMirror, .node-editor-wrap, .rt-floating-toolbar')) return;
      }

      // Guard: any modal/dialog/help/theme manager open
      if (
        document.querySelector(
          '[role="dialog"], .modal-overlay, .help-overlay, .theme-manager-overlay, .export-modal-overlay, .portability-modal-overlay'
        )
      )
        return;

      // Esc deselects when not editing and no modal
      if (e.key === 'Escape') {
        if (selectedNodeIds.length > 0) {
          e.preventDefault();
          clearSelection();
        }
        return;
      }

      // Direct status map — original semantics, not presentation steps
      const map: Record<string, Status> = { '1': 'failed', '2': 'review', '3': 'mastered', '0': 'none' };
      const status = map[e.key];
      if (!status) return;
      if (selectedNodeIds.length === 0) return;

      e.preventDefault();
      selectedNodeIds.forEach((id) => setNodeStatus(id, status));
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);
}
