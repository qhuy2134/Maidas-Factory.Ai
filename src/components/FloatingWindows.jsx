import React from 'react';

const FloatingWindows = ({ tabs, dragRef, coreAPI, maidasTools, dockTabManually, removeTab, handleRename }) => {
  const renderContent = (t) => {
    if (t.toolId) {
      const toolObj = maidasTools.find(tool => tool.id === t.toolId);
      if (toolObj && toolObj.renderMenu) return toolObj.renderMenu(coreAPI);
    }
    return <></>;
  };

  return (
    <>
      {tabs.filter(t => t.isFloating).map(t => (
        <div 
          key={t.id}
          style={{ position: 'absolute', left: t.x, top: t.y, width: t.w, height: t.h, backgroundColor: 'rgba(20, 20, 20, 0.95)', border: '1px solid #444', borderRadius: '6px', zIndex: 1000, display: 'flex', flexDirection: 'column', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', overflow: 'hidden' }}
        >
          <div 
            onMouseDown={(e) => { if (e.button === 0 && !e.target.closest('.win-btn') && !t.isRenaming) { dragRef.current = { type: 'window_move', id: t.id, startX: e.clientX, startY: e.clientY, initX: t.x, initY: t.y }; e.stopPropagation(); } }}
            onDoubleClick={() => handleRename(t.id, null, true)}
            style={{ height: '32px', width: '100%', backgroundColor: '#2a2a2a', cursor: 'move', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #111', padding: '0 10px', boxSizing: 'border-box', color: '#8ab4f8', fontSize: '11px', fontWeight: 'bold' }}
          >
            <div style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginRight: '10px' }}>
              {t.isRenaming ? <input autoFocus defaultValue={t.title} onBlur={(e) => handleRename(t.id, e.target.value, false)} onKeyDown={(e) => e.key === 'Enter' && handleRename(t.id, e.target.value, false)} style={{ background: '#000', color: '#fff', border: '1px solid #8ab4f8', outline: 'none', width: '90%', fontSize: '11px' }} /> : t.title}
            </div>
            <div className="win-btn" style={{ display: 'flex', gap: '15px', cursor: 'default' }}>
              <span onClick={(e) => dockTabManually(e, t.id)} style={{ cursor: 'pointer', color: '#ffffff', fontSize: '16px', lineHeight: '14px' }}>-</span>
              <span onClick={(e) => removeTab(e, t.id)} style={{ cursor: 'pointer', color: '#ffffff', fontSize: '14px', lineHeight: '14px' }}>✖</span>
            </div>
          </div>
          <div style={{ flex: 1, padding: '15px', color: '#eee', overflow: 'hidden' }}>
             {renderContent(t)}
          </div>
          <div onMouseDown={(e) => { dragRef.current = { type: 'window_resize', id: t.id, startX: e.clientX, startY: e.clientY, initW: t.w, initH: t.h }; e.stopPropagation(); }} style={{ position: 'absolute', bottom: 0, right: 0, width: '15px', height: '15px', cursor: 'nwse-resize', background: 'linear-gradient(135deg, transparent 50%, #555 50%)' }} />
        </div>
      ))}
    </>
  );
};

export default FloatingWindows;