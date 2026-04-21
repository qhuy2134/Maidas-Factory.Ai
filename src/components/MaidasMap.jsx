import React, { useMemo, useRef, useState } from 'react';
import { maidasTools } from '../Tools/index';

const MaidasMap = ({ camera = { x: 0, y: 0, scale: 1 }, activeTool = '', placedItems = [], selection, setSelection, onCellDrop, onCellClick, onItemClick, mode = 'object', coreAPI }) => {
  const [numRows, setNumRows] = useState(32);
  const [numCols, setNumCols] = useState(32);
  const gridRef = useRef(null);
  
  const colLabels = useMemo(() => Array.from({ length: numCols }, (_, i) => i + 1), [numCols]);
  const rowLabels = useMemo(() => Array.from({ length: numRows }, (_, i) => i + 1), [numRows]);

  const itemMap = useMemo(() => {
    const map = {}; placedItems.forEach(item => { map[`${item.row}-${item.col}`] = item; }); return map;
  }, [placedItems]);

  const invScale = 1 / camera.scale;

  const gridColor = mode === 'edit' ? 'rgba(138, 180, 248, 0.4)' : 'rgba(255, 255, 255, 0.4)';
  const cellBorder = mode === 'edit' ? 'rgba(138, 180, 248, 0.15)' : 'rgba(255, 255, 255, 0.15)';

  const gridTemplateColumns = useMemo(() => { return `${40 * invScale}px ${colLabels.map(l => `var(--c${l}, 50px)`).join(' ')} ${40 * invScale}px`; }, [colLabels, invScale]);
  const gridTemplateRows = useMemo(() => { return `${40 * invScale}px ${rowLabels.map(l => `var(--r${l}, 50px)`).join(' ')} ${40 * invScale}px`; }, [rowLabels, invScale]);

  const offsetX = Math.max(0, -camera.x / camera.scale); const offsetY = Math.max(0, -camera.y / camera.scale);
  const cornerStyle = { transform: `translate(${offsetX}px, ${offsetY}px)`, zIndex: 100, position: 'relative' };
  const colStyle = { transform: `translateY(${offsetY}px)`, zIndex: 90, position: 'relative' };
  const rowStyle = { transform: `translateX(${offsetX}px)`, zIndex: 90, position: 'relative' };

  const minRow = selection?.start && selection?.end ? Math.min(selection.start.r, selection.end.r) : -1;
  const maxRow = selection?.start && selection?.end ? Math.max(selection.start.r, selection.end.r) : -1;
  const minCol = selection?.start && selection?.end ? Math.min(selection.start.c, selection.end.c) : -1;
  const maxCol = selection?.start && selection?.end ? Math.max(selection.start.c, selection.end.c) : -1;

  return (
    <>
      <style>{`
        .maidas-cell { width: 100%; height: 100%; box-sizing: border-box; border-radius: 2px; transition: background-color 0.1s, border-color 0.1s; user-select: none; }
        .maidas-cell:hover { background-color: rgba(255, 255, 255, 0.2) !important; border-color: rgba(255, 255, 255, 0.5) !important; }
        .maidas-header { background-color: #1a1a1a; display: flex; align-items: center; justify-content: center; font-family: monospace; user-select: none; }
        .chest-container .chest-label { opacity: 0; transition: opacity 0.2s ease-in-out; }
        .chest-container:hover .chest-label { opacity: 1; }
      `}</style>

      <div ref={gridRef} style={{ display: 'grid', gridTemplateColumns, gridTemplateRows, gap: `${2 * invScale}px`, width: 'fit-content', backgroundColor: 'transparent', cursor: activeTool.includes('extract') ? 'crosshair' : 'default' }}>
        <div className="maidas-header" style={{ ...cornerStyle, borderBottom: `${1 * invScale}px solid ${gridColor}`, borderRight: `${1 * invScale}px solid ${gridColor}` }}>
          <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0 }}><line x1="0" y1="0" x2="100%" y2="100%" stroke={gridColor} strokeWidth={1 * invScale} /></svg>
        </div>

        {colLabels.map((label) => {
          const isMajor = label % 5 === 0;
          return (
            <div key={`col-${label}`} className="maidas-header" style={{ ...colStyle, borderBottom: `${1 * invScale}px solid ${gridColor}` }}>
              <span style={{ fontSize: `${(isMajor ? 15 : 11) * invScale}px`, color: isMajor ? (mode === 'edit' ? '#8ab4f8' : '#ffffff') : 'rgba(224, 224, 224, 0.4)', fontWeight: isMajor ? 'bold' : 'normal', marginBottom: `${6 * invScale}px` }}>{label}</span>
              <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: `${(isMajor ? 2 : 1) * invScale}px`, height: `${(isMajor ? 8 : 4) * invScale}px`, backgroundColor: isMajor ? (mode === 'edit' ? '#8ab4f8' : '#ffffff') : gridColor }} />
              <div style={{ position: 'absolute', right: 0, width: `${6 * invScale}px`, height: '100%', cursor: 'col-resize', zIndex: 6 }} onMouseDown={(e) => { e.preventDefault(); const startX = e.pageX; const currentWidth = parseInt(getComputedStyle(gridRef.current).getPropertyValue(`--c${label}`) || 50); const handleMouseMove = (me) => gridRef.current.style.setProperty(`--c${label}`, `${Math.max(30, currentWidth + (me.pageX - startX) / camera.scale)}px`); const handleMouseUp = () => { document.removeEventListener('mousemove', handleMouseMove); document.removeEventListener('mouseup', handleMouseUp); }; document.addEventListener('mousemove', handleMouseMove); document.addEventListener('mouseup', handleMouseUp); }} />
            </div>
          );
        })}
        <div onClick={() => setNumCols(c => c + 1)} className="maidas-header" style={{ ...colStyle, borderBottom: `${1 * invScale}px solid ${gridColor}`, cursor: 'pointer', fontSize: `${20 * invScale}px`, color: 'rgba(255,255,255,0.6)' }}>+</div>

        {rowLabels.map((rowLabel) => {
          const isMajor = rowLabel % 5 === 0;
          return (
            <React.Fragment key={`row-frag-${rowLabel}`}>
              <div className="maidas-header" style={{ ...rowStyle, borderRight: `${1 * invScale}px solid ${gridColor}` }}>
                <span style={{ fontSize: `${(isMajor ? 15 : 11) * invScale}px`, color: isMajor ? (mode === 'edit' ? '#8ab4f8' : '#ffffff') : 'rgba(224, 224, 224, 0.4)', fontWeight: isMajor ? 'bold' : 'normal', marginRight: `${6 * invScale}px` }}>{rowLabel}</span>
                <div style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', height: `${(isMajor ? 2 : 1) * invScale}px`, width: `${(isMajor ? 8 : 4) * invScale}px`, backgroundColor: isMajor ? (mode === 'edit' ? '#8ab4f8' : '#ffffff') : gridColor }} />
                <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: `${6 * invScale}px`, cursor: 'row-resize', zIndex: 6 }} onMouseDown={(e) => { e.preventDefault(); const startY = e.pageY; const currentHeight = parseInt(getComputedStyle(gridRef.current).getPropertyValue(`--r${rowLabel}`) || 50); const handleMouseMove = (me) => gridRef.current.style.setProperty(`--r${rowLabel}`, `${Math.max(30, currentHeight + (me.pageY - startY) / camera.scale)}px`); const handleMouseUp = () => { document.removeEventListener('mousemove', handleMouseMove); document.removeEventListener('mouseup', handleMouseUp); }; document.addEventListener('mousemove', handleMouseMove); document.addEventListener('mouseup', handleMouseUp); }} />
              </div>

              {colLabels.map((colLabel) => {
                const item = itemMap[`${rowLabel}-${colLabel}`];
                const isSelected = rowLabel >= minRow && rowLabel <= maxRow && colLabel >= minCol && colLabel <= maxCol;

                return (
                  <div 
                    key={`cell-${rowLabel}-${colLabel}`} className="maidas-cell" 
                    onMouseDown={(e) => { if (e.button === 0 && setSelection) setSelection({ start: { r: rowLabel, c: colLabel }, end: { r: rowLabel, c: colLabel }, isSelecting: true }); }}
                    onMouseEnter={() => { if (selection?.isSelecting) setSelection(prev => ({ ...prev, end: { r: rowLabel, c: colLabel } })); }}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => { e.preventDefault(); try { const dragData = JSON.parse(e.dataTransfer.getData('application/json')); if (onCellDrop) onCellDrop(rowLabel, colLabel, dragData); } catch (err) {} }}
                    onClick={() => onCellClick && onCellClick(rowLabel, colLabel)}
                    style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: isSelected ? 'rgba(138, 180, 248, 0.25)' : (mode === 'edit' ? 'rgba(138, 180, 248, 0.02)' : 'rgba(255, 255, 255, 0.05)'), border: `${1 * invScale}px solid ${isSelected ? '#8ab4f8' : cellBorder}` }}
                  >
                    {item && (
                      <div 
                        draggable className="chest-container"
                        onDragStart={(e) => {
                          e.stopPropagation(); 
                          if (mode === 'edit') { e.preventDefault(); return; }
                          if (isSelected) { e.dataTransfer.setData('application/json', JSON.stringify({ type: 'move_selection', startRow: rowLabel, startCol: colLabel })); } 
                          else { e.dataTransfer.setData('application/json', JSON.stringify({ type: 'move_item', id: item.id })); }
                        }}
                        onMouseDown={(e) => { 
                          e.stopPropagation(); 
                          // 🔥 SỬA LỖI: Chỉ tạo vùng chọn mới nếu Rương bấm vào CHƯA NẰM TRONG vùng chọn hiện tại
                          if (setSelection && !isSelected) {
                            setSelection({ start: { r: rowLabel, c: colLabel }, end: { r: rowLabel, c: colLabel }, isSelecting: true }); 
                          }
                        }}
                        onClick={(e) => { e.stopPropagation(); if (onItemClick) onItemClick(item); }}
                        style={{ width: '100%', height: '100%', cursor: mode === 'edit' ? 'default' : 'grab', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}
                      >
                        {maidasTools.find(t => t.id === item.toolId)?.renderMapItem(item, mode, coreAPI)}

                        {item.data && item.data.prompt && mode === 'object' && (
                          <div className="chest-label" style={{ position: 'absolute', bottom: '2px', backgroundColor: 'rgba(0, 0, 0, 0.8)', color: '#8ab4f8', fontSize: `${9 * invScale}px`, padding: '2px 4px', borderRadius: '3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '90%', pointerEvents: 'none', fontWeight: 'bold', border: `${1*invScale}px solid #333`, zIndex: 10 }}>
                            {item.data.prompt.length > 12 ? item.data.prompt.substring(0, 12) + '...' : item.data.prompt}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
              <div style={{ backgroundColor: '#1a1a1a', borderLeft: `${1 * invScale}px solid ${gridColor}` }} />
            </React.Fragment>
          );
        })}
        <div onClick={() => setNumRows(r => r + 1)} className="maidas-header" style={{ ...rowStyle, borderRight: `${1 * invScale}px solid ${gridColor}`, cursor: 'pointer', fontSize: `${20 * invScale}px`, color: 'rgba(255,255,255,0.6)' }}>+</div>
        {colLabels.map((colLabel) => (<div key={`footer-${colLabel}`} style={{ backgroundColor: '#1a1a1a', borderTop: `${1 * invScale}px solid ${gridColor}` }} />))}
        <div style={{ backgroundColor: '#1a1a1a' }} />
      </div>
    </>
  );
};

export default MaidasMap;