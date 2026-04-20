import React from 'react';
import logo from '../assets/logo.png'; 

const ToolBar = ({ children }) => {
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
      
      {/* CỔNG DỊCH CHUYỂN LOCAL: Nhảy sang xưởng kho bãi (Excel Mode) */}
      <a 
        href="http://localhost:5174" 
        target="_blank" 
        rel="noopener noreferrer" 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '10px',
          marginRight: '15px',
          textDecoration: 'none', 
          cursor: 'pointer'
        }}
      >
        <img 
          src={logo} 
          alt="Maidas Logo" 
          style={{ 
            height: '42px', 
            width: 'auto',
            filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.15))'
          }} 
        />
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <span style={{ 
            color: '#ffffff', 
            fontWeight: 'bold', 
            fontSize: '10px', 
            letterSpacing: '2px', 
            fontFamily: 'sans-serif',
            lineHeight: '1.2'
          }}>
            MAIDAS
          </span>
          <span style={{ 
            color: 'rgba(255, 255, 255, 0.4)', 
            fontSize: '8px',
            letterSpacing: '1px'
          }}>
            FACTORY
          </span>
        </div>
      </a>

      <div style={{ width: '1px', height: '24px', backgroundColor: 'rgba(255,255,255,0.15)', margin: '0 10px' }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {children}
      </div>
      
    </div>
  );
};

export default ToolBar;