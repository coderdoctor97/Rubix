'use client';
import { useEffect, useCallback, useState } from 'react';
import { useCanvasStore } from '@/lib/store';
import { serializeCanvas } from '@/lib/portability';
import { exportCanvasPng } from '@/lib/exportPng';
import { exportCanvasPdf } from '@/lib/exportPdf';
import { ImageSquare, FileCode, FilePdf } from '@phosphor-icons/react';

type PdfState = 'idle' | 'exporting' | 'done' | 'error';

function JsonIcon() {
  return (
    <FileCode size={20} weight="regular" aria-hidden="true" />
  );
}

export default function ExportModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const canvas = useCanvasStore(s => s.canvas);
  const [pdfState, setPdfState] = useState<PdfState>('idle');

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

  const onExportPdf = useCallback(async () => {
    if (pdfState === 'exporting') return; // prevent accidental double-export
    setPdfState('exporting');
    try {
      await exportCanvasPdf();
      setPdfState('done');
      window.setTimeout(() => { setPdfState('idle'); onClose(); }, 950);
    } catch {
      // stay open so the user can retry; never leave the UI stuck "loading"
      setPdfState('error');
    }
  }, [pdfState, onClose]);

  // Reset transient PDF feedback whenever the modal is (re)opened.
  useEffect(() => { if (!open) setPdfState('idle'); }, [open]);

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
          <button
            className={`export-option-card${pdfState === 'exporting' ? ' is-busy' : ''}${pdfState === 'done' ? ' is-done' : ''}${pdfState === 'error' ? ' is-error' : ''}`}
            onClick={onExportPdf}
            disabled={pdfState === 'exporting' || pdfState === 'done'}
            aria-busy={pdfState === 'exporting'}
          >
            <div className="export-option-icon">
              {pdfState === 'exporting'
                ? <span className="export-spinner" role="status" aria-label="Exporting PDF" />
                : <FilePdf size={24} weight="duotone" color="var(--on-accent)" />}
            </div>
            <div className="export-option-text">
              <span className="export-option-label">
                {pdfState === 'exporting' ? 'Exporting PDF…' : pdfState === 'done' ? 'PDF exported' : pdfState === 'error' ? 'PDF export failed' : 'Export as PDF'}
              </span>
              <span className="export-option-sub">
                {pdfState === 'exporting'
                  ? 'Rendering the full canvas…'
                  : pdfState === 'done'
                    ? 'Your download has started.'
                    : pdfState === 'error'
                      ? 'Something went wrong. Tap to try again.'
                      : 'Best for a fixed, shareable snapshot of the whole canvas.'}
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
