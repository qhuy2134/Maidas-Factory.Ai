import React, { useState, useEffect } from 'react';
import PortSettings from '../components/PortSettings'; // 🔥 IMPORT TOOL CỔNG MỚI

const PromptSettingMenu = ({ core }) => {
  const state = core.getToolState('prompt_setting');
  const selectedItem = state.selectedItem;

  if (!selectedItem) {
    return (
      <div style={{ textAlign: 'center', color: '#555', marginTop: '20px', fontSize: '12px', fontStyle: 'italic' }}>
        Chưa chọn Chest nào. <br/><br/> Hãy bấm vào một Chest trên Bản đồ.
      </div>
    );
  }

  const [promptText, setPromptText] = useState(selectedItem.data.prompt || '');
  const [color, setColor] = useState(selectedItem.data.color || '#ffffff');

  // Cập nhật lại form nếu người dùng bấm sang một cái Chest khác
  useEffect(() => {
    setPromptText(selectedItem.data.prompt || '');
    setColor(selectedItem.data.color || '#ffffff');
  }, [selectedItem]);

  const handleSave = () => {
    // Gọi API của Xưởng để sửa đồ vật ngay lập tức
    core.updatePlacedItem(selectedItem.id, { prompt: promptText, color });
    
    // Cập nhật lại bộ nhớ để UI không bị giật
    core.setToolState('prompt_setting', { 
      selectedItem: { ...selectedItem, data: { ...selectedItem.data, prompt: promptText, color } } 
    });
    
    // Đổi nút save thành màu xanh báo hiệu thành công
    const btn = document.getElementById('save-btn');
    if(btn) {
      btn.innerText = "ĐÃ LƯU!";
      btn.style.backgroundColor = '#81c995';
      setTimeout(() => {
        btn.innerText = "LƯU CÀI ĐẶT";
        btn.style.backgroundColor = '#8ab4f8';
      }, 1000);
    }
  };

  return (
    // 🔥 Đổi thành overflowY: 'auto' để có thể cuộn xuống xem Sơ đồ
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', boxSizing: 'border-box', overflowY: 'auto', paddingRight: '5px' }}>
      <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#8ab4f8', marginBottom: '8px', letterSpacing: '1px' }}>
        // EDIT PROMPT
      </div>
      <textarea 
        value={promptText} 
        onChange={(e) => setPromptText(e.target.value)}
        style={{ width: '100%', minHeight: '120px', backgroundColor: '#111', color: '#eee', border: '1px solid #333', borderRadius: '6px', padding: '10px', resize: 'vertical', outline: 'none', fontSize: '13px', boxSizing: 'border-box', fontFamily: 'monospace', marginBottom: '15px' }}
      />

      <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#8ab4f8', marginBottom: '8px', letterSpacing: '1px' }}>
        // CHEST GLOW COLOR
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
        <input 
          type="color" 
          value={color} 
          onChange={(e) => setColor(e.target.value)}
          style={{ width: '40px', height: '40px', padding: '0', border: 'none', cursor: 'pointer', background: 'transparent' }}
        />
        <span style={{ color: '#ccc', fontFamily: 'monospace', fontSize: '12px' }}>{color.toUpperCase()}</span>
      </div>

      <button 
        id="save-btn"
        onClick={handleSave}
        style={{ width: '100%', backgroundColor: '#8ab4f8', color: '#0f0f0f', border: 'none', padding: '10px 0', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '11px', letterSpacing: '1px', transition: 'background-color 0.2s', flexShrink: 0 }}
      >
        LƯU CÀI ĐẶT
      </button>

      {/* 🔥 NHÚNG COMPONENT CỔNG VÀO ĐÂY */}
      <PortSettings item={selectedItem} core={core} />

    </div>
  );
};

export default {
  id: 'prompt_setting',
  label: 'PROMPT SETTING',
  
  // 🔥 ĐỔI SANG LOGO TOOL 2 Ở ĐÂY
  image: '/tool2.png', 
  
  onToolbarClick: (core) => core.openToolTab('prompt_setting', 'Prompt Setting'),
  renderMenu: (core) => <PromptSettingMenu core={core} />
};