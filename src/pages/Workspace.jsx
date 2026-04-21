import React, { useRef, useState, useEffect } from 'react';
import Background from '../components/Background';
import MaidasMap from '../components/MaidasMap';
import ToolBar from '../components/ToolBar';
import { maidasTools } from '../tools/index';

const ToolButton = ({ label, isActive, onClick }) => (
  <button 
    onClick={onClick}
    style={{
      backgroundColor: isActive ? 'rgba(138, 180, 248, 0.15)' : 'transparent',
      border: isActive ? '1px solid #8ab4f8' : '1px solid rgba(255,255,255,0.1)',
      color: isActive ? '#fff' : 'rgba(255,255,255,0.5)',
      padding: '6px 15px', borderRadius: '4px', cursor: 'pointer',
      display: 'flex', alignItems: 'center', fontSize: '10px',
      fontWeight: 'bold', letterSpacing: '1px', transition: 'all 0.2s',
      outline: 'none', flexShrink: 0
    }}
    onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)' }}
    onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = 'transparent' }}
  >
    {label}
  </button>
);

function Workspace() {
  const containerRef = useRef(null);
  const contentRef = useRef(null);
  const tabsContainerRef = useRef(null); // Ref dùng để cuộn thanh Tabs

  const [activeTool, setActiveTool] = useState('cursor'); 
  const [activeColor, setActiveColor] = useState('#8ab4f8'); 
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const isPanning = useRef(false);
  const startPan = useRef({ x: 0, y: 0, tx: 0, ty: 0 });

  // ==========================================
  // HỆ THỐNG TÂM TRÍ TỔ ONG (CHROME TABS)
  // ==========================================
  const [tabs, setTabs] = useState([]);
  const [activeDockedTab, setActiveDockedTab] = useState(null);
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(350);

  const drag = useRef({ type: null, id: null, startX: 0, startY: 0, initX: 0, initY: 0, initW: 0, initH: 0 });

  const getDynamicMinScale = () => {
    if (!containerRef.current || !contentRef.current) return 1;
    const container = containerRef.current.getBoundingClientRect();
    const baseWidth = contentRef.current.offsetWidth;
    const baseHeight = contentRef.current.offsetHeight;
    return Math.max(container.width / baseWidth, container.height / baseHeight);
  };

  const clampPosition = (newX, newY, newScale) => {
    if (!containerRef.current || !contentRef.current) return { x: newX, y: newY };
    const containerRect = containerRef.current.getBoundingClientRect();
    const minX = containerRect.width - (contentRef.current.offsetWidth * newScale);
    const minY = containerRect.height - (contentRef.current.offsetHeight * newScale);
    return { x: Math.max(minX, Math.min(0, newX)), y: Math.max(minY, Math.min(0, newY)) };
  };

  const handleGlobalMouseDown = (e) => {
    if (e.button === 1 && e.target.closest('#map-container')) {
      e.preventDefault();
      isPanning.current = true;
      startPan.current = { x: e.clientX, y: e.clientY, tx: transform.x, ty: transform.y };
      document.body.style.cursor = 'move';
    }
  };

  const handleGlobalMouseMove = (e) => {
    if (isPanning.current) {
      const dx = e.clientX - startPan.current.x;
      const dy = e.clientY - startPan.current.y;
      setTransform(prev => ({ ...prev, ...clampPosition(startPan.current.tx + dx, startPan.current.ty + dy, prev.scale) }));
    } 
    else if (drag.current.type === 'sidebar_resize') {
      const newWidth = drag.current.initW + (drag.current.startX - e.clientX);
      if (newWidth > 250 && newWidth < 800) setSidebarWidth(newWidth);
    }
    else if (drag.current.type === 'tab') {
      const sidebarLeftEdge = window.innerWidth - sidebarWidth;
      if (e.clientX < sidebarLeftEdge && isSidebarOpen) {
        const newY = Math.max(0, e.clientY - 48 - 15);
        setTabs(prev => prev.map(t => t.id === drag.current.id ? { ...t, isFloating: true, x: e.clientX - 100, y: newY } : t));
        drag.current = { type: 'window_move', id: drag.current.id, startX: e.clientX, startY: e.clientY, initX: e.clientX - 100, initY: newY };
      }
    }
    else if (drag.current.type === 'window_move') {
      const newX = drag.current.initX + (e.clientX - drag.current.startX);
      let newY = drag.current.initY + (e.clientY - drag.current.startY);
      if (newY < 0) newY = 0;
      setTabs(prev => prev.map(t => t.id === drag.current.id ? { ...t, x: newX, y: newY } : t));
    }
    else if (drag.current.type === 'window_resize') {
      const newW = drag.current.initW + (e.clientX - drag.current.startX);
      const newH = drag.current.initH + (e.clientY - drag.current.startY);
      setTabs(prev => prev.map(t => t.id === drag.current.id ? { ...t, w: Math.max(250, newW), h: Math.max(150, newH) } : t));
    }
  };

  const handleGlobalMouseUp = (e) => {
    if (e.button === 1) {
      isPanning.current = false;
      document.body.style.cursor = 'default';
    }
    if (drag.current.type === 'window_move') {
      const sidebarLeftEdge = window.innerWidth - sidebarWidth;
      if (e.clientX >= sidebarLeftEdge - 20 && isSidebarOpen) {
        setTabs(prev => prev.map(t => t.id === drag.current.id ? { ...t, isFloating: false } : t));
        setActiveDockedTab(drag.current.id);
      }
    }
    drag.current = { type: null, id: null };
  };

  const handleWheel = (e) => {
    e.preventDefault(); 
    if (!containerRef.current || !contentRef.current) return;
    const delta = e.deltaY > 0 ? -0.05 : 0.05;
    const oldScale = transform.scale;
    let newScale = Math.max(getDynamicMinScale(), Math.min(oldScale + delta, 4)); 
    if (newScale === oldScale) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const newX = mouseX - (mouseX - transform.x) * (newScale / oldScale);
    const newY = mouseY - (mouseY - transform.y) * (newScale / oldScale);
    setTransform({ x: clampPosition(newX, newY, newScale).x, y: clampPosition(newX, newY, newScale).y, scale: newScale });
  };

  useEffect(() => {
    const el = containerRef.current;
    if (el) {
      el.addEventListener('wheel', handleWheel, { passive: false });
      return () => el.removeEventListener('wheel', handleWheel);
    }
  }, [transform]);

  const handleTabScroll = (e) => {
    if (tabsContainerRef.current) {
      tabsContainerRef.current.scrollLeft += e.deltaY;
    }
  };

  const addTab = () => {
    if (tabs.length >= 10) {
      alert("⚠️ Đã đạt giới hạn tối đa 10 Tab. Vui lòng xóa bớt!");
      return;
    }
    const newId = `tab_${Date.now()}`;
    // Đã đổi tên mặc định thành "New Tab"
    setTabs([...tabs, { id: newId, title: `New Tab`, isFloating: false, isRenaming: false, x: 200, y: 150, w: 350, h: 400 }]);
    setActiveDockedTab(newId);
    setIsSidebarOpen(true);
    

    setTimeout(() => {
      if (tabsContainerRef.current) {
        tabsContainerRef.current.scrollLeft = tabsContainerRef.current.scrollWidth;
      }
    }, 50);
  };

  const handleRename = (id, newTitle) => {
    const safeTitle = newTitle.trim() === '' ? 'Unnamed Tab' : newTitle;
    setTabs(prev => prev.map(t => t.id === id ? { ...t, isRenaming: false, title: safeTitle } : t));
  };

  const removeTab = (e, id) => {
    e.stopPropagation();
    const updatedTabs = tabs.filter(t => t.id !== id);
    setTabs(updatedTabs);
    if (activeDockedTab === id) {
      const dockedTabs = updatedTabs.filter(t => !t.isFloating);
      setActiveDockedTab(dockedTabs.length > 0 ? dockedTabs[dockedTabs.length - 1].id : null);
    }
  };

  const dockTabManually = (e, id) => {
    e.stopPropagation();
    setTabs(prev => prev.map(t => t.id === id ? { ...t, isFloating: false } : t));
    setActiveDockedTab(id);
    setIsSidebarOpen(true);
  };

  return (
    <div 
      style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#0f0f0f', overflow: 'hidden' }}
      onMouseDown={handleGlobalMouseDown} onMouseMove={handleGlobalMouseMove} 
      onMouseUp={handleGlobalMouseUp} onMouseLeave={handleGlobalMouseUp}
    >
      <ToolBar>
        {maidasTools.map(tool => (
          <ToolButton key={tool.id} label={tool.label} isActive={activeTool === tool.id} onClick={() => setActiveTool(tool.id)} />
        ))}
        <div style={{ width: '1px', height: '20px', backgroundColor: 'rgba(255,255,255,0.1)', margin: '0 10px', flexShrink: 0 }} />
      </ToolBar>

      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <Background />

        <div id="map-container" ref={containerRef} style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, zIndex: 1 }}>
          <div ref={contentRef} style={{ width: 'max-content', height: 'max-content', transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`, transformOrigin: '0 0', willChange: 'transform' }}>
            <MaidasMap camera={transform} />
          </div>
        </div>

        <div style={{
          position: 'absolute', top: 0, right: 0, height: '100%', width: `${sidebarWidth}px`,
          backgroundColor: 'rgba(20, 20, 20, 0.95)', backdropFilter: 'blur(10px)',
          borderLeft: '1px solid rgba(255,255,255,0.1)',
          transform: isSidebarOpen ? 'translateX(0)' : `translateX(100%)`,
          transition: drag.current.type === 'sidebar_resize' ? 'none' : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          zIndex: 900, display: 'flex', flexDirection: 'column',
          boxShadow: isSidebarOpen ? '-5px 0 20px rgba(0,0,0,0.5)' : 'none'
        }}>
          
          <div 
            onMouseDown={(e) => { drag.current = { type: 'sidebar_resize', startX: e.clientX, initW: sidebarWidth }; e.stopPropagation(); }}
            style={{ position: 'absolute', left: '-3px', top: 0, width: '6px', height: '100%', cursor: 'col-resize', zIndex: 10 }}
          />

          <div
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            style={{
              position: 'absolute', top: '50%', left: '-24px', transform: 'translateY(-50%)',
              width: '24px', height: '60px', backgroundColor: 'rgba(20, 20, 20, 0.95)',
              border: '1px solid rgba(255,255,255,0.2)', borderRight: 'none',
              borderRadius: '8px 0 0 8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'rgba(255,255,255,0.6)', boxShadow: '-2px 0 5px rgba(0,0,0,0.2)'
            }}
          >
            <span style={{ fontSize: '10px' }}>{isSidebarOpen ? '▶' : '◀'}</span>
          </div>

          <div style={{ padding: '10px 15px', color: '#ffffff', fontWeight: 'bold', fontSize: '10px', letterSpacing: '2px', borderBottom: '1px solid #222' }}>
            INTERACTIVE TAB
          </div>

          <div 
            ref={tabsContainerRef}
            onWheel={handleTabScroll}
            style={{ 
              display: 'flex', backgroundColor: '#111', borderBottom: '1px solid rgba(255,255,255,0.05)', 
              overflowX: 'auto', minHeight: '35px', scrollbarWidth: 'none', msOverflowStyle: 'none', scrollBehavior: 'smooth' 
            }}
          >
            <style>{`div::-webkit-scrollbar { display: none; }`}</style>
            
            {tabs.filter(t => !t.isFloating).map(t => (
              <div 
                key={t.id}
                onMouseDown={(e) => { if (e.button === 0 && !e.target.closest('.close-btn') && !t.isRenaming) { drag.current = { type: 'tab', id: t.id, startX: e.clientX, startY: e.clientY }; } }}
                onDoubleClick={() => setTabs(prev => prev.map(tab => tab.id === t.id ? { ...tab, isRenaming: true } : tab))}
                onClick={() => setActiveDockedTab(t.id)}
                style={{
                  padding: '6px 10px', cursor: 'grab', userSelect: 'none',
                  backgroundColor: activeDockedTab === t.id ? '#222' : 'transparent',
                  borderRight: '1px solid #222',
                  borderTop: activeDockedTab === t.id ? '2px solid #8ab4f8' : '2px solid transparent',
                  color: activeDockedTab === t.id ? '#fff' : 'rgba(255,255,255,0.5)',
                  fontSize: '11px', fontWeight: 'bold',
                  flexShrink: 0, width: '110px', // GIỮ FORM: Không co giãn, luôn rộng 110px
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '5px'
                }}
              >
                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                  {t.isRenaming ? (
                    <input 
                      autoFocus defaultValue={t.title}
                      onBlur={(e) => handleRename(t.id, e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleRename(t.id, e.target.value) }}
                      style={{ background: '#000', color: '#fff', border: '1px solid #8ab4f8', outline: 'none', width: '100%', fontSize: '11px' }}
                    />
                  ) : t.title}
                </div>
                <span className="close-btn" onClick={(e) => removeTab(e, t.id)} style={{ cursor: 'pointer', color: '#ffffff', padding: '2px', fontSize: '12px' }} title="Close">✖</span>
              </div>
            ))}

            <div onClick={addTab} style={{ padding: '8px 12px', cursor: 'pointer', color: '#8ab4f8', fontWeight: 'bold', fontSize: '14px', flexShrink: 0 }}>+</div>
          </div>

          <div style={{ flex: 1, padding: '20px', color: '#ccc', backgroundColor: '#1a1a1a', overflowY: 'auto' }}>

          </div>
        </div>

        {tabs.filter(t => t.isFloating).map(t => (
          <div 
            key={t.id}
            style={{
              position: 'absolute', left: t.x, top: t.y, width: t.w, height: t.h,
              backgroundColor: 'rgba(20, 20, 20, 0.95)', border: '1px solid #444',
              borderRadius: '6px', zIndex: 1000, display: 'flex', flexDirection: 'column',
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)', overflow: 'hidden'
            }}
          >
            <div 
              onMouseDown={(e) => { if (e.button === 0 && !e.target.closest('.win-btn') && !t.isRenaming) { drag.current = { type: 'window_move', id: t.id, startX: e.clientX, startY: e.clientY, initX: t.x, initY: t.y }; e.stopPropagation(); } }}
              onDoubleClick={() => setTabs(prev => prev.map(tab => tab.id === t.id ? { ...tab, isRenaming: true } : tab))}
              style={{ 
                height: '32px', width: '100%', backgroundColor: '#2a2a2a', cursor: 'move', 
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                borderBottom: '1px solid #111', padding: '0 10px', boxSizing: 'border-box',
                color: '#8ab4f8', fontSize: '11px', fontWeight: 'bold'
              }}
            >
              <div style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginRight: '10px' }}>
                {t.isRenaming ? (
                  <input 
                    autoFocus defaultValue={t.title}
                    onBlur={(e) => handleRename(t.id, e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleRename(t.id, e.target.value) }}
                    style={{ background: '#000', color: '#fff', border: '1px solid #8ab4f8', outline: 'none', width: '90%', fontSize: '11px' }}
                  />
                ) : t.title}
              </div>

              <div className="win-btn" style={{ display: 'flex', gap: '10px', cursor: 'default' }}>
                <span onClick={(e) => dockTabManually(e, t.id)} style={{ cursor: 'pointer', color: '#aaa', fontSize: '14px' }} title="Gắn lại vào Sidebar">-</span>
                <span onClick={(e) => removeTab(e, t.id)} style={{ cursor: 'pointer', color: '#ffffff', fontSize: '14px' }} title="Đóng">✖</span>
              </div>
            </div>

            <div style={{ flex: 1, padding: '15px', color: '#eee', overflow: 'hidden' }}>
               {/* TRỐNG */}
            </div>

            <div 
              onMouseDown={(e) => { if (e.button === 0) { drag.current = { type: 'window_resize', id: t.id, startX: e.clientX, startY: e.clientY, initW: t.w, initH: t.h }; e.stopPropagation(); } }}
              style={{ position: 'absolute', bottom: 0, right: 0, width: '15px', height: '15px', cursor: 'nwse-resize', background: 'linear-gradient(135deg, transparent 50%, #555 50%)' }}
            />
          </div>
        ))}

      </div>
    </div>
  );
}

export default Workspace;