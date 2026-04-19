import React, { useMemo, useRef, useState } from 'react';

const MaidasMap = () => {
  const [numRows, setNumRows] = useState(32);
  const [numCols, setNumCols] = useState(32);
  const gridRef = useRef(null);
  
  const colLabels = useMemo(() => Array.from({ length: numCols }, (_, i) => i + 1), [numCols]);
  const rowLabels = useMemo(() => Array.from({ length: numRows }, (_, i) => i + 1), [numRows]);

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
          width: 100%;
          height: 100%;
          border: 1px solid rgba(255, 255, 255, 0.15);
          background-color: rgba(255, 255, 255, 0.05);
          box-sizing: border-box;
          border-radius: 2px;
          transition: background-color 0.1s, border-color 0.1s;
        }
        .maidas-cell:hover {
          background-color: rgba(255, 255, 255, 0.2) !important;
          border-color: rgba(255, 255, 255, 0.5) !important;
        }
      `}</style>

      <div 
        ref={gridRef}
        style={{
          display: 'grid',
          gridTemplateColumns: gridTemplateColumns,
          gridTemplateRows: gridTemplateRows,
          gap: '2px',
          userSelect: 'none',
          width: 'fit-content',
          backgroundColor: 'transparent'
        }}
      >
        <div style={{
          backgroundColor: '#1a1a1a',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          position: 'sticky', top: 0, left: 0, zIndex: 10
        }} />

        {colLabels.map((label) => (
          <div key={`col-${label}`} style={{
            backgroundColor: '#1a1a1a', 
            color: 'rgba(224, 224, 224, 0.8)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            fontWeight: 'bold', 
            fontFamily: 'monospace', 
            position: 'sticky', 
            top: 0, 
            zIndex: 5
          }}>
            {label}
            <div 
              style={{
                position: 'absolute', right: 0, width: '4px', height: '100%',
                cursor: 'col-resize', zIndex: 6
              }}
              onMouseDown={(e) => {
                e.preventDefault();
                const startX = e.pageX;
                const currentWidth = parseInt(getComputedStyle(gridRef.current).getPropertyValue(`--c${label}`) || 50);
                const handleMouseMove = (moveEvent) => {
                  const newWidth = Math.max(30, currentWidth + (moveEvent.pageX - startX));
                  gridRef.current.style.setProperty(`--c${label}`, `${newWidth}px`);
                };
                const handleMouseUp = () => {
                  document.removeEventListener('mousemove', handleMouseMove);
                  document.removeEventListener('mouseup', handleMouseUp);
                };
                document.addEventListener('mousemove', handleMouseMove);
                document.addEventListener('mouseup', handleMouseUp);
              }}
            />
          </div>
        ))}

        <div 
          onClick={() => setNumCols(c => c + 1)}
          style={{
            backgroundColor: '#1a1a1a', color: 'rgba(224, 224, 224, 0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1px solid rgba(255, 255, 255, 0.2)', cursor: 'pointer', fontWeight: 'bold',
            position: 'sticky', top: 0, zIndex: 5, transition: 'all 0.2s', fontSize: '20px'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#1a1a1a'}
        >
          +
        </div>

        {rowLabels.map((rowLabel) => (
          <React.Fragment key={`row-frag-${rowLabel}`}>
            <div style={{
              backgroundColor: '#1a1a1a', 
              color: 'rgba(224, 224, 224, 0.8)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              fontWeight: 'bold', 
              fontFamily: 'monospace', 
              position: 'sticky', 
              left: 0, 
              zIndex: 5
            }}>
              {rowLabel}
              <div 
                style={{
                  position: 'absolute', bottom: 0, left: 0, width: '100%', height: '4px',
                  cursor: 'row-resize', zIndex: 6
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  const startY = e.pageY;
                  const currentHeight = parseInt(getComputedStyle(gridRef.current).getPropertyValue(`--r${rowLabel}`) || 50);
                  const handleMouseMove = (moveEvent) => {
                    const newHeight = Math.max(30, currentHeight + (moveEvent.pageY - startY));
                    gridRef.current.style.setProperty(`--r${rowLabel}`, `${newHeight}px`);
                  };
                  const handleMouseUp = () => {
                    document.removeEventListener('mousemove', handleMouseMove);
                    document.removeEventListener('mouseup', handleMouseUp);
                  };
                  document.addEventListener('mousemove', handleMouseMove);
                  document.addEventListener('mouseup', handleMouseUp);
                }}
              />
            </div>

            {colLabels.map((colLabel) => (
              <div key={`cell-${rowLabel}-${colLabel}`} className="maidas-cell" />
            ))}

            <div style={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255, 255, 255, 0.2)' }} />
          </React.Fragment>
        ))}

        <div 
          onClick={() => setNumRows(r => r + 1)}
          style={{
            backgroundColor: '#1a1a1a', color: 'rgba(224, 224, 224, 0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1px solid rgba(255, 255, 255, 0.2)', cursor: 'pointer', fontWeight: 'bold',
            position: 'sticky', left: 0, zIndex: 5, transition: 'all 0.2s', fontSize: '20px'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#1a1a1a'}
        >
          +
        </div>
        {colLabels.map((colLabel) => (
          <div key={`footer-${colLabel}`} style={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255, 255, 255, 0.2)' }} />
        ))}
        <div style={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255, 255, 255, 0.2)' }} />

      </div>
    </>
  );
};

export default MaidasMap;