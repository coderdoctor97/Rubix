import type { Node } from '../types';

// Separate from status — this is presentation sequence, not learning status.
export function isPresentationNode(node: Node): boolean {
  return typeof node.presentationOrder === 'number' && Number.isFinite(node.presentationOrder);
}

export function getPresentationNodes(nodes: Record<string, Node>): Node[] {
  return Object.values(nodes)
    .filter(isPresentationNode)
    .sort((a, b) => (a.presentationOrder! - b.presentationOrder!));
}

export function getNextPresentationOrder(nodes: Record<string, Node>): number {
  const max = Math.max(0, ...Object.values(nodes).map((n) => (isPresentationNode(n) ? n.presentationOrder! : 0)));
  return max + 1;
}

export function formatPresentationOrder(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

// Normalize to contiguous 1..n sorted by current order
export function normalizePresentationOrder(nodes: Record<string, Node>): void {
  const ordered = getPresentationNodes(nodes);
  ordered.forEach((node, idx) => {
    node.presentationOrder = idx + 1;
    node.updatedAt = Date.now();
  });
}

export function isValidPresentationOrder(v: unknown): v is number {
  return typeof v === 'number' && Number.isFinite(v) && v > 0 && Number.isInteger(v);
}
