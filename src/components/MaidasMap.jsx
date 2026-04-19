import React, { useMemo } from 'react';

const MaidasMap = () => {
  const numRows = 256;
  const numCols = 256;
  
  // Thước ngang và dọc: 1, 2, 3... 256
  const labels = useMemo(() => Array.from({ length: 256 }, (_, i) => i + 1), []);

  return (
    <div style={{
      display: 'grid',
      // Cột đầu 40px (số hàng), các cột sau 50px (ô lưới)
      gridTemplateColumns: `40px repeat(${numCols}, 50px)`,
      // Hàng đầu 30px (số cột), các hàng sau 50px (ô lưới)
      gridTemplateRows: `30px repeat(${numRows}, 50px)`,
      gap: '0px',
      userSelect: 'none',
      borderTop: '1px solid rgba(255, 255, 255, 0.2)',
      borderLeft: '1px solid rgba(255, 255, 255, 0.2)',
      width: 'fit-content',
      backgroundColor: 'transparent' // Đảm bảo trong suốt để thấy galaxy
    }}>
      
      {/* Ô trống góc trên cùng bên trái */}
      <div style={{
        backgroundColor: '#1a1a1a',
        borderRight: '1px solid rgba(255, 255, 255, 0.2)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
        position: 'sticky', top: 0, left: 0, zIndex: 10
      }} />

      {/* THƯỚC NGANG (1 -> 256) */}
      {labels.map((label) => (
        <div key={`col-${label}`} style={{
          backgroundColor: '#1a1a1a', color: '#00ffff', display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderRight: '1px solid rgba(255, 255, 255, 0.2)', borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
          fontWeight: 'bold', fontFamily: 'monospace', position: 'sticky', top: 0, zIndex: 5
        }}>
          {label}
        </div>
      ))}

      {/* RENDER LƯỚI & THƯỚC DỌC */}
      {labels.map((rowLabel, rowIndex) => (
        <React.Fragment key={`row-frag-${rowLabel}`}>
          
          {/* Thước dọc (1 -> 256) */}
          <div style={{
            backgroundColor: '#1a1a1a', color: '#00ffff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRight: '1px solid rgba(255, 255, 255, 0.2)', borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
            fontWeight: 'bold', fontFamily: 'monospace', position: 'sticky', left: 0, zIndex: 5
          }}>
            {rowLabel}
          </div>

          {/* Ô vuông 50x50 */}
          {labels.map((colLabel, colIndex) => (
            <div 
              key={`cell-${rowIndex}-${colIndex}`}
              style={{
                width: '50px', height: '50px',
                borderRight: '1px solid rgba(255, 255, 255, 0.1)', // Viền mỏng trắng xám
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                backgroundColor: 'transparent', 
                boxSizing: 'border-box'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            />
          ))}
        </React.Fragment>
      ))}
    </div>
  );
};

export default MaidasMap;