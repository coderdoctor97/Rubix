'use client';
import {useMemo, useState, useCallback} from 'react';
import AnimatedBeam from './AnimatedBeam';
import {useCanvasStore} from '@/lib/store';
import {NODE_MIN_HEIGHT, NODE_WIDTH, CONNECTION_MAGNET_THRESHOLD} from '@/lib/types';
import {visibleOrder, getAncestorIds} from '@/lib/operations/hierarchy';

const STATUS_COLOR: Record<string, string> = {
  mastered: 'var(--green)',
  review:   'var(--amber)',
  failed:   'var(--red)',
  none:     'var(--wire-color)',
  default:  'var(--wire-color)',
};

function edgeCenter(
  node: { position: { x: number; y: number }; size?: { width: number; height: number } | null },
  other: { position: { x: number; y: number }; size?: { width: number; height: number } | null },
  w = NODE_WIDTH
): { x: number; y: number } {
  const h = node.size?.height ?? NODE_MIN_HEIGHT;
  const cx = node.position.x + w / 2;
  const cy = node.position.y + h / 2;
  const ocx = other.position.x + w / 2;
  const ocy = other.position.y + (other.size?.height ?? NODE_MIN_HEIGHT) / 2;
  if (ocx >= cx) return { x: node.position.x + w, y: cy };
  return { x: node.position.x, y: cy };
}

function edgeColor(node: { tint?: string | null; status: string }): string {
  return node.tint ?? (STATUS_COLOR[node.status] ?? STATUS_COLOR.default);
}

function bezierPath(ax: number, ay: number, bx: number, by: number): string {
  const offset = Math.max(Math.abs(bx - ax) * 0.5, 80);
  return `M ${ax} ${ay} C ${ax + offset} ${ay}, ${bx - offset} ${by}, ${bx} ${by}`;
}

export default function Edges() {
  const nodes = useCanvasStore(s => s.canvas?.nodes);
  const connections = useCanvasStore(s => s.canvas?.connections);
  const justCreatedId = useCanvasStore(s => s.justCreatedId);
  const lastMarkedId = useCanvasStore(s => s.lastMarkedId);
  const connectingFrom = useCanvasStore(s => s.connectingFrom);
  const mouseWorld = useCanvasStore(s => s.mouseWorld);
  const magneticTarget = useCanvasStore(s => s.magneticTarget);
  const selectedConnection = useCanvasStore(s => s.selectedConnection);
  const setSelectedConnection = useCanvasStore(s => s.setSelectedConnection);

  const [hoveredKey, setHoveredKey] = useState<string | null>(null);

  const isSelectedFor = useCallback((cnA: string, cnB: string): boolean => {
    if (!selectedConnection) return false;
    return (selectedConnection.a === cnA && selectedConnection.b === cnB) || (selectedConnection.a === cnB && selectedConnection.b === cnA);
  }, [selectedConnection]);

  const handleConnectionClick = useCallback((a: string, b: string) => {
    if (isSelectedFor(a, b)) {
      setSelectedConnection(null);
    } else {
      setSelectedConnection({ a, b });
    }
  }, [isSelectedFor, setSelectedConnection]);

    const paths = useMemo(() => {
    if (!nodes) return [];
    const visible = new Set(visibleOrder({ nodes, viewport: { x: 0, y: 0, zoom: 1 } } as any));
    const out: {
      key: string;
      a: string;
      b: string;
      d: string;
      stroke: string;
      isNew: boolean;
      isMarked: boolean;
      isManual: boolean;
      level: number;
    }[] = [];

    // Parent → child edges (directional, edge-attached) — hidden when child is collapsed
    for (const child of Object.values(nodes)) {
      if (!child.parentId) continue;
      if (!visible.has(child.id)) continue; // child hidden → edge hidden
      const parent = nodes[child.parentId];
      if (!parent) continue;

      const pEnd = edgeCenter(parent, child);
      const cEnd = edgeCenter(child, parent);
      const stroke = edgeColor(child);
      const level = getAncestorIds({ nodes } as any, child.id).length;

      out.push({
        key: `edge-${child.parentId}-${child.id}`,
        a: child.parentId,
        b: child.id,
        d: bezierPath(pEnd.x, pEnd.y, cEnd.x, cEnd.y),
        stroke,
        isNew: child.id === justCreatedId,
        isMarked: child.id === lastMarkedId || child.parentId === lastMarkedId,
        isManual: false,
        level,
      });
    }

    // Manual connections (undirected, edge-attached, dedicated colour)
    if (connections) {
      for (const cn of connections) {
        const a = nodes?.[cn.a];
        const b = nodes?.[cn.b];
        if (!a || !b) continue;
        if (!visible.has(cn.a) || !visible.has(cn.b)) continue; // hide if either endpoint is hidden

        const aEnd = edgeCenter(a, b);
        const bEnd = edgeCenter(b, a);
        const stroke = 'var(--conn-manual)';

        out.push({
          key: `conn-${cn.a}-${cn.b}`,
          a: cn.a,
          b: cn.b,
          d: bezierPath(aEnd.x, aEnd.y, bEnd.x, bEnd.y),
          stroke,
          isNew: false,
          isMarked: false,
          isManual: true,
          level: 0,
        });
      }
    }

    return out;
  }, [nodes, connections, justCreatedId, lastMarkedId]);

  // Preview wire during connection drag
  const previewPath = useMemo(() => {
    if (!connectingFrom || !mouseWorld || !nodes) return null;
    const src = nodes[connectingFrom];
    if (!src) return null;
    const srcEnd = edgeCenter(src, { position: mouseWorld, size: null } as any);
    const dx = mouseWorld.x - srcEnd.x;
    const dy = mouseWorld.y - srcEnd.y;
    const offset = Math.max(Math.abs(dx) * 0.5, 40);
    return `M ${srcEnd.x} ${srcEnd.y} C ${srcEnd.x + offset} ${srcEnd.y}, ${mouseWorld.x - offset} ${mouseWorld.y}, ${mouseWorld.x} ${mouseWorld.y}`;
  }, [connectingFrom, mouseWorld, nodes]);

  // Snap preview to magnetic target
  const snapTargetId = magneticTarget;
  const snapPos = useMemo(() => {
    if (!snapTargetId || !nodes) return null;
    const n = nodes[snapTargetId];
    if (!n) return null;
    return edgeCenter(n, { position: { x: 0, y: 0 }, size: null } as any);
  }, [snapTargetId, nodes]);

  const effectivePreview = useMemo(() => {
    if (!previewPath || !snapPos || !connectingFrom || !nodes) return previewPath;
    const src = nodes[connectingFrom];
    if (!src) return previewPath;
    const srcEnd = edgeCenter(src, { position: snapPos, size: null } as any);
    const dx = snapPos.x - srcEnd.x;
    const dy = snapPos.y - srcEnd.y;
    const offset = Math.max(Math.abs(dx) * 0.5, 40);
    return `M ${srcEnd.x} ${srcEnd.y} C ${srcEnd.x + offset} ${srcEnd.y}, ${snapPos.x - offset} ${snapPos.y}, ${snapPos.x} ${snapPos.y}`;
  }, [previewPath, snapPos, connectingFrom, nodes]);

  return (
    <div id="edges">
      <svg
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          overflow: 'visible',
          pointerEvents: 'none',
        }}
      >
        {paths.map(p => {
          const isHovered = hoveredKey === p.key;
          const isSelected = isSelectedFor(p.a, p.b);
          return (
            <g key={p.key}>
              {/* Invisible wider hit area for hover/click */}
              <path
                d={p.d}
                fill="none"
                stroke="transparent"
                strokeWidth={16}
                strokeLinecap="round"
                style={{ pointerEvents: 'stroke', cursor: 'pointer', transition: 'opacity 0.15s ease' }}
                onMouseEnter={() => setHoveredKey(p.key)}
                onMouseLeave={() => setHoveredKey(null)}
                onClick={() => handleConnectionClick(p.a, p.b)}
              />
              {/* Visible wire — depth-aware: primary (level 1) stronger, deeper levels lighter */}
              <path
                d={p.d}
                fill="none"
                strokeLinecap="round"
                strokeDasharray="none"
                style={{
                  stroke: p.stroke,
                  strokeWidth: isSelected ? 3 : isHovered ? 2.5 : p.isManual ? 2 : p.level <= 1 ? 2.5 : 1.5,
                  opacity: isSelected ? 1 : isHovered ? 0.9 : p.isManual ? 0.65 : p.level <= 1 ? 0.85 : 0.5,
                  transition: 'stroke-width 0.18s ease, opacity 0.18s ease',
                  pointerEvents: 'none',
                }}
              />
              {/* Selection glow */}
              {isSelected && (
                <path
                  d={p.d}
                  fill="none"
                  stroke={p.isManual ? 'var(--conn-manual)' : p.stroke}
                  strokeWidth={10}
                  strokeLinecap="round"
                  opacity={0.2}
                  style={{ pointerEvents: 'none', transition: 'opacity 0.18s ease' }}
                />
              )}
              {(p.isMarked && lastMarkedId) ? (
                <AnimatedBeam d={p.d} trigger={lastMarkedId} color={p.stroke} duration={1.1} />
              ) : p.isNew && justCreatedId && !p.isManual ? (
                <AnimatedBeam d={p.d} trigger={justCreatedId} color={p.stroke} duration={0.9} />
              ) : null}
            </g>
          );
        })}
        {effectivePreview && connectingFrom && (
          <path
            d={effectivePreview}
            fill="none"
            stroke="var(--accent)"
            strokeWidth={2}
            strokeLinecap="round"
            strokeDasharray="6 4"
            opacity={0.7}
            style={{ transition: 'opacity 0.15s ease' }}
          />
        )}
        {snapTargetId && snapPos && connectingFrom && (
          <circle cx={snapPos.x} cy={snapPos.y} r={6} fill="var(--accent)" opacity={0.5}>
            <animate attributeName="r" values="5;8;5" dur="1s" repeatCount="indefinite" />
          </circle>
        )}
      </svg>
    </div>
  );
}

