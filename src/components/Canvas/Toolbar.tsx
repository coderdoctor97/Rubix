'use client';
import Button from '../ui/Button';
import { useCanvasStore } from '@/lib/store';
import { MagicWandIcon, CaretDown, CaretUp, ArrowUUpLeft, ArrowURightDown, Plus, Sparkle, PresentationChart } from '@phosphor-icons/react';

export default function Toolbar({ onAdd, onAddText, onAddHeading, onCollapse, onExpand }: { onAdd: () => void; onAddText: () => void; onAddHeading: () => void; onCollapse: () => void; onExpand: () => void }) {
  const canvas = useCanvasStore(s => s.canvas);
  const past = useCanvasStore(s => s.past), future = useCanvasStore(s => s.future), undo = useCanvasStore(s => s.undo), redo = useCanvasStore(s => s.redo);
  const applyTidy = useCanvasStore(s => s.applyTidy);
  const presentationMode = useCanvasStore(s => s.presentationMode);
  const setPresentationMode = useCanvasStore(s => s.setPresentationMode);
  const canUndo = past.length > 0, canRedo = future.length > 0;
  const hasNodes = !!canvas && Object.keys(canvas.nodes).length > 0;
  const presentationCount = canvas ? Object.values(canvas.nodes).filter(n => typeof n.presentationOrder === 'number').length : 0;

  // Derived collapse/expand state (UI-only — store actions untouched)
  const nodes = canvas?.nodes;
  const parentIds = new Set<string>();
  if (nodes) for (const n of Object.values(nodes)) if (n.parentId) parentIds.add(n.parentId);
  const collapsible = parentIds.size > 0;
  const allCollapsed = collapsible && !!nodes && [...parentIds].every(id => nodes[id].isCollapsed);

  return (
    <header id="toolbar" className="ui-float">
      <div className="brand">
        <div className="brand-logo"><Sparkle size={16} weight="fill" aria-hidden="true" /></div>
        <div>
          <div className="brand-name">Synapse</div>
          <div className="brand-sub">ACTIVE RECALL CANVAS</div>
        </div>
      </div>
      <div className="tb-sep" />
      <Button className="btn-primary" onClick={onAdd} aria-label="New topic" title="New topic"><Plus size={16} weight="regular" aria-hidden="true" /> New topic</Button>
      <Button onClick={onAddText} title="Add a text note" aria-label="Add a text note">Text</Button>
      <Button onClick={onAddHeading} title="Add a heading" aria-label="Add a heading">Heading</Button>
      <Button
        className="tb-icon-btn"
        disabled={!collapsible}
        onClick={allCollapsed ? onExpand : onCollapse}
        title={allCollapsed ? 'Expand all' : 'Collapse all'}
        aria-label={allCollapsed ? 'Expand all' : 'Collapse all'}
      >
        {allCollapsed
          ? <CaretDown size={16} weight="regular" aria-hidden="true" />
          : <CaretUp size={16} weight="regular" aria-hidden="true" />}
      </Button>
      <Button
        className="tb-icon-btn"
        disabled={!hasNodes}
        onClick={e => { e.stopPropagation(); applyTidy(); }}
        title="Tidy layout"
        aria-label="Tidy layout"
      >
        <MagicWandIcon size={16} aria-hidden="true" />
      </Button>
      <div className="tb-sep" />
      <Button
        className={`tb-icon-btn ${presentationMode ? 'is-active' : ''}`}
        onClick={e => { e.stopPropagation(); setPresentationMode(!presentationMode); }}
        title={presentationMode ? 'Exit presentation mode' : 'Enter presentation mode'}
        aria-label={presentationMode ? 'Exit presentation mode' : 'Enter presentation mode'}
        aria-pressed={presentationMode}
      >
        <PresentationChart size={16} weight={presentationMode ? 'fill' : 'regular'} aria-hidden="true" />
        {presentationCount > 0 && !presentationMode && <span className="tb-presentation-count">{presentationCount}</span>}
      </Button>
      <div className="tb-sep" />
      <Button disabled={!canUndo} onClick={e => { e.stopPropagation(); undo(); }} aria-label="Undo (Ctrl+Z)" title="Undo (Ctrl+Z)" className={`tb-icon-btn${canUndo ? '' : ' is-disabled'}`}>
        <ArrowUUpLeft size={16} weight="regular" aria-hidden="true" />
      </Button>
      <Button disabled={!canRedo} onClick={e => { e.stopPropagation(); redo(); }} aria-label="Redo (Ctrl+Y)" title="Redo (Ctrl+Y)" className={`tb-icon-btn${canRedo ? '' : ' is-disabled'}`}>
        <ArrowURightDown size={16} weight="regular" aria-hidden="true" />
      </Button>
    </header>
  );
}