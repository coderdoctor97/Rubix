'use client';
import { useEffect, useCallback } from 'react';
import { useCanvasStore } from '@/lib/store';
import { serializeCanvas } from '@/lib/portability';
import { exportCanvasPng } from '@/lib/exportPng';
import { ImageSquare, FileCode } from '@phosphor-icons/react';

function JsonIcon() {
  return (
    <FileCode size={20} weight="regular" aria-hidden="true" />
  );
}

export default function ExportModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const canvas = useCanvasStore(s => s.canvas);

  const onExportJson = useCallback(() => {
    if (!canvas) return;
    const json = serializeCanvas(canvas);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const safeName = canvas.name.trim().replace(/[^a-zA-Z0-9._-]+/g, '_').replace(/_+/g, '_').replace(/^_+|_+$/g, '') || 'canvas';
    a.download = `${safeName}.synapse.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    onClose();
  }, [canvas, onClose]);

  const onExportPng = useCallback(async () => {
    try {
      await exportCanvasPng();
    } catch {
      // silent — same behavior as DataPortability PNG error path
    }
    onClose();
  }, [onClose]);

  // Escape key closes modal
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="modal-overlay export-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-modal-title"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      onPointerDown={e => e.stopPropagation()}>
      <div className="modal-card export-modal-card"
        onClick={e => e.stopPropagation()}
        onPointerDown={e => e.stopPropagation()}>
        <h3 id="export-modal-title">Export canvas</h3>
        <p className="export-modal-sub">Choose a format to export your current canvas.</p>
        <div className="export-options">
          <button className="export-option-card" onClick={onExportJson}>
            <div className="export-option-icon" style={{ color: 'var(--ink)' }}>
              <JsonIcon />
            </div>
            <div className="export-option-text">
              <span className="export-option-label">Export as JSON</span>
              <span className="export-option-sub">Best for backup and future editing inside Synapse.</span>
            </div>
          </button>
          <button className="export-option-card" onClick={onExportPng}>
            <div className="export-option-icon">
              <ImageSquare size={24} weight="duotone" color="var(--on-accent)" />
            </div>
            <div className="export-option-text">
              <span className="export-option-label">Export as PNG</span>
              <span className="export-option-sub">Best for embedding into PPT, PDF, documents, and notes.</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
