import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 

const ProjectArchive = () => {
  const [activeTab, setActiveTab] = useState('Recent');
  const [projects, setProjects] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [folderName, setFolderName] = useState('');
  
  const navigate = useNavigate(); 

  const connectStorage = async () => {
    try {
      const dirHandle = await window.showDirectoryPicker();
      const loadedProjects = [];

      for await (const entry of dirHandle.values()) {
        let dateModified = '---';
        if (entry.kind === 'file') {
          try {
            const file = await entry.getFile();
            const date = new Date(file.lastModified);
            dateModified = date.toLocaleDateString('vi-VN', {
              year: 'numeric', month: '2-digit', day: '2-digit',
              hour: '2-digit', minute: '2-digit'
            });
          } catch (e) {
            console.error("Lỗi đọc file:", e);
          }
        }

        loadedProjects.push({
          name: entry.name,
          type: entry.kind === 'directory' ? 'Folder' : 'File',
          dateModified: dateModified,
          handle: entry 
        });
      }

      loadedProjects.sort((a, b) => {
        if (a.type === 'Folder' && b.type !== 'Folder') return -1;
        if (a.type !== 'Folder' && b.type === 'Folder') return 1;
        return a.name.localeCompare(b.name);
      });

      setProjects(loadedProjects);
      setFolderName(dirHandle.name);
      setIsConnected(true);

    } catch (error) {
      console.log("Hủy chọn thư mục Addon:", error);
    }
  };

  const handleNewProject = () => {
    navigate('/'); 
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      
      {/* TABS NAVIGATION */}
      <div style={{ 
        display: 'flex', gap: '30px', padding: '0 20px', 
        backgroundColor: 'rgba(0,0,0,0.6)',
        borderBottom: '1px solid rgba(255,255,255,0.1)' 
      }}>
        {['Recent', 'Pinned', 'Addon'].map(tab => (
          <div 
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '15px 0', cursor: 'pointer',
              color: activeTab === tab ? '#fff' : 'rgba(255,255,255,0.4)',
              borderBottom: activeTab === tab ? '2px solid #8ab4f8' : '2px solid transparent',
              fontSize: '12px', fontWeight: activeTab === tab ? 'bold' : 'normal',
              letterSpacing: '2px', transition: 'all 0.2s ease-in-out'
            }}
          >
            {tab.toUpperCase()}
          </div>
        ))}
      </div>

      {/* THANH ĐIỀU KHIỂN ĐỘNG (THAY ĐỔI THEO TAB) */}
      <div style={{ 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
        padding: '10px 20px', backgroundColor: 'rgba(0,0,0,0.4)',
        borderBottom: '1px solid rgba(255,255,255,0.1)', minHeight: '40px'
      }}>
        
        {/* Tab Addon */}
        {activeTab === 'Addon' && (
          <>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', fontFamily: 'monospace' }}>
              {isConnected ? `ADDON FOLDER: /${folderName} (${projects.length} items)` : ''}
            </div>
            <button onClick={connectStorage} style={btnActionStyle(isConnected)}>
              {isConnected ? 'CHANGE ADDON FOLDER' : 'UPLOAD ADDON FOLDER'}
            </button>
          </>
        )}

        {/* Tab Recent & Pinned: Đã gỡ bỏ chữ RECENT PROJECTS và PINNED ITEMS */}
        {(activeTab === 'Recent' || activeTab === 'Pinned') && (
          <>
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
              <button onClick={handleNewProject} style={btnPrimaryStyle}>
                NEW FACTORY
              </button>
              <button style={btnSecondaryStyle}>
                OPEN
              </button>
            </div>
            
            {/* Chỉ Tab Recent mới có thêm nút Upload ở bên phải */}
            {activeTab === 'Recent' && (
              <button style={btnActionStyle(false)}>
                UPLOAD SAVE FILE
              </button>
            )}
          </>
        )}

      </div>

      {/* BẢNG DỮ LIỆU */}
      <table style={{
        width: '100%', borderCollapse: 'collapse',
        backgroundColor: 'rgba(26, 26, 26, 0.7)', 
        backdropFilter: 'blur(10px)', fontSize: '14px', tableLayout: 'fixed'
      }}>
        <thead>
          <tr style={{ backgroundColor: '#1a1a1a' }}>
            <th style={{...headerStyle, width: '70%'}}>NAME</th>
            <th style={{...headerStyle, width: '30%', textAlign: 'right'}}>DATE MODIFIED</th>
          </tr>
        </thead>
        <tbody>
          
          {activeTab === 'Addon' ? (
            projects.length > 0 ? (
              projects.map((p, index) => (
                <tr key={index} className="archive-row" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ 
                    ...cellStyle, color: p.type === 'Folder' ? '#8ab4f8' : '#e8eaed', 
                    fontWeight: p.type === 'Folder' ? 'bold' : 'normal', 
                    display: 'flex', alignItems: 'center', gap: '12px' 
                  }}>
                    <span style={{ fontSize: '16px', opacity: 0.9 }}>{p.type === 'Folder' ? '📁' : '📄'}</span>
                    {p.name}
                  </td>
                  <td style={{ ...cellStyle, fontFamily: 'monospace', textAlign: 'right', color: 'rgba(255,255,255,0.4)' }}>
                    {p.dateModified}
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="2" style={emptyRowStyle}>Chưa tải lên Addon nào.</td></tr>
            )
          ) : activeTab === 'Recent' ? (
              <tr><td colSpan="2" style={emptyRowStyle}>Chưa có dự án nào được mở hoặc lưu gần đây.</td></tr>
          ) : (
              <tr><td colSpan="2" style={emptyRowStyle}>Bạn chưa ghim (Pin) mục nào.</td></tr>
          )}

          {/* Lót thêm dòng trống để giữ form Excel */}
          {Array.from({ length: Math.max(0, 15 - (activeTab === 'Addon' ? projects.length : 0)) }).map((_, i) => (
            <tr key={`empty-${i}`} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)', height: '40px' }}><td colSpan="2"></td></tr>
          ))}

        </tbody>
        <style>{`.archive-row:hover { background-color: rgba(255, 255, 255, 0.05); cursor: pointer; }`}</style>
      </table>
    </div>
  );
};

// CSS Styles siêu sạch
const headerStyle = { padding: '12px 20px', textAlign: 'left', color: 'rgba(255,255,255,0.5)', fontSize: '11px', letterSpacing: '1px', borderBottom: '1px solid rgba(255,255,255,0.2)' };
const cellStyle = { padding: '12px 20px' };
const emptyRowStyle = { textAlign: 'center', padding: '60px', color: 'rgba(255,255,255,0.3)' };

// Nút Xanh Action (Dùng chung cho Upload Addon và Upload Save File)
const btnActionStyle = (isConnected) => ({
  backgroundColor: isConnected ? 'transparent' : 'rgba(0, 150, 255, 0.2)',
  border: isConnected ? '1px solid rgba(255,255,255,0.3)' : '1px solid rgba(0, 150, 255, 0.5)',
  color: isConnected ? '#fff' : '#4dabf7',
  padding: '6px 15px', borderRadius: '4px', cursor: 'pointer',
  fontSize: '11px', fontWeight: 'bold', letterSpacing: '1px', transition: 'all 0.2s'
});

// Nút Chính (NEW FACTORY)
const btnPrimaryStyle = {
  backgroundColor: 'rgba(138, 180, 248, 0.15)', border: '1px solid #8ab4f8', color: '#8ab4f8',
  padding: '6px 15px', borderRadius: '4px', cursor: 'pointer',
  fontSize: '11px', fontWeight: 'bold', letterSpacing: '1px', transition: 'all 0.2s'
};

// Nút Phụ (OPEN)
const btnSecondaryStyle = {
  backgroundColor: 'transparent', border: '1px solid rgba(255,255,255,0.3)', color: '#fff',
  padding: '6px 15px', borderRadius: '4px', cursor: 'pointer',
  fontSize: '11px', fontWeight: 'bold', letterSpacing: '1px', transition: 'all 0.2s'
};

export default ProjectArchive;