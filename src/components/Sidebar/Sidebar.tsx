'use client';
import { useEffect, useState, useMemo, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useCanvasStore } from '@/lib/store';
import { getFoldersInFolder, getFoldersSorted, getPagesInFolder, getPagesSorted } from '@/lib/operations/library';
import { readCanvasRaw } from '@/lib/persistence';
import { serializeCanvas } from '@/lib/portability';
import type { Folder, PageMeta } from '@/lib/types';
import { FolderIcon, NoteIcon, PushPinIcon, PencilSimpleIcon, TrashIcon, List, CaretDoubleRight, Plus, CaretRight } from '@phosphor-icons/react';

function defaultName(prefix: string): string {
  const d = new Date();
  const label = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  return `${prefix} · ${label}`;
}

function sanitize(name: string): string {
  const s = name.trim().replace(/[^a-zA-Z0-9._-]+/g, '_').replace(/_+/g, '_').replace(/^_+|_+$/g, '');
  return s || 'canvas';
}

function relativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

const PAGE_DRAG_TYPE = 'text/synapse-page';

function isPageDrag(dt: DataTransfer): boolean {
  return Array.from(dt.types).includes(PAGE_DRAG_TYPE);
}

type RailMark = { key: string; type: 'folder' | 'page'; node: Folder | PageMeta };

/**
 * Library graph mark — connected knowledge nodes; visually distinct from the
 * Synapse brand (toolbar Sparkle). Cleaned from the supplied SVG: SVGRepo
 * carrier groups (bgCarrier rounded rect + tracerCarrier), the <style>/class,
 * and the #000/#fff fills removed; path geometry preserved, cropped to the
 * 0 0 512 512 artwork space. `currentColor` inherits the container's
 * --on-accent (cream) so it reads strongly on the dark-brown/amber box in both
 * light and dark themes.
 */
function LibraryMark({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 512 512" fill="currentColor" aria-hidden="true" focusable="false">
      <path d="M443.256,163.486c29.893,0,54.128-24.235,54.128-54.136c0-29.893-24.235-54.128-54.128-54.128 c-29.894,0-54.145,24.235-54.145,54.128c0,6.722,1.295,13.14,3.534,19.079l-65.922,49.252 c-14.179-12.956-32.995-20.925-53.712-20.925c-6.586,0-12.948,0.888-19.071,2.398L217.412,78.41 c8.856-8.272,14.435-20.022,14.435-33.098C231.847,20.286,211.562,0,186.528,0c-25.018,0-45.304,20.286-45.304,45.312 s20.286,45.311,45.304,45.311c2.206,0,4.364-0.215,6.49-0.52l36.112,79.849c-16.034,10.59-27.96,26.832-33.059,45.88l-62.457-5.292 c-4.796-28.319-29.366-49.9-59.051-49.9c-33.106,0-59.946,26.84-59.946,59.946s26.84,59.946,59.946,59.946 c26.153,0,48.325-16.76,56.525-40.108l62.745,5.315c2.813,24.346,16.576,45.303,36.255,57.908l-12.292,30.82l-11.43,28.687 c-4.029-0.672-8.153-1.103-12.373-1.103c-41.42,0-74.974,33.562-74.974,74.965c0,41.419,33.554,74.981,74.974,74.981 c41.403,0,74.973-33.562,74.973-74.981c0-25.905-13.156-48.741-33.138-62.217l11.558-29.022l12.245-30.725 c4.364,0.743,8.808,1.207,13.38,1.207c27.543,0,51.842-13.964,66.165-35.201l55.162,26.784c-0.463,2.51-0.751,5.084-0.751,7.721 c0,23.299,18.895,42.178,42.186,42.178s42.171-18.879,42.171-42.178c0-23.3-18.88-42.178-42.171-42.178 c-12.644,0-23.947,5.587-31.667,14.387l-55.2-26.808c2.478-7.705,3.852-15.922,3.852-24.458c0-12.5-2.957-24.282-8.068-34.809 l65.922-49.244C419.692,159.346,430.978,163.486,443.256,163.486z" />
    </svg>
  );
}

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const index = useCanvasStore(s => s.index);
  const sidebarOpen = useCanvasStore(s => s.sidebarOpen);
  const loadIndex = useCanvasStore(s => s.loadIndex);
  const setSidebarOpen = useCanvasStore(s => s.setSidebarOpen);

  const addFolder = useCanvasStore(s => s.addFolder);
  const addPage = useCanvasStore(s => s.addPage);
  const renameFolder = useCanvasStore(s => s.renameFolder);
  const renamePage = useCanvasStore(s => s.renamePage);
  const deletePage = useCanvasStore(s => s.deletePage);
  const deleteFolder = useCanvasStore(s => s.deleteFolder);
  const toggleFolderPin = useCanvasStore(s => s.toggleFolderPin);
  const togglePagePin = useCanvasStore(s => s.togglePagePin);
  const movePageToFolder = useCanvasStore(s => s.movePageToFolder);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const [confirmPage, setConfirmPage] = useState<{ id: string; name: string } | null>(null);
  const [confirmFolder, setConfirmFolder] = useState<{ id: string; name: string } | null>(null);
  const [dragOverFolderId, setDragOverFolderId] = useState<string | null>(null);
  const [dragOverQuick, setDragOverQuick] = useState(false);
  const [draggedPageId, setDraggedPageId] = useState<string | null>(null);

  // Extract active page id from pathname /canvas/[id]
  const activePageId = useMemo(() => {
    if (!pathname) return null;
    const parts = pathname.split('/');
    if (parts.length >= 3 && parts[1] === 'canvas') return parts[2] || null;
    return null;
  }, [pathname]);

  useEffect(() => { loadIndex(); }, [loadIndex]);

  // Auto-expand folder containing active page
  useEffect(() => {
    if (!index || !activePageId) return;
    const page = index.pages[activePageId];
    if (page && page.folderId) {
      setExpanded(prev => {
        if (prev.has(page.folderId!)) return prev;
        const next = new Set(prev);
        next.add(page.folderId!);
        return next;
      });
    }
  }, [index, activePageId]);

  // Escape closes the drawer on phone-sized viewports (overlay mode).
  useEffect(() => {
    if (!sidebarOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && window.matchMedia('(max-width: 480px)').matches) setSidebarOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [sidebarOpen, setSidebarOpen]);

  useEffect(() => {
    if (editingFolderId || editingPageId) { inputRef.current?.focus(); inputRef.current?.select(); }
  }, [editingFolderId, editingPageId]);

  if (!index) return null;

  const toggleFolder = (folderId: string) => {
    setExpanded(prev => { const next = new Set(prev); next.has(folderId) ? next.delete(folderId) : next.add(folderId); return next; });
  };
  const startRenameFolder = (folderId: string, currentName: string) => { setEditingFolderId(folderId); setEditingPageId(null); setDraft(currentName); };
  const startRenamePage = (pageId: string, currentName: string) => { setEditingPageId(pageId); setEditingFolderId(null); setDraft(currentName); };
  const cancelRename = () => { setEditingFolderId(null); setEditingPageId(null); setDraft(''); };
  const saveFolderRename = () => {
    if (editingFolderId) {
      const trimmed = draft.trim();
      if (trimmed && trimmed !== (index.folders[editingFolderId]?.name ?? '')) renameFolder(editingFolderId, trimmed);
    }
    cancelRename();
  };
  const savePageRename = () => {
    if (editingPageId) {
      const trimmed = draft.trim();
      if (trimmed && trimmed !== (index.pages[editingPageId]?.name ?? '')) renamePage(editingPageId, trimmed);
    }
    cancelRename();
  };

  const handleDeletePageConfirm = () => {
    if (!confirmPage) return;
    const { id, name } = confirmPage;
    try {
      const canvas = readCanvasRaw(id);
      if (canvas && Object.keys(canvas.nodes).length >= 1) {
        const blob = new Blob([serializeCanvas(canvas)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `${sanitize(name)}-backup-${Date.now()}.synapse.json`;
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
    } catch { /* ignore backup errors, still delete */ }
    deletePage(id);
    setConfirmPage(null);
    if (activePageId === id) router.replace('/canvas/default');
  };

  const handleDeleteFolderConfirm = () => { if (confirmFolder) { deleteFolder(confirmFolder.id); setConfirmFolder(null); } };

  const navigateToPage = (pageId: string) => { router.push('/canvas/' + pageId); };
  const newQuickNote = (folderId: string | null) => {
    const id = addPage(defaultName('Quick note'), folderId);
    if (id) {
      if (folderId) setExpanded(prev => { const n = new Set(prev); n.add(folderId); return n; });
      navigateToPage(id);
    }
    return id;
  };

  // Derived sections (all grounded in the existing index data — nothing invented).
  const topFolders = getFoldersInFolder(index, null);
  const unorganizedPages = getPagesInFolder(index, null);
  const pinnedFolders = getFoldersSorted(index).filter(f => f.pinned);
  const pinnedPageRows = getPagesSorted(index).filter(p => p.pinned);
  const hasPinned = pinnedFolders.length + pinnedPageRows.length > 0;
  // Plain derived value (NOT useMemo) — this sits after the `if (!index) return null`
  // guard, so a hook here would break the Rules of Hooks ("rendered more hooks than
  // during the previous render"). index is guaranteed non-null at this point.
  const recentPages = [...Object.values(index.pages)].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 4);
  const activePage = activePageId ? index.pages[activePageId] : null;
  const activeFolderId = activePage?.folderId ?? null;

  // ----- shared rename input -----
  const renderRenameInput = (label: string, save: () => void) => (
    <input
      ref={inputRef}
      className="sidebar-inline-input"
      value={draft}
      onChange={e => setDraft(e.target.value)}
      onBlur={save}
      onKeyDown={e => {
        if (e.key === 'Enter') { e.preventDefault(); save(); }
        else if (e.key === 'Escape') { e.preventDefault(); cancelRename(); }
      }}
      onClick={e => e.stopPropagation()}
      aria-label={label}
    />
  );

  // ----- page row (shared by Pinned / Recent / folder pages / Quick Notes) -----
  const renderPage = (page: PageMeta, opts: { indent?: boolean } = {}) => {
    const isActive = activePageId === page.id;
    if (editingPageId === page.id) {
      return (
        <div key={page.id} className="sidebar-page is-editing" onClick={e => e.stopPropagation()} onPointerDown={e => e.stopPropagation()}>
          <span className="sidebar-page-icon"><NoteIcon size={14} weight="regular" aria-hidden="true" /></span>
          {renderRenameInput('Page name', savePageRename)}
        </div>
      );
    }
    return (
      <div
        key={page.id}
        draggable
        onDragStart={e => { e.stopPropagation(); e.dataTransfer.setData(PAGE_DRAG_TYPE, page.id); e.dataTransfer.effectAllowed = 'move'; setDraggedPageId(page.id); }}
        onDragEnd={() => { setDraggedPageId(null); setDragOverFolderId(null); setDragOverQuick(false); }}
        className={`sidebar-page-row${isActive ? ' is-active' : ''}${draggedPageId === page.id ? ' is-dragging' : ''}${opts.indent ? ' is-indented' : ''}`}
      >
        <button
          className={`sidebar-page${isActive ? ' is-active' : ''}`}
          onClick={e => { e.stopPropagation(); navigateToPage(page.id); }}
          onPointerDown={e => e.stopPropagation()}
          title={page.name}
        >
          <span className="sidebar-page-icon"><NoteIcon size={14} weight="regular" aria-hidden="true" /></span>
          <span className="sidebar-page-name">{page.name}</span>
          <span className="sidebar-page-meta">{relativeTime(page.updatedAt)}</span>
        </button>
        <button className={`sidebar-icon-btn${page.pinned ? ' pinned' : ''}`} onClick={e => { e.stopPropagation(); togglePagePin(page.id); }} onPointerDown={e => e.stopPropagation()} title={page.pinned ? 'Unpin page' : 'Pin page'} aria-label={page.pinned ? 'Unpin page' : 'Pin page'} aria-pressed={!!page.pinned}>
          <PushPinIcon size={14} weight={page.pinned ? 'fill' : 'regular'} aria-hidden="true" />
        </button>
        <button className="sidebar-icon-btn" onClick={e => { e.stopPropagation(); startRenamePage(page.id, page.name); }} onPointerDown={e => e.stopPropagation()} title="Rename page" aria-label="Rename page">
          <PencilSimpleIcon size={14} weight="regular" aria-hidden="true" />
        </button>
        {page.id !== 'default' && (
          <button className="sidebar-icon-btn danger" onClick={e => { e.stopPropagation(); setConfirmPage({ id: page.id, name: page.name }); }} onPointerDown={e => e.stopPropagation()} title="Delete page" aria-label="Delete page">
            <TrashIcon size={14} weight="regular" aria-hidden="true" />
          </button>
        )}
      </div>
    );
  };

  // ----- folder block (Folders section): expandable, nested pages + drag target -----
  const renderFolder = (folder: Folder) => {
    const isExpanded = expanded.has(folder.id);
    const pages = getPagesInFolder(index, folder.id);
    const isActiveFolder = activeFolderId === folder.id;
    const isEditing = editingFolderId === folder.id;
    return (
      <div key={folder.id} className="sidebar-folder">
        {isEditing ? (
          <div className="sidebar-folder-row is-editing" onClick={e => e.stopPropagation()} onPointerDown={e => e.stopPropagation()}>
            <span className="sidebar-chevron"><FolderIcon size={14} weight="regular" aria-hidden="true" /></span>
            {renderRenameInput('Folder name', saveFolderRename)}
          </div>
        ) : (
          <div
            className={`sidebar-folder-row${dragOverFolderId === folder.id ? ' is-drag-over' : ''}${isActiveFolder ? ' is-context' : ''}`}
            onDragOver={e => { if (!isPageDrag(e.dataTransfer)) return; e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setDragOverFolderId(folder.id); }}
            onDragLeave={e => { if (e.currentTarget.contains(e.relatedTarget as Node | null)) return; setDragOverFolderId(prev => (prev === folder.id ? null : prev)); }}
            onDrop={e => { if (!isPageDrag(e.dataTransfer)) return; e.preventDefault(); const id = e.dataTransfer.getData(PAGE_DRAG_TYPE); setDragOverFolderId(null); setDraggedPageId(null); if (id) movePageToFolder(id, folder.id); }}
          >
            <button className="sidebar-folder-main" onClick={e => { e.stopPropagation(); toggleFolder(folder.id); }} onPointerDown={e => e.stopPropagation()} aria-expanded={isExpanded} aria-label={`Folder ${folder.name}`}>
              <span className={`sidebar-chevron ${isExpanded ? 'open' : ''}`}><CaretRight size={14} weight="regular" aria-hidden="true" /></span>
              <span className="sidebar-folder-icon"><FolderIcon size={14} weight="regular" aria-hidden="true" /></span>
              <span className="sidebar-folder-name">{folder.name}</span>
              {pages.length > 0 && <span className="sidebar-count">{pages.length}</span>}
            </button>
            <div className="sidebar-folder-actions">
              <button className="sidebar-icon-btn" onClick={e => { e.stopPropagation(); const pid = addPage(defaultName('Quick note'), folder.id); if (pid) setExpanded(prev => { const n = new Set(prev); n.add(folder.id); return n; }); }} onPointerDown={e => e.stopPropagation()} title="Add page" aria-label="Add page">
                <Plus size={14} weight="regular" aria-hidden="true" />
              </button>
              <button className={`sidebar-icon-btn${folder.pinned ? ' pinned' : ''}`} onClick={e => { e.stopPropagation(); toggleFolderPin(folder.id); }} onPointerDown={e => e.stopPropagation()} title={folder.pinned ? 'Unpin folder' : 'Pin folder'} aria-label={folder.pinned ? 'Unpin folder' : 'Pin folder'} aria-pressed={!!folder.pinned}>
                <PushPinIcon size={14} weight={folder.pinned ? 'fill' : 'regular'} aria-hidden="true" />
              </button>
              <button className="sidebar-icon-btn" onClick={e => { e.stopPropagation(); startRenameFolder(folder.id, folder.name); }} onPointerDown={e => e.stopPropagation()} title="Rename folder" aria-label="Rename folder">
                <PencilSimpleIcon size={14} weight="regular" aria-hidden="true" />
              </button>
              <button className="sidebar-icon-btn danger" onClick={e => { e.stopPropagation(); setConfirmFolder({ id: folder.id, name: folder.name }); }} onPointerDown={e => e.stopPropagation()} title="Delete folder" aria-label="Delete folder">
                <TrashIcon size={14} weight="regular" aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
        {isExpanded && (
          <div className="sidebar-pages">
            {pages.length === 0 ? <div className="sidebar-empty">No pages</div> : pages.map(p => renderPage(p, { indent: true }))}
          </div>
        )}
      </div>
    );
  };

  // ----- pinned compact folder row (jump target; management lives in Folders) -----
  const renderPinnedFolder = (folder: Folder) => {
    const pages = getPagesInFolder(index, folder.id);
    const isActiveFolder = activeFolderId === folder.id;
    return (
      <div key={`pf-${folder.id}`} className={`sidebar-page-row${isActiveFolder ? ' is-active' : ''}`}>
        <button className={`sidebar-page${isActiveFolder ? ' is-active' : ''}`} onClick={e => { e.stopPropagation(); setExpanded(prev => { const n = new Set(prev); n.add(folder.id); return n; }); }} onPointerDown={e => e.stopPropagation()} title={folder.name}>
          <span className="sidebar-page-icon"><FolderIcon size={14} weight="regular" aria-hidden="true" /></span>
          <span className="sidebar-page-name">{folder.name}</span>
          <span className="sidebar-page-meta">{pages.length} {pages.length === 1 ? 'page' : 'pages'}</span>
        </button>
        <button className={`sidebar-icon-btn${folder.pinned ? ' pinned' : ''}`} onClick={e => { e.stopPropagation(); toggleFolderPin(folder.id); }} onPointerDown={e => e.stopPropagation()} title={folder.pinned ? 'Unpin folder' : 'Pin folder'} aria-label={folder.pinned ? 'Unpin folder' : 'Pin folder'} aria-pressed={!!folder.pinned}>
          <PushPinIcon size={14} weight={folder.pinned ? 'fill' : 'regular'} aria-hidden="true" />
        </button>
      </div>
    );
  };

  // ----- collapsed rail marks: pinned folders + pinned pages + active page (context preserved) -----
  const railMarks: RailMark[] = [];
  const railSeen = new Set<string>();
  pinnedFolders.forEach(f => { railMarks.push({ key: `f-${f.id}`, type: 'folder', node: f }); });
  pinnedPageRows.forEach(p => { railMarks.push({ key: `p-${p.id}`, type: 'page', node: p }); railSeen.add(p.id); });
  if (activePage && !railSeen.has(activePage.id)) railMarks.push({ key: `a-${activePage.id}`, type: 'page', node: activePage });

  const collapsed = !sidebarOpen;
  return (
    <>
      {/* Overlay scrim — phone/tablet drawer only (display:none on desktop via CSS). */}
      {!collapsed && (
        <div className="sidebar-scrim" onClick={e => { e.stopPropagation(); setSidebarOpen(false); }} onPointerDown={e => e.stopPropagation()} aria-hidden="true" />
      )}
      <aside className={`sidebar${collapsed ? ' is-collapsed' : ''}`} aria-label={collapsed ? 'Library (compact)' : 'Library'}>
        {collapsed ? (
          <>
            <button className="rail-brand" onClick={e => { e.stopPropagation(); setSidebarOpen(true); }} onPointerDown={e => e.stopPropagation()} aria-label="Open library" title="Open library">
              <LibraryMark size={20} />
            </button>
            <div className="rail-marks">
              {railMarks.length === 0 ? (
                <span className="rail-empty" aria-hidden="true" />
              ) : railMarks.map(({ key, type, node }) => {
                const isActive = type === 'page' ? activePageId === node.id : activeFolderId === node.id;
                const cnt = type === 'folder' ? getPagesInFolder(index, node.id).length : 0;
                const meta = type === 'page' ? `Page · ${relativeTime((node as PageMeta).updatedAt)}` : `Folder · ${cnt} ${cnt === 1 ? 'page' : 'pages'}`;
                const Icon = type === 'page' ? NoteIcon : FolderIcon;
                return (
                  <button
                    key={key}
                    className={`rail-mark${isActive ? ' is-active' : ''}`}
                    onClick={e => { e.stopPropagation(); if (type === 'page') navigateToPage(node.id); else { setSidebarOpen(true); setExpanded(prev => { const n = new Set(prev); n.add(node.id); return n; }); } }}
                    onPointerDown={e => e.stopPropagation()}
                    aria-label={node.name}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon size={18} weight="regular" aria-hidden="true" />
                    <span className="rail-tip" role="tooltip"><span className="rail-tip-name">{node.name}</span><span className="rail-tip-meta">{meta}</span></span>
                  </button>
                );
              })}
            </div>
            <div className="rail-foot">
              <button className="rail-mark rail-create" onClick={e => { e.stopPropagation(); newQuickNote(null); }} onPointerDown={e => e.stopPropagation()} aria-label="New quick note" title="New quick note">
                <Plus size={18} weight="regular" aria-hidden="true" />
                <span className="rail-tip" role="tooltip"><span className="rail-tip-name">New quick note</span></span>
              </button>
              <button className="rail-mark rail-expand" onClick={e => { e.stopPropagation(); setSidebarOpen(true); }} onPointerDown={e => e.stopPropagation()} aria-label="Expand sidebar" title="Expand sidebar">
                <CaretDoubleRight size={18} weight="regular" aria-hidden="true" />
                <span className="rail-tip" role="tooltip"><span className="rail-tip-name">Expand library</span></span>
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="sidebar-header">
              <span className="sidebar-brand">
                <span className="sidebar-brand-mark" aria-hidden="true"><LibraryMark size={15} /></span>
                <span className="sidebar-title">Library</span>
              </span>
              <button className="sidebar-toggle" onClick={e => { e.stopPropagation(); setSidebarOpen(false); }} onPointerDown={e => e.stopPropagation()} aria-label="Collapse sidebar" title="Collapse sidebar">
                <List size={16} weight="regular" aria-hidden="true" />
              </button>
            </div>

            <div className="sidebar-content">
              {hasPinned && (
                <div className="sidebar-section">
                  <div className="sidebar-section-header">Pinned</div>
                  {pinnedFolders.map(renderPinnedFolder)}
                  {pinnedPageRows.map(p => renderPage(p))}
                </div>
              )}
              <div className="sidebar-section">
                <div className="sidebar-section-header">Recent</div>
                {recentPages.length === 0 ? <div className="sidebar-empty subtle">No pages yet</div> : <div className="sidebar-pages">{recentPages.map(p => renderPage(p))}</div>}
              </div>
              <div className="sidebar-section">
                <div className="sidebar-section-header">Folders</div>
                {topFolders.length === 0 ? <div className="sidebar-empty">No folders yet</div> : topFolders.map(renderFolder)}
              </div>
              <div className="sidebar-section">
                <div
                  className={`sidebar-section-header sidebar-drop-quick${dragOverQuick ? ' is-drag-over' : ''}`}
                  onDragOver={e => { if (!isPageDrag(e.dataTransfer)) return; e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setDragOverQuick(true); }}
                  onDragLeave={e => { if (e.currentTarget.contains(e.relatedTarget as Node | null)) return; setDragOverQuick(false); }}
                  onDrop={e => { if (!isPageDrag(e.dataTransfer)) return; e.preventDefault(); const id = e.dataTransfer.getData(PAGE_DRAG_TYPE); setDragOverQuick(false); setDraggedPageId(null); if (id) movePageToFolder(id, null); }}
                >Quick Notes</div>
                {unorganizedPages.length === 0 ? <div className="sidebar-empty subtle">No pages</div> : <div className="sidebar-pages">{unorganizedPages.map(p => renderPage(p))}</div>}
              </div>
            </div>

            <div className="sidebar-footer">
              <button className="sidebar-footer-create" onClick={e => { e.stopPropagation(); newQuickNote(null); }} onPointerDown={e => e.stopPropagation()} title="New quick note">
                <Plus size={16} weight="regular" aria-hidden="true" /> Quick note
              </button>
              <button className="sidebar-footer-aux" onClick={e => { e.stopPropagation(); addFolder(defaultName('Folder')); }} onPointerDown={e => e.stopPropagation()} title="New folder" aria-label="New folder">
                <FolderIcon size={16} weight="regular" aria-hidden="true" />
              </button>
            </div>
          </>
        )}

        {confirmPage && (
          <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="sidebar-delete-page-title" onClick={e => { e.stopPropagation(); if (e.target === e.currentTarget) setConfirmPage(null); }} onPointerDown={e => e.stopPropagation()}>
            <div className="modal-card" onClick={e => e.stopPropagation()} onPointerDown={e => e.stopPropagation()}>
              <div className="modal-icon"><TrashIcon size={20} weight="regular" aria-hidden="true" /></div>
              <h3 id="sidebar-delete-page-title">Delete page?</h3>
              <p><strong>{confirmPage.name}</strong> will be permanently deleted. A backup will be downloaded first.</p>
              <div className="modal-actions">
                <button className="btn btn-ghost" onClick={e => { e.stopPropagation(); setConfirmPage(null); }} onPointerDown={e => e.stopPropagation()}>Cancel</button>
                <button className="btn btn-danger" onClick={e => { e.stopPropagation(); handleDeletePageConfirm(); }} onPointerDown={e => e.stopPropagation()}>Delete</button>
              </div>
            </div>
          </div>
        )}
        {confirmFolder && (
          <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="sidebar-delete-folder-title" onClick={e => { e.stopPropagation(); if (e.target === e.currentTarget) setConfirmFolder(null); }} onPointerDown={e => e.stopPropagation()}>
            <div className="modal-card" onClick={e => e.stopPropagation()} onPointerDown={e => e.stopPropagation()}>
              <div className="modal-icon" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}><FolderIcon size={20} weight="regular" aria-hidden="true" /></div>
              <h3 id="sidebar-delete-folder-title">Delete folder?</h3>
              <p><strong>{confirmFolder.name}</strong> will be deleted. Its pages and subfolders will be moved up, not deleted.</p>
              <div className="modal-actions">
                <button className="btn btn-ghost" onClick={e => { e.stopPropagation(); setConfirmFolder(null); }} onPointerDown={e => e.stopPropagation()}>Cancel</button>
                <button className="btn btn-danger" onClick={e => { e.stopPropagation(); handleDeleteFolderConfirm(); }} onPointerDown={e => e.stopPropagation()}>Delete</button>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
