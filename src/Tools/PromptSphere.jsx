import React, { useState } from 'react';

// GIAO DIỆN MENU RIÊNG CỦA TOOL NÀY
const PromptSphereMenu = ({ core }) => {
  const [savedPrompts, setSavedPrompts] = useState([]);
  const [inputText, setInputText] = useState('');

  const handleAccept = () => {
    if (inputText.trim()) {
      setSavedPrompts([...savedPrompts, { id: Date.now(), text: inputText.trim() }]);
      setInputText('');
    }
  };

  const handleExtract = (p) => {
    // Ép Xưởng chuyển sang chế độ "Cầm khối cầu", mang theo dữ liệu prompt
    core.setActiveTool('prompt_sphere_extract', { prompt: p.text, promptId: p.id });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '15px' }}>
      <textarea 
        value={inputText} onChange={(e) => setInputText(e.target.value)}
        placeholder="Nhập prompt của sếp vào đây..." 
        style={{ width: '100%', height: '80px', backgroundColor: '#000', color: '#fff', border: '1px solid #444', borderRadius: '4px', padding: '10px', resize: 'none', outline: 'none', fontSize: '12px' }}
      />
      <button 
        onClick={handleAccept}
        style={{ backgroundColor: '#8ab4f8', color: '#000', border: 'none', padding: '8px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '11px', letterSpacing: '1px' }}
      >
        ACCEPT
      </button>

      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', paddingRight: '5px' }}>
        {savedPrompts.map(p => {
          const isExtracting = core.activeTool === 'prompt_sphere_extract' && core.toolPayload?.promptId === p.id;
          return (
            <div key={p.id} style={{ display: 'flex', alignItems: 'center', backgroundColor: '#222', border: '1px solid #444', borderRadius: '4px', padding: '8px', gap: '10px' }}>
              <button 
                onClick={() => handleExtract(p)}
                style={{ backgroundColor: isExtracting ? '#8ab4f8' : '#444', color: isExtracting ? '#000' : '#fff', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '10px', fontWeight: 'bold' }}
              >
                EXTRACT
              </button>
              <div style={{ flex: 1, fontSize: '11px', color: '#ccc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={p.text}>
                {p.text}
              </div>
              <span onClick={() => setSavedPrompts(savedPrompts.filter(sp => sp.id !== p.id))} style={{ color: '#fff', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold', padding: '0 5px' }}>✖</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ==========================================
// ĐÂY LÀ "CHỨNG MINH THƯ" CỦA TOOL ĐỂ KHAI BÁO VỚI XƯỞNG
// ==========================================
export default {
  id: 'prompt_sphere',
  label: 'PROMPT SPHERE',
  image: '/tool1.png', // Lấy logo từ public

  // 1. Khi bấm vào Toolbar
  onToolbarClick: (core) => {
    core.setActiveTool('prompt_sphere', null);
    core.openToolTab('prompt_sphere', 'Prompt Sphere Menu');
  },

  // 2. Giao diện xuất hiện trong Tab
  renderMenu: (core) => <PromptSphereMenu core={core} />,

  // 3. Khi dùng Tool này bấm lên Bản đồ
  onMapClick: (core, row, col) => {
    if (core.activeTool === 'prompt_sphere_extract' && core.toolPayload) {
      // Nhét đồ vật vào Bản đồ (Gắn cái mác toolId để Map biết ai đẻ ra nó)
      core.addPlacedItem({ toolId: 'prompt_sphere', row, col, data: core.toolPayload });
      // Thả xong thì quay về trạng thái tay không
      core.setActiveTool('cursor', null);
    }
  },

  // 4. Cách Bản đồ vẽ vật thể này ra (Khối Chest)
  renderMapItem: (item) => (
    <img 
      src="/tool1chest.png" 
      alt="Chest" 
      style={{ width: '80%', height: '80%', objectFit: 'contain', pointerEvents: 'none' }} 
      title={`Prompt: ${item.data.prompt}`} 
    />
  )
};