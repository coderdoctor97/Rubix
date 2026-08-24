export type Status = 'none' | 'failed' | 'review' | 'mastered';
export type Position = { x:number; y:number };
export type NodeSize = { width:number; height:number };
export type NodeStyle = 'classic' | 'sticky' | 'paper' | 'highlight' | 'minimal';
export type TiptapDoc = { type: string; content?: TiptapDoc[]; text?: string; marks?: { type: string; attrs?: Record<string, unknown> }[]; attrs?: Record<string, unknown> };
export type Node = { id:string; doc?: TiptapDoc | null; content:string; parentId:string|null; position:Position; status:Status; isCollapsed:boolean; tint?: string | null; style?: NodeStyle; size?: NodeSize | null; createdAt:number; updatedAt:number };
export type AnnotationKind = 'text' | 'heading';
export type Annotation = { id:string; kind:AnnotationKind; content:string; position:Position; createdAt:number; updatedAt:number };
export type Connection = { a: string; b: string };
export type CanvasData = { id:string; name:string; nodes:Record<string,Node>; viewport:Position & {zoom:number}; connections:Connection[]; annotations?:Annotation[]; createdAt:number; updatedAt:number };
export const STATUS_ORDER:Status[]=['none','failed','review','mastered'];
export const STATUS_META:Record<Status,{label:string;color:string;short:string}>={none:{label:'Untagged',color:'#94a3b8',short:''},failed:{label:'Failed',color:'#ef4444',short:'F'},review:{label:'Needs review',color:'#f59e0b',short:'R'},mastered:{label:'Mastered',color:'#10b981',short:'M'}};
export interface NodeTint { id: string; label: string; color: string; }
export const NODE_TINTS: readonly NodeTint[] = [
{ id: 'slate', label: 'Slate', color: 'oklch(56% 0.11 245)' },
{ id: 'saffron', label: 'Saffron', color: 'oklch(78% 0.13 78)' },
{ id: 'sage', label: 'Sage', color: 'oklch(60% 0.10 150)' },
{ id: 'clay', label: 'Clay', color: 'oklch(62% 0.11 28)' },
{ id: 'lilac', label: 'Lilac', color: 'oklch(58% 0.11 300)' },
{ id: 'sky', label: 'Sky', color: 'oklch(62% 0.09 210)' },
];
export const NODE_WIDTH=280, NODE_MIN_HEIGHT=60, HORIZONTAL_INDENT=320, VERTICAL_GAP=30, MIN_ZOOM=.25, MAX_ZOOM=2.5;
export const CONNECTION_MAGNET_THRESHOLD=60;
export type HeatmapMode = 'full' | 'mini' | 'hidden';
export type ThemeId = string;
export type Theme = ThemeId;
export interface CustomTheme { id:string; name:string; base:'light'|'dark'; colors:Record<string,string>; createdAt:number; updatedAt:number; }
export const THEME_TOKENS:readonly string[]=['--bg','--dot-grid','--surface','--panel-bg','--overlay','--hover','--chip-bg','--ink','--ink-2','--muted','--faint','--line','--line-2','--accent','--accent-hover','--accent-soft','--edge-line','--danger','--danger-soft','--success','--success-soft','--border-soft','--paper-bg','--paper-rule','--sticky-bg','--sticky-border'];
export const BUILT_IN_THEME_IDS=['light','dark'] as const;

export interface PortableCanvas { format: 'synapse-canvas'; formatVersion: number; name: string; viewport: { x: number; y: number; zoom: number }; nodes: Record<string, Node>; }

export interface Folder { id: string; name: string; parentId: string | null; pinned?: boolean; createdAt: number; updatedAt: number; }
export interface PageMeta { id: string; name: string; folderId: string | null; pinned?: boolean; createdAt: number; updatedAt: number; }
export interface CanvasIndex { schemaVersion: number; folders: Record<string, Folder>; pages: Record<string, PageMeta>; }
