import { describe, it, expect } from 'vitest';
import { isRoot } from '../src/lib/operations/hierarchy';
import type { Node } from '../src/lib/types';

function makeNode(overrides: Partial<Node> = {}): Node {
  return {
    id: overrides.id ?? 'node-1',
    content: overrides.content ?? '',
    parentId: overrides.parentId ?? null,
    position: overrides.position ?? { x: 0, y: 0 },
    status: overrides.status ?? 'none',
    isCollapsed: overrides.isCollapsed ?? false,
    createdAt: overrides.createdAt ?? 0,
    updatedAt: overrides.updatedAt ?? 0,
  };
}

describe('isRoot', () => {
  it('returns true for nodes with parentId === null', () => {
    expect(isRoot(makeNode({ parentId: null }))).toBe(true);
  });

  it('returns false for nodes with a parentId', () => {
    expect(isRoot(makeNode({ parentId: 'p-1' }))).toBe(false);
  });
});
