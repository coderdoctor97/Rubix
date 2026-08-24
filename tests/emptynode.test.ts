import { describe, it, expect, vi } from 'vitest';
import { planRichCommit, plainToDoc } from '../src/lib/operations/richtext';
import type { TiptapDoc } from '../src/lib/types';

// ---- Pure decision rule: the core of the empty-node lifecycle ----
// An empty node is a valid node. planRichCommit must NEVER produce a deletion.

const EMPTY_DOC: TiptapDoc = plainToDoc('');
const docWith = (text: string): TiptapDoc => plainToDoc(text);

describe('planRichCommit — empty nodes are valid and never deleted', () => {
  it('a brand-new empty node committed with no text is a no-op (NOT a delete)', () => {
    const plan = planRichCommit('', undefined, EMPTY_DOC, '');
    expect(plan.kind).toBe('noop');
    // Guard against a future re-introduction of a delete outcome:
    expect(plan).not.toHaveProperty('remove');
    expect((plan as { remove?: unknown }).remove).toBeUndefined();
  });

  it('an empty node committed with text saves normally', () => {
    const plan = planRichCommit('', undefined, docWith('Eclampsia'), 'Eclampsia');
    expect(plan).toEqual({ kind: 'save', doc: docWith('Eclampsia'), content: 'Eclampsia' });
  });

  it('a node with content committed with new content saves normally', () => {
    const plan = planRichCommit('Old', docWith('Old'), docWith('New'), 'New');
    expect(plan).toEqual({ kind: 'save', doc: docWith('New'), content: 'New' });
  });

  it('clearing a node back to empty KEEPS the node (save, not delete)', () => {
    // This is the other half of the regression guard: removing all text from a
    // node that had content must not delete it.
    const plan = planRichCommit('Had text', docWith('Had text'), EMPTY_DOC, '');
    expect(plan.kind).toBe('save');
    expect(plan).toEqual({ kind: 'save', doc: EMPTY_DOC, content: '' });
  });

  it('whitespace-only text on an empty node is treated as still-empty (noop)', () => {
    const plan = planRichCommit('', undefined, docWith('   '), '   ');
    expect(plan.kind).toBe('noop');
  });

  it('an empty node that already has an empty doc committed empty again is a noop', () => {
    const plan = planRichCommit('', EMPTY_DOC, EMPTY_DOC, '');
    expect(plan.kind).toBe('noop');
  });
});

// ---- Store-level integration: the full lifecycle from the validation matrix ----

class MemoryStorage implements Storage {
  private store = new Map<string, string>();
  length = 0;
  clear() { this.store.clear(); }
  getItem(key: string) { return this.store.get(key) ?? null; }
  key(index: number) { return Array.from(this.store.keys())[index] ?? null; }
  removeItem(key: string) { this.store.delete(key); }
  setItem(key: string, value: string) { this.store.set(key, String(value)); }
}

async function freshEmptyStore() {
  const storage = new MemoryStorage();
  (globalThis as any).localStorage = storage;
  vi.useRealTimers();
  storage.clear();
  const now = Date.now();
  storage.setItem('synapse:v1:canvas:test', JSON.stringify({
    id: 'test', name: 'Test', nodes: {}, viewport: { x: 0, y: 0, zoom: 1 },
    connections: [], createdAt: now, updatedAt: now,
  }));
  vi.resetModules();
  const mod = await import('../src/lib/store');
  mod.useCanvasStore.getState().init('test', { x: 800, y: 600 });
  return mod.useCanvasStore;
}

describe('empty-node lifecycle (create → persist → re-edit → history)', () => {
  it('createChild makes an empty node that persists and can later receive content', async () => {
    const store = await freshEmptyStore();
    store.getState().createRoot({ x: 400, y: 300 });
    const parentId = Object.keys(store.getState().canvas!.nodes)[0];

    store.getState().createChild(parentId);
    const childId = Object.keys(store.getState().canvas!.nodes).find(id => id !== parentId)!;

    // Empty child exists with empty content and is editable.
    const nodes = store.getState().canvas!.nodes;
    expect(nodes[childId]).toBeDefined();
    expect(nodes[childId].content).toBe('');
    expect(nodes[childId].parentId).toBe(parentId);

    // The previous buggy code would call remove(childId) here. With the fix,
    // committing an empty doc to the already-empty node is a no-op via
    // planRichCommit — the node MUST still exist afterwards.
    const plan = planRichCommit('', undefined, plainToDoc(''), '');
    expect(plan.kind).toBe('noop'); // no store mutation -> node stays

    // Later the user types content — modelled directly on the store, mirroring
    // what commitRich does for a 'save' plan.
    store.getState().update(c => { c.nodes[childId].content = 'Eclampsia'; });
    expect(store.getState().canvas!.nodes[childId].content).toBe('Eclampsia');
  });

  it('undo removes a freshly-created empty node; redo restores it', async () => {
    const store = await freshEmptyStore();
    store.getState().createRoot({ x: 400, y: 300 });
    const parentId = Object.keys(store.getState().canvas!.nodes)[0];
    const before = Object.keys(store.getState().canvas!.nodes).length;

    store.getState().createChild(parentId);
    const after = Object.keys(store.getState().canvas!.nodes).length;
    expect(after).toBe(before + 1);

    store.getState().undo();
    expect(Object.keys(store.getState().canvas!.nodes).length).toBe(before);

    store.getState().redo();
    expect(Object.keys(store.getState().canvas!.nodes).length).toBe(after);
    // The restored node is still empty and still a child.
    const restored = Object.keys(store.getState().canvas!.nodes).find(id => id !== parentId)!;
    expect(store.getState().canvas!.nodes[restored].content).toBe('');
    expect(store.getState().canvas!.nodes[restored].parentId).toBe(parentId);
  });

  it('an empty node can be connected, styled, tinted, and deleted like any node', async () => {
    const store = await freshEmptyStore();
    store.getState().createRoot({ x: 400, y: 300 });
    const root = Object.keys(store.getState().canvas!.nodes)[0];

    store.getState().createChild(root);
    const child = Object.keys(store.getState().canvas!.nodes).find(id => id !== root)!;
    // Still empty:
    expect(store.getState().canvas!.nodes[child].content).toBe('');

    // Connect to it.
    store.getState().createConnection(root, child);
    expect(store.getState().canvas!.connections.length).toBe(1);

    // Style + tint it.
    store.getState().setNodeStyle(child, 'sticky');
    store.getState().setNodeTint(child, 'oklch(78% 0.13 78)');
    expect(store.getState().canvas!.nodes[child].style).toBe('sticky');
    expect(store.getState().canvas!.nodes[child].tint).toBe('oklch(78% 0.13 78)');

    // Delete it (explicit, intentional) — works and is undoable.
    const beforeDel = Object.keys(store.getState().canvas!.nodes).length;
    store.getState().remove(child);
    expect(store.getState().canvas!.nodes[child]).toBeUndefined();
    expect(Object.keys(store.getState().canvas!.nodes).length).toBe(beforeDel - 1);
    store.getState().undo();
    expect(store.getState().canvas!.nodes[child]).toBeDefined();
  });
});
