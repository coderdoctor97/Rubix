'use client';
import { useCanvasStore } from '@/lib/store';
import { X, PresentationChart } from '@phosphor-icons/react';
import { getPresentationNodes } from '@/lib/operations/presentation';

export default function PresentationBar() {
  const presentationMode = useCanvasStore(s => s.presentationMode);
  const setPresentationMode = useCanvasStore(s => s.setPresentationMode);
  const canvas = useCanvasStore(s => s.canvas);

  if (!presentationMode) return null;

  const nodes = canvas?.nodes ?? {};
  const presNodes = getPresentationNodes(nodes);
  const count = presNodes.length;

  return (
    <div className="presentation-bar ui-float" role="region" aria-label="Presentation mode">
      <div className="presentation-bar-left">
        <span className="presentation-bar-icon" aria-hidden="true">
          <PresentationChart size={16} weight="fill" />
        </span>
        <span className="presentation-bar-title">Presentation</span>
        <span className="presentation-bar-sep" aria-hidden="true">·</span>
        <span className="presentation-bar-count" aria-live="polite">
          {count === 0 ? 'No steps yet' : `${count} ${count === 1 ? 'step' : 'steps'}`}
        </span>
      </div>
      <div className="presentation-bar-right">
        <button
          className="presentation-bar-exit"
          onClick={e => { e.stopPropagation(); setPresentationMode(false); }}
          aria-label="Exit presentation mode"
          title="Exit presentation mode"
        >
          <X size={14} weight="bold" aria-hidden="true" />
          Exit
        </button>
      </div>
    </div>
  );
}
