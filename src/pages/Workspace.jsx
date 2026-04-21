import React, { useRef, useState, useEffect } from 'react';
import Background from '../components/Background';
import MaidasMap from '../components/MaidasMap';
import ToolBar from '../components/ToolBar';
import InteractiveTab from '../components/InteractiveTab';
import FloatingWindows from '../components/FloatingWindows';
import { maidasTools } from '../Tools/index';

const ToolButton = ({ label, isActive, onClick, image }) => (
  <button onClick={onClick} style={{ backgroundColor: isActive ? 'rgba(138, 180, 248, 0.15)' : 'transparent', border: isActive ? '1px solid #8ab4f8' : '1px solid rgba(255,255,255,0.1)', color: isActive ? '#fff' : 'rgba(255,255,255,0.5)', padding: '6px 15px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '10px', fontWeight: 'bold', letterSpacing: '1px', transition: 'all 0.2s', outline: 'none', flexShrink: 0 }}>
    {image && <img src={image} alt={label} style={{ width: '16px', height: '16px', objectFit: 'contain' }} />}
    {label}
  </button>
);

// 🔥 BỘ PHẬN VẼ DÂY ĐIỆN ĐƯỢC NÂNG CẤP (CHO PHÉP BẤM CHỌN DÂY)
const CablesLayer = ({ cables, activeCable, portRefs, contentRef, transform, mode, selectedCableId, setSelectedCableId }) => {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (mode !== 'edit') return;
    let id; const loop = () => { setTick(t => t + 1); id = requestAnimationFrame(loop); };
    loop(); return () => cancelAnimationFrame(id);
  }, [mode]);

  if (mode !== 'edit') return null;

  const getMapPos = (nodeId, portId) => {
    const el = portRefs.current[`${nodeId}_${portId}`];
    if (!el || !contentRef.current) return { x: 0, y: 0 };
    const r = el.getBoundingClientRect(); const p = contentRef.current.getBoundingClientRect();
    return { x: (r.left + r.width / 2 - p.left) / transform.scale, y: (r.top + r.height / 2 - p.top) / transform.scale };
  };

  const getOffset = (portId) => {
    const DIST = 80;
    if (portId === 'topRight') return { dx: DIST, dy: -DIST };
    if (portId === 'bottomRight') return { dx: DIST, dy: DIST };
    if (portId === 'bottomLeft') return { dx: -DIST, dy: DIST };
    if (portId === 'topLeft') return { dx: -DIST, dy: -DIST };
    return { dx: 0, dy: 0 };
  };

  const drawBezier = (x1, y1, x2, y2, port1, port2) => {
    const o1 = getOffset(port1); const o2 = port2 ? getOffset(port2) : { dx: 0, dy: 0 };
    return `M ${x1} ${y1} C ${x1 + o1.dx} ${y1 + o1.dy}, ${x2 + o2.dx} ${y2 + o2.dy}, ${x2} ${y2}`;
  };

  return (
    <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 15, overflow: 'visible' }}>
      <defs>
        {cables.map(c => {
          const p1 = getMapPos(c.fromNode, c.fromPort); const p2 = getMapPos(c.toNode, c.toPort);
          return (
            <linearGradient key={`grad_${c.id}`} id={`grad_${c.id}`} gradientUnits="userSpaceOnUse" x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}>
              <stop offset="0%" stopColor="#F44336" />
              <stop offset="100%" stopColor="#4CAF50" />
            </linearGradient>
          )
        })}
      </defs>

      {/* RENDER CÁC SỢI CÁP */}
      {cables.map(c => {
        const p1 = getMapPos(c.fromNode, c.fromPort); const p2 = getMapPos(c.toNode, c.toPort);
        const d = drawBezier(p1.x, p1.y, p2.x, p2.y, c.fromPort, c.toPort);
        const isSelected = selectedCableId === c.id;

        return (
          // Bọc pointerEvents: 'auto' để có thể bấm vào cọng dây
          <g key={c.id} onClick={(e) => { e.stopPropagation(); setSelectedCableId(c.id); }} style={{ pointerEvents: 'auto', cursor: 'pointer' }}>
            {/* Lớp Hitbox trong suốt (Dày 15px để dễ bấm trúng) */}
            <path d={d} fill="none" stroke="transparent" strokeWidth="15" />
            {/* Lớp hiển thị thật sự */}
            <path d={d} fill="none" stroke={`url(#grad_${c.id})`} strokeWidth={isSelected ? "6" : "3"} style={{ filter: isSelected ? 'drop-shadow(0 0 6px #fff)' : 'none', transition: 'stroke-width 0.2s' }} />
          </g>
        );
      })}

      {/* RENDER DÂY ĐANG KÉO */}
      {activeCable && (
        <path d={drawBezier(getMapPos(activeCable.fromNode, activeCable.fromPort).x, getMapPos(activeCable.fromNode, activeCable.fromPort).y, activeCable.currentX, activeCable.currentY, activeCable.fromPort, null)} fill="none" stroke={activeCable.color} strokeWidth="3" strokeDasharray="6,4" />
      )}
    </svg>
  );
};

function Workspace() {
  const containerRef = useRef(null); const contentRef = useRef(null);
  const drag = useRef({ type: null, id: null, startX: 0, startY: 0, initX: 0, initY: 0, initW: 0, initH: 0 });
  const isPanning = useRef(false); const startPan = useRef({ x: 0, y: 0, tx: 0, ty: 0 });
  const portRefs = useRef({}); 

  const [mode, setMode] = useState('object'); 
  const [activeTool, setActiveTool] = useState('cursor'); 
  const [toolPayload, setToolPayload] = useState(null); 
  const [placedItems, setPlacedItems] = useState([]); 
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [tabs, setTabs] = useState([]); const [activeDockedTab, setActiveDockedTab] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); const [sidebarWidth, setSidebarWidth] = useState(350);
  const [toolStates, setToolStates] = useState({});
  const [selection, setSelection] = useState({ start: null, end: null, isSelecting: false });
  const [clipboard, setClipboard] = useState(null);
  
  const [cables, setCables] = useState([]); 
  const [activeCable, setActiveCable] = useState(null);
  const [selectedCableId, setSelectedCableId] = useState(null); // 🔥 LƯU DÂY ĐANG ĐƯỢC CHỌN

  const getMapCoordinates = (clientX, clientY) => {
    if (!contentRef.current) return { x: 0, y: 0 };
    const rect = contentRef.current.getBoundingClientRect();
    return { x: (clientX - rect.left) / transform.scale, y: (clientY - rect.top) / transform.scale };
  };

  const coreAPI = {
    activeTool, toolPayload, placedItems, tabs, selection, mode,
    setActiveTool: (id, payload) => { setActiveTool(id); setToolPayload(payload); },
    addPlacedItem: (item) => setPlacedItems(prev => [...prev, item]),
    updatePlacedItem: (id, newData) => setPlacedItems(prev => prev.map(i => i.id === id ? { ...i, data: { ...i.data, ...newData } } : i)),
    getToolState: (toolId) => toolStates[toolId] || {},
    setToolState: (toolId, stateObj) => setToolStates(prev => ({ ...prev, [toolId]: { ...(prev[toolId] || {}), ...stateObj } })),
    
    registerPort: (nodeId, portId, el) => { portRefs.current[`${nodeId}_${portId}`] = el; },
    startCable: (e, nodeId, portId, type) => {
      e.stopPropagation(); const color = type === 'input' ? '#4CAF50' : '#F44336';
      const coords = getMapCoordinates(e.clientX, e.clientY);
      setActiveCable({ fromNode: nodeId, fromPort: portId, type, color, currentX: coords.x, currentY: coords.y });
    },
    endCable: (nodeId, portId, type) => {
      if (activeCable && activeCable.fromNode !== nodeId && activeCable.type !== type) {
        const isOut = activeCable.type === 'output';
        setCables(prev => [...prev, {
          id: `cable_${Date.now()}`,
          fromNode: isOut ? activeCable.fromNode : nodeId, fromPort: isOut ? activeCable.fromPort : portId,
          toNode: isOut ? nodeId : activeCable.fromNode, toPort: isOut ? portId : activeCable.fromPort
        }]);
      }
      setActiveCable(null);
    },
    // 🔥 API MỚI: Bẻ gãy toàn bộ dây cắm vào 1 cổng (Dùng khi đổi Port sang Trống)
    removeConnectedCables: (nodeId, portId) => {
      setCables(prev => prev.filter(c => !(c.fromNode === nodeId && c.fromPort === portId) && !(c.toNode === nodeId && c.toPort === portId)));
    },

    openToolTab: (toolId, title) => {
      setTabs(prev => {
        const existingIndex = prev.findIndex(t => t.toolId === toolId);
        if (existingIndex >= 0) { const updated = [...prev]; updated[existingIndex] = { ...updated[existingIndex], isFloating: false }; setActiveDockedTab(updated[existingIndex].id); setIsSidebarOpen(true); return updated; }
        if (prev.length >= 10) { alert("⚠️ Đã đạt giới hạn 10 Tab."); return prev; }
        const newId = `tab_${Date.now()}`; setActiveDockedTab(newId); setIsSidebarOpen(true);
        return [...prev, { id: newId, title, toolId, isFloating: false, isRenaming: false, x: 200, y: 150, w: 380, h: 500 }];
      });
    },
    addTab: (title = 'New Tab') => {
      setTabs(prev => {
        if (prev.length >= 10) return prev;
        const newId = `tab_${Date.now()}`; setActiveDockedTab(newId); setIsSidebarOpen(true);
        return [...prev, { id: newId, title, toolId: null, isFloating: false, isRenaming: false, x: 200, y: 150, w: 350, h: 400 }];
      });
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      // 🔥 XÓA CÁP ĐANG CHỌN
      if (e.key === 'Delete' && selectedCableId) {
        setCables(prev => prev.filter(c => c.id !== selectedCableId));
        setSelectedCableId(null);
        return; 
      }

      if (!selection.start || !selection.end) return;
      const minRow = Math.min(selection.start.r, selection.end.r); const maxRow = Math.max(selection.start.r, selection.end.r);
      const minCol = Math.min(selection.start.c, selection.end.c); const maxCol = Math.max(selection.start.c, selection.end.c);
      const itemsInSelection = placedItems.filter(i => i.row >= minRow && i.row <= maxRow && i.col >= minCol && i.col <= maxCol);
      
      // XÓA RƯƠNG TRONG VÙNG CHỌN
      if (e.key === 'Delete') { 
        setPlacedItems(prev => prev.filter(i => !itemsInSelection.find(sel => sel.id === i.id))); 
        // 🔥 ĐỒNG THỜI XÓA SẠCH DÂY ĐIỆN CẮM VÀO NHỮNG RƯƠNG ĐÃ XÓA
        const deletedIds = itemsInSelection.map(i => i.id);
        setCables(prev => prev.filter(c => !deletedIds.includes(c.fromNode) && !deletedIds.includes(c.toNode)));
      }
      
      if (e.ctrlKey && e.key === 'c') { setClipboard({ items: itemsInSelection, width: maxCol - minCol + 1, height: maxRow - minRow + 1, minRow: minRow, minCol: minCol }); }
      if (e.ctrlKey && e.key === 'v') {
        if (clipboard && clipboard.items) {
          const selWidth = maxCol - minCol + 1; const selHeight = maxRow - minRow + 1;
          if (selWidth !== clipboard.width || selHeight !== clipboard.height) return alert(`⚠️ Kích thước Paste không khớp.`);
          const newItems = clipboard.items.map((item, idx) => ({ ...item, id: Date.now() + idx + Math.random(), row: minRow + (item.row - clipboard.minRow), col: minCol + (item.col - clipboard.minCol) }));
          setPlacedItems(prev => { const filtered = prev.filter(p => !newItems.some(n => n.row === p.row && n.col === p.col)); return [...filtered, ...newItems]; });
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown); return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selection, placedItems, clipboard, selectedCableId]);

  const getDynamicMinScale = () => { if (!containerRef.current || !contentRef.current) return 1; const c = containerRef.current.getBoundingClientRect(); return Math.max(c.width / contentRef.current.offsetWidth, c.height / contentRef.current.offsetHeight); };
  const clampPosition = (newX, newY, newScale) => { if (!containerRef.current || !contentRef.current) return { x: newX, y: newY }; const c = containerRef.current.getBoundingClientRect(); return { x: Math.max(c.width - (contentRef.current.offsetWidth * newScale), Math.min(0, newX)), y: Math.max(c.height - (contentRef.current.offsetHeight * newScale), Math.min(0, newY)) }; };
  
  const handleGlobalMouseDown = (e) => { 
    setSelectedCableId(null); // Click ra ngoài là bỏ chọn cáp
    if (e.button === 1 && e.target.closest('#map-container')) { e.preventDefault(); isPanning.current = true; startPan.current = { x: e.clientX, y: e.clientY, tx: transform.x, ty: transform.y }; document.body.style.cursor = 'move'; } 
  };
  const handleGlobalMouseMove = (e) => {
    if (activeCable) {
      const coords = getMapCoordinates(e.clientX, e.clientY);
      setActiveCable(prev => ({ ...prev, currentX: coords.x, currentY: coords.y }));
    }
    else if (isPanning.current) setTransform(prev => ({ ...prev, ...clampPosition(startPan.current.tx + (e.clientX - startPan.current.x), startPan.current.ty + (e.clientY - startPan.current.y), prev.scale) }));
    else if (drag.current.type === 'sidebar_resize') setSidebarWidth(Math.max(250, Math.min(800, drag.current.initW + (drag.current.startX - e.clientX))));
    else if (drag.current.type === 'tab') {
      if (e.clientX < window.innerWidth - sidebarWidth && isSidebarOpen) {
        const newY = Math.max(0, e.clientY - 48 - 15);
        const remainingDocked = tabs.filter(t => !t.isFloating && t.id !== drag.current.id);
        if (activeDockedTab === drag.current.id) setActiveDockedTab(remainingDocked.length > 0 ? remainingDocked[remainingDocked.length - 1].id : null);
        setTabs(prev => prev.map(t => t.id === drag.current.id ? { ...t, isFloating: true, x: e.clientX - 100, y: newY } : t));
        drag.current = { type: 'window_move', id: drag.current.id, startX: e.clientX, startY: e.clientY, initX: e.clientX - 100, initY: newY };
      }
    }
    else if (drag.current.type === 'window_move') setTabs(prev => prev.map(t => t.id === drag.current.id ? { ...t, x: drag.current.initX + (e.clientX - drag.current.startX), y: Math.max(0, drag.current.initY + (e.clientY - drag.current.startY)) } : t));
    else if (drag.current.type === 'window_resize') setTabs(prev => prev.map(t => t.id === drag.current.id ? { ...t, w: Math.max(250, drag.current.initW + (e.clientX - drag.current.startX)), h: Math.max(150, drag.current.initH + (e.clientY - drag.current.startY)) } : t));
  };
  
  const handleGlobalMouseUp = (e) => {
    if (activeCable) setActiveCable(null);
    if (isPanning.current) { isPanning.current = false; document.body.style.cursor = 'default'; }
    if (drag.current.type === 'window_move' && e.clientX >= window.innerWidth - sidebarWidth - 20 && isSidebarOpen) { setTabs(prev => prev.map(t => t.id === drag.current.id ? { ...t, isFloating: false } : t)); setActiveDockedTab(drag.current.id); }
    if (selection.isSelecting) setSelection(prev => ({ ...prev, isSelecting: false }));
    drag.current.type = null;
  };

  const handleWheel = (e) => {
    e.preventDefault(); if (!containerRef.current || !contentRef.current) return;
    const zoomSensitivity = 0.002; const oldScale = transform.scale;
    const newScale = Math.max(getDynamicMinScale(), Math.min(oldScale * Math.exp(-e.deltaY * zoomSensitivity), 4));
    if (newScale === oldScale) return; 
    const r = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - r.left; const mouseY = e.clientY - r.top;
    const newX = mouseX - (mouseX - transform.x) * (newScale / oldScale);
    const newY = mouseY - (mouseY - transform.y) * (newScale / oldScale);
    setTransform({ x: clampPosition(newX, newY, newScale).x, y: clampPosition(newX, newY, newScale).y, scale: newScale });
  };
  
  useEffect(() => { const el = containerRef.current; if (el) { el.addEventListener('wheel', handleWheel, { passive: false }); return () => el.removeEventListener('wheel', handleWheel); } }, [transform]);

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#0f0f0f', overflow: 'hidden' }} onMouseDown={handleGlobalMouseDown} onMouseMove={handleGlobalMouseMove} onMouseUp={handleGlobalMouseUp} onMouseLeave={handleGlobalMouseUp}>
      <ToolBar>
        <button onClick={() => setMode(mode === 'object' ? 'edit' : 'object')} style={{ backgroundColor: mode === 'object' ? '#34a853' : '#ea4335', color: '#fff', border: 'none', padding: '6px 20px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '11px', letterSpacing: '1px', flexShrink: 0, marginRight: '10px' }}>
          {mode === 'object' ? '⬛ OBJECT MODE' : '⚙️ EDIT MODE'}
        </button>
        <div style={{ width: '1px', height: '20px', backgroundColor: 'rgba(255,255,255,0.2)', margin: '0 15px 0 5px', flexShrink: 0 }} />
        {maidasTools.map(tool => <ToolButton key={tool.id} label={tool.label} image={tool.image} isActive={activeTool === tool.id || activeTool.startsWith(tool.id)} onClick={() => tool.onToolbarClick && tool.onToolbarClick(coreAPI)} />)}
      </ToolBar>

      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <Background />
        <div id="map-container" ref={containerRef} style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, zIndex: 1 }}>
          <div ref={contentRef} style={{ width: 'max-content', height: 'max-content', transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`, transformOrigin: '0 0', willChange: 'transform' }}>

            <MaidasMap 
              camera={transform} activeTool={activeTool} placedItems={placedItems} selection={selection} setSelection={setSelection} mode={mode} coreAPI={coreAPI}
              onCellClick={(r, c) => maidasTools.forEach(tool => tool.onMapClick && tool.onMapClick(coreAPI, r, c))}
              onItemClick={(item) => {
                if (item.toolId === 'prompt_sphere') { coreAPI.openToolTab('prompt_setting', 'Prompt Setting'); coreAPI.setToolState('prompt_setting', { selectedItem: item }); }
              }}
              onCellDrop={(row, col, dragData) => {
                if (dragData && dragData.type === 'tool_item') { const isOccupied = placedItems.some(i => i.row === row && i.col === col); if (!isOccupied) { coreAPI.addPlacedItem({ id: Date.now(), toolId: dragData.toolId, row, col, data: dragData.data }); coreAPI.setToolState(dragData.toolId, { extractedPrompt: null }); } }
                else if (dragData && dragData.type === 'move_item') { const isOccupied = placedItems.some(i => i.row === row && i.col === col); if (!isOccupied) setPlacedItems(prev => prev.map(i => i.id === dragData.id ? { ...i, row, col } : i)); }
                else if (dragData && dragData.type === 'move_selection') {
                  const rOffset = row - dragData.startRow; const cOffset = col - dragData.startCol;
                  const selMinRow = Math.min(selection.start.r, selection.end.r); const selMaxRow = Math.max(selection.start.r, selection.end.r);
                  const selMinCol = Math.min(selection.start.c, selection.end.c); const selMaxCol = Math.max(selection.start.c, selection.end.c);
                  setPlacedItems(prev => {
                    const movingItems = prev.filter(i => i.row >= selMinRow && i.row <= selMaxRow && i.col >= selMinCol && i.col <= selMaxCol);
                    const movingIds = movingItems.map(i => i.id);
                    const movedItems = movingItems.map(i => ({ ...i, row: i.row + rOffset, col: i.col + cOffset }));
                    const remainingItems = prev.filter(i => !movingIds.includes(i.id) && !movedItems.some(m => m.row === i.row && m.col === i.col));
                    return [...remainingItems, ...movedItems];
                  });
                  setSelection(prev => ({ ...prev, start: { r: prev.start.r + rOffset, c: prev.start.c + cOffset }, end: { r: prev.end.r + rOffset, c: prev.end.c + cOffset } }));
                }
              }} 
            />
            {/* RENDER CÁP QUANG */}
            <CablesLayer cables={cables} activeCable={activeCable} portRefs={portRefs} contentRef={contentRef} transform={transform} mode={mode} selectedCableId={selectedCableId} setSelectedCableId={setSelectedCableId} />

          </div>
        </div>
        <InteractiveTab tabs={tabs} activeDockedTab={activeDockedTab} setActiveDockedTab={setActiveDockedTab} isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} sidebarWidth={sidebarWidth} setSidebarWidth={setSidebarWidth} dragRef={drag} coreAPI={coreAPI} maidasTools={maidasTools} removeTab={(e, id) => { e.stopPropagation(); setTabs(prev => { const updated = prev.filter(t => t.id !== id); if (activeDockedTab === id) setActiveDockedTab(updated.filter(t => !t.isFloating).slice(-1)[0]?.id || null); return updated; }); }} handleRename={(id, val, rename) => setTabs(prev => prev.map(t => t.id === id ? { ...t, isRenaming: rename, title: val || t.title } : t))} />
        <FloatingWindows tabs={tabs} dragRef={drag} coreAPI={coreAPI} maidasTools={maidasTools} dockTabManually={(e, id) => { setTabs(prev => prev.map(t => t.id === id ? { ...t, isFloating: false } : t)); setActiveDockedTab(id); setIsSidebarOpen(true); }} removeTab={(e, id) => setTabs(prev => prev.filter(t => t.id !== id))} handleRename={(id, val, rename) => setTabs(prev => prev.map(t => t.id === id ? { ...t, isRenaming: rename, title: val || t.title } : t))} />
      </div>
    </div>
  );
}

export default Workspace;