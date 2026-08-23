'use client';
import {useCallback,useEffect,useRef,useState,useMemo,type PointerEvent, memo} from 'react';
import type {Node as NodeType, NodeSize, NodeStyle} from '@/lib/types';
import {NODE_MIN_HEIGHT,NODE_TINTS,NODE_WIDTH,STATUS_META,STATUS_ORDER} from '@/lib/types';
import {statusSummary} from '@/lib/operations/status';
import {parseFormatting} from '@/lib/operations/formatting';
import StatusBadge from '../ui/StatusBadge';
import {useCanvasStore} from '@/lib/store';
import {PaletteIcon, Plus, DotsThree, Trash} from '@phosphor-icons/react';
import {isRoot, getAncestorIds} from '@/lib/operations/hierarchy';

const NODE_STYLES: { id: NodeStyle; label: string }[] = [
  { id: 'classic', label: 'Classic' },
  { id: 'sticky', label: 'Sticky' },
  { id: 'paper', label: 'Paper' },
  { id: 'highlight', label: 'Highlight' },
  { id: 'minimal', label: 'Minimal' },
];

/** Split text into first line and the remaining lines (null if single-line). */
function splitFirstLine(text: string): { first: string; rest: string | null } {
  const idx = text.indexOf('\n');
  if (idx === -1) return { first: text, rest: null };
  return { first: text.slice(0, idx), rest: text.slice(idx + 1) };
}

function NodeInner({node, childIds, viewportZoom}:{node:NodeType;childIds:string[];viewportZoom:number}) {
  const editing=useCanvasStore(s=>s.editingId);
  const just=useCanvasStore(s=>s.justCreatedId);
  const isSelected=useCanvasStore(s=>s.selectedNodeIds.includes(node.id));
  const allNodes=useCanvasStore(s=>s.canvas?.nodes??{});
  const canvas=useCanvasStore(s=>s.canvas), selectForInteraction=useCanvasStore(s=>s.selectForInteraction), connectingFrom=useCanvasStore(s=>s.connectingFrom), setConnectingFrom=useCanvasStore(s=>s.setConnectingFrom), setMouseWorld=useCanvasStore(s=>s.setMouseWorld), magneticTarget=useCanvasStore(s=>s.magneticTarget), setMagneticTarget=useCanvasStore(s=>s.setMagneticTarget), createConnection=useCanvasStore(s=>s.createConnection);
  const update=useCanvasStore(s=>s.update), setEditing=useCanvasStore(s=>s.setEditing), createChild=useCanvasStore(s=>s.createChild), createIndependentTopic=useCanvasStore(s=>s.createIndependentTopic), duplicateNode=useCanvasStore(s=>s.duplicateNode), remove=useCanvasStore(s=>s.remove), setNodeTint=useCanvasStore(s=>s.setNodeTint), setNodeStyle=useCanvasStore(s=>s.setNodeStyle), moveNodes=useCanvasStore(s=>s.moveNodes), moveNodesLive=useCanvasStore(s=>s.moveNodesLive), setNodeSize=useCanvasStore(s=>s.setNodeSize), toggleNode=useCanvasStore(s=>s.toggleNode);
  const revealIds=useCanvasStore(s=>s.revealIds);
  const setHoverId=useCanvasStore(s=>s.setHoverId);
  const [draft,setDraft]=useState(node.content); const input=useRef<HTMLTextAreaElement>(null);
  const [menuOpen,setMenuOpen]=useState(false);
  const [paletteOpen,setPaletteOpen]=useState(false);
  const [styleOpen,setStyleOpen]=useState(false);
  const [preview,setPreview]=useState<NodeSize|null>(null); const size=preview??node.size; const gripStart=useRef<{x:number;y:number;w:number;h:number}|null>(null);
  const cardRef=useRef<HTMLDivElement>(null);

  const summary=useMemo(()=>statusSummary(childIds.map(id=>allNodes[id]).filter(Boolean) as NodeType[]),[childIds,allNodes]);

  // Role is derived from hierarchy depth: 0 = main, 1 = child, 2+ = descendant.
  const depth=useMemo(()=>canvas?getAncestorIds(canvas,node.id).length:0,[canvas,node.id]);
  const roleClass=depth===0?'role-main':depth===1?'role-child':'role-descendant';

  const formattedContent=useMemo(()=>node.content?parseFormatting(node.content):null,[node.content]);

  // Presentational split of the first line vs. body. Storage is untouched.
  const lineSplit = useMemo(()=> node.content ? splitFirstLine(node.content) : { first: '', rest: null as string | null }, [node.content]);
  const firstLine = lineSplit.first;
  const restLines = lineSplit.rest;

  useEffect(()=>{
    const el=cardRef.current;
    if(!el)return;
    const ro=new ResizeObserver(()=>{
      const h=el.offsetHeight;
      update(c=>{
        const n=c.nodes[node.id];
        if(!n||!n.size||n.size.height===h)return;
        n.size={...n.size,height:h};
        n.updatedAt=Date.now();
      });
    });
    ro.observe(el);
    return()=>ro.disconnect();
  },[node.id,update]);
  const dragStart=useRef<{sx:number;sy:number;origins:Record<string,{x:number;y:number}>}|null>(null); const isDraggingNode=useRef(false);
  const adjustHeight=useCallback(()=>{const el=input.current;if(!el)return;if(size){el.style.height='auto';el.style.overflowY='auto';return;}el.style.height='auto';const h=Math.min(el.scrollHeight,240);el.style.height=h+'px';el.style.overflowY=el.scrollHeight>240?'auto':'hidden';},[size]);
  useEffect(()=>{if(editing===node.id){input.current?.focus();adjustHeight();}},[editing,node.id,adjustHeight]);
  useEffect(()=>{if(editing===node.id) adjustHeight();},[draft,editing,node.id,size,adjustHeight]);
  useEffect(()=>{
    if(!paletteOpen) return;
    const onKey=(e:KeyboardEvent)=>{ if(e.key==='Escape') setPaletteOpen(false); };
    window.addEventListener('keydown', onKey);
    return ()=> window.removeEventListener('keydown', onKey);
  },[paletteOpen]);
  useEffect(()=>{
    if(!menuOpen) return;
    const onKey=(e:KeyboardEvent)=>{ if(e.key==='Escape') setMenuOpen(false); };
    window.addEventListener('keydown', onKey);
    return ()=> window.removeEventListener('keydown', onKey);
  },[menuOpen]);
  useEffect(()=>{
    if(!styleOpen) return;
    const onKey=(e:KeyboardEvent)=>{ if(e.key==='Escape') setStyleOpen(false); };
    window.addEventListener('keydown', onKey);
    return ()=> window.removeEventListener('keydown', onKey);
  },[styleOpen]);
  const save=()=>{setEditing(null);update(c=>{c.nodes[node.id].content=draft;c.nodes[node.id].updatedAt=Date.now()})};
  const cycle=()=>update(c=>{const n=c.nodes[node.id];n.status=STATUS_ORDER[(STATUS_ORDER.indexOf(n.status)+1)%STATUS_ORDER.length]});
  const onGripDown=(e:PointerEvent<HTMLButtonElement>)=>{e.stopPropagation();e.preventDefault();const card=(e.currentTarget as HTMLElement).closest('.node-card') as HTMLElement|null;gripStart.current={x:e.clientX,y:e.clientY,w:node.size?.width??NODE_WIDTH,h:node.size?.height??(card?.offsetHeight||NODE_MIN_HEIGHT)};(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)};
  const onGripMove=(e:PointerEvent<HTMLButtonElement>)=>{const g=gripStart.current;if(!g)return;const w=Math.max(160,g.w+(e.clientX-g.x)),h=Math.max(NODE_MIN_HEIGHT,g.h+(e.clientY-g.y));setPreview({width:w,height:h});setNodeSize(node.id,{width:w,height:h})};
  const onGripUp=(e:PointerEvent<HTMLButtonElement>)=>{const g=gripStart.current;if(!g)return;gripStart.current=null;const w=Math.max(160,g.w+(e.clientX-g.x)),h=Math.max(NODE_MIN_HEIGHT,g.h+(e.clientY-g.y));setPreview(null);if(w!==g.w||h!==g.h)update(c=>{c.nodes[node.id].size={width:w,height:h};c.nodes[node.id].updatedAt=Date.now()})};
  const onGripDblClick=(e:React.MouseEvent)=>{e.stopPropagation();e.preventDefault();if(node.size)update(c=>{c.nodes[node.id].size=null;c.nodes[node.id].updatedAt=Date.now()})};
  const wrapSelection=(before:string,after:string)=>{const el=input.current;if(!el)return;const s=el.selectionStart??0,e=el.selectionEnd??0,sel=el.value.slice(s,e);setDraft(el.value.slice(0,s)+before+sel+after+el.value.slice(e));requestAnimationFrame(()=>{el.focus();el.setSelectionRange(s+before.length,e+before.length)})};
  const renderFormatted=(text:string)=>{const spans=parseFormatting(text);return spans.map((s,i)=>{let n:React.ReactNode=s.text;if(s.italic)n=<em key={i}>{n}</em>;if(s.bold)n=<strong key={i}>{n}</strong>;if(s.underline)n=<u key={i}>{n}</u>;return n;})};
  const styleClass=node.style?`style-${node.style}`:'';
  const editor=editing===node.id ? <div className="node-editor-wrap" onPointerDownCapture={e=>e.stopPropagation()}><textarea ref={input} className="node-editor" placeholder="What's this about?" spellCheck={false} value={draft} onChange={e=>setDraft(e.target.value)} onBlur={save} onKeyDown={e=>{if((e.ctrlKey||e.metaKey)&&!e.altKey&&(e.key==='b'||e.key==='i'||e.key==='u')){e.preventDefault();e.stopPropagation();if(e.key==='b')wrapSelection('**','**');else if(e.key==='i')wrapSelection('*','*');else wrapSelection('__','__');return;}if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();e.stopPropagation();save()} else if(e.key==='Escape'){e.preventDefault();e.stopPropagation();setEditing(null)}}} onInput={adjustHeight} /></div> : <div className="node-content" onPointerDownCapture={e=>e.stopPropagation()} onClick={()=>setEditing(node.id)}>{formattedContent? <><span className="node-title-line">{renderFormatted(firstLine)}</span>{restLines!=null&&<span className="node-body-line">{renderFormatted(restLines)}</span>}</> : "What's this about?"}</div>;
  const revealIndex=revealIds.indexOf(node.id);
  const isRevealing=revealIndex>=0;
  const cardStyle:React.CSSProperties={left:node.position.x,top:node.position.y, ...(node.tint ? {['--tint' as string]: node.tint} as React.CSSProperties : {})};
  if(size){cardStyle.width=size.width;cardStyle.height=size.height;}
  if(isRevealing){cardStyle.animationDelay=`${Math.min(revealIndex,10)*35}ms`;}
  const onNodeDragStart=(e:PointerEvent)=>{
    if(e.button!==0)return;
    const target=e.target as HTMLElement;
    if(target.closest('button, [role="button"], a, input, textarea, select, .node-content'))return;
    const ids=[node.id];
    const origins:Record<string,{x:number;y:number}>={};
    ids.forEach(id=>{const n=allNodes[id];if(n)origins[id]={x:n.position.x,y:n.position.y};});
    dragStart.current={sx:e.clientX,sy:e.clientY,origins};
    isDraggingNode.current=false;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onNodeDragMove=(e:PointerEvent)=>{
    const ds=dragStart.current;if(!ds)return;
    const dx=(e.clientX-ds.sx)/viewportZoom,dy=(e.clientY-ds.sy)/viewportZoom;
    if(!isDraggingNode.current&&Math.hypot(e.clientX-ds.sx,e.clientY-ds.sy)>3)isDraggingNode.current=true;
    if(isDraggingNode.current)moveNodesLive(Object.entries(ds.origins).map(([id,orig])=>({id,position:{x:orig.x+dx,y:orig.y+dy}})));
  };
  const onNodeDragEnd=(e:PointerEvent)=>{
    const ds=dragStart.current;if(!ds)return;
    dragStart.current=null;
    if(isDraggingNode.current){const dx=(e.clientX-ds.sx)/viewportZoom,dy=(e.clientY-ds.sy)/viewportZoom;moveNodes(Object.entries(ds.origins).map(([id,orig])=>({id,position:{x:orig.x+dx,y:orig.y+dy}})));}
    isDraggingNode.current=false;
  };
  return <div ref={cardRef} className={`node-card ${roleClass} ${styleClass} ${editing===node.id?'is-editing':''} ${just===node.id?'node-enter':''} ${node.tint?'is-tinted':''} ${isSelected?'is-selected':''} ${size?'is-sized':''} ${isRevealing?'node-reveal':''} ${magneticTarget===node.id?'node-magnet-target':''}`} style={cardStyle} onPointerDownCapture={e=>{if(e.button===0&&!isSelected)selectForInteraction(node.id)}} onPointerEnter={e=>{if(window.matchMedia('(hover: hover)').matches)setHoverId(node.id)}} onPointerLeave={()=>{if(window.matchMedia('(hover: hover)').matches)setHoverId(null)}} onPointerDown={onNodeDragStart} onPointerMove={onNodeDragMove} onPointerUp={onNodeDragEnd}>
    {/* Accent bar for main/root nodes */}
    {isRoot(node)&&<div className="nc-accent-top" aria-hidden="true" />}
    {/* Contextual more menu — absolute top-right, outside text flow */}
    <div className="node-ctx-controls">
      <button className={`more-btn ${menuOpen?'is-active':''}`} onClick={e=>{e.stopPropagation();setMenuOpen(v=>!v)}} aria-label="Node options" title="Options">
        <DotsThree size={16} weight="bold" aria-hidden="true" />
      </button>
      {menuOpen&&<>
        <div className="menu-backdrop" onClick={e=>{e.stopPropagation();setMenuOpen(false)}} aria-hidden="true" />
        <div className="node-menu" onClick={e=>e.stopPropagation()}>
          <button className="node-menu-item" onClick={()=>{setMenuOpen(false);wrapSelection('**','**');setEditing(null);update(c=>{c.nodes[node.id].content=draft;c.nodes[node.id].updatedAt=Date.now()})}}>
            <span className="node-menu-label">Bold</span>
            <span className="node-menu-hint">Ctrl+B</span>
          </button>
          <button className="node-menu-item" onClick={()=>{setMenuOpen(false);wrapSelection('*','*');setEditing(null);update(c=>{c.nodes[node.id].content=draft;c.nodes[node.id].updatedAt=Date.now()})}}>
            <span className="node-menu-label">Italic</span>
            <span className="node-menu-hint">Ctrl+I</span>
          </button>
          <button className="node-menu-item" onClick={()=>{setMenuOpen(false);wrapSelection('__','__');setEditing(null);update(c=>{c.nodes[node.id].content=draft;c.nodes[node.id].updatedAt=Date.now()})}}>
            <span className="node-menu-label">Underline</span>
            <span className="node-menu-hint">Ctrl+U</span>
          </button>
          <div className="node-menu-sep" />
          <button className="node-menu-item" onClick={()=>{setMenuOpen(false);setPaletteOpen(true)}}>
            <span className="node-menu-label">Node colour</span>
            <span className="node-menu-arrow" style={{background:node.tint||'#888'}} />
          </button>
          <button className="node-menu-item" onClick={()=>{setMenuOpen(false);setStyleOpen(true)}}>
            <span className="node-menu-label">Node style</span>
            <span className="node-menu-arrow">{node.style||'classic'}</span>
          </button>
          <div className="node-menu-sep" />
          <button className="node-menu-item" onClick={()=>{setMenuOpen(false);duplicateNode(node.id)}}>
            <span className="node-menu-label">Duplicate</span>
            <span className="node-menu-hint">⌘D</span>
          </button>
          <button className="node-menu-item node-menu-danger" onClick={()=>{setMenuOpen(false);if(!childIds.length||confirm('Delete this node and its descendants?'))remove(node.id)}}>
            <span className="node-menu-label">Delete</span>
          </button>
        </div>
      </>}
    </div>
    <div className="node-top"><div className="node-main"><StatusBadge status={node.status} onClick={cycle}/>{childIds.length>0&&<button className={`chevron ${node.isCollapsed?'':'open'}`} onClick={()=>toggleNode(node.id)}>›</button>}{editor}</div></div>
    {isRoot(node)&&<button className="node-action-add node-action-left" onClick={()=>createIndependentTopic(node.id)} aria-label="New topic" title="New topic"><Plus size={14} weight="regular" aria-hidden="true" /></button>}
    <button className="node-action-add node-action-right" onClick={()=>createChild(node.id)} aria-label="Add child" title="Add child"><Plus size={14} weight="regular" aria-hidden="true" /></button>
    <button
      className={`node-port ${connectingFrom&&connectingFrom!==node.id?'node-port-active':''} ${magneticTarget===node.id?'node-port-magnet':''}`}
      onPointerDown={e=>{
        e.stopPropagation(); e.preventDefault();
        setConnectingFrom(node.id);
      }}
      onPointerMove={e=>{
        if(!connectingFrom||connectingFrom!==node.id)return;
        const vp=(e.currentTarget as HTMLElement).closest('#viewport')?.getBoundingClientRect();
        if(!vp||!canvas)return;
        const wx=(e.clientX-vp.left-canvas.viewport.x)/canvas.viewport.zoom;
        const wy=(e.clientY-vp.top-canvas.viewport.y)/canvas.viewport.zoom;
        setMouseWorld({x:wx,y:wy});
      }}
      onPointerUp={e=>{
        if(connectingFrom&&connectingFrom!==node.id){
          createConnection(connectingFrom,node.id);
        }
        setConnectingFrom(null);setMouseWorld(null);setMagneticTarget(null);
      }}
      aria-label="Drag to connect"
      title="Connect to another node"
    />
    {paletteOpen&&<>
      <div className="palette-backdrop" onClick={e=>{e.stopPropagation(); setPaletteOpen(false)}} aria-hidden="true" />
      <div className="palette-palette" onClick={e=>e.stopPropagation()} aria-label="Node color palette">
        {NODE_TINTS.map(t=>(
          <button key={t.id} className={`palette-swatch ${node.tint===t.color?'is-active':''}`} style={{background:t.color}} title={t.label} aria-label={t.label} onClick={()=>{setNodeTint(node.id,t.color); setPaletteOpen(false)}} />
        ))}
        <button className={`palette-swatch palette-clear ${!node.tint?'is-active':''}`} title="Clear" aria-label="Clear color" onClick={()=>{setNodeTint(node.id,null); setPaletteOpen(false)}}>×</button>
      </div>
    </>}
    {styleOpen&&<>
      <div className="style-backdrop" onClick={e=>{e.stopPropagation(); setStyleOpen(false)}} aria-hidden="true" />
      <div className="style-popover" onClick={e=>e.stopPropagation()} aria-label="Node style">
        {NODE_STYLES.map(s=>(
          <button key={s.id} className={`style-card ${(node.style===s.id||(node.style==null&&s.id==='classic'))?'is-active':''}`} onClick={()=>{setNodeStyle(node.id, s.id==='classic'?undefined:s.id); setStyleOpen(false)}}>
            <span className={`style-preview style-${s.id}`} aria-hidden="true" />
            <span className="style-label">{s.label}</span>
          </button>
        ))}
      </div>
    </>}
    {node.isCollapsed&&childIds.length>0&&<div className="node-meta"><span className="chip">{childIds.length} hidden</span>{(['failed','review','mastered'] as const).map(k=>summary[k]?<span key={k} className={`chip chip-${k}`}><b>{summary[k]}{STATUS_META[k].short}</b></span>:null)}</div>}
    <button type="button" className="resize-grip" aria-label="Resize node" title="Drag to resize · double-click to reset" onPointerDown={onGripDown} onPointerMove={onGripMove} onPointerUp={onGripUp} onDoubleClick={onGripDblClick}/>
  </div>;
}

export default memo(NodeInner);
