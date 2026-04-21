import React, { useRef } from 'react';

const InteractiveTab = ({ 
  tabs, activeDockedTab, setActiveDockedTab, 
  isSidebarOpen, setIsSidebarOpen, 
  sidebarWidth, setSidebarWidth, 
  dragRef, coreAPI, maidasTools, 
  handleRename, removeTab 
}) => {
  const tabsContainerRef = useRef(null);

  const renderContent = () => {
    // Chỉ render nếu Tab hiện tại ĐANG TỒN TẠI trong Dock (không phải hàng bay lơ lửng)
    const currentTab = tabs.find(t => t.id === activeDockedTab && !t.isFloating);
    if (currentTab && currentTab.toolId) {
      const toolObj = maidasTools.find(tool => tool.id === currentTab.toolId);
      if (toolObj && toolObj.renderMenu) return toolObj.renderMenu(coreAPI);
    }
    
    // Nếu không có Tab nào đang được chọn, hiển thị màn hình trống
    return (
      <div style={{ textAlign: 'center', color: '#555', marginTop: '40px', fontSize: '12px', fontStyle: 'italic' }}>
        Khu vực tương tác trống. <br/><br/> Bấm nút <b>[+]</b> ở trên để tạo Tab mới.
      </div>
    );
  };

  return (
    <div style={{
      position: 'absolute', top: 0, right: 0, height: '100%', width: `${sidebarWidth}px`,
      backgroundColor: 'rgba(20, 20, 20, 0.95)', backdropFilter: 'blur(10px)',
      borderLeft: '1px solid rgba(255,255,255,0.1)',
      transform: isSidebarOpen ? 'translateX(0)' : `translateX(100%)`,
      transition: dragRef.current.type === 'sidebar_resize' ? 'none' : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      zIndex: 900, display: 'flex', flexDirection: 'column',
      boxShadow: isSidebarOpen ? '-5px 0 20px rgba(0,0,0,0.5)' : 'none'
    }}>
      <div onMouseDown={(e) => { dragRef.current = { type: 'sidebar_resize', startX: e.clientX, initW: sidebarWidth }; e.stopPropagation(); }} style={{ position: 'absolute', left: '-3px', top: 0, width: '6px', height: '100%', cursor: 'col-resize', zIndex: 10 }} />
      <div onClick={() => setIsSidebarOpen(!isSidebarOpen)} style={{ position: 'absolute', top: '50%', left: '-24px', transform: 'translateY(-50%)', width: '24px', height: '60px', backgroundColor: 'rgba(20, 20, 20, 0.95)', border: '1px solid rgba(255,255,255,0.2)', borderRight: 'none', borderRadius: '8px 0 0 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'rgba(255,255,255,0.6)', boxShadow: '-2px 0 5px rgba(0,0,0,0.2)' }}><span style={{ fontSize: '10px' }}>{isSidebarOpen ? '▶' : '◀'}</span></div>
      <div style={{ padding: '10px 15px', color: '#ffffff', fontWeight: 'bold', fontSize: '10px', letterSpacing: '2px', borderBottom: '1px solid #222' }}>INTERACTIVE TAB</div>

      <div ref={tabsContainerRef} onWheel={(e) => { tabsContainerRef.current.scrollLeft += e.deltaY; }} style={{ display: 'flex', backgroundColor: '#111', borderBottom: '1px solid rgba(255,255,255,0.05)', overflowX: 'auto', minHeight: '35px', scrollbarWidth: 'none' }}>
        <style>{`div::-webkit-scrollbar { display: none; }`}</style>
        {tabs.filter(t => !t.isFloating).map(t => (
          <div 
            key={t.id}
            onMouseDown={(e) => { if (e.button === 0 && !e.target.closest('.close-btn') && !t.isRenaming) { dragRef.current = { type: 'tab', id: t.id, startX: e.clientX, startY: e.clientY }; } }}
            onDoubleClick={() => handleRename(t.id, null, true)}
            onClick={() => setActiveDockedTab(t.id)}
            style={{ padding: '6px 10px', cursor: 'grab', userSelect: 'none', backgroundColor: activeDockedTab === t.id ? '#222' : 'transparent', borderRight: '1px solid #222', borderTop: activeDockedTab === t.id ? '2px solid #8ab4f8' : '2px solid transparent', color: activeDockedTab === t.id ? '#fff' : 'rgba(255,255,255,0.5)', fontSize: '11px', fontWeight: 'bold', flexShrink: 0, width: '110px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '5px' }}
          >
            <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
              {t.isRenaming ? <input autoFocus defaultValue={t.title} onBlur={(e) => handleRename(t.id, e.target.value, false)} onKeyDown={(e) => e.key === 'Enter' && handleRename(t.id, e.target.value, false)} style={{ background: '#000', color: '#fff', border: '1px solid #8ab4f8', outline: 'none', width: '100%', fontSize: '11px' }} /> : t.title}
            </div>
            <span className="close-btn" onClick={(e) => removeTab(e, t.id)} style={{ cursor: 'pointer', color: '#ffffff', padding: '2px', fontSize: '12px' }}>✖</span>
          </div>
        ))}
        <div onClick={() => coreAPI.addTab()} style={{ padding: '8px 12px', cursor: 'pointer', color: '#8ab4f8', fontWeight: 'bold', fontSize: '14px', flexShrink: 0 }}>+</div>
      </div>

      <div style={{ flex: 1, padding: '20px', color: '#ccc', backgroundColor: '#1a1a1a', overflowY: 'auto' }}>
        {renderContent()}
      </div>
    </div>
  );
};

export default InteractiveTab;