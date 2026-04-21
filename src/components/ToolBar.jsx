import React, { useRef } from 'react';
import logo from '../assets/logo.png';
import { Link } from 'react-router-dom';

const ToolBar = ({ children }) => {
  const scrollRef = useRef(null);


  const handleWheel = (e) => {
    if (scrollRef.current) {
      e.preventDefault();

      scrollRef.current.scrollLeft += e.deltaY;
    }
  };

  return (
    <div style={{
      height: '48px',
      width: '100%',
      backgroundColor: '#1a1a1a', 
      borderBottom: '1px solid rgba(255, 255, 255, 0.4)', 
      display: 'flex',
      alignItems: 'center',
      padding: '0 10px',
      boxSizing: 'border-box',
      zIndex: 1000,
      position: 'relative',
      flexShrink: 0
    }}>
      
      {/* Logo và Link về Archive */}
      <Link 
        to="/archive" 
        target="_blank" 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '10px',
          marginRight: '15px',
          textDecoration: 'none', 
          flexShrink: 0 
        }}
      >
        <img src={logo} alt="Maidas Logo" style={{ height: '42px', width: 'auto' }} />
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <span style={{ color: '#ffffff', fontWeight: 'bold', fontSize: '10px', letterSpacing: '2px', fontFamily: 'sans-serif' }}>
            MAIDAS
          </span>
          <span style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '8px', letterSpacing: '1px' }}>
            FACTORY
          </span>
        </div>
      </Link>

      <div style={{ width: '1px', height: '24px', backgroundColor: 'rgba(255,255,255,0.15)', margin: '0 10px', flexShrink: 0 }} />

      <div 
        ref={scrollRef}
        onWheel={handleWheel}
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px', 
          flex: 1, 
          overflowX: 'auto',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
      >
        <style>{`
          div::-webkit-scrollbar { display: none; } /* Ẩn thanh cuộn trên Chrome/Safari */
        `}</style>
        
        {children}

      </div>
    </div>
  );
};

export default ToolBar;