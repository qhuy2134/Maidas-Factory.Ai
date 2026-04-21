import React from 'react';

const PromptSphereMenu = ({ core }) => {
  const state = core.getToolState('prompt_sphere');
  const savedPrompts = state.savedPrompts || [];
  const inputText = state.inputText || '';
  const extractedPrompt = state.extractedPrompt || null; 

  const handleAccept = () => {
    if (inputText.trim()) {
      core.setToolState('prompt_sphere', { 
        savedPrompts: [...savedPrompts, { id: Date.now(), text: inputText.trim() }],
        inputText: '' 
      });
    }
  };

  const handleExtract = (p) => {
    core.setToolState('prompt_sphere', { extractedPrompt: p });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', boxSizing: 'border-box' }}>
      
      {/* ================= LÒ NUNG ================= */}
      <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#8ab4f8', marginBottom: '8px', letterSpacing: '1px' }}>
        // OUTPUT CHEST
      </div>
      <div style={{ 
        width: '100%', height: '80px', backgroundColor: '#0a0a0a', 
        border: extractedPrompt ? '2px dashed #8ab4f8' : '2px dashed #444', 
        borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', 
        marginBottom: '15px', transition: 'border 0.3s'
      }}>
        {extractedPrompt ? (
          <div 
            draggable 
            onDragStart={(e) => {
              e.dataTransfer.setData('application/json', JSON.stringify({
                type: 'tool_item', toolId: 'prompt_sphere', data: { prompt: extractedPrompt.text, promptId: extractedPrompt.id }
              }));
            }}
            style={{ width: '50px', height: '50px', cursor: 'grab' }}
            title={`Nắm kéo rương này: ${extractedPrompt.text}`}
          >
            {/* ĐÃ ĐỔI THÀNH tool1.png */}
            <img src="/tool1.png" alt="Chest" style={{ width: '100%', height: '100%', objectFit: 'contain', pointerEvents: 'none' }} />
          </div>
        ) : (
          <span style={{ color: '#555', fontSize: '10px', fontStyle: 'italic' }}>Trống. Bấm EXTRACT bên dưới.</span>
        )}
      </div>

      {/* ================= NHẬP LIỆU ================= */}
      <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#8ab4f8', marginBottom: '8px', letterSpacing: '1px' }}>// INPUT PROMPT</div>
      <textarea 
        value={inputText} onChange={(e) => core.setToolState('prompt_sphere', { inputText: e.target.value })}
        placeholder="Gõ prompt vào đây..." 
        style={{ width: '100%', minHeight: '80px', backgroundColor: '#111', color: '#eee', border: '1px solid #333', borderRadius: '6px', padding: '10px', resize: 'vertical', outline: 'none', fontSize: '12px', boxSizing: 'border-box', fontFamily: 'monospace', marginBottom: '10px' }}
      />
      <button 
        onClick={handleAccept}
        style={{ width: '100%', backgroundColor: '#8ab4f8', color: '#0f0f0f', border: 'none', padding: '8px 0', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '11px', letterSpacing: '1px' }}
      >
        ACCEPT / LƯU
      </button>

      <div style={{ width: '100%', height: '1px', backgroundColor: '#333', margin: '15px 0' }} />

      {/* ================= KHO LƯU TRỮ ================= */}
      <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#8ab4f8', marginBottom: '8px', letterSpacing: '1px' }}>// SAVED PROMPTS</div>
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: '5px' }}>
        {savedPrompts.map(p => {
          const isExtracted = extractedPrompt && extractedPrompt.id === p.id;
          return (
            <div key={p.id} style={{ display: 'flex', alignItems: 'center', backgroundColor: isExtracted ? 'rgba(138, 180, 248, 0.1)' : '#1a1a1a', border: `1px solid ${isExtracted ? '#8ab4f8' : '#333'}`, borderRadius: '6px', padding: '8px', gap: '10px' }}>
              <button 
                onClick={() => handleExtract(p)}
                style={{ backgroundColor: isExtracted ? '#8ab4f8' : '#333', color: isExtracted ? '#000' : '#fff', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '10px', fontWeight: 'bold' }}
              >
                {isExtracted ? 'READY' : 'EXTRACT'}
              </button>
              <div style={{ flex: 1, fontSize: '11px', color: '#ccc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: 'monospace' }} title={p.text}>{p.text}</div>
              <span onClick={() => core.setToolState('prompt_sphere', { savedPrompts: savedPrompts.filter(sp => sp.id !== p.id) })} style={{ color: '#f28b82', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold', padding: '0 5px' }}>✖</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default {
  id: 'prompt_sphere',
  label: 'PROMPT SPHERE',
  image: '/tool1.png',
  onToolbarClick: (core) => core.openToolTab('prompt_sphere', 'Prompt Sphere'),
  renderMenu: (core) => <PromptSphereMenu core={core} />,
  
  // 🔥 RENDER NODE KẾT NỐI
  renderMapItem: (item, mode, core) => {
    const chestColor = item.data.color || '#cccccc'; 
    const portsConfig = item.data.portsConfig || { topLeft: 'none', topRight: 'input', bottomRight: 'output', bottomLeft: 'none' };
    
    const getColor = (type) => {
      if (type === 'input') return '#4CAF50';
      if (type === 'output') return '#F44336';
      return '#444'; 
    };

    if (mode === 'edit') {
      return (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          
          <div style={{ 
            width: '45%', height: '45%', backgroundColor: '#222', 
            borderTop: `3px solid ${getColor(portsConfig.topRight)}`,
            borderRight: `3px solid ${getColor(portsConfig.bottomRight)}`,
            borderBottom: `3px solid ${getColor(portsConfig.bottomLeft)}`,
            borderLeft: `3px solid ${getColor(portsConfig.topLeft)}`,
            transform: 'rotate(45deg)', position: 'relative', boxShadow: `0 0 10px ${chestColor}55`
          }}>
             {/* 🔥 4 DẤU CHẤM NẰM CHÍNH XÁC Ở GIỮA CÁC CẠNH (EDGE-DOTS) */}
             {['topLeft', 'topRight', 'bottomRight', 'bottomLeft'].map(edge => {
                const type = portsConfig[edge];
                if (type === 'none') return null;

                // Do hình vuông bị xoay 45 độ nên tọa độ mép cũng bị đổi:
                const posProps = {
                  topRight: { top: '-1.5px', left: '50%', transform: 'translate(-50%, -50%)' },    // Mép trên-phải
                  bottomRight: { top: '50%', right: '-1.5px', transform: 'translate(50%, -50%)' }, // Mép dưới-phải
                  bottomLeft: { bottom: '-1.5px', left: '50%', transform: 'translate(-50%, 50%)' }, // Mép dưới-trái
                  topLeft: { top: '50%', left: '-1.5px', transform: 'translate(-50%, -50%)' }      // Mép trên-trái
                }[edge];
                
                return (
                  <div
                    key={edge}
                    ref={el => core && core.registerPort(item.id, edge, el)}
                    onMouseDown={(e) => core && core.startCable(e, item.id, edge, type)}
                    onMouseUp={(e) => { e.stopPropagation(); core && core.endCable(item.id, edge, type); }}
                    style={{
                      position: 'absolute', width: '10px', height: '10px',
                      backgroundColor: getColor(type), borderRadius: '50%', cursor: 'crosshair',
                      zIndex: 20, ...posProps,
                      boxShadow: '0 0 5px rgba(0,0,0,0.8)', border: '1.5px solid #222',
                      transition: 'transform 0.15s ease'
                    }}
                    // Hiệu ứng phình to chấm tròn khi rờ chuột vào
                    onMouseEnter={e => e.currentTarget.style.transform = `${posProps.transform} scale(1.6)`}
                    onMouseLeave={e => e.currentTarget.style.transform = posProps.transform}
                  />
                );
             })}
          </div>
        </div>
      );
    }

    return (
      <div 
        style={{ 
          width: '80%', height: '80%', backgroundColor: chestColor,
          WebkitMaskImage: "url('/tool1.png')", WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center',
          maskImage: "url('/tool1.png')", maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center', pointerEvents: 'none' 
        }} 
      />
    );
  }
};