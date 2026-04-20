import React, { useMemo, useRef, useState } from 'react';

const MaidasMap = ({ scale = 1 }) => {
  const [numRows, setNumRows] = useState(32);
  const [numCols, setNumCols] = useState(32);
  const gridRef = useRef(null);
  
  const colLabels = useMemo(() => Array.from({ length: numCols }, (_, i) => i + 1), [numCols]);
  const rowLabels = useMemo(() => Array.from({ length: numRows }, (_, i) => i + 1), [numRows]);

  // TRẢ VỀ NGUYÊN BẢN 1x: Không nhân * scale ở đây nữa
  const gridTemplateColumns = useMemo(() => {
    return `40px ${colLabels.map(l => `var(--c${l}, 50px)`).join(' ')} 40px`;
  }, [colLabels]);

  const gridTemplateRows = useMemo(() => {
    return `30px ${rowLabels.map(l => `var(--r${l}, 50px)`).join(' ')} 30px`;
  }, [rowLabels]);

  return (
    <>
      <style>{`
        .maidas-cell {
          width: 100%; height: 100%; box-sizing: border-box; border-radius: 2px;
          border: 1px solid rgba(255, 255, 255, 0.15);
          background-color: rgba(255, 255, 255, 0.05);
          transition: background-color 0.1s, border-color 0.1s;
        }
        .maidas-cell:hover {
          background-color: rgba(255, 255, 255, 0.2) !important;
          border-color: rgba(255, 255, 255, 0.5) !important;
        }
        .maidas-header {
          background-color: #1a1a1a; color: rgba(224, 224, 224, 0.8);
          display: flex; align-items: center; justify-content: center;
          border: 1px solid rgba(255, 255, 255, 0.2);
          font-weight: bold; font-family: monospace; position: sticky; z-index: 5;
        }
      `}</style>

      <div 
        ref={gridRef}
        style={{
          display: 'grid', gridTemplateColumns, gridTemplateRows,
          gap: '2px', userSelect: 'none', width: 'fit-content', backgroundColor: 'transparent'
        }}
      >
        <div style={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255, 255, 255, 0.2)', position: 'sticky', top: 0, left: 0, zIndex: 10 }} />

        {colLabels.map((label) => (
          <div key={`col-${label}`} className="maidas-header" style={{ top: 0 }}>
            {label}
            <div 
              style={{ position: 'absolute', right: 0, width: '4px', height: '100%', cursor: 'col-resize', zIndex: 6 }}
              onMouseDown={(e) => {
                e.preventDefault();
                const startX = e.pageX;
                const currentWidth = parseInt(getComputedStyle(gridRef.current).getPropertyValue(`--c${label}`) || 50);
                const handleMouseMove = (moveEvent) => {
                  // Scale chỉ dùng ở đây để kéo cột mượt tay khi đang zoom
                  const newWidth = Math.max(30, currentWidth + (moveEvent.pageX - startX) / scale);
                  gridRef.current.style.setProperty(`--c${label}`, `${newWidth}px`);
                };
                const handleMouseUp = () => {
                  document.removeEventListener('mousemove', handleMouseMove);
                  document.removeEventListener('mouseup', handleMouseUp);
                };
                document.addEventListener('mousemove', handleMouseMove); document.addEventListener('mouseup', handleMouseUp);
              }}
            />
          </div>
        ))}

        <div onClick={() => setNumCols(c => c + 1)} className="maidas-header" style={{ top: 0, cursor: 'pointer', transition: 'all 0.2s', fontSize: '20px' }}>+</div>

        {rowLabels.map((rowLabel) => (
          <React.Fragment key={`row-frag-${rowLabel}`}>
            <div className="maidas-header" style={{ left: 0 }}>
              {rowLabel}
              <div 
                style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '4px', cursor: 'row-resize', zIndex: 6 }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  const startY = e.pageY;
                  const currentHeight = parseInt(getComputedStyle(gridRef.current).getPropertyValue(`--r${rowLabel}`) || 50);
                  const handleMouseMove = (moveEvent) => {
                    // Scale chỉ dùng ở đây để kéo hàng mượt tay khi đang zoom
                    const newHeight = Math.max(30, currentHeight + (moveEvent.pageY - startY) / scale);
                    gridRef.current.style.setProperty(`--r${rowLabel}`, `${newHeight}px`);
                  };
                  const handleMouseUp = () => {
                    document.removeEventListener('mousemove', handleMouseMove);
                    document.removeEventListener('mouseup', handleMouseUp);
                  };
                  document.addEventListener('mousemove', handleMouseMove); document.addEventListener('mouseup', handleMouseUp);
                }}
              />
            </div>
            {colLabels.map((colLabel) => (<div key={`cell-${rowLabel}-${colLabel}`} className="maidas-cell" />))}
            <div style={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255, 255, 255, 0.2)' }} />
          </React.Fragment>
        ))}

        <div onClick={() => setNumRows(r => r + 1)} className="maidas-header" style={{ left: 0, cursor: 'pointer', transition: 'all 0.2s', fontSize: '20px' }}>+</div>
        {colLabels.map((colLabel) => (<div key={`footer-${colLabel}`} style={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255, 255, 255, 0.2)' }} />))}
        <div style={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255, 255, 255, 0.2)' }} />
      </div>
    </>
  );
};
export default MaidasMap;