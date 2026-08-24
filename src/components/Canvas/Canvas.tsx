'use client';
import {useEffect,useRef,useState,useCallback,useMemo} from 'react';
import {motion} from 'motion/react';
import {useCanvasStore} from '@/lib/store';
import {children,visibleOrder} from '@/lib/operations/hierarchy';
import {MAX_ZOOM,MIN_ZOOM,NODE_MIN_HEIGHT,NODE_WIDTH,STATUS_META,CONNECTION_MAGNET_THRESHOLD,type Position,type Status} from '@/lib/types';
import Node from './Node';
import Annotation from './Annotation';
import Edges from './Edges';
import Toolbar from './Toolbar';
import PresentationBar from './PresentationBar';
import {MagnifyingGlass,MagicWand,Plus,Minus,Sparkle} from '@phosphor-icons/react';
import useStatusShortcuts from '@/hooks/useStatusShortcuts';
import useHistoryShortcuts from '@/hooks/useHistoryShortcuts';
import useHelpShortcut from '@/hooks/useHelpShortcut';
import DataPortability from './DataPortability';
import KnowledgeDialPanel from './KnowledgeDialPanel';
import HelpPanel from './HelpPanel';
import ThemeToggle from './ThemeToggle';
import ThemeManager from './ThemeManager';
import KineticGrid from '@/components/ui/kinetic-grid';

export default function Canvas({canvasId}:{canvasId:string}) {
  const canvas=useCanvasStore(s=>s.canvas), init=useCanvasStore(s=>s.init), update=useCanvasStore(s=>s.update), createRoot=useCanvasStore(s=>s.createRoot), saved=useCanvasStore(s=>s.saved), clearSelection=useCanvasStore(s=>s.clearSelection), editingId=useCanvasStore(s=>s.editingId), recordHistory=useCanvasStore(s=>s.recordHistory), moveNodes=useCanvasStore(s=>s.moveNodes), moveNodesLive=useCanvasStore(s=>s.moveNodesLive), selectNodes=useCanvasStore(s=>s.selectNodes), createAnnotation=useCanvasStore(s=>s.createAnnotation), focusMode=useCanvasStore(s=>s.focusMode), setFocusMode=useCanvasStore(s=>s.setFocusMode), presentationMode=useCanvasStore(s=>s.presentationMode), selectedNodeIds=useCanvasStore(s=>s.selectedNodeIds), justCreatedId=useCanvasStore(s=>s.justCreatedId), connectingFrom=useCanvasStore(s=>s.connectingFrom), mouseWorld=useCanvasStore(s=>s.mouseWorld), magneticTarget=useCanvasStore(s=>s.magneticTarget), setMagneticTarget=useCanvasStore(s=>s.setMagneticTarget), setConnectingFrom=useCanvasStore(s=>s.setConnectingFrom), selectedConnection=useCanvasStore(s=>s.selectedConnection), setSelectedConnection=useCanvasStore(s=>s.setSelectedConnection), specialMode=useCanvasStore(s=>s.specialMode), setSpecialMode=useCanvasStore(s=>s.setSpecialMode), setTheme=useCanvasStore(s=>s.setTheme);
  const isMultiSelected=selectedNodeIds.length>1;
  const ref=useRef<HTMLDivElement>(null);
  const [themesOpen,setThemesOpen]=useState(false);
  const [mounted,setMounted]=useState(false);
  const [dragState,setDragState]=useState<{id:string;sx:number;sy:number;orig:Record<string,Position>}|null>(null);
  const [panState,setPanState]=useState<{sx:number;sy:number;ox:number;oy:number}|null>(null);
  const [lassoState,setLassoState]=useState<{sx:number;sy:number;cx:number;cy:number}|null>(null);
  const rafRef=useRef<number>(0);
  const pending=useRef<{dx:number;dy:number;panDx:number;panDy:number;active:boolean}>({dx:0,dy:0,panDx:0,panDy:0,active:false});
  const zoom=canvas?.viewport.zoom??1;

  useStatusShortcuts();
  useHistoryShortcuts();
  useHelpShortcut();

  // `specialMode` is loaded from localStorage on the client, so it is not known
  // during SSR. Only apply special-mode rendering after hydration so the server
  // and first client render match (prevents a React hydration mismatch on the
  // <canvas> vs dotted-grid <div> swap).
  useEffect(() => {
    setMounted(true);
  }, []);

  // Special mode is a night/dark experience only — force the dark theme on and
  // keep it there (the light/dark toggle is disabled in Special mode).
  useEffect(() => {
    if (specialMode) setTheme('dark');
  }, [specialMode, setTheme]);
  useEffect(()=>{
    const onKey=(e:KeyboardEvent)=>{ if(e.key==='Escape'&&connectingFrom){setConnectingFrom(null);useCanvasStore.setState({mouseWorld:null,magneticTarget:null});}};
    window.addEventListener('keydown', onKey);
    return ()=> window.removeEventListener('keydown', onKey);
  },[connectingFrom,setConnectingFrom]);
  useEffect(()=>{
    const onKey=(e:KeyboardEvent)=>{
      if(e.key==='Delete'||e.key==='Backspace'){
        // If a connection is selected, delete it
        const { selectedConnection, setSelectedConnection, removeConnection } = useCanvasStore.getState();
        if(selectedConnection){e.preventDefault();const {a,b}=selectedConnection;removeConnection(a,b);setSelectedConnection(null);return}
        // If a node is selected and user is not editing text, delete the node
        const { selectedNodeIds, editingId, remove, clearSelection } = useCanvasStore.getState();
        if(!selectedNodeIds.length || editingId !== null) return;
        const active = document.activeElement as HTMLElement | null;
        if(active && (active.tagName==='INPUT' || active.tagName==='TEXTAREA' || active.isContentEditable)) return;
        e.preventDefault();
        for(const id of [...selectedNodeIds]) remove(id);
        clearSelection();
      }
    };
    window.addEventListener('keydown', onKey);
    return ()=> window.removeEventListener('keydown', onKey);
  },[setSelectedConnection]);
  useEffect(()=>{init(canvasId,{x:window.innerWidth,y:window.innerHeight})},[canvasId,init]);

  // --- derived data (hooks must always run, before conditional render) ---
  const order=useMemo(()=>canvas?visibleOrder(canvas):[],[canvas]);
  const childIdMap=useMemo(()=>{
    const m:Record<string,string[]>={};
    if(canvas)for(const id of order){m[id]=children(canvas,id).map(n=>n.id);}
    return m;
  },[canvas,order]);

  const flush=useCallback(()=>{
    const p=pending.current;if(!p.active)return;
    p.active=false;
    if(dragState){
      const keys=Object.keys(dragState.orig);
      if(keys.length>1){
        moveNodesLive(keys.map(gid=>({id:gid,position:{x:dragState.orig[gid].x+p.dx,y:dragState.orig[gid].y+p.dy}})));
      }else{
        useCanvasStore.setState(s=>{if(!s.canvas)return s;const c=structuredClone(s.canvas);const nn=c.nodes[dragState.id];if(nn)nn.position={x:dragState.orig[dragState.id].x+p.dx,y:dragState.orig[dragState.id].y+p.dy};return {canvas:c}});
      }
    }
    if(panState)update(c=>{c.viewport.x=panState.ox+p.panDx;c.viewport.y=panState.oy+p.panDy});
    pending.current.dx=0;pending.current.dy=0;pending.current.panDx=0;pending.current.panDy=0;
    rafRef.current=0;
  },[dragState,panState,moveNodesLive,update]);

  const scheduleFlush=useCallback(()=>{
    if(rafRef.current)return;
    rafRef.current=requestAnimationFrame(()=>{rafRef.current=0;flush()});
  },[flush]);

  const changeZoom=(target:number,mx=(ref.current?.clientWidth||0)/2,my=(ref.current?.clientHeight||0)/2)=>update(c=>{const z=Math.max(MIN_ZOOM,Math.min(MAX_ZOOM,target)),old=c.viewport.zoom,wx=(mx-c.viewport.x)/old,wy=(my-c.viewport.y)/old;c.viewport={x:mx-wx*z,y:my-wy*z,zoom:z}});
  const fit=()=>{
    if(!canvas)return;
    const ns=Object.values(canvas.nodes);
    if(!ns.length){update(c=>{c.viewport={x:0,y:0,zoom:1}});return}
    const minX=Math.min(...ns.map(n=>n.position.x)),minY=Math.min(...ns.map(n=>n.position.y)),maxX=Math.max(...ns.map(n=>n.position.x+NODE_WIDTH)),maxY=Math.max(...ns.map(n=>n.position.y+NODE_MIN_HEIGHT)),w=ref.current!.clientWidth,h=ref.current!.clientHeight,z=Math.max(MIN_ZOOM,Math.min((w-110)/(maxX-minX),(h-110)/(maxY-minY),1));
    update(c=>{c.viewport={zoom:z,x:(w-(maxX-minX)*z)/2-minX*z,y:(h-(maxY-minY)*z)/2-minY*z}});
  };

  // --- render ---
  const busy=!!dragState||!!panState||!!lassoState;
  const busyClass=busy?'is-dragging':'';

  const gridStyle:React.CSSProperties={
    backgroundSize:`${26*zoom}px ${26*zoom}px`,
    backgroundPosition:`${canvas?.viewport.x??0}px ${canvas?.viewport.y??0}px`,
  };
  let viewportTransform:React.CSSProperties|undefined;
  if(panState){
    const pd=pending.current;
    if(pd.active)viewportTransform={transform:`translate(${pd.panDx}px,${pd.panDy}px)`};
  }

  return (
    <>
    <div
      id="viewport"
      ref={ref}
      style={viewportTransform}
      data-theme={(specialMode&&mounted)?'dark':undefined}
      className={`${panState?'panning':''} ${lassoState?'lassoing':''} ${busyClass}${(specialMode&&mounted)?' special-mode':''}`}
      onPointerDown={e=>{
        if((e.target as Element).closest('.node-card, .annotation'))return;
        if(e.shiftKey){if(editingId)return;setLassoState({sx:e.clientX,sy:e.clientY,cx:e.clientX,cy:e.clientY});(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);return;}
        clearSelection();setPanState({sx:e.clientX,sy:e.clientY,ox:canvas?.viewport.x??0,oy:canvas?.viewport.y??0});(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      }}
      onPointerMove={e=>{
        if(lassoState){setLassoState(l=>({...l!,cx:e.clientX,cy:e.clientY}));return;}
        if(dragState){
          pending.current.dx=(e.clientX-dragState.sx)/zoom;
          pending.current.dy=(e.clientY-dragState.sy)/zoom;
          pending.current.active=true;
          scheduleFlush();
        }else if(panState){
          pending.current.panDx=e.clientX-panState.sx;
          pending.current.panDy=e.clientY-panState.sy;
          pending.current.active=true;
          scheduleFlush();
        }
        // Connection drag: update mouseWorld + magnetic target
        if(connectingFrom&&canvas){
          const vp=ref.current?.getBoundingClientRect();
          if(vp){
            const wx=(e.clientX-vp.left-canvas.viewport.x)/canvas.viewport.zoom;
            const wy=(e.clientY-vp.top-canvas.viewport.y)/canvas.viewport.zoom;
            useCanvasStore.setState({mouseWorld:{x:wx,y:wy}});
            // Find closest node center within threshold
            let best:string|null=null; let bestDist=Infinity;
            for(const n of Object.values(canvas.nodes)){
              if(n.id===connectingFrom)continue;
              const cx=n.position.x+NODE_WIDTH/2;
              const cy=n.position.y+(n.size?.height??NODE_MIN_HEIGHT)/2;
              const d=Math.hypot(wx-cx,wy-cy);
              const thresh=CONNECTION_MAGNET_THRESHOLD/canvas.viewport.zoom;
              if(d<bestDist&&d<thresh){bestDist=d;best=n.id}
            }
            setMagneticTarget(best);
          }
        }
      }}
      onPointerUp={e=>{
        flush();
        if(lassoState){
          const x1=Math.min(lassoState.sx,lassoState.cx),y1=Math.min(lassoState.sy,lassoState.cy),x2=Math.max(lassoState.sx,lassoState.cx),y2=Math.max(lassoState.sy,lassoState.cy);
          setLassoState(null);
          if(x2-x1>=5||y2-y1>=5){
            const picked:string[]=[];
            const cards=ref.current?Array.from(ref.current.querySelectorAll<HTMLElement>('#nodes > .node-card')):[];
            cards.forEach((el,i)=>{const r=el.getBoundingClientRect();if(r.left<x2&&r.right>x1&&r.top<y2&&r.bottom>y1)picked.push(order[i])});
            selectNodes(picked);
          }
        }
        if(dragState){
          const keys=Object.keys(dragState.orig);
          if(keys.length>1){const dx=(e.clientX-dragState.sx)/zoom,dy=(e.clientY-dragState.sy)/zoom;moveNodes(keys.map(gid=>({id:gid,position:{x:dragState.orig[gid].x+dx,y:dragState.orig[gid].y+dy}})))}
        }
        setPanState(null);setDragState(null);
        if(connectingFrom){setConnectingFrom(null);useCanvasStore.setState({mouseWorld:null,magneticTarget:null})}
      }}
      onWheel={e=>{e.preventDefault();const r=ref.current!.getBoundingClientRect();changeZoom((canvas?.viewport.zoom??1)*Math.exp(-e.deltaY*(e.ctrlKey?.008:.0018)),e.clientX-r.left,e.clientY-r.top)}}
    >
      {(specialMode&&mounted)
        ? <KineticGrid viewport={{x: canvas?.viewport.x ?? 0, y: canvas?.viewport.y ?? 0, zoom}} />
        : (
          <>
            <div id="paper" aria-hidden="true" />
            <div id="grid" aria-hidden="true" style={gridStyle} />
          </>
        )}
      {canvas ? (
        <div id="world" data-export-root style={{transform:`translate(${canvas.viewport.x}px,${canvas.viewport.y}px) scale(${zoom})`}}>
          <Edges />
          <div id="nodes">
            {order.map(id=>(
              <Node key={id} node={canvas.nodes[id]} childIds={childIdMap[id]??[]} viewportZoom={zoom} />
            ))}
            {canvas.annotations?.map(a=>(
              <Annotation key={a.id} ann={a} />
            ))}
          </div>
        </div>
      ) : (
        <div id="empty-state">
          <div className="empty-card" role="button" tabIndex={0}
            onClick={event=>{event.stopPropagation();createRoot({x:ref.current!.clientWidth,y:ref.current!.clientHeight})}}
            onKeyDown={event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();event.stopPropagation();createRoot({x:ref.current!.clientWidth,y:ref.current!.clientHeight})}}}
            aria-label="Create a new canvas">
            <h2>CREATE A CANVAS</h2>
            <p>Create a root node and start building your topic tree.</p>
            <span className="empty-hint">Press ? for shortcuts.</span>
          </div>
        </div>
      )}
    </div>

    <div className="tb-cluster">
      <Toolbar onAdd={()=>createRoot({x:ref.current!.clientWidth,y:ref.current!.clientHeight})} onAddText={()=>createAnnotation('text',{x:ref.current!.clientWidth,y:ref.current!.clientHeight})} onAddHeading={()=>createAnnotation('heading',{x:ref.current!.clientWidth,y:ref.current!.clientHeight})} onCollapse={()=>update(c=>Object.values(c.nodes).forEach(n=>{if(children(c,n.id).length)n.isCollapsed=true}))} onExpand={()=>update(c=>Object.values(c.nodes).forEach(n=>n.isCollapsed=false))}/>
      <DataPortability />
    </div>
    <div id="viewbar" className="ui-float">
      <button className="zb-btn" onClick={()=>changeZoom((canvas?.viewport.zoom??1)/1.2)} aria-label="Zoom out"><Minus size={16} weight="regular" aria-hidden="true"/></button>
      <button className="zb-btn" id="zoom-label" onClick={()=>changeZoom(1)} aria-label="Reset zoom">{Math.round((canvas?.viewport.zoom??1)*100)}%</button>
      <button className="zb-btn" onClick={()=>changeZoom((canvas?.viewport.zoom??1)*1.2)} aria-label="Zoom in"><Plus size={16} weight="regular" aria-hidden="true"/></button>
      <div className="zb-sep"/>
      <button className="zb-btn" onClick={fit} aria-label="Fit to screen" title="Fit to screen"><MagnifyingGlass size={16} weight="regular" aria-hidden="true"/></button>
      <ThemeToggle />
      <button className={`zb-btn special-mode-btn${(specialMode&&mounted)?' is-active':''}`} type="button" aria-label="Toggle special mode" title="Special mode" aria-pressed={specialMode&&mounted} onPointerDown={event=>event.stopPropagation()} onClick={event=>{event.stopPropagation();const next=!specialMode;if(next)setTheme('dark');setSpecialMode(next)}}><Sparkle size={16} weight="regular" aria-hidden="true"/></button>
      <button className="zb-btn theme-manager-trigger" type="button" aria-label="Open themes" title="Themes" onPointerDown={event=>event.stopPropagation()} onClick={event=>{event.stopPropagation();setThemesOpen(true)}}><MagicWand size={16} weight="regular" aria-hidden="true"/></button>
      <div className="zb-sep"/>
      <div id="save-ind" className={saved?'show':''}><span className="dot"/>Saved</div>
    </div>
    <KnowledgeDialPanel />
    <HelpPanel />
    <PresentationBar />
    <ThemeManager open={themesOpen} onClose={()=>setThemesOpen(false)} />
    </>
  );
}

