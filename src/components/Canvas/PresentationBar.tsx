'use client';
import { useCanvasStore } from '@/lib/store';
import { X, PresentationChart, Trash, CaretLeft, CaretRight } from '@phosphor-icons/react';
import { getPresentationNodes, formatPresentationOrder } from '@/lib/operations/presentation';
import { useState } from 'react';

function truncateTitle(content: string): string {
  const first = content.split('\n')[0]?.trim() || '';
  if (!first) return 'Untitled';
  return first.length > 24 ? first.slice(0, 24) + '…' : first;
}

export default function PresentationBar() {
  const presentationMode = useCanvasStore(s => s.presentationMode);
  const setPresentationMode = useCanvasStore(s => s.setPresentationMode);
  const canvas = useCanvasStore(s => s.canvas);
  const removeFromPresentation = useCanvasStore(s => s.removeFromPresentation);
  const reorderPresentation = useCanvasStore(s => s.reorderPresentation);
  const selectNode = useCanvasStore(s => s.selectNode);
  const [dragId, setDragId] = useState<string | null>(null);

  if (!presentationMode) return null;

  const nodes = canvas?.nodes ?? {};
  const presNodes = getPresentationNodes(nodes);
  const count = presNodes.length;

  const onDragStart = (id: string) => setDragId(id);
  const onDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!dragId || dragId === targetId) return;
  };
  const onDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!dragId || dragId === targetId) return;
    const targetIdx = presNodes.findIndex(n => n.id === targetId);
    if (targetIdx === -1) return;
    reorderPresentation(dragId, targetIdx);
    setDragId(null);
  };

  return (
    <div className="presentation-bar ui-float" role="region" aria-label="Presentation mode">
      <div className="presentation-bar-main">
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
      {count > 0 ? (
        <div className="presentation-path-strip" aria-label="Presentation path">
          <div className="presentation-path-scroll">
            {presNodes.map((node, idx) => (
              <div
                key={node.id}
                className={`presentation-path-pill ${dragId === node.id ? 'is-dragging' : ''}`}
                draggable
                onDragStart={() => onDragStart(node.id)}
                onDragOver={e => onDragOver(e, node.id)}
                onDrop={e => onDrop(e, node.id)}
                onDragEnd={() => setDragId(null)}
                onClick={e => { e.stopPropagation(); selectNode(node.id); }}
                title={`${formatPresentationOrder(node.presentationOrder!)} — ${truncateTitle(node.content)} — click to focus, drag to reorder`}
                aria-label={`Step ${node.presentationOrder}: ${truncateTitle(node.content)}`}
              >
                <span className="path-pill-order">{formatPresentationOrder(node.presentationOrder!)}</span>
                <span className="path-pill-title">{truncateTitle(node.content)}</span>
                <span className="path-pill-actions">
                  <button
                    className="path-pill-move"
                    disabled={idx === 0}
                    onClick={e => { e.stopPropagation(); reorderPresentation(node.id, idx - 1); }}
                    aria-label="Move earlier"
                    title="Move earlier"
                  >
                    <CaretLeft size={12} weight="bold" />
                  </button>
                  <button
                    className="path-pill-move"
                    disabled={idx === presNodes.length - 1}
                    onClick={e => { e.stopPropagation(); reorderPresentation(node.id, idx + 1); }}
                    aria-label="Move later"
                    title="Move later"
                  >
                    <CaretRight size={12} weight="bold" />
                  </button>
                  <button
                    className="path-pill-remove"
                    onClick={e => { e.stopPropagation(); removeFromPresentation(node.id); }}
                    aria-label={`Remove ${truncateTitle(node.content)} from presentation`}
                    title="Remove from presentation"
                  >
                    <X size={10} weight="bold" />
                  </button>
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="presentation-path-empty">
          Mark nodes via <code>⋯</code> → <em>Add to presentation</em> to build your path. Order is independent of canvas graph.
        </div>
      )}
    </div>
  );
}
