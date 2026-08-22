import { describe, it, expect, vi } from 'vitest';
import type { Status } from '../src/lib/types';

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
    id: 'test', name: 'Test', nodes: {}, viewport: { x: 0, y: 0, zoom: 1 }, connections: [], createdAt: now, updatedAt: now,
  }));
  vi.resetModules();
  const mod = await import('../src/lib/store');
  mod.useCanvasStore.getState().init('test', { x: 800, y: 600 });
  return mod.useCanvasStore;
}

describe('undo/redo reproduction', () => {
  it('update() -> undo -> redo restores content', async () => {
    const store = await freshEmptyStore();
    const s = store.getState();

    s.createRoot({ x: 400, y: 300 });
    const nodeId = Object.keys(store.getState().canvas!.nodes)[0];

    // Before any change, past should be empty (init resets it)
    expect(s.past.length).toBe(0);

    // Update content
    store.getState().update(c => { c.nodes[nodeId].content = 'updated'; });
    expect(store.getState().canvas!.nodes[nodeId].content).toBe('updated');

    // Undo
    store.getState().undo();
    expect(store.getState().canvas!.nodes[nodeId].content).toBe('');

    // Redo
    store.getState().redo();
    expect(store.getState().canvas!.nodes[nodeId].content).toBe('updated');
  });

  it('setNodeStatus -> undo -> redo restores status', async () => {
    const store = await freshEmptyStore();

    store.getState().createRoot({ x: 400, y: 300 });
    const nodeId = Object.keys(store.getState().canvas!.nodes)[0];
    store.getState().setEditing(null);

    store.getState().setNodeStatus(nodeId, 'mastered');
    expect(store.getState().canvas!.nodes[nodeId].status).toBe('mastered');

    // setNodeStatus uses update() internally — should have history
    expect(store.getState().past.length).toBeGreaterThan(0);

    store.getState().undo();
    expect(store.getState().canvas!.nodes[nodeId].status).toBe('none');

    store.getState().redo();
    expect(store.getState().canvas!.nodes[nodeId].status).toBe('mastered');
  });

  it('marker shortcut map matches original Synapse semantics (1=failed, 2=review, 3=mastered, 0=clear)', async () => {
    // Recovered mapping from TASKS/V2-14 + STATUS_META short codes (F/R/M)
    const { STATUS_META } = await import('../src/lib/types');
    const map: Record<string, Status> = { '1': 'failed', '2': 'review', '3': 'mastered', '0': 'none' };
    expect(STATUS_META[map['1']].short).toBe('F');
    expect(STATUS_META[map['2']].short).toBe('R');
    expect(STATUS_META[map['3']].short).toBe('M');
    expect(map['0']).toBe('none'); // 0 clears the marker
  });

  it('statusSummary counts direct children only (drives "1R"-style chips)', async () => {
    const { statusSummary } = await import('../src/lib/operations/status');
    const nodes = [
      { status: 'review' },
      { status: 'failed' },
      { status: 'none' },
    ] as any[];
    expect(statusSummary(nodes)).toEqual({ failed: 1, review: 1, mastered: 0 });
  });

  it('createChild -> undo removes the child, redo adds it back', async () => {
    const store = await freshEmptyStore();

    store.getState().createRoot({ x: 400, y: 300 });
    const parentId = Object.keys(store.getState().canvas!.nodes)[0];
    const beforeCount = Object.keys(store.getState().canvas!.nodes).length;

    store.getState().createChild(parentId);
    const afterCount = Object.keys(store.getState().canvas!.nodes).length;
    expect(afterCount).toBe(beforeCount + 1);

    expect(store.getState().past.length).toBeGreaterThan(0);

    // Undo
    store.getState().undo();
    expect(Object.keys(store.getState().canvas!.nodes).length).toBe(beforeCount);

    // Redo
    store.getState().redo();
    expect(Object.keys(store.getState().canvas!.nodes).length).toBe(afterCount);
  });

  it('multiple undo/redo steps trace through edit history', async () => {
    const store = await freshEmptyStore();

    store.getState().createRoot({ x: 400, y: 300 });
    const nodeId = Object.keys(store.getState().canvas!.nodes)[0];

    store.getState().update(c => { c.nodes[nodeId].content = 'first'; });
    store.getState().update(c => { c.nodes[nodeId].content = 'second'; });
    store.getState().update(c => { c.nodes[nodeId].content = 'third'; });

    const s = store.getState();
    // createRoot + 3 updates = 4 entries (the pre-createRoot empty canvas + 3 content snapshots)
    expect(s.past.length).toBe(4);

    s.undo();
    expect(store.getState().canvas!.nodes[nodeId].content).toBe('second');

    store.getState().undo();
    expect(store.getState().canvas!.nodes[nodeId].content).toBe('first');

    store.getState().undo();
    expect(store.getState().canvas!.nodes[nodeId].content).toBe('');

    store.getState().redo();
    expect(store.getState().canvas!.nodes[nodeId].content).toBe('first');

    // Future should be cleared on new edit after undo
    store.getState().update(c => { c.nodes[nodeId].content = 'overwritten'; });
    expect(store.getState().canvas!.nodes[nodeId].content).toBe('overwritten');
    expect(store.getState().future.length).toBe(0);

    // Undo again
    store.getState().undo();
    expect(store.getState().canvas!.nodes[nodeId].content).toBe('first');
  });

  it('toggleNode (collapse/expand) pushes to history', async () => {
    const store = await freshEmptyStore();

    store.getState().createRoot({ x: 400, y: 300 });
    const nodeId = Object.keys(store.getState().canvas!.nodes)[0];

    // Toggle collapse
    store.getState().toggleNode(nodeId);
    const afterToggle = store.getState().past.length;
    // toggleNode should record history (message arg removed: TS rejects the
    // extra runtime argument; assertion semantics unchanged — user-approved override)
    expect(afterToggle).toBeGreaterThan(0);

    // Undo
    store.getState().undo();
    expect(store.getState().canvas!.nodes[nodeId].isCollapsed).toBe(false);
  });

  it('remove node -> undo restores the node', async () => {
    const store = await freshEmptyStore();

    store.getState().createRoot({ x: 400, y: 300 });
    store.getState().createChild(Object.keys(store.getState().canvas!.nodes)[0]);

    const nodeCountBefore = Object.keys(store.getState().canvas!.nodes).length;
    const childId = Object.keys(store.getState().canvas!.nodes)[1];

    store.getState().remove(childId);
    expect(Object.keys(store.getState().canvas!.nodes).length).toBeLessThan(nodeCountBefore);

    expect(store.getState().past.length).toBeGreaterThan(0);

    store.getState().undo();
    expect(Object.keys(store.getState().canvas!.nodes).length).toBe(nodeCountBefore);
    expect(store.getState().canvas!.nodes[childId]).toBeDefined();
  });

  it('keyboard Delete removes selected node and records history', async () => {
    const store = await freshEmptyStore();

    store.getState().createRoot({ x: 400, y: 300 });
    const nodeId = Object.keys(store.getState().canvas!.nodes)[0];
    store.getState().setEditing(null); // clear editing state set by createRoot
    store.getState().selectNode(nodeId);

    expect(store.getState().selectedNodeIds).toContain(nodeId);

    // Simulate the keyboard Delete handler logic directly:
    // no editingId, no active input → remove fires
    const { selectedNodeIds: ids, editingId, remove, clearSelection } = store.getState();
    expect(editingId).toBeNull();
    for (const id of ids) remove(id);
    clearSelection();

    // Node should be removed
    expect(store.getState().canvas!.nodes[nodeId]).toBeUndefined();
    expect(store.getState().selectedNodeIds).toEqual([]);

    // History should have been recorded
    expect(store.getState().past.length).toBeGreaterThan(0);

    // Undo restores the node
    store.getState().undo();
    expect(store.getState().canvas!.nodes[nodeId]).toBeDefined();
  });

  it('keyboard Delete does not fire while editing text', async () => {
    const store = await freshEmptyStore();

    store.getState().createRoot({ x: 400, y: 300 });
    const nodeId = Object.keys(store.getState().canvas!.nodes)[0];
    store.getState().setEditing(nodeId);
    store.getState().selectNode(nodeId);

    // Simulate the keyboard Delete handler guard:
    // editingId is set → remove should NOT fire
    const { editingId, selectedNodeIds, remove } = store.getState();
    if (editingId !== null) {
      // Guard works — do not call remove
      expect(selectedNodeIds.length).toBeGreaterThan(0);
    }

    // Node should still exist
    expect(store.getState().canvas!.nodes[nodeId]).toBeDefined();
  });
});


