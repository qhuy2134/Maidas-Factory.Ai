import React from 'react';
import Background from '../components/Background';
import ProjectArchive from '../components/ProjectArchive';
import logo from '../assets/logo.png';

function Archive() {
  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      position: 'relative', 
      backgroundColor: '#0a0a0a',
      overflow: 'hidden',
      color: '#eee',
      fontFamily: '"Segoe UI", Roboto, sans-serif'
    }}>
      <Background />

      <div style={{ 
        position: 'absolute', top: 0, left: 0, 
        width: '100%', height: '100%', 
        zIndex: 1, padding: '40px',
        boxSizing: 'border-box', display: 'flex', flexDirection: 'column'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
          <img 
            src={logo} 
            alt="Maidas Logo" 
            style={{ 
              height: '54px', 
              width: 'auto', 
              filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.2))' 
            }} 
          />
          <h1 style={{ 
            margin: 0, 
            fontSize: '24px', 
            letterSpacing: '4px', 
            fontWeight: '300',
            color: 'rgba(255,255,255,0.9)'
          }}>
            ARCHIVE
          </h1>
        </div>
        
        <div style={{ 
          flex: 1, overflow: 'auto', borderRadius: '8px', 
          border: '1px solid rgba(255,255,255,0.1)' 
        }}>
          <ProjectArchive />
        </div>
      </div>
    </div>
  );
}

export default Archive;