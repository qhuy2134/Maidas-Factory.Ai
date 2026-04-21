import React, { useState, useEffect } from 'react';

const Sidebar = ({ children, width, setWidth, isOpen, setIsOpen }) => {
  const isRight = true; // Chốt cứng bên phải theo ý sếp

  // Logic kéo giãn Sidebar
  const startResizing = (e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = width;

    const doResizing = (moveEvent) => {
      // Vì nằm bên phải, nên kéo sang trái (giảm X) thì width tăng lên
      const newWidth = startWidth + (startX - moveEvent.clientX);
      if (newWidth > 200 && newWidth < 600) setWidth(newWidth);
    };

    const stopResizing = () => {
      document.removeEventListener('mousemove', doResizing);
      document.removeEventListener('mouseup', stopResizing);
    };

    document.addEventListener('mousemove', doResizing);
    document.addEventListener('mouseup', stopResizing);
  };

  return (
    <div 
      id="sidebar-container"
      style={{
        position: 'absolute', top: 0, right: 0, height: '100%',
        width: `${width}px`,
        backgroundColor: 'rgba(15, 15, 15, 0.95)',
        backdropFilter: 'blur(12px)',
        borderLeft: '1px solid rgba(255,255,255,0.1)',
        transform: isOpen ? 'translateX(0)' : `translateX(100%)`,
        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: 900, display: 'flex', flexDirection: 'column',
        boxShadow: isOpen ? '-5px 0 20px rgba(0,0,0,0.5)' : 'none'
      }}
    >
      {/* TAY CẦM RESIZE (Nằm ở cạnh trái Sidebar) */}
      <div 
        onMouseDown={startResizing}
        style={{
          position: 'absolute', left: 0, top: 0, width: '4px', height: '100%',
          cursor: 'col-resize', zIndex: 10
        }} 
      />

      {/* TAY CẦM ĐÓNG/MỞ (Nằm chính giữa) */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'absolute', top: '50%', left: '-24px',
          transform: 'translateY(-50%)', width: '24px', height: '60px',
          backgroundColor: 'rgba(15, 15, 15, 0.95)',
          border: '1px solid rgba(255,255,255,0.2)', borderRight: 'none',
          borderRadius: '8px 0 0 8px', display: 'flex', alignItems: 'center',
          justifyContent: 'center', cursor: 'pointer', color: 'rgba(255,255,255,0.6)'
        }}
      >
        <span style={{ fontSize: '10px' }}>{isOpen ? '▶' : '◀'}</span>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {children}
      </div>
    </div>
  );
};

export default Sidebar;