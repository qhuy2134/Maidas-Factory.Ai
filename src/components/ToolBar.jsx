import React from 'react';
import logo from '../assets/logo.png';
import { Link } from 'react-router-dom'; // Dùng Link để chuyển trang mượt mà

const ToolBar = ({ children }) => {
  return (
    <div style={{
      height: '48px', width: '100%', backgroundColor: '#1a1a1a', 
      borderBottom: '1px solid rgba(255, 255, 255, 0.4)', 
      display: 'flex', alignItems: 'center', padding: '0 10px',
      boxSizing: 'border-box', zIndex: 1000, position: 'relative', flexShrink: 0
    }}>
      
      {/* LOGO LINK: Bấm vào là mở Nhà kho ở tab mới */}
      <Link 
        to="/archive" 
        target="_blank" 
        style={{ 
          display: 'flex', alignItems: 'center', gap: '10px',
          marginRight: '15px', textDecoration: 'none', cursor: 'pointer'
        }}
      >
        <img src={logo} alt="Maidas Logo" style={{ height: '42px', width: 'auto' }} />
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <span style={{ color: '#ffffff', fontWeight: 'bold', fontSize: '10px', letterSpacing: '2px' }}>MAIDAS</span>
          <span style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '8px', letterSpacing: '1px' }}>FACTORY</span>
        </div>
      </Link>

      <div style={{ width: '1px', height: '24px', backgroundColor: 'rgba(255,255,255,0.15)', margin: '0 10px' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>{children}</div>
    </div>
  );
};

export default ToolBar;