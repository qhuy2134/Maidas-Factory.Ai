import React, { useMemo, useRef, useState } from 'react';

const MaidasMap = ({ camera = { x: 0, y: 0, scale: 1 } }) => {
  const [numRows, setNumRows] = useState(32);
  const [numCols, setNumCols] = useState(32);
  const gridRef = useRef(null);
  
  const colLabels = useMemo(() => Array.from({ length: numCols }, (_, i) => i + 1), [numCols]);
  const rowLabels = useMemo(() => Array.from({ length: numRows }, (_, i) => i + 1), [numRows]);

  // BÙA CHÚ TỈ LỆ NGHỊCH
  const invScale = 1 / camera.scale;

  // 1. ÉP KÍCH THƯỚC BẢN THƯỚC (ĐỘ DÀY) LUÔN GIỮ NGUYÊN BẰNG CÁCH NHÂN VỚI invScale
  const gridTemplateColumns = useMemo(() => {
    return `${40 * invScale}px ${colLabels.map(l => `var(--c${l}, 50px)`).join(' ')} ${40 * invScale}px`;
  }, [colLabels, invScale]);

  const gridTemplateRows = useMemo(() => {
    return `${40 * invScale}px ${rowLabels.map(l => `var(--r${l}, 50px)`).join(' ')} ${40 * invScale}px`;
  }, [rowLabels, invScale]);

  const offsetX = Math.max(0, -camera.x / camera.scale);
  const offsetY = Math.max(0, -camera.y / camera.scale);

  const cornerStyle = { transform: `translate(${offsetX}px, ${offsetY}px)`, zIndex: 100, position: 'relative' };
  const colStyle = { transform: `translateY(${offsetY}px)`, zIndex: 90, position: 'relative' };
  const rowStyle = { transform: `translateX(${offsetX}px)`, zIndex: 90, position: 'relative' };

  return (
    <>
      <style>{`
        .maidas-cell {
          width: 100%; height: 100%; box-sizing: border-box; border-radius: 2px;
          border: ${1 * invScale}px solid rgba(255, 255, 255, 0.15);
          background-color: rgba(255, 255, 255, 0.05);
          transition: background-color 0.1s, border-color 0.1s;
        }
        .maidas-cell:hover {
          background-color: rgba(255, 255, 255, 0.2) !important;
          border-color: rgba(255, 255, 255, 0.5) !important;
        }
        .maidas-header {
          background-color: #1a1a1a; 
          display: flex; align-items: center; justify-content: center;
          font-family: monospace; user-select: none;
        }
      `}</style>

      <div 
        ref={gridRef}
        style={{
          display: 'grid', gridTemplateColumns, gridTemplateRows,
          gap: `${2 * invScale}px`, 
          width: 'fit-content', backgroundColor: 'transparent'
        }}
      >
        {/* ================= GÓC TỌA ĐỘ X/Y ================= */}
        <div className="maidas-header" style={{ 
          ...cornerStyle,
          borderBottom: `${1 * invScale}px solid rgba(255, 255, 255, 0.4)`, 
          borderRight: `${1 * invScale}px solid rgba(255, 255, 255, 0.4)`, 
          overflow: 'hidden'
        }}>
          <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0 }}>
            <line x1="0" y1="0" x2="100%" y2="100%" stroke="rgba(255,255,255,0.4)" strokeWidth={1 * invScale} />
            <text x="75%" y="30%" fill="rgba(255, 255, 255, 0.9)" fontSize={13 * invScale} textAnchor="middle" alignmentBaseline="central" fontWeight="bold">x</text>
            <text x="25%" y="70%" fill="rgba(255, 255, 255, 0.9)" fontSize={13 * invScale} textAnchor="middle" alignmentBaseline="central" fontWeight="bold">y</text>
          </svg>
        </div>

        {/* ================= THƯỚC NGANG (CỘT X) ================= */}
        {colLabels.map((label) => {
          const isMajor = label % 5 === 0;
          return (
            <div key={`col-${label}`} className="maidas-header" style={{ ...colStyle, borderBottom: `${1 * invScale}px solid rgba(255, 255, 255, 0.4)` }}>
              <span style={{ 
                fontSize: `${(isMajor ? 15 : 11) * invScale}px`,
                color: isMajor ? '#ffffff' : 'rgba(224, 224, 224, 0.4)',
                fontWeight: isMajor ? 'bold' : 'normal',
                marginBottom: `${6 * invScale}px` 
              }}>
                {label}
              </span>
              <div style={{
                position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
                width: `${(isMajor ? 2 : 1) * invScale}px`, height: `${(isMajor ? 8 : 4) * invScale}px`,
                backgroundColor: isMajor ? '#ffffff' : 'rgba(255, 255, 255, 0.4)'
              }} />
              <div 
                style={{ position: 'absolute', right: 0, width: `${6 * invScale}px`, height: '100%', cursor: 'col-resize', zIndex: 6 }}
                onMouseDown={(e) => {
                  e.preventDefault(); const startX = e.pageX;
                  const currentWidth = parseInt(getComputedStyle(gridRef.current).getPropertyValue(`--c${label}`) || 50);
                  const handleMouseMove = (moveEvent) => {
                    const newWidth = Math.max(30, currentWidth + (moveEvent.pageX - startX) / camera.scale);
                    gridRef.current.style.setProperty(`--c${label}`, `${newWidth}px`);
                  };
                  const handleMouseUp = () => {
                    document.removeEventListener('mousemove', handleMouseMove); document.removeEventListener('mouseup', handleMouseUp);
                  };
                  document.addEventListener('mousemove', handleMouseMove); document.addEventListener('mouseup', handleMouseUp);
                }}
              />
            </div>
          );
        })}

        <div onClick={() => setNumCols(c => c + 1)} className="maidas-header" style={{ ...colStyle, borderBottom: `${1 * invScale}px solid rgba(255, 255, 255, 0.4)`, cursor: 'pointer', fontSize: `${20 * invScale}px`, color: 'rgba(255,255,255,0.6)' }}>+</div>

        {/* ================= THƯỚC DỌC (HÀNG Y) ================= */}
        {rowLabels.map((rowLabel) => {
          const isMajor = rowLabel % 5 === 0;
          return (
            <React.Fragment key={`row-frag-${rowLabel}`}>
              <div className="maidas-header" style={{ ...rowStyle, borderRight: `${1 * invScale}px solid rgba(255, 255, 255, 0.4)` }}>
                <span style={{
                  fontSize: `${(isMajor ? 15 : 11) * invScale}px`,
                  color: isMajor ? '#ffffff' : 'rgba(224, 224, 224, 0.4)',
                  fontWeight: isMajor ? 'bold' : 'normal',
                  marginRight: `${6 * invScale}px`
                }}>
                  {rowLabel}
                </span>
                <div style={{
                  position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)',
                  height: `${(isMajor ? 2 : 1) * invScale}px`, width: `${(isMajor ? 8 : 4) * invScale}px`,
                  backgroundColor: isMajor ? '#ffffff' : 'rgba(255, 255, 255, 0.4)'
                }} />
                <div 
                  style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: `${6 * invScale}px`, cursor: 'row-resize', zIndex: 6 }}
                  onMouseDown={(e) => {
                    e.preventDefault(); const startY = e.pageY;
                    const currentHeight = parseInt(getComputedStyle(gridRef.current).getPropertyValue(`--r${rowLabel}`) || 50);
                    const handleMouseMove = (moveEvent) => {
                      const newHeight = Math.max(30, currentHeight + (moveEvent.pageY - startY) / camera.scale);
                      gridRef.current.style.setProperty(`--r${rowLabel}`, `${newHeight}px`);
                    };
                    const handleMouseUp = () => {
                      document.removeEventListener('mousemove', handleMouseMove); document.removeEventListener('mouseup', handleMouseUp);
                    };
                    document.addEventListener('mousemove', handleMouseMove); document.addEventListener('mouseup', handleMouseUp);
                  }}
                />
              </div>

              {colLabels.map((colLabel) => (<div key={`cell-${rowLabel}-${colLabel}`} className="maidas-cell" />))}

              <div style={{ backgroundColor: '#1a1a1a', borderLeft: `${1 * invScale}px solid rgba(255, 255, 255, 0.1)` }} />
            </React.Fragment>
          );
        })}

        <div onClick={() => setNumRows(r => r + 1)} className="maidas-header" style={{ ...rowStyle, borderRight: `${1 * invScale}px solid rgba(255, 255, 255, 0.4)`, cursor: 'pointer', fontSize: `${20 * invScale}px`, color: 'rgba(255,255,255,0.6)' }}>+</div>

        {colLabels.map((colLabel) => (<div key={`footer-${colLabel}`} style={{ backgroundColor: '#1a1a1a', borderTop: `${1 * invScale}px solid rgba(255, 255, 255, 0.1)` }} />))}
        <div style={{ backgroundColor: '#1a1a1a' }} />

      </div>
    </>
  );
};

export default MaidasMap;