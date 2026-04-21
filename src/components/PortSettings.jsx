import React, { useState, useEffect } from 'react';

const PortSettings = ({ item, core }) => {
  const [portsConfig, setPortsConfig] = useState({
    topLeft: 'none', topRight: 'input', bottomRight: 'output', bottomLeft: 'none'
  });

  useEffect(() => {
    if (item.data.portsConfig) {
      setPortsConfig(item.data.portsConfig);
    }
  }, [item]);

  const handlePortChange = (edge, value) => {
    const newConfig = { ...portsConfig, [edge]: value };
    setPortsConfig(newConfig);
    core.updatePlacedItem(item.id, { portsConfig: newConfig });
    core.setToolState('prompt_setting', { selectedItem: { ...item, data: { ...item.data, portsConfig: newConfig } } });
    
    // 🔥 ĐỨT CÁP TỰ ĐỘNG NẾU CHUYỂN SANG TRỐNG
    if (value === 'none') {
      if (core.removeConnectedCables) core.removeConnectedCables(item.id, edge);
    }
  };

  const getColor = (type) => {
    if (type === 'input') return '#4CAF50'; 
    if (type === 'output') return '#F44336';
    return '#333'; 
  };

  const renderSelect = (edge, label) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
      <span style={{ fontSize: '9px', color: '#aaa', fontFamily: 'monospace' }}>{label}</span>
      <select 
        value={portsConfig[edge]} 
        onChange={(e) => handlePortChange(edge, e.target.value)}
        style={{
          width: '75px', backgroundColor: '#1a1a1a', color: '#fff', 
          border: `1px solid ${getColor(portsConfig[edge])}`, borderRadius: '4px', 
          padding: '4px', fontSize: '10px', outline: 'none', textAlign: 'center', cursor: 'pointer', appearance: 'none', fontWeight: 'bold',
          boxShadow: portsConfig[edge] !== 'none' ? `0 0 8px ${getColor(portsConfig[edge])}44` : 'none'
        }}
      >
        <option value="none">TRỐNG</option>
        <option value="input">INPUT</option>
        <option value="output">OUTPUT</option>
      </select>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '5px' }}>
      <div style={{ width: '100%', height: '1px', backgroundColor: '#333' }} />
      <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#8ab4f8', letterSpacing: '1px' }}>// PORTS SCHEMA</div>
      
      <div style={{ backgroundColor: '#0a0a0a', padding: '20px 10px', borderRadius: '6px', border: '1px solid #333', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', padding: '0 10px', boxSizing: 'border-box' }}>
          {renderSelect('topLeft', 'TOP-LEFT')}
          {renderSelect('topRight', 'TOP-RIGHT')}
        </div>

        <div style={{ 
          width: '45px', height: '45px', backgroundColor: '#222', transform: 'rotate(45deg)',
          borderTop: `3px solid ${getColor(portsConfig.topRight)}`,
          borderRight: `3px solid ${getColor(portsConfig.bottomRight)}`,
          borderBottom: `3px solid ${getColor(portsConfig.bottomLeft)}`,
          borderLeft: `3px solid ${getColor(portsConfig.topLeft)}`,
          margin: '10px 0', boxShadow: `0 0 15px rgba(255,255,255,0.05)`
        }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', padding: '0 10px', boxSizing: 'border-box' }}>
          {renderSelect('bottomLeft', 'BOTTOM-LEFT')}
          {renderSelect('bottomRight', 'BOTTOM-RIGHT')}
        </div>
      </div>
    </div>
  );
};

export default PortSettings;