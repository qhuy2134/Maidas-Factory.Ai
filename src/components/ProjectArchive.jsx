import React from 'react';

const ProjectArchive = () => {
  // Dữ liệu mẫu để ông xem thử UI
  const projects = [
    { id: '001', name: 'Maidas_Core_Engine', type: 'System', status: 'Active', version: 'v1.2.4' },
    { id: '002', name: 'Hologram_Shader_Alpha', type: 'Asset', status: 'Stable', version: 'v0.8.0' },
    { id: '003', name: 'Biota_Soul_Currency', type: 'Database', status: 'Draft', version: 'v0.1.2' },
    { id: '004', name: 'Axiom_World_Lore', type: 'Doc', status: 'Encrypted', version: 'v2.0.0' },
  ];

  return (
    <table style={{
      width: '100%',
      borderCollapse: 'collapse',
      backgroundColor: 'rgba(26, 26, 26, 0.7)', // Màu #1a1a1a có độ trong suốt
      backdropFilter: 'blur(10px)',
      fontSize: '14px'
    }}>
      <thead>
        <tr style={{ backgroundColor: '#1a1a1a' }}>
          <th style={headerStyle}>ID</th>
          <th style={headerStyle}>PROJECT NAME</th>
          <th style={headerStyle}>TYPE</th>
          <th style={headerStyle}>STATUS</th>
          <th style={headerStyle}>VERSION</th>
          <th style={headerStyle}>ACTIONS</th>
        </tr>
      </thead>
      <tbody>
        {projects.map((p, index) => (
          <tr key={index} className="archive-row" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <td style={cellStyle}>{p.id}</td>
            <td style={{ ...cellStyle, color: '#fff', fontWeight: 'bold' }}>{p.name}</td>
            <td style={cellStyle}><span style={tagStyle}>{p.type}</span></td>
            <td style={cellStyle}>{p.status}</td>
            <td style={{ ...cellStyle, fontFamily: 'monospace' }}>{p.version}</td>
            <td style={cellStyle}>
              <button style={btnStyle}>OPEN</button>
            </td>
          </tr>
        ))}
        {/* Tạo các hàng trống cho đúng chất Excel */}
        {Array.from({ length: 15 }).map((_, i) => (
          <tr key={`empty-${i}`} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)', height: '40px' }}>
            {Array.from({ length: 6 }).map((_, j) => <td key={j}></td>)}
          </tr>
        ))}
      </tbody>
      <style>{`
        .archive-row:hover {
          background-color: rgba(255, 255, 255, 0.03);
          cursor: pointer;
        }
      `}</style>
    </table>
  );
};

// Style cho các thành phần của bảng
const headerStyle = {
  padding: '12px 15px',
  textAlign: 'left',
  color: 'rgba(255,255,255,0.5)',
  fontSize: '11px',
  letterSpacing: '1px',
  borderBottom: '1px solid rgba(255,255,255,0.2)'
};

const cellStyle = {
  padding: '12px 15px',
  color: 'rgba(255,255,255,0.7)'
};

const tagStyle = {
  padding: '2px 8px',
  backgroundColor: 'rgba(255,255,255,0.1)',
  borderRadius: '4px',
  fontSize: '10px'
};

const btnStyle = {
  background: 'transparent',
  border: '1px solid rgba(255,255,255,0.3)',
  color: '#fff',
  padding: '4px 12px',
  borderRadius: '4px',
  fontSize: '11px',
  cursor: 'pointer'
};

export default ProjectArchive;